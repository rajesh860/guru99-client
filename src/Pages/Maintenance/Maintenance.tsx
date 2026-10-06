import { useEffect, useState } from "react"
import "./Maintenance.scss"

const getTargetTime = () => {
  const target = new Date()
  target.setHours(16, 30, 0, 0)
  if (target.getTime() < Date.now()) {
    target.setDate(target.getDate() + 1)
  }
  return target.getTime()
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

const Maintenance = () => {
  const [remaining, setRemaining] = useState(() => getTargetTime() - Date.now())

  useEffect(() => {
    document.title = "Under Maintenance"
    const target = getTargetTime()
    const interval = setInterval(() => {
      const diff = target - Date.now()
      setRemaining(diff)
      if (diff <= 0) {
        clearInterval(interval)
        window.location.reload()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="maintenance-page">
      <div className="maintenance-card">
        <div className="maintenance-icon">🛠️</div>
        <h1>साइट जल्द वापस आएगी</h1>
        <p>
          साइट अभी तकनीकी कारणों से बंद है।
        </p>
        <p>अगर इस बीच किसी की बेट आएगी तो वो वैध नहीं होगी।</p>
        <div className="maintenance-divider" />
        <p className="maintenance-sub">शाम 4:30 बजे तक साइट वापस चालू हो जाएगी</p>
        <div className="maintenance-countdown">{formatTime(remaining)}</div>
      </div>
    </div>
  )
}

export default Maintenance
