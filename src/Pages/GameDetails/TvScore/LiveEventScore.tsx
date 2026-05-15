import { useEffect, useState } from 'react'

interface Props {
  eventId: string
}

const LiveEventScore = ({ eventId }: Props) => {
  const [score, setScore] = useState('')

  const fetchScore = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_ODDS_API}/betfair_api/fancy/score/${eventId}`
      )
      const data = await response.json()
      if (data?.success) {
        setScore(data?.data?.data)
      }
    } catch (error) {
      setScore('')
    }
  }

  useEffect(() => {
    fetchScore()
    const interval = setInterval(fetchScore, 1000)
    return () => clearInterval(interval)
  }, [])

  return <div dangerouslySetInnerHTML={{ __html: score }} />
}

export default LiveEventScore
