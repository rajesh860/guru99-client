import { useEffect, useState } from "react"
import { FaArrowRight } from "react-icons/fa"
import BackBtn from "../../BackBtn/BackBtn"
import {
  useBetPlaceMutation,
  useCasinoResultQuery,
} from "../../../../store/service/casino/casinoServices"
import { Link, useParams } from "react-router-dom"
import { LetterAndColorById } from "../resultCommon"
import ResultModal from "./ResultModalDt"
import "../teenPatti/styles.scss"
import { useOdds } from "../../Casino_Data/UseOdds"
import { tableIdtoUrl } from "../../Casino_Data/Constant"
import snackbarUtil from "../../../utils/Snackbar"
import BetModal from "../../betPlaceModal2/BetModal"
import CardGameBoard from "./CardgameBoard"
import BetHistoryTable from "../../betHistoryTable/BetHistoryTable"
// Utility function to format time
const formatTimestamp = (timestamp: number) => {
  if (!timestamp) return "--:--:--"

  const date = new Date(timestamp)

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
}

const getCardImage = (cardCode?: string) => {
  if (!cardCode || cardCode === "1") {
    return "https://versionobj.ecoassetsservice.com/v14/static/front/img/cards/1.jpg"
  }
  const mapped = cardCode.includes("HH")
    ? cardCode.replace("HH", "SS")
    : cardCode.includes("SS")
      ? cardCode.replace("SS", "DD")
      : cardCode.includes("DD")
        ? cardCode.replace("DD", "HH")
        : cardCode
  return `https://versionobj.ecoassetsservice.com/v14/static/front/img/cards/${mapped}.jpg`
}
const AAA = () => {
  const { id } = useParams()
  const [first, setFirst] = useState("")
  const [openMod, setOpenMod] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  // Result mapping: 1 → A, 2 → B, 3 → C
  const getResultLabel = (result: string) => {
    switch (result) {
      case "1":
        return "A"
      case "2":
        return "B"
      case "3":
        return "C"
      default:
        return result
    }
  }

  // Transform bet data for BetHistoryTable
  const transformBetHistory = (betsData: any[]) => {
    return (
      betsData?.map((bet: any) => ({
        team: bet.selectionName || "N/A",
        mode: bet.back ? "BACK" : "LAY",
        rate: bet.odds ? parseFloat(bet.odds).toFixed(2) : "0.00",
        amount: bet.stake ? parseFloat(bet.stake).toFixed(2) : "0.00",
        result: bet.pnl > 0 ? "Win" : bet.pnl < 0 ? "Loss" : "Not Declare",
        dateTime: bet.timeStamp
          ? new Date(bet.timeStamp).toLocaleString()
          : "N/A",
      })) || []
    )
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case "1":
        return "#ff6b6b" // Red for A
      case "2":
        return "#4ecdc4" // Teal for B
      case "3":
        return "#45b7d1" // Blue for C
      default:
        return "#gray"
    }
  }

  const handleClick = (mid: string) => {
    setFirst(mid)
    setOpenMod(true)
  }

  const { odds } = useOdds(tableIdtoUrl[id])

  const { data: betsResponse } = useGetCasinoMyBetQuery(
    {
      isGameCompleted: false,
      sportId: 5015,
      tableId: id,
    },
    { pollingInterval: 1000 },
  )

  // Removed useCasinoResultQuery

  const c1 = odds?.t1?.[0]?.C1

  // Liability API removed - set as null
  const liblity = { data: [] }

  const t2 = odds?.t2 || []

  const [trigger, { data: betPlaceResponse, isLoading }] = useBetPlaceMutation()
  const handleModalClose = () => {
    setModalVisible(false)
  }

  const handleModalSubmit = (data: any) => {
    trigger(data)
  }

  const handleRateClick = (item: any, backOrLay: boolean = true) => {
    console.log("Rate clicked:", item)
    setSelectedPlayer(item)
    setModalVisible(true)
  }

  useEffect(() => {
    if (betPlaceResponse) {
      if (betPlaceResponse?.status) {
        snackbarUtil.success(betPlaceResponse?.message)
        setModalVisible(false)
      } else {
        snackbarUtil.error(betPlaceResponse?.message)
      }
    }
  }, [betPlaceResponse])
  return (
    <>
      <BackBtn to="/casino-list" name="BACK TO CASINO MENU" />

      <div className="teenpatti-container">
        <div className="left-col">
          <div className="round-id-header">
            <div className="left">
              Round: {odds?.t1?.[0]?.mid || "Loading..."}
            </div>
            <div className="right">
              <button>Live Tv</button>
            </div>
          </div>

          <div className="game-section">
            <div className="timer">{odds?.t1[0]?.autotime}</div>
            <iframe
              src="https://casino.loki7exch.com/route/?id=3058"
              title="TeenPatti Stream"
              allowFullScreen
            ></iframe>

            <div className="card-area">
              <div className="top">
                <div className="card-col">
                  <img src={getCardImage(c1)} alt={c1 || "Card"} />
                </div>
              </div>
            </div>
          </div>

          {/* Result Circles Section */}

          {/* <div className="lucky7-odds-section_">
            <div className="lucky7-odds-container_ low-high-cards-container_">
              <div
                className="lucky7-odds-box_ high-low-card"
                onClick={() => handleRateClick(t2?.[0])}
              >
                <div className="odds-price_">
                  {t2?.[0]?.gstatus ? t2[0]?.rate : "0.00"}
                </div>
                <div className="odds-label_ suspended">{t2[0]?.nation}</div>
                <div
                  className="odds-position_  plus"
                  style={{
                    color:
                      liblity?.data?.find(item => item?.sid === t2?.[0]?.sid)
                        ?.liability > 0
                        ? "green"
                        : "red",
                  }}
                >
                  {
                    liblity?.data?.find(item => item?.sid === t2?.[0]?.sid)
                      ?.liability
                  }
                </div>
              </div>
              <div>
                <div
                  className="low-high-card-image_"
                  onClick={() => handleRateClick(t2?.[2])}
                >
                  <img
                    src="https://betguru365.in/img/card7.jpg"
                    alt=""
                    className="card-image_"
                  />
                </div>
                <div
                  className="odds-position_  plus"
                  style={{
                    textAlign: "center",
                    color:
                      liblity?.data?.find(item => item?.sid === t2?.[1]?.sid)
                        ?.liability > 0
                        ? "green"
                        : "red",
                  }}
                >
                  {
                    liblity?.data?.find(item => item?.sid === t2?.[1]?.sid)
                      ?.liability
                  }
                </div>
              </div>

              <div
                className="lucky7-odds-box_ high-low-card"
                onClick={() => handleRateClick(t2?.[1])}
              >
                <div className="odds-price_">
                  {t2?.[2]?.gstatus ? t2[1]?.rate : "0.00"}
                </div>
                <div className="odds-label_ suspended">{t2?.[1]?.nation}</div>
                <div
                  className="odds-position_  plus"
                  style={{
                    color:
                      liblity?.data?.find(item => item?.sid === t2?.[1]?.sid)
                        ?.liability > 0
                        ? "green"
                        : "red",
                  }}
                >
                  {
                    liblity?.data?.find(item => item?.sid === t2?.[1]?.sid)
                      ?.liability
                  }
                </div>
              </div>
            </div>
          </div> */}

          <div className="last-result">
            <div className="left">Last Result</div>
            <div className="right">View All</div>
          </div>

          <div className="result-circles">
            {resultReponse?.map((item: any, i: number) => {
              return (
                <div
                  key={i}
                  className="circle"
                  style={{
                    background: LetterAndColorById?.[id]?.[item?.result]?.color,
                  }}
                  onClick={() => handleClick(item)}
                >
                  {LetterAndColorById?.[id]?.[item?.result]?.label}
                </div>
              )
            })}
          </div>
          {/* Betting Interface */}
          <CardGameBoard
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            t2Data={odds?.t2 || []}
            liabilityData={liblity?.data || []}
            onRateClick={handleRateClick}
            countdown={odds?.t1?.[0]?.autotime || "00"}
          />

          {/* Bet History Table */}
          <BetHistoryTable
            data={transformBetHistory(betsResponse?.data)}
            roundId={id}
          />
        </div>

        <div className="right-col">
          <div className="my-bet h-0">
            <div className="title my-bet-title">MY BET</div>
            <table className="bet-table personal-info-content">
              <thead>
                <tr>
                  <th>Matched Bet</th>
                  <th>Market</th>
                  <th>Odds</th>
                  <th>Stake</th>
                </tr>
              </thead>
              <tbody>
                {betsResponse?.data?.map((item: any) => {
                  return (
                    <tr
                      key={item?.gameName}
                      className={`${item?.back ? "back" : "lay"}`}
                    >
                      <td>
                        {" "}
                        {item?.selectionName}({item?.roundId})
                      </td>
                      <td>{item?.gameName}</td>
                      <td>{item?.odds}</td>
                      <td>{item?.stake}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="see-btn" style={{ paddingBottom: "15px" }}>
              <Link to={"/casino-bets"}>
                <button
                  className="see-all"
                  style={{
                    background: "#212529",
                    borderColor: "#212529",
                    fontWeight: 400,
                  }}
                >
                  See All Complete Bets
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <ResultModal
        setOpen={setOpenMod}
        open={openMod}
        tableId={id}
        mid={first}
      />

      {modalVisible && selectedPlayer && (
        <BetModal
          onClose={handleModalClose}
          selectedPlayer={selectedPlayer}
          matchId={id}
        />
      )}
    </>
  )
}

export default AAA
