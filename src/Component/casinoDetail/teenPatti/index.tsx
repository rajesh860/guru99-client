import React, { useState, useEffect } from "react"
import "../teenPatti/styles.scss"
import { FaArrowRight, FaLock } from "react-icons/fa"
import BackBtn from "../../BackBtn/BackBtn"
import {
  useBetPlaceMutation,
} from "../../../../store/service/casino/casinoServices"
import { useGetCasinoMyBetsQuery } from "../../../../store/service/userServices/userServices"
import { useGetTeenPattiResultsQuery } from "../../../../store/service/teenPattiApi"
import { Link, useParams } from "react-router-dom"
import { LetterAndColorById } from "../resultCommon"
import ResultModal from "../ResultModal"
import BetModal from "../../betPlaceModal2/BetModal"
import { useOdds } from "../../Casino_Data/UseOdds"
import { tableIdtoUrl, videoIdById } from "../../Casino_Data/Constant"
import snackbarUtil from "../../../utils/Snackbar"
import "./styles.scss"
import TeamTable from "./TeamTable"
import BetHistoryTable from "../../betHistoryTable/BetHistoryTable"
import MyBetsModal from "./MyBetsModal"
import RoundDetailModal from "./RoundDetailModal"
import cardBack from "../../../../public/casino/cardBack.png"

interface SelectedPlayerType {
  gstatus: boolean
  max: number
  mid: string
  min: number
  nat: string
  nation: string
  pnl: number
  rate: string
  sid: string
  isBack: boolean
}
const formatTimestamp = (timestamp: number) => {
  if (!timestamp) return "--:--:--"

  const date = new Date(timestamp)

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
}

const getCardImage = (cardCode?: string) => {
  if (!cardCode || cardCode === "1") {
    return "https://versionobj.ecoassetsservice.com/v14/static/front/img/cards/1.jpg"
  }
  const mapped = cardCode.includes("HH")
    ? cardCode.replace("HH", "SS")
    : cardCode.includes("SS")
      ? cardCode.replace("SS", "DD")
      : cardCode.includes("DD")
        ? cardCode.replace("DD", "HH")
        : cardCode
  return `https://versionobj.ecoassetsservice.com/v14/static/front/img/cards/${mapped}.jpg`
}

const TeenPattiGame = () => {
  const { id } = useParams()
  const [first, setFirst] = useState("")
  const [openMod, setOpenMod] = useState(false)
  const [betModalVisible, setBetModalVisible] = useState(false)
  const [myBetsModalOpen, setMyBetsModalOpen] = useState(false)
  const [roundDetailModalOpen, setRoundDetailModalOpen] = useState(false)
  const [selectedRoundId, setSelectedRoundId] = useState("")
  const [selectedPlayer, setSelectedPlayer] =
    useState<SelectedPlayerType | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [wsData, setWsData] = useState<any>(null)

  const slug = tableIdtoUrl[id]
  // const { odds: data } = useOdds(slug)

  const [trigger, { data: betPlaceResponse, isLoading }] = useBetPlaceMutation()
  
  // Fetch my bets
  const { data: myBetsData, isLoading: myBetsLoading } = useGetCasinoMyBetsQuery(
    { game: "teen20" },
    { skip: !myBetsModalOpen, pollingInterval: 3000 }
  )

  // Fetch teen20 results
  const { data: resultsData } = useGetTeenPattiResultsQuery(undefined, {
    pollingInterval: 5000
  })

  // Use WebSocket data as primary data source
  const data = wsData || null

  // WebSocket connection
  useEffect(() => {
    console.log("🚀 Connecting to WebSocket...");
    
    // const ws = new WebSocket("ws://13.235.184.38:3001/ws/casino");
    // const ws = new WebSocket("ws://192.168.31.235:3001/ws/casino");
    const ws = new WebSocket("wss://guru99.co/ws/casino");
    
    ws.onopen = () => {
      console.log("✅ WebSocket Connected!");
      setIsConnected(true);
      
      const subscribeMessage = { 
        "type": "subscribe", 
        "game": "teen20"
      };
      
      ws.send(JSON.stringify(subscribeMessage));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Update state with WebSocket data
        if (data.type === 'gameData' && data.game === 'teen20') {
          setWsData(data);
        }
      } catch (error) {
        console.error("❌ Parse error:", error);
      }
    };
    
    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      setIsConnected(false);
    };
    
    ws.onclose = (event) => {
      setIsConnected(false);
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [])

  const handleRateClick = (item: SelectedPlayerType) => {
    // Check if betting option is suspended
    if (!item?.gstatus) {
      console.log("Betting option is suspended, modal will not open")
      snackbarUtil.error("This betting option is currently suspended")
      return
    }

    setSelectedPlayer({ ...item, isBack: true }) // Default to back bet; can be modified in BetModal if needed
    setBetModalVisible(true)
  }

  // Handle bet place response
  useEffect(() => {
    if (betPlaceResponse) {
      if (betPlaceResponse?.status) {
        snackbarUtil.success(
          betPlaceResponse?.message,
        )
        setBetModalVisible(false)
      } 
      // else {
      //   snackbarUtil.error(betPlaceResponse?.message)
      // }
    }
  }, [betPlaceResponse])

  // Removed useCasinoResultQuery - not needed with WebSocket

  const handleClick = val => {
    setFirst(val)
    if (val) setOpenMod(true)
  }

  return (
    <>
      <BackBtn to="/casino-list" name="BACK TO CASINO MENU" />

      <div className="teenpatti-container">
        <div className="left-col">
          {/* <div className="header">
            <div className="left">
              Dragon Tiger
              <span>
                <FaArrowRight />
                RULES
              </span>
            </div>
            <div className="secondary-heading center">
              Round ID: {data?.t1[0]?.mid}
            </div>
            <div className="right secondary-heading">
              Time: {formatTimestamp(data?.Time)}
            </div>
          </div> */}

          <div className="round-id-header">
            <div className="left">Round: {wsData?.t1?.mid || 'Loading...'}</div>
            <div className="right">
              <button>Live Tv</button>
            </div>
          </div>

          <div className="game-section">
            <iframe
              src={`https://casino.loki7exch.com/route/?id=${videoIdById[id] || "3035"}`}
              title="DragonTiger Stream"
              allowFullScreen
            ></iframe>

            {/* Countdown Timer */}
            <div className="countdown-timer">
              {wsData?.autotime || 0}
            </div>

            {/* Minimal layout; expand with card visuals if needed */}
            <div className="card-area-box-teenpatti">
              {/* Minimal layout; expand with card visuals if needed */}
              <div className="card-area-left-col">
                <div className="top-card">
                  <img
                    src={getCardImage(wsData?.t1?.C1)}
                    alt="Player A card 1"
                  />
                  <img
                    src={getCardImage(wsData?.t1?.C2)}
                    alt="Player A card 2"
                  />
                  <img
                    src={getCardImage(wsData?.t1?.C3)}
                    alt="Player A card 3"
                  />
                </div>
                <div className="bottom-label">Player A</div>
              </div>

              <div className="card-area-right-col">
                <div className="top-card">
                  <img
                    src={getCardImage(wsData?.t1?.C4)}
                    alt="Player B card 1"
                  />
                  <img
                    src={getCardImage(wsData?.t1?.C5)}
                    alt="Player B card 2"
                  />
                  <img
                    src={getCardImage(wsData?.t1?.C6)}
                    alt="Player B card 3"
                  />
                </div>
                <div className="bottom-label">Player B</div>
              </div>
              {/* <div className="top">
                <div className="player">Dragon</div>
              </div>
              <div className="bottom">
                <div className="player">Tiger</div>
              </div> */}
            </div>
          </div>

          {/* Betting Section */}
         <div className="betting-section">
          <TeamTable data={wsData} handleRateClick={handleRateClick} />
         </div>
         <div className="last-10-result">
            <div className="result-header">Last 10 Results</div>
            <div className="result-list">
              {resultsData?.result?.data?.map((item, index) => (
                <div 
                  key={item.mid} 
                  className={`result-circle ${item.result === "1" ? "player-a" : "player-b"}`}
                  onClick={() => {
                    setSelectedRoundId(item.mid)
                    setRoundDetailModalOpen(true)
                  }}
                >
                  {item.result === "1" ? "A" : "B"}
                </div>
              ))}
            </div>
         </div>
          {/* Show Bets Button */}
          <div className="show-bets-section">
            <button 
              className="show-bets-button"
              onClick={() => setMyBetsModalOpen(true)}
            >
              Show Bets
            </button>
          </div>
        </div>
      </div>

      {betModalVisible && (
        <BetModal
          onClose={() => setBetModalVisible(false)}
          selectedPlayer={selectedPlayer}
          matchId={id}
        />
      )}
      
      <MyBetsModal
        isOpen={myBetsModalOpen}
        onClose={() => setMyBetsModalOpen(false)}
        bets={myBetsData?.bets || myBetsData?.data || []}
        isLoading={myBetsLoading}
      />
      
      <RoundDetailModal
        isOpen={roundDetailModalOpen}
        onClose={() => setRoundDetailModalOpen(false)}
        roundId={selectedRoundId}
        game="teen20"
      />
      
      <ResultModal
        setOpen={setOpenMod}
        open={openMod}
        tableId={id}
        mid={first}
      />
    </>
  )
}

export default TeenPattiGame
