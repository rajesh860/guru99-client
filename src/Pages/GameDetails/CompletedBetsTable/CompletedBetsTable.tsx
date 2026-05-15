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

  const bets = Array.isArray(completedBetsData?.data)
    ? completedBetsData.data
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
              <th>Result</th>
              <th>P/L</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet: any, index: number) => {
              const isBookmaker = bet.marketType === 'bookmaker'
              const isBack = bet.betType?.toLowerCase() === 'back'

              let modeText = isBack ? 'YES' : 'NO'
              if (isBookmaker) modeText = isBack ? 'LAGAI' : 'KHAI'

              return (
                <tr key={bet._id || index} className={isBack ? 'back-row' : 'lay-row'}>
                  <td>{index + 1}</td>
                  <td>{bet.fancyName || bet.betOn || bet.team || "-"}</td>
                  <td>
                    <span className={`bet-type ${bet.betType?.toLowerCase() || 'back'}`}>
                      {modeText}
                    </span>
                  </td>
                  <td>{bet.runs ?? bet.run ?? "-"}</td>
                  <td className="odds-cell">{bet.size ?? bet.odds ?? "-"}</td>
                  <td className="stake-cell">{bet.stake ?? bet.amount ?? 0}</td>
                  <td className="result-cell">{bet.result ?? "-"}</td>
                  <td className={`pl-cell ${(bet.profitLoss ?? 0) >= 0 ? 'profit' : 'loss'}`}>
                    {bet.profitLoss !== undefined
                      ? `${bet.profitLoss >= 0 ? '+' : ''}${bet.profitLoss}`
                      : '-'}
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
