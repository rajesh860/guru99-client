import React, { useEffect, useState } from "react"
import PlaceBetModal from "../../betPlaceModal"
import { useBetPlaceMutation } from "../../../../store/service/casino/casinoServices"
import snackbarUtil from "../../../utils/Snackbar"

const CardCompAB = ({ sid, br, t2BySid, liblity }: any) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState("")

  const [trigger, { data: betPlaceResponse, isLoading }] = useBetPlaceMutation()

  const handleModalClose = () => {
    setModalVisible(false)
  }

  const handleModalSubmit = (data: any) => {
    trigger(data)
  }

  const card = t2BySid ? t2BySid[sid] : {}

  const handleClick = (t2: any) => {
    setSelectedPlayer(t2)
    setModalVisible(true)
  }

  useEffect(() => {
    if (!betPlaceResponse) return

    const { status, success, message } = betPlaceResponse
    if (success ?? status) {
      snackbarUtil.success(message)
      setModalVisible(false)
    } else {
      snackbarUtil.error(message)
    }
  }, [betPlaceResponse])

  const cardNation = card.nation
    ? card.nation.replace("Bahar ", "").replace("Ander ", "").toUpperCase()
    : "0"

  const isSidInBr = br.length && br.includes(`${sid}`)
  const cardSrc = `/casino/CARD ${isSidInBr ? cardNation : "0"}.png`
  return (
    <div onClick={() => t2BySid?.[sid]?.gstatus === "OPEN" && handleClick(card)}>
      <img alt="" src={cardSrc} />
      <div
        className="mb-n1 desk-view-casino"
        style={{ color: liblity > 0 ? "green" : "red" }}
      >
        {liblity}
      </div>

      <PlaceBetModal
        show={modalVisible}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        player={selectedPlayer}
        isLoading={isLoading}
      />
    </div>
  )
}

export default CardCompAB
