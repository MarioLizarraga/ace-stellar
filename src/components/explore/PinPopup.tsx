import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Photo } from '../../types'

interface PinPopupProps {
  locationName: string
  photos: Photo[]
  onClose: () => void
}

export function PinPopup({ locationName, photos, onClose }: PinPopupProps) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-surface border border-border rounded-xl p-5 shadow-2xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-text-primary">{locationName}</h3>
            <p className="text-xs text-text-muted">{photos.length} photo{photos.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-lg ml-4">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {photos.slice(0, 4).map((photo) => (
            <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-bg-primary">
              <img
                src={photo.thumbnail || photo.src}
                alt={photo.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate(`/gallery?location=${encodeURIComponent(locationName)}`)}
          className="w-full bg-accent text-white rounded-lg py-2 text-sm font-medium hover:bg-accent/80 transition-colors"
        >
          View in Gallery →
        </button>
      </div>
    </motion.div>
  )
}
