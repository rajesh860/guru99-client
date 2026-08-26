import "./styles.scss"


import BackBtn from "../../BackBtn/BackBtn"
import { useBetPlaceMutation } from "../../../../store/service/casino/casinoServices"
import { Link, useParams } from "react-router-dom"
import { useOdds } from "../../Casino_Data/UseOdds"
import {  tableIdtoUrl } from "../../Casino_Data/Constant"


import CardGameBoard from "./CardGameBoard"
import BetModal from "../../betPlaceModal2/BetModal"

import  { useState, useEffect } from "react"

import ResultModal from "./ResultModalDt"

import cardA from "../../../../public/casino/CARD 1.png"
import snackbarUtil from "../../../utils/Snackbar"
const settings = {
  infinite: true,
  arrows: true,
  speed: 500,
  slidesToShow: 5,
  slidesToScroll: 3
}
const AndarBhar = () => {
  const { id } = useParams()
  const [first, setFirst] = useState("")
  const [openMod, setOpenMod] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState("")
  const [countdown, setCountdown] = useState("00:00")
  const [remainingSecs, setRemainingSecs] = useState(0)

  const [trigger, { data: betPlaceResponse, isLoading }] = useBetPlaceMutation()

  const { odds } = useOdds(tableIdtoUrl[id])

  // Initialize liability data (empty for now, can be fetched from API if needed)
  const liblity = { data: [] }

  const handleRateClick = (item: any) => {
    setSelectedPlayer(item)
    setModalVisible(true)
  }

  const handleModalClose = () => {
    setModalVisible(false)
  }

  // Bet place response handler
  useEffect(() => {
    if (betPlaceResponse) {
      if (betPlaceResponse?.success ?? betPlaceResponse?.status) {
        snackbarUtil.success(betPlaceResponse?.message)
        setModalVisible(false)
      } else {
        snackbarUtil.error(betPlaceResponse?.message)
      }
    }
  }, [betPlaceResponse])

  // Autotime-based countdown
  useEffect(() => {
    if (!odds?.t1?.[0]?.autotime) {
      setCountdown("00:00")
      setRemainingSecs(0)
      return
    }

    const autoTimeSeconds = parseInt(odds.t1[0].autotime)
    if (autoTimeSeconds <= 0) {
      setCountdown("00:00")
      setRemainingSecs(0)
      return
    }

    let remainingTime = autoTimeSeconds
    setCountdown(`${Math.floor(remainingTime / 60).toString().padStart(2, '0')}:${(remainingTime % 60).toString().padStart(2, '0')}`)
    setRemainingSecs(remainingTime)

    const timer = setInterval(() => {
      remainingTime -= 1
      if (remainingTime <= 0) {
        setCountdown("00:00")
        setRemainingSecs(0)
        clearInterval(timer)
      } else {
        setCountdown(`${Math.floor(remainingTime / 60).toString().padStart(2, '0')}:${(remainingTime % 60).toString().padStart(2, '0')}`)
        setRemainingSecs(remainingTime)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [odds?.t1?.[0]?.autotime])

  const bShownCards = odds && odds?.t2BySid ? odds?.t2BySid["undefined"] : {}
  const br = bShownCards?.br ? bShownCards?.br?.split(",") : []
  const ar = bShownCards?.ar ? bShownCards?.ar?.split(",") : []

  // Removed useCasinoResultQuery

  const handleClick = val => {
    setFirst(val)
    if (val) {
      setOpenMod(true)
    }
  }

  const cards = [1,2,3,4,5,6]

  return (
    <>
      <BackBtn to="/casino-list" name="BACK TO CASINO MENU" />

      <div className="teenpatti-container" style={{ position: "relative" }}>
        <div className="left-col">
               <div className="round-id-header">
            <div className="left">
                Round:
                 {/* {betsResponse?.t1[0]?.mid} */}
            </div>
            <div className="right">
                <button>

                Live Tv
                </button>
            </div>
          </div>
          <div className="game-section">
            <div style={{ position: "relative" }}>
              <iframe
                src="https://alpha-g.qnsports.live/route/rih2.php?id=3053"
                title="TeenPatti Stream"
                allowFullScreen
              ></iframe>
              <div className="timer">{odds && countdown}</div>
            </div>
<div className="casino-iframe-card-area">
            <div className="left-col-1">
              <img src={cardA} alt="" />
            </div>
            <div className="right-col-2">
              <div className="cards-container" style={{
                transform: `translateX(-${Math.max(0, (cards.length - 6) * 35)}px)` // Slide left when more than 6 cards
              }}>
                {cards.map((cardId, index) => (
                  <div key={cardId} className="card-item">
                    <img src={cardA} alt={`Card ${cardId}`} />
                  </div>
                ))}
              </div>
              <div className="cards-container" style={{
                transform: `translateX(-${Math.max(0, (cards.length - 6) * 35)}px)` // Slide left when more than 6 cards
              }}>
                {cards.map((cardId, index) => (
                  <div key={cardId} className="card-item">
                    <img src={cardA} alt={`Card ${cardId}`} />
                  </div>
                ))}
              </div>
              {/* Temporary button to test adding cards */}
              {/* <button 
                onClick={addNewCard}
                style={{
                  position: 'absolute',
                  // bottom: '-30px',
                  left: '0',
                  top:0,
                  fontSize: '10px',
                  padding: '2px 5px'
                }}
              >
                Add Card
              </button> */}
            </div>
          </div>
            {/* <div className="andar_bahar">
              <div className="andar_bahar_row andar_color">
                <div className="andar_bahar_label border-end border-black">
                  Andar
                </div>
                <div className="px-4 d-sm-none">
                  <Slider {...settings}>
                    {[...Array(13).keys()].map(sid => (
                      <CardCompAB
                        sid={sid + 1 + ""}
                        br={ar}
                        t2BySid={odds && odds?.t2BySid}
                        liblity={
                          liblity?.data?.find(lib => lib.sid == sid)?.liability
                        }
                      />
                    ))}
                  </Slider>
                </div>
                <div className="andar_bahar_t2_card_container">
                  {[...Array(13).keys()].map(sid => (
                    <CardCompAB
                      sid={sid + 1 + ""}
                      br={ar}
                      t2BySid={odds && odds?.t2BySid}
                      liblity={
                        liblity?.data?.find(lib => lib.sid == sid)?.liability
                      }
                    />
                  ))}
                </div>
              </div>
              <div
                className={`andar_bahar_row bahar_color ${window.innerWidth < 800 ? " mb-2" : ""}`}
              >
                <div className="andar_bahar_label border-end border-black">
                  Bahar
                </div>
                <div className="px-4 d-sm-none">
                  <Slider {...settings}>
                    {[...Array(13).keys()].map(sid => (
                      <CardCompAB
                        sid={sid + 21 + ""}
                        br={br}
                        t2BySid={odds && odds?.t2BySid}
                        liblity={
                          liblity?.data?.find(lib => lib.sid == sid)?.liability
                        }
                      />
                    ))}
                  </Slider>
                </div>
                <div className="andar_bahar_t2_card_container">
                  {[...Array(13).keys()].map(sid => (
                    <CardCompAB
                      sid={sid + 21 + ""}
                      br={br}
                      t2BySid={odds && odds?.t2BySid}
                      liblity={
                        liblity?.data?.find(lib => lib.sid == sid)?.liability
                      }
                    />
                  ))}
                </div>
              </div>
            </div> */}
          </div>

          {/* <div className="video_block_container">
            <AndarBaharCardOnVideo t3={odds?.t3} />
          
          </div> */}

          {/* <RateTable splitAll={splitAll} splitBll={splitBll}/> */}

          <div className="last-result">
            <div className="left">Last Result</div>
            <div className="right">View All</div>
          </div>

          {/* <div className="result-circles">
            {resultReponse?.map((item: any, i: number) => {
              return (
                <div
                  key={i}
                  className="circle"
                  style={{
                    background: LetterAndColorById?.[id]?.[item?.result]?.color,
                  }}
                  onClick={() => handleClick(item)}
                >
                  {LetterAndColorById?.[id]?.[item?.result]?.label}
                </div>
              )
            })}
          </div> */}
          <CardGameBoard
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            t2Data={odds?.t2 || []}
            liabilityData={liblity?.data || []}
            onRateClick={handleRateClick}
            countdown={countdown}
            roundSeconds={remainingSecs}
          />
        </div>

        <div className="right-col">
          <div className="my-bet my-bet-table h-0">
            <div className="title" style={{ height: "48px" }}>
              MY BET
            </div>
            <table className="bet-table">
              <thead>
              <tr>
                <th style={{ width: "40%" }}>Matched Bet</th>
                <th style={{ width: "20%" }}>Mode</th>
                <th style={{ width: "20%" }}>Odds</th>
                <th style={{ width: "20%" }}>Stake</th>
              </tr>
              </thead>
              <tbody>
              {/* {betsResponse?.data?.map((item: any) => {
                return (
                  <tr
                    key={item?.gameName}
                    className={`${item?.back ? "back" : "lay"}`}
                  >
                    <td>{item?.selectionName}</td>
                    <td>{item?.gameName}</td>
                    <td>{item?.odds}</td>
                    <td>{item?.stake}</td>
                  </tr>
                )
              })} */}
              </tbody>
            </table>
            <div className="see-btn" style={{ paddingBottom: "15px" }}>
              <Link to={"/casino-bets"}>
                <button
                  className="see-all sell-all-res"
                  style={{
                    background: "#212529",
                    borderColor: "#212529",
                    fontWeight: 400
                  }}
                >
                  SEE ALL COMPLETE BETS
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {openMod && <ResultModal result={first} open={openMod} setOpen={setOpenMod} />}
      {modalVisible && <BetModal onClose={handleModalClose} roundSeconds={remainingSecs} />}
    </>
  )
}

export default AndarBhar
