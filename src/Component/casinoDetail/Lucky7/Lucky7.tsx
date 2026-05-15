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
const Lucky7 = () => {
  const { id } = useParams()
  const [first, setFirst] = useState("")
  const [openMod, setOpenMod] = useState(false)

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
  const [countdown, setCountdown] = useState("00:00")

  const { odds } = useOdds(tableIdtoUrl[id])

  const { data: betsResponse } = useGetCasinoMyBetQuery(
    {
      isGameCompleted: false,
      sportId: 5015,
      tableId: id,
    },
    { pollingInterval: 1000 },
  )

  const c1 = odds?.t1?.[0]?.C1

  // Removed useCasinoResultQuery

  const handleClick = val => {
    setFirst(val)
    if (val) {
      setOpenMod(true)
    }
  }

  const t2 = odds?.t2 || []

  const [modalVisible, setModalVisible] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)

  const [trigger, { data: betPlaceResponse, isLoading }] = useBetPlaceMutation()
  const handleModalClose = () => {
    setModalVisible(false)
  }

  const handleModalSubmit = (data: any) => {
    trigger(data)
  }

  const handleRateClick = (item: any) => {
    setSelectedPlayer({ ...item, isBack: true })
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

  // Autotime-based countdown
  useEffect(() => {
    if (!odds?.t1?.[0]?.autotime) {
      setCountdown("00:00")
      return
    }

    const autoTimeSeconds = parseInt(odds.t1[0].autotime)
    if (autoTimeSeconds <= 0) {
      setCountdown("00:00")
      return
    }

    let remainingTime = autoTimeSeconds
    setCountdown(
      `${Math.floor(remainingTime / 60)
        .toString()
        .padStart(2, "0")}:${(remainingTime % 60).toString().padStart(2, "0")}`,
    )

    const timer = setInterval(() => {
      remainingTime -= 1
      if (remainingTime <= 0) {
        setCountdown("00:00")
        clearInterval(timer)
      } else {
        setCountdown(
          `${Math.floor(remainingTime / 60)
            .toString()
            .padStart(
              2,
              "0",
            )}:${(remainingTime % 60).toString().padStart(2, "0")}`,
        )
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [odds?.t1?.[0]?.autotime])

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
            <div
              className="timer"
              style={{
                // background: countdown === "00:00" ? "#dc3545" : "#28a745",
                transition: "background-color 0.3s ease",
                color: "white",
                padding: "8px 16px",
                borderRadius: "20px",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              {countdown === "00:00" ? "BETTING CLOSED" : `Time: ${countdown}`}
            </div>
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
            {resultReponse?.map((r: any, i) => (
              <div
                key={i}
                className="circle"
                style={{
                  background: LetterAndColorById?.[id]?.[r?.result]?.color,
                }}
                onClick={() => handleClick(r?.mid)}
              >
                {LetterAndColorById?.[id]?.[r?.result]?.label}
              </div>
            ))}
          </div>
          <CardGameBoard
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            t2Data={t2}
            liabilityData={liblity?.data}
            onRateClick={handleRateClick}
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

export default Lucky7
