import { useMilkyWay } from '../../hooks/useMilkyWay'

interface MilkyWayPlannerProps {
  lat: number
  lng: number
}

const moonInterferenceColors = {
  none: 'text-astro-green',
  low: 'text-astro-green',
  medium: 'text-astro-yellow',
  high: 'text-astro-red',
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-astro-green'
  if (score >= 40) return 'text-astro-yellow'
  return 'text-astro-red'
}

function scoreBg(score: number): string {
  if (score >= 70) return 'bg-astro-green/20'
  if (score >= 40) return 'bg-astro-yellow/20'
  return 'bg-astro-red/20'
}

export function MilkyWayPlanner({ lat, lng }: MilkyWayPlannerProps) {
  const { nights, loading } = useMilkyWay(lat, lng, 30)

  return (
    <div className="bg-bg-surface/50 border border-border rounded-xl p-6">
      <h2 className="text-lg font-light tracking-widest mb-4">
        MILKY WAY <span className="font-bold">PLANNER</span>
      </h2>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Calculating visibility...</div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {nights.slice(0, 15).map((night) => (
            <div
              key={night.date}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-bg-primary/30 transition-colors"
            >
              <div className={`w-12 h-12 rounded-lg ${scoreBg(night.score)} flex items-center justify-center`}>
                <span className={`text-lg font-bold tabular-nums ${scoreColor(night.score)}`}>
                  {night.score}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">
                  {new Date(night.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-text-muted">
                  {night.coreVisibleStart && night.coreVisibleEnd
                    ? `Core: ${night.coreVisibleStart} – ${night.coreVisibleEnd}`
                    : 'Core not visible'}
                </p>
              </div>

              <div className="text-right">
                <span className={`text-xs font-medium ${moonInterferenceColors[night.moonInterference]}`}>
                  Moon: {night.moonInterference}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
