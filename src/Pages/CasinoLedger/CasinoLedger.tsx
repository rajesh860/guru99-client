import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useGetCasinoLedgerQuery } from "../../../store/service/userServices/userServices"
import CommonLodding from "../../Component/CommonLodding"
import BackBtn from "../../Component/BackBtn/BackBtn"
import moment from "moment"
import "./CasinoLedger.scss"

const CasinoLedger = () => {
  const { game, date } = useParams<{ game: string; date: string }>()
  const navigate = useNavigate()

  const { data: casinoLedgerData, isLoading } = useGetCasinoLedgerQuery(
    { game: game || "", date: date || "" },
    { skip: !game || !date, refetchOnMountOrArgChange: true }
  )

  const ledgerList = casinoLedgerData?.data?.rounds || []
  const summary = casinoLedgerData?.data?.summary || { totalWon: 0, totalLost: 0, totalPL: 0 }
  const gameName = casinoLedgerData?.gameName || game

  return (
    <>
      {isLoading && <CommonLodding />}
      <BackBtn to="/ledger" name="BACK TO LEDGER" />
      
      <div className="casino-ledger-page">
        <div className="casino-ledger-page__container">
          <div className="casino-ledger-page__card">
            <div className="casino-ledger-page__title">
              CASINO LEDGER DETAILS
            </div>

            {/* <div className="casino-ledger-page__info">
              <span>Game: <strong>{gameName}</strong></span>
              <span>Date: <strong>{moment(date).format("DD/MM/YYYY")}</strong></span>
              <span>Total Won: <strong className="text-won">₹{Number(summary.totalWon).toFixed(2)}</strong></span>
              <span>Total Lost: <strong className="text-lost">₹{Number(summary.totalLost).toFixed(2)}</strong></span>
              <span>Net P/L: <strong className={Number(summary.totalPL) >= 0 ? "text-won" : "text-lost"}>{Number(summary.totalPL) >= 0 ? "+" : ""}₹{Number(summary.totalPL).toFixed(2)}</strong></span>
            </div> */}

            <div className="casino-ledger-page__tableWrap">
              <table className="casino-ledger-page__table">
                <thead>
                  <tr>
                    <th style={{ width: "6%" }}>S.NO</th>
                    <th style={{ width: "19%" }}>Round ID</th>
                    <th style={{ width: "10%" }}>Bet On</th>
                    <th style={{ width: "8%" }}>Odds</th>
                    <th style={{ width: "13%" }}>Stake</th>
                    <th style={{ width: "13%" }}>P/L</th>
                    <th style={{ width: "9%" }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerList.length > 0 ? (
                    ledgerList.map((item: any, index: number) => (
                      <tr key={index}>
                        <td style={{ textAlign: "center" }}>{item?.sNo}</td>
                        <td>{item?.roundId || "-"}</td>
                        <td>{item?.betOn || "-"}</td>
                        <td style={{ textAlign: "center" }}>{item?.odds || "-"}</td>
                        <td style={{ textAlign: "right" }}>₹{Number(item?.stake || 0).toFixed(2)}</td>
                        <td style={{ textAlign: "right" }}>
                          <span className={Number(item?.rowPL || 0) >= 0 ? "casino-ledger-page__pl--positive" : "casino-ledger-page__pl--negative"}>
                            {Number(item?.rowPL || 0) >= 0 ? "+" : ""}₹{Number(item?.rowPL || 0).toFixed(2)}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {item?.settledAt ? moment(item?.settledAt).format("HH:mm:ss") : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <BackBtn to="/ledger" name="BACK TO LEDGER" />
    </>
  )
}

export default CasinoLedger
