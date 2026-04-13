import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

export interface TutorialStep {
  target: string // CSS selector for element to highlight
  title: string
  body: string
  tool?: 'npf' | 'exposure' | 'fov' | 'dof' | 'trails' | 'timelapse' | null // auto-switch tool
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

interface TutorialOverlayProps {
  steps: TutorialStep[]
  isActive: boolean
  onClose: () => void
  onStepChange?: (step: TutorialStep, index: number) => void
}

export function TutorialOverlay({ steps, isActive, onClose, onStepChange }: TutorialOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [ready, setReady] = useState(false) // controls visibility during transition

  const step = steps[stepIndex]

  // Notify parent of step changes (e.g., to switch the active tool)
  useEffect(() => {
    if (isActive && step && onStepChange) {
      onStepChange(step, stepIndex)
    }
  }, [isActive, stepIndex])

  // Reset when tutorial opens
  useEffect(() => {
    if (isActive) setStepIndex(0)
    else setReady(false)
  }, [isActive])

  // Handle step transition: hide → wait → scroll → wait → show
  useEffect(() => {
    if (!isActive || !step) return

    setReady(false) // hide tooltip while transitioning
    setRect(null)

    // Wait for tool switch render (React commit + DOM paint)
    const setupTimer = setTimeout(() => {
      if (step.placement === 'center' || !step.target) {
        setRect(null)
        setReady(true)
        return
      }

      const el = document.querySelector(step.target)
      if (!el) {
        setRect(null)
        setReady(true)
        return
      }

      // Scroll element into view smoothly
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })

      // Wait for scroll to finish, then measure
      const scrollTimer = setTimeout(() => {
        const r = el.getBoundingClientRect()
        setRect(r)
        setReady(true)
      }, 500) // enough time for smooth scroll to complete

      return () => clearTimeout(scrollTimer)
    }, 250) // time for tool switch to render

    return () => {
      clearTimeout(setupTimer)
    }
  }, [isActive, stepIndex, step?.target, step?.placement])

  // Keep rect up-to-date if window resizes (but not during transitions)
  useEffect(() => {
    if (!isActive || !ready || !step || step.placement === 'center' || !step.target) return

    function update() {
      const el = document.querySelector(step.target)
      if (el) setRect(el.getBoundingClientRect())
    }

    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [isActive, ready, step])

  if (!isActive || !step) return null

  function next() {
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1)
    else onClose()
  }
  function prev() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1)
  }

  const placement = step.placement || 'bottom'
  const isCentered = placement === 'center' || !rect

  // Tooltip positioning
  let tooltipStyle: React.CSSProperties = {}
  if (isCentered) {
    tooltipStyle = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }
  } else if (rect) {
    const padding = 16
    const tooltipWidth = 380
    const tooltipHeightEstimate = 280 // approximate height of the tooltip
    const viewportH = window.innerHeight
    const viewportW = window.innerWidth

    const centerX = rect.left + rect.width / 2 - tooltipWidth / 2
    const clampX = Math.max(16, Math.min(viewportW - tooltipWidth - 16, centerX))

    // Determine final placement — auto-flip if there isn't enough room
    let finalPlacement = placement
    if (placement === 'top' && rect.top < tooltipHeightEstimate + padding) {
      finalPlacement = 'bottom' // not enough space above → flip to bottom
    } else if (placement === 'bottom' && rect.bottom + tooltipHeightEstimate + padding > viewportH) {
      finalPlacement = 'top' // not enough space below → flip to top
    } else if (placement === 'right' && rect.right + tooltipWidth + padding > viewportW) {
      finalPlacement = 'left'
    } else if (placement === 'left' && rect.left - tooltipWidth - padding < 0) {
      finalPlacement = 'right'
    }

    // As a last resort, if the element is huge or tooltip still won't fit,
    // position at the bottom of the viewport
    if (finalPlacement === 'bottom') {
      const top = Math.min(rect.bottom + padding, viewportH - tooltipHeightEstimate - 16)
      tooltipStyle = {
        position: 'fixed',
        top: Math.max(16, top),
        left: clampX,
        width: tooltipWidth,
      }
    } else if (finalPlacement === 'top') {
      // Use top-based positioning (not bottom) so we can clamp it
      const top = Math.max(16, rect.top - tooltipHeightEstimate - padding)
      tooltipStyle = {
        position: 'fixed',
        top,
        left: clampX,
        width: tooltipWidth,
      }
    } else if (finalPlacement === 'right') {
      const top = Math.max(16, Math.min(viewportH - tooltipHeightEstimate - 16, rect.top))
      tooltipStyle = {
        position: 'fixed',
        top,
        left: Math.min(viewportW - tooltipWidth - 16, rect.right + padding),
        width: tooltipWidth,
      }
    } else if (finalPlacement === 'left') {
      const top = Math.max(16, Math.min(viewportH - tooltipHeightEstimate - 16, rect.top))
      tooltipStyle = {
        position: 'fixed',
        top,
        left: Math.max(16, rect.left - tooltipWidth - padding),
        width: tooltipWidth,
      }
    }
  }

  const content = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99998, pointerEvents: 'none' }}>
      {/* Dim overlay — always visible so the page doesn't flash */}
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 10, 26, 0.82)',
          pointerEvents: 'auto',
        }}
      />

      {/* Spotlight — animates to new position smoothly */}
      <AnimatePresence>
        {ready && rect && !isCentered && (
          <motion.svg
            key="spotlight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            <defs>
              <mask id="tutorial-mask">
                <rect width="100%" height="100%" fill="white" />
                <motion.rect
                  initial={false}
                  animate={{
                    x: rect.left - 8,
                    y: rect.top - 8,
                    width: rect.width + 16,
                    height: rect.height + 16,
                  }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  rx="12"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(10, 10, 26, 0.82)"
              mask="url(#tutorial-mask)"
              pointerEvents="auto"
              onClick={onClose}
            />
            <motion.rect
              initial={false}
              animate={{
                x: rect.left - 8,
                y: rect.top - 8,
                width: rect.width + 16,
                height: rect.height + 16,
              }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              rx="12"
              fill="none"
              stroke="#4a6fa5"
              strokeWidth="2"
            >
              <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
            </motion.rect>
          </motion.svg>
        )}
      </AnimatePresence>

      {/* Tooltip — only render when ready */}
      <AnimatePresence mode="wait">
        {ready && (
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            style={{ ...tooltipStyle, zIndex: 99999, pointerEvents: 'auto' }}
            className="bg-bg-surface border border-accent/40 rounded-xl p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest text-accent">
                Step {stepIndex + 1} of {steps.length}
              </span>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary text-sm"
              >
                Skip tutorial ✕
              </button>
            </div>

            <h3 className="text-lg font-semibold text-text-primary mb-2">{step.title}</h3>
            <p className="text-sm text-[#a8b2c1] leading-relaxed whitespace-pre-line mb-4">{step.body}</p>

            {/* Progress bar */}
            <div className="w-full h-1 bg-bg-primary rounded-full mb-4">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={prev}
                disabled={stepIndex === 0}
                className="text-xs text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                onClick={next}
                className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent/80 transition-colors"
              >
                {stepIndex === steps.length - 1 ? 'Finish 🎉' : 'Next →'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return createPortal(content, document.body)
}
