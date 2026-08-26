import { useEffect } from "react"
import "./Maintenance.scss"

const Maintenance = () => {
  useEffect(() => {
    document.title = "Under Maintenance"
  }, [])

  return (
    <div className="maintenance-page">
      <div className="maintenance-card">
        <div className="maintenance-icon">🛠️</div>
        <h1>We'll Be Right Back</h1>
        <p>
          Site is currently under scheduled maintenance to improve your experience.
        </p>
        <p>Please check back shortly. We apologize for the inconvenience.</p>
        <div className="maintenance-divider" />
        <p className="maintenance-sub">Thank you for your patience.</p>
      </div>
    </div>
  )
}

export default Maintenance
