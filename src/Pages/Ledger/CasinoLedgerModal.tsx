import React from "react"
import { useGetCasinoLedgerQuery } from "../../../store/service/userServices/userServices"
import CommonLodding from "../../Component/CommonLodding"
import moment from "moment"
import "./CasinoLedgerModal.scss"

interface Props {
  isOpen: boolean
  onClose: () => void
  game: string
  date: string
}

const CasinoLedgerModal = ({ isOpen, onClose, game, date }: Props) => {
  const { data: casinoLedgerData, isLoading } = useGetCasinoLedgerQuery(
    { game, date },
    { skip: !isOpen }
  )

  const ledgerList = casinoLedgerData?.data || []

  if (!isOpen) return null

  return (
    <div className="casino-ledger-overlay" onClick={onClose}>
      <div className="casino-ledger-modal" onClick={(e) => e.stopPropagation()}>
        {isLoading && <CommonLodding />}
        
        <div className="casino-ledger-header">
          <h2>Casino Ledger Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="casino-ledger-info">
          <span>Game: <strong>{game}</strong></span>
          <span>Date: <strong>{moment(date).format("DD/MM/YYYY")}</strong></span>
        </div>

        <div className="casino-ledger-table-wrap">
          <table className="casino-ledger-table">
            <thead>
              <tr>
                <th>Round ID</th>
                <th>Bet Type</th>
                <th>Selection</th>
                <th>Odds</th>
                <th>Stake</th>
                <th>Result</th>
                <th>P/L</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {ledgerList.length > 0 ? (
                ledgerList.map((item: any, index: number) => (
                  <tr key={index}>
                    <td>{item?.roundId || "-"}</td>
                    <td>
                      <span className={`bet-type-badge ${item?.betType === "lagai" ? "back" : "lay"}`}>
                        {item?.betType === "lagai" ? "BACK" : "LAY"}
                      </span>
                    </td>
                    <td>{item?.selection || item?.sid || "-"}</td>
                    <td>{item?.odds || item?.rate || "-"}</td>
                    <td>₹{Number(item?.stake || 0).toFixed(2)}</td>
                    <td>
                      <span className={`result-badge ${item?.result === "won" ? "won" : item?.result === "lost" ? "lost" : ""}`}>
                        {item?.result || "-"}
                      </span>
                    </td>
                    <td>
                      <span className={Number(item?.pl || 0) >= 0 ? "pl-positive" : "pl-negative"}>
                        {Number(item?.pl || 0) >= 0 ? "+" : ""}
                        ₹{Number(item?.pl || 0).toFixed(2)}
                      </span>
                    </td>
                    <td>{item?.createdAt ? moment(item?.createdAt).format("HH:mm:ss") : "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center" }}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default CasinoLedgerModal
