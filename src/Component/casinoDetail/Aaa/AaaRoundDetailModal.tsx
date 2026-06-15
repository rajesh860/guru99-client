import { useGetRoundDetailQuery } from "../../../../store/service/teenPattiApi"
import "../teenPatti/RoundDetailModal.scss"
import { getCardImage } from "../../../utils/cardImage"

interface Props {
  isOpen: boolean
  onClose: () => void
  roundId: string
  t3Item?: any
}

const AaaRoundDetailModal = ({ isOpen, onClose, roundId, t3Item }: Props) => {
  const { data: apiData, isLoading } = useGetRoundDetailQuery(
    { game: "aaa", roundId },
    { skip: !isOpen || !roundId }
  )

  if (!isOpen) return null

  // t3: { mid, winner: "Amar"/"Akbar"/"Anthony", cards: "6DD", desc: "Amar#Even#Red#Under 7#6" }
  const winner      = apiData?.winner    ?? t3Item?.winner ?? ""
  const cardCode    = (apiData?.cards as any)?.cards?.[0] ?? t3Item?.cards ?? ""
  const roundIdDisp = apiData?.roundId   ?? t3Item?.mid    ?? roundId
  const descParts   = (t3Item?.desc ?? "").split("#").map((s: string) => s.trim()).filter(Boolean)

  const winnerClass = winner === "Amar" ? "winner-banner--a"
                    : winner === "Akbar" ? "winner-banner--b"
                    : winner === "Anthony" ? "winner-banner--c"
                    : ""

  return (
    <div className="round-detail-overlay" onClick={onClose}>
      <div className="round-detail-modal" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h3>Amar Akbar Anthony Result</h3>
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
                    <img src={getCardImage(cardCode)} alt="card" className="card-image" />
                  ) : (
                    <span style={{ color: "#888", fontSize: 12 }}>—</span>
                  )}
                </div>
              </div>
            </div>

            {winner && (
              <div className={`winner-banner ${winnerClass}`}>
                🏆 Winner: {winner}
              </div>
            )}

            {descParts.length > 0 && (
              <div className="description-section">
                <div className="desc-list">
                  {descParts.map((item: string, idx: number) => (
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

export default AaaRoundDetailModal
