import React from "react"
import "./RoundDetailModal.scss"
import { useGetRoundDetailQuery } from "../../../../store/service/teenPattiApi"
import { getCardImage } from "../../../utils/cardImage"

interface Props {
  isOpen: boolean
  onClose: () => void
  roundId: string
  game: string
  t3Item?: any // fallback data from casinoGameData t3
}

// Parse t3 item → modal-compatible shape
const parseT3 = (item: any) => {
  if (!item) return null
  const allCards = (item.cards as string)?.split(",").map(c => c.trim()) ?? []
  const playerA  = allCards.slice(0, 3)
  const playerB  = allCards.slice(3, 6)
  const descArr  = (item.desc as string)?.split("#").filter(Boolean) ?? []
  return {
    roundId: item.mid,
    winner:  item.winner,
    cards:   { "Player A": playerA, "Player B": playerB },
    desc:    descArr,
    time:    item.time,
  }
}

const RoundDetailModal = ({ isOpen, onClose, roundId, game, t3Item }: Props) => {
  const { data: apiData, isLoading } = useGetRoundDetailQuery(
    { game, roundId },
    { skip: !isOpen || !roundId }
  )

  if (!isOpen) return null

  // API data first, t3 fallback second
  const data = apiData ?? parseT3(t3Item)

  return (
    <div className="round-detail-overlay" onClick={onClose}>
      <div className="round-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>20-20 Teenpatti Result</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {isLoading && !data ? (
          <div className="loading-state">Loading...</div>
        ) : data ? (
          <>
            {/* Round ID */}
            <div className="round-id-section">
              Round ID: <strong>{data.roundId}</strong>
            </div>

            {/* Cards Section */}
            <div className="cards-section">
              {(["Player A", "Player B"] as const).map(player => (
                <div key={player} className="player-cards">
                  <div className="player-header">
                    <div className={`player-label ${data.winner === player ? "player-label--winner" : ""}`}>
                      {player}
                    </div>
                    {data.winner === player && <div className="trophy-icon">🏆</div>}
                  </div>
                  <div className="cards-row">
                    {(data.cards[player] ?? []).map((card: string, idx: number) => (
                      <img
                        key={idx}
                        src={getCardImage(card)}
                        alt={`${player} card ${idx + 1}`}
                        className="card-image"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Winner Banner */}
            <div className={`winner-banner ${data.winner === "Player A" ? "winner-banner--a" : "winner-banner--b"}`}>
              🏆 Winner: {data.winner}
            </div>

            {/* Description */}
            {data.desc && data.desc.length > 0 && (
              <div className="description-section">
                <div className="desc-list">
                  {data.desc.map((item: string, idx: number) => (
                    <div key={idx} className="desc-item">{item}</div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="error-state">No data available for this round</div>
        )}
      </div>
    </div>
  )
}

export default RoundDetailModal
