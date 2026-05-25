import "./dash.scss"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { 
  FaBaseballBall, 
  FaDice, 
  FaGamepad, 
  FaFileAlt, 
  FaBook, 
  FaCheckCircle, 
  FaLock, 
  FaUser,
  FaTrophy,
  FaChartLine
} from "react-icons/fa"

const Dashboard = () => {
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
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
      icon: <FaDice />,
      title: "Matka",
      subtitle: "Satta Matka Games",
      link: "/satta-matka",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      color: "#f093fb",
      comingSoon: true
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
    {
      icon: <FaLock />,
      title: "Change Password",
      subtitle: "Security Settings",
      link: "/password",
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      color: "#a8edea"
    },
    {
      icon: <FaUser />,
      title: "My Profile",
      subtitle: "Personal Information",
      link: "/profile",
      gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
      color: "#ff9a9e"
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
                <p>{item.subtitle}</p>
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
                <p>{item.subtitle}</p>
              </div>
              <div className="card-arrow">→</div>
            </Link>
          )
        ))}
      </div>

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
