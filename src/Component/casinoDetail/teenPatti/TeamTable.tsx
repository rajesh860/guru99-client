import React, { useState } from "react";
import "./TeamTable.scss";
import PlaceBetModal from "./PlaceBetModal";
import { FaLock } from "react-icons/fa";

interface SelectedPlayerType {
  gstatus: boolean
  max: number
  mid: string
  min: number
  nation: string
  pnl: number
  rate: string
  sid: string
}

interface TeamTableProps {
  data?: any
  handleRateClick?: (item: SelectedPlayerType) => void
  liabilityData?: any
}

const TeamTable: React.FC<TeamTableProps> = ({ data, handleRateClick, liabilityData }) => {
  const [betModalOpen, setBetModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<{
    nat: string;
    rate: string;
    isBack: boolean;
    sid: string;
    mid: string;
  } | null>(null);

  // Get Player A and Player B data from t2 array
  const playerA = data?.t2?.find(item => item.nation === "Player A")
  const playerB = data?.t2?.find(item => item.nation === "Player B")

  const handlePlayerClick = (player: any, isBack: boolean) => {
    if (player?.gstatus !== "1") {
      return;
    }

    setSelectedPlayer({
      nat: player.nation,
      rate: player.rate,
      isBack: isBack,
      sid: player.sid,
      mid: player.mid || data?.mid || "",
    });
    setBetModalOpen(true);
  };

  return (
    <>
      <div className="table-wrapper">
        <button>
          
        </button>
        <button>
          Yes
        </button>
        <button onClick={() => playerA && handlePlayerClick(playerA, true)}>
          Player A
        </button>
        <button 
          className={playerA?.gstatus === "1" ? "rate-button" : "locked-button"}
          onClick={() => playerA && handlePlayerClick(playerA, true)}
        >
          {playerA?.gstatus === "1" ? playerA?.rate : <FaLock/>}
        </button>
        <button onClick={() => playerB && handlePlayerClick(playerB, true)}>
          Player B
        </button>
        <button 
          className={playerB?.gstatus === "1" ? "rate-button" : "locked-button"}
          onClick={() => playerB && handlePlayerClick(playerB, true)}
        >
          {playerB?.gstatus === "1" ? playerB?.rate : <FaLock/>}
        </button>
      </div>

      <PlaceBetModal
        isOpen={betModalOpen}
        onClose={() => setBetModalOpen(false)}
        selectedPlayer={selectedPlayer}
        matchId={data?.mid}
      />
    </>
  );
};

export default TeamTable;