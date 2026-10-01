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

  const isMatka = ledgerBetData?.marketType === "matka"

  // ── Casino round data (roulette, and any other game using the same
  // per-round ledger shape: `data` is an array of round-bet objects) ──
  const isCasinoRounds = !isMatka && Array.isArray(ledgerBetData?.data)
  const casinoBets: any[] = isCasinoRounds ? ledgerBetData.data : []
  const casinoMatchName   = ledgerBetData?.matchName ?? ""
  const casinoSummary     = ledgerBetData?.summary ?? { totalBets: 0, totalWon: 0, totalLost: 0, netPL: 0 }

  // ── Matka data ──────────────────────────────────────────
  const matkaBets: any[]  = ledgerBetData?.matka ?? []
  const matkaSummary      = ledgerBetData?.summary ?? { totalBets: 0, netPL: 0, won: 0, lost: 0 }
  const matkaMatchName    = ledgerBetData?.matchName ?? ""

  // ── Cricket data ─────────────────────────────────────────
  const matchBets = ledgerBetData?.data?.matchBets || []
  const fancyBets = ledgerBetData?.data?.fancyBets || []
  const tossBets  = ledgerBetData?.data?.tossBets  || []
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

          {/* ══════════════ MATKA RESULT ══════════════ */}
          {isMatka ? (
            <>
              <p className="cr-match-name-bg">{matkaMatchName}</p>

              <p className="cr-section-header">Matka Bet(s)</p>
              <div className="cr-table-wrap">
                <table>
                  <thead>
                    <tr>
                      {["Label", "Bet Type", "Rate", "Amount", "P/L", "Comm", "Status", "Date/Time"].map(h => (
                        <th key={h} className="cr-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matkaBets.length > 0 ? matkaBets.map((item: any, i: number) => (
                      <tr key={i} className="cr-tr">
                        <td style={{ minWidth: 120 }}>{item?.label}</td>
                        <td style={{ textTransform: "capitalize", whiteSpace: "nowrap" }}>
                          {item?.betType?.replace(/_/g, " ")}
                        </td>
                        <td style={{ textAlign: "right" }}>{item?.rate}</td>
                        <td style={{ textAlign: "right" }}>{item?.amount?.toLocaleString()}</td>
                        <td className={item?.pl >= 0 ? "cr-win" : "cr-loss"} style={{ textAlign: "right" }}>
                          {item?.pl >= 0 ? "+" : ""}{item?.pl}
                        </td>
                        <td style={{ textAlign: "right", color: "#4fc3f7" }}>
                          {item?.commission ?? 0}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={item?.status === "won" ? "cr-win" : "cr-loss"}>
                            {item?.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "center", minWidth: 110 }}>
                          {moment(item?.date).format("DD/MM/YY hh:mm A")}
                        </td>
                      </tr>
                    )) : (
                      <tr className="cr-tr">
                        <td colSpan={8} style={{ textAlign: "center", padding: "12px" }}>No bets found</td>
                      </tr>
                    )}
                    <tr className="cr-summary-row">
                      <td colSpan={8} style={{ textAlign: "center" }}
                        className={(matkaSummary.totalNetPL ?? matkaSummary.netPL) >= 0 ? "cr-win" : "cr-loss"}>
                        Total Amount: {(matkaSummary.totalNetPL ?? matkaSummary.netPL) >= 0 ? "+" : ""}{matkaSummary.totalNetPL ?? matkaSummary.netPL}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ height: 12 }} />

              {/* Matka Summary */}
              <p className="cr-section-header">Summary</p>
              <div className="cr-summary-card">
                {[
                  { label: "Total Bets",  value: matkaSummary.totalBets,                                          cls: "cr-info",                                                        plain: true },
                  { label: "Won",         value: matkaSummary.totalWon    ?? matkaSummary.won,                     cls: "cr-win",                                                         plain: true },
                  { label: "Lost",        value: matkaSummary.totalLost   ?? matkaSummary.lost,                    cls: "cr-loss",                                                        plain: true },
                  { label: "Commission",  value: matkaSummary.totalCommission ?? matkaSummary.totalComm,           cls: "cr-info",                                                        plain: true },
                  { label: "Net P/L",      value: matkaSummary.netPL,                                              cls: plClass(matkaSummary.netPL ?? 0),                                 bold: true },
                ].map(({ label, value, cls, bold, plain }) => (
                  <div key={label} className="cr-summary-row">
                    <span className="cr-summary-label">{label}</span>
                    <span className={`cr-summary-value ${cls}`} style={{ fontWeight: bold ? 700 : 500 }}>
                      {plain ? value : `${Number(value) >= 0 ? "+" : ""}${Number(value).toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : isCasinoRounds ? (

          /* ══════════════ CASINO RESULT (roulette, etc.) ══════════════ */
            <>
              <p className="cr-match-name-bg">{casinoMatchName}</p>

              <p className="cr-section-header">Bet(s)</p>
              <div className="cr-table-wrap">
                <table>
                  <thead>
                    <tr>
                      {["Round ID", "Bet On", "Bet Type", "Odds", "Stake", "Result", "P/L", "Status", "Date/Time"].map(h => (
                        <th key={h} className="cr-th">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {casinoBets.length > 0 ? casinoBets.map((item: any, i: number) => (
                      <tr key={item?.roundId || i} className="cr-tr">
                        <td style={{ minWidth: 140 }}>{item?.roundId}</td>
                        <td style={{ textAlign: "center" }}>{item?.betOn}</td>
                        <td style={{ textTransform: "capitalize", whiteSpace: "nowrap" }}>
                          {item?.betType?.replace(/_/g, " ")}
                        </td>
                        <td style={{ textAlign: "right" }}>{item?.odds}</td>
                        <td style={{ textAlign: "right" }}>{item?.stake?.toLocaleString?.() ?? item?.stake}</td>
                        <td style={{ textAlign: "center" }}>{item?.result}</td>
                        <td className={item?.pl >= 0 ? "cr-win" : "cr-loss"} style={{ textAlign: "right" }}>
                          {item?.pl >= 0 ? "+" : ""}{item?.pl}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={item?.status === "won" ? "cr-win" : "cr-loss"}>
                            {item?.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "center", minWidth: 110 }}>
                          {moment(item?.date).format("DD/MM/YY hh:mm A")}
                        </td>
                      </tr>
                    )) : (
                      <tr className="cr-tr">
                        <td colSpan={9} style={{ textAlign: "center", padding: "12px" }}>No bets found</td>
                      </tr>
                    )}
                    <tr className="cr-summary-row">
                      <td colSpan={9} style={{ textAlign: "center" }} className={plClass(casinoSummary.netPL ?? 0)}>
                        You {(casinoSummary.netPL ?? 0) >= 0 ? "Win" : "Loss"} {Math.abs(casinoSummary.netPL ?? 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ height: 12 }} />

              <p className="cr-section-header">Summary</p>
              <div className="cr-summary-card">
                {[
                  { label: "Total Bets", value: casinoSummary.totalBets, cls: "cr-info", plain: true },
                  { label: "Won",        value: casinoSummary.totalWon,  cls: "cr-win",  plain: true },
                  { label: "Lost",       value: casinoSummary.totalLost, cls: "cr-loss", plain: true },
                  { label: "Net P/L",    value: casinoSummary.netPL,     cls: plClass(casinoSummary.netPL ?? 0), bold: true },
                ].map(({ label, value, cls, bold, plain }) => (
                  <div key={label} className="cr-summary-row">
                    <span className="cr-summary-label">{label}</span>
                    <span className={`cr-summary-value ${cls}`} style={{ fontWeight: bold ? 700 : 500 }}>
                      {plain ? value : `${Number(value) >= 0 ? "+" : ""}${Number(value).toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (

          /* ══════════════ CRICKET RESULT ══════════════ */
            <>
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
                        className={(summary.matchAmt ?? summary.matchPL) >= 0 ? "cr-win" : "cr-loss"}>
                        You {(summary.matchAmt ?? summary.matchPL) >= 0 ? "Win" : "Loss"} {Math.abs(summary.matchAmt ?? summary.matchPL)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ height: 12 }} />

              {/* Toss Bets */}
              {tossBets.length > 0 && (
                <>
                  <p className="cr-section-header">Toss Bet(s)</p>
                  <div className="cr-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          {["Selection", "Rate", "Amount", "Mode", "P/L", "Date/Time"].map(h => (
                            <th key={h} className="cr-th">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tossBets.map((item: any, i: number) => (
                          <tr key={i} className="cr-tr">
                            <td style={{ minWidth: 130 }}>{item?.selection}</td>
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
                            className={(summary.tossAmt ?? summary.tossPL) >= 0 ? "cr-win" : "cr-loss"}>
                            You {(summary.tossAmt ?? summary.tossPL) >= 0 ? "Win" : "Loss"} {Math.abs(summary.tossAmt ?? summary.tossPL)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div style={{ height: 12 }} />
                </>
              )}

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
                        className={(summary.fancyAmt ?? summary.fancyPL) >= 0 ? "cr-win" : "cr-loss"}>
                        You {(summary.fancyAmt ?? summary.fancyPL) >= 0 ? "Win" : "Loss"} {Math.abs(summary.fancyAmt ?? summary.fancyPL)}
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
                  { label: 'Toss Amount',     value: summary.tossAmt  ?? summary.tossPL,           cls: plClass(summary.tossAmt  ?? summary.tossPL  ?? 0) },
                  { label: 'Match Amount',    value: summary.matchAmt ?? summary.matchPL,          cls: plClass(summary.matchAmt ?? summary.matchPL ?? 0) },
                  { label: 'Session Amount',  value: summary.fancyAmt ?? summary.fancyPL,          cls: plClass(summary.fancyAmt ?? summary.fancyPL ?? 0) },
                  { label: 'Match + Session', value: summary.matchPlussMinus,                       cls: plClass(summary.matchPlussMinus ?? 0) },
                  { label: 'My Commission',   value: summary.totalComm,        cls: 'cr-info' },
                  { label: 'Net P/L',         value: summary.netPL,            cls: plClass(summary.netPL), bold: true },
                ].map(({ label, value, cls, bold }) => (
                  <div key={label} className="cr-summary-row">
                    <span className="cr-summary-label">{label}</span>
                    <span className={`cr-summary-value ${cls}`} style={{ fontWeight: bold ? 700 : 500 }}>
                      {value >= 0 ? "+" : ""}{Number(value).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ height: 16 }} />
          <BackBtn to="/complete" name="BACK TO COMPLETE GAMES" />
        </div>
      </div>
    </>
  )
}

export default CricketResult
