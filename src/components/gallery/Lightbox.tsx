import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Photo } from '../../types'

interface LightboxProps {
  photos: Photo[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNavigate: (index: number) => void
}

export function Lightbox({ photos, currentIndex, isOpen, onClose, onNavigate }: LightboxProps) {
  const photo = photos[currentIndex]

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1)
      if (e.key === 'ArrowRight' && currentIndex < photos.length - 1) onNavigate(currentIndex + 1)
    },
    [currentIndex, photos.length, onClose, onNavigate],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen || !photo) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
        className="bg-black/95 flex"
        onClick={onClose}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 text-text-muted hover:text-text-primary text-2xl w-10 h-10 flex items-center justify-center md:right-[340px]"
        >
          ✕
        </button>

        {/* Left arrow */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1) }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-text-muted hover:text-text-primary text-4xl"
          >
            ‹
          </button>
        )}

        {/* Right arrow */}
        {currentIndex < photos.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-text-muted hover:text-text-primary text-4xl md:right-[340px]"
          >
            ›
          </button>
        )}

        {/* Image */}
        <div className="flex-1 flex items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
          <motion.img
            key={photo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            src={photo.src}
            alt={photo.title}
            className="max-h-[90vh] max-w-full object-contain rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        </div>

        {/* Detail panel */}
        <motion.div
          initial={{ x: 320 }}
          animate={{ x: 0 }}
          style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '320px', zIndex: 10000 }}
          className="hidden md:flex md:flex-col bg-bg-primary border-l border-border overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 pt-8 flex-1">
            <h2 className="text-lg font-semibold text-text-primary mb-2">{photo.title}</h2>

            {photo.description && (
              <p className="text-text-muted text-sm mb-4 leading-relaxed">{photo.description}</p>
            )}

            <p className="text-text-muted text-sm mb-1">{photo.location.name}</p>
            <p className="text-text-muted text-xs mb-1">
              {photo.location.lat.toFixed(4)}, {photo.location.lng.toFixed(4)}
            </p>
            <p className="text-text-muted text-xs mb-6">
              {new Date(photo.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="space-y-3 mb-6">
              <h3 className="text-xs tracking-widest uppercase text-text-muted">Camera Details</h3>
              <div className="space-y-2 text-sm">
                {[
                  ['Camera', photo.exif.camera],
                  ['Lens', photo.exif.lens],
                  ['Focal Length', photo.exif.focalLength],
                  ['Aperture', photo.exif.aperture],
                  ['Shutter', photo.exif.shutter],
                  ['ISO', String(photo.exif.iso)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-text-muted">{label}</span>
                    <span className="text-text-primary">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {photo.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-bg-surface border border-border rounded-full text-xs text-text-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
