import type { Photo } from '../../types'
import { PhotoCard } from './PhotoCard'

interface PhotoGridProps {
  photos: Photo[]
  onPhotoClick: (index: number) => void
}

export function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="text-center py-20 text-text-muted">
        <p className="text-lg">No photos match your filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          index={index}
          onClick={() => onPhotoClick(index)}
        />
      ))}
    </div>
  )
}
