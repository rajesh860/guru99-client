import React, { useState, useEffect } from "react"
import "./PlaceBetModal.scss"
import { usePlaceCasinoBetMutation } from "../../../../store/service/teenPattiApi"
import { useGetCasinoMyBetsQuery } from "../../../../store/service/userServices/userServices"
import snackbarUtil from "../../../utils/Snackbar"

interface Props {
  isOpen: boolean
  onClose: () => void
  selectedPlayer: {
    nat: string
    rate: string
    isBack: boolean
    sid: string
    mid: string
  } | null
  matchId?: string
}

const quickAmounts = [100, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000]

const PlaceBetModal = ({ isOpen, onClose, selectedPlayer, matchId }: Props) => {
  const [amount, setAmount] = useState("")
  const [countdown, setCountdown] = useState(20)
  const [userIp, setUserIp] = useState("127.0.0.1")

  const [trigger, { data: betPlaceResponse, isLoading }] = usePlaceCasinoBetMutation()
  const { refetch: refetchMyBets } = useGetCasinoMyBetsQuery(
    { game: "teen20" },
    { pollingInterval: 3000 }
  )

  // Get user IP
  useEffect(() => {
    const getUserIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        if (data.ip) setUserIp(data.ip)
      } catch (error) {
        console.error('Error getting IP:', error)
      }
    }
    getUserIP()
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!isOpen) {
      setCountdown(7)
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, onClose])

  // Handle bet place response
  useEffect(() => {
    if (betPlaceResponse) {
      if (betPlaceResponse?.status === true) {
        snackbarUtil.success(betPlaceResponse?.message)
        refetchMyBets()
        onClose()
      } else {
        snackbarUtil.error(betPlaceResponse?.message)
      }
    }
  }, [betPlaceResponse])

  const handlePlaceBet = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      snackbarUtil.error("Please enter a valid amount")
      return
    }

    const stake = parseFloat(amount)

    const betData = {
      game: "teen20",
      roundId: selectedPlayer?.mid || "",
      sid: selectedPlayer?.sid || "",
      stake: stake,
      betType: selectedPlayer?.isBack ? "lagai" : "khai",
    }

    try {
      await trigger(betData)
      setAmount("")
      
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (error) {
      console.error("Bet placement error:", error)
      snackbarUtil.error("Failed to place bet")
    }
  }

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString())
  }

  const potentialWin = selectedPlayer
    ? selectedPlayer.isBack
      ? (parseFloat(amount || "0") * (parseFloat(selectedPlayer.rate) - 1)).toFixed(2)
      : parseFloat(amount || "0").toFixed(2)
    : "0.00"

  if (!isOpen || !selectedPlayer) return null

  return (
    <div className="place-bet-overlay" onClick={onClose}>
      <div className="place-bet-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bet-header">
          <div className="bet-header-info">
            <div className={`bet-type-badge ${selectedPlayer.isBack ? 'back' : 'lay'}`}>
              {selectedPlayer.isBack ? 'BACK' : 'LAY'}
            </div>
            <div className="bet-team-name">{selectedPlayer.nat}</div>
          </div>
          <div className="bet-countdown">{countdown}s</div>
        </div>

        {/* Odds Display */}
        <div className="bet-odds-section">
          <div className="odds-label">Odds</div>
          <div className={`odds-value ${selectedPlayer.isBack ? 'back' : 'lay'}`} style={{color:"white"}}>
            {selectedPlayer.rate}
          </div>
        </div>

        {/* Amount Input */}
        <div className="bet-amount-section">
          <label className="amount-label">Stake Amount</label>
          <div className="amount-input-wrapper">
            <span className="currency-symbol">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="amount-input"
              autoFocus
            />
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="quick-amounts">
          {quickAmounts.map((value) => (
            <button
              key={value}
              className="quick-amount-btn"
              onClick={() => handleQuickAmount(value)}
            >
              {value >= 1000 ? `${value / 1000}K` : value}
            </button>
          ))}
        </div>

        {/* Potential Win */}
        <div className="potential-win-section">
          <div className="potential-label">Potential {selectedPlayer.isBack ? 'Win' : 'Liability'}</div>
          <div className="potential-value">₹{potentialWin}</div>
        </div>

        {/* Action Buttons */}
        <div className="bet-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`btn-place-bet ${selectedPlayer.isBack ? 'back' : 'lay'}`}
            onClick={handlePlaceBet}
            disabled={isLoading || !amount}
          >
            {isLoading ? 'Placing...' : 'Place Bet'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlaceBetModal
