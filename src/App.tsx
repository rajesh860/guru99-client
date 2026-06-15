import { Route, Routes, Navigate } from "react-router-dom"
import { Suspense, lazy, useEffect } from "react"
import "./App.scss"
import CommonLodding from "./Component/CommonLodding"
import ProtectedRoute from "./Component/ProtectedRoute"
import NewLoginPage from "./Pages/Login/NewLoginPage"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import LayoutOld from "./Component/LayoutOld"
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
const CasinoDetail = lazy(() => import("./Pages/Casino/CasinoDetail"))
const Matka = lazy(() => import("./Pages/matka"))
const DicePage    = lazy(() => import("./Pages/Dice/DicePage"))
const AviatorGame = lazy(() => import("./Pages/Aviator/AviatorGame"))
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
                <Route path="/dice" element={<DicePage />} />
                <Route path="/aviator" element={<AviatorGame />} />
                <Route path="/satta-matka/:gameName" element={<MatkaDetail />} />
                {/* Casino routes — list + detail active, others blocked */}
                <Route path="/casino-list"       element={<Casino />} />
                <Route path="/casino/detail/:id" element={<CasinoDetail />} />
                <Route path="/casino/:id"        element={<Navigate to="/main" replace />} />
                <Route path="/lucky7/:id"        element={<Navigate to="/main" replace />} />
                <Route path="/casino-bets"       element={<Navigate to="/main" replace />} />
                <Route path="/inplay" element={<Inpaly />} />
                <Route path="/complete" element={<Complete />} />
                <Route path="/ledger" element={<Ledger />} />
                <Route path="/casino-ledger/:game/:date" element={<CasinoLedger />} />
                <Route path="/statement" element={<Statement />} />
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
