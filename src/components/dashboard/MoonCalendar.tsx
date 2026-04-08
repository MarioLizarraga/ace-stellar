import { useState } from 'react'
import { useMoonData } from '../../hooks/useMoonData'
import { MoonDayDetail } from './MoonDayDetail'

interface MoonCalendarProps {
  lat: number
  lng: number
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function MoonCalendar({ lat, lng }: MoonCalendarProps) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const { phases, loading, nextFullMoon } = useMoonData(year, month, lat, lng)

  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1) }
    else setMonth(month - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1) }
    else setMonth(month + 1)
  }

  return (
    <div className="bg-bg-surface/50 border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-light tracking-widest">
          MOON <span className="font-bold">CALENDAR</span>
        </h2>
        {nextFullMoon && (
          <div className="text-xs text-text-muted">
            Next full moon: <span className="text-accent font-medium">{nextFullMoon.daysUntil} days</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="text-text-muted hover:text-text-primary px-2 py-1">‹</button>
        <span className="text-sm font-medium tracking-wider">{monthName}</span>
        <button onClick={nextMonth} className="text-text-muted hover:text-text-primary px-2 py-1">›</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Calculating phases...</div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-xs text-text-muted py-1">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {phases.map((phase, i) => (
              <div key={phase.date} className="relative">
                <button
                  onClick={() => setSelectedDay(selectedDay === i ? null : i)}
                  className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors ${
                    phase.isFullMoon
                      ? 'bg-accent/20 border border-accent/40 text-text-primary'
                      : phase.isNewMoon
                        ? 'bg-bg-primary/50 border border-border text-text-muted'
                        : 'hover:bg-bg-primary/30 text-text-primary'
                  }`}
                >
                  <span className="text-[10px] text-text-muted">{i + 1}</span>
                  <span className="text-base leading-none">{phase.phase.split(' ')[0]}</span>
                </button>

                {selectedDay === i && (
                  <MoonDayDetail day={phase} onClose={() => setSelectedDay(null)} />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
