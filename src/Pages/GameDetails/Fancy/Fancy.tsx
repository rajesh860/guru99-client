import { useState } from "react"
import type { Fancy2, FancySection } from "../../../../store/service/odds/odds"
import { formatNumber } from "../FormateNum"
import { formatToDecimal } from "../../../utils/helpers"
import OddsButton from "../OddsButton"
import FancyBookModal from "./FancyBookModal"
import { useGetFancyBookDataQuery } from "../../../../store/service/userServices/userServices"

interface Props {
  fancyData: FancySection[] | Fancy2[]
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
    size?: number,
    fancyId?: string
  ) => void
  focusAmountInput: () => void
  teamPLData?: any
  beventId?: string
}

const Fancy = ({ fancyData, handleBetData, focusAmountInput, teamPLData, beventId }: Props) => {
  const [selectedFancy, setSelectedFancy] = useState<{ fancyId: string; name: string } | null>(null)
  
  const { data: fancyBookData, isLoading: isFancyBookLoading } = useGetFancyBookDataQuery(
    { fancyId: selectedFancy?.fancyId || "", beventId: beventId || "" },
    { skip: !selectedFancy?.fancyId || !beventId }
  )

  // Helper function to extract values from both old and new structure
  const getFancyValue = (fancy: any, field: string) => {
    // New structure (FancySection)
    if (fancy.odds) {
      const backOdds = fancy.odds.find((o: any) => o.otype === "back" && o.oname === "back1")
      const layOdds = fancy.odds.find((o: any) => o.otype === "lay" && o.oname === "lay1")
      
      switch(field) {
        case "name": return fancy.nat
        case "sid": return fancy.sid?.toString() || fancy.fancyId
        case "mid": return fancy.fancyId || `${fancy.sid}`
        case "gstatus": return fancy.gstatus
        case "maxBet": return fancy.max
        case "minBet": return fancy.min
        case "b1": return backOdds?.odds || 0  // YES button (back)
        case "bs1": return backOdds?.size || 0
        case "l1": return layOdds?.odds || 0  // NO button (lay)
        case "ls1": return layOdds?.size || 0
        case "srno": return fancy.sno
        case "rem": return fancy.rem
        default: return 0
      }
    }
    
    // Old structure (Fancy2) - fallback
    switch(field) {
      case "name": return fancy.nation
      case "sid": return fancy.sid
      case "mid": return fancy.mid
      case "gstatus": return fancy.gstatus
      case "maxBet": return fancy.maxBet
      case "minBet": return fancy.minBet
      case "b1": return fancy.b1
      case "bs1": return fancy.bs1
      case "l1": return fancy.l1
      case "ls1": return fancy.ls1
      case "srno": return fancy.srno
      case "rem": return fancy.rem
      default: return 0
    }
  }
  
  return (
    <div style={{ background: "var(--color-surface)" }}>
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          marginBottom: "4px",
          gap: "6px",
          background: "#2c3548",
          borderRadius: "6px 6px 0 0",
          padding: "6px 8px",
        }}
      >
        <div
          style={{
            color: "#fff",
            padding: "4px 2px",
            fontSize: "16px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
          }}
        >
          Session
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4px",
          }}
        >

           
          <div
            style={{
              background: "rgb(240 121 143)",
              color: "white",
              padding: "10px",
              fontSize: "14px",
              fontWeight: "bold",
              textAlign: "center",
              borderRadius: "4px",

            }}
          >
            NO
          </div>
          <div
            style={{
              background: "rgb(64 135 251)",
              color: "white",
              padding: "10px",
              fontSize: "14px",
              fontWeight: "bold",
              textAlign: "center",
              borderRadius: "4px",
            }}
          >
            YES
          </div>
        </div>
      </div>

      {/* Fancy Data Rows */}
      {[...(fancyData || [])]
        .filter((fancy) => {
          const name = getFancyValue(fancy, "name")
          // Block items ending with a trailing number, but allow those ending with 2
          if (/\s+\d+\.?$/.test(name?.trim() || '')) {
            const match = name?.trim().match(/\s+(\d+)\.?$/)
            if (match && Number(match[1]) !== 2) return false
          }
          
          // Block items like "Only 16-17 over run DC" (any number-number pattern)
          if (/Only\s+\d+-\d+\s+over\s+run/i.test(name)) return false
          
          return true
        })
        .sort((a, b) => Number(getFancyValue(a, "srno")) - Number(getFancyValue(b, "srno")))?.map((fancy, idx) => {
        const name = getFancyValue(fancy, "name")
        const sid = getFancyValue(fancy, "sid")
        const mid = getFancyValue(fancy, "mid")
        const gstatus = getFancyValue(fancy, "gstatus")
        const maxBet = getFancyValue(fancy, "maxBet")
        const b1 = getFancyValue(fancy, "b1")  // YES odds
        const bs1 = getFancyValue(fancy, "bs1")  // YES size
        const l1 = getFancyValue(fancy, "l1")  // NO odds
        const ls1 = getFancyValue(fancy, "ls1")  // NO size
        const rem = getFancyValue(fancy, "rem")  // Remark/Message
        
        return (
          <div key={mid || idx}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                marginBottom: "2px",
                gap: "6px",
              }}
            >
              {/* Session Info */}
              <div
                style={{
                  background: "var(--bg-panel)",
                  borderRadius: "4px",
                  padding: "4px 12px",
                  color: "var(--color-text)",
                }}
              >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "13px",
                  marginBottom: "4px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{name}</span>
                 
              
                </div>
                {(() => {
                  const rawFancy = teamPLData?.data?.fancy
                  const fancyArray: any[] = Array.isArray(rawFancy)
                    ? rawFancy
                    : rawFancy && typeof rawFancy === "object"
                    ? [rawFancy]
                    : []
                  const matchingFancy = fancyArray.find((f: any) => f.fancyId === mid)
                  if (!matchingFancy) return null
                  const val = matchingFancy.worstCase
                  return (
                    <span style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: val >= 0 ? "#4CAF50" : "#f44336"
                    }}>
                      {val >= 0 ? '+' : ''}{val?.toFixed(2)}
                    </span>
                  )
                })()}
                    {/* Leaderboard Icon */}
                  <button
                    onClick={() => setSelectedFancy({ fancyId: mid?.toString() || "", name })}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                      color: "#72a8ff",
                      transition: "color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#5a8de8"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#72a8ff"}
                    title="View Book"
                  >
                    🪜
                  </button>
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "var(--color-textSecondary)",
                }}
              >
                Max:{formatNumber(maxBet)}
              </div>
            </div>

            {/* Buttons Container */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "4px",
                position: "relative",
              }}
            >
              {/* Suspended Overlay */}
              {(gstatus === "SUSPENDED" || b1 === 0) && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(22, 33, 62, 0.9)",
                    color: "red",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "bold",
                    zIndex: 10,
                    borderRadius: "4px",
                  }}
                >
                  SUSPENDED
                </div>
              )}

              {/* NO Button */}
              <OddsButton
                type="lay"
                value={gstatus === "SUSPENDED" || l1 === 0 ? "0" : l1}
                size={gstatus === "SUSPENDED" || l1 === 0 ? undefined : formatToDecimal(ls1)}
                onClick={() => {
                  if (gstatus !== "SUSPENDED" && l1 !== 0) {
                    handleBetData(
                      true,
                      false,
                      l1,
                      "Fancy2",
                      sid?.toString(),
                      ls1,
                      mid?.toString(),
                      name,
                      "No",
                      new Date(),
                      ls1, // size
                      mid?.toString() // fancyId
                    )
                    focusAmountInput()
                  }
                }}
                disabled={gstatus === "SUSPENDED" || l1 === 0}
              />

              {/* YES Button */}
              <OddsButton
                type="back"
                value={gstatus === "SUSPENDED" || b1 === 0 ? "0" : b1}
                size={gstatus === "SUSPENDED" || b1 === 0 ? undefined : formatToDecimal(bs1)}
                onClick={() => {
                  if (gstatus !== "SUSPENDED" && b1 !== 0) {
                    handleBetData(
                      true,
                      true,
                      b1,
                      "Fancy2",
                      sid?.toString(),
                      bs1,
                      mid?.toString(),
                      name,
                      "Yes",
                      new Date(),
                      bs1, // size
                      mid?.toString() // fancyId
                    )
                    focusAmountInput()
                  }
                }}
                disabled={gstatus === "SUSPENDED" || b1 === 0}
              />
            </div>
          </div>
            
          {/* Remark Message */}
          {rem && (
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
              {rem}
            </div>
          )}
        </div>
        )
      })}

      {/* Fancy Book Modal */}
      <FancyBookModal
        isOpen={!!selectedFancy}
        onClose={() => setSelectedFancy(null)}
        data={fancyBookData?.data || null}
        fancyName={selectedFancy?.name || ""}
        isLoading={isFancyBookLoading}
      />
    </div>
  )
}

export default Fancy
