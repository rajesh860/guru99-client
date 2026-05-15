import React, { useEffect } from "react";
import "./ResultModal.scss";
import resultCard from "../../../../public/casino/resultCard.png"
import { useGetCasinoResultByRoundIdMutation } from "../../../../store/service/casino/casinoServices"
const ResultModal = ({ open, setOpen, onClose, tableId, mid }: any) => {
  const [trigger, { data: resultData, isLoading, error }] = useGetCasinoResultByRoundIdMutation()

  // Fetch result when mid changes and modal is open
  useEffect(() => {
    if (open && mid) {
      trigger(mid)
    }
  }, [open, mid, trigger])

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

          {isLoading && (
            <div className="loading-state" style={{ 
              textAlign: 'center', 
              padding: '20px',
              color: '#666' 
            }}>
              Loading result...
            </div>
          )}

          {error && (
            <div className="error-state" style={{ 
              textAlign: 'center', 
              padding: '20px',
              color: '#dc3545' 
            }}>
              Error loading result. Please try again.
            </div>
          )}

          {resultData?.data && !isLoading && (
            <>
              <div className="cards">
                {resultData.data.map((item: any, index: number) => (
                  <div key={index} className="card">
                    <img 
                      src={`https://versionobj.ecoassetsservice.com/v14/static/front/img/cards/${item.cards}.jpg`}
                      alt={`Result Card ${item.cards}`} 
                      onError={(e) => {
                        e.currentTarget.src = resultCard;
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="result">
                <span className="label">Result:</span>
                <span className="value" style={{
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}>
                  {resultData.data[0]?.win === "1" ? "LOW" : resultData.data[0]?.win === "2" ? "HIGH" : "TIE"}
                </span>
              </div>

              {/* Card details */}
              <div className="card-details" style={{
                marginTop: '15px',
                padding: '10px',
                background: '#f8f9fa',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                  Card: {resultData.data[0]?.cards}
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  {resultData.data[0]?.desc}
                </div>
              </div>

              {/* Game info */}
              <div className="game-info" style={{
                marginTop: '10px',
                fontSize: '12px',
                color: '#6c757d',
                textAlign: 'center'
              }}>
                {/* <div>Round: {resultData.data[0]?.mid}</div> */}
                <div>Time: {resultData.data[0]?.mtime}</div>
                <div>Game: {resultData.data[0]?.gtype?.toUpperCase()}</div>
              </div>
            </>
          )}

          {/* Fallback content when no data */}
          {!resultData?.data && !isLoading && !error && (
            <>
              <div className="cards">
                <div className="card">
                  <img src={resultCard} alt="Result Card" />
                </div>
                <div className="card">
                  <img src={resultCard} alt="Result Card" />
                </div>
              </div>

              <div className="result">
                <span className="label">Result:</span>
                <span className="value">LUCKY 7</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
