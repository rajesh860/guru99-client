import type { BetList } from "../../../store/service/userServices/user"

interface Props {
  betList: BetList
}

const SessionBets = ({ betList,notDeclared }: Props) => {
  return (
    <table width="100%" border={0} cellSpacing={2} cellPadding={2}>
      <thead>
        <tr>
          <td
            height={36}
            style={{
              background: "#8fd9a8",
              color: "black",
              textAlign: "center",
              padding: "8px 6px",
            }}
            className="FontTextWhite10px"
          >
            Sr.
          </td>
          <td
            align="center"
            style={{ background: "#8fd9a8", color: "black", padding: "8px 6px" }}
            className="FontTextWhite10px"
          >
            Session
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
            style={{
              background: "#8fd9a8",
              color: "black",
              textAlign: "center",
              padding: "8px 6px",
            }}
            className="FontTextWhite10px"
          >
            Run
          </td>
          <td
            style={{ background: "#8fd9a8", color: "black", textAlign: "center", padding: "8px 6px" }}
            className="FontTextWhite10px"
          >
            Mode
          </td>
          <td
            style={{
              background: "#8fd9a8",
              color: "black",
              textAlign: "center",
              padding: "8px 6px",
            }}
            className="FontTextWhite10px"
          >
            Dec
          </td>
        </tr>
      </thead>
      <tbody>
        {betList?.map((items, id: number) => {
          const rowBg = items?.back ? "#A8D6F0" : "#E5A0A0"

          return (
            <tr className="ng-star-inserted" style={{ background: rowBg }}>
              <td
                style={{
                  textAlign: "center",
                  color: "black",
                  background: rowBg,
                  padding: "8px 6px",
                }}
                className="FontTextBlack10px"
              >
                {id + 1}
              </td>
              <td
                style={{
                  textAlign: "center",
                  textTransform: "uppercase",
                  color: "black",
                  background: rowBg,
                  padding: "8px 6px",
                }}
                className="FontTextBlack10px"
              >
                {items?.nation}
              </td>
              <td
                valign="middle"
                className="FontTextBlack10px"
                style={{
                  textAlign: "center",
                  color: "black",
                  background: rowBg,
                  padding: "8px 6px",
                }}
              >
                {items?.rate}
              </td>
              <td
                valign="middle"
                className="FontTextBlack10px"
                style={{
                  textAlign: "center",
                  color: "black",
                  background: rowBg,
                  padding: "8px 6px",
                }}
              >
                {notDeclared ? items?.netPnl : items?.amount}
              </td>
              <td
                style={{
                  textAlign: "center",
                  color: "black",
                  background: rowBg,
                  padding: "8px 6px",
                }}
                className="FontTextBlack10px"
              >
                {items?.priveValue}
              </td>
              <td
                style={{
                  textAlign: "center",
                  color: "black",
                  background: rowBg,
                  padding: "8px 6px",
                }}
                className="FontTextBlack10px"
              >
                {items?.back ? "YES" : "NO"}
              </td>
              <td
                style={{
                  textAlign: "center",
                  color: "black",
                  background: rowBg,
                  padding: "8px 6px",
                }}
                className="FontTextBlack10px"
              >
                {items?.declared == null ||
                items?.declared === "" ||
                items?.declared === "null"
                  ? "No"
                  : items?.declared}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default SessionBets
