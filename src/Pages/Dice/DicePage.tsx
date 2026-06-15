import { useNavigate } from "react-router-dom"
import BackBtn from "../../Component/BackBtn/BackBtn"
import "./DicePage.scss"

const DICE_GAMES = [
  {
    id: "99",
    title: "Classic Dice",
    subtitle: "Odd / Even · Number Bet",
    betClose: "10 sec rounds",
    status: "LIVE",
    icon: "🎲",
  },
]

const DicePage = () => {
  const navigate = useNavigate()

  return (
    <div className="dice-page">
      <BackBtn to="/main" name="BACK TO MAIN MENU" />

      <div className="dice-page-header">
        <h1>Dice Games</h1>
        <p>Place your bets on Odd / Even or specific numbers</p>
      </div>

      <div className="dice-page-grid">
        {DICE_GAMES.map((game) => (
          <div
            key={game.id}
            className="dice-page-card"
            onClick={() => navigate(`/casino/detail/${game.id}`)}
          >
            <div className="dpc-top">
              <div className="dpc-icon">{game.icon}</div>
              <div className={`dpc-badge ${game.status === "LIVE" ? "dpc-badge--live" : "dpc-badge--soon"}`}>
                {game.status === "LIVE" && <span className="dpc-dot" />}
                {game.status}
              </div>
            </div>

            <div className="dpc-title">{game.title}</div>
            <div className="dpc-subtitle">{game.subtitle}</div>

            <div className="dpc-footer">
              <span className="dpc-time">⏱ {game.betClose}</span>
              <span className="dpc-play">PLAY NOW →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DicePage
