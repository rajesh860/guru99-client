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
  game?: string
}

const quickAmounts = [100, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000]

const PlaceBetModal = ({ isOpen, onClose, selectedPlayer, matchId, game = "teen20" }: Props) => {
  const [amount, setAmount] = useState("")
  const [countdown, setCountdown] = useState(20)
  const [userIp, setUserIp] = useState("127.0.0.1")

  const [trigger, { data: betPlaceResponse, isLoading, error: betError }] = usePlaceCasinoBetMutation()
  const { refetch: refetchMyBets } = useGetCasinoMyBetsQuery(
    { game },
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

  // Handle bet place response (HTTP 200 with success/failure)
  useEffect(() => {
    if (!betPlaceResponse) return
    if (betPlaceResponse?.success === true || betPlaceResponse?.status === true) {
      snackbarUtil.success(betPlaceResponse?.message || "Bet placed!")
      refetchMyBets()
      onClose()
    } else {
      snackbarUtil.error(betPlaceResponse?.message || "Failed to place bet")
    }
  }, [betPlaceResponse])

  // Handle HTTP error responses (4xx/5xx)
  useEffect(() => {
    if (!betError) return
    const msg = (betError as any)?.data?.message
      || (betError as any)?.error
      || "Failed to place bet"
    snackbarUtil.error(msg)
  }, [betError])

  const handlePlaceBet = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      snackbarUtil.error("Please enter a valid amount")
      return
    }

    const stake = parseFloat(amount)

    const betData = {
      game,
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
    <div className="pbm-overlay" onClick={onClose}>
      <div className="pbm-sheet" onClick={(e) => e.stopPropagation()}>

        <div className="pbm-handle" />

        {/* Top row: name | odds | timer */}
        <div className="pbm-toprow">
          <div className="pbm-left">
            <span className={`pbm-type ${selectedPlayer.isBack ? "pbm-type--back" : "pbm-type--lay"}`}>
              {selectedPlayer.isBack ? "BACK" : "LAY"}
            </span>
            <span className="pbm-name">{selectedPlayer.nat}</span>
          </div>
          <span className={`pbm-odds ${selectedPlayer.isBack ? "pbm-odds--back" : "pbm-odds--lay"}`}>
            {selectedPlayer.rate}
          </span>
          <span className="pbm-timer">{countdown}s</span>
        </div>

        {/* Amount input */}
        <div className="pbm-input-row">
          <span className="pbm-rupee">₹</span>
          <input
            type="number"
            className="pbm-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
          <button className="pbm-clear" onClick={() => setAmount("")}>C</button>
        </div>

        {/* Quick chips */}
        <div className="pbm-chips">
          {quickAmounts.map((v) => (
            <button
              key={v}
              className={`pbm-chip ${amount === v.toString() ? "pbm-chip--active" : ""}`}
              onClick={() => handleQuickAmount(v)}
            >
              {v >= 1000 ? `${v / 1000}K` : v}
            </button>
          ))}
        </div>

        {/* Potential win */}
        <div className="pbm-potential">
          <span>Potential {selectedPlayer.isBack ? "Win" : "Liability"}</span>
          <span className="pbm-potential-val">₹{potentialWin}</span>
        </div>

        {/* Buttons */}
        <div className="pbm-actions">
          <button className="pbm-cancel" onClick={onClose}>Cancel ({countdown}s)</button>
          <button
            className={`pbm-submit ${selectedPlayer.isBack ? "pbm-submit--back" : "pbm-submit--lay"}`}
            onClick={handlePlaceBet}
            disabled={isLoading || !amount}
          >
            {isLoading ? "Placing..." : "Place Bet"}
          </button>
        </div>

      </div>
    </div>
  )
}

export default PlaceBetModal
