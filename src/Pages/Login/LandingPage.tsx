import { Box, Button, Checkbox, FormControlLabel, Paper, TextField, Typography } from "@mui/material"
import { markLudoLaunchPopup } from "../../Component/LudoLaunchModal/LudoLaunchModal"
import "./LandingPage.css"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLoginMutation } from "../../../store/service/authService"
import snackbarUtil from "../../utils/Snackbar"

const backgroundStyles = {
  minHeight: "100vh",
  background: "linear-gradient(to bottom, #305080 60%, #204080 100%)",
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden"
}

export default function LandingPage() {
  const [clientCode, setClientCode] = useState("")
  const [password, setPassword] = useState("")
  const token = localStorage.getItem("client-token")

  const [errors, setErrors] = useState({
    clientCode: "",
    password: ""
  })
  const nav = useNavigate()
  const [trigger, { data, isLoading }] = useLoginMutation()

  const handleSubmit = (event: any) => {
    event.preventDefault()
    let formErrors = { clientCode: "", password: "" }

    if (!clientCode) {
      snackbarUtil.error("UserId is required")
    }
    if (!password) {
      snackbarUtil.error("Password is required")
    }

    setErrors(formErrors)

    if (!formErrors.clientCode && !formErrors.password) {
      trigger({
        username: "C" + clientCode,
        password: password,
        appUrl: window.location.hostname,
        // url: "fastbet365.in",
        // url: "betguru365.in",
        
      })
    }
  }

  useEffect(() => {
    if (data) {
      if (data?.token) {
        nav("/tc")
        localStorage.setItem("client-token", data?.token)
        markLudoLaunchPopup()
        if (data?.userId) localStorage.setItem("userId", data.userId)
        localStorage.setItem('firstTimeLogin', `${data?.firstTimeLogin}`)
        snackbarUtil.success("Success")
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

  return (
    <Box sx={backgroundStyles}>
      <Box
        sx={{
          position: "absolute",
          width: "100vw",
          height: "100vh",
          backgroundImage: "linear-gradient(rgb(35 58 107), hsla(0, 0%, 100%, 0.6)), url('/img/landing_bg.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 1
        }}
      />
      <Box
        className="animation-container"
        sx={{ position: "absolute", zIndex: 1, height: "100%" }}
      >
        <Box className="lightning-container">
          <Box className="lightning white" />
          <Box className="lightning red" />
        </Box>
        <Box className="boom-container">
          <Box className="shape circle big white" />
          <Box className="shape circle white" />
          <Box className="shape triangle big yellow" />
          <Box className="shape disc white" />
          <Box className="shape triangle blue" />
        </Box>
        <Box className="boom-container second">
          <Box className="shape circle big white" />
          <Box className="shape circle white" />
          <Box className="shape disc white" />
          <Box className="shape triangle blue" />
        </Box>
      </Box>
      <Paper
        elevation={6}
        sx={{
          position: "relative",
          padding: "44px 40px 40px", // extra space below for aesthetics
          width: "350px",
          zIndex: 2,
          textAlign: "center",
          borderRadius: 2,
          background: "hsla(0, 0%, 100%, 0.7294117647058823)"
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={4}>
          <span style={{ color: "#1976d2" }}>BET GURU</span>
        </Typography>

        {/* Floating "Sign in" Label */}
        <Box
          sx={{
            position: "absolute",
            top: "-22px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(-180deg, #315195 0%, #14213D 100%)",
            px: 6,
            py: "4px",
            borderRadius: 1,
            boxShadow: 1,
            width: "75%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "50px"
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              color: "#fc0",
              fontWeight: 600,
              fontSize: "0.95rem"
            }}
          >
            Sign in
          </Typography>
        </Box>

        <form
          onSubmit={handleSubmit}
        >
          <TextField
            size='small'
            label="Username"
            fullWidth
            margin="normal"
            InputProps={{
              startAdornment: <span role="img" className="pe-2" aria-label="user">C</span>
            }}
            value={clientCode}
            style={{ background: "white" }}
            onChange={e => setClientCode(e.target.value)}
          />
          <TextField
            size='small'
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            InputProps={{
              startAdornment: <span role="img" className="pe-2" aria-label="lock">🔒</span>
            }}
            value={password}
            style={{ background: "white" }}
            onChange={e => setPassword(e.target.value)}
          />
          <FormControlLabel
            control={<Checkbox color="primary" />}
            label="Remember me"
            sx={{ float: "left" }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              color: "#fc0",
              mt: 2,
              width: "100%",
              background: "linear-gradient(-180deg, #315195 0%, #14213D 100%)"
            }}
          >
            {isLoading ? "Logging in..." : "LOG IN"}{" "}
          </Button>
        </form>
      </Paper>
    </Box>
  )
}
