import { Box, Checkbox, FormControlLabel, TextField } from "@mui/material"
import { markLudoLaunchPopup } from "../../Component/LudoLaunchModal/LudoLaunchModal"
import { useEffect, useState } from "react"
import "./login.scss"
import { useLoginMutation } from "../../../store/service/authService"
import { useNavigate } from "react-router-dom"
import snackbarUtil from "../../utils/Snackbar"

const Login = () => {
  const [clientCode, setClientCode] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)

  const [errors, setErrors] = useState({
    clientCode: "",
    password: "",
  })
  const nav = useNavigate()
  const [trigger, { data, isLoading }] = useLoginMutation()

  const handleBlur = (field: any) => {
    let formErrors: any = { ...errors }

    if (field === "clientCode" && !clientCode) {
      formErrors.clientCode = "Client Code is required"
    } else if (field === "password" && !password) {
      formErrors.password = "Password is required"
    } else {
      formErrors[field] = ""
    }

    setErrors(formErrors)
  }

  const handleSubmit = (event: any) => {
    event.preventDefault()
    let formErrors = { clientCode: "", password: "" }

    if (!clientCode) {
      formErrors.clientCode = "Client Code is required"
    }
    if (!password) {
      formErrors.password = "Password is required"
    }

    setErrors(formErrors)

    if (!formErrors.clientCode && !formErrors.password) {
      // if (!rememberMe) {
      //   snackbarUtil.error("Please accept Remember Me to continue.")
      //   return
      // }

      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const appUrl = import.meta.env.DEV
        ? "localhost"
        : apiBase ? new URL(apiBase).hostname : window.location.hostname
      trigger({
        username: "C" + clientCode,
        password: password,
        panel: "client",
        appUrl,
      })
    }
  }

  const token = localStorage.getItem("client-token")

  useEffect(() => {
    if (data) {
      if (data?.token) {
        nav("/tc")
        localStorage.setItem("client-token", data?.token)
        markLudoLaunchPopup()
        if (data?.userId) localStorage.setItem("userId", data.userId)

        // snackbarUtil.success(data?.message)
      } else {
        snackbarUtil.error(data?.message)
      }
    }
  }, [data, nav])

  // useEffect(() => {
  //   if (token) {
  //     nav("/main")
  //   }
  // }, [token])

  const hostname = window.location.hostname
  const doamin = hostname?.includes("1expro") ? "1EXPRO" : "Betexch"
  return (
    <div className="login-wrapper">
      <div className="box">
        <p className="head_name">
          {/* <b>{domainName}</b> */}
          {/* <b>{domainName}</b> */}
          <b>{doamin}</b>
        </p>
        <p className="title_name">Sign in</p>
        <form
          noValidate
          className="example-form ng-untouched ng-pristine ng-invalid"
          onSubmit={handleSubmit}
        >
          <Box
            component="form"
            sx={{ "& > :not(style)": { my: 1 }, width: "100%" }}
            noValidate
            autoComplete="off"
          >
            <div className="position-relative">
              <TextField
                id="client-code"
                label="Client Code*"
                variant="outlined"
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-notchedOutline": {
                    padding: "0 22px", // Apply padding to the notchedOutline
                  },
                }}
                value={clientCode}
                onChange={e => setClientCode(e.target.value)}
                onBlur={() => handleBlur("clientCode")}
                error={!!errors.clientCode}
                InputProps={{
                  sx: { paddingLeft: "20px" },
                }}
                InputLabelProps={{
                  sx: { paddingLeft: "20px" },
                  // shrink: true,
                }}
              />
              <span className="sub_c">C</span>
            </div>
            <TextField
              // id="outlined-basic"
              id="client-code"
              label="Password*"
              variant="outlined"
              sx={{ width: "100%", ml: 0, mr: 0 }}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onBlur={() => handleBlur("password")}
              error={!!errors.password}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
              }
              label="Remember me"
            />
          </Box>
          <button
            type="submit"
            className="btn-block loginButton"
            style={{ padding: "8px 22px" }}
          >
            <span className="mdc-button__label"> SIGN IN </span>
          </button>
        </form>
        <p className="copyRight">
          Copyright ©{window.location.hostname} 2025.
        </p>
      </div>
    </div>
  )
}

export default Login
