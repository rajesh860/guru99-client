import type { Bookmaker } from "../../../../store/service/odds/odds"
import type { OdssPnl } from "../../../../store/service/userServices/user"
import { formatNumber } from "../FormateNum"

interface Props {
  bookData: Bookmaker[]
  handleBetData: (
    isFancy: boolean,
    isBack: boolean,
    odds: number,
    marketName: string,
    selectionId: string,
    priceValue: number,
    marketId: string,
    name: string,
    mode: string,
    date: any,
  ) => void
  focusAmountInput: () => void
  oddsPnl: OdssPnl[]
}

const formatToDecimal = number => {
  return typeof number === "number" ? Number(number / 100)?.toFixed(2) : number
}

const MatchOdds = ({
  bookData,
  handleBetData,
  focusAmountInput,
  oddsPnl,
}: Props) => {
  const filteredBookData = (bookData || []).filter(Boolean)
  const processedBookData = [...filteredBookData]

  if (processedBookData.length >= 2) {
    // Check if all b1 are the same
    const allB1Same = processedBookData.every(
      item => item.b1 === processedBookData[0].b1,
    )

    if (allB1Same) {
      // ✅ New condition: check if all l1 are also the same
      const allL1Same = processedBookData.every(
        item => item.l1 === processedBookData[0].l1,
      )

      if (!allL1Same) {
        // If same b1 but different l1, keep the one with higher l1
        const maxL1Index = processedBookData.reduce(
          (maxIdx, curr, idx, arr) => (curr.l1 > arr[maxIdx].l1 ? idx : maxIdx),
          0,
        )

        processedBookData.forEach((item, index) => {
          if (index !== maxL1Index) {
            processedBookData[index] = {
              ...item,
              b1: 0,
              l1: 0,
            }
          }
        })
      }
      // else → if both b1 and l1 are same, keep both as is
    } else {
      // Old logic if b1 are different
      const minB1Index = processedBookData.reduce((minIdx, curr, idx, arr) => {
        const currStatus = curr?.gstatus?.toLowerCase()
        const minStatus = arr[minIdx]?.gstatus?.toLowerCase()

        if (currStatus === "suspended") return minIdx
        if (minStatus === "suspended") return idx

        return curr.b1 < arr[minIdx].b1 ? idx : minIdx
      }, 0)

      processedBookData.forEach((item, index) => {
        if (index !== minB1Index) {
          processedBookData[index] = {
            ...item,
            b1: 0,
            l1: 0,
          }
        }
      })
    }
  }

  return (
    <div className="match-odds-container" style={{
      width: "100%"
    }}>
      {/* Header */}
      <div className="match-odds-header" style={{
        display: "grid",
        gridTemplateColumns: "50% 25% 25%",
        gap: "2px"
      }}>
        <div className="header-cell" style={{
          background: "#8fd9a8",
          color: "black",
          textAlign: "center",
          padding: "10px",
          fontSize: "14px",
          fontWeight: "bold",
          height: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <span>TEAM</span>
          <p style={{ fontSize: "x-small", margin: "2px 0 0 0" }}>Max: {formatNumber(bookData?.[0]?.maxBet)}</p>
        </div>
        <div className="header-cell" style={{
          background: "#8fd9a8",
          color: "black",
          textAlign: "center",
          padding: "10px",
          fontSize: "14px",
          fontWeight: "bold",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          LAGAI
        </div>
        <div className="header-cell" style={{
          background: "#8fd9a8",
          color: "black",
          textAlign: "center",
          padding: "10px",
          fontSize: "14px",
          fontWeight: "bold",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          KHAI
        </div>
      </div>

      {/* Match Odds Data Rows */}
      <div className="match-odds-body">
        {processedBookData?.map(data => {
          const oddsData = oddsPnl?.filter(item => item?.marketId === data?.mid)
          const oddsPnlData = oddsData?.[0]
            ? {
                [oddsData?.[0].selection1]: oddsData?.[0].pnl1,
                [oddsData?.[0].selection2]: oddsData?.[0].pnl2,
                [oddsData?.[0].selection3]: oddsData?.[0].pnl3,
              }
            : {}

          return (
            <div key={data?.sid}>
            <div className="match-odds-row" style={{
              display: "grid",
              gridTemplateColumns: "50% 50%",
              gap: "2px",
              marginBottom: "2px"
            }}>
              {/* Team Info */}
              <div className="team-cell" style={{
                background: "#fff",
                padding: "10px",
                textAlign: "center",
                border: "1px solid #ddd",
                minHeight: "35px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                overflow: "hidden"
              }}>
                <span className="teamNameForOdds" style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                  display: "block",
                  color: "black",
                  fontWeight: "bold",
                  fontSize: "0.875rem"
                }}>
                  {data?.nation}
                </span>
                <span
                  style={{
                    color:
                      Number(oddsPnlData[parseInt(data?.sid)] || 0) <= 0
                        ? "rgb(255, 0, 0)"
                        : "rgb(43, 43, 245)",
                    margin: "2px 0 0 0",
                    fontSize: "x-small",
                  }}
                >
                  {Number(oddsPnlData[parseInt(data?.sid)] || 0)}
                </span>
              </div>

              {/* Buttons Container with Overlay */}
              <div className="buttons-container" style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2px"
              }}>
                {/* Suspended Overlay */}
                {data?.gstatus?.toLowerCase() === "suspended" || data?.b1 === 0 || data?.l1 === 0 || Number(data?.b1) > 100 || Number(data?.l1) > 100 ? (
                  <div className="suspended-overlay" style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                   backgroundColor: "rgb(255 255 255 / 65%)",
                    color: "red",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "bold",
                    zIndex: 10,
                    border: "0.5px solid #ddd"
                  }}>
                    SUSPENDED
                  </div>
                ):""}

                {/* LAGAI Button */}
                <div className="bet-cell lagai-cell" style={{
                  background: "#a8d6f0",
                  textAlign: "center",
                  cursor: data?.gstatus?.toLowerCase() === "suspended" || Number(data?.b1) > 100 || Number(data?.l1) > 100 ? "not-allowed" : "pointer",
                  // border: "1px solid #ddd",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "88px"
                }}
                onClick={() => {
                  if (data?.gstatus?.toLowerCase() !== "suspended" && data?.b1 !== 0 && Number(data?.b1) <= 100 && Number(data?.l1) <= 100) {
                    handleBetData(
                      false,
                      true,
                      data?.b1,
                      "Bookmaker",
                      data?.sid,
                      data?.bs1,
                      data?.mid,
                      data?.nation,
                      "LAGAI",
                      new Date(),
                    )
                    focusAmountInput()
                  }
                }}>
                  <button style={{
                    background: "transparent",
                    border: "none",
                    color: "inherit",
                    cursor: "inherit",
                    // fontSize: "12px",
                    fontWeight: "bold",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                    padding: "8px"
                  }}>
                    <span style={{
                      fontSize: "1.25rem",
                      visibility: data?.gstatus?.toLowerCase() === "suspended" || data?.b1 === 0 || Number(data?.b1) > 100 || Number(data?.l1) > 100 ? "hidden" : "visible"
                    }}>{data?.b1}</span>
                  </button>
                </div>

                {/* KHAI Button */}
                <div className="bet-cell khai-cell" style={{
                  color: "#F00",
                  background: "#e5a0a0",
                  textAlign: "center",
                  cursor: data?.gstatus?.toLowerCase() === "suspended" || Number(data?.b1) > 100 || Number(data?.l1) > 100 ? "not-allowed" : "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "88px"
                }}
                onClick={() => {
                  if (data?.gstatus?.toLowerCase() !== "suspended" && Number(data?.b1) <= 100 && Number(data?.l1) <= 100) {
                    handleBetData(
                      false,
                      false,
                      data?.l1,
                      "Bookmaker",
                      data?.sid,
                      data?.ls1,
                      data?.mid,
                      data?.nation,
                      "KHAI",
                      new Date(),
                    )
                    focusAmountInput()
                  }
                }}>
                  <button style={{
                    background: "transparent",
                    border: "none",
                    color: "black",
                    cursor: "inherit",
                    // fontSize: "12px",
                    fontWeight: "bold",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2px",
                    padding: "8px"
                  }}>
                    <span style={{
                      fontSize: "1.25rem",
                      visibility: data?.gstatus?.toLowerCase() === "suspended" || data?.l1 === 0 || Number(data?.b1) > 100 || Number(data?.l1) > 100 ? "hidden" : "visible"
                    }}>{data?.l1}</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Remark Message */}
            {data?.rem && (
              <div
                style={{
                  background: "rgba(255, 0, 0, 0.1)",
                  color: "red",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: "500",
                  borderRadius: "4px",
                  marginBottom: "2px",
                  border: "1px solid rgba(255, 0, 0, 0.3)"
                }}
              >
                {data?.rem}
              </div>
            )}
          </div>
          )
        })}
      </div>
    </div>
  )
}

export default MatchOdds
