import type { DailyForecast } from '../../types'
import { AstroScore } from './AstroScore'

interface WeatherDayCardProps {
  day: DailyForecast
  isExpanded: boolean
  onClick: () => void
}

export function WeatherDayCard({ day, isExpanded, onClick }: WeatherDayCardProps) {
  const dateObj = new Date(day.date + 'T12:00:00')
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div
      className="bg-bg-primary/30 border border-border rounded-lg p-3 cursor-pointer hover:border-accent/30 transition-colors min-w-[100px]"
      onClick={onClick}
    >
      <div className="text-center mb-2">
        <p className="text-xs text-text-muted">{dayName}</p>
        <p className="text-xs text-text-primary font-medium">{dateStr}</p>
      </div>

      <div className="flex justify-center mb-2">
        <AstroScore score={day.astroScore} size="sm" />
      </div>

      <div className="space-y-1 text-[10px]">
        <div className="flex justify-between">
          <span className="text-text-muted">Cloud</span>
          <span className="text-text-primary tabular-nums">{Math.round(day.cloudCover)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Humid</span>
          <span className="text-text-primary tabular-nums">{Math.round(day.humidity)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Wind</span>
          <span className="text-text-primary tabular-nums">{Math.round(day.windSpeed)} km/h</span>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-border space-y-1 text-[10px]">
          <div className="flex justify-between">
            <span className="text-text-muted">Temp</span>
            <span className="text-text-primary tabular-nums">{Math.round(day.temperature)}°C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Dew Pt</span>
            <span className="text-text-primary tabular-nums">{Math.round(day.dewPoint)}°C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Vis</span>
            <span className="text-text-primary tabular-nums">{day.visibility} km</span>
          </div>
        </div>
      )}
    </div>
  )
}
