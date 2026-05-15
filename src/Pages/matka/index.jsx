import React from 'react';
import { useNavigate } from 'react-router-dom';
import MatkaCard from '../../Component/MatkaCard';
import { useGetMatkaMarketsQuery } from '../../../store/service/matka/matkaServices';
import './styles.scss';

const Matka = () => {
  const navigate = useNavigate();

  // Fetch matka markets
  const { data: marketsData, isLoading } = useGetMatkaMarketsQuery();

  const matkaGames = [
    {
      id: 1,
      date: '25-04-2026',
      title: 'FARIDABAD',
      resultTime: '06:15 PM',
      betCloseTime: '05:15 PM',
      closeTimeLabel: 'BETS CLOSE IN 6H'
    },
    {
      id: 2,
      date: '25-04-2026',
      title: 'GHAZIABAD',
      resultTime: '09:00 PM',
      betCloseTime: '08:00 PM',
      closeTimeLabel: 'BETS CLOSE IN 9H'
    },
    {
      id: 3,
      date: '25-04-2026',
      title: 'GALI',
      resultTime: '11:30 PM',
      betCloseTime: '10:30 PM',
      closeTimeLabel: 'BETS CLOSE IN 12H'
    },
    {
      id: 4,
      date: '25-04-2026',
      title: 'DESAWAR',
      resultTime: '05:30 AM',
      betCloseTime: '04:30 AM',
      closeTimeLabel: 'BETS CLOSE IN 18H'
    }
  ];

  // Use API data if available, otherwise fallback to static data
  const matkaGamesToDisplay = marketsData?.data || matkaGames;

  // Format API data for display
  const formatGamesData = (games) => {
    return games.map((game, index) => ({
      id: game._id || game.id || index,
      date: game.eventId ? game.eventId.split('-').slice(0, 3).join('-') : game.date,
      title: game.name ? game.name.toUpperCase() : game.title,
      resultTime: game.resultTime || game.resultTime,
      betCloseTime: game.betCloseTime || game.betCloseTime,
      closeTimeLabel: game.timeRemainingLabel || game.closeTimeLabel || game.status,
      status: game.status,
      isActive: game.isActive,
      isBettingOpen: game.isBettingOpen
    }));
  };

  const displayGames = formatGamesData(matkaGamesToDisplay);

  const handleGameClick = (game) => {
    navigate(`/satta-matka/${game.title.toLowerCase()}`);
  };

  return (
     <div className="matka-container">
      <div className="matka-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Matka Games</h1>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <p>Loading markets...</p>
        </div>
      ) : (
        <div className="matka-grid">
          {displayGames.map((game) => (
            <MatkaCard
              key={game.id}
              date={game.date}
              title={game.title}
              resultTime={game.resultTime}
              betCloseTime={game.betCloseTime}
              closeTimeLabel={game.closeTimeLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Matka;
