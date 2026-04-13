import { useState, useMemo } from 'react'
import { calculateTimeLapse } from '../../lib/astro-calculators'

export function TimeLapseCalc() {
  const [clipLengthSec, setClipLengthSec] = useState(10)
  const [playbackFps, setPlaybackFps] = useState(24)
  const [shootInterval, setShootInterval] = useState(10)
  const [fileSizeMB, setFileSizeMB] = useState(25)

  const result = useMemo(
    () => calculateTimeLapse(clipLengthSec, playbackFps, shootInterval, fileSizeMB),
    [clipLengthSec, playbackFps, shootInterval, fileSizeMB],
  )

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">Time Lapse Calculator</h3>
        <p className="text-xs text-[#a8b2c1]">
          Plan shooting duration and storage for your time lapse.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1 block">Final Clip Length (seconds)</label>
          <input type="number" value={clipLengthSec} onChange={(e) => setClipLengthSec(parseFloat(e.target.value) || 0)}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1 block">Playback FPS</label>
          <select value={playbackFps} onChange={(e) => setPlaybackFps(parseFloat(e.target.value))}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary">
            <option value={24}>24 (cinematic)</option>
            <option value={30}>30 (standard)</option>
            <option value={60}>60 (smooth)</option>
            <option value={120}>120 (super smooth)</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1 block">Shooting Interval (seconds)</label>
          <input type="number" value={shootInterval} onChange={(e) => setShootInterval(parseFloat(e.target.value) || 0)}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary" />
          <p className="text-[9px] text-text-muted mt-1">Stars/MW: 15-30s. Clouds: 3-5s. Traffic: 1-2s.</p>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-text-muted mb-1 block">Avg File Size (MB)</label>
          <input type="number" value={fileSizeMB} onChange={(e) => setFileSizeMB(parseFloat(e.target.value) || 0)}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary" />
          <p className="text-[9px] text-text-muted mt-1">RAW FF: ~25-45MB. JPEG: ~5-10MB.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-bg-primary/50 border border-border rounded-lg p-4 text-center">
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Total Frames</p>
          <p className="text-3xl font-bold text-text-primary tabular-nums">{result.totalFrames.toLocaleString()}</p>
        </div>
        <div className="bg-astro-green/10 border border-astro-green/30 rounded-lg p-4 text-center">
          <p className="text-[10px] uppercase tracking-widest text-astro-green mb-1">Shooting Time</p>
          <p className="text-2xl font-bold text-astro-green tabular-nums">{result.totalShootTimeFormatted}</p>
        </div>
        <div className="bg-bg-primary/50 border border-border rounded-lg p-4 text-center">
          <p className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Storage Needed</p>
          <p className="text-3xl font-bold text-text-primary tabular-nums">{result.storageGB}<span className="text-lg text-text-muted ml-1">GB</span></p>
        </div>
      </div>

      <p className="text-xs text-[#a8b2c1] bg-accent/10 border border-accent/30 rounded-lg p-3">
        💡 For a smooth 10-second clip at 24fps, you need 240 frames. At 20s intervals, that's 80 minutes of shooting.
      </p>
    </div>
  )
}
