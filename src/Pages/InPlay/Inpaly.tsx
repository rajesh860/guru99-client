import { useEffect, useState } from "react"
import { useActiveMatchQuery } from "../../../store/service/odds/oddsServices"
import moment from "moment"
import { Link } from "react-router-dom"
import { FaRegClock } from "react-icons/fa"
import CommonLodding from "../../Component/CommonLodding"
import "./inplay.scss"

const Inpaly = () => {
  const { data, isLoading } = useActiveMatchQuery()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const liveMatches = data?.data?.live || []
  const upcomingMatches = data?.data?.upcoming || []
  const allMatches = [...liveMatches, ...upcomingMatches]

  const parseTeams = (eventName: string) => {
    const parts = eventName.split(" v ")
    if (parts.length === 2) return { team1: parts[0].trim(), team2: parts[1].trim() }
    return { team1: eventName, team2: "" }
  }

  return (
    <div className={`inplay-page ${visible ? "page-visible" : ""}`}>

      {liveMatches.length > 0 && (
        <div className="inplay-section">
          {/* <div className="section-label live-label">
            <span className="label-dot" />
            LIVE
            <span className="label-count">{liveMatches.length}</span>
          </div> */}
          <div className="inplay-container">
            {liveMatches.map((match, index) => (
              <MatchCard key={match?.gmid} match={match} index={index} isLive parseTeams={parseTeams} />
            ))}
          </div>
        </div>
      )}

      {upcomingMatches.length > 0 && (
        <div className="inplay-section">
          {/* <div className="section-label upcoming-label">
            UPCOMING
            <span className="label-count">{upcomingMatches.length}</span>
          </div> */}
          <div className="inplay-container">
            {upcomingMatches.map((match, index) => (
              <MatchCard key={match?.gmid} match={match} index={index} isLive={false} parseTeams={parseTeams} />
            ))}
          </div>
        </div>
      )}

      {isLoading && <CommonLodding />}
      {!isLoading && allMatches.length === 0 && (
        <div className="no-matches">
          <div className="no-matches-icon">🏏</div>
          <div>No matches available</div>
        </div>
      )}
    </div>
  )
}

const MatchCard = ({ match, index, isLive, parseTeams }: any) => {
  const { team1, team2 } = parseTeams(match?.eventName || "")
  const isVsMatch = team2 !== ""

  if (isLive) {
    return (
      <Link
        to={`/cricket/${match?.beventId}`}
        className="match-card match-card--live"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        {/* Glow border */}
        <div className="live-glow-border" />

        {/* Header */}
        <div className="card-header">
          <span className="card-sport">🏏 {match?.sportName || "Cricket"}</span>
          <span className="badge badge--live">
            <span className="live-dot" />
            LIVE
          </span>
        </div>

        {/* Teams */}
        <div className="card-body">
          {isVsMatch ? (
            <div className="teams-row">
              <div className="team">
                {/* <div className="team-flag">
                  {team1.slice(0, 2).toUpperCase()}
                </div> */}
                <span className="team-name">{team1}</span>
              </div>
              <div className="vs-wrap">
                <span className="vs-label">VS</span>
              </div>
              <div className="team team--right">
                {/* <div className="team-flag">
                  {team2.slice(0, 2).toUpperCase()}
                </div> */}
                <span className="team-name">{team2}</span>
              </div>
            </div>
          ) : (
            <div className="match-title">{match?.eventName}</div>
          )}
          {match?.liveData?.B && (
            <div className="toss-info">
              🪙 {match.liveData.B}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="card-footer">
          <span className="match-time">
            <FaRegClock size={11} />
            {moment(match?.matchTime).format("ddd DD MMM · hh:mm A")}
          </span>
          <span className="bet-now-btn">BET NOW ›</span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/cricket/${match?.beventId}`}
      className="match-card match-card--upcoming"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="card-top-strip" />

      <div className="card-header">
        <span className="card-sport">🏏 {match?.sportName || "Cricket"}</span>
        <span className="badge badge--upcoming">UPCOMING</span>
      </div>

      <div className="card-body">
        {isVsMatch ? (
          <div className="teams-row">
            <div className="team">
              <span className="team-name">{team1}</span>
            </div>
            <div className="vs-wrap">
              <span className="vs-label">VS</span>
            </div>
            <div className="team team--right">
              <span className="team-name">{team2}</span>
            </div>
          </div>
        ) : (
          <div className="match-title">{match?.eventName}</div>
        )}
      </div>

      <div className="card-footer">
        <span className="match-time">
          <FaRegClock size={11} />
          {moment(match?.matchTime).format("ddd DD MMM · hh:mm A")}
        </span>
        <div className="arrow-icon">›</div>
      </div>
    </Link>
  )
}

export default Inpaly
