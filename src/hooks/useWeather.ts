import { useState, useEffect } from 'react'
import type { DailyForecast } from '../types'
import { fetchWeatherForecast } from '../lib/weather-api'

async function fetchWithRetry(lat: number, lng: number, retries = 3, delay = 1000): Promise<DailyForecast[]> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fetchWeatherForecast(lat, lng)
    } catch (err) {
      if (attempt === retries - 1) throw err
      await new Promise((r) => setTimeout(r, delay * (attempt + 1)))
    }
  }
  throw new Error('Weather API request failed')
}

let fetchQueue = 0

export function useWeather(lat: number, lng: number) {
  const [forecast, setForecast] = useState<DailyForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    // Stagger requests so we don't hit the API all at once
    const staggerDelay = fetchQueue++ * 500

    const timer = setTimeout(() => {
      fetchWithRetry(lat, lng)
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
    }, staggerDelay)

    return () => {
      cancelled = true
      clearTimeout(timer)
      fetchQueue = Math.max(0, fetchQueue - 1)
    }
  }, [lat, lng])

  return { forecast, loading, error }
}
