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

const parseT3 = (item: any) => {
  if (!item) return null
  return {
    roundId: item.mid,
    winner: item.winner ?? "",
    dragonCard: item.C1 ?? item.c1 ?? "",
    tigerCard: item.C2 ?? item.c2 ?? "",
    time: item.time,
  }
}

const DT20RoundDetailModal = ({ isOpen, onClose, roundId, t3Item }: Props) => {
  const { data: apiData, isLoading } = useGetRoundDetailQuery(
    { game: "dt20", roundId },
    { skip: !isOpen || !roundId }
  )

  if (!isOpen) return null

  const t3Parsed = parseT3(t3Item)

  // API: cards.cards = [dragonCard, tigerCard]
  const winner = apiData?.winner ?? t3Parsed?.winner ?? ""
  const dragonCard = apiData?.cards?.cards?.[0] ?? t3Parsed?.dragonCard ?? ""
  const tigerCard  = apiData?.cards?.cards?.[1] ?? t3Parsed?.tigerCard  ?? ""
  const roundIdDisplay = apiData?.roundId ?? t3Parsed?.roundId ?? roundId
  const desc: string[] = apiData?.desc ?? []

  const players = [
    { key: "Dragon", card: dragonCard, label: "Dragon" },
    { key: "Tiger",  card: tigerCard,  label: "Tiger"  },
  ]

  return (
    <div className="round-detail-overlay" onClick={onClose}>
      <div className="round-detail-modal" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h3>20-20 Dragon Tiger Result</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {isLoading && !t3Parsed ? (
          <div className="loading-state">Loading...</div>
        ) : (
          <>
            <div className="round-id-section">
              Round ID: <strong>{roundIdDisplay}</strong>
            </div>

            <div className="cards-section">
              {players.map(({ key, card, label }) => (
                <div key={key} className="player-cards">
                  <div className="player-header">
                    <div className={`player-label ${winner === key ? "player-label--winner" : ""}`}>
                      {label}
                    </div>
                    {winner === key && <div className="trophy-icon">🏆</div>}
                  </div>
                  <div className="cards-row">
                    {card ? (
                      <img
                        src={getCardImage(card)}
                        alt={`${label} card`}
                        className="card-image"
                      />
                    ) : (
                      <span style={{ color: "#888", fontSize: 12 }}>—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {winner && (
              <div className={`winner-banner ${
                winner === "Dragon" ? "winner-banner--a" : "winner-banner--b"
              }`}>
                🏆 Winner: {winner}
              </div>
            )}

            {desc.length > 0 && (
              <div className="description-section">
                <div className="desc-list">
                  {desc.map((item, idx) => (
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

export default DT20RoundDetailModal
