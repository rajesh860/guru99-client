import React from "react"
import { useGetRoundDetailQuery } from "../../../../store/service/teenPattiApi"
import "../teenPatti/RoundDetailModal.scss"
import { getCardImage } from "../../../utils/cardImage"

interface Props {
  isOpen: boolean
  onClose: () => void
  roundId: string
  t3Item?: any
}

const Lucky7RoundDetailModal = ({ isOpen, onClose, roundId, t3Item }: Props) => {
  const { data: apiData, isLoading } = useGetRoundDetailQuery(
    { game: "lucky7eu", roundId },
    { skip: !isOpen || !roundId }
  )

  if (!isOpen) return null

  // t3 has: { mid, winner, cards: "6CC", desc: "Low Card#Even#Black#6#4 5 6" }
  const winner       = apiData?.winner      ?? t3Item?.winner   ?? ""
  const cardCode     = apiData?.cards?.cards?.[0] ?? t3Item?.cards ?? ""
  const roundIdDisp  = apiData?.roundId     ?? t3Item?.mid      ?? roundId
  const descStr: string = t3Item?.desc ?? ""
  const descParts    = descStr.split("#").map((s: string) => s.trim()).filter(Boolean)

  const winnerIsLow  = winner === "Low"  || winner === "Low Card"
  const winnerIsHigh = winner === "High" || winner === "High Card"

  return (
    <div className="round-detail-overlay" onClick={onClose}>
      <div className="round-detail-modal" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h3>Lucky 7 - B Result</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {isLoading && !t3Item ? (
          <div className="loading-state">Loading...</div>
        ) : (
          <>
            <div className="round-id-section">
              Round ID: <strong>{roundIdDisp}</strong>
            </div>

            <div className="cards-section">
              <div className="player-cards">
                <div className="player-header">
                  <div className="player-label">Card</div>
                </div>
                <div className="cards-row">
                  {cardCode ? (
                    <img
                      src={getCardImage(cardCode)}
                      alt="dealt card"
                      className="card-image"
                    />
                  ) : (
                    <span style={{ color: "#888", fontSize: 12 }}>—</span>
                  )}
                </div>
              </div>
            </div>

            {winner && (
              <div className={`winner-banner ${
                winnerIsHigh ? "winner-banner--a" : winnerIsLow ? "winner-banner--b" : ""
              }`}>
                🏆 Winner: {winner}
              </div>
            )}

            {descParts.length > 0 && (
              <div className="description-section">
                <div className="desc-list">
                  {descParts.map((item, idx) => (
                    <div key={idx} className="desc-item">{item}</div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

export default Lucky7RoundDetailModal
