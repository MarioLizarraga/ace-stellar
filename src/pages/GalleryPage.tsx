import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageTransition } from '../components/layout/PageTransition'
import { PhotoGrid } from '../components/gallery/PhotoGrid'
import { FilterBar } from '../components/gallery/FilterBar'
import { Lightbox } from '../components/gallery/Lightbox'
import photosData from '../data/photos.json'
import type { Photo } from '../types'

const photos = photosData as Photo[]

export function GalleryPage() {
  const [searchParams] = useSearchParams()
  const locationFilter = searchParams.get('location')

  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeLocation, setActiveLocation] = useState<string | null>(locationFilter)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'featured'>('newest')
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  const categories = useMemo(
    () => [...new Set(photos.map((p) => p.category))],
    [],
  )

  const locations = useMemo(
    () => [...new Set(photos.map((p) => p.location.name))],
    [],
  )

  const filteredPhotos = useMemo(() => {
    let result = [...photos]

    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory)
    }
    if (activeLocation) {
      result = result.filter((p) => p.location.name === activeLocation)
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.date.localeCompare(a.date))
        break
      case 'oldest':
        result.sort((a, b) => a.date.localeCompare(b.date))
        break
      case 'featured':
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        break
    }

    return result
  }, [activeCategory, activeLocation, sortBy])

  return (
    <PageTransition>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extralight tracking-widest">
            GAL<span className="font-bold">LERY</span>
          </h1>
          <a
            href="https://instagram.com/ace.stellar.photography"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent text-sm hover:underline"
          >
            @ace.stellar.photography
          </a>
        </div>

        <FilterBar
          categories={categories}
          activeCategory={activeCategory}
          locations={locations}
          activeLocation={activeLocation}
          sortBy={sortBy}
          onCategoryChange={setActiveCategory}
          onLocationChange={setActiveLocation}
          onSortChange={setSortBy}
        />

        <PhotoGrid
          photos={filteredPhotos}
          onPhotoClick={setLightboxIndex}
        />

        <Lightbox
          photos={filteredPhotos}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex >= 0}
          onClose={() => setLightboxIndex(-1)}
          onNavigate={setLightboxIndex}
        />
      </div>
    </PageTransition>
  )
}
