import React, { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { FaLock } from "react-icons/fa"
import BackBtn from "../../BackBtn/BackBtn"
import { useGetCasinoMyBetsQuery, useGetCasinoCompletedBetsQuery } from "../../../../store/service/userServices/userServices"
import PlaceBetModal from "../teenPatti/PlaceBetModal"
import DT20RoundDetailModal from "./DT20RoundDetailModal"
import "./DragonTiger20.scss"
import { getCardImage } from "../../../utils/cardImage"

const DragonTiger20: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [betModalVisible, setBetModalVisible] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [countdown, setCountdown] = useState("00:00")
  const [betsTab, setBetsTab] = useState<"open" | "completed">("open")
  const [roundDetailOpen, setRoundDetailOpen] = useState(false)
  const [selectedRoundId, setSelectedRoundId] = useState("")
  const [selectedT3Item, setSelectedT3Item] = useState<any>(null)
  const [wsData, setWsData] = useState<any>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // WebSocket connection — game type: dt20
  useEffect(() => {
    const ws = new WebSocket(`${import.meta.env.VITE_WS_BASE_URL}/ws/casino`)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "subscribe", game: "dt20" }))
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === "gameData" && msg.game === "dt20") {
          setWsData(msg)
        }
      } catch {}
    }

    ws.onerror = () => {}
    ws.onclose = () => {}

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close()
    }
  }, [])

  const { data: myBetsResponse } = useGetCasinoMyBetsQuery(
    { game: "dt20" },
    { pollingInterval: 2000 }
  )

  const openBets: any[] = myBetsResponse?.data ?? myBetsResponse?.bets ?? []

  const { data: completedBetsRes } = useGetCasinoCompletedBetsQuery(
    { game: "dt20" },
    { skip: betsTab !== "completed", pollingInterval: 5000 }
  )
  const completedBets: any[] = completedBetsRes?.data ?? completedBetsRes?.bets ?? []

  const handleRateClick = (item: any) => {
    if (!item || isSuspended(item)) return
    setSelectedPlayer({ ...item, isBack: true })
    setBetModalVisible(true)
  }

  // Countdown from autotime — t1 is object not array
  useEffect(() => {
    const autotime = wsData?.autotime ?? wsData?.t1?.autotime
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
  }, [wsData?.autotime, wsData?.t1?.autotime])

  const t2: any[] = wsData?.t2 ?? []

  const getOption = (nat: string) => t2.find((o) => o.nat === nat)

  const dragonMain = getOption("Dragon")
  const tigerMain  = getOption("Tiger")
  const tieMain    = getOption("Tie")

  // gstatus "1" = active, "0" = suspended
  const isSuspended = (item: any) => !item || item.gstatus !== "1"

  const resultHistory: any[] = wsData?.t3 ?? []

  const roundId = wsData?.t1?.mid ?? wsData?.roundId ?? ""

  return (
    <>
      <BackBtn to="/casino-list" name="BACK TO CASINO MENU" />

      <div className="dt20-container">
        {/* Header */}
        <div className="dt20-header">
          <div className="dt20-header-left">
            20-20 Dragon Tiger
            <span className="dt20-rules-link"> | Rules</span>
          </div>
          <div className="dt20-header-right">
            Round Id: {roundId || "---"}
          </div>
        </div>

        {/* Video + cards wrapper */}
        <div className="dt20-video-wrapper">
          <div className="dt20-video-area">
            <iframe
              src="https://alpha-g.qnsports.live/route/rih2.php?id=3030"
              title="20-20 Dragon Tiger Stream"
              allowFullScreen
            />
          </div>

          {/* Cards overlay — server sends "1" when hidden, actual code when revealed */}
          <div className="dt20-cards-overlay">
            <div className="dt20-card-wrap">
              <div className="dt20-flip-label dt20-flip-label--dragon">D</div>
              <img src={getCardImage(wsData?.t1?.C1)} alt="Dragon card" className="dt20-card-img" />
            </div>
            <div className="dt20-card-wrap">
              <div className="dt20-flip-label dt20-flip-label--tiger">T</div>
              <img src={getCardImage(wsData?.t1?.C2)} alt="Tiger card" className="dt20-card-img" />
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className={`dt20-timer ${countdown === "00:00" ? "dt20-timer--closed" : "dt20-timer--open"}`}>
          {countdown === "00:00" ? "BETTING CLOSED" : countdown}
        </div>

        {/* Main betting buttons */}
        <div className="dt20-main-bets">
          {/* Dragon */}
          <div className="dt20-main-bet-col">
            <div className="dt20-pl">
              {dragonMain?.pnl !== undefined && dragonMain.pnl !== 0 ? (
                <span style={{ color: dragonMain.pnl > 0 ? "#00e676" : "#ff5252" }}>
                  {dragonMain.pnl}
                </span>
              ) : (
                <span>0</span>
              )}
            </div>
            <button
              className={`dt20-main-btn dt20-dragon-btn ${isSuspended(dragonMain) ? "dt20-main-btn--suspended" : ""}`}
              onClick={() => handleRateClick(dragonMain)}
            >
              <span className="dt20-btn-label">Dragon</span>
              <span className="dt20-btn-rate">{dragonMain?.rate ?? "0.00"}</span>
              {isSuspended(dragonMain) && (
                <div className="dt20-lock-overlay">
                  <FaLock size={18} color="#fff" />
                </div>
              )}
            </button>
          </div>

          {/* Tie */}
          <div className="dt20-main-bet-col">
            <div className="dt20-pl">
              {tieMain?.pnl !== undefined && tieMain.pnl !== 0 ? (
                <span style={{ color: tieMain.pnl > 0 ? "#00e676" : "#ff5252" }}>
                  {tieMain.pnl}
                </span>
              ) : (
                <span>0</span>
              )}
            </div>
            <button
              className={`dt20-main-btn dt20-tie-btn ${isSuspended(tieMain) ? "dt20-main-btn--suspended" : ""}`}
              onClick={() => handleRateClick(tieMain)}
            >
              <span className="dt20-btn-label">Tie</span>
              <span className="dt20-btn-rate">{tieMain?.rate ?? "0.00"}</span>
              {isSuspended(tieMain) && (
                <div className="dt20-lock-overlay">
                  <FaLock size={18} color="#fff" />
                </div>
              )}
            </button>
          </div>

          {/* Tiger */}
          <div className="dt20-main-bet-col">
            <div className="dt20-pl">
              {tigerMain?.pnl !== undefined && tigerMain.pnl !== 0 ? (
                <span style={{ color: tigerMain.pnl > 0 ? "#00e676" : "#ff5252" }}>
                  {tigerMain.pnl}
                </span>
              ) : (
                <span>0</span>
              )}
            </div>
            <button
              className={`dt20-main-btn dt20-tiger-btn ${isSuspended(tigerMain) ? "dt20-main-btn--suspended" : ""}`}
              onClick={() => handleRateClick(tigerMain)}
            >
              <span className="dt20-btn-label">Tiger</span>
              <span className="dt20-btn-rate">{tigerMain?.rate ?? "0.00"}</span>
              {isSuspended(tigerMain) && (
                <div className="dt20-lock-overlay">
                  <FaLock size={18} color="#fff" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Dragon 11 card grid */}
        {/* <div className="dt20-card-section">
          <div className="dt20-card-section-title">Dragon 11</div>
          <div className="dt20-card-grid-wrapper">
            <div className="dt20-card-grid">
              {CARD_KEYS.map((key, idx) => {
                const label = CARD_LABELS[idx]
                const option = getCardOption("Dragon", key)
                const suspended = isSuspended(option)
                return (
                  <div
                    key={`dragon-${key}`}
                    className={`dt20-card-cell ${suspended ? "dt20-card-cell--suspended" : ""}`}
                    onClick={() => !suspended && handleRateClick(option)}
                  >
                    <div className="dt20-img-wrap">
                      <img src={`/casino/CARD%20${key === "1" ? "A" : key}.png`} alt={label} className="dt20-cell-img" />
                      {suspended && (
                        <div className="dt20-card-lock">
                          <FaLock size={10} color="#fff" />
                        </div>
                      )}
                    </div>
                    <div className="dt20-card-amount">
                      {option?.pnl !== undefined && option.pnl !== 0 ? (
                        <span style={{ color: option.pnl > 0 ? "#00e676" : "#ff5252" }}>
                          {option.pnl}
                        </span>
                      ) : (
                        <span>0</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="dt20-min-max">
            Min: 100 &nbsp;|&nbsp; Max: 10000
          </div>
        </div> */}

        {/* Tiger 11 card grid */}
        {/* <div className="dt20-card-section">
          <div className="dt20-card-section-title">Tiger 11</div>
          <div className="dt20-card-grid-wrapper">
            <div className="dt20-card-grid">
              {CARD_KEYS.map((key, idx) => {
                const label = CARD_LABELS[idx]
                const option = getCardOption("Tiger", key)
                const suspended = isSuspended(option)
                return (
                  <div
                    key={`tiger-${key}`}
                    className={`dt20-card-cell ${suspended ? "dt20-card-cell--suspended" : ""}`}
                    onClick={() => !suspended && handleRateClick(option)}
                  >
                    <div className="dt20-img-wrap">
                      <img src={`/casino/CARD%20${key === "1" ? "A" : key}.png`} alt={label} className="dt20-cell-img" />
                      {suspended && (
                        <div className="dt20-card-lock">
                          <FaLock size={10} color="#fff" />
                        </div>
                      )}
                    </div>
                    <div className="dt20-card-amount">
                      {option?.pnl !== undefined && option.pnl !== 0 ? (
                        <span style={{ color: option.pnl > 0 ? "#00e676" : "#ff5252" }}>
                          {option.pnl}
                        </span>
                      ) : (
                        <span>0</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="dt20-min-max">
            Min: 100 &nbsp;|&nbsp; Max: 10000
          </div>
        </div> */}

        {/* History — same flow as TeenPatti last-10-result */}
        <div className="dt20-last-result">
          <div className="dt20-result-header">Last 10 Results</div>
          <div className="dt20-result-list">
            {resultHistory.length === 0 ? (
              <span className="dt20-no-history">No history yet</span>
            ) : (
              resultHistory.slice(0, 10).map((r: any, i: number) => {
                const winner = r?.winner ?? ""
                const cls = winner === "Dragon" ? "dt20-rc--dragon"
                          : winner === "Tiger"  ? "dt20-rc--tiger"
                          : "dt20-rc--tie"
                const label = winner === "Dragon" ? "D"
                            : winner === "Tiger"  ? "T"
                            : "T"
                return (
                  <div
                    key={r?.mid || i}
                    className={`dt20-result-circle ${cls}`}
                    title={winner}
                    onClick={() => {
                      if (r?.mid) {
                        setSelectedRoundId(r.mid)
                        setSelectedT3Item(r)
                        setRoundDetailOpen(true)
                      }
                    }}
                  >
                    {label}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Bets Section — Open / Completed tabs */}
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
        game="dt20"
      />

      <DT20RoundDetailModal
        isOpen={roundDetailOpen}
        onClose={() => { setRoundDetailOpen(false); setSelectedT3Item(null) }}
        roundId={selectedRoundId}
        t3Item={selectedT3Item}
      />
    </>
  )
}

export default DragonTiger20
