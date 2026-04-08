import { useState, useEffect } from 'react'
import type { MilkyWayNight } from '../types'
import { getMilkyWayForecast } from '../lib/milkyway'

export function useMilkyWay(lat: number, lng: number, days: number = 30) {
  const [nights, setNights] = useState<MilkyWayNight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      const data = getMilkyWayForecast(lat, lng, days)
      setNights(data)
      setLoading(false)
    }, 50)
    return () => clearTimeout(timer)
  }, [lat, lng, days])

  return { nights, loading }
}
