import React, { useEffect, useState } from "react"
import { FaLock } from "react-icons/fa"

import "./styles.scss"
import PlaceBetModal from "../../betPlaceModal"
import { useBetPlaceMutation } from "../../../../store/service/casino/casinoServices"
import snackbarUtil from "../../../utils/Snackbar"

const RateTable = ({ data, datat1, timer, lability }) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState("")

  const [trigger, { data: betPlaceResponse, isLoading }] = useBetPlaceMutation()
  const handleRateClick = (item: any) => {
    setSelectedPlayer(item)
    setModalVisible(true)
  }

  const handleModalClose = () => {
    setModalVisible(false)
  }

  const handleModalSubmit = (data: any) => {
    trigger(data)
  }

  useEffect(() => {
    if (betPlaceResponse) {
      if (betPlaceResponse?.status) {
        snackbarUtil.success(betPlaceResponse?.message)
        setModalVisible(false)
      } else {
        snackbarUtil.error(betPlaceResponse?.message)
      }
    }
  }, [betPlaceResponse])
  return (
    <div className="rate-table-container">
      <div className="rate-row rate-minmax">
        <span>
          Min: {datat1?.[0]?.min} | Max: {datat1?.[0]?.max}
        </span>
        <div className="back-header">BACK</div>
      </div>
      {data?.map((item: any) => {
        const totalLiability = lability?.find(
          lib => lib.sid === item?.sid,
        )?.liability
        if (item?.nation == "Player A" || item?.nation == "Player B") {
          return (
            <>
              <PlaceBetModal
                show={modalVisible}
                onClose={handleModalClose}
                onSubmit={handleModalSubmit}
                player={selectedPlayer}
                isLoading={isLoading}
              />
              <div className="rate-row">
                <div className="player-name">
                  {item?.nation}
                  <div
                    style={{ color: totalLiability > 0 ? "green" : "red" }}
                    className="liability"
                  >
                    {" "}
                    {totalLiability || 0}
                  </div>
                </div>
                <div
                  className="rate-box"
                  onClick={() =>
                    item?.gstatus == 0 ? "" : handleRateClick(item)
                  }
                >
                  {timer <= 3 || item?.gstatus == 0 ? (
                    <div className="overlay">
                      <FaLock />
                    </div>
                  ) : (
                    ""
                  )}
                  <div className="rate">{item?.rate}</div>
                  <div className="stake">0</div>
                </div>
              </div>
            </>
          )
        }
      })}
    </div>
  )
}

export default RateTable
