import Marquee from "react-fast-marquee"
import "./menu.scss"
import { Link } from "react-router-dom"
import { useGetMessageQuery } from "../../../store/service/userServices/userServices"

const Menu = () => {
  const token = localStorage.getItem("client-token")

  const { data: msgData } = useGetMessageQuery(undefined, { skip: !token })
  
  const marqueeText = 
    msgData?.data?.[0]?.content || 
    msgData?.data?.content ||
    "IF ANYBODY FOUND CHEATING OR GROUP BETTING. THE BETS WILL BE VOIDED WITHOUT PRIOR NOTICE."

    return (
    <div className="menu_marqueee">
      <ul className="navMain">
        <li className="active">
          <Link to="#" className="mar_head" style={{ height: "30px" }}>
            <Marquee>{marqueeText}</Marquee>
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default Menu
