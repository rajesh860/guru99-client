import React, { useState, useEffect, useRef } from "react"
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
  /** Remaining seconds of the current game round (from `autotime`). When this
   *  reaches the suspend threshold, the modal auto-closes (2s before backend
   *  actually suspends the odds). */
  roundSeconds?: number
}

const quickAmounts = [100, 500, 1000, 5000, 10000, 20000]

// Close the bet module this many seconds before the round ends — frontend
// pre-empts the backend suspend so no bet is placed in the last moments.
const SUSPEND_THRESHOLD = 2
// Auto-close the bet module after this many idle seconds.
const AUTO_CLOSE_SECONDS = 8

const PlaceBetModal = ({ isOpen, onClose, selectedPlayer, matchId, game = "teen20", roundSeconds }: Props) => {
  const [amount, setAmount] = useState("")
  const [countdown, setCountdown] = useState(AUTO_CLOSE_SECONDS)
  const [userIp, setUserIp] = useState("127.0.0.1")

  // Round is (about to be) suspended — either the backend already closed it, or
  // we're within the pre-empt window of the round ending.
  const isSuspended = roundSeconds != null && roundSeconds <= SUSPEND_THRESHOLD

  // Keep the latest onClose in a ref so the countdown interval isn't reset every
  // time the parent re-renders (it re-creates onClose each second via its timer).
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

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

  // Auto-close countdown (15s). Closes the modal when it hits 0.
  useEffect(() => {
    if (!isOpen) {
      setCountdown(AUTO_CLOSE_SECONDS)
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onCloseRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen])

  // Round about to end — close the bet module 2s before the backend suspends,
  // so a bet can't be placed in the final moments of the round.
  useEffect(() => {
    if (isOpen && isSuspended) onCloseRef.current()
  }, [isOpen, isSuspended])

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
    if (isSuspended) {
      snackbarUtil.error("Betting is suspended for this round")
      return
    }
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
      <div
        className={`pbm-sheet ${selectedPlayer.isBack ? "pbm-sheet--back" : "pbm-sheet--lay"}`}
        onClick={(e) => e.stopPropagation()}
      >

        <div className="pbm-handle" />

        {/* Title row: type + name on the left, close on the right */}
        <div className="pbm-toprow">
          <div className="pbm-left">
            <span className={`pbm-type ${selectedPlayer.isBack ? "pbm-type--back" : "pbm-type--lay"}`}>
              {selectedPlayer.isBack ? "BACK" : "LAY"}
            </span>
            <span className="pbm-name">{selectedPlayer.nat}</span>
          </div>
          <button className="pbm-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Info row: odds chip + timer chip */}
        <div className="pbm-subrow">
          <div className={`pbm-odds-chip ${selectedPlayer.isBack ? "pbm-odds-chip--back" : "pbm-odds-chip--lay"}`}>
            <span className="pbm-odds-chip-label">Odds</span>
            <span className="pbm-odds-chip-val">{selectedPlayer.rate}</span>
          </div>
          <span className={`pbm-timer ${countdown <= 3 ? "pbm-timer--danger" : countdown <= 6 ? "pbm-timer--warn" : ""}`}>
            <span className="pbm-timer-dot" />
            Closes in {countdown}s
          </span>
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
          {amount && (
            <button className="pbm-clear" onClick={() => setAmount("")}>✕</button>
          )}
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

        {/* Potential win + CTA, 50/50 */}
        <div className="pbm-bottom-row">
          <div className="pbm-potential">
            <span className="pbm-potential-label">Potential {selectedPlayer.isBack ? "Win" : "Liability"}</span>
            <span className="pbm-potential-val">₹{potentialWin}</span>
          </div>

          <button
            className={`pbm-submit ${selectedPlayer.isBack ? "pbm-submit--back" : "pbm-submit--lay"}`}
            onClick={handlePlaceBet}
            disabled={isLoading || !amount || isSuspended}
          >
            {isSuspended ? "Suspended" : isLoading ? "Placing..." : "Place Bet"}
          </button>
        </div>

      </div>
    </div>
  )
}

export default PlaceBetModal
