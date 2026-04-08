import { useNavigate } from 'react-router-dom'
import type { Photo } from '../../types'

interface PinPopupProps {
  locationName: string
  photos: Photo[]
  onClose: () => void
}

export function PinPopup({ locationName, photos, onClose }: PinPopupProps) {
  const navigate = useNavigate()

  return (
    <div className="absolute z-30 bg-bg-surface border border-border rounded-xl p-4 shadow-2xl w-72" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-2 right-2 text-text-muted hover:text-text-primary text-sm">✕</button>

      <h3 className="text-sm font-semibold text-text-primary mb-1">{locationName}</h3>
      <p className="text-xs text-text-muted mb-3">{photos.length} photo{photos.length !== 1 ? 's' : ''}</p>

      <div className="grid grid-cols-2 gap-2 mb-3">
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
        className="w-full text-center text-xs text-accent hover:underline py-1"
      >
        View in Gallery →
      </button>
    </div>
  )
}
