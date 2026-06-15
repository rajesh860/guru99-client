import { useEffect, useRef, useState } from "react"

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkNMNzA3NyIsInVzZXJsZXZlbCI6NywicGFydG5lcnNoaXAiOlt7ImNyaWNrZXRfc2hhcmUiOjAsImNyaWNrZXRfTWNvbW1pc3Npb24iOjIsImNyaWNrZXRfU2NvbW1pc3Npb24iOjMsInVzZXJsZXZlbCI6NywiaWQiOiJDTDcwNzcifV0sImlwIjoiMTEwLjIzNS4yMzIuMjI5LCAxMTAuMjM1LjIzMi4yMjkiLCJzaXRlIjoiaHR0cHM6Ly9iZXQ5OWV4cHJvLmNvbSIsImlhdCI6MTc4MDU1NTQ1NiwiZXhwIjoxNzgwNTc3MDU2fQ.3xecP-INEoMJaGWqqE-qKc5bUY7twVnrk0x2PTyu9cM"

const GMID = "807822231"

// Route through Vite proxy → sets Origin: https://bet99expro.com
const WS_URL = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/socket2/socket.io/?token=${TOKEN}&EIO=4&transport=websocket`

interface LogEntry {
  time: string
  event: string
  data: any
  type: "info" | "error" | "data"
}

const SocketTest = () => {
  const [status, setStatus]   = useState<"connecting" | "connected" | "error" | "disconnected">("connecting")
  const [logs, setLogs]       = useState<LogEntry[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  const addLog = (event: string, data: any, type: LogEntry["type"] = "data") => {
    const time = new Date().toLocaleTimeString("en-IN", { hour12: false })
    setLogs(prev => [{ time, event, data, type }, ...prev].slice(0, 100))
  }

  useEffect(() => {
    addLog("connecting", WS_URL, "info")

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      setStatus("connected")
      addLog("ws_open", "WebSocket handshake complete", "info")
      // Don't send anything yet — wait for "40" namespace connect from server
    }

    ws.onmessage = (e) => {
      const raw = e.data as string

      // Ping "2" → Pong "3"
      if (raw === "2") { ws.send("3"); return }

      // Open packet "0{...}" → reply with "40" (namespace connect)
      if (raw.startsWith("0") && !raw.startsWith("40")) {
        addLog("open", JSON.parse(raw.slice(1)), "info")
        ws.send("40")
        addLog("sent", "40 (namespace connect request)", "info")
        return
      }

      // Namespace connect ack "40{...}" → send subscriptions
      if (raw.startsWith("40")) {
        addLog("connected", "namespace ready — subscribing...", "info")
        // Exact format from BET99 app
        ws.send(`42["Market2","${GMID}"]`)
        ws.send(`42["Score","${GMID}"]`)
        addLog("sent", `Market2 + Score for gmid ${GMID}`, "info")
        return
      }

      // Event "42[eventName, data]"
      if (raw.startsWith("42")) {
        try {
          const arr = JSON.parse(raw.slice(2))
          const [event, payload] = arr
          addLog(event, payload, "data")
        } catch {
          addLog("raw", raw, "data")
        }
        return
      }

      addLog("raw", raw, "info")
    }

    ws.onerror = () => {
      setStatus("error")
      addLog("error", "WebSocket connection failed — token may be expired or CORS blocked", "error")
    }

    ws.onclose = (e) => {
      setStatus("disconnected")
      addLog("close", { code: e.code, reason: e.reason || "closed" }, "info")
    }

    return () => {
      ws.close()
    }
  }, [])

  const colorMap = {
    connecting:   "#f6ad55",
    connected:    "#68d391",
    error:        "#fc8181",
    disconnected: "#a0aec0",
  }

  const logColor = (type: LogEntry["type"]) => ({
    info:  "#718096",
    error: "#fc8181",
    data:  "#63b3ed",
  }[type])

  return (
    <div style={{
      margin: "12px",
      background: "#0d1117",
      borderRadius: "10px",
      border: "1px solid #2d3748",
      overflow: "hidden",
      fontFamily: "monospace",
    }}>
      <div style={{
        background: "#161b22",
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        borderBottom: "1px solid #2d3748",
        flexWrap: "wrap",
      }}>
        <span style={{
          width: 10, height: 10, borderRadius: "50%",
          background: colorMap[status], display: "inline-block",
          boxShadow: status === "connected" ? `0 0 8px ${colorMap[status]}` : "none",
          flexShrink: 0,
        }} />
        <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 13 }}>
          Raw WS — {status.toUpperCase()}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#718096" }}>
          socket2.bet99expro.com · gmid: {GMID}
        </span>
      </div>

      <div style={{ maxHeight: 320, overflowY: "auto", padding: "4px 0" }}>
        {logs.length === 0
          ? <div style={{ color: "#718096", fontSize: 12, padding: "12px 14px" }}>Connecting...</div>
          : logs.map((log, i) => (
            <div key={i} style={{
              padding: "3px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.03)",
              fontSize: 11, lineHeight: 1.6,
            }}>
              <span style={{ color: "#4a5568" }}>{log.time} </span>
              <span style={{ color: logColor(log.type), fontWeight: 700 }}>[{log.event}] </span>
              <span style={{ color: "#cbd5e0", wordBreak: "break-all" }}>
                {typeof log.data === "object"
                  ? JSON.stringify(log.data).slice(0, 250)
                  : String(log.data)}
              </span>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default SocketTest
