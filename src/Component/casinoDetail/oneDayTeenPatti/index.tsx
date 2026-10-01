import React, { useState } from "react"
import "../oneDayTeenPatti/styles.scss"
import { FaArrowRight } from "react-icons/fa"
import BackBtn from "../../BackBtn/BackBtn"
import { useGetCasinoMyBetsQuery } from "../../../../store/service/userServices/userServices"
import { Link, useParams } from "react-router-dom"
import { LetterAndColorById } from "../resultCommon"
import ResultModal from "./ResultModalDt"
import BetModal from "../../betPlaceModal2/BetModal"
import { useOdds } from "../../Casino_Data/UseOdds"
import { tableIdtoUrl, videoIdById } from "../../Casino_Data/Constant"
import "./styles.scss"
import TeamTable from "./TeamTable"
import BetHistoryTable from "../../betHistoryTable/BetHistoryTable"
import { getCardImage } from "../../../utils/cardImage"
import CasinoVideo from "../CasinoVideo"

const OneDayTeenPatti = () => {
  const { id } = useParams()
  const [first, setFirst] = useState("")
  const [openMod, setOpenMod] = useState(false)
  const [betModalVisible, setBetModalVisible] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [isBack, setIsBack] = useState(true)

  // Transform bet data for BetHistoryTable
  const transformBetHistory = (betsData: any[]) => {
    return (
      betsData?.map((bet: any) => ({
        team: bet.selectionName || "N/A",
        mode: bet.back ? "BACK" : "LAY",
        rate: bet.odds ? parseFloat(bet.odds).toFixed(2) : "0.00",
        amount: bet.stake ? parseFloat(bet.stake).toFixed(2) : "0.00",
        result: bet.pnl > 0 ? "Win" : bet.pnl < 0 ? "Loss" : "Not Declare",
        dateTime: bet.timeStamp
          ? new Date(bet.timeStamp).toLocaleString()
          : "N/A",
      })) || []
    )
  }

  const slug = tableIdtoUrl[id]
  const { odds: data } = useOdds(slug)

  const { data: betsResponse } = useGetCasinoMyBetsQuery(
    { game: "Teen" },
    { pollingInterval: 2000 }
  )

  const resultReponse: any[] = data?.t3 ?? []
  const liblity = { data: [] as any[] }

  const handleClick = val => {
    setFirst(val)
    if (val) setOpenMod(true)
  }

  const handleRateClick = (item: any, backOrLay: boolean = true) => {
    setSelectedPlayer(item)
    setIsBack(backOrLay)
    setBetModalVisible(true)
    console.log("Rate clicked:", item)
  }

  const playerA = data?.t1?.find((row: any) =>
    String(row?.nation || "")
      .toLowerCase()
      .includes("player a"),
  )
  const playerB = data?.t1?.find((row: any) =>
    String(row?.nation || "")
      .toLowerCase()
      .includes("player b"),
  )

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
            <div className="left">Round: {data?.t1[0]?.mid}</div>
            <div className="right">
              <button>Live Tv</button>
            </div>
          </div>

          <div className="game-section">
            <div className="timer">{data?.t1[0]?.autotime}</div>
            <CasinoVideo qnId={videoIdById[id] || "3035"} title="DragonTiger Stream" />

            {/* Minimal layout; expand with card visuals if needed */}
            <div className="card-area-box-teenpatti">
              {/* Minimal layout; expand with card visuals if needed */}
              <div className="card-area-left-col">
                <div className="top-card">
                  <img src={getCardImage(playerA?.C1)} alt="Player A card 1" />
                  <img src={getCardImage(playerA?.C2)} alt="Player A card 2" />
                  <img src={getCardImage(playerA?.C3)} alt="Player A card 3" />
                </div>
                <div className="bottom-label">Player A</div>
              </div>

              <div className="card-area-right-col">
                <div className="top-card">
                  <img src={getCardImage(playerB?.C1)} alt="Player B card 1" />
                  <img src={getCardImage(playerB?.C2)} alt="Player B card 2" />
                  <img src={getCardImage(playerB?.C3)} alt="Player B card 3" />
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

          <div className="last-result">
            <div className="left">Last Result</div>
            <div className="right">View All</div>
          </div>

          <div className="result-circles">
            {resultReponse?.map((r: any, i: number) => (
              <div
                key={i}
                className="circle"
                style={{
                  background: LetterAndColorById?.[id]?.[r?.result]?.color,
                }}
                onClick={() => handleClick(r?.mid)}
              >
                {LetterAndColorById?.[id]?.[r?.result]?.label}
              </div>
            ))}
          </div>
          <TeamTable
            oddsData={data?.t1 || []}
            liabilityData={liblity?.data || []}
            onRateClick={handleRateClick}
            countdown={data?.t1?.[0]?.autotime || 0}
          />

          {/* Bet History Table */}
          <BetHistoryTable
            data={transformBetHistory(betsResponse?.data)}
            roundId={id}
          />
        </div>
      </div>

      {betModalVisible && selectedPlayer && (
        <BetModal
          onClose={() => setBetModalVisible(false)}
          selectedPlayer={selectedPlayer}
          matchId={id}
        />
      )}
      <ResultModal
        setOpen={setOpenMod}
        open={openMod}
        tableId={id}
        mid={first}
      />
    </>
  )
}

export default OneDayTeenPatti
