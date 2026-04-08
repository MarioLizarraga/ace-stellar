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

  return (
    <AnimatePresence>
      {isOpen && photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/90 flex"
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-text-muted hover:text-text-primary text-2xl w-10 h-10 flex items-center justify-center"
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
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-text-muted hover:text-text-primary text-4xl md:right-80"
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
              exit={{ opacity: 0, scale: 0.95 }}
              src={photo.src}
              alt={photo.title}
              className="max-h-[85vh] max-w-full object-contain rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>

          {/* Detail panel */}
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            className="hidden md:block w-72 bg-bg-primary/95 border-l border-border p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-text-primary mb-2">{photo.title}</h2>
            <p className="text-text-muted text-sm mb-4">{photo.location.name}</p>
            <p className="text-text-muted text-xs mb-6">{new Date(photo.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <div className="space-y-3">
              <h3 className="text-xs tracking-widest uppercase text-text-muted">Camera Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Camera</span>
                  <span className="text-text-primary">{photo.exif.camera}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Lens</span>
                  <span className="text-text-primary">{photo.exif.lens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Focal Length</span>
                  <span className="text-text-primary">{photo.exif.focalLength}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Aperture</span>
                  <span className="text-text-primary">{photo.exif.aperture}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Shutter</span>
                  <span className="text-text-primary">{photo.exif.shutter}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">ISO</span>
                  <span className="text-text-primary">{photo.exif.iso}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {photo.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-bg-surface border border-border rounded-full text-xs text-text-muted">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
