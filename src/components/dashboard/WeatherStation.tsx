import { useState } from 'react'
import { useWeather } from '../../hooks/useWeather'
import { WeatherDayCard } from './WeatherDayCard'
import { BortleIndicator } from './BortleIndicator'
import type { SavedLocation } from '../../types'

interface WeatherStationProps {
  location: SavedLocation
  onRemove?: () => void
}

export function WeatherStation({ location, onRemove }: WeatherStationProps) {
  // 16 days forecast + 164 days historical = ~6 months total
  const { forecast, loading, error } = useWeather(location.lat, location.lng, 164)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  return (
    <div className="bg-bg-surface/50 border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-text-primary">{location.name}</h3>
        <div className="flex items-center gap-3">
          <BortleIndicator bortle={location.bortle} />
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-text-muted hover:text-astro-red text-xs transition-colors"
              title="Remove location"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center py-8 text-text-muted text-sm">Loading forecast...</div>
      )}

      {error && (
        <div className="text-center py-8 text-astro-red text-sm">Failed to load weather: {error}</div>
      )}

      {!loading && !error && (
        <>
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
          <div className="flex gap-3 mt-1 text-[9px] text-text-muted">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent/40 inline-block" /> Forecast (16 days)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-text-muted/30 border border-dashed border-text-muted/40 inline-block" /> Historical avg (5yr)</span>
          </div>
        </>
      )}
    </div>
  )
}
