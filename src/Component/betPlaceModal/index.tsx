import { useState } from "react"
import "./styles.scss"
import { useParams } from "react-router-dom"

const amountOptions = [100, 200, 500, 1000, 5000, 10000, 25000, 50000]

const PlaceBetModal = ({ show, onClose, onSubmit, player, isLoading }) => {
  const [stake, setStake] = useState("")
  const { id } = useParams()
  if (!show || !player) return null

  const profit = (parseFloat(stake || "0") * parseFloat(player?.rate)).toFixed(
    2,
  )

  const handleAmountClick = (amount: number) => {
    setStake(prev => (parseInt(prev || "0") + amount).toString())
  }

  const handleSubmit = () => {
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
            CANCEL
          </button>
          <button
            disabled={isLoading}
            className="submit-btn"
            onClick={handleSubmit}
          >
            SUBMIT
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
