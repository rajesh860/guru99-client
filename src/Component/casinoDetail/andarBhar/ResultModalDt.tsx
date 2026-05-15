import React, { useEffect } from "react";
import "./ResultModal.scss";
import { useGetCasinoResultByRoundIdMutation } from "../../../../store/service/casino/casinoServices";
import resultCard from "../../../../public/casino/resultCard.png"

// Card mapping for AndarBahar - Updated for new API format
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
  
  // Map number/face cards
  const valueMap: { [key: string]: string } = {
    'A': 'A', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', 
    '8': '8', '9': '9', '10': '10', 'J': 'J', 'Q': 'Q', 'K': 'K'
  };
  
  const mappedValue = valueMap[value] || value;
  const mappedSuit = suitMap[suitCode] || suitCode;
  
  return `${mappedValue}${mappedSuit}`;
};

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

const ResultModal = ({ open, setOpen, onClose, tableId, mid, result }: any) => {
  console.log(result,"bjk")
  const [trigger, { data: resultData, isLoading, error }] = useGetCasinoResultByRoundIdMutation();

  useEffect(() => {
    if (open && result?.mid) {
      trigger(result.mid);
    }
  }, [open, result?.mid, trigger]);

  if (!open) return null;

  const handleClose = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    if (setOpen) return setOpen(false);
    if (onClose) return onClose();
  };

  // Get result details from new API format
  const resultDetails = resultData?.data?.[0] || {};
  const cardsString = resultDetails?.cards || "";
  const cardsArray = cardsString ? cardsString.split(",") : [];
  
  // First card is joker, find the winning card based on win value
  const jokerCard = cardsArray[0] || "";
  
  // AndarBahar specific result mapping - Updated for new API
  const getResultText = (winValue: string) => {
    switch(winValue) {
      case '0': return 'ANDAR';
      case '1': return 'BAHAR';
      default: return winValue || 'N/A';
    }
  };
  
  // Get the winning card - logic may need adjustment based on game rules
  const getWinningCard = () => {
    if (cardsArray.length > 1) {
      // Return the card that determined the win
      const winIndex = parseInt(resultDetails?.win || "0");
      // This logic might need adjustment based on actual game rules
      return cardsArray[cardsArray.length - 1] || cardsArray[1];
    }
    return "";
  };

  return (
    <div className="result-modal-overlay" onClick={handleClose}>
      
      <div className="result-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="close-btn" onClick={handleClose}>×</button>

        {/* Header */}
        <div className="modal-header">
          ANDAR BAHAR - Result
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
              {/* Joker Card Display */}
              <div className="joker-section">
                <div className="joker-card">
                  <div className="card-display">
                    {jokerCard ? getCardImage(jokerCard) : '?'}
                  </div>
                </div>
              </div>

              {/* Game Rows - A and B */}
              <div className="game-rows">
                {/* Row A */}
                <div className="game-row">
                  <div className="row-label">A</div>
                  <div className="cards-sequence">
                    {cardsArray.slice(1).map((card, index) => {
                      // Show cards that went to Andar side
                      if (index % 2 === 0 && card !== "*") {
                        return (
                          <div key={index} className="sequence-card">
                            {getCardImage(card)}
                          </div>
                        );
                      }
                      return null;
                    }).filter(Boolean)}
                  </div>
                </div>

                {/* Row B */}
                <div className="game-row">
                  <div className="row-label">B</div>
                  <div className="cards-sequence">
                    {cardsArray.slice(1).map((card, index) => {
                      // Show cards that went to Bahar side
                      if (index % 2 === 1 && card !== "*") {
                        return (
                          <div key={index} className="sequence-card">
                            {getCardImage(card)}
                          </div>
                        );
                      }
                      return null;
                    }).filter(Boolean)}
                  </div>
                </div>
              </div>

              <div className="result-section">
                <span className="result-label">Result:</span>
                <span className="result-value" style={{
                  color: resultDetails?.win === '0' ? '#d4edda' : '#f8d7da',
                  fontWeight: 'bold',
                  marginLeft: '10px'
                }}>
                  {getResultText(resultDetails?.win)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
