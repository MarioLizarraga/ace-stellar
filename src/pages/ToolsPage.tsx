import { useState } from 'react'
import { PageTransition } from '../components/layout/PageTransition'
import { StarTrailsCalc } from '../components/tools/StarTrailsCalc'
import { ExposureCalc } from '../components/tools/ExposureCalc'
import { FOVCalc } from '../components/tools/FOVCalc'
import { DoFCalc } from '../components/tools/DoFCalc'
import { StarTrailsPreview } from '../components/tools/StarTrailsPreview'
import { TimeLapseCalc } from '../components/tools/TimeLapseCalc'

type Tool = 'npf' | 'exposure' | 'fov' | 'dof' | 'trails' | 'timelapse'

const TOOLS: Array<{ id: Tool; label: string; icon: string; description: string }> = [
  { id: 'npf', label: 'Star Trails / NPF', icon: '✨', description: 'Max shutter before trails' },
  { id: 'exposure', label: 'Exposure', icon: '⚙️', description: 'ISO / aperture / shutter swap' },
  { id: 'fov', label: 'Field of View', icon: '📐', description: 'What fits in your frame' },
  { id: 'dof', label: 'Depth of Field', icon: '🎯', description: 'Hyperfocal distance' },
  { id: 'trails', label: 'Trails Preview', icon: '🌀', description: 'Arc length by duration' },
  { id: 'timelapse', label: 'Time Lapse', icon: '⏱️', description: 'Frames, duration, storage' },
]

export function ToolsPage() {
  const [active, setActive] = useState<Tool>('npf')

  return (
    <PageTransition>
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extralight tracking-widest mb-2">
          TOOLS <span className="font-bold"></span>
        </h1>
        <p className="text-sm text-[#a8b2c1] mb-8">
          Calculators every astrophotographer needs. No math, just answers.
        </p>

        {/* Tool picker grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`p-3 rounded-xl border transition-all text-left ${
                active === t.id
                  ? 'bg-accent/20 border-accent text-text-primary'
                  : 'bg-bg-surface/30 border-border text-text-muted hover:border-accent/30 hover:text-text-primary'
              }`}
            >
              <div className="text-xl mb-1">{t.icon}</div>
              <p className="text-[11px] font-semibold leading-tight">{t.label}</p>
              <p className="text-[9px] text-text-muted mt-0.5 leading-tight">{t.description}</p>
            </button>
          ))}
        </div>

        {/* Active tool */}
        <div className="bg-bg-surface/30 border border-border rounded-xl p-6">
          {active === 'npf' && <StarTrailsCalc />}
          {active === 'exposure' && <ExposureCalc />}
          {active === 'fov' && <FOVCalc />}
          {active === 'dof' && <DoFCalc />}
          {active === 'trails' && <StarTrailsPreview />}
          {active === 'timelapse' && <TimeLapseCalc />}
        </div>
      </div>
    </PageTransition>
  )
}
