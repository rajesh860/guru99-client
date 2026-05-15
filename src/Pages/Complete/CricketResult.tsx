import { useLocation, useParams } from "react-router-dom"
import { useGetLedgerByBeventIdQuery } from "../../../store/service/userServices/userServices"
import BackBtn from "../../Component/BackBtn/BackBtn"
import moment from "moment"
import CommonLodding from "../../Component/CommonLodding"
import "./cricket-result.scss"

const CricketResult = () => {
  const { id } = useParams()
  const { state } = useLocation()
  const { data: ledgerBetData, isLoading } = useGetLedgerByBeventIdQuery(
    { beventId: id || "0" },
    { skip: !id }
  )

  const matchBets = ledgerBetData?.data?.matchBets || []
  const fancyBets = ledgerBetData?.data?.fancyBets || []
  const summary = ledgerBetData?.data?.summary || { matchPL: 0, fancyPL: 0, totalComm: 0, mobAppCharges: 0, netPL: 0 }
  const wonBy = matchBets[0]?.wonBy || "N/A"

  return (
    <>
      {isLoading && <CommonLodding />}
      <BackBtn to="/complete" name="BACK TO COMPLETE GAMES" />
      <br />
      <div className="cricket-result-bg">
        <div className="cricket-result-page">
          <table width="100%" border={0} cellSpacing={0} cellPadding={0}>
            <tbody>
              <tr>
                <td valign="top">
                  <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
                    <tbody>

                      {/* Match name */}
                      <tr>
                        <td align="left" valign="top">
                          <table width="100%" border={0} cellSpacing={0} cellPadding={0}>
                            <tbody>
                              <tr>
                                <td height={35} align="center" className="TeamCombo">
                                  <p className="cr-match-name-bg">
                                    {ledgerBetData?.data?.matchName}
                                  </p>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>

                      {/* Match Bets */}
                      <tr>
                        <td align="center" valign="top" style={{ paddingTop: 5 }}>
                          <p className="cr-section-header">
                            Match Bet(s) Won By :&nbsp;
                            <span style={{ textTransform: "uppercase" }}>{wonBy}</span>
                          </p>
                          <table width="100%" border={0} cellPadding={2} cellSpacing={2} id="MyBets">
                            <tbody>
                              <tr>
                                <td colSpan={6} align="center" />
                              </tr>
                              <tr>
                                {["Team", "Rate", "Amount", "Mode", "P/L", "Date/Time"].map(h => (
                                  <td key={h} height={25} align="center" valign="middle" className="cr-th FontTextWhite10px">{h}</td>
                                ))}
                              </tr>
                              {matchBets.map((item: any, index: number) => (
                                <tr key={index} className="cr-tr">
                                  <td height={25} align="center" className="FontTextWhite10px">{item?.team}</td>
                                  <td align="right" className="FontTextWhite10px">{item?.rate}</td>
                                  <td align="right" className="FontTextWhite10px">{item?.amount}</td>
                                  <td align="center" className="FontTextWhite10px"><div>{item?.mode}</div></td>
                                  <td align="right" className="FontTextWhite10px" style={{ fontWeight: 400, color: item?.pl >= 0 ? "#4caf50" : "#f44336" }}>
                                    {item?.pl}
                                  </td>
                                  <td align="center" className="FontTextWhite10px">
                                    {moment(item?.date).format("YYYY-MM-DD hh:mm:ss A")}
                                  </td>
                                </tr>
                              ))}
                              <tr className="cr-summary-row">
                                <td height={25} colSpan={6} align="center" className="FontTextWhite10px"
                                  style={{ fontWeight: 400, color: summary.matchPL >= 0 ? "#4caf50" : "#f44336" }}>
                                  You {summary.matchPL >= 0 ? " Win " : " Loss "}{Math.abs(summary.matchPL)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>

                      <tr><td align="center" valign="bottom">&nbsp;</td></tr>

                      {/* Fancy Bets */}
                      <tr>
                        <td align="center" valign="top" style={{ paddingTop: 5 }}>
                          <p className="cr-section-header">Fancy Bet(s)</p>
                          <table width="100%" border={0} cellSpacing={2} cellPadding={2}>
                            <tbody>
                              <tr><td colSpan={5} /></tr>
                              <tr>
                                {["Runner", "Rate", "Runs", "Result", "Amount", "Mode", "P/L", "Date/Time"].map(h => (
                                  <td key={h} height={25} align="center" className="cr-th FontTextWhite10px">{h}</td>
                                ))}
                              </tr>
                              {fancyBets.map((items: any, index: number) => (
                                <tr key={index} className="cr-tr" style={{ fontWeight: 400 }}>
                                  <td className="FontTextWhite10px" style={{ fontWeight: 400, textTransform: "uppercase", width: "30%" }}>{items?.runner}</td>
                                  <td className="FontTextWhite10px" style={{ textAlign: "right" }}>{items?.rate}</td>
                                  <td className="FontTextWhite10px" style={{ textAlign: "right" }}>{items?.runs}</td>
                                  <td className="FontTextWhite10px" style={{ textAlign: "right" }}>{items?.result}</td>
                                  <td className="FontTextWhite10px" style={{ textAlign: "right" }}>{items?.amount}</td>
                                  <td className="FontTextWhite10px" style={{ textAlign: "center" }}>{items?.mode}</td>
                                  <td className="FontTextWhite10px" style={{ textAlign: "right", color: items?.pl >= 0 ? "#4caf50" : "#f44336" }}>{items?.pl}</td>
                                  <td className="FontTextWhite10px" style={{ textAlign: "center" }}>
                                    <span>{moment(items?.date).format("YYYY-MM-DD hh:mm:ss A")}</span>
                                  </td>
                                </tr>
                              ))}
                              <tr className="cr-summary-row">
                                <td height={25} colSpan={8} align="center" className="FontTextWhite10px"
                                  style={{ fontWeight: 400, color: summary.fancyPL >= 0 ? "#4caf50" : "#f44336" }}>
                                  You {summary.fancyPL >= 0 ? " Win " : " Loss "}{Math.abs(summary.fancyPL)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>

                      <tr><td valign="top">&nbsp;</td></tr>

                      {/* Match Session Plus Minus */}
                      <tr>
                        <td valign="top" align="center">
                          <p className="cr-section-header">Match Session Plus Minus</p>
                        </td>
                      </tr>
                      <tr className="cr-summary-row">
                        <td height={25} colSpan={6} align="center" className="FontTextWhite10px"
                          style={{ fontWeight: 400, color: (summary.matchPL + summary.fancyPL) >= 0 ? "#4caf50" : "#f44336" }}>
                          {(summary.matchPL + summary.fancyPL) >= 0 ? "You Win " : "You Loss "}
                          {Math.abs(summary.matchPL + summary.fancyPL)}
                        </td>
                      </tr>

                      <tr><td valign="top">&nbsp;</td></tr>

                      {/* My Commission */}
                      <tr>
                        <td valign="top" align="center">
                          <p className="cr-section-header">My Commission</p>
                        </td>
                      </tr>
                      <tr className="cr-summary-row">
                        <td height={25} colSpan={6} align="center" className="FontTextWhite10px"
                          style={{ color: "#4fc3f7", fontWeight: 400 }}>
                          {summary.totalComm.toFixed(2)}
                        </td>
                      </tr>

                      <tr><td valign="top">&nbsp;</td></tr>

                      {/* Amount After Comm */}
                      <tr>
                        <td valign="top" align="center">
                          <p className="cr-section-header">Amount After Comm.</p>
                        </td>
                      </tr>
                      <tr className="cr-summary-row">
                        <td height={25} colSpan={6} align="center" className="FontTextWhite10px"
                          style={{ fontWeight: 400, color: (summary.matchPL + summary.fancyPL - summary.totalComm) >= 0 ? "#4fc3f7" : "#f44336" }}>
                          You {(summary.matchPL + summary.fancyPL - summary.totalComm) >= 0 ? "Win " : "Loss "}
                          {Math.abs(summary.matchPL + summary.fancyPL - summary.totalComm).toFixed(2)}
                        </td>
                      </tr>

                      <tr><td valign="top">&nbsp;</td></tr>

                      {/* Net Plus Minus */}
                      <tr>
                        <td valign="top" align="center">
                          <p className="cr-section-header">Net Plus Minus</p>
                        </td>
                      </tr>
                      <tr className="cr-summary-row">
                        <td height={25} colSpan={6} align="center" className="FontTextWhite10px"
                          style={{ fontWeight: 400, color: summary.netPL >= 0 ? "#4fc3f7" : "#f44336" }}>
                          You {summary.netPL >= 0 ? "Win " : "Loss "}
                          {Math.abs(summary.netPL).toFixed(2)}
                        </td>
                      </tr>

                      <tr><td valign="top" /></tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <BackBtn to="/complete" name="BACK TO COMPLETE GAMES" />
      </div>
    </>
  )
}

export default CricketResult
