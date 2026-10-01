import React, { useState, useEffect } from "react"
import "../teenPatti/styles.scss"
import { FaArrowRight, FaLock } from "react-icons/fa"
import BackBtn from "../../BackBtn/BackBtn"
import {
  useBetPlaceMutation,
  useCasinoResultQuery,
} from "../../../../store/service/casino/casinoServices"
import { Link, useParams } from "react-router-dom"
import { LetterAndColorById } from "../resultCommon"
import ResultModal from "./ResultModalDt"
import BetModal from "../../betPlaceModal2/BetModal"
import { useOdds } from "../../Casino_Data/UseOdds"
import { tableIdtoUrl, videoIdById } from "../../Casino_Data/Constant"
import snackbarUtil from "../../../utils/Snackbar"
import "./styles.scss"
import BetHistoryTable from "../../betHistoryTable/BetHistoryTable"
import { getCardImage } from "../../../utils/cardImage"
import CasinoVideo from "../CasinoVideo"
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

const DragonTiger = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [first, setFirst] = useState("")
  const [openMod, setOpenMod] = useState(false)
  const [betModalVisible, setBetModalVisible] = useState(false)
  const [countdown, setCountdown] = useState("00:00")

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
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)

  const slug = tableIdtoUrl[id]
  const { odds: data } = useOdds(slug)

  const [trigger, { data: betPlaceResponse, isLoading }] = useBetPlaceMutation()

  const handleRateClick = (item: any) => {
    if (!item?.gstatus) return
    setSelectedPlayer({ ...item, isBack: true })
    setBetModalVisible(true)
  }

  const handleModalSubmit = (data: any) => {
    trigger(data)
  }

  const { data: betsResponse } = useGetCasinoMyBetQuery(
    {
      isGameCompleted: false,
      sportId: 5015,
      tableId: id,
    },
    { pollingInterval: 1000 },
  )

  // Removed useCasinoResultQuery

  // Liability API removed - set as null
  const liblity = { data: [] }

  const handleClick = val => {
    setFirst(val)
    if (val) setOpenMod(true)
  }

  // Bet place response handler
  useEffect(() => {
    if (betPlaceResponse) {
      if (betPlaceResponse?.success ?? betPlaceResponse?.status) {
        snackbarUtil.success(betPlaceResponse?.message)
        setBetModalVisible(false)
      } else {
        snackbarUtil.error(betPlaceResponse?.message)
      }
    }
  }, [betPlaceResponse])

  // Autotime-based countdown
  useEffect(() => {
    if (!data?.t1?.[0]?.autotime) {
      setCountdown("00:00")
      return
    }

    const autoTimeSeconds = parseInt(data.t1[0].autotime)
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
  }, [data?.t1?.[0]?.autotime])

  return (
    <>
      <BackBtn to="/casino-list" name="BACK TO CASINO MENU" />

      <div className="teenpatti-container dragon-tiger-container">
        <div className="left-col">
          {/* <div className="header">
            <div className="left">
              Dragon Tiger
              <span>
                <FaArrowRight />
                RULES
              </span>
            </div>
            <div className="secondary-heading center">
              Round ID: {data?.t1[0]?.mid}
            </div>
            <div className="right secondary-heading">
              Time: {formatTimestamp(data?.Time)}
            </div>
          </div> */}

          <div className="round-id-header">
            <div className="left">Round: {data?.t1[0]?.mid}</div>
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
            <CasinoVideo qnId={videoIdById[id] || "3035"} title="DragonTiger Stream" />

            <div className="card-area-box">
              <img src={getCardImage(data?.t1?.[0]?.C1)} alt="Dragon card" />
              <img src={getCardImage(data?.t1?.[0]?.C2)} alt="Tiger card" />
              {/* <div className="top">
                <div className="player">Dragon</div>
              </div>
              <div className="bottom">
                <div className="player">Tiger</div>
              </div> */}
            </div>
          </div>

          <div className="last-result">
            <div className="left">Last Result</div>
            <div
              className="right"
              onClick={() => navigate("/all-casino-result/dt20")}
              style={{ cursor: "pointer" }}
            >
              View All
            </div>
          </div>

          <div className="result-circles">
            {resultReponse?.map((r: any, i: number) => (
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
          <div className="dragon-tiger">
            <div className="top-bar">
              <span>MIN: 100</span>
              <span>MAX: 25000</span>
            </div>

            {/* Main betting options */}
            <div className="cards">
              <div className="card">
                <div
                  className="count"
                  style={{
                    color:
                      liblity?.data?.find(
                        item =>
                          item?.sid ===
                          data?.t2?.find(t => t.nat === "Dragon")?.sid,
                      )?.liability > 0
                        ? "green"
                        : "red",
                  }}
                >
                  {liblity?.data?.find(
                    item =>
                      item?.sid ===
                      data?.t2?.find(t => t.nat === "Dragon")?.sid,
                  )?.liability || 0}
                </div>
                <button
                  className={`btn ${!data?.t2?.find(t => t.nat === "Dragon")?.gstatus ? "suspended" : ""}`}
                  onClick={() =>
                    handleRateClick(data?.t2?.find(t => t.nat === "Dragon"))
                  }
                  style={{ position: "relative" }}
                >
                  DRAGON
                  {!data?.t2?.find(t => t.nat === "Dragon")?.gstatus && (
                    <div
                      className="overlay"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "inherit",
                      }}
                    >
                      <FaLock color="white" size={16} />
                    </div>
                  )}
                </button>
                <div className="odds">
                  {data?.t2?.find(t => t.nat === "Dragon")?.rate || "0.00"}
                </div>
              </div>

              <div className="card">
                <div
                  className="count"
                  style={{
                    color:
                      liblity?.data?.find(
                        item =>
                          item?.sid ===
                          data?.t2?.find(t => t.nat === "Tie")?.sid,
                      )?.liability > 0
                        ? "green"
                        : "red",
                  }}
                >
                  {liblity?.data?.find(
                    item =>
                      item?.sid === data?.t2?.find(t => t.nat === "Tie")?.sid,
                  )?.liability || 0}
                </div>
                <button
                  className={`btn ${!data?.t2?.find(t => t.nat === "Tie")?.gstatus ? "suspended" : ""}`}
                  onClick={() =>
                    handleRateClick(data?.t2?.find(t => t.nat === "Tie"))
                  }
                  style={{ position: "relative" }}
                >
                  TIE
                  {!data?.t2?.find(t => t.nat === "Tie")?.gstatus && (
                    <div
                      className="overlay"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "inherit",
                      }}
                    >
                      <FaLock color="white" size={16} />
                    </div>
                  )}
                </button>
                <div className="odds">
                  {data?.t2?.find(t => t.nat === "Tie")?.rate || "0.00"}
                </div>
              </div>

              <div className="card">
                <div
                  className="count"
                  style={{
                    color:
                      liblity?.data?.find(
                        item =>
                          item?.sid ===
                          data?.t2?.find(t => t.nat === "Tiger")?.sid,
                      )?.liability > 0
                        ? "green"
                        : "red",
                  }}
                >
                  {liblity?.data?.find(
                    item =>
                      item?.sid === data?.t2?.find(t => t.nat === "Tiger")?.sid,
                  )?.liability || 0}
                </div>
                <button
                  className={`btn ${!data?.t2?.find(t => t.nat === "Tiger")?.gstatus ? "suspended" : ""}`}
                  onClick={() =>
                    handleRateClick(data?.t2?.find(t => t.nat === "Tiger"))
                  }
                  style={{ position: "relative" }}
                >
                  TIGER
                  {!data?.t2?.find(t => t.nat === "Tiger")?.gstatus && (
                    <div
                      className="overlay"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "inherit",
                      }}
                    >
                      <FaLock color="white" size={16} />
                    </div>
                  )}
                </button>
                <div className="odds">
                  {data?.t2?.find(t => t.nat === "Tiger")?.rate || "0.00"}
                </div>
              </div>
            </div>

            {/* Additional Dragon betting options */}
            {/* <div className="additional-bets" style={{ marginTop: '20px' }}>
        <h4>Dragon Side Bets</h4>
        <div className="side-bets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {['Dragon Even', 'Dragon Odd', 'Dragon Red', 'Dragon Black'].map((betType) => {
            const betOption = data?.t2?.find(t => t.nat === betType);
            const liability = liblity?.data?.find(item => item?.sid === betOption?.sid)?.liability || 0;
            return (
              <div key={betType} className="side-bet-card" style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>
                <div className="count" style={{ color: liability > 0 ? "green" : "red" }}>
                  {liability}
                </div>
                <button 
                  className={`btn ${!betOption?.gstatus ? 'suspended' : ''}`}
                  onClick={() => handleRateClick(betOption)}
                  style={{ position: 'relative', width: '100%', fontSize: '12px' }}
                >
                  {betType.replace('Dragon ', '')}
                  {!betOption?.gstatus && (
                    <div className="overlay" style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 'inherit'
                    }}>
                      <FaLock color="white" size={12} />
                    </div>
                  )}
                </button>
                <div className="odds" style={{ fontSize: '12px' }}>{betOption?.rate || "0.00"}</div>
              </div>
            );
          })}
        </div>
      </div> */}

            {/* Additional Tiger betting options */}
            {/* <div className="additional-bets" style={{ marginTop: '20px' }}>
        <h4>Tiger Side Bets</h4>
        <div className="side-bets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {['Tiger Even', 'Tiger Odd', 'Tiger Red', 'Tiger Black'].map((betType) => {
            const betOption = data?.t2?.find(t => t.nat === betType);
            const liability = liblity?.data?.find(item => item?.sid === betOption?.sid)?.liability || 0;
            return (
              <div key={betType} className="side-bet-card" style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>
                <div className="count" style={{ color: liability > 0 ? "green" : "red" }}>
                  {liability}
                </div>
                <button 
                  className={`btn ${!betOption?.gstatus ? 'suspended' : ''}`}
                  onClick={() => handleRateClick(betOption)}
                  style={{ position: 'relative', width: '100%', fontSize: '12px' }}
                >
                  {betType.replace('Tiger ', '')}
                  {!betOption?.gstatus && (
                    <div className="overlay" style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 'inherit'
                    }}>
                      <FaLock color="white" size={12} />
                    </div>
                  )}
                </button>
                <div className="odds" style={{ fontSize: '12px' }}>{betOption?.rate || "0.00"}</div>
              </div>
            );
          })}
        </div>
      </div> */}

            {/* Pair betting option */}
            {/* <div className="additional-bets" style={{ marginTop: '20px' }}>
        <h4>Special Bets</h4>
        <div className="special-bet" style={{ display: 'flex', justifyContent: 'center' }}>
          {(() => {
            const betOption = data?.t2?.find(t => t.nat === "Pair");
            const liability = liblity?.data?.find(item => item?.sid === betOption?.sid)?.liability || 0;
            return (
              <div className="side-bet-card" style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center', width: '200px' }}>
                <div className="count" style={{ color: liability > 0 ? "green" : "red" }}>
                  {liability}
                </div>
                <button 
                  className={`btn ${!betOption?.gstatus ? 'suspended' : ''}`}
                  onClick={() => handleRateClick(betOption)}
                  style={{ position: 'relative', width: '100%' }}
                >
                  PAIR
                  {!betOption?.gstatus && (
                    <div className="overlay" style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 'inherit'
                    }}>
                      <FaLock color="white" size={16} />
                    </div>
                  )}
                </button>
                <div className="odds">{betOption?.rate || "0.00"}</div>
              </div>
            );
          })()}
        </div>
      </div> */}
          </div>

          {/* Bet History Table */}
          <BetHistoryTable
            data={transformBetHistory(betsResponse?.data)}
            roundId={id}
          />
        </div>
      </div>

      {betModalVisible && selectedPlayer && (
        <BetModal
          onClose={() => setBetModalVisible(false)}
          selectedPlayer={selectedPlayer}
          matchId={id}
        />
      )}
      <ResultModal
        setOpen={setOpenMod}
        open={openMod}
        tableId={id}
        mid={first}
      />
    </>
  )
}

export default DragonTiger
