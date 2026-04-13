import { useState } from 'react'
import { PageTransition } from '../components/layout/PageTransition'
import { StarTrailsCalc } from '../components/tools/StarTrailsCalc'
import { ExposureCalc } from '../components/tools/ExposureCalc'
import { FOVCalc } from '../components/tools/FOVCalc'
import { DoFCalc } from '../components/tools/DoFCalc'
import { StarTrailsPreview } from '../components/tools/StarTrailsPreview'
import { TimeLapseCalc } from '../components/tools/TimeLapseCalc'
import { TutorialOverlay } from '../components/tools/TutorialOverlay'
import type { TutorialStep } from '../components/tools/TutorialOverlay'

type Tool = 'npf' | 'exposure' | 'fov' | 'dof' | 'trails' | 'timelapse'

const TOOLS: Array<{ id: Tool; label: string; icon: string; description: string }> = [
  { id: 'npf', label: 'Star Trails / NPF', icon: '✨', description: 'Max shutter before trails' },
  { id: 'exposure', label: 'Exposure', icon: '⚙️', description: 'ISO / aperture / shutter swap' },
  { id: 'fov', label: 'Field of View', icon: '📐', description: 'What fits in your frame' },
  { id: 'dof', label: 'Depth of Field', icon: '🎯', description: 'Hyperfocal distance' },
  { id: 'trails', label: 'Trails Preview', icon: '🌀', description: 'Arc length by duration' },
  { id: 'timelapse', label: 'Time Lapse', icon: '⏱️', description: 'Frames, duration, storage' },
]

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: '',
    title: 'Welcome to the Tools Page! 🔭',
    body: 'This page has 6 calculators every astrophotographer needs.\n\nIn this quick tour, I\'ll show you what each tool does, when to use it, and the recommended workflow for planning a shoot.\n\nLet\'s go!',
    placement: 'center',
    tool: null,
  },
  {
    target: '[data-tour="tool-picker"]',
    title: 'Tool Picker',
    body: 'Click any tool here to switch between calculators. You can always come back to this section — it\'s your navigation.\n\nOn mobile, they stack into a 2-column grid.',
    placement: 'bottom',
    tool: null,
  },
  {
    target: '[data-tour="tool-npf"]',
    title: '1. Star Trails / NPF Rule ✨',
    body: 'START HERE when planning a shoot.\n\nThis calculates the MAX shutter time before stars blur into trails.\n\nInputs: Your camera, lens focal length, and aperture.\nOutput: The longest exposure you can use for pin-sharp stars.',
    placement: 'right',
    tool: 'npf',
  },
  {
    target: '[data-tour="npf-inputs"]',
    title: 'Enter Your Gear',
    body: 'Pick your camera from the dropdown — this loads the exact sensor specs.\n\nEnter your focal length (e.g., 14mm for wide Milky Way).\n\nEnter your aperture (e.g., f/2.8).\n\nLeave declination at 0 unless you\'re shooting a specific object — 0 is the safe worst case.',
    placement: 'top',
    tool: 'npf',
  },
  {
    target: '[data-tour="npf-result"]',
    title: 'Read the Results',
    body: 'You get TWO numbers:\n\n• 500 Rule — the simple classic, "good enough" for casual shots.\n\n• NPF Rule ★ — more accurate, uses pixel pitch to give you the exact max shutter before visible trailing at 100% zoom.\n\nUse the NPF number. That\'s your shutter speed.',
    placement: 'top',
    tool: 'npf',
  },
  {
    target: '[data-tour="tool-exposure"]',
    title: '2. Exposure Calculator ⚙️',
    body: 'Now you know your shutter speed. Need to convert exposures?\n\nUse this when you want to keep the SAME brightness but change one setting.\n\nExample: your reference shot is ISO 3200 f/2.8 20s. You borrow a f/1.4 lens — what ISO do you need to match?',
    placement: 'right',
    tool: 'exposure',
  },
  {
    target: '[data-tour="exposure-ref"]',
    title: 'Set Your Reference',
    body: 'Enter a known-good exposure (maybe your usual Milky Way shot).\n\nThe calculator reads this as your "target" brightness.',
    placement: 'bottom',
    tool: 'exposure',
  },
  {
    target: '[data-tour="exposure-solve"]',
    title: 'Solve for the Unknown',
    body: 'Pick what to solve for (ISO, aperture, or shutter).\n\nFill in the two values you know.\n\nThe equivalent value updates live — same total exposure, different settings.',
    placement: 'top',
    tool: 'exposure',
  },
  {
    target: '[data-tour="tool-fov"]',
    title: '3. Field of View 📐',
    body: 'Before you head out, know what fits in your frame!\n\nThis tool shows the angular coverage of your lens + camera combo, and compares it to famous deep sky objects.\n\nPlanning a shot of Andromeda? See if it fits in one frame or needs a panorama.',
    placement: 'right',
    tool: 'fov',
  },
  {
    target: '[data-tour="fov-result"]',
    title: 'Frame Comparison',
    body: 'The list shows how each DSO fits in your current FOV:\n\n• "fills frame nicely" — perfect focal length for this target.\n• "larger than frame" — you need a panorama or wider lens.\n• "tiny" — too wide, use a longer focal length.',
    placement: 'top',
    tool: 'fov',
  },
  {
    target: '[data-tour="tool-dof"]',
    title: '4. Depth of Field / Hyperfocal 🎯',
    body: 'The #1 beginner question: "Where should I focus for astro-landscape?"\n\nAnswer: the hyperfocal distance.\n\nFocus at this distance and EVERYTHING from near the camera to infinity will be sharp.',
    placement: 'right',
    tool: 'dof',
  },
  {
    target: '[data-tour="dof-result"]',
    title: 'Hyperfocal = Your Focus Point',
    body: 'The green box shows the hyperfocal distance — this is where to focus.\n\nNear and far limits show the range of sharpness.\n\nFor astro-landscape at 14mm f/2.8, hyperfocal is usually 1-3m — just focus on something a few meters away.',
    placement: 'top',
    tool: 'dof',
  },
  {
    target: '[data-tour="tool-trails"]',
    title: '5. Star Trails Preview 🌀',
    body: 'Want to shoot STAR TRAILS instead of point stars? This is the opposite of NPF.\n\nThis tool tells you how much sky rotation you\'ll capture over a given duration.\n\nEarth rotates 15° per hour. Longer = more dramatic arcs.',
    placement: 'right',
    tool: 'trails',
  },
  {
    target: '[data-tour="trails-slider"]',
    title: 'Slide to Visualize',
    body: 'Drag the slider from 5 minutes to 6 hours to see how the arcs grow.\n\n• 30 min = short trails (~7.5°)\n• 2 hours = dramatic arcs (30°)\n• 6 hours = near-full circles (90°)\n\nAim for at least 1 hour for visible trails.',
    placement: 'top',
    tool: 'trails',
  },
  {
    target: '[data-tour="tool-timelapse"]',
    title: '6. Time Lapse ⏱️',
    body: 'Planning a time lapse? Figure out how long to shoot and how much storage you need.\n\nA 10-second clip at 24fps needs 240 frames.\n\nAt 20-second intervals, that\'s 80 minutes of shooting.',
    placement: 'right',
    tool: 'timelapse',
  },
  {
    target: '[data-tour="timelapse-result"]',
    title: 'Plan Your Shoot',
    body: 'Get total frames, shooting duration, and storage needed in one place.\n\nDon\'t get caught with a dead battery or full memory card mid-timelapse!',
    placement: 'top',
    tool: 'timelapse',
  },
  {
    target: '',
    title: 'You\'re Ready! 🚀',
    body: 'Recommended workflow for a Milky Way shoot:\n\n1. NPF Rule → get your max shutter\n2. Exposure Calc → dial in ISO/aperture\n3. FOV → confirm your lens frames the target\n4. DoF → find your focus distance\n5. Shoot!\n\nBookmark this page. Clear skies! ✨',
    placement: 'center',
    tool: 'npf',
  },
]

export function ToolsPage() {
  const [active, setActive] = useState<Tool>('npf')
  const [tutorialActive, setTutorialActive] = useState(false)

  function handleStepChange(step: TutorialStep) {
    if (step.tool) setActive(step.tool)
  }

  return (
    <PageTransition>
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-2 gap-4">
          <div>
            <h1 className="text-3xl font-extralight tracking-widest">
              TOOLS
            </h1>
            <p className="text-sm text-[#a8b2c1] mt-1">
              Calculators every astrophotographer needs. No math, just answers.
            </p>
          </div>
          <button
            onClick={() => setTutorialActive(true)}
            className="shrink-0 bg-accent/20 border border-accent/40 text-accent rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent/30 transition-colors flex items-center gap-2"
          >
            <span>📖</span> Tutorial
          </button>
        </div>

        {/* Tool picker grid */}
        <div data-tour="tool-picker" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 my-8">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              data-tour={`tool-${t.id}`}
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
          {active === 'npf' && (
            <div>
              <div data-tour="npf-inputs">
                <StarTrailsCalc />
              </div>
            </div>
          )}
          {active === 'exposure' && <ExposureCalc />}
          {active === 'fov' && <FOVCalc />}
          {active === 'dof' && <DoFCalc />}
          {active === 'trails' && <StarTrailsPreview />}
          {active === 'timelapse' && <TimeLapseCalc />}
        </div>

        <TutorialOverlay
          steps={TUTORIAL_STEPS}
          isActive={tutorialActive}
          onClose={() => setTutorialActive(false)}
          onStepChange={handleStepChange}
        />
      </div>
    </PageTransition>
  )
}
