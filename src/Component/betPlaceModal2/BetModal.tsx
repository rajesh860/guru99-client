import React, { useEffect, useState, useRef } from "react"
import "./BetModal.scss"
import { useBetPlaceMutation } from "../../../store/service/casino/casinoServices"
import { useGetCasinoMyBetsQuery } from "../../../store/service/userServices/userServices"
import snackbarUtil from "../../utils/Snackbar"

const amounts = [200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000]

const formatAmount = (n: number) =>
  n >= 1000 ? `${n / 1000}K` : `${n}`

// Auto-close the bet module after this many idle seconds.
const AUTO_CLOSE_SECONDS = 8
// Close the bet module this many seconds before the round ends (pre-empt backend suspend).
const SUSPEND_THRESHOLD = 2

type Props = {
  onClose?: () => void
  selectedPlayer?: {
    gstatus: boolean
    max: number
    mid: string
    min: number
    nat: string
    nation: string
    pnl: number
    rate: string
    sid: string
    isBack?: boolean
    sectionId?: string
  }
  matchId?: string
  /** Remaining seconds of the current game round (from `autotime`). At the
   *  suspend threshold the modal auto-closes 2s before backend suspends. */
  roundSeconds?: number
}

const BetModal: React.FC<Props> = ({ onClose, selectedPlayer, matchId, roundSeconds}) => {
  const [seconds, setSeconds] = useState(AUTO_CLOSE_SECONDS)
  const isSuspended = roundSeconds != null && roundSeconds <= SUSPEND_THRESHOLD

  // Keep the latest onClose in a ref so the countdown isn't reset every time the
  // parent re-renders (it re-creates onClose each second via its own timer).
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])
  const [selectedAmount, setSelectedAmount] = useState(0)
  const [customAmount, setCustomAmount] = useState("")
  const [userIp, setUserIp] = useState("127.0.0.1") // Default fallback
  console.log(selectedPlayer,"selectedPlayer")
  const [trigger, { data: betPlaceResponse, isLoading,error }] = useBetPlaceMutation()
  
  // Fetch my bets for casino game
  const { data: myBetsData, refetch: refetchMyBets } = useGetCasinoMyBetsQuery(
    { game: "teen20" },
    { pollingInterval: 3000 }
  )

  // Get user's IP address
  useEffect(() => {
    const getUserIP = async () => {
      try {
        // Try multiple IP services for better reliability
        const ipServices = [
          'https://api.ipify.org?format=json',
          'https://ipapi.co/json/',
          'https://jsonip.com'
        ]

        for (const service of ipServices) {
          try {
            const response = await fetch(service)
            const data = await response.json()
            const ip = data.ip || data.IPv4 || data.query
            if (ip) {
              setUserIp(ip)
              return
            }
          } catch (err) {
            console.warn(`Failed to get IP from ${service}:`, err)
            continue
          }
        }
      } catch (error) {
        console.error('Error getting user IP:', error)
        // Keep default fallback IP
      }
    }

    getUserIP()
  }, [])

  // Get device info
  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent
    return {
      userAgent,
      browser: "Chrome", // You can enhance this detection
      device: "Desktop",
      deviceType: "desktop",
      os: "Windows", // You can enhance this detection
      os_version: "windows-10",
      browser_version: "108.0.0.0",
      orientation: "landscape"
    }
  }

  // Handle bet place response
  useEffect(() => {
    if (betPlaceResponse) {
      console.log("Bet place response:", betPlaceResponse)
      if (betPlaceResponse?.status === true) {
        // Show exact backend success message
        snackbarUtil.success(betPlaceResponse?.message)
        // Refetch my bets after successful bet placement
        refetchMyBets()
        onClose && onClose()
      } else {
        // Show exact backend error message
        const errorMessage = betPlaceResponse?.message
        console.log("Backend error message:", errorMessage)
        snackbarUtil.error(errorMessage)
      }
    }
  }, [betPlaceResponse])

  // Handle API errors
  useEffect(() => {
    if (error) {
      console.log("API error:", error)
      
      // Handle RTK Query error types properly
      if ('data' in error) {
        // FetchBaseQueryError
        const errorData = error.data as any
        if (errorData?.message) {
          snackbarUtil.error(errorData.message)
        } else {
          snackbarUtil.error("API error occurred. Please try again.")
        }
      } else if ('message' in error) {
        // SerializedError
        snackbarUtil.error(error.message || "Network error occurred. Please try again.")
      } else {
        snackbarUtil.error("Network error occurred. Please try again.")
      }
    }
  }, [error])

  // Countdown logic (auto-close after 15s)
  useEffect(() => {
    if (seconds <= 0) {
      onCloseRef.current && onCloseRef.current()
      return
    }

    const timerId = setTimeout(() => {
      setSeconds(prev => prev - 1)
    }, 1000)

    return () => clearTimeout(timerId)
  }, [seconds])

  // Round about to end — close 2s before backend suspends the odds.
  useEffect(() => {
    if (isSuspended) onCloseRef.current && onCloseRef.current()
  }, [isSuspended])

  // Handle amount selection
  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount(amount.toString())
  }

  // Handle clear
  const handleClear = () => {
    setSelectedAmount(0)
    setCustomAmount("")
  }

  // Handle bet submission
  const handleSubmit = () => {
    if (isSuspended) {
      snackbarUtil.error("Betting is suspended for this round")
      return
    }
    const amount = selectedAmount || parseInt(customAmount) || 0

    if (amount <= 0) {
      snackbarUtil.error("Please enter a valid amount")
      return
    }

    if (!selectedPlayer) {
      snackbarUtil.error("No selection made")
      return
    }

    // Check min/max limits
    if (amount < selectedPlayer.min) {
      snackbarUtil.error(`Minimum bet amount is ${selectedPlayer.min}`)
      return
    }

    if (amount > selectedPlayer.max) {
      snackbarUtil.error(`Maximum bet amount is ${selectedPlayer.max}`)
      return
    }
    console.log("click")

    const payload = {
      marketId: selectedPlayer.mid,
      nation: selectedPlayer.nat || selectedPlayer.nation,
      casinoName: 2, // Set to 2 as per backend validation (must be ≤ 2)
      isBack: selectedPlayer?.isBack, // Default to true if not provided
      odds: parseFloat(selectedPlayer.rate),
      selectionId: selectedPlayer.sid || selectedPlayer.sectionId,
      colorName: selectedPlayer?.isBack ? "back" : "lay",
      stake: amount,
      userIp: userIp,
      placeTime: new Date().toISOString().replace('T', ' ').substring(0, 23),
      matchId: matchId || "53",
      deviceInfo: getDeviceInfo()
    }

    trigger(payload)
  }

  console.log("Rendering BetModal with seconds:", seconds)
  return (
    <div className="bet-modal-overlay2" onClick={() => onClose && onClose()}>
      <div className="bet-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>{selectedPlayer?.nat || "TIE"}</h2>
          <span className="close" onClick={onClose}>
            ×
          </span>
        </div>
        <div className="modal-content">

        {/* Input */}
        <input 
          className="amount-input" 
          value={customAmount || selectedAmount || "0"} 
          onChange={(e) => {
            const value = e.target.value
            if (/^\d*$/.test(value)) {
              setCustomAmount(value)
              setSelectedAmount(parseInt(value) || 0)
            }
          }}
          placeholder="Enter amount"
        />

        {/* Chips */}
        <div className="chips">
          {amounts.map(amt => (
            <button
              key={amt}
              className={`chip ${selectedAmount === amt ? 'selected' : ''}`}
              onClick={() => handleAmountClick(amt)}
            >
              {formatAmount(amt)}
            </button>
          ))}
          <button className="chip clear" onClick={handleClear}>C</button>
        </div>

        {/* Show selected bet info */}
        {/* {selectedPlayer && (
          <div className="bet-info">
            <div>Selection: {selectedPlayer.nat}</div>
            <div>Odds: {selectedPlayer.rate}</div>
            <div>Stake: {selectedAmount || parseInt(customAmount) || 0}</div>
            <div>Potential Win: {((selectedAmount || parseInt(customAmount) || 0) * parseFloat(selectedPlayer.rate)).toFixed(2)}</div>
          </div>
        )} */}

        {/* Footer */}
        <div className="modal-footer">
          <button className="cancel" onClick={() => onClose && onClose()}>{`Cancel ${seconds}s ✖`}</button>
          <button
            className="submit"
            onClick={handleSubmit}
            disabled={isLoading || isSuspended}
          >

            {isSuspended ? "Suspended" : isLoading ? "Placing..." : "Submit ✔"}
          </button>
        </div>
</div>
      </div>
    </div>
  )
}

export default BetModal
