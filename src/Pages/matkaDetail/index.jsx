import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetMyMatkaBetsQuery, useGetMyJodiGridQuery, useGetMyHarufGridQuery, useGetMatkaMarketsQuery } from '../../../store/service/matka/matkaServices';
import './styles.scss';
import MatkaBetSlipModal from '../../Component/MatkaBetSlipModal';

const MatkaDetail = () => {
  const { gameName } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('single');
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [eventId, setEventId] = useState(null);
  const [isBetSlipOpen, setIsBetSlipOpen] = useState(false);
  const [betType, setBetType] = useState('single_jodi');

  // Fetch matka markets to get current eventId
  const { data: marketsData } = useGetMatkaMarketsQuery(undefined, {
    pollingInterval: 10000, // Poll every 10 seconds to get updated eventId
  });

  // Find current game from markets data
  useEffect(() => {
    if (marketsData?.data) {
      const currentMarket = marketsData.data.find(
        market => market.name?.toLowerCase() === gameName?.toLowerCase()
      );
      if (currentMarket?.eventId) {
        setEventId(currentMarket.eventId);
      }
    }
  }, [marketsData, gameName]);

  // Fetch my matka bets with polling (every 3 seconds)
  const { data: myBetsData, isLoading: betsLoading, refetch } = useGetMyMatkaBetsQuery(undefined, {
    pollingInterval: 3000, // Poll every 3 seconds
  });

  // Generate numbers 00-99
  const numbers = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));

  const gameData = {
    FARIDABAD: { date: '25-04-2026', time: '06:15 PM' },
    GHAZIABAD: { date: '25-04-2026', time: '09:00 PM' },
    GALI: { date: '25-04-2026', time: '11:30 PM' },
    DESAWAR: { date: '25-04-2026', time: '05:30 AM' }
  };

  const currentGame = gameData[gameName?.toUpperCase()] || gameData.FARIDABAD;

  // Fetch jodi grid data with polling (every 3 seconds) - only when eventId is available and activeTab is 'single'
  const { data: jodiGridData, isLoading: jodiGridLoading } = useGetMyJodiGridQuery({
    market: gameName?.toLowerCase() || 'faridabad',
    eventId: eventId || `${currentGame.date}-${gameName?.toLowerCase()}`
  }, {
    pollingInterval: 3000, // Poll every 3 seconds
    skip: !eventId || activeTab !== 'single', // Skip query until eventId is available or activeTab is not 'single'
  });

  // Fetch haruf grid data with polling (every 3 seconds) - only when eventId is available and activeTab is 'harup'
  const { data: harufGridData, isLoading: harufGridLoading } = useGetMyHarufGridQuery({
    market: gameName?.toLowerCase() || 'faridabad',
    eventId: eventId || `${currentGame.date}-${gameName?.toLowerCase()}`
  }, {
    pollingInterval: 3000, // Poll every 3 seconds
    skip: !eventId || activeTab !== 'harup', // Skip query until eventId is available or activeTab is not 'harup'
  });

  const handleNumberClick = (number, type = 'single_jodi') => {
    setSelectedNumber(number);
    setBetType(type);
    setIsBetSlipOpen(true);
  };

  // Generate single digit numbers for Harup (0-9)
  const singleDigits = Array.from({ length: 10 }, (_, i) => i.toString());

  return (
    <div className="matka-detail-container">
      <div className="matka-detail-header">
        <div className="header-top">
          <div className="status-indicator">
            <span className="live-dot"></span>
            <span className="header-date">{currentGame.date}-{gameName?.toUpperCase()}</span>
          </div>
          <div className="game-time">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}, {currentGame.time}</div>
        </div>
        
        <div className="game-title-section">
          <h1 className="game-title">{gameName?.toUpperCase()}</h1>
        </div>
      </div>

      <div className="matka-tabs">
        <button 
          className={`matka-tab ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          Single Jodi
        </button>
        <button 
          className={`matka-tab ${activeTab === 'harup' ? 'active' : ''}`}
          onClick={() => setActiveTab('harup')}
        >
          Harup
        </button>
        <button 
          className={`matka-tab ${activeTab === 'open' ? 'active' : ''}`}
          onClick={() => setActiveTab('open')}
        >
          Open Bets
        </button>
      </div>

      {activeTab === 'single' && (
        <div className="numbers-grid">
          {jodiGridLoading ? (
            <div className="loading-message">Loading grid...</div>
          ) : jodiGridData?.grid ? (
            jodiGridData.grid.map((item) => (
              <div key={item.number} className="number-item">
                <button
                  className={`number-button ${selectedNumber === item.number ? 'selected' : ''}`}
                  onClick={() => handleNumberClick(item.number)}
                >
                  {item.number}
                </button>
                <div className="number-value" style={{ color: item.pl > 0 ? '#10b981' : item.pl < 0 ? '#ef4444' : '#10b981' }}>
                  {item.pl || 0}
                </div>
              </div>
            ))
          ) : (
            numbers.map((number) => (
              <div key={number} className="number-item">
                <button
                  className={`number-button ${selectedNumber === number ? 'selected' : ''}`}
                  onClick={() => handleNumberClick(number)}
                >
                  {number}
                </button>
                <div className="number-value">0</div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'harup' && (
        <div className="harup-container">
          <div className="harup-section">
            <div className="harup-title">Andar</div>
            <div className="harup-grid">
              {harufGridData && harufGridData.grid ? (
                harufGridData.grid
                  .filter(item => item.number.startsWith('andar_'))
                  .map((item) => {
                    const digit = item.number.split('_')[1];
                    return (
                      <div key={item.number} className="number-item">
                        <button
                          className={`number-button ${selectedNumber === item.number ? 'selected' : ''}`}
                          onClick={() => handleNumberClick(item.number, 'haruf')}
                        >
                          {digit}
                        </button>
                        <div className="number-value" style={{ color: item.pl > 0 ? '#10b981' : item.pl < 0 ? '#ef4444' : '#10b981' }}>
                          {item.pl || 0}
                        </div>
                      </div>
                    );
                  })
              ) : (
                singleDigits.map((digit) => (
                  <div key={`andar-${digit}`} className="number-item">
                    <button
                      className={`number-button ${selectedNumber === `andar_${digit}` ? 'selected' : ''}`}
                      onClick={() => handleNumberClick(`andar_${digit}`, 'haruf')}
                    >
                      {digit}
                    </button>
                    <div className="number-value">0</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="harup-section">
            <div className="harup-title">Bahar</div>
            <div className="harup-grid">
              {harufGridData && harufGridData.grid ? (
                harufGridData.grid
                  .filter(item => item.number.startsWith('bahar_'))
                  .map((item) => {
                    const digit = item.number.split('_')[1];
                    return (
                      <div key={item.number} className="number-item">
                        <button
                          className={`number-button ${selectedNumber === item.number ? 'selected' : ''}`}
                          onClick={() => handleNumberClick(item.number, 'haruf')}
                        >
                          {digit}
                        </button>
                        <div className="number-value" style={{ color: item.pl > 0 ? '#10b981' : item.pl < 0 ? '#ef4444' : '#10b981' }}>
                          {item.pl || 0}
                        </div>
                      </div>
                    );
                  })
              ) : (
                singleDigits.map((digit) => (
                  <div key={`bahar-${digit}`} className="number-item">
                    <button
                      className={`number-button ${selectedNumber === `bahar_${digit}` ? 'selected' : ''}`}
                      onClick={() => handleNumberClick(`bahar_${digit}`, 'haruf')}
                    >
                      {digit}
                    </button>
                    <div className="number-value">0</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'open' && (
        <div className="open-bets-container">
          {betsLoading ? (
            <div className="loading-message">Loading bets...</div>
          ) : myBetsData && myBetsData.data && myBetsData.data.length > 0 ? (
            <div className="bets-table-wrapper">
              <table className="bets-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Runner Name</th>
                    <th>Bet Price</th>
                    <th>Bet Value</th>
                    <th>Bet Amount</th>
                    <th>Bet Profit</th>
                    <th>Bet Loss</th>
                    <th>Bet Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myBetsData.data.map((bet, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{bet.runnerName || `Single Jodi ${bet.number}`}</td>
                      <td>{bet.betPrice || '89'}</td>
                      <td>{bet.betValue || bet.number}</td>
                      <td>{bet.stake || bet.betAmount}</td>
                      <td>{bet.betProfit || (bet.stake * 89) || '890'}</td>
                      <td>{bet.betLoss || bet.stake || '10'}</td>
                      <td>
                        <span className={`status-badge ${bet.status?.toLowerCase()}`}>
                          {bet.status?.toUpperCase() || 'OPEN'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-bets-message">No open bets available</div>
          )}
        </div>
      )}
        <MatkaBetSlipModal
        isOpen={isBetSlipOpen}
        onClose={() => {
          setIsBetSlipOpen(false);
          refetch(); // Refetch bets when modal closes
        }}
        selectedNumber={selectedNumber}
        gameName={gameName}
        betType={betType}
        eventId={eventId}
      />
    </div>
  );
};

export default MatkaDetail;
