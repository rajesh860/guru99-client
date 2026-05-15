import React, { useEffect } from "react";
import "./ResultModal.scss";
import { useGetCasinoResultByRoundIdMutation } from "../../../../store/service/casino/casinoServices";
import resultCard from "../../../../public/casino/resultCard.png"

// Add some inline styles for better card display
const cardStyles = {
  card: {
    position: 'relative' as const,
    textAlign: 'center' as const,
  },
  cardLabel: {
    position: 'absolute' as const,
    top: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#333',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    zIndex: 1,
  }
};
const ResultModal = ({ open, setOpen, onClose, tableId, mid }: any) => {
  const [trigger, { data: resultData, isLoading, error }] = useGetCasinoResultByRoundIdMutation();

  useEffect(() => {
    if (open && mid) {
      trigger(mid);
    }
  }, [open, mid, trigger]);

  if (!open) return null;

  const handleClose = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    if (setOpen) return setOpen(false);
    if (onClose) return onClose();
  };

  return (
    <div className="result-modal-overlay" onClick={handleClose}>
      
      <div className="result-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="close-btn" onClick={handleClose}>×</button>

        {/* Header */}
        <div className="modal-header">
          {tableId ? `${tableId} - Result` : "DT20 - Result"}
        </div>

        {/* Content */}
        <div className="modal-body">
          <div className="round-id">
            Round Id: {mid || "--"}
          </div>

          {isLoading ? (
            <div className="loading" style={{ textAlign: 'center', padding: '20px' }}>
              Loading result...
            </div>
          ) : error ? (
            <div className="error" style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
              Error loading result
            </div>
          ) : resultData?.data?.[0] ? (
            <>
              <div className="cards">
                {(() => {
                  const cards = resultData.data[0].cards?.split(',') || [];
                  const dragonCard = cards[0] || '';
                  const tigerCard = cards[1] || '';
                  
                  return (
                    <>
                      <div className="card" style={cardStyles.card}>
                        {/* <div className="card-label" style={cardStyles.cardLabel}>DRAGON</div> */}
                        {dragonCard ? (
                          <img 
                            src={`https://versionobj.ecoassetsservice.com/v14/static/front/img/cards/${dragonCard.includes("HH") ? dragonCard.replace(/HH/, "SS") : dragonCard.includes("SS") ? dragonCard.replace(/SS/, "DD") : dragonCard.includes("DD") ? dragonCard.replace(/DD/, "HH") : dragonCard}.jpg`}
                            alt={dragonCard}
                            onError={(e) => {
                              e.currentTarget.src = resultCard;
                            }}
                          />
                        ) : (
                          <img src={resultCard} alt="Card" />
                        )}
                      </div>

                      <div className="card" style={cardStyles.card}>
                        {/* <div className="card-label" style={cardStyles.cardLabel}>TIGER</div> */}
                        {tigerCard ? (
                          <img 
                            src={`https://versionobj.ecoassetsservice.com/v14/static/front/img/cards/${tigerCard.includes("HH") ? tigerCard.replace(/HH/, "SS") : tigerCard.includes("SS") ? tigerCard.replace(/SS/, "DD") : tigerCard.includes("DD") ? tigerCard.replace(/DD/, "HH") : tigerCard}.jpg`}
                            alt={tigerCard}
                            onError={(e) => {
                              e.currentTarget.src = resultCard;
                            }}
                          />
                        ) : (
                          <img src={resultCard} alt="Card" />
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="result">
                <span className="label">Result:</span>
                <span className="value" style={{
                  color: resultData.data[0].win === '1' ? '#28a745' : 
                         resultData.data[0].win === '2' ? '#dc3545' : 
                         '#ffc107'
                }}>
                  {resultData.data[0].win === '1' ? 'DRAGON' : 
                   resultData.data[0].win === '2' ? 'TIGER' : 
                   'TIE'}
                </span>
              </div>

              <div className="result-details" style={{ marginTop: '15px', fontSize: '14px' }}>
                <div className="new-desc">
                  <span className="label">Details:</span>
                  <div style={{ marginTop: '5px' }}>
                    {resultData.data[0].newdesc?.split('#').map((detail, index) => (
                      <div key={index} style={{ padding: '2px 0' }}>
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="match-time" style={{ marginTop: '10px', color: '#666' }}>
                  Time: {resultData.data[0].mtime}
                </div>
              </div>
            </>
          ) : (
            <div className="no-data" style={{ textAlign: 'center', padding: '20px' }}>
              No result data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultModal;