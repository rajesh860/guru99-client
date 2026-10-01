import React, { useEffect, useRef, useState } from "react"
import Hls from "hls.js"

// Casino live "TV" sourced from sky99's HLS pipeline (owner-authorized
// cross-brand reuse — see project notes). Mirrors sky99's own NanoStream
// component 1:1 (same hls.js config/recovery logic), just pointed at
// sky99's real public domain instead of same-origin, since this app is
// deployed on a different domain (guru99.co / guru98.co).
const SKY99_HLS_BASE = "https://sky99.co"

interface SkyCasinoStreamProps {
  game: string
  className?: string
  poster?: string
  muted?: boolean
}

export default function SkyCasinoStream({ game, className, poster, muted = true }: SkyCasinoStreamProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [needsUnmute, setNeedsUnmute] = useState(false)

  // 2026-09-25: casino-fallback/hls-ping/hls-stop keepalive hataya — ye
  // match-TV server pe 1ex99 ka bhaari browser-capture chalu karta tha. Ab
  // sky99 relay saare casino games 24x7 HLS pe deta hai, kisi trigger ki
  // zaroorat nahi.

  useEffect(() => {
    const video = videoRef.current
    if (!video || !game) return undefined

    const src = `${SKY99_HLS_BASE}/hls/${game}/index.m3u8`
    video.muted = muted

    let hls: Hls | null = null
    let destroyed = false
    let hiddenAt = 0

    const tryPlay = () => {
      video.play().catch(() => {
        if (!video.muted) {
          video.muted = true
          setNeedsUnmute(true)
          video.play().catch(() => {})
        }
      })
    }

    const seekLive = () => {
      try {
        if (hls && Number.isFinite(hls.liveSyncPosition)) {
          video.currentTime = hls.liveSyncPosition as number
        } else if (video.seekable && video.seekable.length) {
          video.currentTime = video.seekable.end(video.seekable.length - 1)
        } else if (video.buffered.length) {
          video.currentTime = video.buffered.end(video.buffered.length - 1)
        }
      } catch {
        /* ignore */
      }
    }

    const start = () => {
      if (destroyed) return
      if (hls) {
        try {
          hls.destroy()
        } catch {
          /* ignore */
        }
        hls = null
      }

      if (!Hls.isSupported() && video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src
        video.addEventListener("loadedmetadata", tryPlay, { once: true })
        return
      }
      if (Hls.isSupported()) {
        hls = new Hls({
          lowLatencyMode: false,
          liveSyncDuration: 3,
          liveMaxLatencyDuration: 10,
          maxBufferLength: 20,
          backBufferLength: 10,
          manifestLoadingRetryDelay: 500,
          manifestLoadingMaxRetry: 15,
          manifestLoadingMaxRetryTimeout: 4000,
          fragLoadingMaxRetry: 8,
          levelLoadingMaxRetry: 8,
          // Cross-origin embed (guru99.co/guru98.co -> sky99.co) — MediaMTX
          // ka cookieCheck mechanism cookie roundtrip zaroori maangta hai
          // (bina cookie ke 400 deta hai), isliye credentials hamesha
          // 'include' chahiye. Ye tabhi kaam karta hai jab server wildcard
          // "*" ki jagah is specific origin ko explicitly allow kare +
          // Access-Control-Allow-Credentials bheje (sky99 backend
          // hlsAllowOrigins me guru99.co/guru98.co add kiya gaya hai) —
          // warna browser credentialed request ko CORS error de ke reject
          // kar deta (wildcard+credentials spec-incompatible hai).
          xhrSetup: (xhr) => {
            xhr.withCredentials = true
          },
          fetchSetup: (context) => new Request(context.url, { ...context, credentials: "include" }),
        })
        hls.loadSource(src)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, tryPlay)
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (!data.fatal) return
          const isManifestIssue = /manifest/i.test(data.details || "")
          if (isManifestIssue) {
            restart()
          } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            try {
              hls?.startLoad()
              seekLive()
              tryPlay()
            } catch {
              restart()
            }
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            try {
              hls?.recoverMediaError()
            } catch {
              restart()
            }
          } else {
            restart()
          }
        })
      } else {
        video.src = src
      }
    }

    const restart = () => {
      if (!destroyed) start()
    }

    const resync = () => {
      const away = hiddenAt ? Date.now() - hiddenAt : 0
      hiddenAt = 0
      if (away > 8000) {
        restart()
        return
      }
      try {
        hls?.startLoad()
      } catch {
        /* ignore */
      }
      seekLive()
      tryPlay()
    }

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now()
      } else {
        resync()
      }
    }

    let stallTimer: ReturnType<typeof setTimeout> | null = null
    let stallEscalateTimer: ReturnType<typeof setTimeout> | null = null
    const onWaiting = () => {
      if (stallTimer) clearTimeout(stallTimer)
      if (stallEscalateTimer) clearTimeout(stallEscalateTimer)
      stallTimer = setTimeout(() => {
        if (document.visibilityState !== "visible") return
        seekLive()
        tryPlay()
        stallEscalateTimer = setTimeout(() => {
          if (!destroyed && document.visibilityState === "visible") restart()
        }, 4000)
      }, 4000)
    }
    const onPlaying = () => {
      if (stallTimer) clearTimeout(stallTimer)
      if (stallEscalateTimer) clearTimeout(stallEscalateTimer)
    }

    const DRIFT_CHECK_MS = 5000
    const DRIFT_THRESHOLD_S = 10
    let driftStuckCount = 0
    const driftInterval = setInterval(() => {
      if (destroyed || document.visibilityState !== "visible") return
      try {
        let liveEdge: number | null = null
        if (hls && Number.isFinite(hls.liveSyncPosition)) liveEdge = hls.liveSyncPosition as number
        else if (video.seekable && video.seekable.length) liveEdge = video.seekable.end(video.seekable.length - 1)
        if (liveEdge == null) return
        const drift = liveEdge - video.currentTime
        if (drift > DRIFT_THRESHOLD_S) {
          driftStuckCount++
          if (driftStuckCount >= 2) {
            driftStuckCount = 0
            restart()
            return
          }
          seekLive()
          tryPlay()
        } else {
          driftStuckCount = 0
        }
      } catch {
        /* ignore */
      }
    }, DRIFT_CHECK_MS)

    const onPause = () => {
      if (document.visibilityState === "visible" && !destroyed) tryPlay()
    }

    start()
    document.addEventListener("visibilitychange", onVisibility)
    video.addEventListener("waiting", onWaiting)
    video.addEventListener("playing", onPlaying)
    video.addEventListener("pause", onPause)

    return () => {
      destroyed = true
      if (stallTimer) clearTimeout(stallTimer)
      if (stallEscalateTimer) clearTimeout(stallEscalateTimer)
      clearInterval(driftInterval)
      document.removeEventListener("visibilitychange", onVisibility)
      video.removeEventListener("waiting", onWaiting)
      video.removeEventListener("playing", onPlaying)
      video.removeEventListener("pause", onPause)
      try {
        hls?.destroy()
      } catch {
        /* ignore */
      }
      try {
        video.removeAttribute("src")
        video.load()
      } catch {
        /* ignore */
      }
    }
  }, [game, muted])

  return (
    <>
      <video ref={videoRef} className={className} poster={poster} autoPlay muted={muted} playsInline controls={false} />
      {needsUnmute && (
        <button
          onClick={() => {
            if (videoRef.current) videoRef.current.muted = false
            setNeedsUnmute(false)
          }}
          style={{
            position: "absolute",
            bottom: 8,
            left: 8,
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
          🔇 Tap for sound
        </button>
      )}
    </>
  )
}
