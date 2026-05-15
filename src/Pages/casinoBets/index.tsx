import React, { useEffect } from "react"
import "./styles.scss"
import BackBtn from "../../Component/BackBtn/BackBtn"

const CasinoBets = () => {

  return (
    <>
      <BackBtn to="/casino-list" name="BACK TO CASINO MENU" />
      <div className="casino-bets-wrapper">
        <div className="table-header">Casino Bets</div>
        <div className="table-container">
          <table className="casino-table" style={{lineHeight: "unset"}}>
            <thead>
              <tr>
                <th>Game</th>
                <th>MarketId</th>
                <th>Amount</th>
                <th>Rate</th>
                <th>Bet</th>
                <th>Result</th>
                <th>Porf/Loss</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} style={{textAlign: 'center', padding: '20px'}}>
                  No data available
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default CasinoBets
