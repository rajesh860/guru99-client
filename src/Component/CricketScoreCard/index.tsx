import './styles.scss'
import { useEffect, useRef, useState } from 'react'

interface Innings {
  runs: number
  wickets: number
  overs: string | number
}

interface Ball {
  t: number
  u: string | number
  bf?: string
  d?: number
  _key?: string
  divider?: boolean
}

interface OverSummary {
  type: string
  p1?: string
  s1?: string
  p2?: string
  s2?: string
  bowler?: string
  bf?: string
  runs?: number
  c1?: string
}

interface LiveData {
  B?: string
  s?: string
  q?: string
  rb?: Array<{ o: string | number; b: Ball[]; bt?: string; r?: number; ts?: string; i?: number }>
}

interface InningsInfo {
  runs?: number; wickets?: number; overs?: string | number; team?: string
}

interface ScoreData {
  score?: {
    format?: string
    status?: string
    team1Key?: string
    team2Key?: string
    innings1?: Innings | null
    innings2?: Innings | null
    innings3?: Innings | null
    innings4?: Innings | null
    startTime?: number
    raw?: { j?: string }
  }
  innings?: {
    innings1?: InningsInfo | null
    innings2?: InningsInfo | null
    innings3?: InningsInfo | null
    innings4?: InningsInfo | null
  }
  v1?: OverSummary[]
  liveData?: LiveData
  teams?: {
    team1?: { name?: string; batting?: boolean; key?: string }
    team2?: { name?: string; batting?: boolean; key?: string }
  }
  ename?: string
}

interface Props {
  scoreData?: ScoreData
}

function oversToMath(o: string | number | undefined): number {
  if (!o) return 0
  const parts = String(o).split('.')
  return parseInt(parts[0]) + (parseInt(parts[1] || '0') / 6)
}

function calcCRR(runs: number, overs: string | number): string | null {
  const math = oversToMath(overs)
  if (!math) return null
  return (runs / math).toFixed(2)
}

function fmtTime(epoch: number): string {
  if (!epoch) return ''
  return new Date(epoch).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

function fmtDate(epoch: number): string {
  if (!epoch) return ''
  return new Date(epoch).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

function getTeamShort(name: string): string {
  if (!name) return ''
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return name.substring(0, 3).toUpperCase()
  return words.map(w => w[0]).join('').toUpperCase().substring(0, 3)
}

const BREAK_KEYWORDS = ['lunch', 'tea', 'dinner', 'break', 'stumps', 'rain', 'drinks', 'day', 'interval', 'timeout', 'bad light', 'close']
function isBreakStatus(b: string): boolean {
  if (b.startsWith('^')) return true  // API session/break markers e.g. "^2", "^1PW"
  const v = b.toLowerCase().trim()
  return BREAK_KEYWORDS.some(k => v.includes(k))
}

function rbBallClass(t: number, u: string | number): string {
  if (t === 1) return 'ball-wicket'
  if (t === 2) return u === '6' ? 'ball-six' : 'ball-four'
  if (t === 3) return 'ball-six'
  if (t === 4) return 'ball-wide'
  if (t === 5) return 'ball-noball'
  const str = String(u).toLowerCase()
  if (str === 'wd') return 'ball-wide'
  if (str === 'nb') return 'ball-noball'
  if (parseInt(String(u)) > 0) return 'ball-run'
  return 'ball-dot'
}

function rbBallLabel(t: number, u: string | number): string | number {
  if (t === 1) return 'W'
  if (t === 4) return 'Wd'
  if (t === 5) return 'Nb'
  const str = String(u).toLowerCase()
  if (str === 'wd') return 'Wd'
  if (str === 'nb') return 'Nb'
  return u === '0' || u === 0 ? '•' : u
}

function parseBatScore(s?: string): { runs: number; balls: number } {
  const m = String(s || '').match(/^(\d+)\((\d+)\)/)
  if (!m) return { runs: 0, balls: 0 }
  return { runs: parseInt(m[1]), balls: parseInt(m[2]) }
}

function playCrowdCheer(ctx: AudioContext, isSix: boolean): void {
  const duration = isSix ? 2.8 : 2.0
  const sr = ctx.sampleRate
  const buf = ctx.createBuffer(2, Math.floor(sr * duration), sr)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const src = ctx.createBufferSource()
  src.buffer = buf

  const lpf = ctx.createBiquadFilter()
  lpf.type = 'lowpass'
  lpf.frequency.value = 900

  const bpf = ctx.createBiquadFilter()
  bpf.type = 'bandpass'
  bpf.frequency.value = 350
  bpf.Q.value = 0.6

  const gain = ctx.createGain()
  const peak = isSix ? 0.38 : 0.28
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(peak, ctx.currentTime + 0.12)
  gain.gain.setValueAtTime(peak, ctx.currentTime + duration * 0.55)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  src.connect(lpf)
  lpf.connect(bpf)
  bpf.connect(gain)
  gain.connect(ctx.destination)
  src.start()
  src.stop(ctx.currentTime + duration)
}

function playBallAudio(val: string): void {
  const isSix = val === '6'

  try {
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel()
      const lines = isSix
        ? ['Six!', 'That is a maximum!']
        : ['Four!', 'Shot to the boundary!']

      lines.forEach((text, i) => {
        const u = new SpeechSynthesisUtterance(text)
        u.lang = 'en-IN'
        u.rate  = i === 0 ? 0.78 : 0.92
        u.pitch = isSix ? (i === 0 ? 1.6 : 1.3) : (i === 0 ? 1.4 : 1.1)
        u.volume = 1
        speechSynthesis.speak(u)
      })
    }
  } catch { /* speech blocked */ }

  try {
    const ctx = new AudioContext()
    playCrowdCheer(ctx, isSix)

    const master = ctx.createGain()
    master.gain.value = 0.22
    master.connect(ctx.destination)

    const chime = (freq: number, t: number, dur: number) => {
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      const g = ctx.createGain()
      osc.connect(g); g.connect(master)
      osc.frequency.value = freq
      g.gain.setValueAtTime(1, ctx.currentTime + t)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + dur)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + dur)
    }

    if (isSix) {
      chime(523,  0,    0.25)
      chime(659,  0.18, 0.25)
      chime(784,  0.36, 0.25)
      chime(1046, 0.54, 0.45)
      chime(1318, 0.72, 0.55)
    } else {
      chime(523,  0,    0.22)
      chime(784,  0.18, 0.22)
      chime(1046, 0.36, 0.38)
    }
  } catch { /* audio blocked */ }
}

function playWicketAudio(): void {
  try {
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel()
      const lines = ['Out!', 'He is gone!']
      lines.forEach((text, i) => {
        const u = new SpeechSynthesisUtterance(text)
        u.lang = 'en-IN'
        u.rate  = i === 0 ? 0.65 : 0.85
        u.pitch = i === 0 ? 0.7 : 0.85
        u.volume = 1
        speechSynthesis.speak(u)
      })
    }
  } catch { /* speech blocked */ }

  try {
    const ctx = new AudioContext()
    const duration = 2.2
    const sr = ctx.sampleRate
    const buf = ctx.createBuffer(2, Math.floor(sr * duration), sr)
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch)
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buf
    const lpf = ctx.createBiquadFilter()
    lpf.type = 'lowpass'
    lpf.frequency.value = 600
    const ng = ctx.createGain()
    ng.gain.setValueAtTime(0, ctx.currentTime)
    ng.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.08)
    ng.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    noise.connect(lpf); lpf.connect(ng); ng.connect(ctx.destination)
    noise.start(); noise.stop(ctx.currentTime + duration)

    const master = ctx.createGain()
    master.gain.value = 0.20
    master.connect(ctx.destination)
    const drum = (freq: number, t: number) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      const g = ctx.createGain()
      osc.connect(g); g.connect(master)
      osc.frequency.setValueAtTime(freq, ctx.currentTime + t)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.3, ctx.currentTime + t + 0.35)
      g.gain.setValueAtTime(1, ctx.currentTime + t)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.5)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + 0.55)
    }
    drum(180, 0)
    drum(140, 0.18)
    drum(110, 0.36)
  } catch { /* audio blocked */ }
}

function ballEventClass(val: string): string {
  if (val === '6') return 'be-six'
  if (val === '4') return 'be-four'
  if (val.toLowerCase() === 'w') return 'be-wicket'
  if (val.toLowerCase() === 'wd') return 'be-wide'
  if (val.toLowerCase() === 'nb') return 'be-noball'
  if (val.toLowerCase() === 'o') return 'be-over'
  if (parseInt(val) > 0) return 'be-run'
  return 'be-dot'
}

function ballEventLabel(val: string): string {
  if (val === '6') return 'SIX!'
  if (val === '4') return 'FOUR!'
  if (val.toLowerCase() === 'w') return 'OUT!'
  if (val.toLowerCase() === 'wd') return 'Wide'
  if (val.toLowerCase() === 'nb') return 'No Ball'
  if (val.toLowerCase() === 'o') return 'Over'
  if (val === '0') return 'Dot'
  if (val.toLowerCase() === 'b') return 'Ball'
  const n = parseInt(val)
  if (!isNaN(n) && n > 0) return `${n} Run${n === 1 ? '' : 's'}`
  return 'Ball'
}

const CricketScoreCard = ({ scoreData }: Props) => {
  const prevBallRef = useRef<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)

  const rawB0 = scoreData?.liveData?.B ? String(scoreData.liveData.B).trim() : null
  const lastBallEarly = rawB0 && !isBreakStatus(rawB0) ? rawB0 : null

  useEffect(() => {
    if (!lastBallEarly) return
    if (lastBallEarly === prevBallRef.current) return
    prevBallRef.current = lastBallEarly
    if (!voiceOn) return
    if (lastBallEarly === '4' || lastBallEarly === '6') {
      playBallAudio(lastBallEarly)
    } else if (lastBallEarly.toLowerCase() === 'w') {
      playWicketAudio()
    }
  }, [lastBallEarly, voiceOn])

  if (!scoreData) return null

  const score = scoreData.score
  const v1 = scoreData.v1 || []
  const liveData = scoreData.liveData || {}
  const teams = scoreData.teams || {}
  const ename = scoreData.ename || ''

  if (!score) return null

  const { format, status, team1Key, team2Key, innings1, innings2, innings3, innings4, startTime, raw = {} } = score

  const team1Name = teams.team1?.name || team1Key || ''
  const team2Name = teams.team2?.name || team2Key || ''
  const t1Key = teams.team1?.key || team1Key || ''
  const t2Key = teams.team2?.key || team2Key || ''

  // Upcoming match view
  if (!innings1 && !innings2) {
    return (
      <div className="cscard-upcoming">
        <div className="upcoming-badge-row">
          <span className="upcoming-badge">UPCOMING</span>
          {ename && <span className="upcoming-ename">{ename}</span>}
        </div>
        <div className="upcoming-teams">
          <div className="upcoming-team upcoming-team-left">
            <div className="upcoming-team-abbr">{getTeamShort(team1Name)}</div>
            <div className="upcoming-team-name">{team1Name}</div>
          </div>
          <div className="upcoming-vs-block">
            <div className="upcoming-vs">VS</div>
            {startTime && (
              <>
                <div className="upcoming-time">{fmtTime(startTime)}</div>
                <div className="upcoming-date">{fmtDate(startTime)}</div>
              </>
            )}
          </div>
          <div className="upcoming-team upcoming-team-right">
            <div className="upcoming-team-abbr">{getTeamShort(team2Name)}</div>
            <div className="upcoming-team-name">{team2Name}</div>
          </div>
        </div>
      </div>
    )
  }

  // Live match view
  const team1Batting = teams.team1?.batting ?? !!innings1
  const team2Batting = teams.team2?.batting ?? !!innings2

  const latestSummary = v1.find(x => x.type === 'o')
  const batsman1 = latestSummary ? { name: latestSummary.p1, score: latestSummary.s1 } : null
  const batsman2 = latestSummary ? { name: latestSummary.p2, score: latestSummary.s2 } : null
  const bowlerName = latestSummary?.bowler || null

  const latestBall = v1.find(x => x.type === 'b')
  const lastCommentary = latestBall?.c1 || ''

  const rawB = liveData.B && String(liveData.B).trim() !== '' ? String(liveData.B) : null
  const lastBall = rawB && !isBreakStatus(rawB) ? rawB : null
  const breakLabel = rawB && isBreakStatus(rawB) ? rawB : null

  const activeInningsNumber = innings4 ? 4 : innings3 ? 3 : innings2 ? 2 : 1
  const activeInnings = innings4 || innings3 || innings2 || innings1
  const crr = activeInnings && activeInnings.runs > 0
    ? calcCRR(activeInnings.runs, activeInnings.overs)
    : null

  let chaseInfo: { battingName: string; needed: number; ballsLeft: number } | null = null
  if (innings1 && innings2 && !innings3) {
    const target = innings1.runs + 1
    const needed = target - innings2.runs
    const i2Parts = String(innings2.overs).split('.')
    const i1Parts = String(innings1.overs).split('.')
    const ballsBowled = parseInt(i2Parts[0]) * 6 + parseInt(i2Parts[1] || '0')
    const maxBalls    = parseInt(i1Parts[0]) * 6 + parseInt(i1Parts[1] || '0')
    const ballsLeft   = maxBalls - ballsBowled
    const battingName = team2Batting ? team2Name : team1Name
    if (needed > 0 && ballsLeft > 0) {
      chaseInfo = { battingName, needed, ballsLeft }
    }
  }

  // Recent balls — current innings, current over only
  const rbOvers = liveData.rb || []
  const currentInningsIdx = activeInningsNumber - 1
  const currentInningsOvers = rbOvers.filter(o => o.i === currentInningsIdx)
  const currentOver = currentInningsOvers[currentInningsOvers.length - 1]
  const recentBalls: Ball[] = []
  if (currentOver) {
    ;(currentOver.b || []).forEach((ball, bi) => {
      recentBalls.push({ ...ball, _key: `${currentOver.o}-${bi}` })
    })
  }
  const hasRecentBalls = recentBalls.length > 0

  const bowlerMap: Record<string, { name: string; overs: number; runs: number }> = {}
  v1.filter(x => x.type === 'o' && x.bf && x.bowler).forEach(o => {
    const key = o.bf!
    if (!bowlerMap[key]) bowlerMap[key] = { name: o.bowler!, overs: 0, runs: 0 }
    bowlerMap[key].overs++
    bowlerMap[key].runs += (o.runs || 0)
  })
  const bowlerRows = Object.values(bowlerMap)

  const bat1Stats = parseBatScore(batsman1?.score)
  const bat2Stats = parseBatScore(batsman2?.score)

  const parseLiveScore = (s?: string): { runs: number; balls: number } => {
    const clean = (s || '').replace('*', '').replace('+', '')
    const parts = clean.split('.')
    return { runs: parseInt(parts[0] || '0') || 0, balls: parseInt(parts[1] || '0') || 0 }
  }
  const sLive = liveData.s ? parseLiveScore(liveData.s) : null
  const qLive = liveData.q ? parseLiveScore(liveData.q) : null

  let bat1LiveStats = bat1Stats
  let bat2LiveStats = bat2Stats

  if (sLive && qLive) {
    const sDiffBat1 = Math.abs(sLive.runs - bat1Stats.runs)
    const sDiffBat2 = Math.abs(sLive.runs - bat2Stats.runs)
    if (sDiffBat1 <= sDiffBat2) {
      bat1LiveStats = sLive
      bat2LiveStats = qLive
    } else {
      bat1LiveStats = qLive
      bat2LiveStats = sLive
    }
  } else if (sLive) {
    const sDiffBat1 = Math.abs(sLive.runs - bat1Stats.runs)
    const sDiffBat2 = Math.abs(sLive.runs - bat2Stats.runs)
    if (sDiffBat1 <= sDiffBat2) bat1LiveStats = sLive
    else bat2LiveStats = sLive
  }


  const breakStatus = !lastBall ? (status?.trim() || breakLabel || null) : (breakLabel || null)

  return (
    <div className={`cscard${expanded ? ' cscard-expanded' : ''}`} onClick={() => setExpanded(e => !e)}>
      {/* Header */}
      <div className="cscard-header">
        <span className="cscard-live">
          <span className="live-dot" />
          LIVE
        </span>
        {ename
          ? <span className="cscard-ename">{ename}</span>
          : format && <span className="cscard-format">{format}</span>
        }
        {startTime && <span className="cscard-time">⏱ {fmtTime(startTime)}</span>}
        <button
          className={`cscard-voice-btn${voiceOn ? ' voice-on' : ''}`}
          onClick={e => { e.stopPropagation(); setVoiceOn(v => !v) }}
          title={voiceOn ? 'Mute commentary' : 'Enable commentary'}
        >
          {voiceOn ? '🔊' : '🔇'}
        </button>
      </div>

      {/* Main Score */}
      <div className="cscard-scores">
        {(() => {
          const inningsTeamMap = scoreData?.innings || {}
          const inn1Team = inningsTeamMap.innings1?.team
          const inn2Team = inningsTeamMap.innings2?.team

          // Determine which team batted first using innings team mapping
          let t1First: boolean
          if (inn1Team) t1First = inn1Team === t1Key
          else if (inn2Team) t1First = inn2Team !== t1Key
          else t1First = true

          const t1InningsList = (t1First
            ? [innings1, innings3]
            : [innings2, innings4]
          ).filter((x): x is Innings => !!x)

          const t2InningsList = (t1First
            ? [innings2, innings4]
            : [innings1, innings3]
          ).filter((x): x is Innings => !!x)

          const leftName  = team1Batting ? team1Name : team2Name
          const rightName = team1Batting ? team2Name : team1Name
          const leftList  = team1Batting ? t1InningsList : t2InningsList
          const rightList = team1Batting ? t2InningsList : t1InningsList

          const renderTeamScore = (list: Innings[]) => {
            if (list.length === 0) return <span className="cs-ytb">Yet to bat</span>
            if (list.length === 1) {
              const inn = list[0]
              return (
                <span className="cs-score">
                  <strong>{inn.runs}/{inn.wickets}</strong>
                  <span className="cs-overs">({inn.overs} ov)</span>
                </span>
              )
            }
            // Test match: show "413/10 & 48/2 (18 ov)"
            const prev = list[0]
            const curr = list[list.length - 1]
            return (
              <span className="cs-score">
                <span className="cs-prev-score">{`${prev.runs}/${prev.wickets} & `}</span>
                <strong>{curr.runs}/{curr.wickets}</strong>
                <span className="cs-overs">({curr.overs} ov)</span>
              </span>
            )
          }

          return (
            <>
              <div className="cs-team batting">
                <span className="cs-team-key">
                  <span className="bat-icon">🏏</span>
                  {leftName}
                </span>
                {renderTeamScore(leftList)}
              </div>

              <div className="cs-lastball">
                <span className="cs-vs">vs</span>
              </div>

              <div className="cs-team team-right">
                <span className="cs-team-key">{rightName}</span>
                {renderTeamScore(rightList)}
              </div>
            </>
          )
        })()}
      </div>

      {/* Ball Event Banner */}
      {lastBall && (
        <div key={lastBall} className={`cscard-ball-event ${ballEventClass(lastBall)}`}>
          <span className="be-label">{ballEventLabel(lastBall)}</span>
        </div>
      )}

      {/* CRR */}
      {crr && (
        <div className="cscard-rates">
          <span className="rate-chip">CRR <strong>{crr}</strong></span>
          {raw.j && (
            <span className="rate-chip score-raw">{raw.j.replace('(', ' (').trim()})</span>
          )}
        </div>
      )}

      {/* Chase banner */}
      {chaseInfo && (
        <div className="cscard-chase">
          <span className="chase-team">{chaseInfo.battingName}</span>
          <span className="chase-text"> need </span>
          <strong className="chase-runs">{chaseInfo.needed}</strong>
          <span className="chase-text"> runs from </span>
          <strong className="chase-balls">{chaseInfo.ballsLeft}</strong>
          <span className="chase-text"> balls</span>
        </div>
      )}

      {/* Batsmen */}
      {(batsman1 || batsman2) && (
        <div className="cscard-players">
          <div className="players-col batsmen">
            {batsman1?.name && (
              <div className="player-row">
                <span className="player-icon">🏏</span>
                <span className="player-name">{batsman1.name}</span>
                <span className="player-score">{bat1LiveStats.runs}({bat1LiveStats.balls})</span>
              </div>
            )}
            {batsman2?.name && (
              <div className="player-row">
                <span className="player-icon">🏏</span>
                <span className="player-name">{batsman2.name}</span>
                <span className="player-score">{bat2LiveStats.runs}({bat2LiveStats.balls})</span>
              </div>
            )}
          </div>
          {(() => {
            const bowlerFromCommentary = lastCommentary?.split(' to ')[0]?.trim() || bowlerName
            return bowlerFromCommentary ? (
              <div className="players-col bowler">
                <div className="player-row">
                  <span className="player-icon">🎯</span>
                  <span className="player-name">{bowlerFromCommentary}</span>
                </div>
              </div>
            ) : null
          })()}
        </div>
      )}

      {/* Recent Balls */}
      {hasRecentBalls && (
        <div className="cscard-balls">
          <span className="balls-label">Recent</span>
          <div className="balls-row">
            {recentBalls.map((item) =>
              item.divider ? (
                <span key={item._key} className="balls-sep">|</span>
              ) : (
                <span key={item._key} className={`ball ${rbBallClass(item.t, item.u)}`}>
                  {rbBallLabel(item.t, item.u)}
                </span>
              )
            )}
          </div>
        </div>
      )}

      {/* Expanded-only sections */}
      {expanded && (
        <>
          {/* Bowler Summary */}
          {/* {bowlerRows.length > 0 && (
            <div className="cscard-bowler-summary">
              <div className="bs-title">Bowler Summary</div>
              <table className="bs-table">
                <thead>
                  <tr>
                    <th className="bs-th bs-th-left">Bowler</th>
                    <th className="bs-th">Ov</th>
                    <th className="bs-th">Runs</th>
                  </tr>
                </thead>
                <tbody>
                  {bowlerRows.map((b, i) => (
                    <tr key={i}>
                      <td className="bs-td bs-td-left">{b.name}</td>
                      <td className="bs-td">{b.overs}</td>
                      <td className="bs-td">{b.runs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )} */}

        </>
      )}

      {/* Break / Status */}
      {breakStatus && (
        <div className="cscard-status">{breakStatus}</div>
      )}

      {/* Expand / Collapse chevron */}
      <div className="cscard-toggle">
        <span className={`cscard-chevron${expanded ? ' up' : ''}`}>&#8964;</span>
      </div>
    </div>
  )
}

export default CricketScoreCard
