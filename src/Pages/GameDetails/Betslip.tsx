import { useEffect } from "react"
import { FaTimes, FaCheck } from "react-icons/fa"
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
}

const Betslip = ({
  focusAmountInput,
  amountInputRef,
  placeBetData,
  setPlaceBetData,
  timer,
  setTimer,
  checkOddsValid,
  onOddsInvalid,
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

  return (
    <>
      {isOpen && (
        <div className="betslip-modal-overlay" onClick={closeSlip}>
          <div
            className={`betslip-modal ${
              placeBetData?.betType === "fancy" 
                ? (placeBetData?.backOrLay === "yes" ? "betslip-modal--back" : "betslip-modal--lay")
                : (placeBetData?.backOrLay === "back" ? "betslip-modal--back" : "betslip-modal--lay")
            }`}
            onClick={e => {
              e.stopPropagation()
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              className="betslip-modal-close"
              onClick={closeSlip}
            >
              ×
            </button>

            {/* Header */}
            <div className="betslip-modal-header">
              <span className="betslip-modal-title">
                [ {placeBetData?.betType === "fancy"
                    ? placeBetData?.backOrLay === "yes" ? "YES" : "NO"
                    : placeBetData?.backOrLay === "back" ? "LAGAI" : "KHAI"
                } ] {placeBetData?.betType === "fancy" ? placeBetData?.fancyName : placeBetData?.team}
              </span>
            </div>

            {/* Rate and Input */}
            <div className="betslip-modal-rate-section">
              <span className="betslip-modal-rate-label">Rate : {placeBetData?.odds || 0}</span>
              <input
                type="number"
                ref={amountInputRef}
                autoComplete="OFF"
                className="betslip-modal-input"
                onChange={handleAmountChange}
                placeholder="0"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="betslip-modal-amounts">
              <div className="betslip-modal-quick">
                {[200, 500, 1000, 2000,5000].map(v => (
                  <button
                    key={v}
                    type="button"
                    className="betslip-modal-chip"
                    onClick={() => setAmount(v)}
                  >
                    {v >= 1000 ? `${v / 1000}K` : v}
                  </button>
                ))}
              </div>
              <div className="betslip-modal-quick">
                {[10000,20000, 50000, 100000, 200000].map(v => (
                  <button
                    key={v}
                    type="button"
                    className="betslip-modal-chip"
                    onClick={() => setAmount(v)}
                  >
                    {v >= 1000 ? `${v / 1000}K` : v}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="betslip-modal-footer">
              <button
                type="button"
                className="betslip-modal-cancel-btn"
                onClick={closeSlip}
              >
                Cancel
              </button>
              <span className="betslip-modal-timer">{timer || 0}</span>
              {isLoading || isTossLoading ? (
                <div className="loading-spinner" />
              ) : (
                <button
                  type="button"
                  className="betslip-modal-submit-btn"
                  onClick={handleBetPlaced}
                  disabled={Number(timer || 0) === 0}
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Betslip
