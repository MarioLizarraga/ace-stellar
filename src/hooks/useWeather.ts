import { useState, useEffect } from 'react'
import type { DailyForecast } from '../types'
import { fetchWeatherForecast } from '../lib/weather-api'

export function useWeather(lat: number, lng: number) {
  const [forecast, setForecast] = useState<DailyForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchWeatherForecast(lat, lng)
      .then((data) => {
        if (!cancelled) {
          setForecast(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [lat, lng])

  return { forecast, loading, error }
}
