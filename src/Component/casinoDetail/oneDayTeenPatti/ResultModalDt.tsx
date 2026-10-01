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

// Result mapping for Teen Patti: 1 → Player A, 2 → Player B
const getResultLabel = (result: string) => {
  switch(result) {
    case "1": return "Player A"
    case "2": return "Player B"
    default: return result || "N/A"
  }
};

const ResultModal = ({ open, setOpen, onClose, tableId, mid, result,first }: any) => {
  console.log(mid,"mid")
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

  // Get result details from API response
  const resultDetails = resultData?.data?.[0] || {};
  const cardsString = resultDetails?.cards || "";
  const cardsArray = cardsString ? cardsString.split(",") : [];
  
  // Split cards: first 3 for Player A, last 3 for Player B
  const playerACards = cardsArray.slice(0, 3);
  const playerBCards = cardsArray.slice(3, 6);

  return (
    <div className="result-modal-overlay" onClick={handleClose}>
      
      <div className="result-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="close-btn" onClick={handleClose}>×</button>

        {/* Header */}
        <div className="modal-header">
          1 Day TeenPatti - Result
        </div>

        {/* Content */}
        <div className="modal-body">
          {isLoading ? (
            <div className="loading">Loading result...</div>
          ) : error ? (
            <div className="error">Failed to load result</div>
          ) : (
            <>
              {/* Round ID */}
              <div className="round-id-display">
                Round Id: {resultDetails?.mid || "--"}
              </div>

              {/* Players Cards in Two Columns */}
              <div className="players-container">
                {/* Left Column - Player A */}
                <div className="player-column">
                  <div className="player-label">Player A</div>
                  <div className="player-cards">
                    {playerACards.map((card, index) => (
                      <div key={index} className="card">
                        <img 
                          src={card ? 
                            `https://versionobj.ecoassetsservice.com/v14/static/front/img/cards/${card}.jpg` 
                            : resultCard
                          } 
                          alt={card}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column - Player B */}
                <div className="player-column">
                  <div className="player-label">Player B</div>
                  <div className="player-cards">
                    {playerBCards.map((card, index) => (
                      <div key={index} className="card">
                        <img 
                          src={card ? 
                            `https://versionobj.ecoassetsservice.com/v14/static/front/img/cards/${card}.jpg` 
                            : resultCard
                          } 
                          alt={card}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Result Winner */}
              <div className="result-winner">
                <span className="result-label">Result:</span>
                <span className={`result-value ${resultDetails?.win === "1" ? "player-a" : "player-b"}`}>
                  {getResultLabel(resultDetails?.win)}
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
