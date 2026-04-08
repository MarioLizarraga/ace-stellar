import { useState } from 'react'
import { useWeather } from '../../hooks/useWeather'
import { WeatherDayCard } from './WeatherDayCard'
import { BortleIndicator } from './BortleIndicator'
import type { SavedLocation } from '../../types'

interface WeatherStationProps {
  location: SavedLocation
}

export function WeatherStation({ location }: WeatherStationProps) {
  const { forecast, loading, error } = useWeather(location.lat, location.lng)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  return (
    <div className="bg-bg-surface/50 border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-text-primary">{location.name}</h3>
        <BortleIndicator bortle={location.bortle} />
      </div>

      {loading && (
        <div className="text-center py-8 text-text-muted text-sm">Loading forecast...</div>
      )}

      {error && (
        <div className="text-center py-8 text-astro-red text-sm">Failed to load weather: {error}</div>
      )}

      {!loading && !error && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {forecast.map((day, i) => (
            <WeatherDayCard
              key={day.date}
              day={day}
              isExpanded={expandedDay === i}
              onClick={() => setExpandedDay(expandedDay === i ? null : i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
