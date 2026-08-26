import React, { useState } from "react"
import type { Fancy2, FancySection } from "../../../../store/service/odds/odds"
import { formatToDecimal, formatLimit } from "../../../utils/helpers"
import OddsButton from "../OddsButton"
import FancyBookModal from "./FancyBookModal"
import { useGetFancyBookDataQuery } from "../../../../store/service/userServices/userServices"
import { useTheme } from "../../../context/ThemeContext"

interface Props {
  fancyData: FancySection[] | Fancy2[]
  groupName?: string
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  marketLimits?: any
}

const Fancy = ({ fancyData, groupName, handleBetData, focusAmountInput, teamPLData, beventId, marketLimits }: Props) => {
  const [selectedFancy, setSelectedFancy] = useState<{ fancyId: string; name: string } | null>(null)
  const { themeName } = useTheme()

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

  // Group-level min/max from the market-limits API (matched by group name)
  const fancyLimits: any = (marketLimits?.data ?? marketLimits)?.fancy || {}
  const norm = (s: any) => String(s || "").toLowerCase().replace(/\s+/g, "")
  const limKey = Object.keys(fancyLimits).find((k) => norm(k) === norm(groupName))
  const groupLimit: any = limKey ? fancyLimits[limKey] : null
  const groupMin = groupLimit?.minBet ?? 0
  const groupMax = groupLimit?.maxBet ?? 0

  const filteredRows = [...(fancyData || [])]
    .filter((fancy) => {
      const name = getFancyValue(fancy, "name")
      if (/\s+\d+\.?$/.test(name?.trim() || '')) {
        const match = name?.trim().match(/\s+(\d+)\.?$/)
        if (match && Number(match[1]) !== 2) return false
      }
      if (/Only\s+\d+-\d+\s+over\s+run/i.test(name)) return false
      return true
    })
    .sort((a, b) => Number(getFancyValue(a, "srno")) - Number(getFancyValue(b, "srno")))

  return (
    <div style={{ marginBottom: "8px", borderRadius: "6px", overflow: "hidden" }}>

      {/* Ribbon header (matches Bookmaker) */}
      <div className="gd-ribbon" style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", marginBottom: "4px", gap: "0", borderRadius: "6px 6px 0 0", alignItems: "center" }}>
        <div className="gd-ribbon__left" style={{ padding: "8px 10px", minWidth: 0, overflow: "hidden" }}>
          <span className="gd-ribbon__icon">📋</span>
          <span className="gd-ribbon__title">{groupName || "Session"}</span>
          <span className="gd-ribbon__info">i</span>
          {(groupMin > 0 || groupMax > 0) && (
            <span className="gd-ribbon__meta" style={{ marginLeft: "6px" }}>MIN:{formatLimit(groupMin)} MAX:{formatLimit(groupMax)}</span>
          )}
        </div>
        <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
          <div style={{ padding: "4px", paddingInline: 0 }}>
            <div style={{ background: "rgb(240 121 143)", color: "#fff", padding: "8px 4px", fontSize: "13px", fontWeight: "bold", textAlign: "center", borderRadius: "4px" }}>NO</div>
          </div>
          <div style={{ padding: "4px", paddingInline: 0 }}>
            <div style={{ background: "rgb(64 135 251)",  color: "#fff", padding: "8px 4px", fontSize: "13px", fontWeight: "bold", textAlign: "center", borderRadius: "4px" }}>YES</div>
          </div>
        </div>
      </div>

      {/* Single flat grid — header + all rows share same columns → perfect alignment */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)" }}>

        {/* ── Data rows (each row = 2 grid cells) ── */}
        {filteredRows.map((fancy, idx) => {
          const name    = getFancyValue(fancy, "name")
          const sid     = getFancyValue(fancy, "sid")
          const mid     = getFancyValue(fancy, "mid")
          const gstatus = getFancyValue(fancy, "gstatus")
          const b1      = getFancyValue(fancy, "b1")
          const bs1     = getFancyValue(fancy, "bs1")
          const l1      = getFancyValue(fancy, "l1")
          const ls1     = getFancyValue(fancy, "ls1")
          const rem     = getFancyValue(fancy, "rem")
          const rowMin  = getFancyValue(fancy, "minBet")
          const rowMax  = getFancyValue(fancy, "maxBet")
          const isSusp  = gstatus === "SUSPENDED" || b1 === 0 || gstatus === "Ball Running"

          const rawFancy   = teamPLData?.data?.fancy
          const fancyArray: any[] = Array.isArray(rawFancy) ? rawFancy : rawFancy && typeof rawFancy === "object" ? [rawFancy] : []
          const matchingPL = fancyArray.find((f: any) => f.fancyId === mid)
          const plVal      = matchingPL?.worstCase

          return (
            <React.Fragment key={mid || idx}>
              {/* Left cell */}
              <div style={{ background: themeName === "light" ? "rgb(238 238 238)" : "var(--bg-panel)", padding: "6px 10px", borderTop: "1px solid rgba(128,128,128,0.2)", borderBottom: "1px solid rgba(128,128,128,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", minWidth: 0, overflow: "hidden" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0, overflow: "hidden" }}>
                  <span style={{ fontWeight: "600", fontSize: "13px", color: "var(--color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
                  {(rowMin > 0 || rowMax > 0) && (
                    <span style={{ fontSize: "10px", color: themeName === "light" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)" }}>Min: {formatLimit(rowMin)} | Max: {formatLimit(rowMax)}</span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  {plVal != null && (
                    <span style={{ fontSize: "12px", fontWeight: "600", color: plVal >= 0 ? "#4CAF50" : "#f44336" }}>
                      {plVal >= 0 ? "+" : ""}{plVal?.toFixed(2)}
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedFancy({ fancyId: mid?.toString() || "", name })}
                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, color: "#72a8ff", fontSize: "16px", lineHeight: 1 }}
                    title="View Book"
                  >🪜</button>
                </div>
              </div>

              {/* Right cell (odds buttons) */}
              <div style={{ display: "flex", gap: "4px", position: "relative" }}>
                {isSusp && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(22,33,62,0.9)", color: "red", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", zIndex: 10, borderRadius: "4px", textTransform: "uppercase" }}>
                    {gstatus}
                  </div>
                )}
                <OddsButton type="lay"  value={isSusp || l1 === 0 ? "0" : l1}  size={isSusp || l1 === 0 ? undefined : formatToDecimal(ls1)}
                  onClick={() => { if (!isSusp && l1 !== 0) { handleBetData(true, false, l1, "Fancy2", sid?.toString(), ls1, mid?.toString(), name, "No",  new Date(), ls1, mid?.toString()); focusAmountInput() } }}
                  disabled={isSusp || l1 === 0} />
                <OddsButton type="back" value={isSusp || b1 === 0 ? "0" : b1}  size={isSusp || b1 === 0 ? undefined : formatToDecimal(bs1)}
                  onClick={() => { if (!isSusp && b1 !== 0) { handleBetData(true, true,  b1, "Fancy2", sid?.toString(), bs1, mid?.toString(), name, "Yes", new Date(), bs1, mid?.toString()); focusAmountInput() } }}
                  disabled={isSusp || b1 === 0} />
              </div>

              {/* Remark — spans full width */}
              {rem && (
                <div style={{ gridColumn: "1 / -1", background: "rgba(255,0,0,0.08)", color: "red", padding: "4px 10px", fontSize: "11px", fontWeight: "500", borderTop: "1px solid rgba(255,0,0,0.2)" }}>
                  {rem}
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

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
