import React from "react"
import Header from "./Header/Header"
import Menu from "./Menu/Menu"
import Footer from "./Footer/Footer"
import { Outlet } from "react-router-dom"

const Layout = () => {
  return (
    <>
      <Header />
      <Menu />
      <div className="contant_old" style={{lineHeight: "1.3"}}>
        <div className="content">
          <Outlet />
        </div>
      </div>

      <Footer />
    </>
  )
}

export default Layout
