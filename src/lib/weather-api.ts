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
    }
  })
}
