import React, { useState, useEffect } from 'react';
import { usePlaceMatkaBetMutation } from '../../../store/service/matka/matkaServices';
import snackbarUtil from '../../utils/Snackbar';
import './styles.scss';

const MatkaBetSlipModal = ({ isOpen, onClose, selectedNumber, gameName, betType = 'single_jodi', eventId }) => {
  const [price, setPrice] = useState('90');
  const [value, setValue] = useState('00');
  const [stake, setStake] = useState('0');
  const [time, setTime] = useState(10);
  
  const [placeMatkaBet, { isLoading }] = usePlaceMatkaBetMutation();

  // Update display values when selectedNumber changes
  useEffect(() => {
    if (selectedNumber) {
      // For haruf bets (andar_2, bahar_3), show just the digit
      if (selectedNumber.includes('_')) {
        const digit = selectedNumber.split('_')[1];
        setValue(digit);
      } else {
        // For normal jodi numbers
        setValue(selectedNumber);
      }
    }
  }, [selectedNumber]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTime(10); // Reset timer to 10 when modal opens
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    let interval;
    if (isOpen && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            onClose();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, time, onClose]);

  const stakeOptions = [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
    { value: 200, label: '200' },
    { value: 500, label: '500' },
    { value: 1000, label: '1,000' },
    { value: 2000, label: '2,000' }
  ];

  const handleStakeClick = (value) => {
    setStake(value.toString());
  };

  const handlePlaceBet = async () => {
    try {
      const betData = {
        market: gameName?.toLowerCase() || 'faridabad',
        eventId: eventId,
        betType: betType,
        number: selectedNumber,
        stake: parseInt(stake) || 0,
      };

      const response = await placeMatkaBet(betData).unwrap();
      
      if (response.success) {
        snackbarUtil.success(response.message || 'Bet placed successfully!')
        onClose();
      } 
      // else {
      //   snackbarUtil.error(response.message || 'Failed to place bet')
      // }
    } catch (error) {
      // snackbarUtil.error(error?.data?.message || 'Failed to place bet. Please try again.')
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="matka-bet-slip-overlay" onClick={onClose}></div>
      <div className={`matka-bet-slip-modal ${isOpen ? 'open' : ''}`}>
        <div className="bet-slip-content">
          <div className="number-display">
            <span>Number {selectedNumber?.includes('_') ? selectedNumber.split('_')[1] : selectedNumber}</span>
          </div>

          <div className="bet-details-grid">
            <div className="detail-item">
              <label className="detail-label">PRICE</label>
              <input 
                type="text" 
                className="detail-input" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="detail-item">
              <label className="detail-label">VALUE</label>
              <input 
                type="text" 
                className="detail-input" 
                value={value}
                readOnly
              />
            </div>
            <div className="detail-item">
              <label className="detail-label">STAKE</label>
              <input 
                type="text" 
                className="detail-input stake-input" 
                value={stake}
                onChange={(e) => setStake(e.target.value)}
              />
            </div>
            <div className="detail-item">
              <label className="detail-label">TIME</label>
              <input 
                type="text" 
                className="detail-input time-input" 
                value={time}
                readOnly
              />
            </div>
          </div>

          <button className="place-bet-button" onClick={handlePlaceBet} disabled={isLoading}>
            {isLoading ? 'Placing Bet...' : 'Place Bet'}
          </button>

          <div className="stake-options-grid">
            {stakeOptions.map((option) => (
              <button 
                key={option.value}
                className="stake-option-button"
                onClick={() => handleStakeClick(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MatkaBetSlipModal;
