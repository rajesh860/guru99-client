import React, { useState } from "react";
import "./TeamTable.scss";
import BetModal from "../../betPlaceModal2/BetModal";
import { FaLock } from "react-icons/fa";

type Props = {
  oddsData?: any[];
  liabilityData?: any[];
  onRateClick?: (item: any) => void;
  countdown?: number;
};

const TeamTable: React.FC<Props> = ({ 
  oddsData = [], 
  liabilityData = [], 
  onRateClick,
  countdown = 0 
}) => {
  const [betModalVisible, setBetModalVisible] = useState(false);

  // Helper function to get liability by section ID
  const getLiabilityBySectionId = (sectionId: string) => {
    const liability = liabilityData.find(item => item?.sectionId === sectionId || item?.sid === sectionId);
    return liability?.liability || 0;
  };

  // Check if betting is locked
  const isBettingLocked = countdown <= 0;

  const handleBetClick = (item: any, isBack: boolean = true) => {
    if (item?.gstatus === "OPEN" && !isBettingLocked) {
      const betData = {
        ...item,
        isBack,
        rate: isBack ? item.b1 : item.l1
      };
      onRateClick?.(betData);
    }
  };

  return (
    <div className="table-wrapper">
      <table className="team-table">
        <thead>
          <tr>
            <th>
              TEAM
              <div className="sub-text">
                Max-{oddsData[0]?.max || 25000} &nbsp;&nbsp; Min-{oddsData[0]?.min || 100}
              </div>
            </th>
            <th>LAGAI</th>
            <th>KHAI</th>
            <th>POSITION</th>
          </tr>
        </thead>

        <tbody>
          {oddsData.map((player, index) => {
            const liability = getLiabilityBySectionId(player?.sectionId);
            const isLocked = player?.gstatus !== "OPEN" || isBettingLocked;
            
            return (
              <tr key={player?.sectionId || index}>
                <td className="team-name" style={{color:"white"}}>
                  {player?.nation || `Player ${String.fromCharCode(65 + index)}`}
                  <span className="block-position" style={{color: liability >= 0 ? 'green' : "red"}}>
                    {liability || 0}
                  </span>
                </td>
                <td 
                  onClick={() => handleBetClick(player, true)}
                  style={{ 
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    position: 'relative'
                  }} 
                  className={`back ${isLocked ? 'locked' : ''}`}
                >
                  {isLocked && (
                    <div className="lock-overlay">
                      <FaLock />
                    </div>
                  )}
                  {(player?.b1).toFixed(2) || "0.00"}
                </td>
                <td 
                  onClick={() => handleBetClick(player, false)}
                  style={{ 
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    position: 'relative'
                  }} 
                  className={`lay ${isLocked ? 'locked' : ''}`}
                >
                  {isLocked && (
                    <div className="lock-overlay">
                      <FaLock />
                    </div>
                  )}
                  {(player?.l1).toFixed(2) || "0.00"}
                </td>
                <td className={`position ${liability > 0 ? 'positive' : liability < 0 ? 'negative' : 'zero'}`} style={{
                  color: liability > 0 ? 'green' : liability < 0 ? 'red' : '#666'
                }}>
                  {liability || 0}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {betModalVisible && (
        <BetModal onClose={() => setBetModalVisible(false)} />
      )}
    </div>
  );
};

export default TeamTable;
