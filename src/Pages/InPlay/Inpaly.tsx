import { useEffect, useState } from "react"
import { useActiveMatchQuery } from "../../../store/service/odds/oddsServices"
import moment from "moment"
import { Link } from "react-router-dom"
import { MdOutlineLiveTv } from "react-icons/md"
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
      <div className="inplay-container">
        {liveMatches.map((match, index) => (
          <MatchCard key={match?.gmid} match={match} index={index} isLive parseTeams={parseTeams} />
        ))}
        {upcomingMatches.map((match, index) => (
          <MatchCard key={match?.gmid} match={match} index={index + liveMatches.length} isLive={false} parseTeams={parseTeams} />
        ))}
      </div>

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

const OddsBox = ({ label, value, susp }: { label: string; value: number | null; susp?: boolean }) => (
  <div className={`odds-box odds-${label.toLowerCase()}`}>
    <span className="odds-label">{label}</span>
    <span className="odds-value">{susp ? "—" : (value && value > 0 ? value.toFixed(2) : "-")}</span>
  </div>
)

const MatchCard = ({ match, index, isLive, parseTeams }: any) => {
  const parsed = parseTeams(match?.eventName || "")
  const team1Name = match?.odds?.team1?.name || parsed.team1
  const team2Name = match?.odds?.team2?.name || parsed.team2
  const isVsMatch = !!team2Name

  const t1 = match?.odds?.team1
  const t2 = match?.odds?.team2
  const susp = (o: any) => o?.status !== "ACTIVE"

  const hasOdds   = !!match?.odds?.hasMatchOdds
  const hasFancy  = !!match?.odds?.hasFancy
  const hasBM     = !!match?.odds?.hasBookmaker

  const date = moment(match?.matchTime).format("DD MMM")
  const time = moment(match?.matchTime).format("HH:mm")

  const to = isLive
    ? `/cricket/${match?.beventId}/${match?.gmid}/${match?.bid}/${(match?.scoreMatchKey || '').split('/')[1] || ''}`
    : `/cricket/${match?.beventId}/${match?.gmid}/${match?.bid}`

  if (match?.isSeries) {
    return (
      <Link
        to={to}
        className={`match-card ${isLive ? "match-card--live" : "match-card--upcoming"}`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="match-card__header">
          {isLive
            ? <span className="live-badge"><span className="live-dot" />LIVE</span>
            : <span className="upcoming-badge">Upcoming</span>
          }
          <span className="league-name">{match?.sportName || "Cricket"}</span>
          <span className="match-time">{date} • {time}</span>
        </div>
        <div className="match-card__body">
          <div className="team-col team-col--left">
            <div className="team-name-row">
              <span className="team-name">{match?.eventName}</span>
            </div>
            <div className="odds-row">
              <OddsBox label="Back" value={null} />
              <OddsBox label="Lay"  value={null} />
            </div>
          </div>
          <div className="match-card__center">
            <span className="sport-emoji">🏏</span>
          </div>
          <div className="team-col team-col--right">
            <div className="team-name-row">
              <span className="team-name">&nbsp;</span>
            </div>
            <div className="odds-row">
              <OddsBox label="Back" value={null} />
              <OddsBox label="Lay"  value={null} />
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={to}
      className={`match-card ${isLive ? "match-card--live" : "match-card--upcoming"}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header */}
      <div className="match-card__header">
        {isLive
          ? <span className="live-badge"><span className="live-dot" />LIVE</span>
          : <span className="upcoming-badge">Upcoming</span>
        }
        <span className="league-name">{match?.sportName || "Cricket"}</span>
        <span className="match-time">{date} • {time}</span>
      </div>

      {/* Body */}
      <div className="match-card__body">
        <div className="team-col team-col--left">
          <div className="team-name-row">
            <span className="team-name">{team1Name}</span>
          </div>
          <div className="odds-row">
            <OddsBox label="Back" value={hasOdds ? (t1?.back ?? null) : null} susp={hasOdds ? susp(t1) : false} />
            <OddsBox label="Lay"  value={hasOdds ? (t1?.lay  ?? null) : null} susp={hasOdds ? susp(t1) : false} />
          </div>
        </div>

        <div className="match-card__center">
          <span className="sport-emoji">🏏</span>
          <span className="vs-text">vs</span>
        </div>

        <div className="team-col team-col--right">
          <div className="team-name-row">
            <span className="team-name">{isVsMatch ? team2Name : ""}</span>
          </div>
          {isVsMatch && (
            <div className="odds-row">
              <OddsBox label="Back" value={hasOdds ? (t2?.back ?? null) : null} susp={hasOdds ? susp(t2) : false} />
              <OddsBox label="Lay"  value={hasOdds ? (t2?.lay  ?? null) : null} susp={hasOdds ? susp(t2) : false} />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {(hasOdds || hasFancy || hasBM) && (
        <div className="match-card__footer">
          {hasOdds  && <span className="mc-badge"><MdOutlineLiveTv /></span>}
          {hasFancy && <span className="mc-badge mc-badge--text">F</span>}
          {hasBM    && <span className="mc-badge mc-badge--text">BM</span>}
        </div>
      )}
    </Link>
  )
}

export default Inpaly
