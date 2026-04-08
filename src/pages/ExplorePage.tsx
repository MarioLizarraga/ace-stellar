import { useState, useCallback } from 'react'
import { PageTransition } from '../components/layout/PageTransition'
import { GlobeView } from '../components/explore/GlobeView'
import type { GlobePin } from '../components/explore/GlobeView'
import { PinPopup } from '../components/explore/PinPopup'
import photosData from '../data/photos.json'
import type { Photo } from '../types'

const photos = photosData as Photo[]

export function ExplorePage() {
  const [selectedPin, setSelectedPin] = useState<GlobePin | null>(null)

  const handlePinClick = useCallback((pin: GlobePin) => {
    setSelectedPin(pin)
  }, [])

  return (
    <PageTransition>
      <div className="relative z-10 h-[calc(100vh-4rem)]">
        <div className="absolute top-4 left-4 z-20">
          <h1 className="text-2xl font-extralight tracking-widest">
            EX<span className="font-bold">PLORE</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">Click a pin to see photos from that location</p>
        </div>

        <GlobeView
          photos={photos}
          onPinClick={handlePinClick}
        />

        {selectedPin && (
          <div className="absolute top-20 right-4 z-20">
            <PinPopup
              locationName={selectedPin.name}
              photos={selectedPin.photos}
              onClose={() => setSelectedPin(null)}
            />
          </div>
        )}
      </div>
    </PageTransition>
  )
}
