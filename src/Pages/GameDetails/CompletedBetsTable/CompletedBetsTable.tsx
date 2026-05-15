import React from "react"
import "./CompletedBetsTable.scss"
import { useGetCompletedBetsQuery } from "../../../../store/service/userServices/userServices"

interface Props {
  beventId: string
}

const CompletedBetsTable = ({ beventId }: Props) => {
  const { data: completedBetsData, isLoading } = useGetCompletedBetsQuery(
    { beventId, page: 1, limit: 50 },
    { skip: !beventId, pollingInterval: 3000 }
  )

  const bets = Array.isArray(completedBetsData?.data?.bets) 
    ? completedBetsData.data.bets 
    : []

  if (isLoading) {
    return (
      <div className="completed-bets-table">
        <div className="completed-bets-header">Completed Bets</div>
        <div className="completed-bets-loading">Loading bets...</div>
      </div>
    )
  }

  if (bets.length === 0) {
    return (
      <div className="completed-bets-table">
        <div className="completed-bets-header">Completed Bets</div>
        <div className="completed-bets-empty">No completed bets</div>
      </div>
    )
  }

  return (
    <div className="completed-bets-table">
      <div className="completed-bets-header">COMPLETED BETS</div>
      <div className="bets-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>Mode</th>
              <th>Run</th>
              <th>Rate</th>
              <th>Amt</th>
              <th>Status</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet: any, index: number) => {
              const isBookmaker = bet.betType === 'bookmaker'
              const isBack = bet.betTypeDetail?.toLowerCase() === 'back'
              
              let modeText = 'YES'
              if (isBookmaker) {
                modeText = isBack ? 'LAGAI' : 'KHAI'
              } else {
                modeText = isBack ? 'YES' : 'NO'
              }
              
              return (
                <tr key={bet._id || index} className={isBack ? 'back-row' : 'lay-row'}>
                  <td>{index + 1}</td>
                  <td>{bet.betOn || bet.fancyName || bet.team || "-"}</td>
                  <td>
                    <span className={`bet-type ${bet.betTypeDetail?.toLowerCase() || 'back'}`}>
                      {modeText}
                    </span>
                  </td>
                  <td>{bet.run || bet.score || "-"}</td>
                  <td className="odds-cell">{bet.odds || bet.rate || "-"}</td>
                  <td className="stake-cell">{bet.stake || bet.amount || 0}</td>
                  <td className="status-cell">
                    <span className={`status-badge ${bet.status?.toLowerCase() || 'settled'}`}>
                      {bet.status || 'Settled'}
                    </span>
                  </td>
                  <td className={`result-cell ${bet.profitLoss >= 0 ? 'profit' : 'loss'}`}>
                    {bet.profitLoss !== undefined ? bet.profitLoss : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CompletedBetsTable
