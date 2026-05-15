import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.scss"
import { BrowserRouter as Router } from "react-router-dom"
import { SnackbarProvider } from "notistack"
import Slide, { type SlideProps } from "@mui/material/Slide"
import { Provider } from "react-redux"
import { store } from "../store/store"
import { SnackbarUtilsConfigurator } from "./utils/Snackbar"

const container = document.getElementById("root")

if (container) {
  const root = createRoot(container)

  const SlideDownTransition = (props: SlideProps) => (
    <Slide {...props} direction="down" />
  )

  root.render(
    <Router>
      <SnackbarProvider
        maxSnack={2}
        autoHideDuration={1500}
        className="snack_bar"
        anchorOrigin={{ horizontal: "center", vertical: "top" }}
        TransitionComponent={SlideDownTransition}
        iconVariant={{
          success: (
            <img
              src="/img/download.svg"
              alt="logo"
              style={{ height: " 22px", marginRight: "12px" }}
            />
          ),
        }}
      >
        <Provider store={store}>
          <App />
          <SnackbarUtilsConfigurator />
        </Provider>
      </SnackbarProvider>
    </Router>,
  )
} else {
  throw new Error(
    "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file.",
  )
}
