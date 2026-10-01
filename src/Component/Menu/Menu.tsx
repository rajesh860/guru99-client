import { useEffect, useRef, useState } from "react"
import "./menu.scss"
import { Link } from "react-router-dom"
import { useGetMessageQuery } from "../../../store/service/userServices/userServices"

// Pixels/second the message travels at.
const SPEED = 80
// Pause (seconds) after the message has fully left the screen, before it re-enters.
const PAUSE = 1.5

const Menu = () => {
  const token = localStorage.getItem("client-token")

  const { data: msgData } = useGetMessageQuery(undefined, { skip: !token })

  const marqueeText =
    msgData?.data?.[0]?.content ||
    msgData?.data?.content ||
    "IF ANYBODY FOUND CHEATING OR GROUP BETTING. THE BETS WILL BE VOIDED WITHOUT PRIOR NOTICE."

  const wrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLSpanElement>(null)
  const [anim, setAnim] = useState<{ start: number; end: number; crossPct: number; duration: number } | null>(null)

  useEffect(() => {
    const measure = () => {
      const wrapW = wrapRef.current?.offsetWidth ?? 0
      const trackW = trackRef.current?.offsetWidth ?? 0
      if (!wrapW || !trackW) return
      const crossDuration = (wrapW + trackW) / SPEED
      const total = crossDuration + PAUSE
      setAnim({
        start: wrapW,
        end: -trackW,
        crossPct: (crossDuration / total) * 100,
        duration: total,
      })
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [marqueeText])

  return (
    <div className="menu_marqueee">
      <ul className="navMain">
        <li className="active">
          <Link to="#" className="mar_head" style={{ height: "30px" }}>
            <div className="mq-wrap" ref={wrapRef}>
              {anim && (
                <style>{`
                  @keyframes mqScroll {
                    0% { transform: translateX(${anim.start}px); }
                    ${anim.crossPct}% { transform: translateX(${anim.end}px); }
                    100% { transform: translateX(${anim.end}px); }
                  }
                `}</style>
              )}
              <span
                ref={trackRef}
                className="mq-track"
                style={anim ? { animation: `mqScroll ${anim.duration}s linear infinite` } : { visibility: "hidden" }}
              >
                {marqueeText}
              </span>
            </div>
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default Menu
