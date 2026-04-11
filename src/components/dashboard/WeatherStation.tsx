import { useState, useEffect } from 'react'
import { useWeather } from '../../hooks/useWeather'
import { WeatherDayCard } from './WeatherDayCard'
import { BORTLE_INFO, fetchLightPollution } from '../../lib/light-pollution'
import type { LightPollutionResult } from '../../lib/light-pollution'
import type { SavedLocation } from '../../types'

interface WeatherStationProps {
  location: SavedLocation
  onRemove?: () => void
  dragHandle?: React.ReactNode
}

export function WeatherStation({ location, onRemove, dragHandle }: WeatherStationProps) {
  const { forecast, loading, error } = useWeather(location.lat, location.lng, 164)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const [lightData, setLightData] = useState<LightPollutionResult | null>(null)

  useEffect(() => {
    setLightData(null)
    fetchLightPollution(location.lat, location.lng).then(setLightData)
  }, [location.lat, location.lng])

  const bortle = lightData?.source === 'satellite' ? lightData.bortle : location.bortle
  const info = BORTLE_INFO[bortle]

  return (
    <div className="bg-bg-surface/50 border border-border rounded-xl p-6">
      {/* Header with name, Bortle, and actions */}
      <div className="flex items-start gap-3 mb-3">
        {dragHandle}

        {/* Bortle circle */}
        <div
          className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center text-sm font-bold text-text-primary shrink-0"
          style={{ backgroundColor: info?.color || '#333' }}
          title={`Bortle ${bortle} — ${info?.label}`}
        >
          {bortle}
        </div>

        {/* Name + Bortle info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary">{location.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-text-muted">Bortle {bortle}</span>
            <span className="text-[10px] text-text-muted">— {info?.label}</span>
            {lightData?.source === 'satellite' && (
              <span className="text-[9px] text-astro-green">satellite</span>
            )}
            {!lightData && (
              <span className="text-[9px] text-text-muted animate-pulse">loading...</span>
            )}
          </div>
          {lightData?.source === 'satellite' && (
            <p className="text-[9px] text-text-muted mt-0.5">
              SQM ~{lightData.sqm} mag/arcsec² | Brightness {lightData.brightness}/255
            </p>
          )}
          <p className="text-[9px] text-text-muted mt-0.5">{info?.description}</p>
        </div>

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-text-muted hover:text-astro-red text-xs transition-colors shrink-0"
            title="Remove location"
          >
            ✕
          </button>
        )}
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
