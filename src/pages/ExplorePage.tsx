import { useState, useCallback } from 'react'
import { PageTransition } from '../components/layout/PageTransition'
import { GlobeView } from '../components/explore/GlobeView'
import type { GlobePin } from '../components/explore/GlobeView'
import { PinPopup } from '../components/explore/PinPopup'
import { CoordPicker } from '../components/explore/CoordPicker'
import photosData from '../data/photos.json'
import type { Photo } from '../types'

const photos = photosData as Photo[]

export function ExplorePage() {
  const [selectedPin, setSelectedPin] = useState<GlobePin | null>(null)
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null)

  const handlePinClick = useCallback((pin: GlobePin) => {
    setSelectedPin(pin)
    setClickedCoords(null)
  }, [])

  const handleGlobeClick = useCallback((coords: { lat: number; lng: number }) => {
    setClickedCoords(coords)
    setSelectedPin(null)
  }, [])

  const handleSaveLocation = useCallback((name: string, lat: number, lng: number) => {
    const saved = JSON.parse(localStorage.getItem('ace-stellar-locations') || '[]')
    saved.push({ id: name.toLowerCase().replace(/\s+/g, '-'), name, lat, lng, bortle: 5 })
    localStorage.setItem('ace-stellar-locations', JSON.stringify(saved))
    setClickedCoords(null)
    alert(`Location "${name}" saved! It will appear in your Dashboard weather station on next reload.`)
  }, [])

  return (
    <PageTransition>
      <div className="relative z-10 h-[calc(100vh-4rem)]">
        <div className="absolute top-4 left-4 z-20">
          <h1 className="text-2xl font-extralight tracking-widest">
            EX<span className="font-bold">PLORE</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">Click a pin to see photos • Click the globe to save a location</p>
        </div>

        <GlobeView
          photos={photos}
          onPinClick={handlePinClick}
          onGlobeClick={handleGlobeClick}
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

        <CoordPicker
          clickedCoords={clickedCoords}
          onSave={handleSaveLocation}
          onDismiss={() => setClickedCoords(null)}
        />
      </div>
    </PageTransition>
  )
}
