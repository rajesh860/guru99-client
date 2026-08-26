import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { FaLock } from "react-icons/fa"
import BackBtn from "../../BackBtn/BackBtn"
import snackbarUtil from "../../../utils/Snackbar"

import { useGetDiceCurrentRoundQuery, useGetDiceResultsQuery, usePlaceDiceBetMutation, useGetDiceRoundSummaryQuery, useGetDicePendingBetsQuery, useGetDiceCompletedBetsQuery } from "../../../../store/service/dice/diceServices"
import { useGetUserBalanceQuery } from "../../../../store/service/userServices/userServices"
import "./DiceGame.scss"

type Phase = "betting" | "rolling" | "result"


const RESULT_MS    = 3000

// ── Web Audio ─────────────────────────────────────────────────
let _soundEnabled = localStorage.getItem("game-sound") !== "0"
let _ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  try {
    if (!_ctx) _ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    if (_ctx.state === "suspended") _ctx.resume()
    return _ctx
  } catch { return null }
}

function playTick() {
  if (!_soundEnabled) return
  const ctx = getCtx()
  if (!ctx) return
  try {
    const len  = Math.floor(ctx.sampleRate * 0.035)
    const buf  = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.2))
    const src = ctx.createBufferSource()
    src.buffer = buf
    const bp = ctx.createBiquadFilter()
    bp.type = "bandpass"; bp.frequency.value = 1400; bp.Q.value = 1.2
    const gain = ctx.createGain(); gain.gain.value = 0.5
    src.connect(bp); bp.connect(gain); gain.connect(ctx.destination)
    src.start()
  } catch {}
}

function playChime() {
  if (!_soundEnabled) return
  const ctx = getCtx()
  if (!ctx) return
  try {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const t    = ctx.currentTime + i * 0.11
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.22, t + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45)
      osc.connect(gain); gain.connect(ctx.destination)
      osc.start(t); osc.stop(t + 0.5)
    })
  } catch {}
}

// ── Dot grid positions in a 3×3 cell (1=top-left … 9=bottom-right) ─
const FACE_DOTS: Record<number, number[]> = {
  1: [5],
  2: [3, 7],
  3: [3, 5, 7],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
}


const FaceDots = ({ n }: { n: number }) => (
  <div className="cube-face-grid">
    {[1,2,3,4,5,6,7,8,9].map(pos => (
      <div key={pos} className="cube-cell">
        {FACE_DOTS[n]?.includes(pos) && <div className="cube-dot" />}
      </div>
    ))}
  </div>
)

const Dice3D = ({ rolling, resultNum, lastResult }: { rolling: boolean; resultNum: number | null; lastResult: number | null }) => {
  // Rolling: 3D cube animation
  // Result/Idle: SVG face (always shows exact correct number)
  if (!rolling) {
    const showNum = resultNum ?? lastResult
    return (
      <div className={`dice-svg-result ${resultNum ? "dice-svg-result--show" : ""}`}>
        {showNum && <DiceFaceLarge num={showNum} />}
      </div>
    )
  }
  return (
    <div className="cube-scene">
      <div className="cube cube--rolling">
        <div className="cube-face cube-face--front"><FaceDots n={1} /></div>
        <div className="cube-face cube-face--back"><FaceDots n={6} /></div>
        <div className="cube-face cube-face--top"><FaceDots n={2} /></div>
        <div className="cube-face cube-face--bottom"><FaceDots n={5} /></div>
        <div className="cube-face cube-face--right"><FaceDots n={3} /></div>
        <div className="cube-face cube-face--left"><FaceDots n={4} /></div>
      </div>
    </div>
  )
}

// Large SVG face for main display — guaranteed correct number
const DiceFaceLarge = ({ num }: { num: number }) => (
  <svg width="90" height="90" viewBox="0 0 100 100" style={{ display: "block", filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.7))" }}>
    <defs>
      <linearGradient id="dfg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#e8eaf4" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="92" height="92" rx="16" ry="16" fill="url(#dfg)" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" />
    <rect x="8" y="8" width="84" height="34" rx="12" ry="12" fill="rgba(255,255,255,0.5)" />
    {getDots(num).map(([cx, cy], i) => (
      <g key={i}>
        <circle cx={cx + 1} cy={cy + 1} r="9" fill="rgba(0,0,0,0.15)" />
        <circle cx={cx} cy={cy} r="9" fill="#16172e" />
      </g>
    ))}
  </svg>
)

// Small SVG face for number bet buttons
function getDots(n: number): [number, number][] {
  switch (n) {
    case 1: return [[50, 50]]
    case 2: return [[30, 30], [70, 70]]
    case 3: return [[30, 30], [50, 50], [70, 70]]
    case 4: return [[30, 30], [70, 30], [30, 70], [70, 70]]
    case 5: return [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]]
    case 6: return [[30, 25], [70, 25], [30, 50], [70, 50], [30, 75], [70, 75]]
    default: return []
  }
}

const DiceFace = ({ num, size = 120 }: { num: number; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
    <rect x="4" y="4" width="92" height="92" rx="16" ry="16" fill="#f4f4f8" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
    <rect x="8" y="8" width="84" height="36" rx="12" ry="12" fill="rgba(255,255,255,0.55)" />
    {getDots(num).map(([cx, cy], i) => (
      <g key={i}>
        <circle cx={cx + 1} cy={cy + 1.2} r="9.5" fill="rgba(0,0,0,0.18)" />
        <circle cx={cx} cy={cy} r="9.5" fill="#16172e" />
      </g>
    ))}
  </svg>
)

// ── Component ─────────────────────────────────────────────────
const DiceGame = () => {
  useParams<{ id: string }>()
  const [phase, setPhase]         = useState<Phase>("betting")
  const [countdown, setCountdown] = useState()
  const [resultNum, setResultNum] = useState<number | null>(null)
  const [history, setHistory]     = useState<number[]>([])
  const [betSheet, setBetSheet]   = useState<{ betOn: string; label: string } | null>(null)
  const [stakeInput, setStakeInput] = useState("")
  const [isWin, setIsWin]         = useState(false)
  const [betsTab, setBetsTab]     = useState<"open" | "completed">("open")
  const [roundId, setRoundId]     = useState<string>("")
  const [soundOn, setSoundOn]     = useState(() => localStorage.getItem("game-sound") !== "0")

  useEffect(() => {
    _soundEnabled = soundOn
    localStorage.setItem("game-sound", soundOn ? "1" : "0")
  }, [soundOn])

  const wsRef             = useRef<WebSocket | null>(null)
  const lastRoundIdRef    = useRef<string>("")
  const lastResultRef     = useRef<number | null>(null)
  const resultTimeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [placeDiceBet, { isLoading: isBetting2 }] = usePlaceDiceBetMutation()
  const { data: userInfo } = useGetUserBalanceQuery(undefined, { skip: !localStorage.getItem("client-token") })
  const wsUserId = userInfo?.data?.id ?? userInfo?.data?.userId ?? ""

  const { data: pendingBetsRes } = useGetDicePendingBetsQuery(undefined, {
    pollingInterval: 3000,
  })
  const { data: completedBetsRes } = useGetDiceCompletedBetsQuery(
    { page: 1, limit: 20 },
    { pollingInterval: 5000, skip: betsTab !== "completed" }
  )
  const openBets: any[]      = pendingBetsRes?.data ?? pendingBetsRes?.bets ?? []
  const completedBets: any[] = completedBetsRes?.data ?? completedBetsRes?.bets ?? []

  // Map nat label → betOn value for API
  const toBetOn = (nat: string) => {
    if (nat === "Odd")  return "odd"
    if (nat === "Even") return "even"
    return nat.replace("Number ", "") // "Number 3" → "3"
  }

  const handlePlaceDiceBet = async () => {
    if (!betSheet || !stakeInput) return
    const stake = parseInt(stakeInput)
    if (!stake || stake <= 0) { snackbarUtil.error("Enter valid amount"); return }
    try {
      const res = await placeDiceBet({ betOn: betSheet.betOn, stake }).unwrap()
      if (res?.success) {
        snackbarUtil.success(res?.message || "Bet placed!")
        setBetSheet(null); setStakeInput("")
      } else {
        snackbarUtil.error(res?.message || "Failed to place bet")
      }
    } catch (err: any) {
      snackbarUtil.error(err?.data?.message || "Failed to place bet")
    }
  }

  // Dice APIs — sync state from REST (fallback when WS not connected)
  const { data: currentRound } = useGetDiceCurrentRoundQuery(undefined, {
    pollingInterval: 3000,
  })
  const { data: diceResults } = useGetDiceResultsQuery(undefined, {
    pollingInterval: 5000,
  })
  const { data: roundSummary } = useGetDiceRoundSummaryQuery(undefined, {
    pollingInterval: 3000,
  })

  // P/L from round-summary response
  // Response: { plMap: { "1": -100, "3": 500, "odd": 95, "even": -100 } }
  const getPL = (key: string): number | null => {
    const s = roundSummary?.data ?? roundSummary
    if (!s?.plMap) return null
    const val = s.plMap[key]
    return val !== undefined ? val : null
  }

  // Sync from current-round API
  // Response: { success, data: { roundId, status, autotime, betOpen, result } }
  useEffect(() => {
    if (!currentRound?.success) return
    const rd = currentRound.data

    // Countdown
    if (rd?.autotime !== undefined) setCountdown(rd.autotime)

    // Phase from status field
    if (rd?.status === "betting") setPhase("betting")
    if (rd?.status === "rolling") setPhase("rolling")
    if (rd?.status === "result" || rd?.status === "settled") {
      if (rd?.result) setResultNum(rd.result)
      setPhase("result")
    }
  }, [currentRound])

  // Sync history + detect new result from API
  // Response: { success, data: [{ roundId, result, status }, ...] }
  useEffect(() => {
    if (!diceResults?.success) return
    const list: any[] = diceResults.data ?? []
    if (!Array.isArray(list) || list.length === 0) return

    const settled = list.filter((r: any) => r.status === "settled" && r.result != null)
    if (settled.length === 0) return

    // Update history
    setHistory(settled.map((r: any) => r.result).slice(0, 20))

    // Always keep lastResultRef updated (so dice shows correctly on load)
    const latest = settled[0]
    if (lastResultRef.current === null) {
      lastResultRef.current = latest.result
    }

    // Show result badge only for NEW rounds
    if (latest.roundId !== lastRoundIdRef.current) {
      lastRoundIdRef.current = latest.roundId
      lastResultRef.current = latest.result
      setResultNum(latest.result)
      setPhase("result")
      playChime()
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current)
      resultTimeoutRef.current = setTimeout(() => {
        setResultNum(null)
        setIsWin(false)
        setPhase("betting")
      }, RESULT_MS)
    }
  }, [diceResults])


  // ── WebSocket — dice game ─────────────────────────────────────
  // URL: VITE_API_BASE_URL (http → ws) + /dice/ws
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || ""
    const params  = new URLSearchParams()
    if (wsUserId) params.set("userId", wsUserId)
    const wsUrl = `${apiBase.replace(/^http(s?):/, "ws$1:")}/dice/ws?${params.toString()}`

    let mounted = true

    const connect = () => {
      if (!mounted) return
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)

          // Update roundId from every WS message
          if (msg.roundId) setRoundId(msg.roundId)

          // ── newRound: fresh round started ─────────────────────
          if (msg.type === "newRound") {
            setPhase("betting")
            setResultNum(null)
     
          }

          // ── tick: countdown update ────────────────────────────
          if (msg.type === "tick") {
            if (msg.autotime !== undefined) setCountdown(msg.autotime)
            // Only switch to betting if explicitly open
            if (msg.betOpen === true) setPhase("betting")
          }

          // ── rolling: start dice animation ─────────────────────
          if (msg.type === "rolling") {
            setPhase("rolling")
            setResultNum(null)
            setCountdown(0)
          }

          // ── result: show result + win animation if won ────────
          if (msg.type === "result") {
            const num = msg.result
            if (num) {
              lastResultRef.current = num
              lastRoundIdRef.current = msg.roundId

              // Check win — top-level won field OR betResults
              const won = msg.won === true
                || (msg.betResults
                  ? Object.values(msg.betResults as Record<string, any>).some(b => b.won === true)
                  : false)

              setResultNum(num)
              setIsWin(won)
              setPhase("result")
              playChime()
              if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current)
              resultTimeoutRef.current = setTimeout(() => {
                setResultNum(null)
                setIsWin(false)
                setPhase("betting")
              }, RESULT_MS)
            }
          }
          // ── betResult: personal win/loss notification ─────────
          if (msg.type === "betResult") {
            if (msg.won === true) {
              setIsWin(true)
              playChime()
              setTimeout(() => setIsWin(false), RESULT_MS)
            }
          }

        } catch (err) { /* ignore parse errors */ }
      }

      ws.onerror = () => { /* ignore */ }
      ws.onclose = () => {
        if (!mounted) return
        setTimeout(() => {
          if (mounted && wsRef.current?.readyState !== WebSocket.OPEN) connect()
        }, 3000)
      }
    }

    connect()
    return () => {
      mounted = false
      wsRef.current?.close()
      wsRef.current = null
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current)
    }
  }, [wsUserId])

  // Rolling sound effect when phase changes to rolling
  useEffect(() => {
    if (phase === "rolling") playTick()
  }, [phase])

  const handleBet = (nat: string) => {
    if (phase !== "betting") return
    getCtx()
    setBetSheet({ betOn: toBetOn(nat), label: nat })
    setStakeInput("")
  }

  const isBetting = phase === "betting"

  return (
    <>
      <BackBtn to="/casino-list" name="BACK TO CASINO MENU" />

      <div className="dice-container">

        {/* Header */}
        <div className="dice-header">
          <div className="dice-header-left">
            Dice Game<span className="dice-rules-link"> | Rules</span>
          </div>
          <button
            onClick={() => setSoundOn(v => !v)}
            title={soundOn ? "Mute sounds" : "Unmute sounds"}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8, padding: "4px 8px",
              fontSize: 16, cursor: "pointer", lineHeight: 1,
            }}
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
          <div className="dice-header-right" title={roundId}>
            {roundId ? roundId.replace("DICE", "#") : `#${history.length}`}
          </div>
        </div>

        {/* Dice 3D display — countdown overlay inside */}
        <div className={`dice-display ${phase === "result" ? "dice-display--result" : ""}`}>
          <div className="dice-display-inner">
            <Dice3D rolling={phase === "rolling"} resultNum={resultNum} lastResult={lastResultRef.current} />


          </div>
            {phase === "result" && isWin && (
              <div className="dice-win-overlay">
                <div className="dwo-pill">
                  <span className="dwo-cup">🏆</span>
                  <span className="dwo-text">YOU WIN!</span>
                </div>
              </div>
            )}
            {/* Centered countdown — scales each second, red at ≤5 */}
            {phase === "betting" && countdown > 0 && (
              <div className={`dice-cd-overlay ${countdown <= 5 ? "dice-cd-overlay--red" : ""}`}>
                <span key={countdown} className="dice-cd-num">{countdown}</span>
              </div>
            )}
        </div>

        {/* Result card */}
        {/* {phase === "result" && resultNum && (
          <div className={`dice-result-card ${resultNum % 2 === 0 ? "drc--even" : "drc--odd"}`}>
            <div className="drc-shine" />
            <div className="drc-left">
              <span className="drc-label">RESULT</span>
              <span className="drc-num">{resultNum}</span>
            </div>
            <div className="drc-right">
              <span className="drc-parity">{resultNum % 2 === 0 ? "EVEN" : "ODD"}</span>
              <span className="drc-sub">{resultNum % 2 === 0 ? "2 · 4 · 6" : "1 · 3 · 5"}</span>
            </div>
          </div>
        )} */}

        {/* Odd / Even */}
        <div className="dice-section">
          <div className="dice-oe-row">
            <div className="dice-oe-col">
              <button
                className={`dice-oe-btn dice-oe-odd ${!isBetting ? "dice-oe-btn--locked" : ""}`}
                onClick={() => handleBet("Odd")}
                disabled={!isBetting}
              >
                {!isBetting && <FaLock size={13} className="dice-lock-icon" />}
                <span className="dice-oe-label">ODD</span>
                <span className="dice-oe-nums">1 · 3 · 5</span>
                <span className="dice-oe-rate">0.95x</span>
              </button>
              {getPL("odd") !== null && (
                <div className={`dice-oe-pl ${(getPL("odd") ?? 0) >= 0 ? "dice-oe-pl--win" : "dice-oe-pl--loss"}`}>
                  {(getPL("odd") ?? 0) >= 0 ? "+" : ""}{getPL("odd")}
                </div>
              )}
            </div>

            <div className="dice-oe-col">
              <button
                className={`dice-oe-btn dice-oe-even ${!isBetting ? "dice-oe-btn--locked" : ""}`}
                onClick={() => handleBet("Even")}
                disabled={!isBetting}
              >
                {!isBetting && <FaLock size={13} className="dice-lock-icon" />}
                <span className="dice-oe-label">EVEN</span>
                <span className="dice-oe-nums">2 · 4 · 6</span>
                <span className="dice-oe-rate">0.95x</span>
              </button>
              {getPL("even") !== null && (
                <div className={`dice-oe-pl ${(getPL("even") ?? 0) >= 0 ? "dice-oe-pl--win" : "dice-oe-pl--loss"}`}>
                  {(getPL("even") ?? 0) >= 0 ? "+" : ""}{getPL("even")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Number bets 1–6 */}
        <div className="dice-section">
          <div className="dice-section-title">Number Bet</div>
          <div className="dice-num-row">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <button
                key={n}
                className={`dice-num-btn ${!isBetting ? "dice-num-btn--locked" : ""}`}
                onClick={() => handleBet(`Number ${n}`)}
                disabled={!isBetting}
              >
                <DiceFace num={n} size={46} />
                {!isBetting && (
                  <div className="dice-num-overlay">
                    <FaLock size={11} color="#fff" />
                  </div>
                )}
                <span className="dice-num-rate">5x</span>
                {getPL(String(n)) !== null && (
                  <span
                    className="dice-num-pl"
                    style={{ color: (getPL(String(n)) ?? 0) >= 0 ? "#10b981" : "#ef4444" }}
                  >
                    {(getPL(String(n)) ?? 0) >= 0 ? "+" : ""}{getPL(String(n))}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="dice-min-max">Min: 100 &nbsp;|&nbsp; Max: 10000</div>
        </div>

        {/* History */}
        <div className="dice-history">
          <div className="dice-history-label">Last Results</div>
          <div className="dice-history-dots">
            {history.map((n, i) => (
              <div key={i} className={`dice-history-dot ${n % 2 === 0 ? "dice-dot-even" : "dice-dot-odd"}`}>
                {n}
              </div>
            ))}
            {history.length === 0 && <span className="dice-no-history">No history yet</span>}
          </div>
        </div>

        {/* Open Bets */}
        <div className="dice-open-bets">
          {/* Tabs */}
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

          <div className="dice-open-bets-wrapper">
            <table className="dice-open-bets-table">
              <thead>
                <tr>
                  <th>#</th><th>Bet On</th><th>Type</th>
                  <th>Stake</th><th>Odds</th><th>Pot.Win</th>
                  <th>P/L</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const bets = betsTab === "open" ? openBets : completedBets
                  if (!bets.length) return (
                    <tr><td colSpan={8} className="dice-no-bets">No bets found</td></tr>
                  )
                  return bets.map((bet: any, idx: number) => (
                    <tr key={bet._id ?? idx}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 700 }}>{bet.betOn ?? "N/A"}</td>
                      <td style={{ textTransform: "capitalize" }}>{bet.betType ?? "-"}</td>
                      <td>₹{bet.stake ?? "0"}</td>
                      <td>{bet.odds ?? "0"}x</td>
                      <td className="dice-profit">₹{bet.potentialWin ?? "0"}</td>
                      <td className={bet.profitLoss > 0 ? "dice-profit" : bet.profitLoss < 0 ? "dice-loss" : ""}>
                        {bet.profitLoss > 0 ? `+${bet.profitLoss}` : bet.profitLoss < 0 ? bet.profitLoss : "-"}
                      </td>
                      <td>
                        <span className={`dice-badge ${
                          bet.status === "won"  ? "dice-badge-win"
                          : bet.status === "lost" ? "dice-badge-loss"
                          : "dice-badge-pending"
                        }`}>{bet.status ?? "Pending"}</span>
                      </td>
                    </tr>
                  ))
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dice Bet Sheet */}
      {betSheet && (
        <div className="dbs-overlay" onClick={() => { setBetSheet(null); setStakeInput("") }}>
          <div className="dbs-sheet" onClick={e => e.stopPropagation()}>
            <div className="dbs-handle" />
            <div className="dbs-toprow">
              <span className="dbs-label">{betSheet.label}</span>
              <span className="dbs-timer">{countdown}s</span>
            </div>
            <div className="dbs-input-row">
              <span className="dbs-rupee">₹</span>
              <input
                className="dbs-input"
                type="number"
                value={stakeInput}
                onChange={e => setStakeInput(e.target.value)}
                placeholder="Enter stake"
              />
              <button className="dbs-clear" onClick={() => setStakeInput("")}>C</button>
            </div>
            <div className="dbs-chips">
              {[100, 500, 1000, 2000, 5000, 10000].map(v => (
                <button key={v} className={`dbs-chip ${stakeInput === String(v) ? "dbs-chip--active" : ""}`}
                  onClick={() => setStakeInput(String(v))}>
                  {v >= 1000 ? `${v/1000}K` : v}
                </button>
              ))}
            </div>
            <div className="dbs-actions">
              <button className="dbs-cancel" onClick={() => { setBetSheet(null); setStakeInput("") }}>Cancel</button>
              <button className="dbs-submit" onClick={handlePlaceDiceBet} disabled={isBetting2 || !stakeInput}>
                {isBetting2 ? "Placing..." : "Place Bet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DiceGame
