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
  /** Remaining seconds of the round; used to pre-empt the backend suspend. */
  roundSeconds?: number
}

const TeamTable: React.FC<TeamTableProps> = ({ data, handleRateClick, liabilityData, roundSeconds }) => {
  const [betModalOpen, setBetModalOpen] = useState(false);
  // Within 2s of the round ending, treat the board as suspended (frontend pre-empt).
  const roundSuspended = roundSeconds != null && roundSeconds <= 2;
  const [selectedPlayer, setSelectedPlayer] = useState<{
    nat: string;
    rate: string;
    isBack: boolean;
    sid: string;
    mid: string;
  } | null>(null);

  // Get Player A and Player B data from t2 array
  const playerA = data?.t2?.find((item: any) => item.nation === "Player A")
  const playerB = data?.t2?.find((item: any) => item.nation === "Player B")

  // Lagai (back) = `rate` (teen20) or `b1`; Khai (lay) = `l1` when the feed sends one.
  const validRate = (v: any) => {
    const n = parseFloat(v)
    return Number.isFinite(n) && n > 0 ? String(v) : null
  }
  const backRate = (p: any) => validRate(p?.rate ?? p?.b1)
  const layRate  = (p: any) => validRate(p?.l1)
  const isOpen   = (p: any) => !!p && String(p.gstatus) === "1" && !roundSuspended

  const handlePlayerClick = (player: any, isBack: boolean) => {
    const rate = isBack ? backRate(player) : layRate(player)
    if (!isOpen(player) || !rate) return

    setSelectedPlayer({
      nat: player.nation,
      rate,
      isBack,
      sid: player.sid,
      mid: player.mid || data?.mid || "",
    });
    setBetModalOpen(true);
  };

  // 500000 → 500K, 1500 → 1.5K
  const fmtLimit = (v: any) => {
    const n = Number(v)
    if (!Number.isFinite(n) || n <= 0) return "--"
    if (n >= 1000) return `${+(n / 1000).toFixed(1)}K`
    return String(n)
  }
  const limits = playerA ?? playerB

  const renderCell = (player: any, isBack: boolean) => {
    const rate = isBack ? backRate(player) : layRate(player)
    const open = isOpen(player) && !!rate
    return (
      <button
        type="button"
        className={`tpb-cell ${isBack ? "tpb-lagai" : "tpb-khai"}${open ? "" : " tpb-locked"}`}
        onClick={() => player && handlePlayerClick(player, isBack)}
        disabled={!open}
        aria-label={`${player?.nation ?? ""} ${isBack ? "Lagai" : "Khai"} ${open ? rate : "locked"}`}
      >
        <span className="tpb-rate">{rate ?? ""}</span>
        {!open && <FaLock className="tpb-lock" />}
      </button>
    )
  }

  return (
    <>
      <div className="tp-book">
        <div className="tpb-head">
          <div className="tpb-limits">
            Min: {fmtLimit(limits?.min)} Max: {fmtLimit(limits?.max)}
          </div>
          <div className="tpb-col-title">LAGAI</div>
          <div className="tpb-col-title">KHAI</div>
        </div>

        {[playerA, playerB].map((player, i) => (
          <div className="tpb-row" key={player?.sid ?? i}>
            <div className="tpb-name">{player?.nation ?? (i === 0 ? "Player A" : "Player B")}</div>
            {renderCell(player, true)}
            {renderCell(player, false)}
          </div>
        ))}
      </div>

      <PlaceBetModal
        isOpen={betModalOpen}
        onClose={() => setBetModalOpen(false)}
        selectedPlayer={selectedPlayer}
        matchId={data?.mid}
        roundSeconds={roundSeconds}
      />
    </>
  );
};

export default TeamTable;