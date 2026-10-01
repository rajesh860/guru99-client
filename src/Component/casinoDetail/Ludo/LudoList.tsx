import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useGetLudoTablesQuery } from "../../../../store/service/ludo/ludoApi"
import LudoRulesModal from "./LudoRulesModal"
import "./LudoList.scss"

const CARD_STYLES = [
  { color: "#4CAF50", glow: "rgba(76,175,80,0.35)" },
  { color: "#2196F3", glow: "rgba(33,150,243,0.35)" },
  { color: "#FF9800", glow: "rgba(255,152,0,0.35)" },
  { color: "#E91E63", glow: "rgba(233,30,99,0.35)" },
  { color: "#9C27B0", glow: "rgba(156,39,176,0.35)" },
  { color: "#00BCD4", glow: "rgba(0,188,212,0.35)" },
  { color: "#FF5722", glow: "rgba(255,87,34,0.35)" },
]

interface NextRoom {
  roomId: string
  secondsLeft?: number
}

interface Table {
  entryFee: number
  winAmount: number
  maxPlayers: number
  waiting: number
  nextRoom?: NextRoom | null
}

// Per-card countdown — restarts from nextRoom.secondsLeft whenever it changes
function useCardCountdown(nextRoom: NextRoom | null | undefined) {
  const [secs, setSecs] = useState(() => (nextRoom ? Math.max(0, nextRoom.secondsLeft ?? 0) : 0))
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (!nextRoom) { setSecs(0); return }

    const initial = Math.max(0, nextRoom.secondsLeft ?? 0)
    setSecs(initial)
    if (initial <= 0) return

    timerRef.current = setInterval(() => {
      setSecs(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [nextRoom?.roomId, nextRoom?.secondsLeft])

  return secs
}

function TableCard({ table, idx, onPlay, isLoading }: { table: Table; idx: number; onPlay: (fee: number) => void; isLoading: boolean }) {
  const { color, glow } = CARD_STYLES[idx % CARD_STYLES.length]
  const { entryFee, winAmount, maxPlayers, waiting, nextRoom } = table

  const hasRoom = !!nextRoom
  const secs = useCardCountdown(nextRoom)

  return (
    <div
      className={`ll-card${isLoading ? " ll-card-loading" : ""}`}
      style={{ "--card-color": color, "--card-glow": glow } as React.CSSProperties}
    >
      <div className="ll-card-left">
        <div className="ll-dice-wrap">
          <img src="/img/dice2.png" alt="" className="ll-dice-img" />
        </div>
        <div className="ll-players-row">
          {Array.from({ length: Math.min(maxPlayers, 4) }).map((_, i) => (
            <span key={i} className="ll-player-dot">👤</span>
          ))}
          <span className="ll-players-label">{maxPlayers}P</span>
        </div>
      </div>

      <div className="ll-card-mid">
        <div className="ll-fee-row">
          <span className="ll-fee-label">Entry Fee</span>
          <span className="ll-fee-amt">₹{entryFee.toLocaleString("en-IN")}</span>
        </div>
        <div className="ll-prize-row">
          <span className="ll-prize-label">🏆 Win</span>
          <span className="ll-prize-amt">₹{winAmount.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div className="ll-card-right">
        {waiting > 0 && <div className="ll-waiting-badge">⏳ {waiting} waiting</div>}
        <button
          className={`ll-play-btn${hasRoom ? " ll-join-btn" : ""}`}
          disabled={isLoading}
          onClick={() => onPlay(entryFee)}
        >
          {isLoading ? "..." : hasRoom ? `JOIN ${secs}s` : "Play"}
        </button>
      </div>
    </div>
  )
}

const LudoList = () => {
  const navigate = useNavigate()
  const [loadingFee, setLoadingFee] = useState<number | null>(null)
  const [showRules, setShowRules] = useState(false)

  const { data, isLoading, isError, refetch } = useGetLudoTablesQuery(undefined, {
    pollingInterval: 30000,
  })

  const tables: Table[] = data?.data ?? []

  const handlePlay = (entryFee: number) => {
    setLoadingFee(entryFee)
    navigate(`/ludo/play?fee=${entryFee}`)
  }

  return (
    <>
      <div className="ludo-list-page">
        <div className="ll-header">
          <img src="/img/dice2.png" alt="" className="ll-header-icon" />
          <div className="ll-header-text">
            <div className="ll-title">Ludo</div>
            <div className="ll-sub">Choose your table &amp; win big</div>
          </div>
          <button className="ll-rules-btn" onClick={() => setShowRules(true)}>
            <span aria-hidden="true">📜</span> Rules
          </button>
        </div>
        <LudoRulesModal open={showRules} onClose={() => setShowRules(false)} />

        {isLoading && (
          <div className="ll-state-box">
            <div className="ll-spinner" />
            <span>Loading tables...</span>
          </div>
        )}

        {isError && (
          <div className="ll-state-box ll-error">
            <span>Failed to load tables</span>
            <button className="ll-retry-btn" onClick={() => refetch()}>Retry</button>
          </div>
        )}

        {!isLoading && !isError && tables.length === 0 && (
          <div className="ll-state-box">
            <span>No tables available right now</span>
          </div>
        )}

        {!isLoading && !isError && tables.length > 0 && (
          <div className="ll-cards">
            {tables.map((table, idx) => (
              <TableCard
                key={table.entryFee}
                table={table}
                idx={idx}
                onPlay={handlePlay}
                isLoading={loadingFee === table.entryFee}
              />
            ))}
          </div>
        )}

        <p className="ll-footer-note">Fair play • Instant withdrawal • 24×7 support</p>
      </div>
    </>
  )
}

export default LudoList
