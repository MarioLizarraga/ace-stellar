import { useState, useEffect, useLayoutEffect } from 'react'
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
  const [scrollTick, setScrollTick] = useState(0)

  const step = steps[stepIndex]

  // Notify parent of step changes (e.g., to switch the active tool)
  useEffect(() => {
    if (isActive && step && onStepChange) {
      onStepChange(step, stepIndex)
    }
  }, [isActive, stepIndex])

  // Reset when tutorial opens/closes
  useEffect(() => {
    if (isActive) {
      setStepIndex(0)
    }
  }, [isActive])

  // Find target element and track its position (including after scroll/resize)
  useLayoutEffect(() => {
    if (!isActive || !step) return

    function updateRect() {
      if (step.placement === 'center' || !step.target) {
        setRect(null)
        return
      }
      const el = document.querySelector(step.target)
      if (el) {
        const r = el.getBoundingClientRect()
        setRect(r)
        // Scroll element into view
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        setRect(null)
      }
    }

    // Delay slightly for the tool switch render
    const timer = setTimeout(updateRect, 200)

    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, true)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect, true)
    }
  }, [isActive, step, scrollTick])

  // Periodic re-measure to catch layout shifts
  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => setScrollTick((t) => t + 1), 500)
    return () => clearInterval(interval)
  }, [isActive])

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
    if (placement === 'bottom') {
      tooltipStyle = {
        position: 'fixed',
        top: rect.bottom + padding,
        left: Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, rect.left + rect.width / 2 - tooltipWidth / 2)),
        width: tooltipWidth,
      }
    } else if (placement === 'top') {
      tooltipStyle = {
        position: 'fixed',
        bottom: window.innerHeight - rect.top + padding,
        left: Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, rect.left + rect.width / 2 - tooltipWidth / 2)),
        width: tooltipWidth,
      }
    } else if (placement === 'right') {
      tooltipStyle = {
        position: 'fixed',
        top: Math.max(16, rect.top),
        left: rect.right + padding,
        width: tooltipWidth,
      }
    } else if (placement === 'left') {
      tooltipStyle = {
        position: 'fixed',
        top: Math.max(16, rect.top),
        right: window.innerWidth - rect.left + padding,
        width: tooltipWidth,
      }
    }
  }

  const content = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 99998, pointerEvents: 'none' }}
      >
        {/* Dim overlay with cutout for target */}
        {rect && !isCentered ? (
          <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'auto' }}>
            <defs>
              <mask id="tutorial-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={rect.left - 8}
                  y={rect.top - 8}
                  width={rect.width + 16}
                  height={rect.height + 16}
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
              onClick={onClose}
            />
            {/* Highlight ring */}
            <rect
              x={rect.left - 8}
              y={rect.top - 8}
              width={rect.width + 16}
              height={rect.height + 16}
              rx="12"
              fill="none"
              stroke="#4a6fa5"
              strokeWidth="2"
              style={{ pointerEvents: 'none' }}
            >
              <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
            </rect>
          </svg>
        ) : (
          <div
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(10, 10, 26, 0.85)',
              pointerEvents: 'auto',
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
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
      </motion.div>
    </AnimatePresence>
  )

  return createPortal(content, document.body)
}
