import React, { useState, useEffect } from "react"
import "../teenPatti/styles.scss"
import { FaArrowRight, FaLock } from "react-icons/fa"
import BackBtn from "../../BackBtn/BackBtn"
import {
  useBetPlaceMutation,
} from "../../../../store/service/casino/casinoServices"
import { useGetCasinoMyBetsQuery, useGetCasinoCompletedBetsQuery } from "../../../../store/service/userServices/userServices"
import { Link, useParams } from "react-router-dom"
import { LetterAndColorById } from "../resultCommon"
import ResultModal from "../ResultModal"
import BetModal from "../../betPlaceModal2/BetModal"
import { useOdds } from "../../Casino_Data/UseOdds"
import { tableIdtoUrl, videoIdById } from "../../Casino_Data/Constant"
import snackbarUtil from "../../../utils/Snackbar"
import "./styles.scss"
import TeamTable from "./TeamTable"
import BetHistoryTable from "../../betHistoryTable/BetHistoryTable"
import RoundDetailModal from "./RoundDetailModal"
import cardBack from "../../../../public/casino/cardBack.png"
import { getCardImage } from "../../../utils/cardImage"

interface SelectedPlayerType {
  gstatus: boolean
  max: number
  mid: string
  min: number
  nat: string
  nation: string
  pnl: number
  rate: string
  sid: string
  isBack: boolean
}
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

const TeenPattiGame = () => {
  const { id } = useParams()
  const today = new Date().toISOString().split("T")[0]
  const [first, setFirst] = useState("")
  const [openMod, setOpenMod] = useState(false)
  const [betModalVisible, setBetModalVisible] = useState(false)
  const [betsTab, setBetsTab] = useState<"open" | "completed">("open")
  const [roundDetailModalOpen, setRoundDetailModalOpen] = useState(false)
  const [selectedRoundId, setSelectedRoundId] = useState("")
  const [selectedT3Item, setSelectedT3Item] = useState<any>(null)
  const [selectedPlayer, setSelectedPlayer] =
    useState<SelectedPlayerType | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [wsData, setWsData] = useState<any>(null)
  const [countdown, setCountdown] = useState("00:00")

  const slug = tableIdtoUrl[id]

  const [trigger, { data: betPlaceResponse, isLoading }] = useBetPlaceMutation()

  // Always fetch open bets (no button needed)
  const { data: myBetsData } = useGetCasinoMyBetsQuery(
    { game: "teen20" },
    { skip: !id, pollingInterval: 3000 }
  )

  const { data: completedBetsRes } = useGetCasinoCompletedBetsQuery(
    { game: "teen20", fromDate: today, toDate: today, page: 1, limit: 20 },
    { skip: betsTab !== "completed", pollingInterval: 5000 }
  )
  const openBets: any[]      = myBetsData?.bets ?? myBetsData?.data ?? []
  const completedBets: any[] = completedBetsRes?.data ?? completedBetsRes?.bets ?? []

  // WS only — no API fallback
  const data = wsData

  // WebSocket connection
  useEffect(() => {
    console.log("🚀 Connecting to WebSocket...");
    
    const ws = new WebSocket(`${import.meta.env.VITE_WS_BASE_URL}/ws/casino`);
    
    ws.onopen = () => {
      console.log("✅ WebSocket Connected!");
      setIsConnected(true);
      
      const subscribeMessage = { 
        "type": "subscribe", 
        "game": "teen20"
      };
      
      ws.send(JSON.stringify(subscribeMessage));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Update state with WebSocket data
        if (data.type === 'gameData' && data.game === 'teen20') {
          setWsData(data);
        }
      } catch (error) {
        console.error("❌ Parse error:", error);
      }
    };
    
    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      setIsConnected(false);
    };
    
    ws.onclose = (event) => {
      setIsConnected(false);
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [])

  const handleRateClick = (item: SelectedPlayerType) => {
    // Check if betting option is suspended
    if (!item?.gstatus) {
      console.log("Betting option is suspended, modal will not open")
      snackbarUtil.error("This betting option is currently suspended")
      return
    }

    setSelectedPlayer({ ...item, isBack: true }) // Default to back bet; can be modified in BetModal if needed
    setBetModalVisible(true)
  }

  // Handle bet place response
  useEffect(() => {
    if (betPlaceResponse) {
      if (betPlaceResponse?.success ?? betPlaceResponse?.status) {
        snackbarUtil.success(
          betPlaceResponse?.message,
        )
        setBetModalVisible(false)
      } 
      else {
        snackbarUtil.error(betPlaceResponse?.message)
      }
    }
  }, [betPlaceResponse])

  // Countdown — same as DT20
  useEffect(() => {
    const autotime = wsData?.t1?.autotime ?? wsData?.autotime
    if (!autotime) { setCountdown("00:00"); return }
    const secs = parseInt(autotime)
    if (secs <= 0) { setCountdown("00:00"); return }
    const fmt = (s: number) =>
      `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`
    let remaining = secs
    setCountdown(fmt(remaining))
    const timer = setInterval(() => {
      remaining -= 1
      if (remaining <= 0) { clearInterval(timer); setCountdown("00:00") }
      else setCountdown(fmt(remaining))
    }, 1000)
    return () => clearInterval(timer)
  }, [wsData?.t1?.autotime, wsData?.autotime])

  const handleClick = val => {
    setFirst(val)
    if (val) setOpenMod(true)
  }

  return (
    <>
      <BackBtn to="/casino-list" name="BACK TO CASINO MENU" />

      <div className="teenpatti-container">
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
            <div className="left">Round: {wsData?.t1?.mid || 'Loading...'}</div>
            <div className="right">
              <button>Live Tv</button>
            </div>
          </div>

          <div className="game-section">
            <iframe
              src={`https://alpha-g.qnsports.live/route/rih2.php?id=${videoIdById[id ?? ""] ?? "3030"}`}
              title="Teen Patti Stream"
              allowFullScreen
            ></iframe>

            {/* Countdown Timer */}
            <div className={`tp-timer ${countdown === "00:00" ? "tp-timer--closed" : "tp-timer--open"}`}>
              {countdown === "00:00" ? "BETTING CLOSED" : countdown}
            </div>

            {/* Minimal layout; expand with card visuals if needed */}
            <div className="card-area-box-teenpatti">
              {/* Minimal layout; expand with card visuals if needed */}
              <div className="card-area-left-col">
                <div className="top-card">
                  <img
                    src={getCardImage(wsData?.t1?.C1)}
                    alt="Player A card 1"
                  />
                  <img
                    src={getCardImage(wsData?.t1?.C2)}
                    alt="Player A card 2"
                  />
                  <img
                    src={getCardImage(wsData?.t1?.C3)}
                    alt="Player A card 3"
                  />
                </div>
                <div className="bottom-label">Player A</div>
              </div>

              <div className="card-area-right-col">
                <div className="top-card">
                  <img
                    src={getCardImage(wsData?.t1?.C4)}
                    alt="Player B card 1"
                  />
                  <img
                    src={getCardImage(wsData?.t1?.C5)}
                    alt="Player B card 2"
                  />
                  <img
                    src={getCardImage(wsData?.t1?.C6)}
                    alt="Player B card 3"
                  />
                </div>
                <div className="bottom-label">Player B</div>
              </div>
              {/* <div className="top">
                <div className="player">Dragon</div>
              </div>
              <div className="bottom">
                <div className="player">Tiger</div>
              </div> */}
            </div>
          </div>

          {/* Betting Section */}
         <div className="betting-section">
          <TeamTable data={wsData} handleRateClick={handleRateClick} />
         </div>
         <div className="last-10-result">
            <div className="result-header">Last 10 Results</div>
            <div className="result-list">
              {(() => {
                // WS t3 first, then API t3 (exact path: data.data.data.data.t3)
                const list: any[] = wsData?.t3 || []
                return list.slice(0, 10).map((item: any, i: number) => {
                  const isA = item.winner === "Player A" || item.result === "1" || item.result === "A"
                  return (
                    <div
                      key={item.mid || i}
                      className={`result-circle ${isA ? "player-a" : "player-b"}`}
                      onClick={() => {
                        if (item.mid) {
                          setSelectedRoundId(item.mid)
                          setSelectedT3Item(item)
                          setRoundDetailModalOpen(true)
                        }
                      }}
                      title={item.winner ?? (isA ? "Player A" : "Player B")}
                    >
                      {isA ? "A" : "B"}
                    </div>
                  )
                })
              })()}
            </div>
         </div>
          {/* Bets Section — Open / Completed tabs */}
          <div className="tp-open-bets">
            {/* Tab buttons */}
            <div className="dice-bets-tabs">
              <button
                className={`dbt ${betsTab === "open" ? "dbt--active" : ""}`}
                onClick={() => setBetsTab("open")}
              >Open Bets</button>
              <button
                className={`dbt ${betsTab === "completed" ? "dbt--active" : ""}`}
                onClick={() => setBetsTab("completed")}
              >Completed</button>
            </div>

            <div className="tp-bets-wrapper">
              <table className="tp-bets-table">
                <thead>
                  <tr>
                    <th>Round ID</th>
                    <th>Runner</th>
                    <th>Odds</th>
                    <th>Stake</th>
                    <th>P/L</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const bets = betsTab === "open" ? openBets : completedBets
                    if (!bets.length) return (
                      <tr>
                        <td colSpan={6} className="tp-bets-empty">
                          {betsTab === "open" ? "No open bets" : "No completed bets"}
                        </td>
                      </tr>
                    )
                    return bets.map((bet: any, idx: number) => {
                      const status = bet.status ?? "pending"
                      const pnl    = bet.pnl ?? 0
                      const pl     = betsTab === "completed" ? (bet.profitLoss ?? 0) : (bet.potentialWin ?? pnl)
                      return (
                        <tr key={idx}>
                          <td className="td-round-id">{bet.roundId ?? "—"}</td>
                          <td className="td-runner">{bet.betOn ?? bet.selectionName ?? bet.nat ?? "—"}</td>
                          <td>{bet.odds ?? "—"}</td>
                          <td>{bet.stake ?? "—"}</td>
                          <td className={pl > 0 ? "td-win" : pl < 0 ? "td-loss" : ""}>
                            {pl !== 0 ? pl : "—"}
                          </td>
                          <td>
                            <span className={`tp-bet-badge ${
                              status === "won"  || status === "win"  ? "tp-bet-win"  :
                              status === "lost" || status === "loss" ? "tp-bet-loss" : "tp-bet-pending"
                            }`}>{status}</span>
                          </td>
                        </tr>
                      )
                    })
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {betModalVisible && (
        <BetModal
          onClose={() => setBetModalVisible(false)}
          selectedPlayer={selectedPlayer}
          matchId={id}
        />
      )}
      
      
      <RoundDetailModal
        isOpen={roundDetailModalOpen}
        onClose={() => { setRoundDetailModalOpen(false); setSelectedT3Item(null) }}
        roundId={selectedRoundId}
        game="teen20"
        t3Item={selectedT3Item}
      />
      
      <ResultModal
        setOpen={setOpenMod}
        open={openMod}
        tableId={id}
        mid={first}
      />
    </>
  )
}

export default TeenPattiGame
