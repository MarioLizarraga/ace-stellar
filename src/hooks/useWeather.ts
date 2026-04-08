import { useState, useEffect } from 'react'
import type { DailyForecast } from '../types'
import { fetchWeatherForecast, fetchHistoricalAverages } from '../lib/weather-api'

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

export function useWeather(lat: number, lng: number, historicalDays: number = 0) {
  const [forecast, setForecast] = useState<DailyForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const staggerDelay = fetchQueue++ * 500

    const timer = setTimeout(async () => {
      try {
        // Fetch the 16-day forecast
        const forecastData = await fetchWithRetry(lat, lng)

        if (cancelled) return

        if (historicalDays > 0) {
          // Fetch historical averages for days beyond forecast
          const lastForecastDate = forecastData[forecastData.length - 1]?.date
          if (lastForecastDate) {
            const startDate = new Date(lastForecastDate + 'T00:00:00')
            startDate.setDate(startDate.getDate() + 1)
            const endDate = new Date(startDate)
            endDate.setDate(endDate.getDate() + historicalDays - 1)

            try {
              const historicalData = await fetchHistoricalAverages(
                lat,
                lng,
                startDate.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0],
              )
              if (!cancelled) {
                setForecast([...forecastData, ...historicalData])
                setLoading(false)
              }
            } catch {
              // Historical failed, still show forecast
              if (!cancelled) {
                setForecast(forecastData)
                setLoading(false)
              }
            }
          } else {
            if (!cancelled) {
              setForecast(forecastData)
              setLoading(false)
            }
          }
        } else {
          if (!cancelled) {
            setForecast(forecastData)
            setLoading(false)
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error')
          setLoading(false)
        }
      }
    }, staggerDelay)

    return () => {
      cancelled = true
      clearTimeout(timer)
      fetchQueue = Math.max(0, fetchQueue - 1)
    }
  }, [lat, lng, historicalDays])

  return { forecast, loading, error }
}
