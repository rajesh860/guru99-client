import React from "react"
import cardA from "../../../../public/casino/CARD 1.png"
import "./CardGameBoard.scss"
import { FaLock } from "react-icons/fa"

type Props = {
  modalVisible?: boolean;
  setModalVisible?: (visible: boolean) => void;
  t2Data?: any[];
  liabilityData?: any[];
  onRateClick?: (item: any) => void;
  countdown?: string;
  /** Remaining seconds of the round; used to pre-empt the backend suspend. */
  roundSeconds?: number;
};

const CardGameBoard: React.FC<Props> = ({
  modalVisible = false,
  setModalVisible,
  t2Data = [],
  liabilityData = [],
  onRateClick,
  countdown = "00:00",
  roundSeconds
}) => {
  // Within 2s of the round ending, suspend the whole board (frontend pre-empt).
  const roundSuspended = roundSeconds != null && roundSeconds <= 2;
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
    if (roundSuspended) return;
    if (onRateClick && item.gstatus === "OPEN") {
      onRateClick(item);
    } else {
      setModalVisible?.(true);
    }
  };

  return (
    <div className={`game-wrapper ${roundSuspended ? "round-suspended" : ""}`}>
      <div className="top-bar">
        <span>MIN: 100</span>
        <span>MAX: 25000</span>
       
      </div>

      <table className="grid">
        <tbody>
          {/* Andar Section */}
          <tr>
            <td colSpan={3} className="text-center ng-scope" style={{padding: ".75rem"}}>
              <div className="w-100 text-uppercase ng-binding">ANDAR</div>
            </td>
          </tr>
          <tr>
            <td className="cell">
              <div 
                className="value" 
                style={{
                  color: getLiability(getBetOption("Ander A")?.sid) > 0 ? "green" : "red"
                }}
              >
                {getLiability(getBetOption("Ander A")?.sid) || 0}
              </div>
              <div 
                className={`bet-btn ${getBetOption("Ander A")?.gstatus !== "OPEN" ? 'suspended' : ''}`}
                onClick={() => handleBetClick(getBetOption("Ander A"))}
                style={{ position: 'relative' }}
              >
                1ST BET
                {getBetOption("Ander A")?.gstatus !== "OPEN" && (
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
                    <FaLock color="white" size={14} />
                  </div>
                )}
              </div>
              <div className="value" style={{marginTop:"4px",color:"black"}}>
                {getBetOption("Ander A")?.rate || "0.00"}
              </div>
            </td>
            <td className="cell">
              <div 
                className="value" 
                style={{
                  color: getLiability(getBetOption("Ander 2")?.sid) > 0 ? "green" : "red"
                }}
              >
                {getLiability(getBetOption("Ander 2")?.sid) || 0}
              </div>
              <div 
                className={`bet-btn ${getBetOption("Ander 2")?.gstatus !== "OPEN" ? 'suspended' : ''}`}
                onClick={() => handleBetClick(getBetOption("Ander 2"))}
                style={{ position: 'relative' }}
              >
                2ND BET
                {getBetOption("Ander 2")?.gstatus !== "OPEN" && (
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
                    <FaLock color="white" size={14} />
                  </div>
                )}
              </div>
              <div className="value" style={{marginTop:"4px",color:"black"}}>
                {getBetOption("Ander 2")?.rate || "0.00"}
              </div>
            </td>
            <td className="cell">
              <div 
                className="value" 
                style={{
                  color: getLiability(getBetOption("Ander 3")?.sid) > 0 ? "green" : "red"
                }}
              >
                {getLiability(getBetOption("Ander 3")?.sid) || 0}
              </div>
              <div 
                className={`bet-btn ${getBetOption("Ander 3")?.gstatus !== "OPEN" ? 'suspended' : ''}`}
                onClick={() => handleBetClick(getBetOption("Ander 3"))}
                style={{ position: 'relative' }}
              >
                3RD BET
                {getBetOption("Ander 3")?.gstatus !== "OPEN" && (
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
                    <FaLock color="white" size={14} />
                  </div>
                )}
              </div>
              <div className="value" style={{marginTop:"4px",color:"black"}}>
                {getBetOption("Ander 3")?.rate || "0.00"}
              </div>
            </td>
          </tr>

          {/* Bahar Section */}
          <tr>
            <td colSpan={3} className="text-center ng-scope" style={{padding: ".75rem"}}>
              <div className="w-100 text-uppercase ng-binding">BAHAR</div>
            </td>
          </tr>
          <tr>
            <td className="cell">
              <div 
                className="value" 
                style={{
                  color: getLiability(getBetOption("Bahar A")?.sid) > 0 ? "green" : "red"
                }}
              >
                {getLiability(getBetOption("Bahar A")?.sid) || 0}
              </div>
              <div 
                className={`bet-btn ${getBetOption("Bahar A")?.gstatus !== "OPEN" ? 'suspended' : ''}`}
                onClick={() => handleBetClick(getBetOption("Bahar A"))}
                style={{ position: 'relative' }}
              >
                1ST BET
                {getBetOption("Bahar A")?.gstatus !== "OPEN" && (
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
                    <FaLock color="white" size={14} />
                  </div>
                )}
              </div>
              <div className="value" style={{marginTop:"4px",color:"black"}}>
                {getBetOption("Bahar A")?.rate || "0.00"}
              </div>
            </td>
            <td className="cell">
              <div 
                className="value" 
                style={{
                  color: getLiability(getBetOption("Bahar 2")?.sid) > 0 ? "green" : "red"
                }}
              >
                {getLiability(getBetOption("Bahar 2")?.sid) || 0}
              </div>
              <div 
                className={`bet-btn ${getBetOption("Bahar 2")?.gstatus !== "OPEN" ? 'suspended' : ''}`}
                onClick={() => handleBetClick(getBetOption("Bahar 2"))}
                style={{ position: 'relative' }}
              >
                2ND BET
                {getBetOption("Bahar 2")?.gstatus !== "OPEN" && (
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
                    <FaLock color="white" size={14} />
                  </div>
                )}
              </div>
              <div className="value" style={{marginTop:"4px",color:"black"}}>
                {getBetOption("Bahar 2")?.rate || "0.00"}
              </div>
            </td>
            <td className="cell">
              <div 
                className="value" 
                style={{
                  color: getLiability(getBetOption("Bahar 3")?.sid) > 0 ? "green" : "red"
                }}
              >
                {getLiability(getBetOption("Bahar 3")?.sid) || 0}
              </div>
              <div 
                className={`bet-btn ${getBetOption("Bahar 3")?.gstatus !== "OPEN" ? 'suspended' : ''}`}
                onClick={() => handleBetClick(getBetOption("Bahar 3"))}
                style={{ position: 'relative' }}
              >
                3RD BET
                {getBetOption("Bahar 3")?.gstatus !== "OPEN" && (
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
                    <FaLock color="white" size={14} />
                  </div>
                )}
              </div>
              <div className="value" style={{marginTop:"4px",color:"black"}}>
                {getBetOption("Bahar 3")?.rate || "0.00"}
              </div>
            </td>
          </tr>

          {/* Additional betting options row */}
          <tr>
            <td className="cell">
              <div 
                className="value" 
                style={{
                  color: getLiability(getBetOption("Ander 4")?.sid) > 0 ? "green" : "red"
                }}
              >
                {getLiability(getBetOption("Ander 4")?.sid) || 0}
              </div>
              <div 
                className={`bet-btn ${getBetOption("Ander 4")?.gstatus !== "OPEN" ? 'suspended' : ''}`}
                onClick={() => handleBetClick(getBetOption("Ander 4"))}
                style={{ position: 'relative' }}
              >
                EVEN
                {getBetOption("Ander 4")?.gstatus !== "OPEN" && (
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
                    <FaLock color="white" size={14} />
                  </div>
                )}
              </div>
              <div className="value" style={{marginTop:"4px",color:"black"}}>
                {getBetOption("Ander 4")?.rate || "0.00"}
              </div>
            </td>
            <td className="cell" style={{border: 'none'}}>
              {/* Empty cell */}
            </td>
            <td className="cell">
              <div 
                className="value" 
                style={{
                  color: getLiability(getBetOption("Bahar 4")?.sid) > 0 ? "green" : "red"
                }}
              >
                {getLiability(getBetOption("Bahar 4")?.sid) || 0}
              </div>
              <div 
                className={`bet-btn ${getBetOption("Bahar 4")?.gstatus !== "OPEN" ? 'suspended' : ''}`}
                onClick={() => handleBetClick(getBetOption("Bahar 4"))}
                style={{ position: 'relative' }}
              >
                ODD
                {getBetOption("Bahar 4")?.gstatus !== "OPEN" && (
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
                    <FaLock color="white" size={14} />
                  </div>
                )}
              </div>
              <div className="value" style={{marginTop:"4px",color:"black"}}>
                {getBetOption("Bahar 4")?.rate || "0.00"}
              </div>
            </td>
          </tr>

          {/* Card suit betting options */}
          <tr>
            <td className="cell">
              <div 
                className="value" 
                style={{
                  color: getLiability(getBetOption("Ander 5")?.sid) > 0 ? "green" : "red"
                }}
              >
                {getLiability(getBetOption("Ander 5")?.sid) || 0}
              </div>
              <div 
                className={`bet-btn ${getBetOption("Ander 5")?.gstatus !== "OPEN" ? 'suspended' : ''}`}
                onClick={() => handleBetClick(getBetOption("Ander 5"))}
                style={{ position: 'relative' }}
              >
                ♠
                {getBetOption("Ander 5")?.gstatus !== "OPEN" && (
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
                    <FaLock color="white" size={14} />
                  </div>
                )}
              </div>
              <div className="value" style={{marginTop:"4px",color:"black"}}>
                {getBetOption("Ander 5")?.rate || "0.00"}
              </div>
            </td>
            <td className="cell" style={{border: 'none'}}>
              {/* Empty cell */}
            </td>
            <td className="cell">
              <div 
                className="value" 
                style={{
                  color: getLiability(getBetOption("Bahar 5")?.sid) > 0 ? "green" : "red"
                }}
              >
                {getLiability(getBetOption("Bahar 5")?.sid) || 0}
              </div>
              <div 
                className={`bet-btn ${getBetOption("Bahar 5")?.gstatus !== "OPEN" ? 'suspended' : ''}`}
                onClick={() => handleBetClick(getBetOption("Bahar 5"))}
                style={{ position: 'relative' }}
              >
                ♥
                {getBetOption("Bahar 5")?.gstatus !== "OPEN" && (
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
                    <FaLock color="white" size={14} />
                  </div>
                )}
              </div>
              <div className="value" style={{marginTop:"4px",color:"black"}}>
                {getBetOption("Bahar 5")?.rate || "0.00"}
              </div>
            </td>
          </tr>

          <tr>
            <td className="cell">
              <div 
                className="value" 
                style={{
                  color: getLiability(getBetOption("Ander 6")?.sid) > 0 ? "green" : "red"
                }}
              >
                {getLiability(getBetOption("Ander 6")?.sid) || 0}
              </div>
              <div 
                className={`bet-btn ${getBetOption("Ander 6")?.gstatus !== "OPEN" ? 'suspended' : ''}`}
                onClick={() => handleBetClick(getBetOption("Ander 6"))}
                style={{ position: 'relative' }}
              >
                ♣
                {getBetOption("Ander 6")?.gstatus !== "OPEN" && (
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
                    <FaLock color="white" size={14} />
                  </div>
                )}
              </div>
              <div className="value" style={{marginTop:"4px",color:"black"}}>
                {getBetOption("Ander 6")?.rate || "0.00"}
              </div>
            </td>
            <td className="cell" style={{border: 'none'}}>
              {/* Empty cell */}
            </td>
            <td className="cell">
              <div 
                className="value" 
                style={{
                  color: getLiability(getBetOption("Bahar 6")?.sid) > 0 ? "green" : "red"
                }}
              >
                {getLiability(getBetOption("Bahar 6")?.sid) || 0}
              </div>
              <div 
                className={`bet-btn ${getBetOption("Bahar 6")?.gstatus !== "OPEN" ? 'suspended' : ''}`}
                onClick={() => handleBetClick(getBetOption("Bahar 6"))}
                style={{ position: 'relative' }}
              >
                ♦
                {getBetOption("Bahar 6")?.gstatus !== "OPEN" && (
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
                    <FaLock color="white" size={14} />
                  </div>
                )}
              </div>
              <div className="value" style={{marginTop:"4px",color:"black"}}>
                {getBetOption("Bahar 6")?.rate || "0.00"}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default CardGameBoard
