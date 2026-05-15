import { Link } from "react-router-dom"

interface Props {
  to: string
  name: string
}

const BackBtn = ({ to, name }: Props) => {
  return (
    <div className="menu_back">
      <ul className="navMain">
        <li className="active">
          <Link to={to}>{name}</Link>
        </li>
      </ul>
    </div>
  )
}

export default BackBtn
