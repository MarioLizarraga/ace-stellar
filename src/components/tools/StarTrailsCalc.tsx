import { useState, useMemo } from 'react'
import { SENSOR_PRESETS } from '../../lib/sensors'
import { calculateStarTrails } from '../../lib/astro-calculators'

export function StarTrailsCalc() {
  const [sensorId, setSensorId] = useState('full-frame')
  const [focalLength, setFocalLength] = useState(14)
  const [aperture, setAperture] = useState(2.8)
  const [declination, setDeclination] = useState(0)

  const sensor = SENSOR_PRESETS.find((s) => s.id === sensorId)!

  const result = useMemo(
    () => calculateStarTrails(focalLength, aperture, sensor, declination),
    [focalLength, aperture, sensor, declination],
  )

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">Star Trails / NPF Rule Calculator</h3>
        <p className="text-xs text-[#a8b2c1]">Max exposure time before stars begin trailing. The NPF Rule is more accurate.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1 block">Camera / Sensor</label>
          <select
            value={sensorId}
            onChange={(e) => setSensorId(e.target.value)}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
          >
            {SENSOR_PRESETS.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1 block">Focal Length (mm)</label>
          <input
            type="number"
            value={focalLength}
            onChange={(e) => setFocalLength(parseFloat(e.target.value) || 0)}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1 block">Aperture (f/)</label>
          <input
            type="number"
            step="0.1"
            value={aperture}
            onChange={(e) => setAperture(parseFloat(e.target.value) || 0)}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1 block">Declination (°)</label>
          <input
            type="number"
            value={declination}
            onChange={(e) => setDeclination(parseFloat(e.target.value) || 0)}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
          />
          <p className="text-[9px] text-text-muted mt-1">0 = celestial equator (worst case). Higher = longer exposures possible.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="bg-bg-primary/50 border border-border rounded-lg p-4">
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">500 Rule</p>
          <p className="text-3xl font-bold text-text-primary tabular-nums">{result.fiveHundredRule}<span className="text-lg text-text-muted ml-1">s</span></p>
          <p className="text-[10px] text-text-muted mt-1">Simple, casual shots</p>
        </div>
        <div className="bg-astro-green/10 border border-astro-green/30 rounded-lg p-4">
          <p className="text-[10px] uppercase tracking-widest text-astro-green mb-1">NPF Rule ★ (recommended)</p>
          <p className="text-3xl font-bold text-astro-green tabular-nums">{result.npfRule}<span className="text-lg text-astro-green/60 ml-1">s</span></p>
          <p className="text-[10px] text-text-muted mt-1">Pixel-sharp stars</p>
        </div>
      </div>

      <p className="text-xs text-[#a8b2c1] bg-accent/10 border border-accent/30 rounded-lg p-3">
        💡 {result.recommendation}
      </p>
    </div>
  )
}
