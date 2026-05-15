import React from "react"
import Header from "./Header/Header"
import Menu from "./Menu/Menu"
import Footer from "./Footer/Footer"
import { Outlet } from "react-router-dom"

const LayoutOld = () => {
  return (
    <>

      <div className="contant_old" style={{
        lineHeight: "1.3",
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <Header />
        <Menu />
        <div className="content">
          <Outlet />
        </div>
        <Footer />
      </div>
    </>
  )
}

export default LayoutOld
