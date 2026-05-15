import React from "react"
import "./styles.scss"
import ThemeSwitcher from "../ThemeSwitcher/ThemeSwitcher"

const Footer = () => {
  return (
    <>
      <div className="footer">
        <h4>Copy Right  @<span style={{textTransform:"uppercase"}}>{window.location.hostname}</span> 2025</h4>
      </div>
      <div className="theme-switcher-fixed">
        <ThemeSwitcher />
      </div>
    </>
  )
}

export default Footer
