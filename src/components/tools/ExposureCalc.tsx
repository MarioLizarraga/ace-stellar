import { useState, useMemo } from 'react'
import { solveEquivalent, calculateEV } from '../../lib/astro-calculators'

type Unknown = 'iso' | 'aperture' | 'shutter'

export function ExposureCalc() {
  // Target exposure (the "reference" shot)
  const [targetIso, setTargetIso] = useState(3200)
  const [targetAperture, setTargetAperture] = useState(2.8)
  const [targetShutter, setTargetShutter] = useState(20)

  // What we want to solve for
  const [unknown, setUnknown] = useState<Unknown>('shutter')
  const [knownIso, setKnownIso] = useState(800)
  const [knownAperture, setKnownAperture] = useState(1.4)
  const [knownShutter, setKnownShutter] = useState(5)

  const target = { iso: targetIso, aperture: targetAperture, shutter: targetShutter }
  const partial: Record<string, number> = {}
  if (unknown !== 'iso') partial.iso = knownIso
  if (unknown !== 'aperture') partial.aperture = knownAperture
  if (unknown !== 'shutter') partial.shutter = knownShutter

  const solved = useMemo(() => solveEquivalent(target, partial, unknown), [target, partial, unknown])
  const targetEV = useMemo(() => calculateEV(target), [target])

  function formatValue(v: number | null, field: Unknown): string {
    if (v === null) return '—'
    if (field === 'iso') return Math.round(v).toString()
    if (field === 'aperture') return `f/${v.toFixed(1)}`
    if (v >= 1) return `${v.toFixed(1)}s`
    return `1/${Math.round(1 / v)}s`
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">Exposure Calculator</h3>
        <p className="text-xs text-[#a8b2c1]">Convert between ISO / aperture / shutter while keeping the same total exposure.</p>
      </div>

      <div data-tour="exposure-ref" className="bg-bg-primary/30 border border-border rounded-lg p-4">
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Reference Exposure</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-text-muted block mb-1">ISO</label>
            <input type="number" value={targetIso} onChange={(e) => setTargetIso(parseFloat(e.target.value) || 0)}
              className="w-full bg-bg-primary border border-border rounded px-2 py-1.5 text-sm text-text-primary" />
          </div>
          <div>
            <label className="text-[10px] text-text-muted block mb-1">Aperture (f/)</label>
            <input type="number" step="0.1" value={targetAperture} onChange={(e) => setTargetAperture(parseFloat(e.target.value) || 0)}
              className="w-full bg-bg-primary border border-border rounded px-2 py-1.5 text-sm text-text-primary" />
          </div>
          <div>
            <label className="text-[10px] text-text-muted block mb-1">Shutter (s)</label>
            <input type="number" step="0.1" value={targetShutter} onChange={(e) => setTargetShutter(parseFloat(e.target.value) || 0)}
              className="w-full bg-bg-primary border border-border rounded px-2 py-1.5 text-sm text-text-primary" />
          </div>
        </div>
        <p className="text-[10px] text-text-muted mt-2">EV: <span className="tabular-nums text-text-primary">{targetEV.toFixed(2)}</span></p>
      </div>

      <div data-tour="exposure-solve" className="bg-bg-primary/30 border border-border rounded-lg p-4">
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Solve For</p>
        <div className="flex gap-2 mb-3">
          {(['iso', 'aperture', 'shutter'] as Unknown[]).map((k) => (
            <button
              key={k}
              onClick={() => setUnknown(k)}
              className={`px-3 py-1 rounded text-xs uppercase tracking-wider ${
                unknown === k
                  ? 'bg-accent text-white'
                  : 'bg-bg-surface text-text-muted hover:text-text-primary border border-border'
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className={unknown === 'iso' ? 'opacity-30' : ''}>
            <label className="text-[10px] text-text-muted block mb-1">ISO {unknown === 'iso' && '(solving)'}</label>
            <input type="number" value={knownIso} disabled={unknown === 'iso'}
              onChange={(e) => setKnownIso(parseFloat(e.target.value) || 0)}
              className="w-full bg-bg-primary border border-border rounded px-2 py-1.5 text-sm text-text-primary" />
          </div>
          <div className={unknown === 'aperture' ? 'opacity-30' : ''}>
            <label className="text-[10px] text-text-muted block mb-1">Aperture {unknown === 'aperture' && '(solving)'}</label>
            <input type="number" step="0.1" value={knownAperture} disabled={unknown === 'aperture'}
              onChange={(e) => setKnownAperture(parseFloat(e.target.value) || 0)}
              className="w-full bg-bg-primary border border-border rounded px-2 py-1.5 text-sm text-text-primary" />
          </div>
          <div className={unknown === 'shutter' ? 'opacity-30' : ''}>
            <label className="text-[10px] text-text-muted block mb-1">Shutter {unknown === 'shutter' && '(solving)'}</label>
            <input type="number" step="0.1" value={knownShutter} disabled={unknown === 'shutter'}
              onChange={(e) => setKnownShutter(parseFloat(e.target.value) || 0)}
              className="w-full bg-bg-primary border border-border rounded px-2 py-1.5 text-sm text-text-primary" />
          </div>
        </div>
      </div>

      <div className="bg-astro-green/10 border border-astro-green/30 rounded-lg p-4">
        <p className="text-[10px] uppercase tracking-widest text-astro-green mb-1">Equivalent {unknown}</p>
        <p className="text-3xl font-bold text-astro-green tabular-nums">{formatValue(solved, unknown)}</p>
      </div>
    </div>
  )
}
