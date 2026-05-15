import { useEffect, useState } from "react"
import {
  useUpdateRateMutation,
  useUserProfileMutation,
} from "../../../store/service/userServices/userServices"
import { Link } from "react-router-dom"
import snackbarUtil from "../../utils/Snackbar"
import "./Profile.scss"

const Profile = () => {
  const [rateValue, setRateValue] = useState(0)
  const [trigger, { data: userData }] = useUserProfileMutation()
  const [updateRate, { data: updateRateInfo }] = useUpdateRateMutation()

  useEffect(() => {
    if (userData && userData?.data?.rateDifference) {
      setRateValue(userData?.data?.rateDifference)
    }
  }, [userData])

  useEffect(() => {
    trigger()
  }, [])

  const handleRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRateValue(parseInt(e.target.value))
  }

  const handleUpdateRate = () => {
    updateRate({ rateDifference: rateValue })
  }

  useEffect(() => {
    if (updateRateInfo) {
      if (updateRateInfo?.status) {
        snackbarUtil.success(updateRateInfo?.message)
        trigger()
      } else {
        snackbarUtil.error(updateRateInfo?.message)
      }
    }
  }, [updateRateInfo])

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Rate Information Section */}
        <div className="profile-section">
          <div className="section-header">RATE INFORMATION</div>
          <div className="section-content rate-section">
            <div className="rate-row">
              <div className="rate-label">Rate Difference :</div>
              <div className="rate-input">
                <select value={rateValue} onChange={handleRateChange}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
              <div className="rate-button">
                <button onClick={handleUpdateRate}>Update</button>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="profile-section">
          <div className="section-header">PERSONAL INFORMATION</div>
          <div className="section-content">
            <div className="info-row">
              <div className="info-label">Client Code :</div>
              <div className="info-value">{userData?.data?.userId || "C204"}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Client Name :</div>
              <div className="info-value">{userData?.data?.fullName || "Demo User"}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Date of Joining :</div>
              <div className="info-value">N/A</div>
            </div>
            <div className="info-row">
              <div className="info-label">Address :</div>
              <div className="info-value">N/A</div>
            </div>
          </div>
        </div>

        {/* Company Information Section */}
        <div className="profile-section">
          <div className="section-header">COMPANY INFORMATION</div>
          <div className="section-content">
            <div className="info-row">
              <div className="info-label">HELP LINE NO :</div>
              <div className="info-value">+91-1234567890</div>
            </div>
          </div>
        </div>

        {/* Back to Main Menu Button */}
        <Link to="/main" className="back-to-main-btn">
          BACK TO MAIN MENU
        </Link>
      </div>
    </div>
  )
}

export default Profile
