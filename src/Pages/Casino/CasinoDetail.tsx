import React from "react"
import { useParams, Navigate } from "react-router-dom"
import TeenPattiGame from "../../Component/casinoDetail/teenPatti"
import Lucky7 from "../../Component/casinoDetail/Lucky7/Lucky7"
import DragonTiger from "../../Component/casinoDetail/DragonTiger/DragonTiger"
import OneDayTeenPatti from "../../Component/casinoDetail/oneDayTeenPatti"
import AAA from "../../Component/casinoDetail/Aaa"
import DragonTiger2 from "../../Component/casinoDetail/dragonTiger2/DragonTiger"



const CasinoDetail = () => {
  const { id } = useParams()

  if (!id) return null

  // Map specific ids to dedicated components
  if (id === "53") return <Lucky7 />
  if (id === "52") return <DragonTiger />
  if (id === "62") return <DragonTiger2 />
  if (id === "61") return <OneDayTeenPatti />
  if (id === "56") return <AAA />
  if (id === "51") return <TeenPattiGame />

  // Andar Bahar (id: 4) should redirect to /casino/:id route
  if (id === "4") return <Navigate to={`/casino/${id}`} replace />
  if (id === "54") return <Navigate to={`/casino/${id}`} replace />

  // Default: render TeenPatti-style component which handles multiple table ids
  return <TeenPattiGame />
}

export default CasinoDetail