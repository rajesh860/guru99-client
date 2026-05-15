import "./password.scss"
import { useEffect, useState } from "react"
import { useUserCahngePasswordMutation } from "../../../store/service/userServices/userServices"
import snackbarUtil from "../../utils/Snackbar"
import { useNavigate } from "react-router-dom"

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const nav = useNavigate()

  const [passwordChange, { data: passData }] = useUserCahngePasswordMutation()

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      snackbarUtil.error("Please fill all fields")
      return
    }

    if (newPassword !== confirmPassword) {
      snackbarUtil.error("New password and confirm password must match")
      return
    }

    passwordChange({
      currentPassword,
      newPassword,
    })
  }

  useEffect(() => {
    if (passData) {
      if (passData?.status) {
        snackbarUtil.success(passData?.message)
        localStorage.clear()
        nav("/login")
      } else {
        snackbarUtil.error(passData?.message)
      }
    }
  }, [passData])
  
  return (
    <div className="change-password-page">
      <div className="change-password-container">
        <h1 className="change-password-title">Change Password</h1>
        
        <div className="change-password-form">
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder=""
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder=""
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder=""
            />
          </div>

          <button 
            type="button" 
            className="update-password-btn" 
            onClick={handleUpdatePassword}
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword
