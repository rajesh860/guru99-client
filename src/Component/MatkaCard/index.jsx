import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.scss';

const MatkaCard = ({ date, title, resultTime, betCloseTime, closeTimeLabel }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/satta-matka/${title.toLowerCase()}`);
  };

  return (
    <div className="matka-card" onClick={handleClick}>
      <div className="matka-card-header">
        <div className="matka-date">{date}</div>
        <div className="matka-badge">{closeTimeLabel}</div>
      </div>
      
      <div className="matka-title">{title}</div>
      
      <div className="matka-times">
        <div className="matka-time-row">
          <span className="matka-label">Result:</span>
          <span className="matka-value">{resultTime}</span>
        </div>
        <div className="matka-time-row">
          <span className="matka-label">Bet Close:</span>
          <span className="matka-value">{betCloseTime}</span>
        </div>
      </div>
    </div>
  );
};

export default MatkaCard;
