import React, { useEffect, useRef, useState } from "react"
import SkyCasinoStream from "../casinoDetail/SkyCasinoStream"

// Match live TV — sky99 ke match-TV pipeline se (wahi stream jo sky99.co /
// bet99ex.pro pe chalti hai). Flow sky99 ke oddsDetail jaisa hi:
//   1) /api/hls-start se capture start (match-tv server ek baar capture karta
//      hai, kitni bhi sites/viewers dekhein — load viewers se nahi badhta)
//   2) video SkyCasinoStream (hls.js) se `match-<gmid>` stream
//   3) har 20s /api/hls-ping — viewer ka ping capture ko zinda rakhta hai
//      (3 min bina ping ke server capture band kar deta hai); capture mar
//      chuki ho to dobara start.
// Match shuru hone se pehle TV ki jagah COUNTDOWN dikhta hai (start time sky99
// score API se, na mile to guru ki match list se) — aur tab tak /hls-start
// hit hi nahi karte (bekaar capture-attempt se server load bachta hai).
// (Purana diamond iframe fallback hataya — guru98 pe wo hamesha "Access
// Denied" deta tha.)
const SKY99_API = "https://api.sky99.co/api"
const PRESTART_MS = 2 * 60 * 1000 // start se 2 min pehle hi TV try shuru

interface MatchTvStreamProps {
  gmid: string
  eventName: string
  fallbackSrc?: string
}

// guru list ka matchTime "10/4/2026 9:00:00 PM" (IST) -> epoch ms
function parseIstMatchTime(s?: string): number | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i.exec((s || "").trim())
  if (!m) return null
  let h = Number(m[4]) % 12
  if (m[7].toUpperCase() === "PM") h += 12
  const utc = Date.UTC(Number(m[3]), Number(m[1]) - 1, Number(m[2]), h, Number(m[5]), Number(m[6] || 0))
  return utc - (5 * 60 + 30) * 60 * 1000
}

function fmtCountdown(ms: number): string {
  const t = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(t / 86400)
  const h = Math.floor((t % 86400) / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return d > 0 ? `${d}d ${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}`
}

export default function MatchTvStream({ gmid, eventName }: MatchTvStreamProps) {
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [startAt, setStartAt] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  // Audio default OFF — user ko khud "Unmute" dabana padega agar sound chahiye.
  const [muted, setMuted] = useState(true)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m
      const video = wrapRef.current?.querySelector("video")
      if (video) video.muted = next
      return next
    })
  }

  useEffect(() => {
    setReady(false)
    setFailed(false)
    setStartAt(null)
  }, [gmid])

  // Match start time
  useEffect(() => {
    if (!gmid) return undefined
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch(`${SKY99_API}/cricket-scores/live?beventId=${encodeURIComponent(gmid)}`)
        const d = await r.json()
        const st = Number((d?.data ?? d)?.score?.startTime)
        if (!cancelled && st > 0) {
          setStartAt(st)
          return
        }
      } catch {
        /* guru list try karo */
      }
      try {
        const base = (import.meta as any).env?.VITE_API_BASE_URL || ""
        const r = await fetch(`${base}/client/matches`)
        const d = (await r.json())?.data || {}
        const all = [...(d.live || []), ...(d.upcoming || [])]
        const m = all.find((x: any) => String(x?.gmid) === String(gmid) || String(x?.beventId) === String(gmid))
        const st = parseIstMatchTime(m?.matchTime)
        if (!cancelled && st) setStartAt(st)
      } catch {
        /* start time nahi mila — seedha TV try hoga */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [gmid])

  const notStartedYet = startAt != null && now < startAt - PRESTART_MS

  // Countdown tick (sirf jab TV abhi chal nahi rahi)
  useEffect(() => {
    if (ready) return undefined
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [ready])

  useEffect(() => {
    if (!gmid || !eventName || ready || notStartedYet) return undefined
    let cancelled = false
    const params = new URLSearchParams({ beventId: gmid, provider: "allpanel", eventName })
    fetch(`${SKY99_API}/hls-start?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data?.success) setReady(true)
        else setFailed(true)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [gmid, eventName, ready, attempt, notStartedYet])

  // Fail hone par 60s baad dobara try (match TV kabhi provider pe thodi der baad aati hai)
  useEffect(() => {
    if (!failed) return undefined
    const t = setTimeout(() => {
      setFailed(false)
      setAttempt((a) => a + 1)
    }, 60000)
    return () => clearTimeout(t)
  }, [failed])

  useEffect(() => {
    if (!ready || !gmid) return undefined
    const check = () => {
      fetch(`${SKY99_API}/hls-ping?beventId=${encodeURIComponent(gmid)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.running) return
          setReady(false) // capture band ho gayi — fresh /hls-start
        })
        .catch(() => {})
    }
    const interval = setInterval(check, 20000)
    const onVisible = () => {
      if (document.visibilityState === "visible") check()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [ready, gmid])

  if (!ready) {
    const left = startAt != null ? startAt - now : null
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          background: "#000",
          color: "rgba(255,255,255,0.75)",
          fontSize: 13,
          textAlign: "center",
          padding: 8,
        }}
      >
        {left != null && left > 0 ? (
          <>
            <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", opacity: 0.7 }}>Match starts in</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
              {fmtCountdown(left)}
            </div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>Live TV match shuru hote hi yahan chalegi</div>
          </>
        ) : failed ? (
          "Live TV jaldi shuru hogi..."
        ) : (
          "Live TV load ho rahi hai..."
        )}
      </div>
    )
  }

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%", height: "100%", background: "#000" }}>
      <SkyCasinoStream
        game={`match-${gmid}`}
        muted={muted}
        className="match-tv-video"
      />
      <button
        onClick={toggleMute}
        style={{
          position: "absolute",
          bottom: 8,
          right: 8,
          zIndex: 2,
          background: "rgba(0,0,0,.6)",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          padding: "4px 10px",
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        {muted ? "🔇 Unmute" : "🔊 Mute"}
      </button>
      <style>{`.match-tv-video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000}`}</style>
    </div>
  )
}
