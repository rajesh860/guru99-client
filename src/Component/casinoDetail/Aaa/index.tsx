import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { FaLock } from "react-icons/fa"
import BackBtn from "../../BackBtn/BackBtn"
import { useGetCasinoMyBetsQuery, useGetCasinoCompletedBetsQuery } from "../../../../store/service/userServices/userServices"
import PlaceBetModal from "../teenPatti/PlaceBetModal"
import AaaRoundDetailModal from "./AaaRoundDetailModal"
import { getCardImage } from "../../../utils/cardImage"
import { videoIdById } from "../../Casino_Data/Constant"
import "./Aaa.scss"
import "../teenPatti/styles.scss"

const RESULT_COLORS: Record<string, string> = {
  A: "linear-gradient(135deg,#7b1a1a,#a02020)",
  B: "linear-gradient(135deg,#1a3a5c,#1f5080)",
  C: "linear-gradient(135deg,#1a5c1a,#20802a)",
}

const AAA: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [betModalVisible, setBetModalVisible] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [countdown, setCountdown] = useState("00:00")
  const [remainingSecs, setRemainingSecs] = useState(0)
  const [betsTab, setBetsTab] = useState<"open" | "completed">("open")
  const [wsData, setWsData] = useState<any>(null)
  const [cardFlipping, setCardFlipping] = useState(false)
  const [roundDetailOpen, setRoundDetailOpen] = useState(false)
  const [selectedRoundId, setSelectedRoundId] = useState("")
  const [selectedT3Item, setSelectedT3Item] = useState<any>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const prevC1 = useRef<string | undefined>(undefined)

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`${import.meta.env.VITE_WS_BASE_URL}/ws/casino`)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "subscribe", game: "aaa" }))
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === "gameData" && msg.game === "aaa") {
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

  // My bets
  const { data: myBetsResponse } = useGetCasinoMyBetsQuery(
    { game: "aaa" },
    { pollingInterval: 2000 }
  )
  const openBets: any[] = myBetsResponse?.data ?? myBetsResponse?.bets ?? []

  // Completed bets
  const { data: completedBetsRes } = useGetCasinoCompletedBetsQuery(
    { game: "aaa" },
    { skip: betsTab !== "completed", pollingInterval: 5000 }
  )
  const completedBets: any[] = completedBetsRes?.data ?? completedBetsRes?.bets ?? []

  // Countdown timer from autotime
  useEffect(() => {
    const autotime = wsData?.autotime ?? wsData?.t1?.autotime
    if (!autotime) { setCountdown("00:00"); setRemainingSecs(0); return }

    const secs = parseInt(autotime)
    if (secs <= 0) { setCountdown("00:00"); setRemainingSecs(0); return }

    const fmt = (s: number) =>
      `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`

    let remaining = secs
    setCountdown(fmt(remaining))
    setRemainingSecs(remaining)
    const timer = setInterval(() => {
      remaining -= 1
      if (remaining <= 0) { setCountdown("00:00"); setRemainingSecs(0); clearInterval(timer) }
      else { setCountdown(fmt(remaining)); setRemainingSecs(remaining) }
    }, 1000)

    return () => clearInterval(timer)
  }, [wsData?.autotime, wsData?.t1?.autotime])

  // Card flip animation
  const c1 = wsData?.t1?.C1
  useEffect(() => {
    if (c1 && c1 !== prevC1.current) {
      prevC1.current = c1
      setCardFlipping(true)
      const t = setTimeout(() => setCardFlipping(false), 600)
      return () => clearTimeout(t)
    }
  }, [c1])

  const t2: any[] = wsData?.t2 ?? []
  const resultHistory: any[] = wsData?.t3 ?? []
  const roundId = wsData?.t1?.mid ?? wsData?.roundId ?? ""
  const videoId = videoIdById[id ?? ""] ?? "3056"

  const getOption = (nat: string) => t2.find((o: any) => o.nat === nat)
  // Suspend when backend marks it inactive, OR within 2s of the round ending.
  const isSuspended = (item: any) => !item || item.gstatus !== "ACTIVE" || remainingSecs <= 2

  const handleRateClick = (item: any) => {
    if (isSuspended(item)) return
    setSelectedPlayer({ ...item, isBack: true, rate: item.rate ?? item.b1 })
    setBetModalVisible(true)
  }

  const amarOpt    = getOption("Amar")
  const akbarOpt   = getOption("Akbar")
  const anthonyOpt = getOption("Anthony")

  const minBet = amarOpt?.min ?? 100
  const maxBet = amarOpt?.max ?? 10000

  return (
    <>
      <BackBtn to="/casino-list" name="BACK TO CASINO MENU" />

      <div className="aaa-container">

        {/* Header */}
        <div className="aaa-header">
          <div className="aaa-header-left">
            Amar Akbar Anthony
            <span className="aaa-rules-link"> | Rules</span>
          </div>
          <div className="aaa-header-right">Round Id: {roundId || "---"}</div>
        </div>

        {/* Video + card overlay */}
        <div className="aaa-video-wrapper">
          <div className="aaa-current-card">
            <div className={`aaa-card-flip-wrap ${cardFlipping ? "aaa-card-flipping" : ""}`}>
              <img src={getCardImage(c1)} alt="card" className="aaa-card-img" />
            </div>
            <div className="aaa-card-label">Card</div>
          </div>
          <div className="aaa-video-area">
            <iframe
              src={`https://alpha-g.qnsports.live/route/rih2.php?id=${videoId}`}
              title="AAA Stream"
              allowFullScreen
            />
          </div>
        </div>

        {/* Timer */}
        <div className={`aaa-timer ${countdown === "00:00" ? "aaa-timer--closed" : "aaa-timer--open"}`}>
          {countdown === "00:00" ? "BETTING CLOSED" : countdown}
        </div>

        {/* 3 main bets */}
        <div className="aaa-main-bets">
          {([
            { opt: amarOpt,    mod: "amar",    label: "Amar"    },
            { opt: akbarOpt,   mod: "akbar",   label: "Akbar"   },
            { opt: anthonyOpt, mod: "anthony", label: "Anthony" },
          ] as const).map(({ opt, mod, label }) => (
            <div key={mod} className="aaa-main-col">
              <div className="aaa-main-label">{label}</div>
              <button
                className={`aaa-main-btn aaa-main-btn--${mod} ${isSuspended(opt) ? "aaa-main-btn--suspended" : ""}`}
                onClick={() => handleRateClick(opt)}
                disabled={isSuspended(opt)}
              >
                <span className="aaa-btn-rate">{opt?.rate ?? opt?.b1 ?? "—"}</span>
                {isSuspended(opt) && (
                  <div className="aaa-lock-overlay"><FaLock size={14} color="#fff" /></div>
                )}
              </button>
              <div className="aaa-pl">
                {opt?.pnl !== undefined && opt.pnl !== 0 ? (
                  <span style={{ color: opt.pnl > 0 ? "#00e676" : "#ff5252" }}>{opt.pnl}</span>
                ) : <span>0</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Min/Max */}
        <div className="aaa-minmax">Min: {minBet} | Max: {maxBet}</div>

        {/* Card grid */}
        {/* <div className="aaa-card-section">
          ...card grid content...
        </div> */}

        {/* Result history */}
        <div className="aaa-history-section">
          <div className="aaa-result-header">Last Results</div>
          <div className="aaa-result-list">
            {resultHistory.length === 0 ? (
              <span className="aaa-no-history">No history yet</span>
            ) : (
              resultHistory.slice(0, 10).map((r: any, i: number) => {
                const winner = r?.winner ?? ""
                const label  = winner === "Amar" ? "A" : winner === "Akbar" ? "B" : winner === "Anthony" ? "C" : winner?.charAt(0)?.toUpperCase() ?? "?"
                const bg     = RESULT_COLORS[label] ?? "linear-gradient(135deg,#444,#666)"
                return (
                  <div
                    key={r?.mid || i}
                    className="aaa-result-circle"
                    style={{ background: bg }}
                    title={winner}
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

        {/* Bets — same as DT20 */}
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
        game="aaa"
        roundSeconds={remainingSecs}
      />

      <AaaRoundDetailModal
        isOpen={roundDetailOpen}
        onClose={() => { setRoundDetailOpen(false); setSelectedT3Item(null) }}
        roundId={selectedRoundId}
        t3Item={selectedT3Item}
      />
    </>
  )
}

export default AAA
