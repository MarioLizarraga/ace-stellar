import { useState, useMemo } from 'react'
import { PageTransition } from '../components/layout/PageTransition'
import { SENSOR_PRESETS } from '../lib/sensors'
import { calculateFOV } from '../lib/astro-calculators'
import messierData from '../data/messier-catalog.json'

interface MessierObject {
  id: string
  number: number
  name: string
  commonName: string
  type: string
  constellation: string
  ra: number
  dec: number
  magnitude: number
  sizeArcmin: number
  distanceLy: number | null
  bestSeason: string
  difficulty: string
  description: string
}

const messier = messierData as MessierObject[]

const TYPES = ['All', 'Galaxy', 'Globular Cluster', 'Open Cluster', 'Nebula', 'Planetary Nebula', 'Supernova Remnant', 'Double Star', 'Asterism']
const SEASONS = ['All', 'Winter', 'Spring', 'Summer', 'Autumn']
const DIFFICULTIES = ['All', 'Beginner', 'Easy', 'Intermediate', 'Advanced']

const typeColors: Record<string, string> = {
  'Galaxy': 'bg-purple-500/20 text-purple-400',
  'Globular Cluster': 'bg-astro-yellow/20 text-astro-yellow',
  'Open Cluster': 'bg-astro-green/20 text-astro-green',
  'Nebula': 'bg-pink-500/20 text-pink-400',
  'Planetary Nebula': 'bg-cyan-500/20 text-cyan-400',
  'Supernova Remnant': 'bg-astro-red/20 text-astro-red',
  'Double Star': 'bg-accent/20 text-accent',
  'Asterism': 'bg-text-muted/20 text-text-muted',
}

const difficultyColors: Record<string, string> = {
  'Beginner': 'text-astro-green',
  'Easy': 'text-astro-green',
  'Intermediate': 'text-astro-yellow',
  'Advanced': 'text-astro-red',
}

function describeFit(objectSizeArcmin: number, fovDiagonalDeg: number): { label: string; color: string } {
  const fovArcmin = fovDiagonalDeg * 60
  const ratio = fovArcmin / objectSizeArcmin

  if (ratio < 1) return { label: 'larger than frame', color: 'text-astro-yellow' }
  if (ratio < 2) return { label: 'fills frame perfectly ✓', color: 'text-astro-green' }
  if (ratio < 5) return { label: 'good fit', color: 'text-astro-green' }
  if (ratio < 15) return { label: `small (~1/${Math.round(ratio)} of frame)`, color: 'text-text-muted' }
  return { label: 'very small — use longer lens', color: 'text-astro-red' }
}

export function CatalogPage() {
  const [sensorId, setSensorId] = useState('full-frame')
  const [focalLength, setFocalLength] = useState(200)
  const [typeFilter, setTypeFilter] = useState('All')
  const [seasonFilter, setSeasonFilter] = useState('All')
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'number' | 'magnitude' | 'size'>('number')
  const [selected, setSelected] = useState<MessierObject | null>(null)

  const sensor = SENSOR_PRESETS.find((s) => s.id === sensorId)!
  const fov = useMemo(() => calculateFOV(focalLength, sensor), [focalLength, sensor])

  const filtered = useMemo(() => {
    let result = [...messier]
    if (typeFilter !== 'All') result = result.filter((o) => o.type === typeFilter)
    if (seasonFilter !== 'All') result = result.filter((o) => o.bestSeason === seasonFilter)
    if (difficultyFilter !== 'All') result = result.filter((o) => o.difficulty === difficultyFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((o) =>
        o.id.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        o.commonName.toLowerCase().includes(q) ||
        o.constellation.toLowerCase().includes(q),
      )
    }
    if (sortBy === 'magnitude') result.sort((a, b) => a.magnitude - b.magnitude)
    else if (sortBy === 'size') result.sort((a, b) => b.sizeArcmin - a.sizeArcmin)
    else result.sort((a, b) => a.number - b.number)
    return result
  }, [typeFilter, seasonFilter, difficultyFilter, search, sortBy])

  return (
    <PageTransition>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extralight tracking-widest">
          MESSIER <span className="font-bold">CATALOG</span>
        </h1>
        <p className="text-sm text-[#a8b2c1] mt-1 mb-6">
          All 110 Messier deep sky objects with imaging difficulty, best seasons, and <strong>how each fits in your frame</strong>.
        </p>

        {/* FOV reference bar */}
        <div className="bg-bg-surface/30 border border-border rounded-xl p-4 mb-6">
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Your Gear (for frame fit preview)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-text-muted block mb-1">Camera</label>
              <select value={sensorId} onChange={(e) => setSensorId(e.target.value)}
                className="w-full bg-bg-primary border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary">
                {SENSOR_PRESETS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-text-muted block mb-1">Focal Length (mm)</label>
              <input type="number" value={focalLength} onChange={(e) => setFocalLength(parseFloat(e.target.value) || 1)}
                className="w-full bg-bg-primary border border-border rounded-lg px-2 py-1.5 text-sm text-text-primary" />
            </div>
            <div className="flex items-end">
              <p className="text-xs text-text-muted">
                FOV: <span className="text-text-primary tabular-nums">{fov.horizontalDeg}° × {fov.verticalDeg}°</span>
                <span className="text-text-muted ml-2">(diag {fov.diagonalDeg}°)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search M31, Orion, Crab…"
            className="flex-1 min-w-[200px] bg-bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary"
          />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-bg-surface border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary">
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)}
            className="bg-bg-surface border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary">
            {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-bg-surface border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary">
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'number' | 'magnitude' | 'size')}
            className="bg-bg-surface border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary">
            <option value="number">By M Number</option>
            <option value="magnitude">By Brightness</option>
            <option value="size">By Size</option>
          </select>
        </div>

        <p className="text-xs text-text-muted mb-3">{filtered.length} of {messier.length} objects</p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((o) => {
            const fit = describeFit(o.sizeArcmin, fov.diagonalDeg)
            return (
              <button
                key={o.id}
                onClick={() => setSelected(o)}
                className="bg-bg-surface/30 border border-border rounded-xl p-4 hover:border-accent/30 transition-colors text-left"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">{o.id}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${typeColors[o.type] || 'bg-text-muted/20 text-text-muted'}`}>
                        {o.type}
                      </span>
                    </div>
                    {o.commonName && <p className="text-sm text-text-primary mt-0.5">{o.commonName}</p>}
                  </div>
                  <span className={`text-[10px] ${difficultyColors[o.difficulty] || 'text-text-muted'}`}>{o.difficulty}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-text-muted mb-2">
                  <div>Mag <span className="text-text-primary tabular-nums">{o.magnitude}</span></div>
                  <div>Size <span className="text-text-primary tabular-nums">{o.sizeArcmin}'</span></div>
                  <div>In <span className="text-text-primary">{o.constellation}</span></div>
                  <div>Best <span className="text-text-primary">{o.bestSeason}</span></div>
                </div>
                <p className={`text-[10px] ${fit.color}`}>📐 {fit.label}</p>
              </button>
            )
          })}
        </div>

        {/* Detail modal */}
        {selected && (
          <div
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <div
              className="bg-bg-surface border border-border rounded-xl p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-text-primary">{selected.id}</h2>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${typeColors[selected.type] || 'bg-text-muted/20 text-text-muted'}`}>
                      {selected.type}
                    </span>
                  </div>
                  {selected.commonName && <p className="text-lg text-text-primary">{selected.commonName}</p>}
                  <p className="text-xs text-text-muted">in {selected.constellation}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-text-muted hover:text-text-primary text-xl">✕</button>
              </div>

              <p className="text-sm text-[#a8b2c1] leading-relaxed mb-4">{selected.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-bg-primary/50 rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mb-0.5">Magnitude</p>
                  <p className="text-lg font-semibold text-text-primary tabular-nums">{selected.magnitude}</p>
                </div>
                <div className="bg-bg-primary/50 rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mb-0.5">Angular Size</p>
                  <p className="text-lg font-semibold text-text-primary tabular-nums">{selected.sizeArcmin}<span className="text-sm ml-1">arcmin</span></p>
                </div>
                <div className="bg-bg-primary/50 rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mb-0.5">Distance</p>
                  <p className="text-lg font-semibold text-text-primary tabular-nums">
                    {selected.distanceLy === null ? '—' : `${selected.distanceLy.toLocaleString()} ly`}
                  </p>
                </div>
                <div className="bg-bg-primary/50 rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-widest text-text-muted mb-0.5">Difficulty</p>
                  <p className={`text-lg font-semibold ${difficultyColors[selected.difficulty] || 'text-text-muted'}`}>{selected.difficulty}</p>
                </div>
              </div>

              <div className="bg-astro-green/10 border border-astro-green/30 rounded-lg p-3 mb-3">
                <p className="text-[10px] uppercase tracking-widest text-astro-green mb-1">Frame Fit at {focalLength}mm</p>
                <p className={`text-sm ${describeFit(selected.sizeArcmin, fov.diagonalDeg).color}`}>
                  {describeFit(selected.sizeArcmin, fov.diagonalDeg).label}
                </p>
                <p className="text-[10px] text-text-muted mt-1">
                  Your FOV: {fov.diagonalDeg}° diag | Object: {(selected.sizeArcmin / 60).toFixed(2)}°
                </p>
              </div>

              <div className="text-xs text-text-muted">
                RA: <span className="text-text-primary tabular-nums">{selected.ra.toFixed(2)}h</span>
                <span className="mx-2">|</span>
                Dec: <span className="text-text-primary tabular-nums">{selected.dec.toFixed(2)}°</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
