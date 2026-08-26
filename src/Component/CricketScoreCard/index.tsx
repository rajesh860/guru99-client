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
  c2?: string
  c?: string
  b?: string
  o?: string | number
  s?: string
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
  spnmessage?: string
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
    raw?: { j?: string; ac?: string; a?: string }
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
    timeZone: 'Asia/Kolkata',
  })
}

function fmtDate(epoch: number): string {
  if (!epoch) return ''
  return new Date(epoch).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
    timeZone: 'Asia/Kolkata',
  })
}

function getTeamShort(name: string): string {
  if (!name) return ''
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return name.substring(0, 3).toUpperCase()
  return words.map(w => w[0]).join('').toUpperCase().substring(0, 3)
}

// Team flag/logo CDN — keyed by the team code (e.g. "1JO") from the score feed.
const TEAM_FLAG_CDN = 'https://cricketvectors.akamaized.net/Teams'
const teamFlagUrl = (key: string): string => (key ? `${TEAM_FLAG_CDN}/${key}.png` : '')
// Hide the <img> if the CDN has no logo for this team, so no broken-image icon shows.
const hideBrokenImg = (e: { currentTarget: HTMLImageElement }) => { e.currentTarget.style.display = 'none' }

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
  if (t === 6) return 'ball-bye'
  if (t === 7) return 'ball-legbye'
  const str = String(u).toLowerCase()
  if (str === 'wd') return 'ball-wide'
  if (str === 'nb') return 'ball-noball'
  if (str.startsWith('b') && parseInt(str.slice(1)) > 0) return 'ball-bye'
  if (str.startsWith('lb') && parseInt(str.slice(2)) > 0) return 'ball-legbye'
  if (parseInt(String(u)) > 0) return 'ball-run'
  return 'ball-dot'
}

function rbBallLabel(t: number, u: string | number): string | number {
  if (t === 1) return 'W'
  if (t === 4) return 'Wd'
  if (t === 5) return 'Nb'
  if (t === 6) return `B${u || 1}`
  if (t === 7) return `Lb${u || 1}`
  const str = String(u).toLowerCase()
  if (str === 'wd') return 'Wd'
  if (str === 'nb') return 'Nb'
  if (str.startsWith('b') && parseInt(str.slice(1)) > 0) return `B${str.slice(1)}`
  if (str.startsWith('lb') && parseInt(str.slice(2)) > 0) return `Lb${str.slice(2)}`
  return u === '0' || u === 0 ? '0' : u
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

function v1BallClass(b: string): string {
  if (b === '6') return 'ball-six'
  if (b === '4') return 'ball-four'
  if (b?.toLowerCase() === 'w') return 'ball-wicket'
  if (parseInt(b) > 0) return 'ball-run'
  return 'ball-dot'
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

function ballEventClass(val: string): string {
  if (val === '6') return 'be-six'
  if (val === '4') return 'be-four'
  if (val.toLowerCase() === 'w') return 'be-wicket'
  if (val.toLowerCase() === 'wd') return 'be-wide'
  if (val.toLowerCase() === 'nb') return 'be-noball'
  if (val.toLowerCase() === 'o') return 'be-over'
  if (val.toLowerCase() === 'cd') return 'be-catchdrop'
  if (val.toLowerCase() === 'ruka') return 'be-stop'
  if (val === '^1') return 'be-wicket'
  if (val === '^2') return 'be-wicket'
  if (val === '^4') return 'be-wicket'
  if (val === '^5') return 'be-wicket'
  if (val === '^8') return 'be-wicket'
  if (val.toLowerCase() === 'u') return 'be-umpire'
  if (val.toLowerCase() === 'no') return 'be-notout'
  if (val.toLowerCase() === 'ba') return 'be-ballair'
  if (val === 'B') return 'be-ball'
  if (val.toLowerCase() === 'e') return 'be-entering'
  if (val.toLowerCase() === 'f') return 'be-fastbowler'
  if (val.toLowerCase() === 'fh') return 'be-freehit'
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
  if (val.toLowerCase() === 'cd') return 'Catch Drop!'
  if (val.toLowerCase() === 'ruka') return 'Bowler Stop'
  if (val.toLowerCase() === 'no') return 'Not Out'
  if (val.toLowerCase() === 'ba') return 'Ball in Air'
  if (val === '^1') return 'Bowled!'
  if (val === '^2') return 'Caught Out!'
  if (val === '^4') return 'Run Out!'
  if (val === '^5') return 'LBW Out!'
  if (val === '^8') return 'Stumped Out!'
  if (val.toLowerCase() === 'u') return 'Third Umpire'
  if (val === '0') return '0'
  if (val.toLowerCase() === 'b') return 'Ball'
  if (val.toLowerCase() === 'e') return 'Player Entering'
  if (val.toLowerCase() === 'f') return 'Fast Bowler'
  if (val.toLowerCase() === 'fh') return 'Free Hit!'
  const n = parseInt(val)
  if (!isNaN(n) && n > 0) return `${n} Run${n === 1 ? '' : 's'}`
  return 'Ball'
}

function normalizeScoreData(input: any): ScoreData | null {
  if (!input) return null

  // Unwrap standard API wrapper { data: {...} }
  const d = input?.data && typeof input.data === 'object' && !Array.isArray(input.data)
    ? input.data
    : input


  const v1: OverSummary[] = d.v1 || []
  const liveDataRaw: any = d.liveData || {}
  const isRawMatch = (o: any) => !!(o?.rb || o?.speech_names || o?.wp)
  const rawMatch: any = isRawMatch(liveDataRaw) ? liveDataRaw : isRawMatch(d) ? d : null

  const latestV1Over: any = v1.find((x: any) => x.type === 'o')

  // 1. innings object — most reliable: directly tells which team is in current innings
  const inningsObjRaw: any = d.innings || {}

  // Follow-on correction: when the team bowled out first (innings2) is forced to follow on,
  // they bat AGAIN immediately as innings3 — but the feed can still tag innings3.team as the
  // alternating (wrong) team, since it doesn't seem to special-case follow-on. followOnRuns
  // (from liveData) tells us the threshold, so detect and correct it here.
  const followOnRuns: number = Number(d.liveData?.followOnRuns) || 0
  const inn1 = inningsObjRaw.innings1
  const inn2 = inningsObjRaw.innings2
  const inn3 = inningsObjRaw.innings3
  const isFollowOn = !!(
    followOnRuns && inn1 && inn2 && inn3 &&
    inn1.runs - inn2.runs >= followOnRuns &&
    inn3.team && inn2.team && inn3.team !== inn2.team
  )
  const inningsObj: any = isFollowOn
    ? { ...inningsObjRaw, innings3: { ...inn3, team: inn2.team, teamName: inn2.teamName } }
    : inningsObjRaw

  const activeInningsData =
    inningsObj.innings4 || inningsObj.innings3 || inningsObj.innings2 || inningsObj.innings1
  const battingFromInnings: string = activeInningsData?.team || ''

  // 2. liveData.F field — "^14D" format, strip ^ prefix
  const fField: string = rawMatch?.F ? String(rawMatch.F).replace(/^\^/, '') : ''

  // 3. liveData.a field — "14D.PF" format, first part is batting team
  const aField: string = rawMatch?.a ? String(rawMatch.a).split('.')[0] : ''

  // 4. liveData.wp[0] — batting team listed first in wp string
  const battingFromWp: string = rawMatch?.wp ? String(rawMatch.wp).split(',')[0] : ''

  // 5. over summary tfkey
  const battingFromOver: string = latestV1Over?.tfkey || ''

  // 6. bowl_tfkey from v1 balls — in some API responses this is actually batting team
  const battingFromV1Bowl: string = (v1 as any[]).find(x => x.bowl_tfkey)?.bowl_tfkey || ''

  // bat_team_fkey is unreliable — can hold bowling team's key, avoid using

  const battingTeamKey: string =
    battingFromInnings ||
    fField ||
    aField ||
    battingFromWp ||
    battingFromOver ||
    battingFromV1Bowl ||
    ''

  // Data already has score — just fix batting flags and innings team mapping
  if (d.score !== undefined) {
    if (!battingTeamKey) return d as ScoreData

    const teams: any = d.teams || {}
    const score: any = d.score || {}
    const t1Key: string = teams.team1?.key || score.team1Key || ''
    const t2Key: string = teams.team2?.key || score.team2Key || ''

    // speech_names has short clean names — use them when team name is null, empty, or
    // is the full match name (contains " v "/" V " meaning it was stored incorrectly)
    const speechNames: Record<string, string> = (d as any).liveData?.speech_names || {}
    const matchName: string = (d.ename || '').toLowerCase()
    const fixName = (name: string | null | undefined, key: string): string => {
      if (!name) return speechNames[key] || key
      const n = name.trim()
      if (!n) return speechNames[key] || key
      // If name is identical to full match name or contains " v " separator it's a bad name
      if (n.toLowerCase() === matchName || / v /i.test(n)) return speechNames[key] || n
      return n
    }

    const fixedTeams = {
      ...teams,
      team1: { ...teams.team1, batting: !!t1Key && t1Key === battingTeamKey, name: fixName(teams.team1?.name, t1Key) },
      team2: { ...teams.team2, batting: !!t2Key && t2Key === battingTeamKey, name: fixName(teams.team2?.name, t2Key) },
    }

    // Fix innings.innings1.team so the component computes t1First correctly
    // (starts from inningsObj, not raw d.innings, so the follow-on correction above carries through)
    const existingInnings: any = inningsObj
    let fixedInnings = existingInnings
    // Only compute innings1.team if raw data doesn't already have it (Test matches provide it)
    if (score.innings1 && battingTeamKey && !existingInnings.innings1?.team) {
      // innings1 team = batting team if only 1 innings played (they're on their first)
      // innings1 team = bowling team if 2 innings played (batting team is in 2nd innings)
      const innings1Team = !score.innings2
        ? battingTeamKey
        : (battingTeamKey === t1Key ? t2Key : t1Key)
      fixedInnings = {
        ...existingInnings,
        innings1: { ...(existingInnings.innings1 || {}), team: innings1Team }
      }
    }

    return { ...d, teams: fixedTeams, innings: fixedInnings } as ScoreData
  }

  // Raw cricket API format (no score field) — build from scratch
  if (!rawMatch) return d as ScoreData

  const speechNames: Record<string, string> = rawMatch.speech_names || {}
  const teamKeys = Object.keys(speechNames)
  const [tk1 = '', tk2 = ''] = teamKeys
  if (!tk1) return d as ScoreData

  const rb: any[] = rawMatch.rb || []
  const latestRb = rb.length > 0 ? rb[rb.length - 1] : null

  const parseScoreStr = (s: string) => {
    const m = String(s || '').match(/^(\d+)\/(\d+)/)
    return m ? { runs: parseInt(m[1]), wickets: parseInt(m[2]) } : null
  }

  const rbScoreData = latestRb?.ts ? parseScoreStr(latestRb.ts) : null
  const v1ScoreData = latestV1Over?.s ? parseScoreStr(latestV1Over.s) : null
  const parsed = rbScoreData || v1ScoreData
  const parsedOvers = rbScoreData ? (latestRb?.o ?? 0) : (latestV1Over?.o ?? 0)

  return {
    score: {
      format: String(rawMatch.fo || d.fo || ''),
      status: '',
      team1Key: tk1,
      team2Key: tk2,
      innings1: parsed ? { runs: parsed.runs, wickets: parsed.wickets, overs: parsedOvers } : null,
      innings2: null,
      innings3: null,
      innings4: null,
      startTime: rawMatch.mt || d.mt,
      raw: {},
    },
    v1,
    liveData: { B: rawMatch.B, s: rawMatch.s, q: rawMatch.q, rb: rawMatch.rb },
    teams: {
      team1: { name: speechNames[tk1] || tk1, key: tk1, batting: tk1 === battingTeamKey },
      team2: { name: speechNames[tk2] || tk2, key: tk2, batting: tk2 === battingTeamKey },
    },
    ename: String(rawMatch.fo || d.fo || ''),
    innings: {
      innings1: parsed ? { team: battingTeamKey } : null,
    },
  }
}

const CricketScoreCard = ({ scoreData: rawProp }: Props) => {
  const scoreData = (normalizeScoreData(rawProp as any) ?? undefined) as ScoreData | undefined
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
  const ename = scoreData.ename || ''

  // Toss info from v1
  const tossEntry = v1.find((x: any) => x.type === 'to')
  const tossText = tossEntry?.c || null

  if (!score) return null

  const { format, status, team1Key, team2Key, innings1, innings2, innings3, innings4, startTime, raw = {} } = score

  const t1Key = team1Key || ''
  const t2Key = team2Key || ''

  // teams.name is already sanitized by fixName() in normalizeScoreData — trust it first.
  // speech_names/raw key are only fallbacks for feeds where teams.name itself is missing.
  const speechNames: Record<string, string> = (scoreData as any).liveData?.speech_names || {}
  const teamsInfo = scoreData.teams || {}
  const team1Name = teamsInfo.team1?.name || speechNames[t1Key] || t1Key || ''
  const team2Name = teamsInfo.team2?.name || speechNames[t2Key] || t2Key || ''

  const inningsRaw: any = scoreData?.innings || {}

  // Upcoming match view
  if (!innings1 && !innings2) {
    const extraCondition = raw.ac ? String(raw.ac).replace(/[()]/g, '').trim() : ''
    const isTossRelated = status?.toLowerCase().includes('toss')
    // Hide toss-related status if toss info is already available
    const matchStatus = status && status.toLowerCase() !== 'scheduled' && !(isTossRelated && tossText)
      ? (extraCondition ? `${status} • ${extraCondition}` : status)
      : null

    return (
      <div className="cscard-upcoming">
        <div className="upcoming-badge-row">
          <span className="upcoming-badge">UPCOMING</span>
          {ename && <span className="upcoming-ename">{ename}</span>}
        </div>
        <div className="upcoming-teams">
          <div className="upcoming-team upcoming-team-left">
            {t1Key
              ? <img className="upcoming-team-flag" src={teamFlagUrl(t1Key)} alt="" onError={hideBrokenImg} />
              : <div className="upcoming-team-abbr">{getTeamShort(team1Name)}</div>}
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
            {t2Key
              ? <img className="upcoming-team-flag" src={teamFlagUrl(t2Key)} alt="" onError={hideBrokenImg} />
              : <div className="upcoming-team-abbr">{getTeamShort(team2Name)}</div>}
            <div className="upcoming-team-name">{team2Name}</div>
          </div>
        </div>
        {matchStatus && (
          <div className="cscard-ball-event be-status">
            <span className="be-label">{matchStatus}</span>
          </div>
        )}
        {tossText && (
          <div className="cscard-toss">
            🪙 {tossText}
          </div>
        )}
      </div>
    )
  }

  const activeInnNum = innings4 ? 4 : innings3 ? 3 : innings2 ? 2 : 1

  // teams.batting was already resolved in normalizeScoreData via the reliable priority chain
  // (innings.team > F > a > wp > tfkey). Trust it — don't re-derive with a different, conflicting
  // priority here, or the two computations can disagree on which team is batting.
  const hasBattingFlag = typeof teamsInfo.team1?.batting === 'boolean' || typeof teamsInfo.team2?.batting === 'boolean'

  // Fallback signals only used when normalizeScoreData had nothing to resolve teams.batting from
  const batFromV1: string = (v1 as any[]).find((x: any) => x.type === 'b' && x.bat_team_fkey)?.bat_team_fkey || ''
  const batFromF: string = (liveData as any)?.F ? String((liveData as any).F).replace(/^\^/, '') : ''
  const batFromA: string = (liveData as any)?.a ? (String((liveData as any).a).split('.')[1] || '') : ''
  const batFromInn: string = inningsRaw.innings4?.team || inningsRaw.innings3?.team ||
                             inningsRaw.innings2?.team || inningsRaw.innings1?.team || ''
  const activeBattingKey: string = batFromV1 || batFromF || batFromA || batFromInn

  const team1BattingFinal: boolean = hasBattingFlag
    ? !!teamsInfo.team1?.batting
    : (activeBattingKey ? activeBattingKey === t1Key : true)
  const team2Batting = !team1BattingFinal
  const t1First = team1BattingFinal ? (activeInnNum % 2 === 1) : (activeInnNum % 2 === 0)

  const latestSummary = v1.find(x => x.type === 'o')
  const batsman1 = latestSummary ? { name: latestSummary.p1, score: latestSummary.s1 } : null
  const batsman2 = latestSummary ? { name: latestSummary.p2, score: latestSummary.s2 } : null
  const bowlerName = latestSummary?.bowler || null

  const latestBall = v1.find(x => x.type === 'b')
  const lastCommentary = latestBall?.c1 || ''

  const rawB = liveData.B && String(liveData.B).trim() !== '' ? String(liveData.B) : null
  // "B" alone just means a ball was bowled — no banner needed
  const isKnownBallValue = (b: string) =>
    /^([0-9]|W|Wd|Nb|wd|nb|w|o|O|cd|CD|ruka|RUKA|\^1|\^2|\^4|\^5|\^8|no|NO|ba|BA|B|u|U|e|E|f|F|fh|FH)$/.test(b.trim())
  const lastBall   = rawB && isKnownBallValue(rawB) ? rawB : null
  const breakLabel = rawB && !isKnownBallValue(rawB) ? rawB : null

  const activeInningsNumber = innings4 ? 4 : innings3 ? 3 : innings2 ? 2 : 1
  const activeInnings = innings4 || innings3 || innings2 || innings1
  const crr = activeInnings && activeInnings.runs > 0
    ? calcCRR(activeInnings.runs, activeInnings.overs)
    : null

  // liveData.C carries a human-readable rain/weather reduction notice e.g.
  // "Match Reduced to 16 overs per side" — often the only text notice the feed gives us
  // that the original format's overs no longer apply.
  const reducedOversNote: string | null = (liveData as any)?.C ? String((liveData as any).C).trim() || null : null
  const reducedOversMatch = reducedOversNote?.match(/(\d+)\s*overs?/i)
  const reducedOvers = reducedOversMatch ? parseInt(reducedOversMatch[1]) : null

  // liveData.T carries "<ballsAllowedForChase>.<revisedTarget>" (e.g. "54.83") once DLS/rain
  // has revised the chase — present even when liveData.C's text notice isn't. This is the only
  // reliable source for the revised target: after a DLS recalculation the target can move far
  // from the naive innings1.runs + 1 (e.g. a 172-run first innings can revise to a target of 83).
  const tField: string = (liveData as any)?.T ? String((liveData as any).T).trim() : ''
  const tParts = tField.split('.')
  const revisedBallsAllowed = tParts.length === 2 ? parseInt(tParts[0]) : NaN
  const revisedTarget = tParts.length === 2 ? parseInt(tParts[1]) : NaN
  const hasRevisedTarget = !isNaN(revisedBallsAllowed) && !isNaN(revisedTarget) && revisedBallsAllowed > 0 && revisedTarget > 0

  const formatMaxBalls = (() => {
    if (hasRevisedTarget) return revisedBallsAllowed
    if (reducedOvers) return reducedOvers * 6
    const f = (format || '').toLowerCase()
    if (f.includes('t10')) return 60
    if (f.includes('hundred')) return 100
    if (f.includes('t20')) return 120
    if (f.includes('odi') || f.includes('list a') || f.includes('one day')) return 300
    return 0 // Test = no fixed limit
  })()

  let chaseInfo: { battingName: string; needed: number; ballsLeft: number | null } | null = null
  if (innings1 && innings2 && !innings3) {
    const target = hasRevisedTarget ? revisedTarget : innings1.runs + 1
    const needed = target - innings2.runs
    const i2Parts = String(innings2.overs).split('.')
    const ballsBowled = parseInt(i2Parts[0]) * 6 + parseInt(i2Parts[1] || '0')
    const ballsLeft   = formatMaxBalls > 0 ? formatMaxBalls - ballsBowled : null
    const battingName = team2Batting ? team2Name : team1Name
    if (needed > 0 && (ballsLeft === null || ballsLeft > 0)) {
      chaseInfo = { battingName, needed, ballsLeft }
    }
  }

  // Recent balls — current over only (reset each over)
  const rbOvers = liveData.rb || []
  const currentInningsIdx = activeInningsNumber - 1
  const currentInningsOvers = rbOvers.filter((o: any) =>
    o.i === currentInningsIdx || o.i === String(currentInningsIdx) || o.i === undefined
  )
  // Last rb entry = current over in progress
  const currentOver = currentInningsOvers[currentInningsOvers.length - 1]
  const recentBalls: Ball[] = []
  if (currentOver) {
    // Only this over's balls — max 6 to avoid spill from previous overs
    ;(currentOver.b || []).slice(-6).forEach((ball: any, bi: number) => {
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
  Object.values(bowlerMap) // bowlerRows reserved for future use

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


  const breakStatus = !lastBall && !breakLabel ? status?.trim() || null : null

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

      {/* Toss */}
      {tossText && (
        <div className="cscard-toss">
          🪙 {tossText}
        </div>
      )}

      {/* Rain/weather overs reduction */}
      {reducedOversNote && (
        <div className="cscard-toss cscard-toss--rain">
          🌧️ {reducedOversNote}
        </div>
      )}

      {/* Main Score */}
      <div className="cscard-scores">
        {(() => {
          // Group each score-innings by the team that actually played it, using inningsRaw's
          // per-innings .team tag (follow-on corrected in normalizeScoreData) instead of
          // assuming strict odd/even alternation — alternation breaks whenever a team follows
          // on and bats two innings in a row (e.g. innings2 AND innings3 both theirs).
          const scoreSlots: Array<{ n: number; data: Innings }> = (
            [[1, innings1], [2, innings2], [3, innings3], [4, innings4]] as const
          ).filter((s): s is [number, Innings] => !!s[1]).map(([n, data]) => ({ n, data }))

          const teamForSlot = (n: number): string => {
            const tagged = inningsRaw[`innings${n}`]?.team
            if (tagged) return tagged
            // No tag for this slot — fall back to the odd/even alternation assumption
            const isOddSlot = n % 2 === 1
            return isOddSlot === t1First ? t1Key : t2Key
          }

          const t1InningsList = scoreSlots.filter(s => teamForSlot(s.n) === t1Key).map(s => s.data)
          const t2InningsList = scoreSlots.filter(s => teamForSlot(s.n) === t2Key).map(s => s.data)

          // Names: use backend names — team1BattingFinal tells us who's batting/active on left
          const leftName  = team1BattingFinal ? team1Name : team2Name
          const rightName = team1BattingFinal ? team2Name : team1Name

          // CDN flag keys: v1 is newest-first, v1.find() returns current-innings keys.
          // Over summary: tfkey = batting team's CDN key, bowl_tfkey = bowling team's CDN key.
          const v1Any = v1 as any[]
          const leftCdnKey  = v1Any.find(x => x.tfkey)?.tfkey || ''
          const rightCdnKey = v1Any.find(x => x.bowl_tfkey)?.bowl_tfkey ||
            (leftCdnKey ? v1Any.find(x => x.tfkey && x.tfkey !== leftCdnKey)?.tfkey : '') || ''
          const leftKey  = leftCdnKey
          const rightKey = rightCdnKey
          const leftList  = team1BattingFinal ? t1InningsList : t2InningsList
          const rightList = team1BattingFinal ? t2InningsList : t1InningsList

          const renderTeam = (list: Innings[], name: string, key: string, isBatting: boolean) => {
            const prev = list.length > 1 ? list[0] : null
            const curr = list.length ? list[list.length - 1] : null
            return (
              <>
                {key && <img className="cs-team-flag" src={teamFlagUrl(key)} alt="" onError={hideBrokenImg} />}
                <div className="cs-team-info">
                  <span className="cs-team-key">
                    {isBatting && <span className="bat-icon">🏏</span>}
                    <span className="cs-team-name">{name}</span>
                  </span>
                  {prev && <span className="cs-prev-score">{`${prev.runs}/${prev.wickets} (${prev.overs})`}</span>}
                  {curr
                    ? (
                      <span className="cs-score">
                        <strong>{curr.runs}/{curr.wickets}</strong>
                        <span className="cs-overs">({curr.overs} ov)</span>
                      </span>
                    )
                    : <span className="cs-ytb">Yet to bat</span>}
                </div>
              </>
            )
          }

          return (
            <>
              <div className="cs-team batting">
                {renderTeam(leftList, leftName, leftKey, true)}
              </div>

              <div className="cs-lastball">
                <span className="cs-vs">vs</span>
              </div>

              <div className="cs-team team-right">
                {renderTeam(rightList, rightName, rightKey, false)}
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
      {!lastBall && breakLabel && (
        <div key={breakLabel} className="cscard-ball-event be-info">
          <span className="be-label">{breakLabel}</span>
        </div>
      )}
      {!lastBall && !breakLabel && breakStatus && (
        <div key={breakStatus} className="cscard-ball-event be-status">
          <span className="be-label">{breakStatus}</span>
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
      {(scoreData?.spnmessage || chaseInfo) && (
        <div className="cscard-chase">
          {scoreData?.spnmessage
            ? <span className="chase-text">{scoreData.spnmessage}</span>
            : <>
                <span className="chase-team">{chaseInfo!.battingName}</span>
                <span className="chase-text"> need </span>
                <strong className="chase-runs">{chaseInfo!.needed}</strong>
                <span className="chase-text"> runs</span>
                {chaseInfo!.ballsLeft !== null && <>
                  <span className="chase-text"> in </span>
                  <strong className="chase-balls">{chaseInfo!.ballsLeft}</strong>
                  <span className="chase-text"> balls</span>
                </>}
              </>
          }
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

      {/* Commentary Feed */}
      {/* {(() => {
        const feed = (v1 as any[]).filter(x => x.type === 'b' || x.type === 't' || x.type === 'o')
        if (!feed.length) return null
        const visible = expanded ? feed : feed.slice(0, 4)
        return (
          <div className="cscard-commentary" onClick={e => e.stopPropagation()}>
            <div className="cmnt-header">Ball by Ball</div>
            {visible.map((item: any, i: number) => {
              if (item.type === 'o') {
                return (
                  <div key={i} className="cmnt-over-end">
                    <span>End of Over {item.o}</span>
                    <span className="cmnt-over-meta">{item.bowler} &nbsp;·&nbsp; {item.runs} runs &nbsp;·&nbsp; {item.s}</span>
                  </div>
                )
              }
              if (item.type === 't') {
                return (
                  <div key={i} className="cmnt-text">
                    {stripHtml(item.c || '')}
                  </div>
                )
              }
              const b = String(item.b ?? '0')
              return (
                <div key={i} className="cmnt-ball">
                  <span className="cmnt-over-num">{item.o}</span>
                  <span className={`cmnt-dot ball ${v1BallClass(b)}`}>
                    {b === '0' ? '•' : b}
                  </span>
                  <div className="cmnt-content">
                    <div className="cmnt-c1">{item.c1}</div>
                    {item.c2 && (
                      <div
                        className="cmnt-c2"
                        dangerouslySetInnerHTML={{ __html: item.c2 }}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })()} */}

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


      {/* Expand / Collapse chevron */}
      <div className="cscard-toggle">
        <span className={`cscard-chevron${expanded ? ' up' : ''}`}>&#8964;</span>
      </div>
    </div>
  )
}

export default CricketScoreCard
