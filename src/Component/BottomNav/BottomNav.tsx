import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import snackbarUtil from "../../utils/Snackbar"
import "./BottomNav.scss"

const CASINO_GAMES = [
  { to: "/inplay",      label: "Cricket", live: true  },
  { to: "/casino-list", label: "Casino",  live: true  },
  { to: "/satta-matka", label: "Matka",   live: true  },
  { to: "/dice",        label: "Dice",    live: true  },
  { to: "/aviator",     label: "Aviator", live: true  },
]

const MOBILE_BP = 768

const BottomNav = () => {
  const navigate   = useNavigate()
  const barRef     = useRef<HTMLDivElement>(null)
  const rafRef     = useRef<number | null>(null)
  const pausedRef  = useRef(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BP)

  // Track screen size — updates on resize
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BP)
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Infinite scroll — only on mobile
  useEffect(() => {
    const bar = barRef.current
    if (!bar || !isMobile) return

    const SPEED = 0.6
    bar.scrollLeft = bar.scrollWidth / 3

    const tick = () => {
      if (!pausedRef.current && bar) {
        bar.scrollLeft += SPEED
        const oneThird = bar.scrollWidth / 3
        if (bar.scrollLeft >= oneThird * 2) bar.scrollLeft -= oneThird
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    const pause  = () => { pausedRef.current = true }
    const resume = () => { setTimeout(() => { pausedRef.current = false }, 2000) }

    bar.addEventListener("mouseenter", pause)
    bar.addEventListener("mouseleave", resume)
    bar.addEventListener("touchstart", pause, { passive: true })
    bar.addEventListener("touchend",   resume)

    return () => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      bar.removeEventListener("mouseenter", pause)
      bar.removeEventListener("mouseleave", resume)
      bar.removeEventListener("touchstart", pause)
      bar.removeEventListener("touchend",   resume)
    }
  }, [isMobile])

  const items = isMobile
    ? [...CASINO_GAMES, ...CASINO_GAMES, ...CASINO_GAMES]
    : CASINO_GAMES

  return (
    <div
      className={`casino-btn-bar ${isMobile ? "casino-btn-bar--mobile" : "casino-btn-bar--desktop"}`}
      ref={barRef}
    >
      {items.map((game, i) => (
        <button
          key={`${game.to}-${i}`}
          className={`casino-btn ${game.live ? "casino-btn--live" : "casino-btn--off"}`}
          onClick={() => {
            if (game.live) navigate(game.to)
            else snackbarUtil.info("Coming Soon!")
          }}
        >
          {game.live && <span className="casino-btn-dot" />}
          <span className="casino-btn-label">{game.label}</span>
          {game.live
            ? <span className="casino-btn-live-tag">LIVE</span>
            : <span className="casino-btn-soon-tag">SOON</span>
          }
        </button>
      ))}
    </div>
  )
}

export default BottomNav
