import React from "react"
import type { BetList } from "../../../store/service/userServices/user"
import { formatToDecimal } from "../../utils/helpers"

interface Props {
  betList: BetList
}

const MatchBet = ({ betList }: Props) => {

  return (
    <table width="100%" border={0} cellSpacing={2} cellPadding={0}>
      <tbody>
        <tr>
          <td>
            <table
              width="100%"
              border={0}
              cellPadding={2}
              cellSpacing={2}
              id="MyBets"
            >
              <tbody>
                <tr>
                  <td
                    height={36}
                    valign="middle"
                    style={{
                      background: "#8fd9a8",
                      color: "black",
                      textAlign: "center",
                      padding: "8px 6px",
                    }}
                    className="FontTextWhite10px"
                  >
                    {" "}
                    Sr.{" "}
                  </td>
                  <td
                    valign="middle"
                    style={{
                      background: "#8fd9a8",
                      color: "black",
                      textAlign: "center",
                      padding: "8px 6px",
                    }}
                    className="FontTextWhite10px"
                  >
                    {" "}
                    Rate
                  </td>
                  <td
                    valign="middle"
                    style={{
                      background: "#8fd9a8",
                      color: "black",
                      textAlign: "center",
                      padding: "8px 6px",
                    }}
                    className="FontTextWhite10px"
                  >
                    Amount
                  </td>
                  <td
                    valign="middle"
                    style={{
                      background: "#8fd9a8",
                      color: "black",
                      textAlign: "center",
                      padding: "8px 6px",
                    }}
                    className="FontTextWhite10px"
                  >
                    {" "}
                    Mode
                  </td>
                  <td
                    valign="middle"
                    className="FontTextWhite10px"
                    style={{
                      background: "#8fd9a8",
                      color: "black",
                      textAlign: "center",
                      padding: "8px 6px",
                    }}
                  >
                    Team
                  </td>
                </tr>
                {betList?.Bookmaker?.map((items, id: number) => {
                  const rowBg = items?.back ? "#A8D6F0" : "#E5A0A0"

                  return (
                    <tr className="ng-star-inserted" style={{ background: rowBg }}>
                      <td
                        style={{
                          background: rowBg,
                          textAlign: "center",
                          color: "black",
                          padding: "8px 6px",
                        }}
                        className="FontTextBlack10px"
                      >
                        {id + 1}
                      </td>
                      <td
                        style={{
                          background: rowBg,
                          textAlign: "center",
                          color: "black",
                          padding: "8px 6px",
                        }}
                        className="FontTextBlack10px"
                      >
                        {items?.priveValue}
                      </td>
                      <td
                        style={{
                          background: rowBg,
                          textAlign: "center",
                          color: "black",
                          padding: "8px 6px",
                        }}
                        className="FontTextBlack10px"
                      >
                        {items?.amount}
                      </td>
                      <td
                        className="FontTextBlack10px"
                        style={{
                          background: rowBg,
                          textAlign: "center",
                          color: "black",
                          padding: "8px 6px",
                        }}
                      >
                        {items?.back ? "Lagai" : "Khai"}
                      </td>
                      <td
                        style={{
                          background: rowBg,
                          textAlign: "center",
                          textTransform: "uppercase",
                          color: "black",
                          padding: "8px 6px",
                        }}
                        className="FontTextBlack10px"
                      >
                        {items?.nation}
                      </td>
                    </tr>
                  )
                })}

                {/**/}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default MatchBet
