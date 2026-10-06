import React from "react";
// import cardA from "../../../../public/casino/CARD 7.png";
import "./CardGameBoard.scss";
import { FaLock } from "react-icons/fa";

type Props = {
  modalVisible?: boolean;
  setModalVisible?: (visible: boolean) => void;
  t2Data?: any[];
  liabilityData?: any[];
  onRateClick?: (item: any) => void;
};

const CardGameBoard: React.FC<Props> = ({ 
  modalVisible = false, 
  setModalVisible, 
  t2Data = [], 
  liabilityData = [],
  onRateClick 
}) => {
  // Helper function to get betting option by nation name
  const getBetOption = (nationName: string) => {
    return t2Data.find(item => item.nation === nationName) || {};
  };

  // Helper function to get liability by sid
  const getLiability = (sid: string) => {
    const liability = liabilityData?.find(item => item?.sid === sid)?.liability || 0;
    return liability;
  };

  const handleBetClick = (item: any) => {
    if (onRateClick && item.gstatus === "OPEN") {
      onRateClick(item);
    } else {
      setModalVisible?.(true);
    }
  };

  return (
    <div className="game-wrapper">
      {/* Top Bar */}
      <div className="top-bar">
        <span>MIN: 100</span>
        <span>MAX: 10000</span>
      </div>

      {/* Table */}
      <table className="grid">
        <tbody>
          {/* Row 1 */}
          <tr>
            <td className="cell">
              <div 
                className="value" 
                style={{
                  color: getLiability(getBetOption("LOW Card")?.sid) > 0 ? "green" : "red"
                }}
              >
                {getBetOption("LOW Card")?.rate || "0.00"}
              </div>
              <div 
                className={`bet-btn ${getBetOption("LOW Card")?.gstatus !== "OPEN" ? 'suspended' : ''}`}
                onClick={() => handleBetClick(getBetOption("LOW Card"))}
                style={{ position: 'relative' }}
              >
                LOW CARD
                {getBetOption("LOW Card")?.gstatus !== "OPEN" && (
                  <div className="overlay" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'inherit'
                  }}>
                    <FaLock color="white" size={16} />
                  </div>
                )}
              </div>
            </td>

            <td className="center-cell">
              <div className="center-card">
                {/* <img src={cardA} alt="Lucky 7 Card" /> */}
              </div>
            </td>

            <td className="cell">
              <div 
                className="value" 
                style={{
                  color: getLiability(getBetOption("HIGH Card")?.sid) > 0 ? "green" : "red"
                }}
              >
                {getBetOption("HIGH Card")?.rate || "0.00"}
              </div>
              <div 
                className={`bet-btn ${getBetOption("HIGH Card")?.gstatus !== "OPEN" ? 'suspended' : ''}`}
                onClick={() => handleBetClick(getBetOption("HIGH Card"))}
                style={{ position: 'relative' }}
              >
                HIGH CARD
                {getBetOption("HIGH Card")?.gstatus !== "OPEN" && (
                  <div className="overlay" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'inherit'
                  }}>
                    <FaLock color="white" size={16} />
                  </div>
                )}
              </div>
            </td>
          </tr>

          {/* Row 2 */}
          <tr>
            <td className="cell">
              <div 
                className="value" 
                style={{
                  color: getLiability(getBetOption("Even")?.sid) > 0 ? "green" : "red"
                }}
              >
                {getBetOption("Even")?.rate || "0.00"}
              </div>
              <div 
                className={`bet-btn ${getBetOption("Even")?.gstatus !== "OPEN" ? 'suspended' : ''}`}
                onClick={() => handleBetClick(getBetOption("Even"))}
                style={{ position: 'relative' }}
              >
                EVEN
                {getBetOption("Even")?.gstatus !== "OPEN" && (
                  <div className="overlay" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'inherit'
                  }}>
                    <FaLock color="white" size={16} />
                  </div>
                )}
              </div>
            </td>

            <td className="center-cell" />

            <td className="cell">
              <div 
                className="value" 
                style={{
                  color: getLiability(getBetOption("Odd")?.sid) > 0 ? "green" : "red"
                }}
              >
                {getBetOption("Odd")?.rate || "0.00"}
              </div>
              <div 
                className={`bet-btn ${getBetOption("Odd")?.gstatus !== "OPEN" ? 'suspended' : ''}`}
                onClick={() => handleBetClick(getBetOption("Odd"))}
                style={{ position: 'relative' }}
              >
                ODD
                {getBetOption("Odd")?.gstatus !== "OPEN" && (
                  <div className="overlay" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'inherit'
                  }}>
                    <FaLock color="white" size={16} />
                  </div>
                )}
              </div>
            </td>
          </tr>

          {/* Row 3 */}
          <tr>
            <td className="cell">
              <div 
                className="value" 
                style={{
                  color: getLiability(getBetOption("Red")?.sid) > 0 ? "green" : "red"
                }}
              >
                {getBetOption("Red")?.rate || "0.00"}
              </div>
              <div 
                className={`bet-btn ${getBetOption("Red")?.gstatus !== "OPEN" ? 'suspended' : ''}`}
                onClick={() => handleBetClick(getBetOption("Red"))}
                style={{ position: 'relative' }}
              >
                RED
                {getBetOption("Red")?.gstatus !== "OPEN" && (
                  <div className="overlay" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'inherit'
                  }}>
                    <FaLock color="white" size={16} />
                  </div>
                )}
              </div>
            </td>

            <td className="center-cell" />

            <td className="cell">
              <div 
                className="value" 
                style={{
                  color: getLiability(getBetOption("Black")?.sid) > 0 ? "green" : "red"
                }}
              >
                {getBetOption("Black")?.rate || "0.00"}
              </div>
              <div 
                className={`bet-btn ${getBetOption("Black")?.gstatus !== "OPEN" ? 'suspended' : ''}`}
                onClick={() => handleBetClick(getBetOption("Black"))}
                style={{ position: 'relative' }}
              >
                BLACK
                {getBetOption("Black")?.gstatus !== "OPEN" && (
                  <div className="overlay" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'inherit'
                  }}>
                    <FaLock color="white" size={16} />
                  </div>
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CardGameBoard;
