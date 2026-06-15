import { useParams } from "react-router-dom"
import TeenPattiGame from "../../Component/casinoDetail/teenPatti"
import DiceGame from "../../Component/casinoDetail/Dice/DiceGame"
import ComingSoon from "../../Component/casinoDetail/ComingSoon"

const CasinoDetail = () => {
  const { id } = useParams()

  if (id === "51") return <TeenPattiGame />
  if (id === "99") return <DiceGame />

  return <ComingSoon />
}

export default CasinoDetail