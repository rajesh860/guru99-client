import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { FaLock } from "react-icons/fa"
import BackBtn from "../../BackBtn/BackBtn"
import { useGetCasinoMyBetsQuery, useGetCasinoCompletedBetsQuery, useGetCasinoRoundPlQuery } from "../../../../store/service/userServices/userServices"
import { videoIdById } from "../../Casino_Data/Constant"
import PlaceBetModal from "../teenPatti/PlaceBetModal"
import "../teenPatti/styles.scss"
import "./ThirtyTwoCard.scss"

const VIDEO_BASE = "https://alpha-g.qnsports.live/route/rih2.php?id="

// 32 Card B uses Player 8 – Player 11
const PLAYERS = ["Player 8", "Player 9", "Player 10", "Player 11"]
const SEATS = [8, 9, 10, 11]

// This game's own card CDN path — deliberately separate from the shared utils/cardImage.ts
// (used by other games), which applies an HH/SS/DD suit-swap. Confirmed (via a working
// reference implementation of this same "32 Cards" game) that this game's raw code needs NO
// swap — applying it shifts the suit to the wrong one.
const getCard32Image = (cardCode?: string) => {
  const code = !cardCode || cardCode === "1" ? "1" : cardCode
  return `https://versionobj.ecoassetsservice.com/v105/static/admin/img/cards/${code}.png`
}

// 32-Cards "point" = the card's rank value + the player's seat number (8/9/10/11). Whoever is
// currently highest is leading. Code format: rank + doubled suit letter (e.g. "8CC", "JHH").
const FACE_VALUES: Record<string, number> = { A: 1, J: 11, Q: 12, K: 13 }
const getCard32Point = (cardCode: string | undefined, seatNumber: number): number | null => {
  if (!cardCode || cardCode === "1") return null
  const rankStr = cardCode.slice(0, -2)
  const rankValue = FACE_VALUES[rankStr] ?? Number(rankStr)
  return Number.isFinite(rankValue) ? rankValue + seatNumber : null
}

// Per-player round P/L — shown next to the player's name in the betting table. RTK Query
// dedupes the (game, roundId) query across all 4 rows into a single request. Response shape
// (confirmed live): { book: { "Player 8": 1120, "Player 9": -100, ... }, totalBets, ... } —
// book[name] is the net P/L if that player wins, given every bet placed this round.
const CasinoRoundPL = ({ game, roundId, name }: { game: string; roundId: string; name: string }) => {
  const { data } = useGetCasinoRoundPlQuery(
    { game, roundId },
    { skip: !game || !roundId, pollingInterval: 1500, refetchOnMountOrArgChange: true }
  )

  if (!data?.totalBets) return null
  const pl = data.book?.[name]
  if (pl == null) return null

  const color = pl > 0 ? "#22c55e" : pl < 0 ? "#ff6b6b" : "#9aa3b2"
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color }}>
      {pl > 0 ? "+" : ""}{Number(pl).toFixed(2)}
    </span>
  )
}

const ThirtyTwoCard = () => {
  const { id } = useParams<{ id: string }>()
  const [wsData, setWsData]           = useState<any>(null)
  const [countdown, setCountdown]     = useState("00:00")
  // null = "no autotime data yet" (WS hasn't delivered a round tick), distinct from a genuine
  // 0 (round actually at/past its end). PlaceBetModal treats roundSeconds<=2 as suspended and
  // only skips that check when the value is null — starting this at 0 instead of null made the
  // very first bet click (before any WS tick had landed) look suspended and the modal would
  // open then immediately auto-close itself.
  const [remainingSecs, setRemainingSecs] = useState<number | null>(null)
  const [betModalVisible, setBetModalVisible] = useState(false)
  const [selectedPlayer, setSelectedPlayer]   = useState<any>(null)
  const [betsTab, setBetsTab] = useState<"open" | "completed">("open")
  const wsRef = useRef<WebSocket | null>(null)

  const today = new Date().toISOString().split("T")[0]

  const { data: myBetsResponse } = useGetCasinoMyBetsQuery(
    { game: "card32eu" },
    { pollingInterval: 2000 }
  )
  const openBets: any[] = myBetsResponse?.data ?? []

  const { data: completedBetsRes } = useGetCasinoCompletedBetsQuery(
    // No pagination — fetch everything in one page.
    { game: "card32eu", fromDate: today, toDate: today, page: 1, limit: 1000 },
    { skip: betsTab !== "completed", pollingInterval: 5000 }
  )
  const completedBets: any[] = completedBetsRes?.data ?? completedBetsRes?.bets ?? []

  useEffect(() => {
    const ws = new WebSocket(`${import.meta.env.VITE_WS_BASE_URL}/ws/casino`)
    wsRef.current = ws
    ws.onopen    = () => ws.send(JSON.stringify({ type: "subscribe", game: "card32eu" }))
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === "gameData" && msg.game === "card32eu") setWsData(msg)
      } catch {}
    }
    ws.onerror = () => {}
    ws.onclose = () => {}
    return () => { if (ws.readyState === WebSocket.OPEN) ws.close() }
  }, [])

  useEffect(() => {
    const autotime = wsData?.t1?.autotime ?? wsData?.autotime
    if (!autotime) { setCountdown("00:00"); setRemainingSecs(null); return }
    const secs = parseInt(autotime)
    if (secs <= 0) { setCountdown("00:00"); setRemainingSecs(0); return }
    const fmt = (s: number) =>
      `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`
    let remaining = secs
    setCountdown(fmt(remaining))
    setRemainingSecs(remaining)
    const t = setInterval(() => {
      remaining -= 1
      if (remaining <= 0) { clearInterval(t); setCountdown("00:00"); setRemainingSecs(0) }
      else { setCountdown(fmt(remaining)); setRemainingSecs(remaining) }
    }, 1000)
    return () => clearInterval(t)
  }, [wsData?.t1?.autotime, wsData?.autotime])

  const t1 = wsData?.t1 || {}
  const t2: any[] = wsData?.t2 ?? []
  const t3: any[] = wsData?.t3 ?? []

  const roundId = t1?.mid ?? wsData?.roundId ?? ""
  const videoId = videoIdById[id ?? ""] ?? "3034"
  const isClosed = countdown === "00:00"

  const isSuspended = (item: any) => !item || item.gstatus !== "ACTIVE"

  const handleBet = (item: any, isBack: boolean) => {
    if (isSuspended(item)) return
    // PlaceBetModal reads selectedPlayer.nat/.rate directly (no b1/l1/nation fallback) — t2
    // items only carry nation (not nat) and b1/l1 (not rate), so without this the modal shows
    // "undefined" for the selection and NaN odds/Potential Win.
    setSelectedPlayer({ ...item, isBack, nat: item.nation, rate: isBack ? item.b1 : item.l1 })
    setBetModalVisible(true)
  }

  const getPlayer = (name: string) => t2.find((o: any) => o.nation === name)

  // t1.desc is laid out in batches of 4: [P8,P9,P10,P11, P8,P9,P10,P11, ...]. The first batch
  // (index 0-3) is everyone's initial card. If two+ players tie, the NEXT batch deals a
  // tie-break card to those same 4 slots (still in P8/P9/P10/P11 order) — so card index i
  // belongs to player (i % 4), and a player can end up with more than one card across rounds
  // if they were involved in a tie-break. "1" is the sentinel for "not dealt this round".
  const descCards = String(t1.desc || "").split(",")
  const getCards = (playerIndex: number): string[] => {
    const cards: string[] = []
    for (let i = playerIndex; i < descCards.length; i += 4) {
      const card = descCards[i]
      if (card && card !== "1") cards.push(card)
    }
    return cards
  }

  return (
    <>
      <BackBtn to="/casino-list" name="BACK TO CASINO MENU" />

      <div className="tc32-container teenpatti-container">

        {/* Header */}
        <div className="tc32-header">
          <span className="tc32-title">32 Card B <span className="tc32-rules">| Rules</span></span>
          <span className="tc32-round">Round: {roundId || "---"}</span>
        </div>

        {/* Video + card overlay */}
        <div className="tc32-video-wrap">
          <iframe src={`${VIDEO_BASE}${videoId}`} title="32 Card Stream" allowFullScreen />

          {/* Cards overlaid on left side of video */}
          <div className="tc32-card-overlay">
            {(() => {
              // Point = current (latest, i.e. post-tie-break) card's rank + seat number.
              // Whoever's currently highest is "leading" — shown in green, matching the
              // reference implementation.
              const rows = PLAYERS.map((name, i) => {
                const cards = getCards(i)
                const latestCard = cards[cards.length - 1]
                const point = getCard32Point(latestCard, SEATS[i])
                return { name, i, cards, point }
              })
              const dealtPoints = rows.map(r => r.point).filter((p): p is number => p != null)
              const maxPoint = dealtPoints.length ? Math.max(...dealtPoints) : null

              // Only render players whose card has actually been dealt this round — no
              // label, no card-back placeholder for the rest. Matches the reference
              // implementation: a player simply isn't shown until their card opens.
              return rows.filter(r => r.cards.length > 0).map(({ name, cards, point }) => {
                const item = getPlayer(name)
                const score = item?.score ?? item?.pnl
                const isLeading = point != null && point === maxPoint

                return (
                  <div key={name} className="tc32-overlay-player">
                    <div className="tc32-overlay-header">
                      <span className={`tc32-overlay-name${isLeading ? " tc32-overlay-name--leading" : ""}`}>
                        {name.toUpperCase()}{point != null && <span className="tc32-overlay-point">:{point}</span>}
                      </span>
                      {score !== undefined && (
                        <span className="tc32-overlay-score" style={{ color: score > 0 ? "#00e676" : "#fff" }}>
                          {score}
                        </span>
                      )}
                    </div>
                    <div className="tc32-overlay-cards">
                      {cards.map((c, ci) => (
                        <img
                          key={ci}
                          src={getCard32Image(c)}
                          alt={c}
                          className="tc32-overlay-card"
                        />
                      ))}
                    </div>
                  </div>
                )
              })
            })()}
          </div>

          {/* Timer pill on video */}
          <div className={`tc32-timer-pill ${isClosed ? "tc32-timer-pill--closed" : "tc32-timer-pill--open"}`}>
            {isClosed ? "CLOSED" : countdown}
          </div>
        </div>

        {/* Betting table */}
        <div className="tc32-bet-section">
          {/* Header */}
          <div className="tc32-bet-header">
            <div className="tc32-bet-hcol">Player</div>
            <div>
              <div className="tc32-bet-hbtn" style={{ background: "rgb(64,135,251)" }}>Back</div>
              <div className="tc32-bet-hbtn" style={{ background: "rgb(240,121,143)" }}>Lay</div>
            </div>
          </div>

          {/* Rows */}
          {PLAYERS.map((name) => {
            const item = getPlayer(name)
            const susp = isSuspended(item)
            const b1   = item?.b1 ?? item?.rate ?? "0"
            const l1   = item?.l1 ?? "0"

            return (
              <div key={name} className="tc32-bet-row">
                <div className="tc32-bet-player">
                  <span>{name}</span>
                  <CasinoRoundPL game="card32eu" roundId={roundId} name={name} />
                </div>

                <div className="tc32-bet-btns">
                  {susp ? (
                    <div className="tc32-susp-overlay">
                      <FaLock size={11} color="#fff" />
                      <span>SUSPENDED</span>
                    </div>
                  ) : (
                    <>
                      <button className="tc32-btn tc32-btn--back" onClick={() => handleBet(item, true)}>
                        {b1}
                      </button>
                      <button className="tc32-btn tc32-btn--lay" onClick={() => handleBet(item, false)}>
                        {l1}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}

          <div className="tc32-min-max">Min: 100 &nbsp;|&nbsp; Max: 100000</div>
        </div>

        {/* History — same markup/classes as Teen Patti 20-20's "Last 10 Results" */}
        <div className="last-10-result">
          <div className="result-header">Last 10 Results</div>
          <div className="result-list">
            {t3.slice(0, 10).map((r: any, i: number) => {
              // Winner can come through as a bare sid ("3") or a name ("Player 10") —
              // always show just the number either way.
              const num = String(r?.winner ?? "").match(/\d+/)?.[0] ?? "—"
              return (
                <div key={r.mid ?? i} className="result-circle tc32-result-circle" title={r?.winner}>
                  {num}
                </div>
              )
            })}
            {t3.length === 0 && <span className="tc32-no-history">No history yet</span>}
          </div>
        </div>

        {/* Open / Completed Bets — same markup/classes as Teen Patti 20-20 (teenPatti/styles.scss) */}
        <div className="tp-open-bets">
          <div className="dice-bets-tabs">
            <button
              className={`dbt ${betsTab === "open" ? "dbt--active" : ""}`}
              onClick={() => setBetsTab("open")}
            >Open Bets</button>
            <button
              className={`dbt ${betsTab === "completed" ? "dbt--active" : ""}`}
              onClick={() => setBetsTab("completed")}
            >Completed</button>
          </div>

          <div className="tp-bets-wrapper">
            <table className="tp-bets-table">
              <thead>
                <tr>
                  <th>Round ID</th><th>Runner</th><th>Odds</th>
                  <th>Stake</th><th>P/L</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const bets = betsTab === "open" ? openBets : completedBets
                  if (!bets.length) return (
                    <tr>
                      <td colSpan={6} className="tp-bets-empty">
                        {betsTab === "open" ? "No open bets" : "No completed bets"}
                      </td>
                    </tr>
                  )
                  return bets.map((bet: any, idx: number) => {
                    const status = bet.status ?? bet.result ?? "pending"
                    const pnl    = bet.pnl ?? 0
                    const pl     = betsTab === "completed" ? (bet.profitLoss ?? 0) : (bet.potentialWin ?? pnl)
                    return (
                      <tr key={idx}>
                        <td className="td-round-id">{bet.roundId ?? "—"}</td>
                        <td className="td-runner">{bet.betOn ?? bet.selectionName ?? bet.nation ?? "—"}</td>
                        <td>{bet.odds ?? "—"}</td>
                        <td>{bet.stake ?? "—"}</td>
                        <td className={pl > 0 ? "td-win" : pl < 0 ? "td-loss" : ""}>
                          {pl !== 0 ? pl : "—"}
                        </td>
                        <td>
                          <span className={`tp-bet-badge ${
                            status === "won"  || status === "win"  ? "tp-bet-win"
                            : status === "lost" || status === "loss" ? "tp-bet-loss"
                            : "tp-bet-pending"}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PlaceBetModal
        isOpen={betModalVisible && !!selectedPlayer}
        onClose={() => setBetModalVisible(false)}
        selectedPlayer={selectedPlayer}
        matchId={id}
        game="card32eu"
        roundSeconds={remainingSecs}
      />
    </>
  )
}

export default ThirtyTwoCard
