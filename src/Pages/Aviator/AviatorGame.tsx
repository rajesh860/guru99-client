import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import snackbarUtil from "../../utils/Snackbar"
import {
  useAviatorPlaceBetMutation,
  useAviatorCashoutMutation,
  useAviatorResultsQuery,
  useAviatorPendingBetsQuery,
  useAviatorCompletedBetsQuery,
} from "../../../store/service/userServices/userServices"
import "../../Component/casinoDetail/Dice/DiceGame.scss"
import "./AviatorGame.scss"

type Phase = "waiting" | "flying" | "crashed"
const RESULT_MS = 3000
const CHART_W   = 360
const CHART_H   = 220
const MARGIN_L  = 44
const MARGIN_B  = 24

function multToY(m: number, maxM: number): number {
  const ratio = Math.max(0, Math.min(1, (m - 1) / Math.max(maxM - 1, 1)))
  return CHART_H - ratio * (CHART_H - 10)
}
function timeToX(t: number, maxT: number): number {
  return Math.min((t / Math.max(maxT, 1)) * CHART_W, CHART_W)
}

const AviatorGame = () => {
  const navigate = useNavigate()
  const [phase, setPhase]       = useState<Phase>("waiting")
  const [multiplier, setMult]   = useState(1.0)
  const [countdown, setCD]      = useState(5)
  const [cdMax]                 = useState(5)
  const [crashAt, setCrashAt]   = useState<number | null>(null)
  const [history, setHistory]   = useState<number[]>([])
  const [roundId, setRoundId]   = useState("")
  const [pathD, setPathD]       = useState("")
  const [dotPos, setDotPos]     = useState({ x: MARGIN_L, y: CHART_H })
  const [maxMult, setMaxMult]   = useState(2)
  const [chartMaxT, setChartMaxT] = useState(8)
  const [betOpen, setBetOpen]   = useState(false)

  // Two bet panels
  const [bets, setBets] = useState([
    { stake: "500", auto: false, autoCO: "2", placed: false, cashedOut: null as number | null, betId: null as string | null },
    { stake: "500", auto: false, autoCO: "2", placed: false, cashedOut: null as number | null, betId: null as string | null },
  ])

  const [placeBet]  = useAviatorPlaceBetMutation()
  const [doCashout] = useAviatorCashoutMutation()
  const { data: resultsData, refetch: refetchResults } = useAviatorResultsQuery()
  const { data: pendingBetsData, refetch: refetchPending }     = useAviatorPendingBetsQuery()
  const { data: completedBetsData, refetch: refetchCompleted } = useAviatorCompletedBetsQuery()
  const [betsTab, setBetsTab]    = useState<"pending"|"completed">("pending")

  const wsRef          = useRef<WebSocket | null>(null)
  const mountedRef     = useRef(true)
  const animRef        = useRef<number | null>(null)
  const startRef       = useRef(0)
  const crashRef       = useRef(1.0)
  const resultTRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const multRef        = useRef(1.0)
  const betsRef        = useRef(bets)
  const doCashoutRef   = useRef(doCashout)
  const roundIdRef     = useRef(roundId)
  const autoCashingOut = useRef<Set<string>>(new Set())

  // Keep refs in sync so rAF loop can access latest values without stale closures
  betsRef.current      = bets
  doCashoutRef.current = doCashout
  roundIdRef.current   = roundId

  const stopAnim = () => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null }
  }

  // Smooth path — generate 50 mathematically precise points along exact formula
  const buildPath = (elapsed: number, maxT: number, maxM: number) => {
    if (elapsed <= 0) return ""
    const N = 50
    const coords: { x: number; y: number }[] = []
    for (let i = 0; i <= N; i++) {
      const t = (elapsed * i) / N
      const m = Math.pow(Math.E, 0.07 * t)
      coords.push({ x: MARGIN_L + timeToX(t, maxT), y: multToY(m, maxM) })
    }
    let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`
    for (let i = 1; i < coords.length; i++) {
      const p0 = coords[Math.max(i - 2, 0)]
      const p1 = coords[i - 1]
      const p2 = coords[i]
      const p3 = coords[Math.min(i + 1, coords.length - 1)]
      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6
      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
    }
    return d
  }

  const updateChart = (elapsed: number, maxT: number, maxM: number) => {
    setPathD(buildPath(elapsed, maxT, maxM))
    const x = MARGIN_L + timeToX(elapsed, maxT)
    const y = multToY(Math.pow(Math.E, 0.07 * elapsed), maxM)
    setDotPos({ x, y })
    setChartMaxT(maxT)
  }

  // Chart-only animation loop — multiplier is driven by server ticks
  const startFlying = () => {
    let lastChartUpdate = 0
    const loop = () => {
      if (!mountedRef.current) return
      const t = (Date.now() - startRef.current) / 1000
      const now = Date.now()
      if (now - lastChartUpdate >= 60) {
        lastChartUpdate = now
        const m    = multRef.current
        const maxT = Math.max(t / 0.72, 8)
        const maxM = Math.max(m * 1.4, 2)
        setMaxMult(maxM)
        updateChart(t, maxT, maxM)
      }
      // Auto cashout — call API with betId, guard with Set to avoid duplicate calls
      betsRef.current.forEach((b, i) => {
        if (
          b.placed && !b.cashedOut && b.betId && b.auto &&
          !autoCashingOut.current.has(b.betId) &&
          b.autoCO && parseFloat(b.autoCO) > 1 &&
          multRef.current >= parseFloat(b.autoCO)
        ) {
          const target = parseFloat(b.autoCO)
          autoCashingOut.current.add(b.betId)
          doCashoutRef.current({ betId: b.betId, roundId: roundIdRef.current })
            .unwrap()
            .then(() => {
              snackbarUtil.success(`Auto cashed out @ ${target}x!`)
              setBets(prev => prev.map((x, j) => j === i ? { ...x, cashedOut: target, placed: false, betId: null } : x))
            })
            .catch(() => { autoCashingOut.current.delete(b.betId!) })
        }
      })
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
  }

  // Demo fallback when server is unreachable
  const runDemo = () => {
    if (!mountedRef.current) return
    setPhase("waiting"); setMult(1.0); setCrashAt(null)
    setPathD(""); setDotPos({ x: MARGIN_L, y: CHART_H })
    setBets(prev => prev.map(b => ({ ...b, cashedOut: null })))
    let cd = 5; setCD(cd)
    const iv = setInterval(() => {
      cd -= 1; setCD(cd)
      if (cd <= 0) {
        clearInterval(iv)
        if (!mountedRef.current) return
        crashRef.current = parseFloat((1.2 + Math.random() * 8.8).toFixed(2))
        multRef.current = 1.0
        setPhase("flying"); setCD(0)
        startRef.current = Date.now()
        // Drive multiplier locally in demo mode
        const demoLoop = () => {
          if (!mountedRef.current) return
          const t = (Date.now() - startRef.current) / 1000
          const m = parseFloat(Math.pow(Math.E, 0.07 * t).toFixed(2))
          multRef.current = m; setMult(m)
          if (m < crashRef.current) { requestAnimationFrame(demoLoop) }
          else {
            const final = parseFloat(crashRef.current.toFixed(2))
            setMult(final); setCrashAt(final); setPhase("crashed")
            setHistory(prev => [final, ...prev].slice(0, 10))
            setBets(prev => prev.map(b => ({ ...b, placed: false })))
            stopAnim()
            resultTRef.current = setTimeout(() => { if (mountedRef.current) runDemo() }, RESULT_MS)
          }
        }
        stopAnim(); animRef.current = requestAnimationFrame(demoLoop)
      }
    }, 1000)
  }

  useEffect(() => {
    mountedRef.current = true
    const wsBase = import.meta.env.VITE_WS_BASE_URL || import.meta.env.VITE_API_BASE_URL?.replace(/^http(s?):/, "ws$1:") || ""
    const token  = localStorage.getItem("client-token") || ""
    const wsUrl  = `${wsBase}/api/aviator/ws?token=${token}`

    const connect = () => {
      if (!mountedRef.current) return
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)

          // ── init: server sends current state on connect ──
          if (msg.type === "init") {
            if (msg.roundId) setRoundId(msg.roundId)
            if (msg.lastResults?.length) refetchResults()
            if (msg.status === "betting") {
              setPhase("waiting"); setMult(1.0); setCrashAt(null)
              setCD(msg.autotime ?? 5); setBetOpen(msg.betOpen === true)
              stopAnim(); setPathD(""); setDotPos({ x: MARGIN_L, y: CHART_H })
              setBets(prev => prev.map(b => ({ ...b, cashedOut: null })))
            } else if (msg.status === "flying") {
              const m = parseFloat(msg.multiplier ?? 1)
              multRef.current = m; crashRef.current = 999
              setMult(m); setPhase("flying")
              // Estimate start time from current multiplier: t = ln(m) / 0.07
              startRef.current = Date.now() - (Math.log(Math.max(m, 1.0001)) / 0.07) * 1000
              if (!animRef.current) startFlying()
            }
          }

          // ── newRound: reset for betting phase ──
          if (msg.type === "newRound") {
            if (msg.roundId) setRoundId(msg.roundId)
            setPhase("waiting"); setMult(1.0); setCrashAt(null)
            setBetOpen(false)
            setPathD(""); setDotPos({ x: MARGIN_L, y: CHART_H })
            setBets(prev => prev.map(b => ({ ...b, placed: false, cashedOut: null, betId: null })))
            autoCashingOut.current.clear()
            stopAnim()
          }

          // ── tick: betting countdown OR flying multiplier ──
          if (msg.type === "tick") {
            if (msg.roundId) setRoundId(msg.roundId)
            if (msg.betOpen !== undefined) setBetOpen(msg.betOpen)
            if (msg.status === "betting") {
              setCD(msg.autotime ?? 0)
            } else if (msg.multiplier !== undefined) {
              // flying phase — server-authoritative multiplier
              const m = parseFloat(msg.multiplier)
              multRef.current = m; setMult(m)
            }
            // sync active bet from server (handles reconnect / page refresh)
            if (msg.myBet?.betId) {
              setBets(prev => {
                const alreadySynced = prev.some(b => b.betId === msg.myBet.betId)
                if (alreadySynced) return prev
                // assign to first unplaced panel
                const idx = prev.findIndex(b => !b.placed)
                if (idx === -1) return prev
                return prev.map((b, i) => i === idx ? { ...b, placed: true, betId: msg.myBet.betId } : b)
              })
            }
          }

          // ── flying: betting closed, plane takes off ──
          if (msg.type === "flying") {
            if (msg.roundId) setRoundId(msg.roundId)
            crashRef.current = 999; multRef.current = 1.0
            setPhase("flying"); setMult(1.0); setCrashAt(null)
            setBetOpen(false)
            startRef.current = Date.now()
            setPathD(""); setDotPos({ x: MARGIN_L, y: CHART_H })
            stopAnim(); startFlying()
          }

          // ── crashed: plane crashed ──
          if (msg.type === "crashed") {
            const cp = parseFloat((msg.crashPoint ?? msg.multiplier ?? 1).toFixed(2))
            multRef.current = cp; crashRef.current = cp
            setMult(cp); setCrashAt(cp); setPhase("crashed")
            setBets(prev => prev.map(b => ({ ...b, placed: false, betId: null, cashedOut: null })))
            stopAnim()
            refetchResults()
          }

          // ── cashedout: this user's cashout confirmed ──
          if (msg.type === "cashedout") {
            const profit = msg.profit ?? msg.profitLoss ?? 0
            snackbarUtil.success(`✅ Cashed out @ ${msg.multiplier}x! You won ₹${profit}`)
            setBets(prev => prev.map(b =>
              b.placed ? { ...b, cashedOut: parseFloat(msg.multiplier), placed: false, betId: null } : b
            ))
          }
        } catch {}
      }

      ws.onclose = () => { if (mountedRef.current) setTimeout(connect, 3000) }
      ws.onerror = () => {}
    }

    connect()
    // Fallback demo if WS fails to connect within 3s
    const t = setTimeout(() => {
      if (mountedRef.current && wsRef.current?.readyState !== WebSocket.OPEN) runDemo()
    }, 3000)

    return () => {
      mountedRef.current = false
      wsRef.current?.close()
      stopAnim()
      clearTimeout(t)
      if (resultTRef.current) clearTimeout(resultTRef.current)
    }
  }, [])

  // Seed history from results API on load
  useEffect(() => {
    const list: any[] = resultsData?.data ?? []
    if (list.length) {
      setHistory(list.map((r: any) => parseFloat(r.crashPoint)))
    }
  }, [resultsData])

  const handleBet = async (idx: number) => {
    const b = bets[idx]
    if (!b.stake || parseFloat(b.stake) <= 0) { snackbarUtil.error("Enter valid stake"); return }
    if (!betOpen) { snackbarUtil.error("Betting is closed"); return }
    try {
      const body: { stake: number; roundId: string; autoCashout?: number } = { stake: parseFloat(b.stake), roundId }
      if (b.auto && b.autoCO && parseFloat(b.autoCO) > 1) body.autoCashout = parseFloat(b.autoCO)
      const res = await placeBet(body).unwrap()
      const betId = res?.data?.betId ?? res?.data?._id ?? res?._id ?? null
      setBets(prev => prev.map((x, i) => i === idx ? { ...x, placed: true, betId } : x))
      snackbarUtil.success("Bet placed!")
    } catch (err: any) {
      snackbarUtil.error(err?.data?.message ?? "Bet failed")
    }
  }

  const handleCashOut = async (idx: number) => {
    const b = bets[idx]
    if (!b.placed || phase !== "flying" || b.cashedOut) return
    try {
      if (b.betId) await doCashout({ betId: b.betId, roundId }).unwrap()
      setBets(prev => prev.map((x, i) => i === idx ? { ...x, cashedOut: multRef.current, placed: false } : x))
      snackbarUtil.success(`Cashed out @ ${multRef.current.toFixed(2)}x!`)
    } catch (err: any) {
      snackbarUtil.error(err?.data?.message ?? "Cashout failed")
    }
  }

  const multColor = phase === "crashed" ? "#ef4444"
    : multiplier >= 10 ? "#ec4899"
    : multiplier >= 5  ? "#f59e0b"
    : multiplier >= 2  ? "#10b981"
    : "#ffffff"

  const yLabels = (() => {
    const top = maxMult
    // Auto-scale step so we always get ~5-7 labels no matter how high the multiplier
    const rawStep = (top - 1) / 6
    const step = rawStep <= 0.2 ? 0.2
      : rawStep <= 0.5 ? 0.5
      : rawStep <= 1   ? 1
      : rawStep <= 2   ? 2
      : rawStep <= 5   ? 5
      : rawStep <= 10  ? 10
      : rawStep <= 25  ? 25
      : 50
    const labels: number[] = []
    let v = 1.0
    while (v <= top * 1.02) { labels.push(parseFloat(v.toFixed(step < 1 ? 1 : 0))); v += step }
    return labels.slice(0, 8)
  })()

  const xLabels = (() => {
    const rawStep = chartMaxT / 5
    const step = rawStep <= 5 ? 5 : rawStep <= 10 ? 10 : rawStep <= 20 ? 20 : rawStep <= 30 ? 30 : 60
    const labels: number[] = []
    for (let v = 0; v <= chartMaxT + 0.1; v += step) labels.push(v)
    return labels
  })()

  return (
    <div className="av2-container">

      {/* Header */}
      <div className="av2-header">
        <button className="av2-back" onClick={() => navigate("/main")}>‹ Back</button>
        <div className="av2-hist">
          {history.map((v, i) => (
            <span key={i} className={`av2-hpill ${v >= 2 ? "av2-hp-g" : v >= 1.5 ? "av2-hp-y" : "av2-hp-r"}`}>
              {v.toFixed(2)}x
            </span>
          ))}
        </div>
      </div>

      {/* Title bar — game name + round id */}
      <div className="av2-mybets-bar av2-title-bar">
        <span className="av2-title">Aviator</span>
        {roundId && <span className="av2-title-round">#{roundId}</span>}
      </div>

      {/* Game canvas */}
      <div className="av2-game">
        {/* Ray background */}
        <div className="av2-rays" />

        {/* Chart */}
        {phase === "flying" && (
          <svg className="av2-svg" viewBox={`0 0 ${MARGIN_L + CHART_W + 10} ${CHART_H + MARGIN_B}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="flyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(239,68,68,0.35)" />
                <stop offset="100%" stopColor="rgba(239,68,68,0.05)" />
              </linearGradient>
            </defs>
            {yLabels.map(v => {
              const y = multToY(v, maxMult)
              return (
                <g key={v}>
                  <line x1={MARGIN_L} y1={y} x2={MARGIN_L + CHART_W} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
                  <text x={MARGIN_L - 2} y={y + 3} fontSize="6.5" fill="rgba(255,255,255,0.35)" textAnchor="end">{v % 1 === 0 ? `${v}x` : `${v.toFixed(1)}x`}</text>
                </g>
              )
            })}
            {/* X-axis time labels */}
            {xLabels.map(v => {
              const x = MARGIN_L + timeToX(v, chartMaxT)
              return (
                <g key={v}>
                  <line x1={x} y1={0} x2={x} y2={CHART_H} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="3,3" />
                  <text x={x} y={CHART_H + 15} fontSize="6.5" fill="rgba(255,255,255,0.35)" textAnchor="middle">{v}s</text>
                </g>
              )
            })}
            {/* Red fill under the curve */}
            {pathD && (
              <path
                d={`${pathD} L ${dotPos.x} ${CHART_H} L ${MARGIN_L} ${CHART_H} Z`}
                fill="url(#flyFill)"
              />
            )}
            {/* Green curve line */}
            {pathD && (
              <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
{/* dot removed — plane tail sits at curve tip */}
          </svg>
        )}

        {/* Crash fill */}
        {phase === "crashed" && pathD && (
          <svg className="av2-svg av2-svg-crash" viewBox={`0 0 ${MARGIN_L + CHART_W + 10} ${CHART_H + MARGIN_B}`} preserveAspectRatio="none">
            {xLabels.map(v => {
              const x = MARGIN_L + timeToX(v, chartMaxT)
              return (
                <g key={v}>
                  <line x1={x} y1={0} x2={x} y2={CHART_H} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="3,3" />
                  <text x={x} y={CHART_H + 15} fontSize="6.5" fill="rgba(255,255,255,0.35)" textAnchor="middle">{v}s</text>
                </g>
              )
            })}
            <path d={`${pathD} L ${dotPos.x} ${CHART_H} L ${MARGIN_L} ${CHART_H} Z`} fill="rgba(239,68,68,0.18)" />
            <path d={pathD} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={dotPos.x} cy={dotPos.y} r="3" fill="#ef4444" />
          </svg>
        )}

        {/* Plane + exhaust trail */}
        {phase === "flying" && (
          <>
            {/* Exhaust particles — render behind plane */}
            {(() => {
              const pctX = dotPos.x / (MARGIN_L + CHART_W + 10) * 100
              // +3.57 accounts for the 10px top gap on the SVG (10/280*100)
              const pctY = dotPos.y / (CHART_H + MARGIN_B) * (270 / 280) * 100 + (10 / 280) * 100
              return (
                <>
                  <div className="av2-exhaust" style={{ left: `${pctX}%`, top: `${pctY}%` }}>
                    {[0,1,2,3,4,5].map(i => <span key={i} />)}
                  </div>
                  <img
                    src="/img/aviator.png"
                    alt="plane"
                    className="av2-plane"
                    style={{ left: `${pctX}%`, top: `${pctY}%` }}
                  />
                </>
              )
            })()}
          </>
        )}

        {/* Multiplier center */}
        {phase !== "waiting" && (
          <div className="av2-mult-wrap">
            {phase === "crashed" && <div className="av2-flew">FLEW AWAY!</div>}
            <div className="av2-mult" style={{ color: multColor }}>
              {phase === "crashed" ? crashAt?.toFixed(2) : multiplier.toFixed(2)}x
            </div>
          </div>
        )}

        {/* Countdown */}
        {phase === "waiting" && (
          <div className="av2-cd-card">
            <div className="av2-cd-logo">✈ Aviator</div>
            <div className="av2-cd-txt">Round starting in</div>
            <div className="av2-cd-num">{countdown}s</div>
            <div className="av2-cd-bar">
              <div className="av2-cd-fill" style={{ width: `${(countdown / cdMax) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Bet panels — only first panel shown */}
      {bets.slice(0, 1).map((b, idx) => (
        <div key={idx} className="av2-panel">
          {/* Amount row */}
          <div className="av2-panel-row">
            <div className="av2-amt-row">
              <button className="av2-pm" onClick={() => setBets(prev => prev.map((x, i) => i === idx ? { ...x, stake: String(Math.max(100, parseFloat(x.stake || "0") - 100)) } : x))}>−</button>
              <span className="av2-amt-val">{b.stake}</span>
              <button className="av2-pm" onClick={() => setBets(prev => prev.map((x, i) => i === idx ? { ...x, stake: String(parseFloat(x.stake || "0") + 100) } : x))}>+</button>
            </div>
            <button
              className={`av2-play-btn ${b.placed ? "av2-play-btn--wait" : ""} ${phase === "flying" && b.placed && !b.cashedOut ? "av2-play-btn--cashout" : ""} ${!betOpen && !(phase === "flying" && b.placed && !b.cashedOut) ? "av2-play-btn--locked" : ""}`}
              onClick={() => {
                if (phase === "flying" && b.placed && !b.cashedOut) handleCashOut(idx)
                else if (!b.placed) handleBet(idx)
              }}
              disabled={!betOpen && !(phase === "flying" && b.placed && !b.cashedOut)}
            >
              {!betOpen && !(phase === "flying" && b.placed && !b.cashedOut)
                ? <><div>🔒</div><div style={{ fontSize: 11 }}>Betting Closed</div></>
                : phase === "flying" && b.placed && !b.cashedOut
                ? <><div className="av2-co-win">₹{Math.floor(parseFloat(b.stake) * multiplier)}</div><div className="av2-co-mult">Cash Out @ {multiplier.toFixed(2)}x</div></>
                : b.placed
                ? <><div>Wait for the</div><div>next round!</div></>
                : <><div>Play</div><div>₹{b.stake}</div></>
              }
            </button>
          </div>

          {/* Quick amounts */}
          <div className="av2-quick">
            {[100, 200, 500, 1000, 2000, 5000, 10000].map(v => (
              <button key={v} className="av2-q" onClick={() => setBets(prev => prev.map((x, i) => i === idx ? { ...x, stake: String(v) } : x))} disabled={b.placed}>
                ₹{v >= 1000 ? `${v/1000}K` : v}
              </button>
            ))}
          </div>

          {/* Auto row */}
          <div className="av2-auto-row">
            <button className={`av2-autobet ${b.auto ? "av2-autobet--on" : ""}`}
              onClick={() => setBets(prev => prev.map((x, i) => i === idx ? { ...x, auto: !x.auto } : x))}>
              Auto Bet {b.auto ? "ON" : "OFF"}
            </button>
            <input className="av2-co-input" type="number" value={b.autoCO} min="1.01" step="0.1" placeholder="Auto x"
              onChange={e => setBets(prev => prev.map((x, i) => i === idx ? { ...x, autoCO: e.target.value } : x))} />
          </div>
        </div>
      ))}

      {/* Open Bets / Completed — inline, matching other casino games */}
      <div className="dice-open-bets">
        <div className="dice-bets-tabs">
          <button
            className={`dbt ${betsTab === "pending" ? "dbt--active" : ""}`}
            onClick={() => { setBetsTab("pending"); refetchPending() }}
          >Open Bets</button>
          <button
            className={`dbt ${betsTab === "completed" ? "dbt--active" : ""}`}
            onClick={() => { setBetsTab("completed"); refetchCompleted() }}
          >Completed</button>
        </div>

        <div className="dice-open-bets-wrapper">
          <table className="dice-open-bets-table">
            <thead>
              <tr>
                <th>Round</th><th>Stake</th><th>Cashout</th><th>P/L</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const list = betsTab === "pending"
                  ? (pendingBetsData?.data ?? pendingBetsData?.bets ?? [])
                  : (completedBetsData?.data ?? completedBetsData?.bets ?? [])
                if (!list.length) return (
                  <tr><td className="dice-no-bets" colSpan={5}>No bets found</td></tr>
                )
                return list.map((b: any, i: number) => (
                  <tr key={i}>
                    <td style={{ fontFamily: "monospace" }}>{(b.roundId ?? "—").slice(-8)}</td>
                    <td>₹{b.stake}</td>
                    <td>{b.autoCashout ? `${b.autoCashout}x` : "—"}</td>
                    <td className={b.profitLoss > 0 ? "dice-profit" : b.profitLoss < 0 ? "dice-loss" : ""}>
                      {b.profitLoss ?? "—"}
                    </td>
                    <td>
                      <span className={`dice-badge ${
                        b.status === "won" ? "dice-badge-win"
                        : b.status === "lost" ? "dice-badge-loss"
                        : "dice-badge-pending"
                      }`}>{b.status ?? "pending"}</span>
                    </td>
                  </tr>
                ))
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AviatorGame
