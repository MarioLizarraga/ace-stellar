import { useState, useEffect } from 'react'
import type { MoonPhase } from '../types'
import { getMoonDataForMonth, getNextFullMoon } from '../lib/moon-api'

export function useMoonData(year: number, month: number, lat: number, lng: number) {
  const [phases, setPhases] = useState<MoonPhase[]>([])
  const [loading, setLoading] = useState(true)
  const [nextFullMoon, setNextFullMoon] = useState<{ date: Date; daysUntil: number } | null>(null)

  useEffect(() => {
    setLoading(true)
    const data = getMoonDataForMonth(year, month, lat, lng)
    setPhases(data)
    setLoading(false)
  }, [year, month, lat, lng])

  useEffect(() => {
    setNextFullMoon(getNextFullMoon())
  }, [])

  return { phases, loading, nextFullMoon }
}
