import { useParams } from "react-router-dom"
import { useGetLedgerByBeventIdQuery } from "../../../store/service/userServices/userServices"
import BackBtn from "../../Component/BackBtn/BackBtn"
import moment from "moment"
import CommonLodding from "../../Component/CommonLodding"
import "./cricket-result.scss"

const CricketResult = () => {
  const { id } = useParams()
  const { data: ledgerBetData, isLoading } = useGetLedgerByBeventIdQuery(
    { beventId: id || "0" },
    { skip: !id }
  )

  const matchBets = ledgerBetData?.data?.matchBets || []
  const fancyBets = ledgerBetData?.data?.fancyBets || []
  const summary = ledgerBetData?.data?.summary || {
    matchPL: 0, fancyPL: 0, tossPL: 0,
    totalComm: 0, mobAppCharges: 0, netPL: 0
  }
  const wonBy = matchBets[0]?.wonBy || ""
  const plClass = (val: number) => (val >= 0 ? "cr-win" : "cr-loss")

  return (
    <>
      {isLoading && <CommonLodding />}
      <BackBtn to="/complete" name="BACK TO COMPLETE GAMES" />

      <div className="cricket-result-bg">
        <div className="cricket-result-page">

          {/* Match Name */}
          <p className="cr-match-name-bg">{ledgerBetData?.data?.matchName}</p>

          {/* Match Bets */}
          <p className="cr-section-header">
            Match Bet(s){wonBy ? ` — Won By: ${wonBy}` : ""}
          </p>
          <div className="cr-table-wrap">
            <table>
              <thead>
                <tr>
                  {["Team", "Rate", "Amount", "Mode", "P/L", "Date/Time"].map(h => (
                    <th key={h} className="cr-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matchBets.map((item: any, i: number) => (
                  <tr key={i} className="cr-tr">
                    <td>{item?.team}</td>
                    <td style={{ textAlign: "right" }}>{item?.rate}</td>
                    <td style={{ textAlign: "right" }}>{item?.amount?.toLocaleString()}</td>
                    <td style={{ textAlign: "center" }}>{item?.mode}</td>
                    <td className={item?.pl >= 0 ? "cr-win" : "cr-loss"} style={{ textAlign: "right" }}>
                      {item?.pl >= 0 ? "+" : ""}{item?.pl}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {moment(item?.date).format("DD/MM/YY hh:mm A")}
                    </td>
                  </tr>
                ))}
                <tr className="cr-summary-row">
                  <td colSpan={6} style={{ textAlign: "center" }}
                    className={summary.matchPL >= 0 ? "cr-win" : "cr-loss"}>
                    You {summary.matchPL >= 0 ? "Win" : "Loss"} {Math.abs(summary.matchPL)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ height: 12 }} />

          {/* Fancy Bets */}
          <p className="cr-section-header">Fancy Bet(s)</p>
          <div className="cr-table-wrap">
            <table>
              <thead>
                <tr>
                  {["Runner", "Rate", "Runs", "Result", "Amount", "Mode", "P/L", "Date/Time"].map(h => (
                    <th key={h} className="cr-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fancyBets.map((item: any, i: number) => (
                  <tr key={i} className="cr-tr">
                    <td style={{ textTransform: "capitalize", minWidth: 110 }}>{item?.runner}</td>
                    <td style={{ textAlign: "right" }}>{item?.rate}</td>
                    <td style={{ textAlign: "right" }}>{item?.runs}</td>
                    <td style={{ textAlign: "right" }}>{item?.result}</td>
                    <td style={{ textAlign: "right" }}>{item?.amount?.toLocaleString()}</td>
                    <td style={{ textAlign: "center" }}>{item?.mode}</td>
                    <td className={item?.pl >= 0 ? "cr-win" : "cr-loss"} style={{ textAlign: "right" }}>
                      {item?.pl >= 0 ? "+" : ""}{item?.pl}
                    </td>
                    <td style={{ textAlign: "center", minWidth: 100 }}>
                      {moment(item?.date).format("DD/MM/YY hh:mm A")}
                    </td>
                  </tr>
                ))}
                <tr className="cr-summary-row">
                  <td colSpan={8} style={{ textAlign: "center" }}
                    className={summary.fancyPL >= 0 ? "cr-win" : "cr-loss"}>
                    You {summary.fancyPL >= 0 ? "Win" : "Loss"} {Math.abs(summary.fancyPL)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ height: 12 }} />

          {/* Summary */}
          <p className="cr-section-header">Summary</p>
          <div className="cr-summary-card">
            {[
          { label: 'Toss Amount',     value: summary.tossPL,                                   cls: plClass(summary.tossPL ?? 0) },
          { label: 'Match Amount',    value: summary.matchPL,                                  cls: plClass(summary.matchPL ?? 0) },
          { label: 'Session Amount',  value: summary.fancyPL,                                  cls: plClass(summary.fancyPL ?? 0) },
                   { label: 'Match + Session', value: summary.matchPlussMinus,                            cls: plClass(summary.matchPlussMinus ?? 0) },

          { label: 'My Commission',   value: summary.totalComm,                                cls: 'cr-info' },
          // { label: 'Mob App Charges', value: summary.mobAppCharges,                            cls: 'cr-loss' },
          { label: 'Net P/L',         value: summary.netPL,                                    cls: plClass(summary.netPL), bold: true },
        ].map(({ label, value, cls, bold }) => (
              <div key={label} className="cr-summary-row">
                <span className="cr-summary-label">{label}</span>
                <span className={`cr-summary-value ${cls}`} style={{ fontWeight: bold ? 700 : 500 }}>
                  {value >= 0 ? "+" : ""}{Number(value).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div style={{ height: 16 }} />
          <BackBtn to="/complete" name="BACK TO COMPLETE GAMES" />
        </div>
      </div>
    </>
  )
}

export default CricketResult
