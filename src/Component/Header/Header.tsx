/* eslint-disable @typescript-eslint/no-restricted-imports */
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import "./header.scss"
import {
  useGetUserBalanceQuery,
  useLogOutMutation,
  useGetPendingBetsQuery,
} from "../../../store/service/userServices/userServices"
import snackbarUtil from "../../utils/Snackbar"

const NAV_ITEMS = [
  { to: "/inplay",    icon: "/img/crick.png",    label: "In Play" },
  { to: "/statement", icon: "/img/settlmen.png", label: "Statement" },
  { to: "/ledger",    icon: "/img/CL.png",        label: "My Ledger" },
  { to: "/complete",  icon: "/img/CG1.jpg",       label: "Complete Games" },
  { to: "/password",  icon: "/img/CP.png",        label: "Change Password" },
  { to: "/profile",   icon: "/img/Profile.png",   label: "My Profile" },
]

const Header = () => {
  const [showExposureModal, setShowExposureModal] = useState(false)
  const [showSidebar, setShowSidebar]             = useState(false)
  const [logOut]                                  = useLogOutMutation()
  const token  = localStorage.getItem("client-token")
  const userId = localStorage.getItem("userId")
  const navigator = useNavigate()

  const { data: pendingBetsData } = useGetPendingBetsQuery(undefined, {
    skip: !showExposureModal,
    pollingInterval: showExposureModal ? 2000 : 0,
  })
  const matchBets:  any[] = pendingBetsData?.matchBets  ?? []
  const fancyBets:  any[] = pendingBetsData?.fancyBets  ?? []
  const casinoBets: any[] = pendingBetsData?.casinoBets ?? []
  const diceBets:   any[] = pendingBetsData?.diceBets   ?? []
  const matkaBets:  any[] = pendingBetsData?.matkaBets  ?? []
  const summary           = pendingBetsData?.summary

  const { data: userBalance } = useGetUserBalanceQuery(undefined, {
    pollingInterval: 1000,
    refetchOnMountOrArgChange: true,
    skip: !token,
  })

  const balance  = userBalance?.data?.balance?.toFixed(2)  ?? "0.00"
  const exposure = userBalance?.data?.exposure?.toFixed(2) ?? "0.00"
  const uId      = userBalance?.data?.userId || userId
  const fullName = userBalance?.data?.fullName

  const handleLogOut = () => {
    logOut()
    localStorage.clear()
    sessionStorage.removeItem("dicePromoShown")
    navigator("/login")
    snackbarUtil.success("Logout Successful")
  }

  return (
    <>
      {/* ── Main Header Bar ── */}
      <header className="hdr">
        {/* Logo */}
        <Link to="/main" className="hdr__logo">
          <img src="/logo/login.png" alt="logo" />
        </Link>

        {/* User info */}
        <div className="hdr__info">
          <span className="hdr__user-id">{uId}</span>
          <div className="hdr__stats">
            <div className="hdr__stat">
              <span className="hdr__stat-label">Coins</span>
              <span className="hdr__stat-value">{balance}</span>
            </div>
            <div className="hdr__divider" />
            <div
              className="hdr__stat hdr__stat--expo"
              onClick={() => setShowExposureModal(true)}
              title="View pending bets"
            >
              <span className="hdr__stat-label">Expo</span>
              <span className="hdr__stat-value hdr__stat-value--expo">{exposure}</span>
            </div>
          </div>
        </div>

        {/* Hamburger */}
        <button
          className="hdr__menu-btn"
          onClick={() => setShowSidebar(true)}
          aria-label="Open menu"
        >
          <span /><span /><span />
        </button>
      </header>

      {/* ── Exposure Modal ── */}
      {showExposureModal && (
        <div className="modal-overlay" onClick={() => setShowExposureModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>

            {/* Sticky header */}
            <div className="modal-header">
              <span className="modal-title">Pending Bets</span>
              <button className="modal-close" onClick={() => setShowExposureModal(false)}>✕</button>
            </div>

            {/* Sticky summary */}
            {summary && (
              <div className="modal-summary">
                <span>Match <b>{summary.matchBetsCount}</b></span>
                <span>Fancy <b>{summary.fancyBetsCount}</b></span>
                <span>Casino <b>{summary.casinoBetsCount}</b></span>
                <span>Dice <b>{summary.diceBetsCount}</b></span>
                <span>Matka <b>{summary.matkaBetsCount}</b></span>
                <span className="modal-summary__total">Total <b>{summary.totalPending}</b></span>
              </div>
            )}

            {/* Scrollable sections */}
            <div className="modal-body">

              {/* Match Bets */}
              <div className="modal-section">
                <div className="modal-section-title">MATCH BETS ({matchBets.length})</div>
                <div className="modal-table-wrap">
                  <table className="modal-table">
                    <thead><tr>{["Team","Run","Amt","Mode","Profit","Loss","Date"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {matchBets.length > 0 ? matchBets.map((b:any, i:number) => (
                        <tr key={b._id ?? i}>
                          <td>{b.team}</td><td>{b.run}</td><td>{b.amt}</td>
                          <td className={`modal-mode modal-mode--${b.mode}`}>{b.mode}</td>
                          <td className="td-green">{b.profit}</td>
                          <td className="td-red">{b.loss}</td>
                          <td>{b.date}</td>
                        </tr>
                      )) : <tr><td colSpan={7} className="modal-empty">No match bets</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fancy Bets */}
              <div className="modal-section">
                <div className="modal-section-title">FANCY BETS ({fancyBets.length})</div>
                <div className="modal-table-wrap">
                  <table className="modal-table">
                    <thead><tr>{["Team","Run","Size","Amt","Mode","Profit","Loss","Date"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {fancyBets.length > 0 ? fancyBets.map((b:any, i:number) => (
                        <tr key={b._id ?? i}>
                          <td>{b.team}</td><td>{b.run}</td><td>{b.size}</td><td>{b.amt}</td>
                          <td className={`modal-mode modal-mode--${b.mode}`}>{b.mode}</td>
                          <td className="td-green">{b.profit}</td>
                          <td className="td-red">{b.loss}</td>
                          <td>{b.date}</td>
                        </tr>
                      )) : <tr><td colSpan={8} className="modal-empty">No fancy bets</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Casino Bets */}
              <div className="modal-section">
                <div className="modal-section-title">CASINO BETS ({casinoBets.length})</div>
                <div className="modal-table-wrap">
                  <table className="modal-table">
                    <thead><tr>{["Game","Selection","Odds","Stake","Pot.Win","Type","Date"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {casinoBets.length > 0 ? casinoBets.map((b:any, i:number) => (
                        <tr key={b._id ?? i}>
                          <td>{b.game ?? "—"}</td>
                          <td>{b.selection ?? b.team ?? "—"}</td>
                          <td>{b.odds ?? "—"}</td>
                          <td>{b.stake ?? b.amt ?? "—"}</td>
                          <td className="td-green">{b.potentialWin ?? b.profit ?? "—"}</td>
                          <td className={`modal-mode modal-mode--${b.betType ?? b.mode}`}>{b.betType ?? b.mode ?? "—"}</td>
                          <td>{b.date}</td>
                        </tr>
                      )) : <tr><td colSpan={7} className="modal-empty">No casino bets</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dice Bets */}
              <div className="modal-section">
                <div className="modal-section-title">DICE BETS ({diceBets.length})</div>
                <div className="modal-table-wrap">
                  <table className="modal-table">
                    <thead><tr>{["Bet On","Type","Odds","Stake","Pot.Win","Profit","Loss","Date"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {diceBets.length > 0 ? diceBets.map((b:any, i:number) => (
                        <tr key={b._id ?? i}>
                          <td><b>{b.betOn}</b></td>
                          <td style={{textTransform:"capitalize"}}>{b.betType}</td>
                          <td>{b.odds}</td><td>{b.stake}</td>
                          <td className="td-green">{b.potentialWin}</td>
                          <td className="td-green">{b.profit}</td>
                          <td className="td-red">{b.loss}</td>
                          <td>{b.date}</td>
                        </tr>
                      )) : <tr><td colSpan={8} className="modal-empty">No dice bets</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Matka Bets */}
              <div className="modal-section">
                <div className="modal-section-title">MATKA BETS ({matkaBets.length})</div>
                <div className="modal-table-wrap">
                  <table className="modal-table">
                    <thead><tr>{["Market","Number","Type","Rate","Stake","Pot.Win","Date"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {matkaBets.length > 0 ? matkaBets.map((b:any, i:number) => (
                        <tr key={b._id ?? i}>
                          <td style={{textTransform:"capitalize"}}>{b.market}</td>
                          <td><b>{b.number}</b></td>
                          <td style={{textTransform:"capitalize"}}>{b.betType?.replace(/_/g," ")}</td>
                          <td>{b.rate}</td><td>{b.stake}</td>
                          <td className="td-green">{b.potentialWin}</td>
                          <td>{b.date}</td>
                        </tr>
                      )) : <tr><td colSpan={7} className="modal-empty">No matka bets</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>{/* end modal-body */}
          </div>{/* end modal-box */}
        </div>
      )}

      {/* ── Sidebar ── */}
      {showSidebar && (
        <>
          <div className="sidebar-overlay" onClick={() => setShowSidebar(false)} />
          <aside className="sidebar">
            {/* Sidebar header */}
            <div className="sidebar__head">
              <span className="sidebar__fullName">
                {fullName ? `${fullName} (${uId})` : uId}
              </span>
              <div className="sidebar__statsRow">
                <span className="sidebar__balance">₹ {balance}</span>
                <span className="sidebar__exposure">Exposure: {exposure}</span>
              </div>
            </div>

            {/* Nav links */}
            <nav className="sidebar__nav">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="sidebar__item"
                  onClick={() => setShowSidebar(false)}
                >
                  <img src={item.icon} alt="" className="sidebar__icon" />
                  <span>{item.label}</span>
                  <svg className="sidebar__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              ))}

              {/* Matka */}
              <Link
                to="/satta-matka"
                className="sidebar__item"
                onClick={() => setShowSidebar(false)}
              >
                <img src="/casino/matka.png" alt="" className="sidebar__icon" />
                <span>Matka</span>
                <svg className="sidebar__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>

              {/* Dice */}
              <Link
                to="/casino/detail/99"
                className="sidebar__item"
                onClick={() => setShowSidebar(false)}
              >
                <img src="/img/dice.png" alt="" className="sidebar__icon" />
                <span>Dice</span>
                <svg className="sidebar__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>

              {/* Roulette — coming soon */}
              <button
                className="sidebar__item"
                onClick={() => { setShowSidebar(false); snackbarUtil.info("Coming Soon!") }}
              >
                <img src="/img/roulete.png" alt="" className="sidebar__icon" />
                <span>Roulette</span>
                <svg className="sidebar__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Aviator */}
              <Link
                to="/aviator"
                className="sidebar__item"
                onClick={() => setShowSidebar(false)}
              >
                <img src="/img/aviator.png" alt="" className="sidebar__icon" />
                <span>Aviator</span>
                <svg className="sidebar__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>

              {/* Logout */}
              <button
                className="sidebar__item sidebar__item--logout"
                onClick={() => { setShowSidebar(false); handleLogOut() }}
              >
                <img src="/img/LGTop.png" alt="" className="sidebar__icon" />
                <span>Logout</span>
              </button>
            </nav>
          </aside>
        </>
      )}
    </>
  )
}

export default Header
