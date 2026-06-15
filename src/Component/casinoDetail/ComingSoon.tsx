import { useNavigate } from "react-router-dom"
import BackBtn from "../BackBtn/BackBtn"

const ComingSoon = () => {
  const navigate = useNavigate()

  return (
    <>
      <BackBtn to="/casino-list" name="BACK TO CASINO MENU" />
      <div style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a1a2a",
        color: "#fff",
        textAlign: "center",
        padding: "40px 20px",
      }}>
        <div style={{
          fontSize: 64,
          marginBottom: 16,
          filter: "drop-shadow(0 0 20px rgba(255,193,7,0.5))",
        }}>🎰</div>

        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          background: "linear-gradient(135deg, #f5c518, #ff9800)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 12,
          letterSpacing: 2,
        }}>
          COMING SOON
        </h1>

        <p style={{
          fontSize: 15,
          color: "#a0a8b8",
          maxWidth: 320,
          lineHeight: 1.6,
          marginBottom: 32,
        }}>
          This game is under maintenance. Stay tuned, it will be live shortly!
        </p>

        <button
          onClick={() => navigate("/casino-list")}
          style={{
            background: "linear-gradient(135deg, #f5c518, #ff9800)",
            color: "#1a1a2a",
            border: "none",
            borderRadius: 8,
            padding: "12px 32px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: 1,
          }}
        >
          BACK TO CASINO
        </button>
      </div>
    </>
  )
}

export default ComingSoon
