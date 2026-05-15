import React from "react"
import type { Odd } from "../../../../store/service/odds/odds"
import LiveEventScore from "./LiveEventScore"
import { useParams } from "react-router-dom"

interface Props {
  oddsData: Odd[]
}

const Score = ({ oddsData }: Props) => {
  const { id } = useParams()
  return (
    <table width="100%" border={0} cellSpacing={0} cellPadding={0}>
      <tbody>
        <tr>
          <td colSpan={3} height={35} align="center" className="TeamCombo">
            <p
              className="price-btn"
              style={{
                color: "#FFF",
                background:"#00FFFF",
                fontFamily: "Verdana, Geneva, sans-serif",
                fontSize: 12,
                fontWeight: "bold",
              }}
            >
              <span style={{ textDecoration: "blink" }}>
                {/* DELHI CAPITALS NEED 209 RUNS IN 19.5 OVERS TO WIN */}
                {oddsData?.[0]?.matchName}
              </span>
              &nbsp;{" "}
            </p>
          </td>
        </tr>
        <tr className="ng-star-inserted">
          <LiveEventScore eventId={id || ""} />
        </tr>
      </tbody>
    </table>
  )
}

export default Score
