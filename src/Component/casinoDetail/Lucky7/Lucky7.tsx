import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { FaLock } from "react-icons/fa"
import BackBtn from "../../BackBtn/BackBtn"
import { useGetCasinoMyBetsQuery, useGetCasinoCompletedBetsQuery } from "../../../../store/service/userServices/userServices"
import { videoIdById } from "../../Casino_Data/Constant"
import PlaceBetModal from "../teenPatti/PlaceBetModal"
import Lucky7RoundDetailModal from "./Lucky7RoundDetailModal"
import { getCardImage } from "../../../utils/cardImage"
import "./Lucky7.scss"


const Lucky7: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [betModalVisible, setBetModalVisible] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [countdown, setCountdown] = useState("00:00")
  const [wsData, setWsData] = useState<any>(null)
  const [cardFlipping, setCardFlipping] = useState(false)
  const [betsTab, setBetsTab] = useState<"open" | "completed">("open")
  const [roundDetailOpen, setRoundDetailOpen] = useState(false)
  const [selectedRoundId, setSelectedRoundId] = useState("")
  const [selectedT3Item, setSelectedT3Item] = useState<any>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket(`${import.meta.env.VITE_WS_BASE_URL}/ws/casino`)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "subscribe", game: "lucky7eu" }))
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === "gameData" && msg.game === "lucky7eu") {
          setWsData(msg)
        }
      } catch {
        // ignore parse errors
      }
    }

    ws.onerror = () => {}
    ws.onclose = () => {}

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close()
    }
  }, [])

  const { data: myBetsResponse } = useGetCasinoMyBetsQuery(
    { game: "lucky7eu" },
    { pollingInterval: 2000 }
  )
  const { data: completedBetsRes } = useGetCasinoCompletedBetsQuery(
    { game: "lucky7eu" },
    { skip: betsTab !== "completed", pollingInterval: 5000 }
  )

  const openBets: any[] = myBetsResponse?.data ?? []
  const completedBets: any[] = completedBetsRes?.data ?? completedBetsRes?.bets ?? []

  useEffect(() => {
    const autotime = wsData?.t1?.autotime ?? wsData?.autotime
    if (!autotime) {
      setCountdown("00:00")
      return
    }

    const autoTimeSeconds = parseInt(autotime)
    if (autoTimeSeconds <= 0) {
      setCountdown("00:00")
      return
    }

    let remaining = autoTimeSeconds
    const fmt = (s: number) =>
      `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`

    setCountdown(fmt(remaining))
    const timer = setInterval(() => {
      remaining -= 1
      if (remaining <= 0) {
        setCountdown("00:00")
        clearInterval(timer)
      } else {
        setCountdown(fmt(remaining))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [wsData?.t1?.autotime, wsData?.autotime])

  const t2: any[] = wsData?.t2 ?? []

  const getOption = (nat: string) => t2.find((o: any) => o.nat === nat)

  const lowOption   = getOption("LOW Card")
  const highOption  = getOption("HIGH Card")
  const card7Option = getOption("Card 7")

const isSuspended = (item: any) => !item || item.gstatus !== "1"

  const handleRateClick = (item: any) => {
    if (isSuspended(item)) return
    setSelectedPlayer({ ...item, isBack: true })
    setBetModalVisible(true)
  }

  const resultHistory: any[] = wsData?.t3 ?? []
  const roundId = wsData?.t1?.mid ?? wsData?.roundId ?? ""
  const videoId = videoIdById[id ?? ""] ?? "3032"
  const c1 = wsData?.t1?.C1

  useEffect(() => {
    if (!c1) return
    setCardFlipping(true)
    const t = setTimeout(() => setCardFlipping(false), 600)
    return () => clearTimeout(t)
  }, [c1])

  return (
    <>
      <BackBtn to="/casino-list" name="BACK TO CASINO MENU" />

      <div className="l7n-container">
        <div className="l7n-header">
          <div className="l7n-header-left">
            Lucky 7 - B
            <span className="l7n-rules-link"> | Rules</span>
          </div>
          <div className="l7n-header-right">
            Round Id: {roundId || "---"}
          </div>
        </div>

        <div className="l7n-video-wrapper">
          <div className="l7n-current-card">
            <div className={`l7n-card-flip-wrap ${cardFlipping ? "l7n-card-flipping" : ""}`}>
              <img src={getCardImage(c1)} alt="card" className="l7n-card-img" />
            </div>
            <div className="l7n-card-label-text">Card</div>
          </div>
          <div className="l7n-video-area">
            <iframe
              src={`https://alpha-g.qnsports.live/route/rih2.php?id=${videoId}`}
              title="Lucky 7 Stream"
              allowFullScreen
            />
          </div>
        </div>

        <div className={`l7n-timer ${countdown === "00:00" ? "l7n-timer--closed" : "l7n-timer--open"}`}>
          {countdown === "00:00" ? "BETTING CLOSED" : countdown}
        </div>

        <div className="l7n-main-bets">
          <div className="l7n-main-bet-col">
            <div className="l7n-rate-label">{lowOption?.rate ?? "0.95"}</div>
            <button
              className={`l7n-main-btn l7n-low-btn ${isSuspended(lowOption) ? "l7n-main-btn--suspended" : ""}`}
              onClick={() => handleRateClick(lowOption)}
            >
              <span className="l7n-btn-label">LOW</span>
              {isSuspended(lowOption) && (
                <div className="l7n-lock-overlay">
                  <FaLock size={16} color="#fff" />
                </div>
              )}
            </button>
            <div className="l7n-pl">
              {lowOption?.pnl !== undefined && lowOption.pnl !== 0 ? (
                <span style={{ color: lowOption.pnl > 0 ? "#00e676" : "#ff5252" }}>
                  {lowOption.pnl}
                </span>
              ) : <span>0</span>}
            </div>
          </div>

          <div className="l7n-main-center">
            <button
              className={`l7n-seven-wrap ${isSuspended(card7Option) ? "l7n-seven-wrap--suspended" : ""}`}
              // onClick={() => handleRateClick(card7Option)}
              disabled={isSuspended(card7Option)}
            >
              <img src="/casino/CARD%207.png" alt="7" className="l7n-seven-img" />
              {isSuspended(card7Option) && (
                <div className="l7n-lock-overlay">
                  <FaLock size={16} color="#fff" />
                </div>
              )}
            </button>
            <div className="l7n-pl">
              {card7Option?.pnl !== undefined && card7Option.pnl !== 0 ? (
                <span style={{ color: card7Option.pnl > 0 ? "#00e676" : "#ff5252" }}>
                  {card7Option.pnl}
                </span>
              ) : <span>0</span>}
            </div>
          </div>

          <div className="l7n-main-bet-col">
            <div className="l7n-rate-label">{highOption?.rate ?? "0.95"}</div>
            <button
              className={`l7n-main-btn l7n-high-btn ${isSuspended(highOption) ? "l7n-main-btn--suspended" : ""}`}
              onClick={() => handleRateClick(highOption)}
            >
              <span className="l7n-btn-label">HIGH</span>
              {isSuspended(highOption) && (
                <div className="l7n-lock-overlay">
                  <FaLock size={16} color="#fff" />
                </div>
              )}
            </button>
            <div className="l7n-pl">
              {highOption?.pnl !== undefined && highOption.pnl !== 0 ? (
                <span style={{ color: highOption.pnl > 0 ? "#00e676" : "#ff5252" }}>
                  {highOption.pnl}
                </span>
              ) : <span>0</span>}
            </div>
          </div>
        </div>


        <div className="l7n-history-section">
          <div className="l7n-result-header">Last 10 Results</div>
          <div className="l7n-result-list">
            {resultHistory.length === 0 ? (
              <span className="l7n-no-history">No history yet</span>
            ) : (
              resultHistory.slice(0, 10).map((r: any, i: number) => {
                const winner = r?.winner ?? ""
                const label = winner === "High" ? "H" : winner === "Low" ? "L" : "T"
                const bg = label === "H" ? "linear-gradient(135deg, #b8860b 0%, #d4ac0d 100%)"
                         : label === "L" ? "linear-gradient(135deg, #2c3e50 0%, #3d5166 100%)"
                         :                 "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)"
                const shadow = label === "H" ? "0 4px 12px rgba(212,172,13,0.5)"
                             : label === "L" ? "0 4px 12px rgba(44,62,80,0.5)"
                             :                 "0 4px 12px rgba(46,204,113,0.5)"
                return (
                  <div
                    key={r?.mid || i}
                    className="l7n-result-circle"
                    style={{ background: bg, boxShadow: shadow }}
                    title={r?.winner}
                    onClick={() => {
                      setSelectedRoundId(r?.mid ?? "")
                      setSelectedT3Item(r)
                      setRoundDetailOpen(true)
                    }}
                  >
                    {label}
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="tp-open-bets">
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

      <PlaceBetModal
        isOpen={betModalVisible && !!selectedPlayer}
        onClose={() => setBetModalVisible(false)}
        selectedPlayer={selectedPlayer}
        matchId={id}
        game="lucky7eu"
      />

      <Lucky7RoundDetailModal
        isOpen={roundDetailOpen}
        onClose={() => setRoundDetailOpen(false)}
        roundId={selectedRoundId}
        t3Item={selectedT3Item}
      />
    </>
  )
}

export default Lucky7
