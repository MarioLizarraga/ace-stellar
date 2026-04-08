import type { DailyForecast } from '../types'
import { calculateAstroScore } from './astro-score'

interface OpenMeteoDaily {
  time: string[]
  cloud_cover_mean: number[]
  relative_humidity_2m_mean: number[]
  wind_speed_10m_max: number[]
  temperature_2m_min: number[]
  dew_point_2m_min: number[]
}

interface OpenMeteoResponse {
  daily: OpenMeteoDaily
}

export async function fetchWeatherForecast(lat: number, lng: number): Promise<DailyForecast[]> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    daily: 'cloud_cover_mean,relative_humidity_2m_mean,wind_speed_10m_max,temperature_2m_min,dew_point_2m_min',
    forecast_days: '16',
    timezone: 'auto',
  })

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!response.ok) throw new Error('Weather API request failed')

  const data: OpenMeteoResponse = await response.json()

  return data.daily.time.map((date, i) => {
    const cloudCover = data.daily.cloud_cover_mean[i]
    const humidity = data.daily.relative_humidity_2m_mean[i]
    const windSpeed = data.daily.wind_speed_10m_max[i]
    const temperature = data.daily.temperature_2m_min[i]
    const dewPoint = data.daily.dew_point_2m_min[i]
    const visibility = 10000

    return {
      date,
      cloudCover,
      humidity,
      windSpeed,
      temperature,
      dewPoint,
      visibility: Math.round(visibility / 1000),
      astroScore: calculateAstroScore(cloudCover, humidity, windSpeed, visibility),
      isHistorical: false,
    }
  })
}

/**
 * Fetch historical averages for a date range by averaging the same dates
 * from the last 5 years. Used for dates beyond the 16-day forecast.
 */
export async function fetchHistoricalAverages(
  lat: number,
  lng: number,
  startDate: string,
  endDate: string,
): Promise<DailyForecast[]> {
  // Parse target dates
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  const dayCount = Math.round((end.getTime() - start.getTime()) / (86400000)) + 1
  if (dayCount <= 0) return []

  // Fetch last 5 years for the same date window
  const yearsBack = 5
  const fetches: Promise<OpenMeteoResponse | null>[] = []

  for (let y = 1; y <= yearsBack; y++) {
    const histStart = new Date(start)
    histStart.setFullYear(histStart.getFullYear() - y)
    const histEnd = new Date(end)
    histEnd.setFullYear(histEnd.getFullYear() - y)

    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      daily: 'cloud_cover_mean,relative_humidity_2m_mean,wind_speed_10m_max,temperature_2m_min,dew_point_2m_min',
      start_date: histStart.toISOString().split('T')[0],
      end_date: histEnd.toISOString().split('T')[0],
      timezone: 'auto',
    })

    fetches.push(
      fetch(`https://archive-api.open-meteo.com/v1/archive?${params}`)
        .then((r) => r.ok ? r.json() as Promise<OpenMeteoResponse> : null)
        .catch(() => null),
    )
  }

  const results = await Promise.all(fetches)
  const validResults = results.filter((r): r is OpenMeteoResponse => r !== null && r.daily?.time?.length > 0)

  if (validResults.length === 0) return []

  // Average across years for each day index
  const forecasts: DailyForecast[] = []

  for (let d = 0; d < dayCount; d++) {
    const targetDate = new Date(start)
    targetDate.setDate(targetDate.getDate() + d)
    const dateStr = targetDate.toISOString().split('T')[0]

    let cloudSum = 0, humidSum = 0, windSum = 0, tempSum = 0, dewSum = 0
    let count = 0

    for (const result of validResults) {
      if (d < result.daily.time.length) {
        const cloud = result.daily.cloud_cover_mean[d]
        const humid = result.daily.relative_humidity_2m_mean[d]
        const wind = result.daily.wind_speed_10m_max[d]
        const temp = result.daily.temperature_2m_min[d]
        const dew = result.daily.dew_point_2m_min[d]

        if (cloud != null && humid != null) {
          cloudSum += cloud
          humidSum += humid
          windSum += wind ?? 0
          tempSum += temp ?? 0
          dewSum += dew ?? 0
          count++
        }
      }
    }

    if (count > 0) {
      const cloudCover = cloudSum / count
      const humidity = humidSum / count
      const windSpeed = windSum / count
      const temperature = tempSum / count
      const dewPoint = dewSum / count
      const visibility = 10000

      forecasts.push({
        date: dateStr,
        cloudCover,
        humidity,
        windSpeed,
        temperature,
        dewPoint,
        visibility: Math.round(visibility / 1000),
        astroScore: calculateAstroScore(cloudCover, humidity, windSpeed, visibility),
        isHistorical: true,
      })
    }
  }

  return forecasts
}
