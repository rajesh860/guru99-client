import "./dash.scss"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  FaBaseballBall,
  FaGamepad,
  FaFileAlt,
  FaBook,
  FaCheckCircle,
} from "react-icons/fa"

const AnimatedWords = ({ text }: { text: string }) => (
  <p className="card-subtitle">
    {text.split(' ').map((word, i) => (
      <span key={i} className={`word-anim word-pos-${Math.min(i, 3)}`}>{word}</span>
    ))}
  </p>
)

const Dashboard = () => {
  const navigate = useNavigate()
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [visible, setVisible] = useState(false)
  const [showDicePromo, setShowDicePromo] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!sessionStorage.getItem("dicePromoShown")) {
      const t = setTimeout(() => setShowDicePromo(true), 800)
      sessionStorage.setItem("dicePromoShown", "1")
      return () => clearTimeout(t)
    }
  }, [])

  const handleComingSoon = () => {
    setShowComingSoon(true)
  }

  const dashboardItems = [
    {
      icon: <FaBaseballBall />,
      title: "In Play",
      subtitle: "Live Cricket Matches",
      link: "/inplay",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#667eea"
    },
    {
      icon: <img src="/casino/matka.png" alt="Matka" style={{ width: "52px", height: "52px", objectFit: "contain" }} />,
      title: "Matka",
      subtitle: "Satta Matka Games",
      link: "/satta-matka",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      color: "#f093fb",
      comingSoon: false,
    },
    {
      icon: <span style={{ fontSize: "48px", lineHeight: 1 }}>🎲</span>,
      title: "Dice",
      subtitle: "Odd Even Number Bet",
      link: "/dice",
      gradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
      color: "#ffd200",
    },
    {
      icon: <img src="/img/aviator.png" alt="Aviator" style={{ width: "52px", height: "52px", objectFit: "contain", transform: "rotate(-20deg)" }} />,
      title: "Aviator",
      subtitle: "Fly & Cash Out",
      link: "/aviator",
      gradient: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
      color: "#818cf8",
      comingSoon: false,
    },
    {
      icon: <FaGamepad />,
      title: "Casino Games",
      subtitle: "Play & Win Big",
      link: "/casino-list",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      color: "#4facfe"
    },
    {
      icon: <FaFileAlt />,
      title: "Statement",
      subtitle: "Transaction History",
      link: "/statement",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      color: "#43e97b"
    },
    {
      icon: <FaBook />,
      title: "My Ledger",
      subtitle: "Account Details",
      link: "/ledger",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      color: "#fa709a"
    },
    {
      icon: <FaCheckCircle />,
      title: "Complete Games",
      subtitle: "Finished Matches",
      link: "/complete",
      gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
      color: "#30cfd0"
    },
  ]



//   const getBallFeeds = async () => {
//   try {
//     const res = await fetch('https://content.crickapi.com/commentary/getBallFeeds', {
//       method: 'POST',
//         headers: {
//       // 'Authorization': 'YOUR_TOKEN',
//       'Content-Type': 'application/json',
//       'Origin': 'https://crex.com'
//     },
//       body: JSON.stringify({
        
//     "matchKey": "11WY",
//     "lastDocId": 1777886381922,
//     "filters": {
//         "highlights": false,
//         "overs": false,
//         "wickets": false,
//         "sixes": false,
//         "fours": false,
//         "firstInning": false,
//         "secondInning": false,
//         "milestones": false,
//         "thirdInning": false,
//         "fourthInning": false
//     }
// }
//       )
//     });

//     const data = await res.json();
//     console.log(data);
//   } catch (err) {
//     console.error("Error:", err);
//   }
// };

// getBallFeeds()

  return (
    <div className={`modern-dashboard ${visible ? "page-visible" : ""}`}>
      {/* Hero Section */}
      {/* <div className="dashboard-hero">
        <div className="hero-content">
          <h1>
            <FaTrophy className="hero-icon" />
            Welcome to Dashboard
          </h1>
          <p>Choose an option to get started</p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <FaChartLine />
            <div>
              <span className="stat-label">Active Games</span>
              <span className="stat-value">24</span>
            </div>
          </div>
          <div className="stat-card">
            <FaTrophy />
            <div>
              <span className="stat-label">Your Wins</span>
              <span className="stat-value">156</span>
            </div>
          </div>
        </div>
      </div> */}

      {/* Dashboard Grid */}
      <div className="dashboard-grid-modern">
        {dashboardItems.map((item, index) => (
          (item as any).comingSoon ? (
            <button
              key={index}
              onClick={handleComingSoon}
              className="dashboard-card-modern"
              style={{ '--card-gradient': item.gradient, animationDelay: `${index * 70}ms` } as React.CSSProperties}
            >
              <div className="card-shine" />
              <div className="card-coming-soon-badge">Coming Soon</div>
              <div className="card-icon" style={{ color: item.color, animationDelay: `${index * 70 + 300}ms` } as React.CSSProperties}>
                {item.icon}
              </div>
              <div className="card-content">
                <h3>{item.title}</h3>
                <AnimatedWords text={item.subtitle} />
              </div>
              <div className="card-arrow">→</div>
            </button>
          ) : (
            <Link
              key={index}
              to={item.link}
              className="dashboard-card-modern"
              style={{ '--card-gradient': item.gradient, animationDelay: `${index * 70}ms` } as React.CSSProperties}
            >
              <div className="card-shine" />
              <div className="card-icon" style={{ color: item.color, animationDelay: `${index * 70 + 300}ms` } as React.CSSProperties}>
                {item.icon}
              </div>
              <div className="card-content">
                <h3>{item.title}</h3>
                <AnimatedWords text={item.subtitle} />
              </div>
              <div className="card-arrow">→</div>
            </Link>
          )
        ))}
      </div>

      {/* Dice Promo Popup */}
      {showDicePromo && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 10000,
            animation: "fadeIn 0.3s ease",
          }}
          onClick={() => setShowDicePromo(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: "relative",
              background: "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
              border: "1px solid rgba(255,193,7,0.3)",
              borderRadius: 24,
              padding: "40px 32px 32px",
              width: "min(360px, 90vw)",
              textAlign: "center",
              boxShadow: "0 0 60px rgba(255,193,7,0.2), 0 20px 60px rgba(0,0,0,0.6)",
              animation: "dicePopIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)",
            }}
          >
            {/* Close */}
            <button
              onClick={() => setShowDicePromo(false)}
              style={{
                position: "absolute", top: 12, right: 14,
                background: "rgba(255,255,255,0.08)", border: "none",
                color: "#aaa", fontSize: 18, width: 30, height: 30,
                borderRadius: "50%", cursor: "pointer", lineHeight: "30px",
              }}
            >×</button>

            {/* Animated dice */}
            <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 8, display: "inline-block", animation: "diceRoll 1.2s ease-in-out infinite" }}>🎲</div>

            {/* HOT badge */}
            <div style={{
              display: "inline-block", background: "linear-gradient(90deg,#ff416c,#ff4b2b)",
              color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: 1.5,
              padding: "3px 12px", borderRadius: 20, marginBottom: 14,
            }}>🔥 HOT GAME</div>

            <h2 style={{
              color: "#fff", fontSize: 26, fontWeight: 800, margin: "0 0 8px",
              background: "linear-gradient(90deg,#ffd200,#f7971e)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Dice Game</h2>

            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: "0 0 16px", lineHeight: 1.5 }}>
              Bet on <strong style={{ color: "#ffd200" }}>Odd</strong> or <strong style={{ color: "#f7971e" }}>Even</strong> numbers
            </p>

            {/* Win multipliers */}
            <div style={{ display: "flex", gap: 10, marginBottom: 24, justifyContent: "center" }}>
              <div style={{
                flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(0,230,118,0.3)",
                borderRadius: 12, padding: "10px 8px",
              }}>
                <div style={{ color: "#00e676", fontSize: 22, fontWeight: 800 }}>2x</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 3 }}>Odd / Even</div>
              </div>
              <div style={{
                flex: 1, background: "rgba(255,193,7,0.1)", border: "1px solid rgba(255,193,7,0.5)",
                borderRadius: 12, padding: "10px 8px",
                boxShadow: "0 0 16px rgba(255,193,7,0.2)",
              }}>
                <div style={{ color: "#ffd200", fontSize: 22, fontWeight: 800 }}>5x</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 3 }}>Exact Number</div>
              </div>
            </div>

            {/* Dice faces row */}
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 24 }}>
              {["⚀","⚁","⚂","⚃","⚄","⚅"].map((d, i) => (
                <span key={i} style={{
                  fontSize: 26,
                  animation: `diceFaceAnim 0.6s ease ${i * 0.08}s infinite alternate`,
                  display: "inline-block",
                  filter: "drop-shadow(0 0 6px rgba(255,193,7,0.6))",
                }}>{d}</span>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => { setShowDicePromo(false); navigate("/casino/detail/99") }}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
                color: "#1a1a2e", border: "none", borderRadius: 12,
                padding: "14px 0", fontSize: 16, fontWeight: 800,
                cursor: "pointer", letterSpacing: 1,
                boxShadow: "0 4px 20px rgba(255,210,0,0.4)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={e => { (e.target as HTMLButtonElement).style.transform = "scale(1.03)"; (e.target as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(255,210,0,0.6)" }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.transform = "scale(1)"; (e.target as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(255,210,0,0.4)" }}
            >
              🎲 PLAY NOW
            </button>

            <button
              onClick={() => setShowDicePromo(false)}
              style={{
                marginTop: 12, background: "none", border: "none",
                color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer",
              }}
            >Maybe later</button>
          </div>
        </div>
      )}

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowComingSoon(false)}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "40px 60px",
              borderRadius: "16px",
              textAlign: "center",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
              animation: "slideIn 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>🚀</div>
            <h2
              style={{
                color: "white",
                fontSize: "32px",
                fontWeight: "bold",
                marginBottom: "12px",
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              Coming Soon!
            </h2>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "16px",
                marginBottom: "30px",
              }}
            >
              This feature is under development
            </p>
            <button
              onClick={() => setShowComingSoon(false)}
              style={{
                background: "white",
                color: "#667eea",
                border: "none",
                padding: "12px 32px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
     
    </div>
  )
}

export default Dashboard
