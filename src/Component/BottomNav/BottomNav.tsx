import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useActiveMatchQuery } from "../../../store/service/odds/oddsServices"
import "./BottomNav.scss"

const BottomNav = () => {
  const navigate = useNavigate()
  const trackRef = useRef<HTMLDivElement>(null)
  const animRef  = useRef<number | null>(null)
  const pausedRef = useRef(false)

  const { data } = useActiveMatchQuery(undefined, { pollingInterval: 10000 })

  const liveMatches     = data?.data?.live     || []
  const upcomingMatches = data?.data?.upcoming || []

  const allItems = [
    ...liveMatches.map((m: any) => ({ ...m, _type: "live" })),
    ...upcomingMatches.map((m: any) => ({ ...m, _type: "upcoming" })),
  ]

  // Auto-scroll
  useEffect(() => {
    const track = trackRef.current
    if (!track || allItems.length === 0) return

    const SPEED = 0.5
    const tick = () => {
      if (!pausedRef.current && track) {
        track.scrollLeft += SPEED
        if (track.scrollLeft >= track.scrollWidth / 2) {
          track.scrollLeft = 0
        }
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)

    const pause  = () => { pausedRef.current = true }
    const resume = () => { setTimeout(() => { pausedRef.current = false }, 1500) }
    track.addEventListener("mouseenter", pause)
    track.addEventListener("mouseleave", resume)
    track.addEventListener("touchstart", pause, { passive: true })
    track.addEventListener("touchend", resume)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      track.removeEventListener("mouseenter", pause)
      track.removeEventListener("mouseleave", resume)
      track.removeEventListener("touchstart", pause)
      track.removeEventListener("touchend", resume)
    }
  }, [allItems.length])

  if (allItems.length === 0) return null

  // Duplicate for seamless loop
  const doubled = [...allItems, ...allItems]

  const handleClick = (m: any) => {
    navigate(`/cricket/${m.beventId}/${m.gmid}/${m.bid || m.bmarketId}`)
  }

  return (
    <div className="match-ticker-bar" ref={trackRef}>
      {doubled.map((m, i) => (
        <button
          key={`${m.beventId}-${i}`}
          className={`ticker-pill ${m._type === "live" ? "ticker-pill--live" : "ticker-pill--upcoming"}`}
          onClick={() => handleClick(m)}
        >
          {m._type === "live" ? (
            <>
              <span className="ticker-dot" />
              <span className="ticker-name">{m.eventName}</span>
              <span className="ticker-tag ticker-tag--live">LIVE</span>
            </>
          ) : (
            <>
              <span className="ticker-clock">⏰</span>
              <span className="ticker-name">{m.eventName}</span>
              <span className="ticker-tag ticker-tag--soon">SOON</span>
            </>
          )}
        </button>
      ))}
    </div>
  )
}

export default BottomNav
