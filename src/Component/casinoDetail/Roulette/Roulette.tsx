import { useCallback, useEffect, useRef, useState } from "react"
import gsap from "gsap"
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
  useGetMyRoundBetsQuery,
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
  { nat: "1 to 12",  label: "1st 12", display: "1 — 12"  },
  { nat: "13 to 24", label: "2nd 12", display: "13 — 24" },
  { nat: "25 to 36", label: "3rd 12", display: "25 — 36" },
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
              <g style={{
                transform: isResult ? "scale(1.1)" : "scale(1)",
                transformOrigin: "0 0",
                transition: "transform 0.4s ease, filter 0.4s ease",
                filter: isResult
                  ? "brightness(1.8) drop-shadow(0 0 5px rgba(255,215,0,0.95))"
                  : "none",
              }}>
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
  const [wsRoundId,  setWsRoundId]  = useState("")
  const [phase,      setPhase]      = useState<"betting" | "spinning" | "result">("betting")
  const wsRef         = useRef<WebSocket | null>(null)
  const cdRef         = useRef<ReturnType<typeof setInterval> | null>(null)
  const wheelRef      = useRef<SVGSVGElement>(null)

  const gsapTlRef     = useRef<any>(null)
  const resultTimeRef = useRef(0)

  // ── Audio ────────────────────────────────────────────────────────────────
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem("game-sound") !== "0")
  const soundOnRef = useRef(soundOn)
  useEffect(() => { soundOnRef.current = soundOn; localStorage.setItem("game-sound", soundOn ? "1" : "0") }, [soundOn])
  const audioCtxRef    = useRef<AudioContext | null>(null)
  const spinSrcRef     = useRef<AudioBufferSourceNode | null>(null)
  const spinGainRef    = useRef<GainNode | null>(null)
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopSpinSound = useCallback(() => { // always stop regardless of soundOn
    if (tickIntervalRef.current) { clearInterval(tickIntervalRef.current); tickIntervalRef.current = null }
    const ctx = audioCtxRef.current
    if (!ctx || !spinGainRef.current) return
    spinGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.4)
    setTimeout(() => { try { spinSrcRef.current?.stop() } catch { /* already stopped */ } spinSrcRef.current = null }, 1500)
  }, [])

  const playSpinSound = useCallback(() => {
    if (!soundOnRef.current) return
    if (tickIntervalRef.current) { clearInterval(tickIntervalRef.current); tickIntervalRef.current = null }
    const ctx = (() => {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      return audioCtxRef.current
    })()

    const sr  = ctx.sampleRate
    const buf = ctx.createBuffer(1, sr * 3, sr)
    const d   = buf.getChannelData(0)
    let last = 0
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1
      d[i] = last = (last + 0.02 * w) / 1.02 * 3.5
    }
    const src = ctx.createBufferSource()
    src.buffer = buf; src.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = "bandpass"; filter.frequency.value = 160; filter.Q.value = 0.7

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.6)

    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination)
    src.start()
    spinSrcRef.current = src; spinGainRef.current = gain

    let interval = 80
    const tick = () => {
      const c = audioCtxRef.current!
      const osc = c.createOscillator(); const g = c.createGain()
      osc.connect(g); g.connect(c.destination)
      osc.type = "square"; osc.frequency.value = 900 + Math.random() * 200
      g.gain.setValueAtTime(0.25, c.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04)
      osc.start(c.currentTime); osc.stop(c.currentTime + 0.04)
    }
    const runTick = () => {
      tick()
      interval = Math.min(interval * 1.07, 600)
      tickIntervalRef.current = setTimeout(runTick, interval) as any
    }
    runTick()
  }, [])

  const playResultSound = useCallback((win: boolean) => {
    if (!soundOnRef.current) return
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    const ctx = audioCtxRef.current
    if (win) {
      ;[523, 659, 784, 1047].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const g = ctx.createGain()
        osc.connect(g); g.connect(ctx.destination)
        osc.type = "sine"; osc.frequency.value = freq
        const t = ctx.currentTime + i * 0.12
        g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
        osc.start(t); osc.stop(t + 0.35)
      })
    } else {
      ;[440, 330].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const g = ctx.createGain()
        osc.connect(g); g.connect(ctx.destination)
        osc.type = "sine"; osc.frequency.value = freq
        const t = ctx.currentTime + i * 0.18
        g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
        osc.start(t); osc.stop(t + 0.3)
      })
    }
  }, [])

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

  const _roundId = wsRoundId || currentRound?.data?.roundId || currentRound?.roundId || ""
  const { data: myRoundBetsData } =
    useGetMyRoundBetsQuery(_roundId, {
      skip: !_roundId,
      pollingInterval: 3000,
    })

  const [placeBet, { isLoading: isBetting }] = usePlaceRouletteBetMutation()

  const roundId: string = wsRoundId || currentRound?.data?.roundId || currentRound?.roundId || "—"
  const isSuspended     = phase !== "betting"
  const history         = resultsData?.data ?? resultsData?.results ?? []
  const openBets: any[]      = pendingData?.data  ?? pendingData?.bets ?? []
  const completedBets: any[] = completedData?.data ?? completedData?.bets ?? []

  const lastResult  = wsResult ?? (history.length > 0 ? history[0] : null)

  const roundBets: any[] = myRoundBetsData?.data ?? []
  const roundOutcomes: any[] = myRoundBetsData?.outcomes ?? []

  // betOn (lowercase) → stake — to know which buttons have active bets
  const betsMap: Record<string, number> = roundBets.reduce((acc: Record<string, number>, b: any) => {
    const k = String(b.betOn ?? '').toLowerCase()
    if (k) acc[k] = (acc[k] || 0) + (b.stake || 0)
    return acc
  }, {})

  // outcome label (lowercase) → netPL — from API outcomes array
  const plMap: Record<string, number> = roundOutcomes.reduce((acc: Record<string, number>, o: any) => {
    if (o.label != null) acc[String(o.label).toLowerCase()] = Number(o.netPL)
    return acc
  }, {})

  // Latest-ref pattern — lets WS closure read current values without re-subscribing
  const plMapRef       = useRef(plMap)
  const roundBetsRef   = useRef(roundBets)
  const refetchResultsRef = useRef(refetchResults)
  const refetchPendingRef = useRef(refetchPending)
  const tokenRef       = useRef(token)
  useEffect(() => { plMapRef.current = plMap })
  useEffect(() => { roundBetsRef.current = roundBets })
  useEffect(() => { refetchResultsRef.current = refetchResults })
  useEffect(() => { refetchPendingRef.current = refetchPending })
  useEffect(() => { tokenRef.current = token })

  const fmtPL = (pl: number): string => {
    const abs = Math.abs(pl) >= 1000
      ? `${(Math.abs(pl) / 1000).toFixed(1).replace(/\.0$/, '')}K`
      : String(Math.abs(pl))
    return pl >= 0 ? `+${abs}` : `-${abs}`
  }

  // ── WebSocket ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mongoId) return
    const base = (import.meta.env.VITE_WS_BASE_URL ?? "wss://guru99.co")
      .replace(/^http/, "ws")
    const url = `${base}/api/roulette/ws?userId=${mongoId}&token=${tokenRef.current}`

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
            playSpinSound()
            if (cdRef.current) clearInterval(cdRef.current)
            const secs = parseInt(msg.spinningLeft ?? "0")
            if (secs > 0) startCountdown(secs)
            else setCountdown(0)
          }

          // ── result / betResult: round result ───────────────
          if (type === "result" || type === "betResult") {
            const hasWin = roundBetsRef.current.some((b: any) =>
              (plMapRef.current[String(b.betOn ?? '').toLowerCase()] ?? 0) > 0
            )
            stopSpinSound()
            playResultSound(hasWin)
            if (msg.result !== null && msg.result !== undefined) {
              const entry = { result: msg.result, color: msg.color ?? "black" }
              setWsResult(entry)
            }
            resultTimeRef.current = Date.now()
            setPhase("result")
            if (cdRef.current) clearInterval(cdRef.current)
            setCountdown(0)
            refetchResultsRef.current()
          }

          // ── settled: bets settled ───────────────────────────
          if (type === "settled") {
            refetchPendingRef.current()
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
  }, [mongoId, playSpinSound, stopSpinSound, playResultSound])

  // ── Countdown from REST fallback ─────────────────────────────────────────
  useEffect(() => {
    const secs = parseInt(currentRound?.data?.timeLeft ?? currentRound?.timeLeft ?? "0")
    if (!secs || secs <= 0) return
    setCountdown(secs)
  }, [currentRound])

  // ── GSAP cleanup on unmount ───────────────────────────────────────────────
  useEffect(() => {
    const el = wheelRef.current
    return () => {
      if (gsapTlRef.current) gsapTlRef.current.kill()
      gsap.killTweensOf([el])
    }
  }, [])

  // ── Wheel animation ───────────────────────────────────────────────────────
  useEffect(() => {
    const el = wheelRef.current
    if (!el) return

    if (phase === "betting") {
      if (gsapTlRef.current) { gsapTlRef.current.kill(); gsapTlRef.current = null }
      gsap.killTweensOf([el])
      return
    }

    if (phase === "spinning") {
      if (gsapTlRef.current) { gsapTlRef.current.kill(); gsapTlRef.current = null }
      const wRot = (gsap.getProperty(el, "rotation") as number) || 0
      gsap.killTweensOf([el])
      gsap.to(el, { rotation: wRot + 360 * 100, duration: 200, ease: "none", overwrite: true })
      return
    }

    if (phase === "result" && wsResult !== null) {
      if (gsapTlRef.current) { gsapTlRef.current.kill(); gsapTlRef.current = null }
      const wRot = (gsap.getProperty(el, "rotation") as number) || 0

      const idx    = WHEEL_ORDER.indexOf(wsResult.result)
      const tMod   = (360 - (idx * SECTOR_DEG % 360)) % 360
      const cMod   = ((wRot % 360) + 360) % 360
      let   wAlign = tMod - cMod
      if (wAlign <= 0) wAlign += 360
      const wheelFinal = wRot + wAlign

      const tl = gsap.timeline()
      gsapTlRef.current = tl
      tl.to(el, { rotation: wheelFinal, duration: 3, ease: "power3.out", overwrite: true }, 0)
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
        // snackbarUtil.error(res?.data?.message ?? res?.error?.data?.message ?? "Failed to place bet")
      }
    } catch {
      // snackbarUtil.error("Failed to place bet")
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
          <button
            className="rl-sound-btn"
            onClick={() => setSoundOn(v => !v)}
            title={soundOn ? "Mute sounds" : "Unmute sounds"}
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
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
            <RouletteWheel resultNum={phase === "result" ? (lastResult?.result ?? null) : null} svgRef={wheelRef} />
            <div className="rl-pointer" />
          </div>

          {/* Countdown — right bottom corner of section */}
          {countdown > 0 && phase === "betting" && (
            <div className={`rl-cd-overlay${countdown <= 5 ? " rl-cd-overlay--red" : ""}`}>
              <span key={countdown} className="rl-cd-num">{countdown}</span>
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
          <div className="rl-cell-wrap rl-zero-wrap">
            <div
              className={`rl-zero-cell rl-zero-full${!isBettingOpen ? " suspended" : ""}${betsMap["0"] ? " has-bet" : ""}`}
              onClick={() => openBetSheet("0")}
            >
              0
            </div>
            {plMap["0"] != null && plMap["0"] !== 0 && (
              <span className={`rl-outcome-label${plMap["0"] >= 0 ? " rl-outcome-label--win" : " rl-outcome-label--loss"}`}>{fmtPL(plMap["0"])}</span>
            )}
          </div>

          <div className="rl-table">
            {TABLE_ROWS.map((row, ri) => (
              <div className="rl-table-row" key={ri}>
                {row.map((n) => {
                  const hasBet = !!betsMap[String(n)]
                  const pl = plMap[String(n)]
                  return (
                    <div key={n} className="rl-cell-wrap">
                      <div
                        className={`rl-num-cell rl-num-cell--${numClass(n)}${phase === "result" && n === lastResult?.result ? " is-result win-col" : ""}${!isBettingOpen ? " suspended" : ""}${hasBet ? " has-bet" : ""}`}
                        onClick={() => openBetSheet(String(n))}
                      >
                        {n}
                      </div>
                      {pl != null && pl !== 0 && (
                        <span className={`rl-outcome-label${pl >= 0 ? " rl-outcome-label--win" : " rl-outcome-label--loss"}`}>{fmtPL(pl)}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          <div className="rl-dozens">
            {DOZEN_BETS.map(d => {
              const hasBet = !!betsMap[getBetOn(d.nat)]
              const pl = plMap[d.label.toLowerCase()]
              return (
                <div key={d.nat} className="rl-cell-wrap">
                  <div
                    className={`rl-dozen-btn${!isBettingOpen ? " suspended" : ""}${hasBet ? " has-bet" : ""}`}
                    onClick={() => openBetSheet(d.nat)}
                  >
                    {d.display}
                  </div>
                  {pl != null && pl !== 0 && (
                    <span className={`rl-outcome-label${pl >= 0 ? " rl-outcome-label--win" : " rl-outcome-label--loss"}`}>{fmtPL(pl)}</span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="rl-outside">
            {OUTSIDE_BETS.map(b => {
              const betKey = getBetOn(b.nat)
              const hasBet = !!betsMap[betKey]
              const pl = plMap[b.nat.toLowerCase()]
              return (
                <div key={b.nat} className="rl-cell-wrap">
                  <div
                    className={`rl-outside-btn rl-outside-btn${b.mod}${!isBettingOpen ? " suspended" : ""}${hasBet ? " has-bet" : ""}`}
                    onClick={() => openBetSheet(b.nat)}
                  >
                    {b.label}
                  </div>
                  {pl != null && pl !== 0 && (
                    <span className={`rl-outcome-label${pl >= 0 ? " rl-outcome-label--win" : " rl-outcome-label--loss"}`}>{fmtPL(pl)}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* My Round Bets summary */}
        {/* {roundBets.length > 0 && (
          <div className="rl-round-summary">
            <div className="rl-round-summary__title">This Round</div>
            <div className="rl-round-summary__rows">
              {roundBets.map((b: any, i: number) => {
                const outcomeLabel = b.betType === "straight"
                  ? b.betOn
                  : b.betOn === "dozen1" ? "1st 12"
                  : b.betOn === "dozen2" ? "2nd 12"
                  : b.betOn === "dozen3" ? "3rd 12"
                  : b.betOn
                const pl = plMap[outcomeLabel.toLowerCase()] ?? plMap[b.betOn.toLowerCase()]
                return (
                  <div key={b._id ?? i} className="rl-round-summary__row">
                    <span className="rl-round-summary__bet">{b.betOn}</span>
                    <span className="rl-round-summary__stake">₹{b.stake}</span>
                    {pl != null && (
                      <span className={`rl-round-summary__pl ${pl >= 0 ? "pos" : "neg"}`}>
                        {fmtPL(pl)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="rl-round-summary__footer">
              <span>Total: ₹{myRoundBetsData?.summary?.totalStake ?? 0}</span>
              <span style={{ color: "#4ade80" }}>Max Win: ₹{myRoundBetsData?.summary?.totalPotentialWin ?? 0}</span>
            </div>
          </div>
        )} */}

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
