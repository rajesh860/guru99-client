import { useNavigate } from "react-router-dom"
import "./CasinoGameSelect.scss"

const GAMES = [
  { id: "52", name: "Dragon Tiger 20-20" },
  { id: "51", name: "Teen Patti 20-20" },
  { id: "53", name: "Lucky 7 - B" },
  { id: "62", name: "Amar Akbar Anthony" },
  { id: "55", name: "32 Cards" },
  { id: "99", name: "Dice Game" },
]

interface Props {
  currentId: string
}

const CasinoGameSelect = ({ currentId }: Props) => {
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    if (id === currentId) return
    navigate(`/casino/detail/${id}`)
  }

  return (
    <div className="cgs-wrap">
      <span className="cgs-icon">🎲</span>
      <select className="cgs-select" value={currentId} onChange={handleChange}>
        {GAMES.map(g => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </select>
      <span className="cgs-chevron">▾</span>
    </div>
  )
}

export default CasinoGameSelect
