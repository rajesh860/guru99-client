import { useParams } from "react-router-dom"
import TeenPattiGame from "../../Component/casinoDetail/teenPatti"
import DiceGame from "../../Component/casinoDetail/Dice/DiceGame"
import DragonTigerGame from "../../Component/casinoDetail/DragonTiger/DragonTiger20"
import Lucky7Game from "../../Component/casinoDetail/Lucky7/Lucky7"
import AaaGame from "../../Component/casinoDetail/Aaa/index"
import ComingSoon from "../../Component/casinoDetail/ComingSoon"

const CasinoDetail = () => {
  const { id } = useParams()

  if (id === "51")  return <TeenPattiGame />
  if (id === "52")  return <DragonTigerGame />
  if (id === "53")  return <Lucky7Game />
  if (id === "62")  return <AaaGame />
  if (id === "99")  return <DiceGame />
  return <ComingSoon />
}

export default CasinoDetail
