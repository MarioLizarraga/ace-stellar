import { useState, useMemo } from 'react'
import { previewStarTrails } from '../../lib/astro-calculators'

export function StarTrailsPreview() {
  const [duration, setDuration] = useState(60)

  const preview = useMemo(() => previewStarTrails(duration), [duration])

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">Star Trails Duration Preview</h3>
        <p className="text-xs text-[#a8b2c1]">
          How much sky rotation you'll capture. Earth rotates 15° per hour.
        </p>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1 block">Total Shooting Duration (minutes)</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(parseFloat(e.target.value) || 0)}
          className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
        />
        <input
          type="range"
          min="5"
          max="360"
          step="5"
          value={duration}
          onChange={(e) => setDuration(parseFloat(e.target.value))}
          className="w-full mt-2 accent-accent"
        />
        <div className="flex justify-between text-[10px] text-text-muted mt-1">
          <span>5 min</span>
          <span>6 hours</span>
        </div>
      </div>

      <div className="bg-astro-green/10 border border-astro-green/30 rounded-lg p-4 text-center">
        <p className="text-[10px] uppercase tracking-widest text-astro-green mb-1">Arc Length</p>
        <p className="text-5xl font-bold text-astro-green tabular-nums">{preview.arcDegrees}°</p>
        <p className="text-sm text-text-primary mt-2">{preview.description}</p>
      </div>

      <p className="text-xs text-[#a8b2c1] bg-accent/10 border border-accent/30 rounded-lg p-3">
        💡 {preview.suggestion}
      </p>

      <div className="bg-bg-primary/30 border border-border rounded-lg p-4">
        <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Quick Reference</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between"><span className="text-text-muted">15 min</span><span className="text-text-primary tabular-nums">3.8°</span></div>
          <div className="flex justify-between"><span className="text-text-muted">30 min</span><span className="text-text-primary tabular-nums">7.5°</span></div>
          <div className="flex justify-between"><span className="text-text-muted">1 hour</span><span className="text-text-primary tabular-nums">15°</span></div>
          <div className="flex justify-between"><span className="text-text-muted">2 hours</span><span className="text-text-primary tabular-nums">30°</span></div>
          <div className="flex justify-between"><span className="text-text-muted">4 hours</span><span className="text-text-primary tabular-nums">60°</span></div>
          <div className="flex justify-between"><span className="text-text-muted">8 hours</span><span className="text-text-primary tabular-nums">120°</span></div>
        </div>
      </div>
    </div>
  )
}
