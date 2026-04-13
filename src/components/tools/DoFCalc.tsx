import { useState, useMemo } from 'react'
import { SENSOR_PRESETS } from '../../lib/sensors'
import { calculateDoF } from '../../lib/astro-calculators'

export function DoFCalc() {
  const [sensorId, setSensorId] = useState('full-frame')
  const [focalLength, setFocalLength] = useState(24)
  const [aperture, setAperture] = useState(2.8)
  const [focusDistance, setFocusDistance] = useState(5)

  const sensor = SENSOR_PRESETS.find((s) => s.id === sensorId)!

  const dof = useMemo(
    () => calculateDoF(focalLength, aperture, focusDistance, sensor),
    [focalLength, aperture, focusDistance, sensor],
  )

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">Depth of Field / Hyperfocal Calculator</h3>
        <p className="text-xs text-[#a8b2c1]">
          The hyperfocal distance is where you should focus to get both foreground and stars sharp.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1 block">Camera</label>
          <select value={sensorId} onChange={(e) => setSensorId(e.target.value)}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary">
            {SENSOR_PRESETS.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1 block">Focal Length (mm)</label>
          <input type="number" value={focalLength} onChange={(e) => setFocalLength(parseFloat(e.target.value) || 0)}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1 block">Aperture (f/)</label>
          <input type="number" step="0.1" value={aperture} onChange={(e) => setAperture(parseFloat(e.target.value) || 0)}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1 block">Focus Distance (m)</label>
          <input type="number" step="0.1" value={focusDistance} onChange={(e) => setFocusDistance(parseFloat(e.target.value) || 0)}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-astro-green/10 border border-astro-green/30 rounded-lg p-4">
          <p className="text-[10px] uppercase tracking-widest text-astro-green mb-1">Hyperfocal Distance ★</p>
          <p className="text-3xl font-bold text-astro-green tabular-nums">{dof.hyperfocalM}<span className="text-lg text-astro-green/60 ml-1">m</span></p>
          <p className="text-[10px] text-text-muted mt-1">Focus here for max sharpness (near to infinity)</p>
        </div>
        <div className="bg-bg-primary/50 border border-border rounded-lg p-4">
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Near Limit</p>
          <p className="text-2xl font-bold text-text-primary tabular-nums">{dof.nearLimitM}<span className="text-base text-text-muted ml-1">m</span></p>
        </div>
        <div className="bg-bg-primary/50 border border-border rounded-lg p-4">
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Far Limit</p>
          <p className="text-2xl font-bold text-text-primary tabular-nums">
            {dof.farLimitM === null ? '∞' : dof.farLimitM}
            {dof.farLimitM !== null && <span className="text-base text-text-muted ml-1">m</span>}
          </p>
        </div>
      </div>

      {dof.totalDoFM !== null && (
        <p className="text-xs text-text-muted">
          Total depth of field: <span className="text-text-primary tabular-nums">{dof.totalDoFM}m</span>
        </p>
      )}

      <p className="text-xs text-[#a8b2c1] bg-accent/10 border border-accent/30 rounded-lg p-3">
        💡 For astro-landscape: focus at the hyperfocal distance to keep foreground and stars sharp. For pure astro (stars only), focus to infinity.
      </p>
    </div>
  )
}
