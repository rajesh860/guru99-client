import { Route, Routes } from "react-router-dom"
import { Suspense, lazy, useEffect } from "react"
import "./App.scss"
import CommonLodding from "./Component/CommonLodding"
import ProtectedRoute from "./Component/ProtectedRoute"
import NewLoginPage from "./Pages/Login/NewLoginPage"
import TeenPattiGame from "./Component/casinoDetail/teenPatti"
import CasinoBets from "./Pages/casinoBets"
import AndarBhar from "./Component/casinoDetail/andarBhar"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import LayoutOld from "./Component/LayoutOld"
import Lucky7 from "./Component/casinoDetail/Lucky7/Lucky7"
import CasinoDetail from "./Pages/Casino/CasinoDetail"
import { ThemeProvider } from "./context/ThemeContext"

const Dashboard = lazy(() => import("./Pages/Dashboard/Dashboard"))
const Layout = lazy(() => import("./Component/Layout"))
const Inpaly = lazy(() => import("./Pages/InPlay/Inpaly"))
const TermsConditions = lazy(
  () => import("./Pages/TermsConditions/TermsConditions"),
)
const GameDeatils = lazy(() => import("./Pages/GameDetails/GameDeatils"))
const Complete = lazy(() => import("./Pages/Complete/Complete"))
const CricketResult = lazy(() => import("./Pages/Complete/CricketResult"))
const Ledger = lazy(() => import("./Pages/Ledger/Ledger"))
const CasinoLedger = lazy(() => import("./Pages/CasinoLedger/CasinoLedger"))
const Statement = lazy(() => import("./Pages/Statement/Statement"))
const Profile = lazy(() => import("./Pages/Profile/Profile"))
const ChangePassword = lazy(
  () => import("./Pages/ChangePassword/ChangePassword"),
)
const Casino = lazy(() => import("./Pages/Casino/Casino"))
const Matka = lazy(() => import("./Pages/matka"))
const MatkaDetail = lazy(() => import("./Pages/matkaDetail"))
const AllCasinoResults = lazy(() => import("./Pages/AllCasinoResults/AllCasinoResults"))

const Loading = () => (
  <>
    <CommonLodding />
  </>
)

const App = () => {
  useEffect(() => {
    document.title = "Guru99"
  }, [])
  return (
    <ThemeProvider>
      <div className="App">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<NewLoginPage />} />
            <Route path="/login" element={<NewLoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/tc" element={<TermsConditions />} />
              <Route path="/" element={<Layout />}>
                <Route path="/main" element={<Dashboard />} />
                <Route path="/satta-matka" element={<Matka />} />
                <Route path="/satta-matka/:gameName" element={<MatkaDetail />} />
                <Route path="/casino/detail/:id" element={<CasinoDetail />} />
                <Route path="/casino/:id" element={<AndarBhar />} />
                <Route path="/lucky7/:id" element={<Lucky7 />} />
                <Route path="/inplay" element={<Inpaly />} />
                <Route path="/casino-bets" element={<CasinoBets />} />
                <Route path="/complete" element={<Complete />} />
                <Route path="/ledger" element={<Ledger />} />
                <Route path="/casino-ledger/:game/:date" element={<CasinoLedger />} />
                <Route path="/statement" element={<Statement />} />
                <Route path="/casino-list" element={<Casino />} />
                <Route path="/all-casino-result/:gameType" element={<AllCasinoResults />} />
                <Route path="/cricket/:id" element={<GameDeatils />} />
                <Route path="/cricketResult/:id" element={<CricketResult />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path='/' element={<LayoutOld />} >
                <Route path="/profile" element={<Profile />} />
                  <Route path="/password" element={<ChangePassword />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </div>
    </ThemeProvider>
  )
}

export default App
