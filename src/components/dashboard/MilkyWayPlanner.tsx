import { useState, useEffect } from 'react'
import type { MilkyWayNight } from '../../types'
import { getMilkyWayForecast, getMilkyWayForMonth } from '../../lib/milkyway'

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

function scoreBorder(score: number): string {
  if (score >= 70) return 'border-astro-green/40'
  if (score >= 40) return 'border-astro-yellow/40'
  return 'border-astro-red/40'
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function MilkyWayPlanner({ lat, lng }: MilkyWayPlannerProps) {
  const [view, setView] = useState<'best' | 'calendar'>('calendar')
  const [showLegend, setShowLegend] = useState(false)
  const [selectedDay, setSelectedDay] = useState<MilkyWayNight | null>(null)

  // Best nights (sorted by score)
  const [bestNights, setBestNights] = useState<MilkyWayNight[]>([])
  const [bestLoading, setBestLoading] = useState(true)

  // Calendar
  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [calNights, setCalNights] = useState<MilkyWayNight[]>([])
  const [calLoading, setCalLoading] = useState(true)

  // Limit navigation to 6 months forward
  const maxDate = new Date(now.getFullYear(), now.getMonth() + 6, 1)
  const canGoNext = new Date(calYear, calMonth + 1, 1) < maxDate
  const canGoPrev = calYear > now.getFullYear() || calMonth > now.getMonth()

  useEffect(() => {
    setBestLoading(true)
    const timer = setTimeout(() => {
      setBestNights(getMilkyWayForecast(lat, lng, 180))
      setBestLoading(false)
    }, 50)
    return () => clearTimeout(timer)
  }, [lat, lng])

  useEffect(() => {
    setCalLoading(true)
    const timer = setTimeout(() => {
      setCalNights(getMilkyWayForMonth(lat, lng, calYear, calMonth))
      setCalLoading(false)
    }, 50)
    return () => clearTimeout(timer)
  }, [lat, lng, calYear, calMonth])

  const monthName = new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay()

  function prevMonth() {
    if (!canGoPrev) return
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) }
    else setCalMonth(calMonth - 1)
    setSelectedDay(null)
  }

  function nextMonth() {
    if (!canGoNext) return
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) }
    else setCalMonth(calMonth + 1)
    setSelectedDay(null)
  }

  return (
    <div className="bg-bg-surface/50 border border-border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-light tracking-widest">
          MILKY WAY <span className="font-bold">PLANNER</span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="text-[10px] text-text-muted hover:text-text-primary border border-border rounded px-1.5 py-0.5"
            title="What does the score mean?"
          >
            ?
          </button>
          <div className="flex bg-bg-primary rounded-lg border border-border">
            <button
              onClick={() => setView('calendar')}
              className={`px-2 py-1 text-[10px] tracking-wider rounded-l-lg transition-colors ${
                view === 'calendar' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView('best')}
              className={`px-2 py-1 text-[10px] tracking-wider rounded-r-lg transition-colors ${
                view === 'best' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Best Nights
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mb-4 bg-bg-primary/50 border border-border rounded-lg p-3 text-xs text-text-muted space-y-2">
          <p className="text-text-primary font-medium">Score Breakdown (0–100):</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <span className="text-text-primary font-medium">Core Altitude</span> — 40 pts
              <p>How high the galactic center rises above the horizon. Higher = brighter, more detail.</p>
            </div>
            <div>
              <span className="text-text-primary font-medium">Moon Interference</span> — 40 pts
              <p>Less moonlight = darker skies. New moon (none) is best, full moon (high) washes out the milky way.</p>
            </div>
            <div>
              <span className="text-text-primary font-medium">Visibility Window</span> — 20 pts
              <p>Hours the core is above 10° altitude during nighttime. Longer window = more shooting time.</p>
            </div>
          </div>
          <div className="flex gap-4 pt-1 border-t border-border">
            <span><span className="text-astro-green font-medium">70–100</span> Excellent</span>
            <span><span className="text-astro-yellow font-medium">40–69</span> Fair</span>
            <span><span className="text-astro-red font-medium">0–39</span> Poor</span>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <>
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              disabled={!canGoPrev}
              className="text-text-muted hover:text-text-primary px-2 py-1 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            <span className="text-sm font-medium tracking-wider">{monthName}</span>
            <button
              onClick={nextMonth}
              disabled={!canGoNext}
              className="text-text-muted hover:text-text-primary px-2 py-1 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>

          {calLoading ? (
            <div className="text-center py-12 text-text-muted">Calculating visibility...</div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-[10px] text-text-muted py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {calNights.map((night, i) => (
                  <button
                    key={night.date}
                    onClick={() => setSelectedDay(selectedDay?.date === night.date ? null : night)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] transition-colors border ${
                      night.score >= 70
                        ? `${scoreBg(night.score)} ${scoreBorder(night.score)}`
                        : night.score >= 40
                          ? `${scoreBg(night.score)} ${scoreBorder(night.score)}`
                          : 'bg-bg-primary/30 border-transparent'
                    } ${selectedDay?.date === night.date ? 'ring-1 ring-accent' : ''}`}
                  >
                    <span className="text-text-muted">{i + 1}</span>
                    <span className={`font-bold tabular-nums leading-none ${scoreColor(night.score)}`}>
                      {night.score}
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected day detail */}
              {selectedDay && (
                <div className="mt-3 bg-bg-primary/50 border border-border rounded-lg p-3 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary font-medium">
                      {new Date(selectedDay.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                    <div className={`px-2 py-0.5 rounded ${scoreBg(selectedDay.score)}`}>
                      <span className={`font-bold tabular-nums ${scoreColor(selectedDay.score)}`}>{selectedDay.score}</span>
                      <span className="text-text-muted text-xs">/100</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Core visible</span>
                    <span className="text-text-primary">
                      {selectedDay.coreVisibleStart && selectedDay.coreVisibleEnd
                        ? `${selectedDay.coreVisibleStart} – ${selectedDay.coreVisibleEnd}`
                        : 'Not visible'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Moon interference</span>
                    <span className={moonInterferenceColors[selectedDay.moonInterference]}>
                      {selectedDay.moonInterference.charAt(0).toUpperCase() + selectedDay.moonInterference.slice(1)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Best Nights View */}
      {view === 'best' && (
        bestLoading ? (
          <div className="text-center py-12 text-text-muted">Calculating 6 months of visibility...</div>
        ) : (
          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin">
            {bestNights.slice(0, 30).map((night) => (
              <div
                key={night.date}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-bg-primary/30 transition-colors"
              >
                <div className={`w-12 h-12 rounded-lg ${scoreBg(night.score)} flex items-center justify-center shrink-0`}>
                  <span className={`text-lg font-bold tabular-nums ${scoreColor(night.score)}`}>
                    {night.score}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">
                    {new Date(night.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-text-muted">
                    {night.coreVisibleStart && night.coreVisibleEnd
                      ? `Core: ${night.coreVisibleStart} – ${night.coreVisibleEnd}`
                      : 'Core not visible'}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs font-medium ${moonInterferenceColors[night.moonInterference]}`}>
                    Moon: {night.moonInterference}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
