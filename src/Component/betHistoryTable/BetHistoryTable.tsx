import React from "react"
import "./BetHistoryTable.scss"

interface BetHistoryItem {
  team: string
  mode: string
  rate: string
  amount: string
  result: string
  dateTime: string
  roundId?: string
}

interface BetHistoryTableProps {
  data?: BetHistoryItem[]
  roundId?: string
}

const BetHistoryTable: React.FC<BetHistoryTableProps> = ({ data = [], roundId }) => {
  return (
    <div className="bet-history-table-wrapper">
      {/* <h3 className="bet-history-title">Bet History</h3> */}
      <table className="bet-history-table">
        <thead>
          <tr>
            <th>Team</th>
            <th>Mode</th>
            <th>Rate</th>
            <th>Amount</th>
            <th>Result</th>
            <th>Date & Time</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((bet, index) => (
              <React.Fragment key={index}>
                {/* <tr className="round-id-row">
                  <td colSpan={6} className="round-id">
                    {bet.team}
                  </td>
                </tr> */}
                <tr className="bet-data-row">
                  <td>  
                    <span>
                         {bet.team} 
                        </span>
                  <span style={{marginTop:"5px",display:"block"}}>
                    {roundId || bet.roundId || "-"}
                    </span>
                    </td>
                  <td>{bet.mode}</td>
                  <td>{bet.rate}</td>
                  <td>{bet.amount}</td>
                  <td className={`result ${bet.result.toLowerCase().replace(' ', '-')}`}>
                    {bet.result}
                  </td>
                  <td>{bet.dateTime}</td>
                </tr>
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="no-data">
                No bet history available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default BetHistoryTable