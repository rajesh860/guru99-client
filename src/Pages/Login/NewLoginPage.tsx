import { useEffect, useState } from "react"
import "./login.scss"
import { useNavigate } from "react-router-dom"
import { useLoginMutation } from "../../../store/service/authService"
import snackbarUtil from "../../utils/Snackbar"
import loginImg from "../../../public/logo/login.png"
const NewLoginPage = () => {
  const [clientCode, setClientCode] = useState("")
  const [password, setPassword] = useState("")
  const token = localStorage.getItem("client-token")

  const [errors, setErrors] = useState({
    clientCode: "",
    password: "",
  })
  const nav = useNavigate()
  const [trigger, { data, isLoading, error }] = useLoginMutation()

  const domain = (import.meta.env.VITE_CLIENT_DOMAIN || window.location.hostname)
    .replace(/^www\./, "")
    .split(".")[0]
    ?.toUpperCase()

  const handleSubmit = async (event: any) => {
    event.preventDefault()
    let formErrors = { clientCode: "", password: "" }
    let hasErrors = false

    if (!clientCode || !clientCode.trim()) {
      formErrors.clientCode = "UserId is required"
      snackbarUtil.error("UserId is required")
      hasErrors = true
    }
    if (!password || !password.trim()) {
      formErrors.password = "Password is required"
      snackbarUtil.error("Password is required")
      hasErrors = true
    }

    setErrors(formErrors)

    if (!hasErrors) {
      try {
        await trigger({
          password: password.trim(),
          appUrl: import.meta.env.VITE_CLIENT_DOMAIN || window.location.hostname,
          //  url: "fastbet365.in",
             panel: "client" ,
          username:clientCode.trim(),
        }).unwrap()
      } catch (error: any) {
        // Error handling is done in useEffect via data/error from mutation
        const errorMsg = 
          error?.data?.message || 
          error?.data?.error || 
          error?.message || 
          "Login failed. Please check your credentials."
        snackbarUtil.error(errorMsg)
      }
    }
  }

  useEffect(() => {
    if (data) {
      if (data?.token) {
        nav("/tc")
        localStorage.setItem("client-token", data?.token)
        localStorage.setItem("userId", data?.userId)
        localStorage.setItem("welShow", "true")
        snackbarUtil.success("Login successful!")
      } else {
        const errorMsg = data?.message || "Login failed. Please check your credentials."
        snackbarUtil.error(errorMsg)
      }
    }
  }, [data, nav])

  useEffect(() => {
    if (error) {
      const errorData = (error as any)?.data
      const errorMsg = 
        errorData?.message || 
        errorData?.error || 
        errorData?.msg ||
        (error as any)?.message ||
        "Login failed. Please check your credentials."
      snackbarUtil.error(errorMsg)
    }
  }, [error])

  // useEffect(() => {
  //   if (token) {
  //     nav("/main")
  //   }
  // }, [token])

  return (
    <div className="login-page-section_">
      <div className="login-page-container_">
        <div className="login-box_">
          <form className="login-form_" onSubmit={handleSubmit}>
            {/* <div className="login-brand_">{domain}</div> */}
            <div className="login-brand_img"><img src={loginImg} alt="" /></div>
            <div className="login-input-group_">
              <div className="input-wrapper">
                {/* <span className="input-addon">C</span> */}
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="Username"
                  value={clientCode}
                  onChange={e => setClientCode(e.target.value)}
                  className="login-input-field_ username-input-field_   "
                />
              </div>
            </div>
            <div className="login-input-group_">
              <input
                type="password"
                autoComplete="off"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="login-input-field_ password-input-field_"
              />
            </div>
            <div className="login-action-btn_">
              <button
                className="sign-me-btn_"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="loader_login"></div>
                ) : (
                  <span className="">Login</span>
                )}
              </button>
            </div>
            <div className="login-action-btn_ login-action-btn-secondary_">
              <button className="sign-me-btn_" type="button">
                Login with DEMO ID
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="login-note-bar_">Note : This Website is not for Indian Territory 18+ Only</div>
    </div>
  )
}

export default NewLoginPage
