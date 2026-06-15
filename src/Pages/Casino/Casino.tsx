import React from "react"
import BackBtn from "../../Component/BackBtn/BackBtn"
import { useNavigate } from "react-router-dom"
import snackbarUtil from "../../utils/Snackbar"
import "./style.css"

const Casino = () => {
  const navigate = useNavigate()

  // Static casino data for display
  const staticCasinoData = [
    { tableId: '52', name: 'Dragon Tiger 20-20' },
    { tableId: '51', name: 'Teen Patti 20-20' },
    { tableId: '53', name: 'Lucky 7 - B' },
    { tableId: '54', name: 'Andar Bahar' },
    { tableId: '62', name: 'Amar Akbar Anthony' },
    { tableId: '59', name: 'Poker 20-20' },
    { tableId: '55', name: '32 Cards' },
    { tableId: '8',  name: 'Baccarat' },
    // { tableId: '99', name: 'Dice Game' },
  ]

  // Default images mapping for different casino games
  const getDefaultImage = (name: string, tableId: string) => {
    const nameCheck = name.toLowerCase()
    if (nameCheck.includes('dragon')) return '/img/dragonTiger2020.png'
    if (nameCheck.includes('teenpatti') || nameCheck.includes('teen')) return '/img/teenpatti20.png'
    if (nameCheck.includes('lucky') || nameCheck.includes('lcuky')) return '/img/lucky7.png'
    if (nameCheck.includes('andar') || nameCheck.includes('bahar')) return '/img/ander_bahar.png'
    if (nameCheck.includes('amar') || nameCheck.includes('anthony')) return '/img/amarakbaranthony.png'
    if (nameCheck.includes('poker')) return '/img/casino1.png'
    if (nameCheck.includes('32')) return '/img/casino2.png'
    if (nameCheck.includes('baccarat')) return '/img/casino3.png'
    if (nameCheck.includes('dice')) return '/img/casino4.png'
    if (nameCheck.includes('one day')) return '/img/oneDayTeenPatti.jpg'
    
    // Default based on tableId if name doesn't match
    const idNum = parseInt(tableId) % 8
    const images = ['dragonTiger2020.png', 'teenpatti20.png', 'lucky7.png', 'ander_bahar.png', 'amarakbaranthony.png', 'casino1.png', 'casino2.png', 'casino3.png']
    return `/img/${images[idNum]}`
  }

  // Active casino games — add tableId here to enable
  const ACTIVE_IDS = new Set<string>(['51', '99'])

  const handleCardClick = (e: React.MouseEvent, casino: any) => {
    if (!ACTIVE_IDS.has(casino.tableId)) {
      e.preventDefault()
      snackbarUtil.info("Coming Soon!")
      return
    }
    navigate(`/casino/detail/${casino.tableId}`)
  }

  // Use static data only
  const casinoData = staticCasinoData

  return (
    <>
      <BackBtn to="/main" name="BACK TO MAIN MENU" />
      <div className="casino-page">
        <div className="casino-header">
          <h1 className="casino-title">Casino Games</h1>
          <p className="casino-subtitle">Choose your game and start playing</p>
        </div>

        <div className="casino-grid">
          {casinoData.map((casino: any) => {
            const active = ACTIVE_IDS.has(casino.tableId)
            const image  = getDefaultImage(casino.name, casino.tableId)

            return (
              <div
                key={casino.tableId}
                className="casino-card"
                onClick={(e) => handleCardClick(e, casino)}
                style={{ cursor: 'pointer' }}
              >
                <div className="casino-card-image">
                  <img
                    src={image}
                    alt={casino.name}
                    onError={(e) => {
                      e.currentTarget.src = `/img/casino.png`
                    }}
                  />
                  <div className="casino-card-overlay">
                    <span className="casino-play-btn">
                      {active ? 'PLAY NOW' : 'COMING SOON'}
                    </span>
                  </div>
                </div>
                <div className="casino-card-content">
                  <h3 className="casino-card-title">{casino.name}</h3>
                  {/* <div className="casino-card-status">
                    <span className="casino-status-badge">LIVE</span>
                  </div> */}
                </div>
              </div>
            )
          })}
        </div>

        {casinoData.length === 0 && (
          <div className="casino-empty">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#666"/>
              <path d="M13 7h-2v5l4.28 2.54.72-1.21-3-1.78V7z" fill="#666"/>
            </svg>
            <p>No casino games available at the moment</p>
          </div>
        )}
      </div>
    </>
  )
}

export default Casino
