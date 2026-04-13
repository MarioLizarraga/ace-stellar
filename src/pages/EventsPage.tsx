import { useState, useMemo } from 'react'
import { PageTransition } from '../components/layout/PageTransition'
import meteorShowers from '../data/meteor-showers.json'
import eclipses from '../data/eclipses.json'
import { getUpcomingOppositions } from '../lib/planet-events'

type Tab = 'meteors' | 'eclipses' | 'planets'

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'meteors', label: 'Meteor Showers', icon: '☄️' },
  { id: 'eclipses', label: 'Eclipses', icon: '🌒' },
  { id: 'planets', label: 'Planet Oppositions', icon: '🪐' },
]

function zhrColor(zhr: number): string {
  if (zhr >= 100) return 'text-astro-green'
  if (zhr >= 30) return 'text-astro-yellow'
  return 'text-text-muted'
}

function zhrLabel(zhr: number): string {
  if (zhr >= 100) return 'Major'
  if (zhr >= 30) return 'Strong'
  if (zhr >= 10) return 'Moderate'
  return 'Weak'
}

function eclipseColor(type: string): string {
  if (type.includes('Total Solar')) return 'text-astro-yellow'
  if (type.includes('Total Lunar')) return 'text-astro-red'
  if (type.includes('Annular')) return 'text-accent'
  return 'text-text-muted'
}

export function EventsPage() {
  const [tab, setTab] = useState<Tab>('meteors')

  const oppositions = useMemo(() => getUpcomingOppositions(3), [])
  const upcomingEclipses = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return (eclipses as Array<{ date: string; type: string; visibility: string; notes: string }>)
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [])

  return (
    <PageTransition>
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extralight tracking-widest">
          ASTRO <span className="font-bold">EVENTS</span>
        </h1>
        <p className="text-sm text-[#a8b2c1] mt-1 mb-8">
          Upcoming meteor showers, eclipses, and planetary oppositions.
        </p>

        <div className="flex gap-2 mb-6 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-accent text-text-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <span className="mr-2">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Meteor Showers */}
        {tab === 'meteors' && (
          <div className="space-y-3">
            <p className="text-xs text-text-muted mb-4">
              <strong className="text-text-primary">ZHR</strong> = Zenith Hourly Rate — meteors per hour under ideal conditions (dark sky, radiant at zenith). Real-world rates are lower.
            </p>
            {meteorShowers.map((s) => (
              <div key={s.id} className="bg-bg-surface/30 border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{s.name}</h3>
                    <p className="text-xs text-text-muted">
                      Active {s.activeStart} → {s.activeEnd}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs uppercase tracking-widest ${zhrColor(s.zhr)}`}>{zhrLabel(s.zhr)}</p>
                    <p className={`text-2xl font-bold tabular-nums ${zhrColor(s.zhr)}`}>{s.zhr}<span className="text-xs font-normal ml-1">ZHR</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
                  <div>
                    <p className="text-text-muted uppercase tracking-widest text-[10px] mb-0.5">Peak</p>
                    <p className="text-text-primary">{s.peakDate}</p>
                  </div>
                  <div>
                    <p className="text-text-muted uppercase tracking-widest text-[10px] mb-0.5">Radiant</p>
                    <p className="text-text-primary">{s.radiantConstellation}</p>
                  </div>
                  <div>
                    <p className="text-text-muted uppercase tracking-widest text-[10px] mb-0.5">Parent</p>
                    <p className="text-text-primary">{s.parentBody}</p>
                  </div>
                </div>

                <p className="text-xs text-[#a8b2c1] mt-3 leading-relaxed">{s.notes}</p>
              </div>
            ))}
          </div>
        )}

        {/* Eclipses */}
        {tab === 'eclipses' && (
          <div className="space-y-3">
            <p className="text-xs text-text-muted mb-4">
              Upcoming solar and lunar eclipses. Check NASA's eclipse page for exact timing at your location.
            </p>
            {upcomingEclipses.map((e) => {
              const dateObj = new Date(e.date + 'T12:00:00')
              const daysUntil = Math.ceil((dateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (
                <div key={e.date} className="bg-bg-surface/30 border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`text-lg font-semibold ${eclipseColor(e.type)}`}>{e.type} Eclipse</h3>
                        {e.type.includes('Total') && <span className="text-[10px] bg-astro-yellow/10 text-astro-yellow px-2 py-0.5 rounded-full">★ Major</span>}
                      </div>
                      <p className="text-sm text-text-primary">
                        {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-text-muted uppercase tracking-widest">In</p>
                      <p className="text-2xl font-bold tabular-nums text-accent">{daysUntil}<span className="text-xs font-normal ml-1">days</span></p>
                    </div>
                  </div>

                  <p className="text-xs text-text-muted mt-2">
                    <span className="text-text-muted uppercase tracking-widest text-[10px] mr-2">Visible from</span>
                    {e.visibility}
                  </p>
                  <p className="text-xs text-[#a8b2c1] mt-2 leading-relaxed">{e.notes}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Planet Oppositions */}
        {tab === 'planets' && (
          <div className="space-y-3">
            <p className="text-xs text-text-muted mb-4">
              At opposition, a planet is opposite the Sun from Earth — it rises at sunset, is up all night, and is closest/brightest for imaging.
            </p>
            {oppositions.map((op, i) => {
              const dateObj = new Date(op.date + 'T12:00:00')
              return (
                <div key={`${op.planet}-${i}`} className="bg-bg-surface/30 border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">{op.planet} at opposition</h3>
                      <p className="text-sm text-text-primary">
                        {dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-text-muted uppercase tracking-widest">In</p>
                      <p className="text-2xl font-bold tabular-nums text-accent">{op.daysUntil}<span className="text-xs font-normal ml-1">days</span></p>
                    </div>
                  </div>
                  <p className="text-xs text-[#a8b2c1] mt-2 leading-relaxed">{op.notes}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
