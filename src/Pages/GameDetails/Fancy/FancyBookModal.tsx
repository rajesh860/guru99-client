import React from "react"
import "./FancyBookModal.scss"

interface FancyBookData {
  runs: number
  profitLoss: number
}

interface FancyBookResponse {
  fancyId: string
  beventId: string
  bets: Array<{
    betType: string
    runs: number
    size: number
    stake: number
  }>
  book: FancyBookData[]
  summary: {
    totalBets: number
    minProfitLoss: number
    maxProfitLoss: number
    range: number
  }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  data: FancyBookResponse | null
  fancyName: string
  isLoading?: boolean
}

const FancyBookModal = ({ isOpen, onClose, data, fancyName, isLoading }: Props) => {
  if (!isOpen) return null

  return (
    <div className="fbm-overlay" onClick={onClose}>
      <div className="fbm-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="fbm-header">
          <h3>{fancyName || "Fancy Book"}</h3>
          <button className="fbm-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Content */}
        <div className="fbm-content">
          {isLoading ? (
            <div className="fbm-loading">Loading...</div>
          ) : data ? (
            <div className="fbm-table">
              {/* Table Header */}
              <div className="fbm-table-header">
                <div>Runs</div>
                <div>P/L</div>
              </div>

              {/* Table Body */}
              <div className="fbm-table-body">
                {data.book && data.book.length > 0 ? (
                  data.book.map((item, index) => (
                    <div key={index} className="fbm-table-row">
                      <div className="fbm-cell-runs">{item.runs}</div>
                      <div
                        className="fbm-cell-pl"
                        style={{ color: item.profitLoss >= 0 ? "#4CAF50" : "#f44336" }}
                      >
                        {item.profitLoss >= 0 ? "+" : ""}{item.profitLoss}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="fbm-empty">No book data available</div>
                )}
              </div>
            </div>
          ) : (
            <div className="fbm-empty">No data available</div>
          )}
        </div>

      </div>
    </div>
  )
}

export default FancyBookModal
