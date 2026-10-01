import { useState, useCallback, useEffect, useRef } from "react"
import { useLudoSocket } from "./useLudoSocket"
import { useCancelLudoRoomMutation, useExitLudoGameMutation } from "../../../../store/service/ludo/ludoApi"
import { unlockLudoAudio, playDiceRoll, playTokenHop, playTokenCut, playCutScene } from "./ludoSounds"
import LudoWaitingScreen from "./LudoWaitingScreen"
import LudoCutScene, { type CutFx } from "./LudoCutScene"
import "./LudoBoard.css"
import "./LudoMultiplayer.scss"

// ── Board constants ──────────────────────────────────────────────────
const MAIN_PATH = [
  {r:13,c:6},{r:12,c:6},{r:11,c:6},{r:10,c:6},{r:9,c:6},
  {r:8,c:5},{r:8,c:4},{r:8,c:3},{r:8,c:2},{r:8,c:1},{r:8,c:0},
  {r:7,c:0},{r:6,c:0},
  {r:6,c:1},{r:6,c:2},{r:6,c:3},{r:6,c:4},{r:6,c:5},
  {r:5,c:6},{r:4,c:6},{r:3,c:6},{r:2,c:6},{r:1,c:6},{r:0,c:6},
  {r:0,c:7},{r:0,c:8},
  {r:1,c:8},{r:2,c:8},{r:3,c:8},{r:4,c:8},{r:5,c:8},
  {r:6,c:9},{r:6,c:10},{r:6,c:11},{r:6,c:12},{r:6,c:13},{r:6,c:14},
  {r:7,c:14},{r:8,c:14},
  {r:8,c:13},{r:8,c:12},{r:8,c:11},{r:8,c:10},{r:8,c:9},
  {r:9,c:8},{r:10,c:8},{r:11,c:8},{r:12,c:8},{r:13,c:8},{r:14,c:8},
  {r:14,c:7},{r:14,c:6},
]
const HOME_STRETCH: Record<string, { r: number; c: number }[]> = {
  red:    [{r:13,c:7},{r:12,c:7},{r:11,c:7},{r:10,c:7},{r:9,c:7},{r:8,c:7}],
  green:  [{r:7,c:1},{r:7,c:2},{r:7,c:3},{r:7,c:4},{r:7,c:5},{r:7,c:6}],
  yellow: [{r:1,c:7},{r:2,c:7},{r:3,c:7},{r:4,c:7},{r:5,c:7},{r:6,c:7}],
  blue:   [{r:7,c:13},{r:7,c:12},{r:7,c:11},{r:7,c:10},{r:7,c:9},{r:7,c:8}],
}
const CENTER = { r: 7, c: 7 }

// Color → track-start offset. Must match the server's board geometry exactly
// (server formula: boardSquare = (relativePosition - 1 + colorOffset) % 52).
const PLAYER_START: Record<string, number> = { red: 0, green: 13, yellow: 26, blue: 39 }

// Safe squares = the server's safe board squares exactly
// (0, 8, 13, 21, 26, 34, 39, 47): each house's start star plus the star
// 8 squares after it. A token drawn on a star really is safe on the server.
const START_SQUARES: Record<number, string> = { 0: "red", 13: "green", 26: "yellow", 39: "blue" }
const SAFE_SQUARES  = new Set([8, 21, 34, 47])

// Draw tokens exactly where the server has them (server pos 1 = start star).
// Do NOT shift this to "fix" the first move out of the yard: shifting draws
// every token one square off, so tokens shown on a star get cut. The first-
// move count must be fixed on the server (leaving the yard → dice + 1).
const DISPLAY_SHIFT = 0

// Fixed server turn order: red → green → yellow → blue → red...
const ALL_COLORS = ["red", "green", "yellow", "blue"]
// Board quadrant each color's home sits in: green top-left, yellow top-right,
// red bottom-left, blue bottom-right (matches server start offsets: each
// color starts on the arm beside its quadrant, turn order runs clockwise). Panels are rendered beside their quadrant.
// Quadrants clockwise from bottom-left on the unrotated board.
// The board is rotated per viewer so THEIR colour always sits bottom-left.
const SEATS_CW = ["red", "green", "yellow", "blue"] // BL, TL, TR, BR
const MOVER_LABELS: Record<string, string> = {
  red: "First Mover", green: "Second Mover", yellow: "Third Mover", blue: "Fourth Mover",
}

// Per-turn window: server enforces 8s for roll_dice + move_piece combined (3 misses = forfeit).
// This client countdown is display-only and resets whenever currentTurn changes.
const TURN_WINDOW_SECS = 8

// Missed turns allowed in a whole game before forfeit (per Ludo rules).
const MAX_MISSES = 5

// server: 0=yard, 1-52=track, 53-58=home col, 100=done
// local:  -1=yard, 0-51=track, 52-57=home col (6 squares), 58=center
function s2l(p: number) {
  if (p === 0) return -1
  if (p >= 100) return 58
  return p - 1
}

function getBoardCell(color: string, pos: number) {
  if (pos < 0) return null
  if (pos === 58) return CENTER
  if (pos >= 52) return HOME_STRETCH[color]?.[pos - 52] ?? null
  // Relative square 50 is the last cell before this color's home column
  // (e.g. red: row 14, col 7 — directly below the red column). The server has
  // one more track position after it (the arrow cell beside the start), so
  // the token would step past its column and then cut back diagonally into
  // it — looking like it overshoots. Hold it in front of its home column.
  const rel = Math.min(pos + DISPLAY_SHIFT, 50)
  return MAIN_PATH[(PLAYER_START[color] + rel) % 52]
}

function getCellClass(r: number, c: number, safe: Set<number> = SAFE_SQUARES) {
  // Home quadrants — one solid color block, no checkered sub-grid or circle
  // slots. The Score badge + waiting tokens float directly on top of it.
  if (r >= 9 && r <= 14 && c >= 0 && c <= 5)  return "hb-solid hb-solid-red"
  if (r >= 0 && r <= 5 && c >= 0 && c <= 5)   return "hb-solid hb-solid-green"
  if (r >= 0 && r <= 5 && c >= 9 && c <= 14)  return "hb-solid hb-solid-yellow"
  if (r >= 9 && r <= 14 && c >= 9 && c <= 14) return "hb-solid hb-solid-blue"
  if (r >= 6 && r <= 8 && c >= 6 && c <= 8) {
    if (r === 7 && c === 7) return "cell-center"
    if (r === 8 && c === 7) return "cell-tri-red"
    if (r === 7 && c === 6) return "cell-tri-green"
    if (r === 6 && c === 7) return "cell-tri-yellow"
    if (r === 7 && c === 8) return "cell-tri-blue"
    return "cell-center-corner"
  }
  if (c === 7 && r >= 9 && r <= 13) return "cell-stretch-red"
  if (r === 7 && c >= 1 && c <= 5)  return "cell-stretch-green"
  if (c === 7 && r >= 1 && r <= 5)  return "cell-stretch-yellow"
  if (r === 7 && c >= 9 && c <= 13) return "cell-stretch-blue"
  const idx = MAIN_PATH.findIndex(p => p.r === r && p.c === c)
  if (idx !== -1) {
    if (START_SQUARES[idx]) return `cell-safe cell-start cell-start-${START_SQUARES[idx]}`
    if (safe.has(idx)) return "cell-safe"
    if (idx === 51) return "cell-pre-home-red"
    if (idx === 12) return "cell-pre-home-green"
    if (idx === 25) return "cell-pre-home-yellow"
    if (idx === 38) return "cell-pre-home-blue"
    return "cell-path"
  }
  return "cell-empty"
}

const PIP_PATTERNS: Record<number, number[][]> = {
  1: [[50,50]],
  2: [[28,28],[72,72]],
  3: [[28,28],[50,50],[72,72]],
  4: [[28,28],[72,28],[28,72],[72,72]],
  5: [[28,28],[72,28],[50,50],[28,72],[72,72]],
  6: [[28,22],[72,22],[28,50],[72,50],[28,78],[72,78]],
}

// ── Per-player mini dice (same as local LudoGame) ──────────────────────
function MiniDice({ color, value, rolling, active }: { color: string; value: number | null; rolling: boolean; active: boolean }) {
  const pips = value && !rolling ? (PIP_PATTERNS[value] || []) : []
  return (
    <div className={`mini-dice md-${color}${active ? " md-active" : ""}${rolling ? " md-rolling" : ""}`}>
      {rolling ? (
        <span className="md-emoji">🎲</span>
      ) : value ? (
        pips.map(([x, y], i) => (
          <span key={i} className="md-pip" style={{ left: `${x}%`, top: `${y}%` }} />
        ))
      ) : (
        <img src="/img/dice2.png" alt="" className="md-img" />
      )}
    </div>
  )
}

const RING_COLORS: Record<string, string> = { red: "#F44336", blue: "#2196F3", yellow: "#FFC107", green: "#4CAF50" }

// ── Player panel (opponent or me) ────────────────────────────────────
// Remaining ms until `deadline`, re-rendered every animation frame so the
// ring drains smoothly instead of jumping once per second.
function useRemainingMs(deadline: number | null) {
  const [remaining, setRemaining] = useState<number | null>(null)
  useEffect(() => {
    if (deadline == null) { setRemaining(null); return }
    let raf = 0
    const tick = () => {
      const left = Math.max(0, deadline - Date.now())
      setRemaining(left)
      if (left > 0) raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [deadline])
  return remaining
}

// Last 3 seconds of a turn: big 3 → 2 → 1 in the middle of the board.
// Its own component so only this overlay re-renders every frame.
function BoardCountdown({ deadline, color }: { deadline: number | null; color: string }) {
  const remainingMs = useRemainingMs(deadline)
  if (remainingMs == null || remainingMs <= 0 || remainingMs > 3000) return null
  const num = Math.ceil(remainingMs / 1000)
  return (
    <div className="board-countdown">
      <div key={num} className={`board-countdown-num bc-${color}`}>{num}</div>
    </div>
  )
}

function MPPlayerPanel({ color, isMe, isBot, isActive, diceVal, rolling, onRoll, turnKey, mirror, deadline, moverLabel, diceRolled, fullName, code }: {
  color: string; isMe: boolean; isBot: boolean; isActive: boolean; diceVal: number | null; rolling: boolean; moverLabel?: string
  fullName?: string; code?: string
  onRoll?: () => void; turnKey: string; mirror: boolean; deadline: number | null; diceRolled: boolean
}) {
  // Rollable whenever it's my turn and this turn's dice hasn't been rolled yet —
  // NOT tied to the last shown value, so an extra turn after a 6 works.
  const canRoll       = isMe && isActive && !rolling && !diceRolled
  const showCountdown = isActive && !rolling
  // Real players: full name (+ "You" tag for me) and their user code below.
  // Bots / players without profile data fall back to the old labels.
  const name  = (fullName || "").trim()
  // Bots show their fullName like a real player; "Bot" only if the feed sends none.
  const label = name
    ? (isMe ? `${name} (You)` : name)
    : isBot
      ? "Bot"
      : (isMe ? "You" : (moverLabel ?? MOVER_LABELS[color] ?? "Opp"))
  const subLabel = !isBot && code ? code : ""

  const remainingMs = useRemainingMs(isActive ? deadline : null)
  const totalMs     = TURN_WINDOW_SECS * 1000
  const arcDeg = showCountdown && remainingMs != null
    ? Math.max(0, (remainingMs / totalMs) * 360)
    : showCountdown ? 360 : 0
  const ringStyle = showCountdown ? {
    background: `conic-gradient(${RING_COLORS[color] || "#4CAF50"} ${arcDeg}deg, rgba(255,255,255,0.12) ${arcDeg}deg)`
  } : undefined

  // Countdown ring drains around the avatar.
  const avatar = (
    <div key={turnKey} className={`lpc-avatar-ring${showCountdown ? " lpc-ring-on" : ""}`} style={ringStyle}>
      <div className={`lpc-avatar lpc-av-${color}`}>
        {/* Same user icon for everyone, bots included */}
        <svg viewBox="0 0 24 24" className="lpc-av-svg" aria-hidden="true">
          <circle cx="12" cy="8.5" r="4.2" />
          <path d="M3.5 21c0-4.4 3.8-7.3 8.5-7.3s8.5 2.9 8.5 7.3z" />
        </svg>
      </div>
    </div>
  )
  const dice = (
    <div className={`lpc-dice${canRoll ? " lpc-dice-ready" : ""}`}>
      <MiniDice color={color} value={diceVal} rolling={rolling && isActive} active={canRoll} />
    </div>
  )

  return (
    <div
      className={`player-card lpc-${color}${isActive ? " lpc-active" : ""}${mirror ? " lpc-right" : ""}`}
      onClick={canRoll ? onRoll : undefined}
    >
      <div className="lpc-name-pill">
        <span className="lpc-name-text">
          <span className="lpc-name" title={label}>{label}</span>
          {subLabel && <span className="lpc-code">{subLabel}</span>}
        </span>
        <span className="lpc-info" aria-hidden="true">i</span>
      </div>
      <div className="lpc-body">
        {avatar}
        <span className="lpc-divider" />
        {dice}
      </div>
    </div>
  )
}

// ── Per-quadrant Score badge (Zupee-style) ───────────────────────────
function QuadrantBadge({ color, player, active }: { color: string; player: Player | null; active: boolean }) {
  // No player object for this color = that seat isn't actually in the match
  // (fewer than 4 real+bot players joined) — show it as visibly empty rather
  // than a full "Score 0 / Nth Mover" that looks like a real opponent.
  if (!player) {
    return (
      <div className={`lqb lqb-${color} lqb-empty`}>
        <div className="lqb-circle">
          <span className="lqb-label">Empty</span>
        </div>
        <span className="lqb-mover">Seat unfilled</span>
      </div>
    )
  }

  return (
    <div className={`lqb lqb-${color}${active ? " lqb-active" : ""}`}>
      <div className="lqb-circle">
        <span className="lqb-label">Score</span>
        <span className="lqb-val">{player.score ?? 0}</span>
      </div>
      <span className="lqb-mover">{player.moverLabel ?? MOVER_LABELS[color]}</span>
    </div>
  )
}

// Speak a short announcement in an Indian voice. Prefers a Hindi (hi-IN)
// voice with the Devanagari text; otherwise an Indian-English (en-IN) voice
// reading the Hinglish text. Silently does nothing without speech synthesis.
function pickIndianVoice(voices: SpeechSynthesisVoice[]) {
  const by = (pred: (v: SpeechSynthesisVoice) => boolean) => voices.find(pred)
  const lang = (v: SpeechSynthesisVoice) => (v.lang || "").toLowerCase().replace("_", "-")
  return (
    by(v => lang(v) === "hi-in") ||
    by(v => lang(v).startsWith("hi")) ||
    by(v => lang(v) === "en-in") ||
    by(v => /india|hindi|rishi|lekha|veena|heera|ravi/i.test(v.name)) ||
    null
  )
}

function speak(hiText: string, hinglishText: string) {
  let synth: SpeechSynthesis | undefined
  try { synth = window.speechSynthesis } catch { return }
  if (!synth) return

  const say = () => {
    try {
      const voice = pickIndianVoice(synth!.getVoices())
      const isHindi = !!voice && voice.lang.toLowerCase().startsWith("hi")
      const u = new SpeechSynthesisUtterance(voice && !isHindi ? hinglishText : hiText)
      u.lang  = voice?.lang || "hi-IN"
      if (voice) u.voice = voice
      u.rate  = 0.95
      synth!.cancel()
      synth!.speak(u)
    } catch { /* ignore */ }
  }

  // Voices load asynchronously on first use in some browsers (Chrome).
  if (synth.getVoices().length) { say(); return }
  let done = false
  const once = () => { if (done) return; done = true; synth!.removeEventListener("voiceschanged", once); say() }
  synth.addEventListener("voiceschanged", once)
  setTimeout(once, 600)
}

// ── Whole-game timer pill (top center) ──────────────────────────────
// Anchors to the server's latest secondsLeft (timer_update) and ticks locally
// in between; falls back to startTime + timeLimit before the first update.
function formatClock(total: number) {
  const t = Math.max(0, Math.floor(total))
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const sec = t % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}

function GameTimer({ secondsLeft, startTime, timeLimit }: {
  secondsLeft: number | null; startTime?: string; timeLimit?: number
}) {
  const [endAt, setEndAt] = useState<number | null>(null)
  const [now, setNow]     = useState(Date.now())

  useEffect(() => {
    if (secondsLeft != null) { setEndAt(Date.now() + secondsLeft * 1000); return }
    if (startTime && timeLimit) {
      const start = new Date(startTime).getTime()
      if (!Number.isNaN(start)) setEndAt(start + timeLimit * 1000)
    }
  }, [secondsLeft, startTime, timeLimit])

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [])

  if (endAt == null) return null
  const left   = Math.max(0, Math.ceil((endAt - now) / 1000))
  const urgent = left <= 60
  return (
    <div className={`game-timer${urgent ? " gt-urgent" : ""}`}>
      <svg className="gt-icon" viewBox="0 0 32 24" aria-hidden="true">
        <path d="M1 9h6M0 13h6M2 17h5" className="gt-speed" />
        <circle cx="19" cy="13.5" r="8.5" className="gt-face" />
        <path d="M19 9v5l3.2 2" className="gt-hand" />
        <path d="M16.5 3h5M19 3v2" className="gt-hand" />
      </svg>
      <span className="gt-digits">{formatClock(left)}</span>
    </div>
  )
}

interface Player {
  color: string
  userId: string | null
  isBot: boolean
  pieces: number[]
  score: number
  piecesHome: number
  forfeited?: boolean
  moverNumber?: number
  moverLabel?: string
  code?: string
  username?: string
  fullName?: string
  // Absolute 0-51 ring square per piece (parallel to pieces), null off the ring.
  boardSquares?: (number | null)[]
}

interface GameState {
  gameId: string
  status: string
  players: Player[]
  currentTurn: string
  diceValue: number | null
  diceRolled: boolean
  timeLimit: number
  startTime?: string
  winner: string | null
  connectedColors: string[]
  safeSquares?: number[]
  entryFee?: number
  prizePool?: number
}

interface Session {
  roomId: string | null
  gameId: string | null
  color: string
  matched: boolean
  entryFee: number
  prizePool: number
  botScheduledAt: string | null
}

// Next player's color if the server included it on a message
// (turn_changed.currentTurn, or nextTurn/currentTurn on piece_moved / dice_rolled).
const nextTurnFrom = (msg: any): string | null => {
  const t = msg?.nextTurn ?? msg?.currentTurn ?? msg?.turn
  return typeof t === "string" && t ? t : null
}

const findPlayer = (gs: GameState | null, color: string | null) =>
  color ? gs?.players?.find(p => p.color?.toLowerCase() === color.toLowerCase()) ?? null : null

// dice_rolled / piece_moved only send an abbreviated players snapshot
// ({color, score, piecesHome} — no `pieces` positions), so merge just those
// stat fields into the existing full player objects instead of replacing
// them wholesale (that would wipe out every token's board position).
// Score updates that don't come as a players[] snapshot: a {color: score}
// map (msg.scores) or the acting player's own score (msg.score / newScore).
function applyLooseScores(players: Player[], msg: any): Player[] {
  let out = players
  if (msg?.scores && typeof msg.scores === "object" && !Array.isArray(msg.scores)) {
    out = out.map(p => typeof msg.scores[p.color] === "number" ? { ...p, score: msg.scores[p.color] } : p)
  }
  const own = typeof msg?.score === "number" ? msg.score
            : typeof msg?.newScore === "number" ? msg.newScore
            : null
  if (own != null && msg?.color) {
    out = out.map(p => p.color === msg.color ? { ...p, score: own } : p)
  }
  return out
}

function mergePlayerStats(players: Player[], snapshot: any[] | undefined): Player[] {
  if (!snapshot?.length) return players
  return players.map(p => {
    const upd = snapshot.find((s: any) => s.color === p.color)
    return upd ? {
      ...p,
      // Keep the previous value when a snapshot omits a field — never blank it.
      score: typeof upd.score === "number" ? upd.score : p.score,
      piecesHome: typeof upd.piecesHome === "number" ? upd.piecesHome : p.piecesHome,
      isBot: upd.isBot ?? p.isBot,
      moverNumber: upd.moverNumber ?? p.moverNumber,
      moverLabel: upd.moverLabel ?? p.moverLabel,
    } : p
  })
}

// ────────────────────────────────────────────────────────────────────
const LudoMultiplayer = ({ session, onExit }: { session: Session; onExit: () => void }) => {
  const { roomId, gameId: initGameId, color: initColor, entryFee, prizePool, botScheduledAt } = session

  const [gameId, setGameId]         = useState(initGameId)
  const [myColor, setMyColor]       = useState(initColor)
  const [gameState, setGameState]   = useState<GameState | null>(null)

  // ── Step-by-step token animation ──────────────────────────────────
  // gameState always holds the server's final positions. While a token is
  // walking, animPos overrides where it is drawn ("color-idx" → server pos),
  // advancing one square every STEP_MS. Cut tokens stay where they were until
  // the mover lands on them, then drop back to the yard.
  const STEP_MS = 180
  const [animPos, setAnimPos] = useState<Record<string, number>>({})
  const animTimers   = useRef<Record<string, ReturnType<typeof setTimeout>[]>>({})
  const gameStateRef = useRef<GameState | null>(null)
  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  useEffect(() => () => {
    Object.values(animTimers.current).flat().forEach(clearTimeout)
  }, [])

  // Set further down (needs game state); called the instant a cut lands.
  const onCutRef = useRef<(attacker: string, victims: { color: string }[]) => void>(() => {})

  const animateMove = useCallback((
    color: string, pieceIndex: number, from: number, to: number,
    killed: { color: string; pieceIndex: number }[],
  ) => {
    const key = `${color}-${pieceIndex}`
    ;(animTimers.current[key] ?? []).forEach(clearTimeout)

    // Server positions are consecutive (0 yard, 1-52 track, 53-58 home col),
    // except 100 = reached center.
    const path: number[] = []
    const last = to >= 100 ? 58 : to
    // A yard token is already drawn on its start star (= pos 1), so don't
    // spend a hop "stepping" onto the star it's standing on.
    for (let p = Math.max(from + 1, from === 0 ? 2 : 1); p <= last; p++) path.push(p)
    if (to >= 100) path.push(100)

    const killKeys = killed.map(k => `${k.color}-${k.pieceIndex}`)
    const done = () => {
      setAnimPos(prev => {
        const next = { ...prev }
        delete next[key]
        killKeys.forEach(k => delete next[k])
        return next
      })
      delete animTimers.current[key]
    }

    // Nothing sensible to walk (resync, backwards jump) → just snap.
    if (path.length === 0 || path.length > 13) {
      if (killKeys.length) onCutRef.current(color, killed)
      done()
      return
    }

    // Keep each cut token drawn at its pre-cut square until the mover arrives.
    const prevPlayers = gameStateRef.current?.players ?? []
    const hold: Record<string, number> = { [key]: from }
    killed.forEach(k => {
      const pl = prevPlayers.find(p => p.color === k.color)
      const pos = pl?.pieces?.[k.pieceIndex]
      if (pos != null) hold[`${k.color}-${k.pieceIndex}`] = pos
    })
    setAnimPos(prev => ({ ...prev, ...hold }))

    const timers: ReturnType<typeof setTimeout>[] = []
    path.forEach((pos, i) => {
      timers.push(setTimeout(() => {
        setAnimPos(prev => ({ ...prev, [key]: pos }))
        playTokenHop(i === path.length - 1)
      }, (i + 1) * STEP_MS))
    })
    timers.push(setTimeout(() => {
      if (killKeys.length) onCutRef.current(color, killed)
      done()
    }, (path.length + 1) * STEP_MS))
    animTimers.current[key] = timers
  }, [])
  const [phase, setPhase]           = useState(session.matched ? "connecting" : "waiting")
  const [myDice, setMyDice]         = useState<number | null>(null)
  const [oppDiceByColor, setOppDiceByColor] = useState<Record<string, number | null>>({})
  const [rolling, setRolling]       = useState(false)
  const [validMoves, setValidMoves] = useState<number[]>([])
  const [timerSecs, setTimerSecs]   = useState<number | null>(null)
  // Bumped on every turn start (incl. an extra turn for the same color after
  // a 6 / cut / home) so the 8s window restarts even if currentTurn is unchanged.
  const [turnSeq, setTurnSeq]             = useState(0)
  const [turnDeadline, setTurnDeadline]   = useState<number | null>(null) // end of per-turn 8s window (ms) — display only, server enforces
  const [gameOver, setGameOver]     = useState<any>(null)
  const [toast, setToast]           = useState("")
  const [botCountdown, setBotCountdown]           = useState<number | null>(null)
  const [botCountdownTotal, setBotCountdownTotal] = useState(30)


  const [cancelRoom]  = useCancelLudoRoomMutation()
  const [exitGame]    = useExitLudoGameMutation()

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  // Bot-fill countdown comes from the REST response (data.botScheduledAt), not the WS —
  // start it as soon as we know we're waiting.
  useEffect(() => {
    if (!botScheduledAt) return
    const s = Math.max(0, Math.round((new Date(botScheduledAt).getTime() - Date.now()) / 1000))
    setBotCountdownTotal(s || 30)
    setBotCountdown(s)
  }, [botScheduledAt])

  const handleMessage = useCallback((msg: any) => {
    // Dev-only: inspect every socket message (e.g. to verify score payloads).
    if (import.meta.env.DEV) console.log("[ludo ws]", msg.type, msg)

    // Any in-game message may carry score updates (turn_changed, turn_missed,
    // piece_moved, …). game_state / game_over carry full data and are handled below.
    if (msg.type !== "game_state" && msg.type !== "game_over" &&
        (Array.isArray(msg.players) || msg.scores || typeof msg.score === "number" || typeof msg.newScore === "number")) {
      setGameState(prev => prev ? {
        ...prev,
        players: applyLooseScores(mergePlayerStats(prev.players, msg.players), msg),
      } : prev)
    }

    switch (msg.type) {
      case "waiting":
        setPhase("waiting")
        if (msg.botScheduledAt) {
          const s = Math.max(0, Math.round((new Date(msg.botScheduledAt).getTime() - Date.now()) / 1000))
          setBotCountdownTotal(s || 30)
          setBotCountdown(s)
        }
        break
      case "game_ready":
        setGameId(msg.gameId)
        if (msg.color) setMyColor(msg.color)
        setPhase("connecting")
        showToast("Opponent found! Starting game...")
        break
      case "game_state": {
        const g: GameState = msg.game ?? msg
        setGameState(g)
        setPhase("playing")
        setRolling(false)
        setValidMoves([])
        break
      }
      case "player_connected":
        showToast(`${msg.color} player connected`)
        break
      case "player_forfeited":
        showToast(`${msg.color} left the game`)
        setGameState(prev => prev ? {
          ...prev,
          players: prev.players.map(p => p.color === msg.color ? { ...p, forfeited: true } : p),
        } : prev)
        break
      case "dice_rolled":
        setRolling(false)
        if (msg.color === myColor) {
          setMyDice(msg.diceValue)
          const moves = msg.validMoves ?? []
          setValidMoves(moves)
          if (moves.length === 0) showToast("No valid moves — turn passed!")
        } else {
          setMyDice(null)
          setOppDiceByColor(prev => ({ ...prev, [msg.color]: msg.diceValue }))
          playDiceRoll()
        }
        {
          // Roll with no possible move = this turn is over right now.
          const noMoves = Array.isArray(msg.validMoves) && msg.validMoves.length === 0
          const next    = nextTurnFrom(msg)
          if (noMoves) setTurnDeadline(null)
          setGameState(prev => {
            if (!prev) return prev
            const passTo = noMoves && next && next !== msg.color ? next : null
            return {
              ...prev,
              diceRolled: !passTo,
              currentTurn: passTo ?? msg.color,
              players: mergePlayerStats(prev.players, msg.players),
            }
          })
        }
        break
      case "piece_moved": {
        setValidMoves([])
        // The server sends no "extra turn" flag: after a move the turn stays
        // with the mover (6 / kill / home bonus) unless a turn_changed follows,
        // which it does right away for a normal move. So re-open the roll for
        // the mover and start a fresh 8s window; turn_changed then overrides.
        setGameState(prev => prev ? { ...prev, diceRolled: false } : prev)
        setTurnSeq(n => n + 1)
        if (msg.color === myColor) setMyDice(null)
        // Walk the token one square at a time (with a hop sound per square).
        animateMove(
          msg.color, msg.pieceIndex, msg.from ?? 0, msg.to ?? 0,
          msg.killed && msg.killedPieces?.length ? msg.killedPieces : [],
        )
        if (msg.color === myColor) {
          const fromLocal = s2l(msg.from ?? 0)
          const toLocal   = s2l(msg.to   ?? 0)
          if (toLocal === 58) {
            showToast("🏆 Piece reached center!")
          } else if (fromLocal < 52 && toLocal >= 52 && toLocal < 58) {
            showToast("🏠 Piece entered home column!")
          }
        }
        if (msg.killed && msg.killedPieces?.length) {
          showToast(msg.color === myColor ? "⚔️ You cut the opponent!" : "💀 Your piece was cut!")
        }
        // The server sends `from`/`to`/`killedPieces` explicitly — apply those
        // directly rather than trusting msg.players for positions (it's just
        // an abbreviated {color, score, piecesHome} snapshot, no `pieces`).
        setGameState(prev => {
          if (!prev) return prev
          let players = prev.players.map(p => {
            if (p.color !== msg.color) return p
            const pieces = [...p.pieces]
            pieces[msg.pieceIndex] = msg.to
            const boardSquares = [...(p.boardSquares ?? [null, null, null, null])]
            boardSquares[msg.pieceIndex] = typeof msg.toBoardSquare === "number" ? msg.toBoardSquare : null
            return { ...p, pieces, boardSquares }
          })
          if (msg.killed && msg.killedPieces?.length) {
            players = players.map(p => {
              const kills = msg.killedPieces.filter((k: any) => k.color === p.color)
              if (!kills.length) return p
              const pieces = [...p.pieces]
              const boardSquares = [...(p.boardSquares ?? [null, null, null, null])]
              kills.forEach((k: any) => { pieces[k.pieceIndex] = 0; boardSquares[k.pieceIndex] = null })
              return { ...p, pieces, boardSquares }
            })
          }
          players = mergePlayerStats(players, msg.players)
          return { ...prev, players }
        })
        break
      }
      case "turn_changed":
        setGameState(prev => prev ? { ...prev, currentTurn: nextTurnFrom(msg) ?? prev.currentTurn, diceRolled: false } : prev)
        setTurnSeq(n => n + 1)
        if ((nextTurnFrom(msg) ?? "") === myColor) setMyDice(null)
        setValidMoves([])
        if (msg.reason === "three_sixes") showToast("Three sixes! Turn passed")
        break
      case "turn_missed":
        if (msg.color === myColor) {
          if (msg.forfeited) {
            showToast(`⛔ You missed ${MAX_MISSES} turns — forfeited!`)
            speak(
              "आपने पाँच चांस मिस कर दिए, आप गेम से बाहर हो गए",
              "Aapne paanch chance miss kar diye, aap game se bahar ho gaye",
            )
          } else if (msg.missCount >= MAX_MISSES - 1) {
            // Last warning: one more miss = forfeit.
            showToast(`⚠️ Chance missed (${msg.missCount}/${MAX_MISSES}) — one more miss and you're out!`)
            speak(
              "तुम्हारा चांस मिस हो गया है। पाँच चांस मिस होने पर तुम गेम से बाहर हो जाओगे",
              "Tumhara chance miss ho gaya hai. Paanch chance miss hone par tum game se bahar ho jaoge",
            )
          } else {
            showToast(`⏰ Your chance was missed! (${msg.missCount}/${MAX_MISSES})`)
            speak("तुम्हारा चांस मिस हो गया है", "Tumhara chance miss ho gaya hai")
          }
        } else {
          showToast(
            msg.forfeited
              ? `${msg.color} forfeited (${MAX_MISSES} misses)!`
              : `${msg.color} missed their turn (${msg.missCount}/${MAX_MISSES})`
          )
        }
        if (msg.forfeited) {
          setGameState(prev => prev ? {
            ...prev,
            players: prev.players.map(p => p.color === msg.color ? { ...p, forfeited: true } : p),
          } : prev)
        }
        break
      case "timer_update":
        setTimerSecs(msg.secondsLeft)
        break
      case "game_over":
        setGameOver({
          winner: msg.winner, reason: msg.reason, players: msg.players,
          prize: msg.prize, prizePool: msg.prizePool, entryFee: msg.entryFee,
        })
        setPhase("game_over")
        break
      case "error":
        setRolling(false)
        showToast(msg.message || "Error")
        break
      default:
        break
    }
  }, [myColor, animateMove])

  useEffect(() => {
    if (phase !== "waiting" || botCountdown === null) return
    const iv = setInterval(() => {
      setBotCountdown(prev => {
        if (prev === null) return prev
        if (prev <= 1) { clearInterval(iv); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [phase, botCountdown])

  // Fresh 8s window every time the active turn changes — one window covers
  // both roll_dice and move_piece, so it does NOT reset on dice_rolled.
  useEffect(() => {
    if (!gameState?.currentTurn || phase !== "playing") { setTurnDeadline(null); return }
    setTurnDeadline(Date.now() + TURN_WINDOW_SECS * 1000)
  }, [gameState?.currentTurn, turnSeq, phase])

  const { reconnecting, rollDice, movePiece } = useLudoSocket({
    roomId:    gameId ? null : roomId,
    gameId,
    onMessage: handleMessage,
  })

  const isMyTurn   = gameState?.currentTurn === myColor
  const diceRolled = gameState?.diceRolled ?? false
  // Table can seat 2-4 real players (bots fill only if exactly 1 real player
  // joined) — show every other seated color, not just a single "opponent".
  // Always ordered red→green→yellow→blue (moverNumber 1-4), regardless of
  // the order the server happens to list players in.
  const opponents  = (gameState?.players ?? [])
    .filter(p => p.color !== myColor)
    .sort((a, b) => (a.moverNumber ?? 0) - (b.moverNumber ?? 0))

  const turnKey = `${gameState?.currentTurn ?? "none"}-${diceRolled ? 1 : 0}`

  const handleRoll = () => {
    if (!isMyTurn || diceRolled || rolling) return
    unlockLudoAudio()
    playDiceRoll()
    setRolling(true)
    rollDice()
  }

  const handlePieceClick = (idx: number) => {
    if (!isMyTurn || !diceRolled) return
    movePiece(idx)
  }

  const handleExit = async () => {
    if (gameId) await exitGame(gameId)
    else if (roomId) await cancelRoom(roomId)
    onExit()
  }

  function buildCellMap() {
    const map: Record<string, { color: string; idx: number; done: boolean }[]> = {}
    // Render every seated color's pieces (2-4 players, real + bot), not just me + one opponent.
    ;(gameState?.players ?? []).forEach(player => {
      const color = player.color
      ;(player.pieces ?? [0, 0, 0, 0]).forEach((finalPos, idx) => {
        const animating = animPos[`${color}-${idx}`] !== undefined
        const serverPos = animating ? animPos[`${color}-${idx}`] : finalPos
        // Settled on the ring (1-51, before the hold-in-front-of-home squares):
        // draw at the server's own boardSquares value, per the API contract.
        const bs = player.boardSquares?.[idx]
        if (!animating && typeof bs === "number" && serverPos >= 1 && serverPos <= 51 && MAIN_PATH[bs]) {
          const key = `${MAIN_PATH[bs].r},${MAIN_PATH[bs].c}`
          if (!map[key]) map[key] = []
          map[key].push({ color, idx, done: false })
          return
        }
        const localPos = s2l(serverPos)
        const done = localPos === 58
        // Still in the yard — show it on that color's own start (star) square.
        const cell = localPos === -1
          ? MAIN_PATH[PLAYER_START[color]]
          : getBoardCell(color, localPos)
        if (!cell) return
        const key = `${cell.r},${cell.c}`
        if (!map[key]) map[key] = []
        map[key].push({ color, idx, done })
      })
    })
    return map
  }

  // ── Cut cinematic ──
  const [cutFx, setCutFx] = useState<CutFx | null>(null)
  const cutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  onCutRef.current = (attacker, victims) => {
    const victim = victims[0]?.color
    const me = (myColor || "").toLowerCase()
    // Reduced-motion users don't get the cinematic, so they keep the short cut sound.
    const reduceMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (!victim) { playTokenCut(); return }
    if (reduceMotion) playTokenCut()
    else playCutScene(attacker === me ? "win" : victim === me ? "lose" : "neutral")
    const nameOf = (c: string) => {
      const p = findPlayer(gameStateRef.current, c)
      return p?.fullName?.trim() || p?.username || c
    }
    setCutFx({
      id: Date.now(),
      attacker, victim,
      attackerName: attacker === me ? "आप" : nameOf(attacker),
      victimName: victim === me ? "आप" : nameOf(victim),
      mine: attacker === me ? "attacker" : victim === me ? "victim" : null,
    })
    if (cutTimer.current) clearTimeout(cutTimer.current)
    cutTimer.current = setTimeout(() => setCutFx(null), 2400)
  }
  useEffect(() => () => { if (cutTimer.current) clearTimeout(cutTimer.current) }, [])

  // Once the game is over, point the address bar at /ludo (without navigating).
  // Otherwise a refresh on the result screen reloads /ludo/play?fee=… and
  // silently starts (and pays for) a brand-new match.
  useEffect(() => {
    if (phase !== "game_over") return
    try { window.history.replaceState(window.history.state, "", "/ludo") } catch { /* ignore */ }
  }, [phase])

  // ── WAITING ──────────────────────────────────────────────────────
  if (phase === "waiting") {
    return (
      <LudoWaitingScreen
        botCountdown={botCountdown}
        botTotal={botCountdownTotal}
        entryFee={entryFee}
        myColor={myColor}
        onCancel={handleExit}
      />
    )
  }

  // ── CONNECTING ───────────────────────────────────────────────────
  if (phase === "connecting") {
    return (
      <div className="mp-screen">
        <div className="mp-card">
          <div className="mp-card-title">🎲 Connecting...</div>
          <div className="mp-spinner" />
          {reconnecting && <p className="mp-reconnect-msg">Reconnecting...</p>}
        </div>
      </div>
    )
  }

  // ── GAME OVER ────────────────────────────────────────────────────
  if (phase === "game_over" && gameOver) {
    const iWon   = gameOver.winner === myColor
    const isDraw = gameOver.winner === "draw" || gameOver.reason === "timer_tie"
    const players: Player[] = gameOver.players ?? []
    return (
      <div className="mp-screen">
        <div className={`mp-card mp-result-card${iWon ? " win" : isDraw ? " draw" : " lose"}`}>
          <div className="mp-result-emoji">{iWon ? "🏆" : isDraw ? "🤝" : "😞"}</div>
          <div className="mp-result-title">{iWon ? "You Win!" : isDraw ? "Draw!" : "You Lost"}</div>
          <div className="mp-result-sub">
            {/* Winner gets prizePool × 0.90 (server sends it as `prize`). */}
            {iWon   && `+₹${(gameOver.prize ?? Math.floor((gameOver.prizePool ?? prizePool ?? 0) * 0.9)).toLocaleString("en-IN")} credited`}
            {isDraw && "Entry fee refunded"}
            {!iWon && !isDraw && `-₹${(gameOver.entryFee ?? entryFee ?? 0).toLocaleString("en-IN")} deducted`}
          </div>
          {players.length > 0 && (
            <div className="mp-scores">
              {players.map((p) => (
                <div key={p.color} className={`mp-score-row mp-${p.color}`}>
                  <span className="mp-score-color">{p.color}</span>
                  <span className="mp-score-val">{p.score} pts • {p.piecesHome} home</span>
                </div>
              ))}
            </div>
          )}
          <div className="mp-result-btns">
            <button className="mp-btn-primary"   onClick={onExit}>Play Again</button>
            <button className="mp-btn-secondary" onClick={() => window.location.href = "/main"}>Home</button>
          </div>
        </div>
      </div>
    )
  }

  // ── PLAYING ──────────────────────────────────────────────────────
  const cellMap = buildCellMap()
  // Stars come from the server's safeSquares (house starts are drawn as start
  // cells with a star, so only the other safe squares go in this set).
  const midStars = gameState?.safeSquares?.length
    ? new Set(gameState.safeSquares.filter(i => START_SQUARES[i] === undefined))
    : SAFE_SQUARES
  const turnMsg = isMyTurn
    ? (diceRolled ? "👆 Tap a glowing token!" : "Your turn — Tap dice!")
    : `${(() => {
        const turnColor = gameState?.currentTurn ?? opponents[0]?.color ?? ""
        const tp = findPlayer(gameState, turnColor)
        return tp?.fullName?.trim() || (tp?.isBot ? "Bot" : turnColor)
      })()} is playing...`

  // One panel per seated color, placed beside that color's quadrant. Seat is
  // taken from player.color (validated against the 4 board colors) and the
  // label from moverLabel, so it follows whatever the server sends.
  // Rotate the board so my quadrant is bottom-left: each 90° counter-clockwise
  // step moves every quadrant one seat back (TL→BL, TR→TL, …).
  const mySeat   = Math.max(0, SEATS_CW.indexOf((myColor || "").toLowerCase()))
  const colorAt  = (screenPos: number) => SEATS_CW[(screenPos + mySeat) % 4] // 0 BL, 1 TL, 2 TR, 3 BR
  const boardRot = -90 * mySeat
  const TOP_ROW_COLORS    = [colorAt(1), colorAt(2)]
  const BOTTOM_ROW_COLORS = [colorAt(0), colorAt(3)]
  const RIGHT_SIDE_COLORS = new Set([colorAt(2), colorAt(3)])

  const renderPanel = (color: string) => {
    const player = findPlayer(gameState, color)
    if (!player) return <div key={color} className="mp-panel-spacer" />
    const isMe     = color === myColor?.toLowerCase()
    const isActive = gameState?.currentTurn?.toLowerCase() === color
    return (
      <MPPlayerPanel
        key={color}
        color={color}
        isMe={isMe}
        isBot={!!player.isBot}
        isActive={isActive}
        diceVal={isMe ? myDice : (oppDiceByColor[color] ?? null)}
        rolling={isMe ? rolling : false}
        onRoll={isMe ? handleRoll : undefined}
        turnKey={turnKey}
        mirror={RIGHT_SIDE_COLORS.has(color)}
        deadline={isActive ? turnDeadline : null}
        diceRolled={diceRolled}
        moverLabel={player.moverLabel}
        fullName={player.fullName}
        code={player.code ?? player.username}
      />
    )
  }

  return (
    <div className="mp-game-screen">

      <div className="mp-header mp-header-pool">
        <div className="mp-pool">
          <span className="mp-pool-icon" aria-hidden="true">🏆</span>
          <div className="mp-pool-text">
            <span className="mp-pool-label">Prize Pool</span>
            <span className="mp-pool-amount">₹{(gameState?.prizePool ?? prizePool ?? 0).toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      <div className="ludo-players-row">
        {renderPanel(TOP_ROW_COLORS[0])}
        <div className="pp-center-msg gt-center">
          <GameTimer
            secondsLeft={timerSecs}
            startTime={gameState?.startTime}
            timeLimit={gameState?.timeLimit}
          />
          <span className="gt-turn-msg">{turnMsg}</span>
        </div>
        {renderPanel(TOP_ROW_COLORS[1])}
      </div>

      <div className="ludo-board-wrap">
        {cutFx && <LudoCutScene key={cutFx.id} fx={cutFx} />}
        <div className={`ludo-board${cutFx ? " lcs-board-shake" : ""}`} style={{ "--board-rot": `${boardRot}deg` } as React.CSSProperties}>
          {Array.from({ length: 15 }, (_, r) =>
            Array.from({ length: 15 }, (_, c) => {
              const key    = `${r},${c}`
              const tokens = cellMap[key] || []
              return (
                <div key={key} className={`ludo-cell ${getCellClass(r, c, midStars)}`}>
                  {tokens.map(({ color, idx, done }) => {
                    const canSelect = color === myColor && validMoves.includes(idx) && isMyTurn && diceRolled && !done
                    const canClick  = color === myColor && isMyTurn && diceRolled && !done
                    return (
                      <div
                        key={`${color}-${idx}`}
                        className={`ludo-token token-${color}${canSelect ? " selectable" : ""}${animPos[`${color}-${idx}`] !== undefined ? " token-hop" : ""}`}
                        onClick={() => canClick && handlePieceClick(idx)}
                      >
                        <span className="token-inner" />
                      </div>
                    )
                  })}
                </div>
              )
            })
          )}

          {toast && (
            <div className="board-toast-wrap">
              <div key={toast} className="board-toast">{toast}</div>
            </div>
          )}

          <BoardCountdown
            deadline={turnDeadline}
            color={gameState?.currentTurn?.toLowerCase() ?? ""}
          />

          {ALL_COLORS.map(color => (
            <QuadrantBadge
              key={color}
              color={color}
              player={findPlayer(gameState, color)}
              active={gameState?.currentTurn === color}
            />
          ))}
        </div>
      </div>

      <div className="ludo-players-row">
        {renderPanel(BOTTOM_ROW_COLORS[0])}
        <div className="pp-center-msg" />
        {renderPanel(BOTTOM_ROW_COLORS[1])}
      </div>

      {reconnecting && <div className="mp-reconnect-bar">⚡ Reconnecting...</div>}
      <button className="mp-exit-btn" onClick={handleExit}>✕ Exit</button>
    </div>
  )
}

export default LudoMultiplayer
