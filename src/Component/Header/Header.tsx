/* eslint-disable @typescript-eslint/no-restricted-imports */
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import Menu from "../Menu/Menu"
import "./header.scss"
import {
  useGetUserBalanceQuery,
  useLogOutMutation,
} from "../../../store/service/userServices/userServices"
import snackbarUtil from "../../utils/Snackbar"
import { useSelector } from "react-redux"

const Header = () => {
  const [showExposureModal, setShowExposureModal] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [logOut, { data }] = useLogOutMutation()
  const token = localStorage.getItem("client-token")
  const userId = localStorage.getItem("userId")
  const { data: userBalance } = useGetUserBalanceQuery(undefined, {
    pollingInterval: 1000,
    refetchOnMountOrArgChange: true,
    skip: !token,
  })
  const navigator = useNavigate()
  const handleLogOut = () => {
    logOut()
    localStorage.clear()
    navigator("/login")
    snackbarUtil.success("Logout Successfull")
  }
  const { pathname } = useLocation()
  const splitUrl = pathname.split("/")[1]

  const usedCoin = useSelector((state: any) => state?.user)
  return (
    <div className="hedaer_main">
      <table
        width="100%"
        border={0}
        cellSpacing={0}
        cellPadding={0}
        className="main-header"
      >
        <tbody>
          <tr>
            <td width={90} >
              <Link to="/main">
                <img src="/logo/login.png" alt="" className="profile_img" />
              </Link>
            </td>
            {/**/}
            <td
              align="left"
              className="FontTextWhite ng-star-inserted"
              style={{ verticalAlign: "center" }}
            >
              <div className="profile_picture_name">
                <h1
                  style={{
                    textTransform: "uppercase",
                  }}
                >
                  {userBalance?.data?.userId || userId}
                </h1>
              </div>
              <div className="profile_coin">
                <p>
                  Coins :{" "}
                  <label>{userBalance?.data?.balance?.toFixed(2)}</label>
                </p>
                <p>
                  Expo : <label 
                    onClick={() => setShowExposureModal(true)}
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                  >{userBalance?.data?.exposure.toFixed(2)}</label>
                </p>
              </div>
              {splitUrl == "cricket" ? (
                <>
                  {/* <div>
                    <p
                      style={{
                        fontSize: "xx-small",
                        margin: 0,
                        fontWeight: 700,
                      }}
                    >
                      Used Coin :
                      <span>
                        <b>{usedCoin?.usedCoin?.toFixed(2)}</b>
                      </span>
                    </p>
                  </div> */}
                  {/* <div>
                    <p
                      style={{
                        fontSize: "xx-small",
                        margin: 0,
                        fontWeight: 700,
                      }}
                    >
                      Session P/M :
                      <span style={{color:usedCoin?.sessionPlusMinus>0?"green":"red"}}>
                        <b>{usedCoin?.sessionPlusMinus?.toFixed(2) ?? 0}</b>
                      </span>
                    </p>
                  </div> */}
                </>
              ) : (
                ""
              )}
            </td>
            {/**/}
            <td
              width={55}
              className="FontTextWhite"
              onClick={() => setShowSidebar(true)}
              style={{ padding: "8px", cursor: "pointer" }}
            >
              <div>
                <svg 
                  width="30" 
                  height="30" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor"
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} />
          </tr>
        </tbody>
      </table>
      
      {/* Exposure Modal */}
      {showExposureModal && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 1000,
            paddingTop: "20px"
          }}
          onClick={() => setShowExposureModal(false)}
        >
          <div 
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
          padding: "13px",
    maxWidth: "94%",
              maxHeight: "90%",
              overflow: "auto",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              borderBottom: "1px solid #ddd",
              paddingBottom: "10px"
            }}>
              <h3 style={{ margin: 0, color: "#333" }}>Pending BETS</h3>
              <button 
                onClick={() => setShowExposureModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                ×
              </button>
            </div>
            
            {/* MATCH BETS Table */}
            <div style={{ marginBottom: "30px" }}>
              <div style={{
                backgroundColor: "black",
                color: "white",
                padding: "10px",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "14px"
              }}>
                MATCH BETS
              </div>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "12px"
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#4A5568", color: "white" }}>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>Team</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>Run</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>AMT</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>MODE</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>Profit</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>Loss</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={7} style={{ padding: "20px", textAlign: "center", color: "#666" }}>No match bets found</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* FANCY BETS Table */}
            <div>
              <div style={{
                backgroundColor: "black",
                color: "white",
                padding: "10px",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "14px"
              }}>
                FANCY BETS
              </div>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "12px"
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#4A5568", color: "white" }}>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>Team</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>Run</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>AMT</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>MODE</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>Profit</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>Loss</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={7} style={{ padding: "20px", textAlign: "center", color: "#666" }}>No fancy bets found</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* CASINO BETS Table */}
            <div style={{ marginTop: "30px" }}>
              <div style={{
                backgroundColor: "black",
                color: "white",
                padding: "10px",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "14px"
              }}>
                CASINO BETS
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "12px",
                  minWidth: "800px"
                }}>
                <thead>
                  <tr style={{ backgroundColor: "#4A5568", color: "white" }}>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>Game</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>Selection</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>Odds</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>AMT</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>MODE</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>Profit</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>Loss</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ddd" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={8} style={{ padding: "20px", textAlign: "center", color: "#666" }}>No casino bets found</td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Menu */}
      {showSidebar && (
        <>
          {/* Overlay */}
          <div 
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 9998,
              animation: "fadeIn 0.3s ease-out"
            }}
            onClick={() => setShowSidebar(false)}
          />
          
          {/* Sidebar */}
          <div 
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "230px",
              backgroundColor: "var(--color-sidebarBg)",
              zIndex: 9999,
              boxShadow: "2px 0 10px rgba(0,0,0,0.5)",
              animation: "slideInLeft 0.3s ease-out",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Header with Logo and Username */}
            <div style={{
              background: "var(--color-surface)",
              padding: "12px 20px",
              color: "var(--color-text)"
            }}>
              <div style={{ textAlign: "center", marginBottom: "15px" }}>
                <img src="/img/user.png" alt="Logo" style={{ width: "80px", height: "80px", borderRadius: "50%", border: "3px solid white" }} />
              </div>
              <h3 style={{ margin: 0, textAlign: "center", fontSize: "18px", textTransform: "uppercase" }}>
                {userBalance?.data?.userId || userId}
              </h3>
              <p style={{ margin: "5px 0 0 0", textAlign: "center", fontSize: "14px", opacity: 0.9 }}>
                Balance: {userBalance?.data?.balance?.toFixed(2)}
              </p>
            </div>

            {/* Menu Items */}
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
              <Link 
                to="/inplay" 
                onClick={() => setShowSidebar(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "15px 20px",
                  color: "var(--color-text)",
                  textDecoration: "none",
                  borderBottom: "1px solid var(--color-border)",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <img src="/img/crick.png" alt="" style={{ width: "30px", height: "30px", marginRight: "15px" }} />
                <span style={{ fontSize: "16px", fontWeight: "500" }}>In Play</span>
              </Link>

              <div
                onClick={() => snackbarUtil.info("Coming Soon!")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "15px 20px",
                  color: "var(--color-text)",
                  borderBottom: "1px solid var(--color-border)",
                  transition: "background 0.2s",
                  position: "relative",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <img src="/img/matka.png" alt="" style={{ width: "30px", height: "30px", marginRight: "15px" }} />
                <span style={{ fontSize: "16px", fontWeight: "500" }}>Matka</span>
                <span style={{
                  marginLeft: "auto",
                  background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: "700",
                  padding: "3px 8px",
                  borderRadius: "20px",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  boxShadow: "0 2px 8px rgba(238,90,36,0.5)"
                }}>Coming Soon</span>
              </div>

              <Link 
                to="/statement" 
                onClick={() => setShowSidebar(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "15px 20px",
                  color: "var(--color-text)",
                  textDecoration: "none",
                  borderBottom: "1px solid var(--color-border)",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <img src="/img/settlmen.png" alt="" style={{ width: "30px", height: "30px", marginRight: "15px" }} />
                <span style={{ fontSize: "16px", fontWeight: "500" }}>Statement</span>
              </Link>

              <Link 
                to="/ledger" 
                onClick={() => setShowSidebar(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "15px 20px",
                  color: "var(--color-text)",
                  textDecoration: "none",
                  borderBottom: "1px solid var(--color-border)",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <img src="/img/CL.png" alt="" style={{ width: "30px", height: "30px", marginRight: "15px" }} />
                <span style={{ fontSize: "16px", fontWeight: "500" }}>My Ledger</span>
              </Link>

              <Link 
                to="/complete" 
                onClick={() => setShowSidebar(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "15px 20px",
                  color: "var(--color-text)",
                  textDecoration: "none",
                  borderBottom: "1px solid var(--color-border)",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <img src="/img/CG1.jpg" alt="" style={{ width: "30px", height: "30px", marginRight: "15px" }} />
                <span style={{ fontSize: "16px", fontWeight: "500" }}>Complete Games</span>
              </Link>

              <Link 
                to="/password" 
                onClick={() => setShowSidebar(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "15px 20px",
                  color: "var(--color-text)",
                  textDecoration: "none",
                  borderBottom: "1px solid var(--color-border)",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <img src="/img/CP.png" alt="" style={{ width: "30px", height: "30px", marginRight: "15px" }} />
                <span style={{ fontSize: "16px", fontWeight: "500" }}>Change Password</span>
              </Link>

              <Link 
                to="/profile" 
                onClick={() => setShowSidebar(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "15px 20px",
                  color: "var(--color-text)",
                  textDecoration: "none",
                  borderBottom: "1px solid var(--color-border)",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <img src="/img/Profile.png" alt="" style={{ width: "30px", height: "30px", marginRight: "15px" }} />
                <span style={{ fontSize: "16px", fontWeight: "500" }}>My Profile</span>
              </Link>

              {/* Logout */}
              <div 
                onClick={() => {
                  setShowSidebar(false)
                  handleLogOut()
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "15px 20px",
                  color: "var(--color-error)",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--color-border)",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <img src="/img/LGTop.png" alt="" style={{ width: "30px", height: "30px", marginRight: "15px" }} />
                <span style={{ fontSize: "16px", fontWeight: "500" }}>Logout</span>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideInLeft {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}
    </div>
  )
}

export default Header
