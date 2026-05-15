import React, { useEffect } from "react";
import "./ResultModal.scss";
import { useGetCasinoResultByRoundIdMutation } from "../../../../store/service/casino/casinoServices";
import resultCard from "../../../../public/casino/resultCard.png"

// Card mapping for AAA
const getCardImage = (cardValue: string) => {
  if (!cardValue) return '?';
  
  // Handle format like "3SS", "4DD", "JHH", "KCC", etc.
  const value = cardValue.slice(0, -2); // Remove last 2 characters (suit)
  const suitCode = cardValue.slice(-2); // Get last 2 characters (suit)
  
  // Map suit codes to symbols
  const suitMap: { [key: string]: string } = {
    'SS': '♠', // Spades
    'HH': '♥', // Hearts  
    'DD': '♦', // Diamonds
    'CC': '♣'  // Clubs
  };
  
  const mappedValue = value;
  const mappedSuit = suitMap[suitCode] || suitCode;
  
  return `${mappedValue}${mappedSuit}`;
};

// Result mapping for AAA: 1 → A, 2 → B, 3 → C
const getResultLabel = (result: string) => {
  switch(result) {
    case "1": return "A (Amar)"
    case "2": return "B (Akbar)" 
    case "3": return "C (Anthony)"
    default: return result || "N/A"
  }
};

const ResultModal = ({ open, setOpen, onClose, tableId, mid, result,first }: any) => {
  const [trigger, { data: resultData, isLoading, error }] = useGetCasinoResultByRoundIdMutation();

  useEffect(() => {
    if (open && mid?.mid) {
      trigger(mid?.mid);
    }
  }, [open, mid, trigger]);

  if (!open) return null;

  const handleClose = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    if (setOpen) return setOpen(false);
    if (onClose) return onClose();
  };

  // Get result details from API response
  const resultDetails = resultData?.data?.[0] || {};
  const cardValue = resultDetails?.cards || "";

  return (
    <div className="result-modal-overlay" onClick={handleClose}>
      
      <div className="result-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="close-btn" onClick={handleClose}>×</button>

        {/* Header */}
        <div className="modal-header">
          AAA CASINO - Result
        </div>

        {/* Content */}
        <div className="modal-body">
          <div className="round-id">
            Round Id: {result?.mid || resultDetails?.mid || "--"}
          </div>

          {isLoading ? (
            <div className="loading">Loading result...</div>
          ) : error ? (
            <div className="error">Failed to load result</div>
          ) : (
            <>
              <div className="cards">
                <div className="card">
                  <img 
                    src={cardValue ? 
                      `https://versionobj.ecoassetsservice.com/v14/static/front/img/cards/${cardValue.includes("HH") ? cardValue.replace(/HH/, "SS") : cardValue.includes("SS") ? cardValue.replace(/SS/, "DD") : cardValue.includes("DD") ? cardValue.replace(/DD/, "HH") : cardValue}.jpg` 
                      : resultCard
                    } 
                    alt="Result Card" 
                  />
                </div>
              </div>

              <div className="result">
                <span className="label">Result:</span>
                <span className="value">
                  {getResultLabel(resultDetails?.win || result?.result)}
                </span>
              </div>
              
              <div className="game-info">
                <div>Game Type: {resultDetails?.gtype?.toUpperCase() || 'AAA'}</div>
                <div>Time: {resultDetails?.mtime || '--'}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
