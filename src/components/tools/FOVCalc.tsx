import { useState, useMemo } from 'react'
import { SENSOR_PRESETS } from '../../lib/sensors'
import { calculateFOV, DSO_SIZES } from '../../lib/astro-calculators'

export function FOVCalc() {
  const [sensorId, setSensorId] = useState('full-frame')
  const [focalLength, setFocalLength] = useState(50)

  const sensor = SENSOR_PRESETS.find((s) => s.id === sensorId)!

  const fov = useMemo(() => calculateFOV(focalLength, sensor), [focalLength, sensor])

  // How many times each DSO fits in the frame (frame diagonal / DSO size)
  const dsoComparison = useMemo(() =>
    DSO_SIZES.map((d) => ({
      ...d,
      fitsInFrame: fov.diagonalDeg / d.sizeDeg,
      dominatesFrame: d.sizeDeg > fov.diagonalDeg,
    })),
    [fov],
  )

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">Field of View Calculator</h3>
        <p className="text-xs text-[#a8b2c1]">See what fits in your frame at any focal length.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1 block">Camera / Sensor</label>
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
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-bg-primary/50 border border-border rounded-lg p-3 text-center">
          <p className="text-[10px] uppercase tracking-widest text-text-muted">Horizontal</p>
          <p className="text-xl font-bold text-text-primary tabular-nums">{fov.horizontalDeg}°</p>
        </div>
        <div className="bg-bg-primary/50 border border-border rounded-lg p-3 text-center">
          <p className="text-[10px] uppercase tracking-widest text-text-muted">Vertical</p>
          <p className="text-xl font-bold text-text-primary tabular-nums">{fov.verticalDeg}°</p>
        </div>
        <div className="bg-bg-primary/50 border border-border rounded-lg p-3 text-center">
          <p className="text-[10px] uppercase tracking-widest text-text-muted">Diagonal</p>
          <p className="text-xl font-bold text-text-primary tabular-nums">{fov.diagonalDeg}°</p>
        </div>
      </div>

      <div className="bg-bg-primary/30 border border-border rounded-lg p-4">
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">What Fits in Your Frame</p>
        <div className="space-y-1.5">
          {dsoComparison.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-xs">
              <div className="flex-1">
                <span className="text-text-primary">{d.name}</span>
                <span className="text-text-muted text-[10px] ml-2">— {d.notes}</span>
              </div>
              <div className="text-right">
                {d.dominatesFrame ? (
                  <span className="text-astro-yellow">larger than frame</span>
                ) : d.fitsInFrame > 10 ? (
                  <span className="text-text-muted">tiny ({d.fitsInFrame.toFixed(0)}× fits)</span>
                ) : d.fitsInFrame > 3 ? (
                  <span className="text-accent">good fit ({d.fitsInFrame.toFixed(1)}× fits)</span>
                ) : (
                  <span className="text-astro-green">fills frame nicely</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
