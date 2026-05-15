import "./casino.scss"
import { Modal } from "react-bootstrap"
import { Link } from "react-router-dom"
import type { DataBetLedger } from "../../../store/service/userServices/user"
import { useState } from "react"
import moment from "moment"

interface Props {
  handleClose: any
  show: boolean
  data: DataBetLedger
  casinoDate: string
  loading: boolean
}

const CasinoBetsRecords = ({
  show,
  handleClose,
  data,
  casinoDate,
  loading,
}: Props) => {
  const [showBets, setShowBets] = useState(false)
  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        dialogClassName="casino_bet_result"
        centered
      >
        <Modal.Header style={{ background: "white", borderBottom: 0 }}>
          <Modal.Title className="popupTitle">
            Casino Bets Records{" "}
            {moment(casinoDate, "DD.MM.YYYY").format("YYYY-MM-DD")}
          </Modal.Title>
          <Link
            to="#"
            type="button"
            aria-label="Close"
            className="close"
            onClick={() => (showBets ? setShowBets(!showBets) : handleClose())}
          >
            <img src="/img/cros.png" alt="cros" />
          </Link>
        </Modal.Header>
        {loading ? (
          <div className="loader-center">
            <div className="spinner-grow text-primary ng-star-inserted">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          <Modal.Body>
            <div>
              {data?.dataAndBets?.map(items => {
                return (
                  <>
                    {!showBets && (
                      <div className="popup-row ">
                        <div
                          style={{ cursor: "pointer", color: "#2560ad" }}
                          onClick={() => setShowBets(!showBets)}
                        >
                          {items?.name}
                          <span
                            style={{ color: items?.pnl > 0 ? "green" : "red" }}
                          >
                            {" "}
                            {items?.pnl > 0 ? "WON" : "Lost"} coins:{" "}
                            {items?.pnl}
                          </span>
                        </div>
                      </div>
                    )}
                    {showBets &&
                      items?.betList?.map(betlist => {
                        return (
                          <div className="show-bets ">
                            <div className="col-12 mt-4 p-0 ">
                              <span className="title">BETS </span>
                              <div className="bid_section col-12 pd0 mt-2 ">
                                <div className="col-12 row your_betSection justify-content-between">
                                  <div className="col-6 text-left-cls">
                                    <div className="level">RoundId</div>
                                    <div className="value">
                                      {betlist?.marketId}
                                    </div>
                                  </div>
                                  <div className="col-2 text-left-cls">
                                    <div className="level">Player</div>
                                    <div className="value">
                                      {betlist?.selectionName}
                                    </div>
                                  </div>
                                  <div className="col-2 text-left-cls">
                                    <div className="level">Win</div>
                                    <div className="value">
                                      {betlist?.winner}
                                    </div>
                                  </div>
                                  <div className="col-2 text-left-cls">
                                    <div className="level">RATE</div>
                                    <div className="value">
                                      {Number(betlist?.rate)?.toFixed(2)}
                                    </div>
                                  </div>
                                  <div className="col-2 text-left-cls">
                                    <div className="level">Amount</div>
                                    <div className="value">
                                      {betlist?.amount}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </>
                )
              })}
              <div className="popup-row">
                Total Commission : {data?.totalCommission}
              </div>
              <div
                className="popup-row"
                style={{ color: data?.totalWon > 0 ? "green" : "red" }}
              >
                {data?.totalWon > 0 ? "WON" : "Lost"} coins: {data?.totalWon}
              </div>
            </div>
          </Modal.Body>
        )}

        <Modal.Footer style={{ borderTop: 0 }}>
          <button
            type="button"
            className="popupBtn"
            style={{ display: "block" }}
            onClick={() => (showBets ? setShowBets(!showBets) : handleClose())}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default CasinoBetsRecords
