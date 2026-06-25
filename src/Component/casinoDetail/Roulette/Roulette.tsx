import { useEffect, useRef, useState } from "react"
import { FaLock } from "react-icons/fa"
import BackBtn from "../../BackBtn/BackBtn"
import snackbarUtil from "../../../utils/Snackbar"
import { useGetUserBalanceQuery } from "../../../../store/service/userServices/userServices"
import {
  useGetRouletteCurrentRoundQuery,
  useGetRouletteResultsQuery,
  usePlaceRouletteBetMutation,
  useGetRoulettePendingBetsQuery,
  useGetRouletteCompletedBetsQuery,
} from "../../../../store/service/roulette/rouletteServices"
import "./Roulette.scss"

// ── European wheel constants ─────────────────────────────────────────────────
const WHEEL_ORDER = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26]
const RED_SET     = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36])
const TOTAL       = WHEEL_ORDER.length
const SECTOR_DEG  = 360 / TOTAL
const HALF_RAD    = (SECTOR_DEG / 2) * (Math.PI / 180)
const R           = 140
const TEXT_R      = 108
const INNER_R     = 32

const LX = -(R * Math.sin(HALF_RAD))
const LY = -(R * Math.cos(HALF_RAD))
const RX  =  R * Math.sin(HALF_RAD)
const RY  = -(R * Math.cos(HALF_RAD))
const SECTOR_PATH = `M0,0 L${LX.toFixed(2)},${LY.toFixed(2)} A${R},${R} 0 0 1 ${RX.toFixed(2)},${RY.toFixed(2)} Z`

const numColor = (n: number) => n === 0 ? "#1e8c3a" : RED_SET.has(n) ? "#c0392b" : "#0f0f0f"
const numClass = (n: number) => n === 0 ? "green" : RED_SET.has(n) ? "red" : "black"

// betType mapping
const getBetType = (nat: string): string => {
  if (nat === "Red")      return "red"
  if (nat === "Black")    return "black"
  if (nat === "Even")     return "even"
  if (nat === "Odd")      return "odd"
  if (nat === "1 to 18")  return "low"
  if (nat === "19 to 36") return "high"
  if (nat === "1 to 12")  return "dozen1"
  if (nat === "13 to 24") return "dozen2"
  if (nat === "25 to 36") return "dozen3"
  if (nat === "Column 1") return "col1"
  if (nat === "Column 2") return "col2"
  if (nat === "Column 3") return "col3"
  return "straight" // number bet
}

const getBetOn = (nat: string): string => {
  if (nat === "Red")      return "red"
  if (nat === "Black")    return "black"
  if (nat === "Even")     return "even"
  if (nat === "Odd")      return "odd"
  if (nat === "1 to 18")  return "low"
  if (nat === "19 to 36") return "high"
  if (nat === "1 to 12")  return "dozen1"
  if (nat === "13 to 24") return "dozen2"
  if (nat === "25 to 36") return "dozen3"
  if (nat === "Column 1") return "col1"
  if (nat === "Column 2") return "col2"
  if (nat === "Column 3") return "col3"
  return nat // number as string
}

// ── Betting layout ───────────────────────────────────────────────────────────
const TABLE_ROWS: number[][] = [
  [3,6,9,12,15,18,21,24,27,30,33,36],
  [2,5,8,11,14,17,20,23,26,29,32,35],
  [1,4,7,10,13,16,19,22,25,28,31,34],
]
const OUTSIDE_BETS = [
  { nat: "Even",  label: "EVEN",  mod: "--even" },
  { nat: "Red",   label: "RED",   mod: "--red"  },
  { nat: "Black", label: "BLACK", mod: "--black"},
  { nat: "Odd",   label: "ODD",   mod: "--odd"  },
]
const DOZEN_BETS = [
  { nat: "1 to 12",  label: "1st 12"  },
  { nat: "13 to 24", label: "2nd 12"  },
  { nat: "25 to 36", label: "3rd 12"  },
]

// ── SVG Wheel ────────────────────────────────────────────────────────────────
function RouletteWheel({ resultNum, svgRef }: { resultNum: number | null; svgRef?: React.RefObject<SVGSVGElement> }) {
  return (
    <svg ref={svgRef} className="rl-wheel-svg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
      <circle cx="150" cy="150" r={R + 7} fill="#8B6914" />
      <circle cx="150" cy="150" r={R + 4} fill="#C9A227" />
      <circle cx="150" cy="150" r={R + 1} fill="#8B6914" />

      <g transform="translate(150,150)">
        {WHEEL_ORDER.map((num, i) => {
          const rotation = i * SECTOR_DEG
          const fill     = numColor(num)
          const isResult = num === resultNum
          return (
            <g key={num} transform={`rotate(${rotation})`}>
              <path
                d={SECTOR_PATH}
                fill={isResult ? "#ffd700" : fill}
                stroke="#C9A227"
                strokeWidth="0.6"
              />
              <text
                x="0" y={-TEXT_R}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="6.5" fontWeight="bold"
                fill={isResult ? "#000" : "#fff"}
                style={{ userSelect: "none" }}
              >{num}</text>
            </g>
          )
        })}

        {WHEEL_ORDER.map((_, i) => {
          const angle = i * SECTOR_DEG * Math.PI / 180
          return (
            <circle key={`sep-${i}`}
              cx={(R - 4) * Math.sin(angle)} cy={-(R - 4) * Math.cos(angle)}
              r="1.5" fill="#C9A227"
            />
          )
        })}

        <circle cx="0" cy="0" r={INNER_R + 8} fill="#2a2a0a" stroke="#8B6914" strokeWidth="1.5" />
        <circle cx="0" cy="0" r={INNER_R + 2} fill="#1a1a0a" stroke="#C9A227" strokeWidth="1" />
        <circle cx="0" cy="0" r={INNER_R - 2} fill="#C9A227" stroke="#8B6914" strokeWidth="1" />
        <circle cx="0" cy="0" r={INNER_R - 8} fill="#1a1a0a" />
        <circle cx="0" cy="0" r="8" fill="#C9A227" />
        <circle cx="0" cy="0" r="5" fill="#fff8e1" />
        <circle cx="0" cy="0" r="2" fill="#8B6914" />
      </g>
    </svg>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
const RouletteGame = () => {
  const [countdown,  setCountdown]  = useState(0)
  const [betsTab,    setBetsTab]    = useState<"open" | "completed">("open")
  const [betSheet,   setBetSheet]   = useState<{ label: string; betType: string; betOn: string } | null>(null)
  const [stakeInput, setStakeInput] = useState("")
  const [wsResult,   setWsResult]   = useState<{ result: number; color: string } | null>(null)
  const [wsHistory,  setWsHistory]  = useState<{ result: number; color: string }[]>([])
  const [wsRoundId,  setWsRoundId]  = useState("")
  const [phase,      setPhase]      = useState<"betting" | "spinning" | "result">("betting")
  const wsRef          = useRef<WebSocket | null>(null)
  const cdRef          = useRef<ReturnType<typeof setInterval> | null>(null)
  const wheelRef       = useRef<SVGSVGElement>(null)
  const ballRef        = useRef<HTMLDivElement>(null)
  const rafRef         = useRef<number>(0)
  const angleRef       = useRef(0)
  const resultTimeRef  = useRef(0)   // timestamp when result phase started

  const token = localStorage.getItem("client-token") ?? ""
  const { data: userBalance } = useGetUserBalanceQuery(undefined, { skip: !token })
  const mongoId = userBalance?.data?.id ?? ""

  // ── REST APIs ────────────────────────────────────────────────────────────
  const { data: currentRound } =
    useGetRouletteCurrentRoundQuery(undefined, { pollingInterval: 5000 })

  const { data: resultsData, refetch: refetchResults } =
    useGetRouletteResultsQuery({ limit: 15 }, { pollingInterval: 10000 })

  const { data: pendingData, refetch: refetchPending } =
    useGetRoulettePendingBetsQuery(undefined, { pollingInterval: 3000 })

  const { data: completedData } =
    useGetRouletteCompletedBetsQuery({ page: 1, limit: 20 }, {
      skip: betsTab !== "completed",
      pollingInterval: 8000,
    })

  const [placeBet, { isLoading: isBetting }] = usePlaceRouletteBetMutation()

  const roundId: string = wsRoundId || currentRound?.data?.roundId || currentRound?.roundId || "—"
  const isSuspended     = phase !== "betting"
  const history         = wsHistory.length > 0
    ? wsHistory
    : (resultsData?.data ?? resultsData?.results ?? [])
  const openBets: any[]      = pendingData?.data  ?? pendingData?.bets ?? []
  const completedBets: any[] = completedData?.data ?? completedData?.bets ?? []

  const lastResult = wsResult ?? (history.length > 0 ? history[0] : null)

  // ── WebSocket ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mongoId) return
    const base = (import.meta.env.VITE_WS_BASE_URL ?? "wss://guru99.co")
      .replace(/^http/, "ws")
    const url = `${base}/api/roulette/ws?userId=${mongoId}&token=${token}`

    const connect = () => {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          const type = msg.type ?? msg.event

          // ── init: initial state on connect ──────────────────
          if (type === "init") {
            if (msg.roundId) setWsRoundId(msg.roundId)
            if (Array.isArray(msg.lastResults)) setWsHistory(msg.lastResults)
            if (msg.result !== null && msg.result !== undefined) {
              setWsResult({ result: msg.result, color: msg.color ?? "black" })
            }
            // autotime countdown
            const secs = parseInt(msg.autotime ?? "0")
            if (secs > 0) startCountdown(secs)
            else setCountdown(0)
            // phase from betOpen
            setPhase(msg.betOpen === true ? "betting" : "result")
          }

          // ── newRound / round_start: update roundId only ──────
          // Do NOT change phase here — result phase must show the stop animation.
          // tick/countdown will switch to betting when server opens betting.
          if (type === "newRound" || type === "round_start") {
            if (msg.roundId) setWsRoundId(msg.roundId)
            if (cdRef.current) clearInterval(cdRef.current)
          }

          // ── tick / countdown: betting timer update ───────────
          if (type === "tick" || type === "countdown") {
            const secs = parseInt(msg.autotime ?? msg.timeLeft ?? msg.data?.timeLeft ?? "0")
            if (msg.betOpen === true || type === "countdown") {
              // Wait at least 4.5s after result so wheel stop animation finishes
              const elapsed = Date.now() - resultTimeRef.current
              const delay   = Math.max(0, 4500 - elapsed)
              setTimeout(() => {
                startCountdown(secs)
                setPhase("betting")
              }, delay)
            }
          }

          // ── spinning: clear last result, spin fast ───────────
          if (type === "spinning") {
            if (msg.roundId) setWsRoundId(msg.roundId)
            setWsResult(null)
            setPhase("spinning")
            if (cdRef.current) clearInterval(cdRef.current)
            const secs = parseInt(msg.spinningLeft ?? "0")
            if (secs > 0) startCountdown(secs)
            else setCountdown(0)
          }

          // ── result / betResult: round result ───────────────
          if (type === "result" || type === "betResult") {
            if (msg.result !== null && msg.result !== undefined) {
              const entry = { result: msg.result, color: msg.color ?? "black" }
              setWsResult(entry)
              setWsHistory(prev => [entry, ...prev].slice(0, 20))
            }
            resultTimeRef.current = Date.now()
            setPhase("result")
            if (cdRef.current) clearInterval(cdRef.current)
            setCountdown(0)
            refetchResults()
          }

          // ── settled: bets settled ───────────────────────────
          if (type === "settled") {
            refetchPending()
          }
        } catch { /* ignore */ }
      }

      ws.onerror = () => { /* silent */ }
      ws.onclose = () => {
        setTimeout(connect, 3000)
      }
    }

    const startCountdown = (secs: number) => {
      if (cdRef.current) clearInterval(cdRef.current)
      setCountdown(secs)
      let t = secs
      cdRef.current = setInterval(() => {
        t -= 1
        if (t <= 0) { clearInterval(cdRef.current!); setCountdown(0) }
        else setCountdown(t)
      }, 1000)
    }

    connect()
    return () => {
      if (cdRef.current) clearInterval(cdRef.current)
      if (wsRef.current) wsRef.current.onclose = null
      wsRef.current?.close()
    }
  }, [mongoId])

  // ── Countdown from REST fallback ─────────────────────────────────────────
  useEffect(() => {
    const secs = parseInt(currentRound?.data?.timeLeft ?? currentRound?.timeLeft ?? "0")
    if (!secs || secs <= 0) return
    setCountdown(secs)
  }, [currentRound])

  // ── Wheel spin control ────────────────────────────────────────────────────
  useEffect(() => {
    const el   = wheelRef.current
    const ball = ballRef.current
    if (!el || !ball) return

    cancelAnimationFrame(rafRef.current)

    if (phase === "betting") {
      el.style.transition = ""
      ball.style.animation = ""
      ball.style.transform = ""
      const tick = () => {
        angleRef.current += 1.5
        el.style.transform = `rotate(${angleRef.current}deg)`
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(rafRef.current)
    }

    if (phase === "spinning") {
      el.style.transition = ""
      ball.style.animation = "rl-ball-spin 1.1s linear infinite"
      const tick = () => {
        angleRef.current += 4
        el.style.transform = `rotate(${angleRef.current}deg)`
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(rafRef.current)
    }

    if (phase === "result") {
      cancelAnimationFrame(rafRef.current)
      ball.style.animation = "none"
      ball.style.transform = "rotate(0deg)"

      if (wsResult !== null) {
        const idx        = WHEEL_ORDER.indexOf(wsResult.result)
        const targetMod  = (360 - (idx * SECTOR_DEG % 360)) % 360
        const cur        = ((angleRef.current % 360) + 360) % 360
        let delta        = targetMod - cur
        if (delta < 0)   delta += 360
        if (delta < 30)  delta += 360
        const finalAngle = angleRef.current + delta + 2 * 360

        el.style.transition = "transform 4s cubic-bezier(0.17,0.67,0.15,1.0)"
        el.style.transform  = `rotate(${finalAngle}deg)`
        angleRef.current    = finalAngle

        const t = setTimeout(() => { if (el) el.style.transition = "" }, 4100)
        return () => clearTimeout(t)
      }
    }
  }, [phase, wsResult])

  // ── Bet handlers ─────────────────────────────────────────────────────────
  const openBetSheet = (nat: string) => {
    if (isSuspended || phase !== "betting") return
    setBetSheet({ label: nat, betType: getBetType(nat), betOn: getBetOn(nat) })
    setStakeInput("")
  }

  const handlePlaceBet = async () => {
    if (!betSheet) return
    const stake = parseInt(stakeInput)
    if (!stake || stake < 100)  { snackbarUtil.error("Minimum stake is ₹100"); return }
    if (stake > 20000)           { snackbarUtil.error("Maximum stake is ₹20,000"); return }
    try {
      const res: any = await placeBet({ betType: betSheet.betType, betOn: betSheet.betOn, stake })
      if (res?.data?.success || res?.data?.message) {
        snackbarUtil.success(res.data.message ?? "Bet placed!")
        setBetSheet(null)
        setStakeInput("")
        refetchPending()
      } else {
        snackbarUtil.error(res?.data?.message ?? res?.error?.data?.message ?? "Failed to place bet")
      }
    } catch {
      snackbarUtil.error("Failed to place bet")
    }
  }

  const isBettingOpen = phase === "betting" && !isSuspended

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="rl-page">
        <BackBtn to="/main" name="BACK TO DASHBOARD" />

        {/* Header */}
        <div className="rl-header">
          <span className="rl-title">ROULETTE</span>
          <span className="rl-round-id">Round: {roundId}</span>
        </div>

        {/* Suspended banner */}
        {/* {isSuspended && (
          <div className="rl-suspend-overlay">
            <FaLock size={12} /><span>BETTING SUSPENDED</span>
          </div>
        )} */}

        {/* Wheel */}
        <div className="rl-wheel-section">
          <div className="rl-wheel-outer">
            <div className="rl-wheel-glow" />
            <RouletteWheel resultNum={lastResult?.result ?? null} svgRef={wheelRef} />
            <div className="rl-pointer" />
            <div ref={ballRef} className="rl-ball-orbit">
              <div className="rl-ball" />
            </div>

            {/* Countdown in wheel center */}
            {countdown > 0 && phase === "betting" && (
              <div className={`rl-cd-overlay${countdown <= 5 ? " rl-cd-overlay--red" : ""}`}>
                <span key={countdown} className="rl-cd-num">{countdown}</span>
              </div>
            )}
          </div>

          {/* Last result below wheel */}
          {lastResult !== null && (
            <div className="rl-result-box">
              <span className="rl-result-label">LAST RESULT</span>
              <div className={`rl-hist-bubble rl-hist-bubble--${lastResult.color}`}
                style={{ width: 52, height: 52, fontSize: 20 }}>
                {lastResult.result}
              </div>
            </div>
          )}
        </div>

        {/* Betting table */}
        <div className="rl-betting">
          <div className="rl-section-title">
            {phase === "betting" ? "Place Your Bet"
              : phase === "spinning" ? "🎡 Spinning..."
              : "Betting Closed"}
          </div>

          {/* Zero — full width */}
          <div
            className={`rl-zero-cell rl-zero-full${!isBettingOpen ? " suspended" : ""}`}
            onClick={() => openBetSheet("0")}
          >
            0
          </div>

          <div className="rl-table">
            {TABLE_ROWS.map((row, ri) => (
              <div className="rl-table-row" key={ri}>
                {row.map((n) => (
                  <div
                    key={n}
                    className={`rl-num-cell rl-num-cell--${numClass(n)}${n === lastResult?.result ? " is-result" : ""}${!isBettingOpen ? " suspended" : ""}`}
                    onClick={() => openBetSheet(String(n))}
                  >{n}</div>
                ))}
              </div>
            ))}
          </div>

          <div className="rl-dozens">
            {DOZEN_BETS.map(d => (
              <div key={d.nat} className={`rl-dozen-btn${!isBettingOpen ? " suspended" : ""}`}
                onClick={() => openBetSheet(d.nat)}>
                {d.label}
              </div>
            ))}
          </div>

          <div className="rl-outside">
            {OUTSIDE_BETS.map(b => (
              <div key={b.nat}
                className={`rl-outside-btn rl-outside-btn${b.mod}${!isBettingOpen ? " suspended" : ""}`}
                onClick={() => openBetSheet(b.nat)}>
                {b.label}
              </div>
            ))}
          </div>
        </div>

        {/* History — Teen Patti style, above tabs */}
        <div className="rl-history">
          <div className="rl-hist-label">Last Results</div>
          <div className="rl-hist-list">
            {history.length === 0 && lastResult === null && (
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>No results yet</span>
            )}
            {history.slice(0, 15).map((h: any, i: number) => {
              const n     = parseInt(h?.result ?? h?.winningNumber ?? "")
              const color = h?.color ?? numClass(n)
              if (isNaN(n)) return null
              return (
                <div key={i} className={`rl-hist-bubble rl-hist-bubble--${color}`}>{n}</div>
              )
            })}
          </div>
        </div>

        {/* Bets tabs */}
        <div className="rl-bets">
          <div className="rl-tabs">
            <button className={`rl-tab rl-tab--${betsTab === "open" ? "active" : "inactive"}`}
              onClick={() => setBetsTab("open")}>
              Open Bets ({openBets.length})
            </button>
            <button className={`rl-tab rl-tab--${betsTab === "completed" ? "active" : "inactive"}`}
              onClick={() => setBetsTab("completed")}>
              Completed
            </button>
          </div>

          {betsTab === "open" ? (
            openBets.length > 0 ? (
              <table className="rl-bets-table">
                <thead><tr><th>#</th><th>Bet On</th><th>Type</th><th>Stake</th><th>Pot.Win</th><th>Status</th></tr></thead>
                <tbody>
                  {openBets.map((b: any, i: number) => (
                    <tr key={b._id ?? i}>
                      <td>{i + 1}</td>
                      <td style={{ fontWeight: 700 }}>{b.betOn ?? "—"}</td>
                      <td style={{ textTransform: "capitalize" }}>{b.betType ?? "—"}</td>
                      <td>₹{b.stake ?? "—"}</td>
                      <td style={{ color: "#4ade80" }}>₹{b.potentialWin ?? "—"}</td>
                      <td><span className="rl-badge rl-badge--pending">{b.status ?? "Pending"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="rl-bets-empty">No open bets</div>
          ) : (
            completedBets.length > 0 ? (
              <table className="rl-bets-table">
                <thead><tr><th>#</th><th>Bet On</th><th>Stake</th><th>P&L</th><th>Status</th></tr></thead>
                <tbody>
                  {completedBets.map((b: any, i: number) => {
                    const pnl = b.profitLoss ?? b.pnl ?? 0
                    return (
                      <tr key={b._id ?? i}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 700 }}>{b.betOn ?? "—"}</td>
                        <td>₹{b.stake ?? "—"}</td>
                        <td style={{ color: Number(pnl) >= 0 ? "#4ade80" : "#f87171" }}>
                          {Number(pnl) > 0 ? `+${pnl}` : pnl}
                        </td>
                        <td>
                          <span className={`rl-badge rl-badge--${b.status === "won" ? "win" : b.status === "lost" ? "loss" : "pending"}`}>
                            {b.status ?? "—"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : <div className="rl-bets-empty">No completed bets</div>
          )}
        </div>
      </div>

      {/* ── Dice-style Bet Bottom Sheet ── */}
      {betSheet && (
        <div className="dbs-overlay" onClick={() => { setBetSheet(null); setStakeInput("") }}>
          <div className="dbs-sheet" onClick={e => e.stopPropagation()}>
            <div className="dbs-handle" />
            <div className="dbs-toprow">
              <span className="dbs-label">Bet: {betSheet.label}</span>
              {countdown > 0 && <span className="dbs-timer">{countdown}s</span>}
            </div>
            <div className="dbs-input-row">
              <span className="dbs-rupee">₹</span>
              <input
                className="dbs-input"
                type="number"
                value={stakeInput}
                onChange={e => setStakeInput(e.target.value)}
                placeholder="Enter stake (min ₹100)"
                autoFocus
              />
              <button className="dbs-clear" onClick={() => setStakeInput("")}>C</button>
            </div>
            <div className="dbs-chips">
              {[100, 500, 1000, 2000, 5000, 10000].map(v => (
                <button key={v}
                  className={`dbs-chip ${stakeInput === String(v) ? "dbs-chip--active" : ""}`}
                  onClick={() => setStakeInput(String(v))}>
                  {v >= 1000 ? `${v / 1000}K` : v}
                </button>
              ))}
            </div>
            <div className="dbs-actions">
              <button className="dbs-cancel" onClick={() => { setBetSheet(null); setStakeInput("") }}>Cancel</button>
              <button className="dbs-submit" onClick={handlePlaceBet} disabled={isBetting || !stakeInput}>
                {isBetting ? "Placing..." : "Place Bet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default RouletteGame
