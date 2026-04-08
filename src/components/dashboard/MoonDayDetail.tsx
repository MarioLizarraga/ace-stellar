import type { MoonPhase } from '../../types'

interface MoonDayDetailProps {
  day: MoonPhase
  onClose: () => void
}

export function MoonDayDetail({ day, onClose }: MoonDayDetailProps) {
  return (
    <div
      className="absolute z-20 bg-bg-surface border border-border rounded-lg p-4 shadow-xl min-w-[200px]"
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={onClose} className="absolute top-2 right-2 text-text-muted hover:text-text-primary text-sm">✕</button>
      <p className="text-lg mb-1">{day.phase}</p>
      <p className="text-text-muted text-xs mb-3">
        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">Illumination</span>
          <span className="text-text-primary font-medium">{day.illumination}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Moonrise</span>
          <span className="text-text-primary">{day.moonrise || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Moonset</span>
          <span className="text-text-primary">{day.moonset || '—'}</span>
        </div>
      </div>
    </div>
  )
}
