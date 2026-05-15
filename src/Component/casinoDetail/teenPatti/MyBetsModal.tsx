import React from "react"
import "./MyBetsModal.scss"

interface Bet {
  _id: string
  betOn: string
  odds: number
  stake: number
  betType: string
  status: string
  profitLoss: number
  placedAt: string
  settledAt?: string
  result?: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  bets: Bet[]
  isLoading?: boolean
}

const MyBetsModal = ({ isOpen, onClose, bets, isLoading }: Props) => {
  if (!isOpen) return null

  return (
    <div className={`my-bets-modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div 
        className={`my-bets-modal ${isOpen ? 'slide-up' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="my-bets-header">
          <h3>My Bets</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        {/* Content */}
        <div className="my-bets-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading bets...</p>
            </div>
          ) : bets && bets.length > 0 ? (
            <div className="bets-table-wrapper">
              <table className="bets-table">
                <thead>
                  <tr>
                    <th>Nation</th>
                    <th>Rate</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {bets.map((bet) => (
                    <tr key={bet._id}>
                      <td className="nation-cell">{bet.betOn}</td>
                      <td className="rate-cell">{bet.odds}</td>
                      <td className="amount-cell">₹{bet.stake}</td>
                      <td className={`type-cell ${bet.betType === 'lagai' ? 'back' : 'lay'}`}>
                        {bet.betType === 'lagai' ? 'Back' : 'Lay'}
                      </td>
                      <td className={`status-cell ${bet.status}`}>
                        {bet.status === 'won' ? '✓ Won' : bet.status === 'lost' ? '✗ Lost' : 'Pending'}
                      </td>
                      <td className={`pl-cell ${bet.profitLoss >= 0 ? 'profit' : 'loss'}`}>
                        {bet.profitLoss >= 0 ? '+' : ''}{bet.profitLoss}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M9 11H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 19H15a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 7v2a2 2 0 0 1-2 2h-2" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 17v2a2 2 0 0 0 2 2h2" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>No bets placed yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyBetsModal
