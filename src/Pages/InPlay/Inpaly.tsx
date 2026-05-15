import { useEffect, useState } from "react"
import { useActiveMatchQuery } from "../../../store/service/odds/oddsServices"
import moment from "moment"
import { Link } from "react-router-dom"
import CommonLodding from "../../Component/CommonLodding"
import "./inplay.scss"

const Inpaly = () => {
  const { data, isLoading } = useActiveMatchQuery()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const allMatches = [
    ...(data?.data?.live || []),
    ...(data?.data?.upcoming || [])
  ]

  const parseTeams = (eventName: string) => {
    const parts = eventName.split(" v ")
    if (parts.length === 2) {
      return { team1: parts[0].trim(), team2: parts[1].trim() }
    }
    return { team1: eventName, team2: "" }
  }

  return (
    <div className={`inplay-page ${visible ? "page-visible" : ""}`}>
      <div className="inplay-container">
        {allMatches.map((match, index) => {
          const { team1, team2 } = parseTeams(match?.eventName || "")
          const isVsMatch = team2 !== ""

          return (
            <Link
              key={match?.gmid}
              to={`/cricket/${match?.beventId}`}
              className="match-card"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="card-shine" />

              {match?.isLive && (
                <div className="live-badge">
                  <span className="live-dot"></span>
                  <span className="live-text">LIVE</span>
                </div>
              )}

              {!match?.isLive && (
                <div className="upcoming-badge">
                  <span className="upcoming-text">UPCOMING</span>
                </div>
              )}

              <div className="match-content">
                {isVsMatch ? (
                  <div className="teams-container">
                    <div className="team-name">{team1}</div>
                    <div className="vs-text">
                      <span className="vs-inner">VS</span>
                      <span className="vs-ring" />
                    </div>
                    <div className="team-name">{team2}</div>
                  </div>
                ) : (
                  <div className="bookmaker-title">{match?.eventName}</div>
                )}
                <div className="league-name-wrapper">
                  <div className="match-time">
                    {moment(match?.matchTime).format("ddd DD MMM hh:mm A")}
                  </div>
                  <div className="league-name">
                    {match?.sportName || ""}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}

        {isLoading && <CommonLodding />}
        {!isLoading && allMatches.length === 0 && (
          <div className="no-matches">
            <div className="no-matches-icon">🏏</div>
            <div>No matches available</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Inpaly
