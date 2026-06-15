import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { FaLock } from "react-icons/fa"
import BackBtn from "../../BackBtn/BackBtn"
import { useBetPlaceMutation } from "../../../../store/service/casino/casinoServices"
import { useGetCasinoMyBetsQuery } from "../../../../store/service/userServices/userServices"
import { videoIdById, LetterAndColorById } from "../../Casino_Data/Constant"
import BetModal from "../../betPlaceModal2/BetModal"
import snackbarUtil from "../../../utils/Snackbar"
import "./ThirtyTwoCard.scss"

const VIDEO_BASE = "https://alpha-g.qnsports.live/route/rih2.php?id="

const CARD_IMG = (code?: string) =>
  code && code !== "1"
    ? `https://versionobj.ecoassetsservice.com/v14/static/front/img/cards/${code}.jpg`
    : "/casino/cardBack.png"

// 32 Card B uses Player 8 – Player 11
const PLAYERS = ["Player 8", "Player 9", "Player 10", "Player 11"]
const P_LETTERS = ["8", "9", "10", "11"]

const ThirtyTwoCard = () => {
  const { id } = useParams<{ id: string }>()
  const [wsData, setWsData]           = useState<any>(null)
  const [countdown, setCountdown]     = useState("00:00")
  const [betModalVisible, setBetModalVisible] = useState(false)
  const [selectedPlayer, setSelectedPlayer]   = useState<any>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const [, { data: betPlaceResponse }] = useBetPlaceMutation()
  const { data: myBetsResponse } = useGetCasinoMyBetsQuery(
    { game: "32cards" },
    { pollingInterval: 2000 }
  )
  const openBets: any[] = myBetsResponse?.data ?? []

  useEffect(() => {
    const ws = new WebSocket(`${import.meta.env.VITE_WS_BASE_URL}/ws/casino`)
    wsRef.current = ws
    ws.onopen    = () => ws.send(JSON.stringify({ type: "subscribe", game: "32cards" }))
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === "gameData" && msg.game === "32cards") setWsData(msg)
      } catch {}
    }
    ws.onerror = () => {}
    ws.onclose = () => {}
    return () => { if (ws.readyState === WebSocket.OPEN) ws.close() }
  }, [])

  useEffect(() => {
    if (!betPlaceResponse) return
    betPlaceResponse?.success ?? betPlaceResponse?.status
      ? (snackbarUtil.success(betPlaceResponse.message), setBetModalVisible(false))
      : snackbarUtil.error(betPlaceResponse.message)
  }, [betPlaceResponse])

  useEffect(() => {
    const autotime = wsData?.t1?.autotime ?? wsData?.autotime
    if (!autotime) { setCountdown("00:00"); return }
    const secs = parseInt(autotime)
    if (secs <= 0) { setCountdown("00:00"); return }
    const fmt = (s: number) =>
      `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`
    let remaining = secs
    setCountdown(fmt(remaining))
    const t = setInterval(() => {
      remaining -= 1
      if (remaining <= 0) { clearInterval(t); setCountdown("00:00") }
      else setCountdown(fmt(remaining))
    }, 1000)
    return () => clearInterval(t)
  }, [wsData?.t1?.autotime, wsData?.autotime])

  const t1 = wsData?.t1 || {}
  const t2: any[] = wsData?.t2 ?? []
  const t3: any[] = wsData?.t3 ?? []

  const roundId = t1?.mid ?? wsData?.roundId ?? ""
  const videoId = videoIdById[id ?? ""] ?? "3034"
  const isClosed = countdown === "00:00"

  const isSuspended = (item: any) => !item || item.gstatus !== "1"

  const handleBet = (item: any, isBack: boolean) => {
    if (isSuspended(item)) return
    setSelectedPlayer({ ...item, isBack })
    setBetModalVisible(true)
  }

  const getPlayer = (name: string) => t2.find((o: any) => o.nat === name)

  // Cards: t1 may have C1_8, C2_8 or C18, C28 depending on backend
  const getCards = (num: string): string[] => {
    const keys = [
      t1[`C1_${num}`], t1[`C2_${num}`], t1[`C3_${num}`], t1[`C4_${num}`],
      t1[`c1${num}`],  t1[`c2${num}`],  t1[`c3${num}`],
      t1[`C${num}1`],  t1[`C${num}2`],  t1[`C${num}3`],
    ]
    return keys.filter(Boolean).slice(0, 4)
  }

  return (
    <>
      <BackBtn to="/casino-list" name="BACK TO CASINO MENU" />

      <div className="tc32-container">

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
            {PLAYERS.map((name, i) => {
              const item  = getPlayer(name)
              const cards = getCards(P_LETTERS[i])
              const score = item?.score ?? item?.pnl

              return (
                <div key={name} className="tc32-overlay-player">
                  <div className="tc32-overlay-header">
                    <span className="tc32-overlay-name">{name.toUpperCase()}</span>
                    {score !== undefined && (
                      <span className="tc32-overlay-score" style={{ color: score > 0 ? "#00e676" : "#fff" }}>
                        {score}
                      </span>
                    )}
                  </div>
                  <div className="tc32-overlay-cards">
                    {(cards.length > 0 ? cards : [null]).map((c, ci) => (
                      <img
                        key={ci}
                        src={c ? CARD_IMG(c) : "/casino/CARD%200.png"}
                        alt={c ?? "card"}
                        className="tc32-overlay-card"
                      />
                    ))}
                  </div>
                </div>
              )
            })}
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
          {PLAYERS.map((name, i) => {
            const item = getPlayer(name)
            const susp = isSuspended(item)
            const b1   = item?.b1 ?? item?.rate ?? "0"
            const l1   = item?.l1 ?? "0"
            const pnl  = item?.pnl

            return (
              <div key={name} className="tc32-bet-row">
                <div className="tc32-bet-player">
                  <span>{name}</span>
                  {pnl !== undefined && pnl !== 0 && (
                    <span style={{ fontSize: 11, color: pnl > 0 ? "#00e676" : "#ff5252", fontWeight: 600 }}>
                      {pnl > 0 ? "+" : ""}{pnl}
                    </span>
                  )}
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

        {/* History */}
        <div className="tc32-history">
          <div className="tc32-history-label">Last Results</div>
          <div className="tc32-history-dots">
            {t3.slice(0, 20).map((r: any, i: number) => {
              const info = LetterAndColorById?.["55"]?.[r?.result]
              return (
                <div key={i} className="tc32-history-dot"
                  style={{ background: info?.color ?? "#555" }}>
                  {info?.label ?? r?.result}
                </div>
              )
            })}
            {t3.length === 0 && <span className="tc32-no-history">No history yet</span>}
          </div>
        </div>

        {/* Open Bets */}
        <div className="tc32-open-bets">
          <div className="tc32-open-bets-title">OPEN BETS</div>
          <div className="tc32-table-wrap">
            <table className="tc32-table">
              <thead>
                <tr>
                  <th>#</th><th>Runner</th><th>Odds</th>
                  <th>Stake</th><th>Profit</th><th>Loss</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {openBets.length > 0 ? openBets.map((bet: any, idx: number) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{bet.selectionName ?? bet.nat ?? "N/A"}</td>
                    <td>{bet.odds ?? "0"}</td>
                    <td>{bet.stake ?? "0"}</td>
                    <td className="tc32-profit">{bet.pnl > 0 ? bet.pnl : "-"}</td>
                    <td className="tc32-loss">{bet.pnl < 0 ? Math.abs(bet.pnl) : "-"}</td>
                    <td>
                      <span className={`tc32-badge ${
                        bet.result === "win" ? "tc32-badge--win"
                        : bet.result === "loss" ? "tc32-badge--loss"
                        : "tc32-badge--pending"}`}>
                        {bet.result ?? "Pending"}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="tc32-no-bets">No open bets</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {betModalVisible && selectedPlayer && (
        <BetModal
          onClose={() => setBetModalVisible(false)}
          selectedPlayer={selectedPlayer}
          matchId={id}
        />
      )}
    </>
  )
}

export default ThirtyTwoCard
