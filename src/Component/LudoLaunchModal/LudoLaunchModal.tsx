import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./LudoLaunchModal.scss"

// Set by the login pages on a successful login; the dashboard shows this popup
// once and clears it, so it appears right after every login (not on refresh).
export const LUDO_LAUNCH_FLAG = "showLudoLaunch"

export const markLudoLaunchPopup = () => {
  try { sessionStorage.setItem(LUDO_LAUNCH_FLAG, "1") } catch { /* ignore */ }
}

const LudoLaunchModal = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(LUDO_LAUNCH_FLAG) === "1") {
        sessionStorage.removeItem(LUDO_LAUNCH_FLAG)
        setOpen(true)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  if (!open) return null

  const playNow = () => {
    setOpen(false)
    navigate("/ludo")
  }

  return (
    <div className="llm-overlay" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-labelledby="llm-title">
      <div className="llm-card" onClick={e => e.stopPropagation()}>
        <button className="llm-close" onClick={() => setOpen(false)} aria-label="Close">×</button>

        <div className="llm-hero">
          <span className="llm-badge">🎉 NEW LAUNCH</span>
          <img src="/img/ludo.png" alt="Ludo" className="llm-img" />
          <span className="llm-confetti c1" />
          <span className="llm-confetti c2" />
          <span className="llm-confetti c3" />
          <span className="llm-confetti c4" />
        </div>

        <div className="llm-body">
          <div id="llm-title" className="llm-title">Ludo is now LIVE! 🎲</div>
          <div className="llm-text">
            अब खेलो <b>Ludo</b> और जीतो असली कैश!
            <br />
            Roll the dice, cut your rivals and race home first.
          </div>

          <ul className="llm-points">
            <li><span>💰</span> Entry from just <b>₹100</b></li>
            <li><span>🏆</span> Winner takes <b>90%</b> of the prize pool</li>
            <li><span>⚡</span> Quick 8-minute matches, up to 4 players</li>
          </ul>

          <button className="llm-play" onClick={playNow}>Play Ludo Now</button>
          <button className="llm-later" onClick={() => setOpen(false)}>Maybe later</button>
        </div>
      </div>
    </div>
  )
}

export default LudoLaunchModal
