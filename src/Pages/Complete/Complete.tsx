import { useState } from "react"
import { Link } from "react-router-dom"
import BackBtn from "../../Component/BackBtn/BackBtn"
import CommonLodding from "../../Component/CommonLodding"
import { useCompletedMatchQuery } from "../../../store/service/userServices/userServices"
import moment from "moment"
import "./complete.scss"

const Complete = () => {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const { data, isLoading } = useCompletedMatchQuery({ page, limit })

  // Filter out casino type entries
  const ledgerList = (data?.data?.ledger || []).filter(
    (item: any) => item.marketType !== 'casino'
  )
  const summary = data?.data?.summary || { totalWon: 0, totalLost: 0, totalHisab: 0 }
  const pagination = data?.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 }

  const formatDateTime = (dateString: string) => {
    return moment(dateString).format("Do MMM h:mm A")
  }

  const getCoinDisplay = (item: any) => {
    const won = Number(item?.won || 0)
    const lost = Number(item?.lost || 0)
    
    if (won > 0) {
      return {
        type: 'won',
        amount: won.toFixed(2)
      }
    } else if (lost > 0) {
      return {
        type: 'lost',
        amount: lost.toFixed(2)
      }
    }
    return {
      type: 'won',
      amount: '0.00'
    }
  }

  return (
    <>
      <BackBtn to="/main" name="BACK TO MAIN MENU" />
      
      <div className="complete-page">
        {/* No Data Case */}
        {!isLoading && ledgerList.length === 0 && (
          <div className="no-data">No Data Found</div>
        )}

        {/* Cards Grid */}
        {ledgerList.length > 0 && (
          <div className="complete-grid">
            {ledgerList.map((item, index: number) => {
              const coinDisplay = getCoinDisplay(item)
              return (
                <div key={index} className="complete-card">
                  {item?.beventId ? (
                    <Link
                      to={`/cricketResult/${item.beventId}`}
                      style={{ display: "block", textDecoration: "none", color: "inherit" }}
                    >
                      <div className="card-header">
                        {item?.matchName || "N/A"}
                      </div>
                      
                      <div className="card-body">
                        <div className="card-content">
                          <div className="team-logo team-logo-left"></div>
                          
                          <div className="match-details">
                            <div className="match-time">{formatDateTime(item?.settledAt)}</div>
                            <div className="bet-info">Match Bets : {item?.matchBets || 0}</div>
                            <div className="bet-info">Session Bets : {item?.sessionBets || 0}</div>
                            <div className="winner-text">Won By : {item?.wonBy || "N/A"}</div>
                            <div className={`coin-amount ${coinDisplay.type}`}>
                              {coinDisplay.type === 'won' ? 'Won' : 'Lost'} Coin : {coinDisplay.amount}
                            </div>
                          </div>
                          
                          <div className="team-logo team-logo-right"></div>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <>
                      <div className="card-header">
                        {item?.matchName || "N/A"}
                      </div>
                      
                      <div className="card-body">
                        <div className="card-content">
                          <div className="team-logo team-logo-left"></div>
                          
                          <div className="match-details">
                            <div className="match-time">{formatDateTime(item?.settledAt)}</div>
                            <div className="bet-info">Match Bets : {item?.matchBets || 0}</div>
                            <div className="bet-info">Session Bets : {item?.sessionBets || 0}</div>
                            <div className="winner-text">Won By : {item?.wonBy || "N/A"}</div>
                            <div className={`coin-amount ${coinDisplay.type}`}>
                              {coinDisplay.type === 'won' ? 'Won' : 'Lost'} Coin : {coinDisplay.amount}
                            </div>
                          </div>
                          
                          <div className="team-logo team-logo-right"></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination-controls">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Loader */}
      {isLoading && <CommonLodding />}
    </>
  )
}

export default Complete
