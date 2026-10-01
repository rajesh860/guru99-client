import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.scss"
import { BrowserRouter as Router } from "react-router-dom"
import { SnackbarProvider } from "notistack"
import Slide, { type SlideProps } from "@mui/material/Slide"
import { Provider } from "react-redux"
import { store } from "../store/store"
import { SnackbarUtilsConfigurator } from "./utils/Snackbar"

// A stale cached index.html can keep referencing a lazy chunk that a later deploy has
// since deleted — a plain reload() can still be served that same cached HTML from the
// browser's own disk cache (index.html isn't always sent with cache-busting headers),
// looping forever. Force a real network fetch via a cache-busted URL instead, and cap
// retries so a genuine outage doesn't spin forever.
window.addEventListener('vite:preloadError', () => {
  const key = 'preloadErrorRetryCount'
  const attempts = Number(sessionStorage.getItem(key) || '0')
  if (attempts >= 2) return
  sessionStorage.setItem(key, String(attempts + 1))
  const url = new URL(window.location.href)
  url.searchParams.set('_r', Date.now().toString())
  window.location.replace(url.toString())
})

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
  sessionStorage.removeItem('preloadErrorRetryCount')
} else {
  throw new Error(
    "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file.",
  )
}
