import { useEffect, useRef, useCallback, useState } from "react"

// wss://<host>/ws/ludo — same host-level convention as /ws/casino (VITE_WS_BASE_URL),
// NOT under /api like the REST endpoints.
function getLudoWsUrl() {
  const wsBase = import.meta.env.VITE_WS_BASE_URL || ""
  return `${wsBase}/ws/ludo`
}

interface UseLudoSocketArgs {
  roomId?: string | null
  gameId?: string | null
  onMessage: (msg: any, send: (data: any) => void) => void
}

export function useLudoSocket({ roomId, gameId, onMessage }: UseLudoSocketArgs) {
  const wsRef = useRef<WebSocket | null>(null)
  const onMsgRef = useRef(onMessage)
  onMsgRef.current = onMessage

  const [connected, setConnected] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)

  const token = localStorage.getItem("client-token")

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  const joinNow = useCallback((ws: WebSocket, gId?: string | null, rId?: string | null) => {
    const payload = gId
      ? { type: "join", gameId: gId, token }
      : { type: "join", roomId: rId, token }
    ws.send(JSON.stringify(payload))
  }, [token])

  useEffect(() => {
    let destroyed = false
    let retryTimer: ReturnType<typeof setTimeout> | undefined

    function connect() {
      if (destroyed) return
      const ws = new WebSocket(getLudoWsUrl())
      wsRef.current = ws

      ws.onopen = () => {
        if (destroyed) { ws.close(); return }
        setConnected(true)
        setReconnecting(false)
      }

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg.type === "connected") {
            joinNow(ws, gameId, roomId)
          }
          onMsgRef.current?.(msg, send)
        } catch {}
      }

      ws.onclose = () => {
        if (destroyed) return
        setConnected(false)
        setReconnecting(true)
        retryTimer = setTimeout(connect, 2000)
      }

      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      destroyed = true
      clearTimeout(retryTimer)
      wsRef.current?.close()
    }
  }, [roomId, gameId, joinNow, send])

  const rollDice = useCallback(() => send({ type: "roll_dice", gameId }), [gameId, send])
  const movePiece = useCallback((pieceIndex: number) => send({ type: "move_piece", gameId, pieceIndex }), [gameId, send])

  return { send, connected, reconnecting, rollDice, movePiece }
}
