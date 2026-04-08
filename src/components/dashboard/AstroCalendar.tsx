import { useState, useEffect } from 'react'
import type { MoonPhase, MilkyWayNight } from '../../types'
import { getMoonDataForMonth, getNextFullMoon } from '../../lib/moon-api'
import { getMilkyWayForMonth } from '../../lib/milkyway'

interface AstroCalendarProps {
  lat: number
  lng: number
}

interface DayData {
  moon: MoonPhase
  mw: MilkyWayNight
}

function mwScoreColor(score: number): string {
  if (score >= 70) return 'text-astro-green'
  if (score >= 40) return 'text-astro-yellow'
  return 'text-astro-red'
}

function mwScoreBg(score: number): string {
  if (score >= 70) return 'bg-astro-green/10'
  if (score >= 40) return 'bg-astro-yellow/10'
  return ''
}

const moonInterferenceLabel: Record<string, string> = {
  none: 'None',
  low: 'Low',
  medium: 'Med',
  high: 'High',
}

const moonInterferenceColor: Record<string, string> = {
  none: 'text-astro-green',
  low: 'text-astro-green',
  medium: 'text-astro-yellow',
  high: 'text-astro-red',
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function AstroCalendar({ lat, lng }: AstroCalendarProps) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [days, setDays] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [nextFull, setNextFull] = useState<{ date: Date; daysUntil: number } | null>(null)
  const [showLegend, setShowLegend] = useState(false)

  const maxDate = new Date(now.getFullYear(), now.getMonth() + 6, 1)
  const canGoNext = new Date(year, month + 1, 1) < maxDate
  const canGoPrev = year > now.getFullYear() || month > now.getMonth()

  useEffect(() => {
    setNextFull(getNextFullMoon())
  }, [])

  useEffect(() => {
    setLoading(true)
    setSelectedIdx(null)
    const timer = setTimeout(() => {
      const moonData = getMoonDataForMonth(year, month, lat, lng)
      const mwData = getMilkyWayForMonth(lat, lng, year, month)
      setDays(moonData.map((moon, i) => ({ moon, mw: mwData[i] })))
      setLoading(false)
    }, 50)
    return () => clearTimeout(timer)
  }, [year, month, lat, lng])

  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  function prevMonth() {
    if (!canGoPrev) return
    if (month === 0) { setMonth(11); setYear(year - 1) }
    else setMonth(month - 1)
  }

  function nextMonth() {
    if (!canGoNext) return
    if (month === 11) { setMonth(0); setYear(year + 1) }
    else setMonth(month + 1)
  }

  const selected = selectedIdx !== null ? days[selectedIdx] : null

  return (
    <div className="bg-bg-surface/50 border border-border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-light tracking-widest">
          ASTRO <span className="font-bold">CALENDAR</span>
        </h2>
        <div className="flex items-center gap-3">
          {nextFull && (
            <span className="text-[10px] text-text-muted hidden sm:inline">
              Next full moon: <span className="text-accent font-medium">{nextFull.daysUntil}d</span>
            </span>
          )}
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="text-[10px] text-text-muted hover:text-text-primary border border-border rounded px-1.5 py-0.5"
          >
            ?
          </button>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mb-3 bg-bg-primary/50 border border-border rounded-lg p-3 text-[11px] text-text-muted space-y-2">
          <p className="text-text-primary font-medium text-xs">How to read each day:</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-text-primary">Moon emoji</span> — current lunar phase<br/>
              <span className="text-text-primary">Illum %</span> — how much of the moon is lit<br/>
              <span className="text-text-primary">Rise/Set</span> — moonrise & moonset times
            </div>
            <div>
              <span className="text-text-primary">MW score (0-100)</span> — milky way shooting quality<br/>
              <span className="text-astro-green">40 pts</span> core altitude + <span className="text-astro-green">40 pts</span> dark sky + <span className="text-astro-green">20 pts</span> window<br/>
              <span className="text-text-primary">Core window</span> — when galactic center is above 10°
            </div>
          </div>
          <div className="flex gap-4 pt-1 border-t border-border">
            <span><span className="text-astro-green font-medium">70+</span> Excellent MW night</span>
            <span><span className="text-astro-yellow font-medium">40-69</span> Fair</span>
            <span><span className="text-astro-red font-medium">0-39</span> Poor</span>
          </div>
        </div>
      )}

      {/* Month navigation */}
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

      {loading ? (
        <div className="text-center py-16 text-text-muted">Calculating...</div>
      ) : (
        <>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[10px] text-text-muted py-0.5">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}

            {days.map((day, i) => {
              const moonEmoji = day.moon.phase.split(' ')[0]
              const isSelected = selectedIdx === i
              return (
                <button
                  key={day.moon.date}
                  onClick={() => setSelectedIdx(isSelected ? null : i)}
                  className={`rounded-lg p-1 flex flex-col items-center text-center transition-colors border min-h-[72px] ${
                    mwScoreBg(day.mw.score)
                  } ${
                    day.moon.isFullMoon
                      ? 'border-accent/40'
                      : day.moon.isNewMoon
                        ? 'border-border'
                        : 'border-transparent'
                  } ${isSelected ? 'ring-1 ring-accent' : 'hover:bg-bg-primary/30'}`}
                >
                  {/* Day number */}
                  <span className="text-[9px] text-text-muted leading-none">{i + 1}</span>
                  {/* Moon emoji */}
                  <span className="text-sm leading-none mt-0.5">{moonEmoji}</span>
                  {/* Moon illumination */}
                  <span className="text-[8px] text-text-muted leading-none mt-0.5">{day.moon.illumination}%</span>
                  {/* MW score */}
                  <span className={`text-[10px] font-bold tabular-nums leading-none mt-0.5 ${mwScoreColor(day.mw.score)}`}>
                    MW {day.mw.score}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Selected day detail panel */}
          {selected && (
            <div className="mt-3 bg-bg-primary/50 border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-text-primary">
                  {new Date(selected.moon.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <button onClick={() => setSelectedIdx(null)} className="text-text-muted hover:text-text-primary text-xs">✕</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Moon details */}
                <div className="space-y-2">
                  <h4 className="text-xs tracking-widest uppercase text-text-muted">Moon</h4>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{selected.moon.phase.split(' ')[0]}</span>
                    <div>
                      <p className="text-sm text-text-primary font-medium">{selected.moon.phase.split(' ').slice(1).join(' ')}</p>
                      <p className="text-xs text-text-muted">{selected.moon.illumination}% illuminated</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Moonrise</span>
                      <span className="text-text-primary">{selected.moon.moonrise || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Moonset</span>
                      <span className="text-text-primary">{selected.moon.moonset || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Milky Way details */}
                <div className="space-y-2">
                  <h4 className="text-xs tracking-widest uppercase text-text-muted">Milky Way</h4>
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`w-10 h-10 rounded-lg ${
                      selected.mw.score >= 70 ? 'bg-astro-green/20' : selected.mw.score >= 40 ? 'bg-astro-yellow/20' : 'bg-astro-red/20'
                    } flex items-center justify-center`}>
                      <span className={`text-lg font-bold tabular-nums ${mwScoreColor(selected.mw.score)}`}>{selected.mw.score}</span>
                    </div>
                    <div>
                      <p className="text-sm text-text-primary font-medium">
                        {selected.mw.score >= 70 ? 'Excellent night' : selected.mw.score >= 40 ? 'Fair night' : 'Poor night'}
                      </p>
                      <p className="text-xs text-text-muted">for milky way photography</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Core visible</span>
                      <span className="text-text-primary">
                        {selected.mw.coreVisibleStart && selected.mw.coreVisibleEnd
                          ? `${selected.mw.coreVisibleStart} – ${selected.mw.coreVisibleEnd}`
                          : 'Not visible'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Moon interference</span>
                      <span className={moonInterferenceColor[selected.mw.moonInterference]}>
                        {moonInterferenceLabel[selected.mw.moonInterference]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
