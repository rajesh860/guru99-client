import { useEffect, useState } from "react"
import { useGetScorecardQuery } from "../../../../store/service/scorecard/scorecardService"
import { useGetLiveCricketScoreQuery } from "../../../../store/service/cricketScore/cricketScoreService"
import "./ScoreCard.scss"

interface Props {
  eventId: string
  expanded: boolean
  onToggle?: () => void
}

interface ScoreData {
  team1?: string
  team2?: string
  score1?: string
  score2?: string
  overs1?: string
  overs2?: string
  crr?: string
  rrr?: string
  target?: string
  status?: string
  lastWicket?: string
  partnership?: string
  recentOvers?: string[]
  batsmen?: Array<{
    name: string
    runs: string
    balls: string
    fours: string
    sixes: string
    sr: string
  }>
  bowlers?: Array<{
    name: string
    wickets: string
    overs: string
    economy: string
  }>
}

const ScoreCard = ({ eventId, expanded, onToggle }: Props) => {
  const { data: scoreData, isLoading, refetch } = useGetScorecardQuery(eventId, {
    pollingInterval: 1000,
  })

  const { data: liveScoreData } = useGetLiveCricketScoreQuery(eventId, {
    pollingInterval: 2000,
    skip: !eventId,
  })

  if (isLoading) {
    return <div className="scorecard-loading">Loading...</div>
  }

  const apiData = liveScoreData?.data || scoreData?.data?.data
  const team1 = apiData?.spnnation1 || "Team 1"
  const team2 = apiData?.spnnation2 || "Team 2"
  const score1 = apiData?.score1 || ""
  const score2 = apiData?.score2 || ""
  const runrate1 = apiData?.spnrunrate1 || ""
  const runrate2 = apiData?.spnrunrate2 || ""
  const message = apiData?.spnmessage || ""
  const balls = apiData?.balls || []
  const isFinished = apiData?.isfinished === "1"
  const activeTeam = apiData?.activenation1 === "1" ? team1 : team2
  const activeScore = apiData?.activenation1 === "1" ? score1 : score2
  const activeCRR = apiData?.activenation1 === "1" ? runrate1 : runrate2

  // Compact View (Image 1 style)
  if (!expanded) {
    return (
      <div className="scorecard-compact" onClick={onToggle}>
        <div className="scorecard-header">
          <div className="team-abbr">{activeTeam}</div>
          <div className={`status-badge ${isFinished ? 'finished' : 'ball'}`}>
            {isFinished ? 'Finished' : 'Live'}
          </div>
        </div>
        
        <div className="score-main">
          <div className="score-display">
            <span className="runs">{activeScore || "0-0"}</span>
          </div>
        </div>

        <div className="score-details">
          <div className="rate-info">
            <span>CRR: <strong>{activeCRR || "0.00"}</strong></span>
          </div>
        </div>

        {message && (
          <div className="match-status">
            {message}
          </div>
        )}

        {balls.length > 0 && (
          <div className="recent-overs">
            <span className="over-label">Recent Balls</span>
            <div className="balls">
              {balls.map((ball: string, index: number) => (
                <span 
                  key={index} 
                  className={`ball ${ball === 'ww' ? 'wicket' : ball === 'w' || ball === 'wd' ? 'wide' : ball === '4' ? 'four' : ball === '6' ? 'six' : ''}`}
                >
                  {ball === 'ww' ? 'W' : ball === 'w' || ball === 'wd' ? 'WD' : ball}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Show both teams scores in compact view */}
        {(score1 || score2) && (
          <div className="both-teams-score">
            {/* {score1 && (
              <div className="team-score">
                <span className="team-name">{team1}</span>
                <span className="score">{score1}</span>
                {runrate1 && <span className="rr">RR: {runrate1}</span>}
              </div>
            )} */}
            {score2 && (
              <div className="team-score">
                <span className="team-name">{team2}</span>
                <span className="score">{score2}</span>
                {runrate2 && <span className="rr">RR: {runrate2}</span>}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Expanded View (Image 2 style)
  return (
    <div className="scorecard-expanded" onClick={onToggle}>
      <div className="scorecard-header">
        <div className="team-abbr">{activeTeam}</div>
        <div className={`status-badge ${isFinished ? 'finished' : 'ball'}`}>
          {isFinished ? 'Finished' : 'Live'}
        </div>
      </div>
      
      <div className="score-main">
        <div className="score-display">
          <span className="runs">{activeScore || "0-0"}</span>
        </div>
      </div>

      <div className="score-details">
        <div className="rate-info">
          <span>CRR: <strong>{activeCRR || "0.00"}</strong></span>
        </div>
      </div>

      {message && (
        <div className="match-status">
          {message}
        </div>
      )}

      {balls.length > 0 && (
        <div className="recent-balls">
          <div className="balls">
            {balls.map((ball: string, index: number) => (
              <span 
                key={index} 
                className={`ball ${ball === 'ww' ? 'wicket' : ball === 'w' || ball === 'wd' ? 'wide' : ball === '4' ? 'four' : ball === '6' ? 'six' : ball === '.' ? 'dot' : ''}`}
              >
                {ball === 'ww' ? 'W' : ball === 'w' || ball === 'wd' ? 'WD' : ball === '.' ? '•' : ball}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Batsmen Table */}
      <div className="stats-table">
        <table>
          <thead>
            <tr>
              <th className="text-left">Batter</th>
              <th>R (B)</th>
              <th>4s</th>
              <th>6s</th>
              <th>SR</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-left">
                Batsman 1 <span className="bat-icon">🏏</span>
              </td>
              <td>0 (0)</td>
              <td>0</td>
              <td>0</td>
              <td>0.0</td>
            </tr>
            <tr>
              <td className="text-left">Batsman 2</td>
              <td>0 (0)</td>
              <td>0</td>
              <td>0</td>
              <td>0.0</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Partnership & Last Wicket */}
      <div className="match-info">
        <div className="info-item">P'ship - (-)</div>
        <div className="info-item">Last wkt: -</div>
      </div>

      {/* Bowler Table */}
      <div className="stats-table">
        <table>
          <thead>
            <tr>
              <th className="text-left">Bowler</th>
              <th>W-R</th>
              <th>Over</th>
              <th>Econ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-left">Bowler 1</td>
              <td>0-0</td>
              <td>0.0</td>
              <td>0.00</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Show both teams scores */}
      {(score1 || score2) && (
        <div className="both-teams-score">
          {score1 && (
            <div className="team-score">
              <span className="team-name">{team1}</span>
              <span className="score">{score1}</span>
              {runrate1 && <span className="rr">RR: {runrate1}</span>}
            </div>
          )}
          {score2 && (
            <div className="team-score">
              <span className="team-name">{team2}</span>
              <span className="score">{score2}</span>
              {runrate2 && <span className="rr">RR: {runrate2}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ScoreCard
