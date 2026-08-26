import { useState, useEffect, useRef } from "react"
import "./styles.scss"
import { useParams } from "react-router-dom"

const amountOptions = [100, 200, 500, 1000, 5000, 10000, 25000, 50000]

// Auto-close the bet module after this many idle seconds.
const AUTO_CLOSE_SECONDS = 8
// Close the bet module this many seconds before the round ends (pre-empt backend suspend).
const SUSPEND_THRESHOLD = 2

const PlaceBetModal = ({ show, onClose, onSubmit, player, isLoading, roundSeconds = null }) => {
  const [stake, setStake] = useState("")
  const [seconds, setSeconds] = useState(AUTO_CLOSE_SECONDS)
  const { id } = useParams()

  const isSuspended = roundSeconds != null && roundSeconds <= SUSPEND_THRESHOLD

  // Keep the latest onClose in a ref so the countdown interval isn't reset every
  // time the parent re-renders (it re-creates onClose each second via its timer).
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  // Auto-close countdown (15s).
  useEffect(() => {
    if (!show) { setSeconds(AUTO_CLOSE_SECONDS); return }
    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) { clearInterval(timer); onCloseRef.current(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [show])

  // Round about to end — close 2s before backend suspends the odds.
  useEffect(() => {
    if (show && isSuspended) onCloseRef.current()
  }, [show, isSuspended])

  if (!show || !player) return null

  const profit = (parseFloat(stake || "0") * parseFloat(player?.rate)).toFixed(
    2,
  )

  const handleAmountClick = (amount: number) => {
    setStake(prev => (parseInt(prev || "0") + amount).toString())
  }

  const handleSubmit = () => {
    if (isSuspended) return
    const payload = {
      casinoName: 2,
      colorName: "back",
      deviceInfo: {
        browser: "Chrome",
        browser_version: "108.0.0.0",
        device: "Macintosh",
        deviceType: "desktop",
        orientation: "landscape",
        os: "Windows",
        os_version: "windows-10",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      },
      isBack: true,
      marketId: player?.mid,
      matchId: id,
      nation: player?.nation,
      odds: player?.rate,
      placeTime: new Date().toISOString().replace("T", " ").slice(0, 23),
      selectionId: player?.sid,
      stake: stake,
      userIp: "157.49.27.53",
    }
    onSubmit(payload)

    setStake("")
  }


  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ position: "relative" }}>
        <div className="modal-header">PLACE BET</div>

        <table className="bet-table">
          <thead>
            <tr>
              <th>Bet for</th>
              <th>Odds</th>
              <th>Stake</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ color: "#000" }}>{player?.nation}</td>
              <td style={{ color: "#000" }}>{player?.rate}</td>
              <td>
                <input
                  type="number"
                  value={stake}
                  onChange={e => setStake(e.target.value)}
                />
              </td>
              <td style={{ color: "#000" }}>{profit}</td>
            </tr>
          </tbody>
        </table>

        <div className="amount-buttons">
          {amountOptions.map(amount => (
            <button key={amount} onClick={() => handleAmountClick(amount)}>
              {amount}
            </button>
          ))}
        </div>

        <div className="modal-actions">
          <button
            className="cancel-btn"
            onClick={() => {
              onClose()
              setStake("")
            }}
          >
            CANCEL ({seconds}s)
          </button>
          <button
            disabled={isLoading || isSuspended}
            className="submit-btn"
            onClick={handleSubmit}
          >
            {isSuspended ? "SUSPENDED" : "SUBMIT"}
          </button>
        </div>
        {isLoading && (
          <div
            id="pause"
            className="d-flex align-items-center justify-content-center"
          >
            <div id="spinner"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlaceBetModal
