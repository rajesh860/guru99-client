import React from "react";
import cardA from "../../../../public/casino/CARD 1.png";
import "./CardGameBoard.scss";
import { FaLock } from "react-icons/fa";

type Props = {
  modalVisible?: boolean;
  setModalVisible?: (visible: boolean) => void;
  t2Data?: any[];
  liabilityData?: any[];
  onRateClick?: (item: any) => void;
  countdown?: string;
};

const CardGameBoard: React.FC<Props> = ({ 
  modalVisible = false, 
  setModalVisible,
  t2Data = [],
  liabilityData = [],
  onRateClick,
  countdown = "00:00"
}) => {
  
  // Helper function to get t2 data by sid
  const getT2BySid = (sid: string) => {
    const item = t2Data.find(item => item.sid === sid);
    console.log(`Getting t2 data for sid ${sid}:`, item);
    return item;
  };

  // Helper function to get liability by sid
  const getLiabilityBySid = (sid: string) => {
    const liability = liabilityData.find(item => item.sid === sid);
    return liability?.liability || 0;
  };

  // Helper function to handle bet clicks
  const handleBetClick = (item: any, isBack: boolean = true) => {
    if (item?.gstatus === "ACTIVE") {
      const betData = {
        ...item,
        isBack,
        rate: isBack ? item.b1 : item.l1
      };
      onRateClick?.(betData);
    }
  };

  // Check if betting is locked (countdown is 00:00 or gstatus is not ACTIVE)
  const isBettingLocked = countdown === "00:00";

  // Main betting options (Amar, Akbar, Anthony)
  const mainBets = [
    getT2BySid("1"), // Amar
    getT2BySid("2"), // Akbar  
    getT2BySid("3")  // Anthony
  ];

  console.log('t2Data received:', t2Data);
  console.log('mainBets:', mainBets);

  // Fancy betting options
  const evenOdd = [getT2BySid("4"), getT2BySid("5")]; // Even, Odd
  const redBlack = [getT2BySid("6"), getT2BySid("7")]; // Red, Black

  return (
    <div className="game-wrapper">
      {/* Top Bar */}
      <div className="top-bar">
        <span>MIN: {mainBets[0]?.min || 100}</span>
        <span>MAX: {mainBets[0]?.max || 25000}</span>
      </div>

      {/* Table */}
      <table className="grid">
        <tbody>
          {/* Row 1 - Main Bets (Amar, Akbar, Anthony) */}
          <tr>
            {mainBets.map((bet, index) => {
              const liability = getLiabilityBySid(bet?.sid);
              const labels = ["A.AMAR", "A.AKBAR", "C.ANTHONY"];
              
              return (
                <td key={bet?.sid || index} className="cell">
                  <div className="label">{labels[index]}</div>
                  <div className="value" style={{
                    color: liability > 0 ? "green" : liability < 0 ? "red" : "#666"
                  }}>
                    {liability || 0}
                  </div>
                  <div className="btn-dv">
                    <div 
                      className={`bet-btn ${(!bet || bet.gstatus !== "ACTIVE" || isBettingLocked) ? "locked" : ""}`}
                      onClick={() => handleBetClick(bet, true)}
                      style={{ position: "relative" }}
                    >
                      {(!bet || bet.gstatus !== "ACTIVE" || isBettingLocked) && (
                        <div className="lock-overlay">
                          <FaLock />
                        </div>
                      )}
                      {bet?.b1 && bet?.b1 !== "0" ? bet.b1 : "0.00"}
                    </div>
                    <div 
                      className={`bet-btn ${(!bet || bet.gstatus !== "ACTIVE" || isBettingLocked) ? "locked" : ""}`}
                      onClick={() => handleBetClick(bet, false)}
                      style={{ position: "relative" }}
                    >
                      {(!bet || bet.gstatus !== "ACTIVE" || isBettingLocked) && (
                        <div className="lock-overlay">
                          <FaLock />
                        </div>
                      )}
                      {bet?.l1 && bet?.l1 !== "0" && bet?.l1 !== "0.00" ? bet.l1 : "--"}
                    </div>
                  </div>
                </td>
              );
            })}
          </tr>

          {/* Row 2 - Even/Odd */}
          <tr>
            <td className="cell">
              <div className="value" style={{
                color: getLiabilityBySid("4") > 0 ? "green" : getLiabilityBySid("4") < 0 ? "red" : "#666"
              }}>
                {getLiabilityBySid("4") || 0}
              </div>
              <div 
                className={`bet-btn ${(!evenOdd[0] || evenOdd[0].gstatus !== "ACTIVE" || isBettingLocked) ? "locked" : ""}`}
                onClick={() => handleBetClick(evenOdd[0], true)}
                style={{ position: "relative" }}
              >
                {(!evenOdd[0] || evenOdd[0].gstatus !== "ACTIVE" || isBettingLocked) && (
                  <div className="lock-overlay">
                    <FaLock />
                  </div>
                )}
                EVEN
              </div>
              <div className="value" style={{ marginTop: "5px" }}>{evenOdd[0]?.b1 || "0.00"}</div>
            </td>

            <td className="center-cell" />

            <td className="cell">
              <div className="value" style={{
                color: getLiabilityBySid("5") > 0 ? "green" : getLiabilityBySid("5") < 0 ? "red" : "#666"
              }}>
                {getLiabilityBySid("5") || 0}
              </div>
              <div 
                className={`bet-btn ${(!evenOdd[1] || evenOdd[1].gstatus !== "ACTIVE" || isBettingLocked) ? "locked" : ""}`}
                onClick={() => handleBetClick(evenOdd[1], true)}
                style={{ position: "relative" }}
              >
                {(!evenOdd[1] || evenOdd[1].gstatus !== "ACTIVE" || isBettingLocked) && (
                  <div className="lock-overlay">
                    <FaLock />
                  </div>
                )}
                ODD
              </div>
              <div className="value" style={{ marginTop: "5px" }}>{evenOdd[1]?.b1 || "0.00"}</div>
            </td>
          </tr>

          {/* Row 3 - Red/Black */}
          <tr>
            <td className="cell">
              <div className="value" style={{
                color: getLiabilityBySid("6") > 0 ? "green" : getLiabilityBySid("6") < 0 ? "red" : "#666"
              }}>
                {getLiabilityBySid("6") || 0}
              </div>
              <div 
                className={`bet-btn ${(!redBlack[0] || redBlack[0].gstatus !== "ACTIVE" || isBettingLocked) ? "locked" : ""}`}
                onClick={() => handleBetClick(redBlack[0], true)}
                style={{ position: "relative" }}
              >
                {(!redBlack[0] || redBlack[0].gstatus !== "ACTIVE" || isBettingLocked) && (
                  <div className="lock-overlay">
                    <FaLock />
                  </div>
                )}
                RED
              </div>
              <div className="value" style={{ marginTop: "5px" }}>{redBlack[0]?.b1 || "0.00"}</div>
            </td>

            <td className="center-cell" />

            <td className="cell">
              <div className="value" style={{
                color: getLiabilityBySid("7") > 0 ? "green" : getLiabilityBySid("7") < 0 ? "red" : "#666"
              }}>
                {getLiabilityBySid("7") || 0}
              </div>
              <div 
                className={`bet-btn ${(!redBlack[1] || redBlack[1].gstatus !== "ACTIVE" || isBettingLocked) ? "locked" : ""}`}
                onClick={() => handleBetClick(redBlack[1], true)}
                style={{ position: "relative" }}
              >
                {(!redBlack[1] || redBlack[1].gstatus !== "ACTIVE" || isBettingLocked) && (
                  <div className="lock-overlay">
                    <FaLock />
                  </div>
                )}
                BLACK
              </div>
              <div className="value" style={{ marginTop: "5px" }}>{redBlack[1]?.b1 || "0.00"}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CardGameBoard;
