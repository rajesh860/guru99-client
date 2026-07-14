/* eslint-disable @typescript-eslint/no-restricted-imports */
import { useParams, useSearchParams } from "react-router-dom"
import { useGetTeamPLQuery } from "../../../store/service/userServices/userServices"
import { useMarketLimitsQuery } from "../../../store/service/odds/oddsServices"
import Betslip from "./Betslip"
import Fancy from "./Fancy/Fancy"
import MatchOdds from "./MatchOdds/MatchOdds"
import "./style.scss"
import { FaTv } from "react-icons/fa";

import Score from "./TvScore/Score"
import TvScore from "./TvScore/TvScore"
import MatchBet from "./MatchBet"
import SessionBets from "./SessionBets"
import MyBetsTable from "./MyBetsTable/MyBetsTable"
import CompletedBetsTable from "./CompletedBetsTable/CompletedBetsTable"
import { useEffect, useRef, useState } from "react"
import moment from "moment"
import snackbarUtil from "../../utils/Snackbar"
import { MdTv } from "react-icons/md"
// Removed useGetUserCoinMutation import
import BackBtn from "../../Component/BackBtn/BackBtn"
import CommonLodding from "../../Component/CommonLodding"
import { useDispatch } from "react-redux"
import {
  setSessionPlusMinus,
  setUsedCoin,
} from "../../../store/userSlice/userSlice"
import { j } from "vitest/dist/reporters-w_64AS5f.js"
import OddsButton from "./OddsButton"
import CricketScoreCard from "../../Component/CricketScoreCard"
import { useGetLiveCricketScoreQuery, useGetBallFeedsQuery } from "../../../store/service/cricketScore/cricketScoreService"

const GameDeatils = () => {
  const [placeBetData, setPlaceBetData] = useState<any>(null)
  const { id,bid } = useParams()
  const [timer, setTimer] = useState<number>(null)
  console.log(bid,"hvjkn")
  // WebSocket state
  const [oddsData, setOddsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [socketConnected, setSocketConnected] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)
  const isComponentMounted = useRef(true)
  const openedOddsRef = useRef<{ odds: number; teamSid?: string; fancyId?: string; backOrLay: string; betType: string } | null>(null)
  
  // Scorecard and TV state
  const [scorecardState, setScorecardState] = useState<'hidden' | 'compact' | 'expanded'>('compact') // Default compact (open)
  const [showTV, setShowTV] = useState(false) // Default closed
  
  // Team P&L API call
  const { data: teamPLData } = useGetTeamPLQuery(
    { beventId: id || "" },
    { skip: !id, pollingInterval: 2000 }
  )

  // Per-match market limits (min/max) — 5s polling
  const { data: marketLimitsData } = useMarketLimitsQuery(id || "", {
    skip: !id,
    pollingInterval: 5000,
  })

  // Live cricket score API
  const { data: liveScoreResponse } = useGetLiveCricketScoreQuery(id || "", {
    skip: !id,
    pollingInterval: 1000,
  })

  // Extract matchKey from live score response (from v1 mfkey or direct matchKey field)
  const _scoreBase: any = liveScoreResponse?.data ?? liveScoreResponse
  const _matchKey: string =
    _scoreBase?.matchKey ||
    _scoreBase?.v1?.[0]?.mfkey ||
    _scoreBase?.liveData?.matchKey ||
    id ||
    ''

  // Ball-by-ball feeds from external cricket API
  const { data: ballFeedsData } = useGetBallFeedsQuery(
    { matchKey: _matchKey },
    { skip: !_matchKey, pollingInterval: 2000 }
  )

  // Merge ball feeds as v1 into score data
  const enrichedScoreData: any = _scoreBase
    ? { ..._scoreBase, v1: ballFeedsData?.length ? ballFeedsData : (_scoreBase?.v1 || []) }
    : null

  const finalScoreData: any = enrichedScoreData ?? null

const amountInputRef = useRef<HTMLInputElement>(null)

  const focusAmountInput = () => {
    if (amountInputRef.current) {
      amountInputRef.current.focus()
    }
  }

  const handleBetData = (
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
  ) => {
    if (!id) return
    
    if (odds === 0) {
      snackbarUtil.error("Rate must be grater than zero")
      return
    }

    const deviceInfo = JSON.stringify({
      userAgent: navigator.userAgent,
      browser: "Chrome",
      device: navigator.platform,
      deviceType: "desktop",
      os: navigator.platform,
      os_version: "unknown",
      browser_version: "unknown",
      orientation: window.innerWidth > window.innerHeight ? "landscape" : "portrait",
    })

    let betPayload: any

    if (isFancy && marketName === "Toss") {
      // Toss bet payload
      betPayload = {
        betType: "toss",
        beventId: oddsData?.beventId || id,
        marketId: Number(marketId),
        sid: Number(selectionId),
        selection: name,
        team: name,
        backOrLay: isBack ? "back" : "lay",
        odds: odds,
        stake: 0,
        matchName: oddsData?.ename || "",
      }
    } else if (isFancy) {
      // Fancy bet payload
      betPayload = {
        betType: "fancy",
        matchId: id,
        marketId: marketId,
        beventId: oddsData?.beventId || id,
        backOrLay: isBack ? "yes" : "no",
        fancyName: name,
        fancyId: fancyId || marketId,
        runs: odds,
        odds: odds,
        stake: 0, // Will be set in betslip
        size: size || 0,
        ipAddress: "",
        deviceInfo
      }
    } else {
      // Bookmaker bet payload
      // Get team A and team B sids from sections
      const bookmakerSections = oddsData?.bookmaker?.find((m: any) => m.mname === "Bookmaker")?.section || []
      const teamASid = bookmakerSections[0]?.sid || ""
      const teamBSid = bookmakerSections[1]?.sid || ""

      betPayload = {
        betType: "bookmaker",
        matchId: id,
        marketId: marketId,
        beventId: oddsData?.beventId || id,
        backOrLay: isBack ? "back" : "lay",
        team: name,
        teamASid: teamASid.toString(),
        teamBSid: teamBSid.toString(),
        teamSid: selectionId,
        odds: odds,
        stake: 0, // Will be set in betslip
        ipAddress: "",
        deviceInfo
      }
    }
    
    openedOddsRef.current = {
      odds: odds,
      teamSid: isFancy ? undefined : selectionId,
      fancyId: isFancy ? (fancyId || marketId) : undefined,
      backOrLay: isFancy ? (isBack ? "yes" : "no") : (isBack ? "back" : "lay"),
      betType: isFancy ? "fancy" : "bookmaker",
    }
    setPlaceBetData(betPayload)
    setTimer(8)
  }

  const dispatch = useDispatch()

  // WebSocket Connection
  useEffect(() => {
    isComponentMounted.current = true
    
    const connectWebSocket = () => {
      if (!isComponentMounted.current || !id) return

      const wsUrl = `${import.meta.env.VITE_WS_BASE_URL}/ws/odds?beventId=${id}`
      
      const ws = new WebSocket(wsUrl)
      
      if (isComponentMounted.current) {
        socketRef.current = ws
      }
      
      ws.onopen = () => {
        if (isComponentMounted.current) {
          setSocketConnected(true)
          
          // Subscribe with beventId
          ws.send(JSON.stringify({
            type: 'subscribe',
            beventId: id
          }))
        }
      }
      
      ws.onmessage = (event) => {
        if (!isComponentMounted.current) return
        
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'oddsData') {
            // Turn off loading once we receive data
            setIsLoading(false)
            
            if (data.data) {
              // Set the complete data object
              setOddsData({
                ...data.data,
                ename: data.ename,
                beventId: data.beventId
              })
            }
          }
        } catch (error) {
          console.error('WebSocket message error:', error)
        }
      }
      
      ws.onerror = (error) => {
        if (isComponentMounted.current) {
          setSocketConnected(false)
          console.error('WebSocket error:', error)
        }
      }
      
      ws.onclose = (event) => {
        if (isComponentMounted.current) {
          setSocketConnected(false)
        }
        
        // Auto-reconnect if not manually closed
        if (isComponentMounted.current && event.code !== 1000) {
          setTimeout(() => {
            if (isComponentMounted.current && id) {
              connectWebSocket()
            }
          }, 3000)
        }
      }
    }
    
    connectWebSocket()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isComponentMounted.current) {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
          setOddsData(null)
          setIsLoading(true)
          connectWebSocket()
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isComponentMounted.current = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
    }
  }, [id])

  const checkOddsValid = (): { valid: boolean; message: string } => {
    if (!openedOddsRef.current) return { valid: true, message: "" }
    const ref = openedOddsRef.current
    let currentOdds: number | null = null
    let isSuspended = false

    if (ref.betType === "bookmaker") {
      const sections = oddsData?.bookmaker?.find((m: any) => m.mname === "Bookmaker")?.section || []
      const section = sections.find((s: any) => s.sid?.toString() === ref.teamSid?.toString())
      if (section) {
        const isBack = ref.backOrLay === "back"
        currentOdds = section.odds?.find((o: any) =>
          o.otype === (isBack ? "back" : "lay") && o.oname === (isBack ? "back1" : "lay1")
        )?.odds ?? null
        isSuspended = section.gstatus?.toUpperCase() === "SUSPENDED" || currentOdds === 0 || Number(currentOdds) > 100
      }
    } else if (ref.betType === "fancy") {
      const allFancy = (oddsData?.fancy || []).flatMap((f: any) => f.section || [])
      const fancyItem = allFancy.find((f: any) => f.fancyId?.toString() === ref.fancyId?.toString())
      if (fancyItem) {
        const isBack = ref.backOrLay === "yes"
        currentOdds = fancyItem.odds?.find((o: any) =>
          o.otype === (isBack ? "back" : "lay") && o.oname === (isBack ? "back1" : "lay1")
        )?.odds ?? null
        isSuspended = fancyItem.gstatus?.toUpperCase() === "SUSPENDED" || currentOdds === 0
      } else if (oddsData?.toss?.runners) {
        const toss = oddsData.toss
        const runner = toss.runners?.find((r: any) =>
          `${toss.marketId}_${r.sid}` === ref.fancyId?.toString()
        )
        if (runner) {
          currentOdds = runner.odds ?? null
          isSuspended = runner.gstatus?.toUpperCase() === "SUSPENDED" || runner.odds === 0 || toss.status !== "OPEN" || toss.betLock
        }
      }
    }

    if (isSuspended) return { valid: false, message: "Market suspended! Bet cancelled." }
    if (currentOdds !== null && currentOdds !== ref.odds) return { valid: false, message: "Odds rate changed! Please place bet again." }
    return { valid: true, message: "" }
  }

  const handleOddsInvalid = () => {
    openedOddsRef.current = null
    setPlaceBetData(null)
    setTimer(null)
  }

  // Close bet slip automatically if odds change or market suspends while modal is open
  useEffect(() => {
    if (!openedOddsRef.current || !placeBetData) return
    const result = checkOddsValid()
    if (!result.valid) {
      openedOddsRef.current = null
      setPlaceBetData(null)
      setTimer(null)
      snackbarUtil.warning(result.message)
    }
  }, [oddsData, placeBetData])


  // Extract bookmaker data from new API structure
  const bookmakerMarkets = oddsData?.bookmaker || []
  const mainBookmaker = bookmakerMarkets.find(m => m.mname === "Bookmaker")
  const bookmakerSections = mainBookmaker?.section || []
  
  // Extract team data from sections with odds
  const team1Section = bookmakerSections[0]
  const team2Section = bookmakerSections[1]
  const drawSection = bookmakerSections[2] || null
  
  // Get P/L for teams based on sid matching
  const getTeamPL = (sid: number, name?: string) => {
    const teams: any[] = teamPLData?.data?.bookmaker?.teams || []
    if (!teams.length) return null
    if (sid) {
      const bySid = teams.find((t: any) => t?.sid && t.sid === sid.toString())
      if (bySid) return bySid
    }
    if (name) {
      return teams.find((t: any) => t?.name?.toLowerCase() === name.toLowerCase()) || null
    }
    return null
  }

  // Get P/L for toss runners by sid
  const getTossPL = (sid: number) => {
    const runners = teamPLData?.data?.toss?.runners
    if (!runners) return null
    return runners.find((r: any) => r.sid === sid) || null
  }
  
  // Map to old structure for compatibility
  const team1 = team1Section ? {
    nation: team1Section.nat,
    sid: team1Section.sid,
    gstatus: team1Section.gstatus,
    mid: mainBookmaker?.mid,
    matchName: oddsData?.ename || "Match",
    b1: team1Section.odds?.find(o => o.otype === "back" && o.oname === "back1")?.odds || 0,
    bs1: team1Section.odds?.find(o => o.otype === "back" && o.oname === "back1")?.size || 0,
    l1: team1Section.odds?.find(o => o.otype === "lay" && o.oname === "lay1")?.odds || 0,
    ls1: team1Section.odds?.find(o => o.otype === "lay" && o.oname === "lay1")?.size || 0,
    rem: team1Section.rem || "",
    pl: getTeamPL(team1Section.sid, team1Section.nat),
  } : null
  
  const team2 = team2Section ? {
    nation: team2Section.nat,
    sid: team2Section.sid,
    gstatus: team2Section.gstatus,
    mid: mainBookmaker?.mid,
    matchName: oddsData?.ename || "Match",
    b1: team2Section.odds?.find(o => o.otype === "back" && o.oname === "back1")?.odds || 0,
    bs1: team2Section.odds?.find(o => o.otype === "back" && o.oname === "back1")?.size || 0,
    l1: team2Section.odds?.find(o => o.otype === "lay" && o.oname === "lay1")?.odds || 0,
    ls1: team2Section.odds?.find(o => o.otype === "lay" && o.oname === "lay1")?.size || 0,
    rem: team2Section.rem || "",
    pl: getTeamPL(team2Section.sid, team2Section.nat),
  } : null
  
  const draw = drawSection ? {
    nation: drawSection.nat,
    sid: drawSection.sid,
    gstatus: drawSection.gstatus,
    mid: mainBookmaker?.mid,
    matchName: oddsData?.ename || "Match",
    b1: drawSection.odds?.find((o: any) => o.otype === "back" && o.oname === "back1")?.odds || 0,
    bs1: drawSection.odds?.find((o: any) => o.otype === "back" && o.oname === "back1")?.size || 0,
    l1: drawSection.odds?.find((o: any) => o.otype === "lay" && o.oname === "lay1")?.odds || 0,
    ls1: drawSection.odds?.find((o: any) => o.otype === "lay" && o.oname === "lay1")?.size || 0,
    rem: drawSection.rem || "",
    pl: getTeamPL(drawSection.sid, drawSection.nat),
  } : null

  const maxBet = mainBookmaker?.maxBet || mainBookmaker?.max || 100000
  // Bookmaker min/max from the market-limits API (replaces socket-derived values)
  const bmLimit: any = (marketLimitsData?.data ?? marketLimitsData)?.bookmaker
  const liveData = oddsData?.liveData
  const isBall = liveData?.B === "B"

  return (
    <div className="game-details-page">
      {isLoading && <CommonLodding />}
      
      {/* WebSocket Status Indicator */}
      {/* <div style={{
        background: socketConnected ? "#4CAF50" : "#f44336",
        color: "white",
        padding: "4px 8px",
        fontSize: "12px",
        textAlign: "center",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px"
      }}>
        {socketConnected ? (
          <>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "white",
              display: "inline-block",
              animation: "pulse 1.5s ease-in-out infinite",
              boxShadow: "0 0 8px rgba(255, 255, 255, 0.8)"
            }}></span>
            <span>Live Connected</span>
          </>
        ) : (
          <>
            <span>🔴</span>
            <span>Disconnected</span>
          </>
        )}
      </div> */}
      
      {/* <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
            boxShadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
            boxShadow: 0 0 0 6px rgba(255, 255, 255, 0);
          }
        }
      `}</style> */}
      
      {/* Match Header */}
      <div style={{
        background: "rgb(37, 37, 37)",
        padding: "8px",
        color: "#ffffff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ fontSize: "14px", fontWeight: "bold" }}>
          {team1?.matchName || ""}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setShowTV(!showTV)}
            style={{
              background: showTV ? "rgba(255,255,255,0.2)" : "transparent",
              border: "1px solid rgba(255,255,255,0.4)",
              color: "#ffffff",
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}><FaTv size={14} /></button>
          <button
            onClick={() => {
              setScorecardState(scorecardState === 'hidden' ? 'compact' : 'hidden')
            }}
            style={{
              background: scorecardState !== 'hidden' ? "rgba(255,255,255,0.2)" : "transparent",
              border: "1px solid rgba(255,255,255,0.4)",
              color: "#ffffff",
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}>⛶</button>
        </div>
      </div>

      {/* TV Iframe */}
      {showTV && id && (
        <div style={{
          width: "100%",
          height: "210px",
          marginBottom: "12px",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          <iframe
            src={`https://e765432.diamondcricketid.com/dtv.php?id=${bid}`}
            style={{
              width: "100%",
              height: "100%",
              border: "none"
            }}
            title="Live TV"
            allowFullScreen
          />
        </div>
      )}

      {/* Scorecard Iframe */}
      {/* {scorecardState !== 'hidden' && id && (
        <div style={{
          width: "100%",
          height: "210px",
          marginBottom: "12px",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          <iframe
            src={`https://card.hr08bets.in/api/getscoredata?event_id=${id}`}
            style={{
              width: "100%",
              height: "100%",
              border: "none"
            }}
            title="Scorecard"
            allowFullScreen
          />
        </div>
      )} */}

      {/* Scorecard */}
      {scorecardState !== 'hidden' && id && (
        <CricketScoreCard scoreData={finalScoreData} />
      )}

     

      {/* Bookmaker Section */}
      <div style={{  background: "var(--color-surface)" }}>
        <div style={{
          background: "var(--color-cardBg)",
          borderRadius: "8px",
          padding: "2px",
          marginBottom: "12px"
        }}>
          {/* Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            marginBottom: "4px",
            gap: "8px",
            background: "#2c3548",
            borderRadius: "6px 6px 0 0",
            padding: "6px 8px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{ color: "#fff", fontSize: "16px", fontWeight: "bold" }}>Bookmaker</span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>Min: {bmLimit?.minBet ?? 100} Max: {bmLimit?.maxBet ?? maxBet}</span>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4px",
            }}>
              <div style={{
                color: "white",
                padding: "8px",
                fontSize: "14px",
                fontWeight: "bold",
                textAlign: "center",
                borderRadius: "4px",
                background: "rgb(64 135 251)",
              }}>
                LAGAI
              </div>
              <div style={{
                background: "rgb(240 121 143)",
                color: "white",
                padding: "8px",
                fontSize: "14px",
                fontWeight: "bold",
                textAlign: "center",
                borderRadius: "4px",
              }}>
                KHAI
              </div>
            </div>
          </div>

          {/* Team 1 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "6px",
            marginBottom: "4px"
          }}>
            <div style={{
              background: "var(--bg-panel)",
              color: "var(--color-text)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "4px 12px",
              borderRadius: "4px"
            }}>
              <div style={{ fontWeight: "bold", fontSize: "13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{team1?.nation}</span>
                {team1?.pl && (
                  <span style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: team1.pl.pl >= 0 ? "#4CAF50" : "#f44336"
                  }}>
                    {team1.pl.display}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: "4px", position: "relative" }}>
              {/* Suspended Overlay for Team 1 */}
              {(team1?.gstatus === "SUSPENDED" || (team1?.b1 === 0 && team1?.l1 === 0) || Number(team1?.b1) > 100 || Number(team1?.l1) > 100) && (
                <div style={{
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
                  borderRadius: "4px"
                }}>
                  SUSPENDED
                </div>
              )}

              <OddsButton
                type="back"
                value={team1?.gstatus === "SUSPENDED" || team1?.b1 === 0 || Number(team1?.b1) > 100 || Number(team1?.l1) > 100 ? "0" : team1?.b1 || "0"}
                onClick={() => {
                  if (team1?.gstatus !== "SUSPENDED" && team1?.b1 !== 0 && Number(team1?.b1) <= 100 && Number(team1?.l1) <= 100) {
                    handleBetData(
                      false,
                      true,
                      team1?.b1,
                      "Bookmaker",
                      team1?.sid?.toString(),
                      team1?.b1,
                      team1?.mid,
                      team1?.nation,
                      "Back",
                      new Date(),
                    )
                    focusAmountInput()
                  }
                }}
                disabled={team1?.gstatus === "SUSPENDED" || team1?.b1 === 0 || Number(team1?.b1) > 100 || Number(team1?.l1) > 100}
              />
              <OddsButton
                type="lay"
                value={team1?.gstatus === "SUSPENDED" || team1?.l1 === 0 || Number(team1?.b1) > 100 || Number(team1?.l1) > 100 ? "0" : team1?.l1 || "0"}
                onClick={() => {
                  if (team1?.gstatus !== "SUSPENDED" && team1?.l1 !== 0 && Number(team1?.b1) <= 100 && Number(team1?.l1) <= 100) {
                    handleBetData(
                      false,
                      false,
                      team1?.l1,
                      "Bookmaker",
                      team1?.sid?.toString(),
                      team1?.l1,
                      team1?.mid,
                      team1?.nation,
                      "Lay",
                      new Date(),
                    )
                    focusAmountInput()
                  }
                }}
                disabled={team1?.gstatus === "SUSPENDED" || team1?.l1 === 0 || Number(team1?.b1) > 100 || Number(team1?.l1) > 100}
              />
            </div>
          </div>

          {/* Team 2 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "6px"
          }}>
            <div style={{
              background: "var(--bg-panel)",
              color: "var(--color-text)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "8px 12px",
              borderRadius: "4px"
            }}>
              <div style={{ fontWeight: "bold", fontSize: "13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{team2?.nation}</span>
                {team2?.pl && (
                  <span style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: team2.pl.pl >= 0 ? "#4CAF50" : "#f44336"
                  }}>
                    {team2.pl.display}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: "4px", position: "relative" }}>
              {/* Suspended Overlay for Team 2 */}
              {(team2?.gstatus === "SUSPENDED" || (team2?.b1 === 0 && team2?.l1 === 0) || Number(team2?.b1) > 100 || Number(team2?.l1) > 100) && (
                <div style={{
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
                  borderRadius: "4px"
                }}>
                  SUSPENDED
                </div>
              )}

              <OddsButton
                type="back"
                value={team2?.gstatus === "SUSPENDED" || team2?.b1 === 0 || Number(team2?.b1) > 100 || Number(team2?.l1) > 100 ? "0" : team2?.b1 || "0"}
                onClick={() => {
                  if (team2?.gstatus !== "SUSPENDED" && team2?.b1 !== 0 && Number(team2?.b1) <= 100 && Number(team2?.l1) <= 100) {
                    handleBetData(
                      false,
                      true,
                      team2?.b1,
                      "Bookmaker",
                      team2?.sid?.toString(),
                      team2?.b1,
                      team2?.mid,
                      team2?.nation,
                      "Back",
                      new Date(),
                    )
                    focusAmountInput()
                  }
                }}
                disabled={team2?.gstatus === "SUSPENDED" || team2?.b1 === 0 || Number(team2?.b1) > 100 || Number(team2?.l1) > 100}
              />
              <OddsButton
                type="lay"
                value={team2?.gstatus === "SUSPENDED" || team2?.l1 === 0 || Number(team2?.b1) > 100 || Number(team2?.l1) > 100 ? "0" : team2?.l1 || "0"}
                onClick={() => {
                  if (team2?.gstatus !== "SUSPENDED" && team2?.l1 !== 0 && Number(team2?.b1) <= 100 && Number(team2?.l1) <= 100) {
                    handleBetData(
                      false,
                      false,
                      team2?.l1,
                      "Bookmaker",
                      team2?.sid?.toString(),
                      team2?.l1,
                      team2?.mid,
                      team2?.nation,
                      "Lay",
                      new Date(),
                    )
                    focusAmountInput()
                  }
                }}
                disabled={team2?.gstatus === "SUSPENDED" || team2?.l1 === 0 || Number(team2?.b1) > 100 || Number(team2?.l1) > 100}
              />
            </div>
          </div>

          {/* Draw */}
          {draw && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "6px",
              marginTop: "4px"
            }}>
              <div style={{
                background: "var(--bg-panel)",
                color: "var(--color-text)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "8px 12px",
                borderRadius: "4px"
              }}>
                <div style={{ fontWeight: "bold", fontSize: "13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{draw.nation}</span>
                  {draw.pl && (
                    <span style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: draw.pl.pl >= 0 ? "#4CAF50" : "#f44336"
                    }}>
                      {draw.pl.display}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "4px", position: "relative" }}>
                {(draw.gstatus === "SUSPENDED" || (draw.b1 === 0 && draw.l1 === 0)) && (
                  <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(22, 33, 62, 0.9)",
                    color: "red",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "bold",
                    zIndex: 10,
                    borderRadius: "4px"
                  }}>
                    SUSPENDED
                  </div>
                )}
                <OddsButton
                  type="back"
                  value={draw.gstatus === "SUSPENDED" || draw.b1 === 0 ? "0" : draw.b1 || "0"}
                  onClick={() => {
                    if (draw.gstatus !== "SUSPENDED" && draw.b1 !== 0) {
                      handleBetData(false, true, draw.b1, "Bookmaker", draw.sid?.toString(), draw.b1, draw.mid, draw.nation, "Back", new Date())
                      focusAmountInput()
                    }
                  }}
                  disabled={draw.gstatus === "SUSPENDED" || draw.b1 === 0}
                />
                <OddsButton
                  type="lay"
                  value={draw.gstatus === "SUSPENDED" || draw.l1 === 0 ? "0" : draw.l1 || "0"}
                  onClick={() => {
                    if (draw.gstatus !== "SUSPENDED" && draw.l1 !== 0) {
                      handleBetData(false, false, draw.l1, "Bookmaker", draw.sid?.toString(), draw.l1, draw.mid, draw.nation, "Lay", new Date())
                      focusAmountInput()
                    }
                  }}
                  disabled={draw.gstatus === "SUSPENDED" || draw.l1 === 0}
                />
              </div>
            </div>
          )}
        </div>

        {/* Toss Section */}
        {oddsData?.toss?.runners?.length > 0 && (
          <div style={{ background: "var(--color-cardBg)", borderRadius: "8px", padding: "2px", marginBottom: "12px" }}>
            {/* Header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              marginBottom: "4px",
              gap: "6px",
              background: "#2c3548",
              borderRadius: "6px 6px 0 0",
              padding: "6px 8px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#fff", fontSize: "16px", fontWeight: "bold" }}>Toss</span>
                {(() => {
                  const minVal = oddsData.toss.runners[0]?.min || 0
                  const maxVal = oddsData.toss.runners[0]?.max || 0
                  return (minVal > 0 || maxVal > 0) ? (
                    <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>Min: {minVal} Max: {maxVal}</span>
                  ) : null
                })()}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                <div style={{ background: "rgb(64 135 251)", color: "white", padding: "8px", fontSize: "14px", fontWeight: "bold", textAlign: "center", borderRadius: "4px" }}>
                  BACK
                </div>
                <div style={{ background: "rgb(240 121 143)", color: "white", padding: "8px", fontSize: "14px", fontWeight: "bold", textAlign: "center", borderRadius: "4px" }}>
                  LAY
                </div>
              </div>
            </div>

            {/* Toss Rows */}
            {oddsData.toss.runners.map((runner: any) => {
              const b1 = runner.odds || 0
              const name = runner.name
              const sid = runner.sid
              const fancyId = `${oddsData.toss.marketId}_${runner.sid}`
              const isSuspended = runner.gstatus === "SUSPENDED" || b1 === 0 || oddsData.toss.status !== "OPEN" || oddsData.toss.betLock

              const tossPL = getTossPL(sid)

              return (
                <div key={fancyId} style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "6px", marginBottom: "4px" }}>
                  <div style={{ background: "var(--bg-panel)", color: "var(--color-text)", padding: "8px 12px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "bold", fontSize: "13px" }}>{name}</span>
                    {tossPL && (
                      <span style={{ fontSize: "12px", fontWeight: "bold", color: tossPL.pl >= 0 ? "#4CAF50" : "#f44336" }}>
                        {tossPL.display}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", position: "relative" }}>
                    {isSuspended && (
                      <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: "rgba(22, 33, 62, 0.9)", color: "red",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "14px", fontWeight: "bold", zIndex: 10, borderRadius: "4px"
                      }}>SUSPENDED</div>
                    )}
                    <OddsButton
                      type="back"
                      value={isSuspended ? "0" : b1}
                      onClick={() => {
                        if (!isSuspended) {
                          handleBetData(true, true, b1, "Toss", sid?.toString(), b1, oddsData.toss.marketId?.toString(), name, "Yes", new Date(), b1, fancyId)
                          focusAmountInput()
                        }
                      }}
                      disabled={isSuspended}
                    />
                    <OddsButton type="lay" value="0" disabled={true} onClick={() => {}} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Fancy Section — one block per mname group */}
        {(oddsData?.fancy || []).map((group: any, i: number) => (
          <Fancy
            key={group.mid || group.mname || i}
            groupName={group.mname}
            fancyData={group.section || []}
            handleBetData={handleBetData}
            focusAmountInput={focusAmountInput}
            teamPLData={teamPLData}
            beventId={id}
            marketLimits={marketLimitsData}
          />
        ))}
      </div>

      {/* Betslip */}
      <Betslip
        focusAmountInput={focusAmountInput}
        amountInputRef={amountInputRef}
        placeBetData={placeBetData}
        setPlaceBetData={setPlaceBetData}
        timer={timer}
        setTimer={setTimer}
        checkOddsValid={checkOddsValid}
        onOddsInvalid={handleOddsInvalid}
      />

      {/* My Bets Table */}
      {id && <MyBetsTable beventId={id} />}

      {/* Completed Bets Table */}
      {id && <CompletedBetsTable beventId={id} />}

      <br />
      <BackBtn to="/inplay" name="BACK TO IN PLAY GAMES" />
    </div>
  )
}

export default GameDeatils
