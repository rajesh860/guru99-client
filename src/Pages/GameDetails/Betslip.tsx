import { useEffect } from "react"
import { useBetPlacedMutation, useTossBetPlacedMutation } from "../../../store/service/userServices/userServices"
import snackbarUtil from "../../utils/Snackbar"
import { useParams } from "react-router-dom"

interface Props {
  focusAmountInput: () => void
  amountInputRef: React.MutableRefObject<HTMLInputElement>
  placeBetData: any
  setPlaceBetData: React.Dispatch<any>
  timer: number
  setTimer: React.Dispatch<React.SetStateAction<number>>
  checkOddsValid: () => { valid: boolean; message: string }
  onOddsInvalid: () => void
  matchName?: string
}

const QUICK_STAKES = [200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000]
const STAKE_STEP = 100

const Betslip = ({
  focusAmountInput,
  amountInputRef,
  placeBetData,
  setPlaceBetData,
  timer,
  setTimer,
  checkOddsValid,
  onOddsInvalid,
  matchName,
}: Props) => {
  const { id } = useParams<{ id: string }>()
  const [trigger, { data: betplaceData, isLoading }] = useBetPlacedMutation()
  const [triggerToss, { data: tossPlaceData, isLoading: isTossLoading }] = useTossBetPlacedMutation()

  const isOpen = Boolean(placeBetData) && Number(timer || 0) > 0

  const closeSlip = () => {
    setPlaceBetData(null)
    if (amountInputRef.current) {
      amountInputRef.current.value = ""
    }
    setTimer(null)
  }

  const setAmount = (value: number) => {
    setPlaceBetData((prev: any) => ({
      ...prev,
      stake: value,
    }))
    if (amountInputRef.current) {
      amountInputRef.current.value = String(value)
    }
  }

  const clearAmount = () => setAmount(0)
  const incrementStake = () => setAmount(Number(placeBetData?.stake || 0) + STAKE_STEP)
  const decrementStake = () => setAmount(Math.max(0, Number(placeBetData?.stake || 0) - STAKE_STEP))

  useEffect(() => {
    const timers = setTimeout(() => {
      if (timer > 0) {
        setTimer(o => o - 1)
      } else {
        closeSlip()
      }
    }, 1000)
    return () => clearInterval(timers)
  }, [timer])

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setPlaceBetData((prev: any) => ({
      ...prev,
      stake: Number(value) || 0,
    }))
  }

  const handleBetPlaced = () => {
    if (!placeBetData || placeBetData.stake <= 0) {
      snackbarUtil.error("Please enter stake amount")
      return
    }
    const result = checkOddsValid()
    if (!result.valid) {
      snackbarUtil.warning(result.message)
      onOddsInvalid()
      return
    }
    if (placeBetData.betType === "toss") {
      triggerToss(placeBetData)
    } else {
      trigger(placeBetData)
    }
  }

  useEffect(() => {
    const data = betplaceData || tossPlaceData
    if (data) {
      if (data.success || data.status) {
        snackbarUtil.success(data.message)
        closeSlip()
      } else {
        snackbarUtil.error(data.message)
        closeSlip()
      }
    }
  }, [betplaceData, tossPlaceData, id])

  if (!isOpen) return null

  const isFancy = placeBetData?.betType === "fancy"
  const isBack = isFancy ? placeBetData?.backOrLay === "yes" : placeBetData?.backOrLay === "back"
  const contentClass = isBack ? "back-bet-content" : "lay-bet-content"
  const betType = isBack ? "back-bet" : "lay-bet"
  const selectionLabel = isFancy
    ? `[ ${isBack ? "YES" : "NO"} ] ${placeBetData?.fancyName}`
    : `[ ${isBack ? "LAGAI" : "KHAI"} ] ${placeBetData?.team}`

  return (
    <div className="betslip-embedded-overlay" onClick={closeSlip}>
      <div className="betslip-embedded" onClick={e => e.stopPropagation()}>
        <div className="betslip-embedded-container">
          <div className={`betslip-embedded-content ${contentClass}`}>
            {/* Countdown Timer */}
            <div className="countdown-timer">
              <span className="countdown-text">Auto-close in: </span>
              <span className="countdown-value">{timer || 0}s</span>
              <button type="button" className="close-btn" onClick={closeSlip}>×</button>
            </div>

            {/* Match Info */}
            <div className="match-info">
              <h3>{matchName}</h3>
            </div>

            {/* Bet Selection */}
            <div className={`bet-selection ${betType}`}>
              <div className="selection-header">
                <span>{selectionLabel}</span>
              </div>

              {/* Odds and Stake Section */}
              <div className="odds-stake-section">
                <div className="odds-section">
                  <label>Odds</label>
                  <div className="odds-input">
                    <span className="odds-value">{placeBetData?.odds || 0}</span>
                  </div>
                </div>

                <div className="stake-section">
                  <label>Stake</label>
                  <div className="stake-input">
                    <button type="button" className="stake-step minus" onClick={decrementStake}>−</button>
                    <input
                      type="number"
                      ref={amountInputRef}
                      autoComplete="off"
                      onChange={handleAmountChange}
                      placeholder="0"
                    />
                    <button type="button" className="stake-step plus" onClick={incrementStake}>+</button>
                    <button type="button" className="clear-btn" onClick={clearAmount}>clear</button>
                  </div>
                </div>
              </div>

              {/* Quick Stakes */}
              <div className="quick-stakes">
                <div className="stakes-grid">
                  {QUICK_STAKES.map(v => (
                    <button
                      key={v}
                      type="button"
                      className="stake-btn"
                      onClick={() => setAmount(v)}
                    >
                      {v >= 1000 ? `${v / 1000}K` : v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button type="button" className="cancel-btn" onClick={closeSlip}>Cancel Bet</button>
                {isLoading || isTossLoading ? (
                  <div className="loading-spinner" />
                ) : (
                  <button
                    type="button"
                    className="place-btn"
                    onClick={handleBetPlaced}
                    disabled={Number(timer || 0) === 0}
                  >
                    Place Bet
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Betslip
