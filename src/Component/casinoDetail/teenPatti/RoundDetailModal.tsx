import React from "react"
import "./RoundDetailModal.scss"
import { useGetRoundDetailQuery } from "../../../../store/service/teenPattiApi"

interface Props {
  isOpen: boolean
  onClose: () => void
  roundId: string
  game: string
}

const getCardImage = (cardCode: string) => {
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

const RoundDetailModal = ({ isOpen, onClose, roundId, game }: Props) => {
  const { data, isLoading } = useGetRoundDetailQuery(
    { game, roundId },
    { skip: !isOpen || !roundId }
  )

  if (!isOpen) return null

  return (
    <div className="round-detail-overlay" onClick={onClose}>
      <div className="round-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>20-20 Teenpatti Result</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="loading-state">Loading...</div>
        ) : data ? (
          <>
            {/* Round ID */}
            <div className="round-id-section">
              Round Id: {data.roundId}
            </div>

            {/* Cards Section */}
            <div className="cards-section">
              <div className="player-cards">
                <div className="player-header">
                  <div className="player-label">Player A</div>
                  {data.winner === "Player A" && (
                    <div className="trophy-icon">🏆</div>
                  )}
                </div>
                <div className="cards-row">
                  {data.cards["Player A"]?.map((card, index) => (
                    <img
                      key={index}
                      src={getCardImage(card)}
                      alt={`Player A card ${index + 1}`}
                      className="card-image"
                    />
                  ))}
                </div>
              </div>

              <div className="player-cards">
                <div className="player-header">
                  <div className="player-label">Player B</div>
                  {data.winner === "Player B" && (
                    <div className="trophy-icon">🏆</div>
                  )}
                </div>
                <div className="cards-row">
                  {data.cards["Player B"]?.map((card, index) => (
                    <img
                      key={index}
                      src={getCardImage(card)}
                      alt={`Player B card ${index + 1}`}
                      className="card-image"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Winner Banner */}
            <div className="winner-banner">
              Winner: {data.winner}
            </div>

            {/* Description */}
            {data.desc && data.desc.length > 0 && (
              <div className="description-section">
                <div className="desc-list">
                  {data.desc.map((item, index) => (
                    <div key={index} className="desc-item">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

          
          </>
        ) : (
          <div className="error-state">Failed to load round details</div>
        )}
      </div>
    </div>
  )
}

export default RoundDetailModal
