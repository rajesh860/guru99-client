import { useState, useEffect, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { usePlayLudoGameMutation } from "../../../../store/service/ludo/ludoApi"
import LudoMultiplayer from "./LudoMultiplayer"
import LudoWaitingScreen from "./LudoWaitingScreen"
import "./LudoPlay.scss"

const WAIT_SECS = 30

interface Session {
  roomId: string | null
  gameId: string | null
  color: string
  matched: boolean
  entryFee: number
  prizePool: number
  botScheduledAt: string | null
}

const LudoPlay = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const entryFee = Number(searchParams.get("fee")) || 100

  const [session, setSession]     = useState<Session | null>(null)
  const [error, setError]         = useState("")
  const [countdown, setCountdown] = useState<number | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [playGame, { isLoading }] = usePlayLudoGameMutation()

  const stopCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    setCountdown(null)
  }

  const startCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    let secs = WAIT_SECS
    countdownRef.current = setInterval(() => {
      setCountdown(secs)
      if (secs > 1) secs--
    }, 1000)
  }

  const applyResult = (res: any) => {
    stopCountdown()
    if (!res?.data?.success) {
      setError(res?.error?.data?.message || "Failed to find match. Try again.")
      return
    }
    const { matched, data } = res.data
    setSession({
      roomId:         data.roomId    ?? null,
      gameId:         data.gameId    ?? null,
      color:          data.color,
      matched:        !!matched,
      entryFee:       data.entryFee  ?? entryFee,
      prizePool:      data.prizePool ?? data.winAmount ?? 0,
      botScheduledAt: data.botScheduledAt ?? null,
    })
  }

  useEffect(() => {
    let cancelled = false
    startCountdown()
    playGame(entryFee).then(res => { if (!cancelled) applyResult(res) })
    return () => {
      cancelled = true
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRetry = () => {
    setError("")
    startCountdown()
    playGame(entryFee).then(applyResult)
  }

  const displayCountdown = isLoading ? (countdown ?? WAIT_SECS) : null

  if (session) {
    return (
      <LudoMultiplayer
        session={session}
        onExit={() => navigate("/ludo")}
      />
    )
  }

  return (
    <LudoWaitingScreen
      botCountdown={error ? null : displayCountdown}
      botTotal={WAIT_SECS}
      entryFee={entryFee}
      prize={Math.floor(entryFee * 0.9)}
      cancelKind="back"
      onCancel={() => navigate("/ludo")}
      error={error || undefined}
      onRetry={isLoading ? undefined : handleRetry}
    />
  )
}

export default LudoPlay
