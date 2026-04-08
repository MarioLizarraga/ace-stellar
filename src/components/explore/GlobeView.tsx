import { useRef, useEffect, useMemo, useState } from 'react'
import Globe from 'react-globe.gl'
import type { GlobeMethods } from 'react-globe.gl'
import type { Photo } from '../../types'

interface GlobePin {
  lat: number
  lng: number
  name: string
  photos: Photo[]
  size: number
}

interface GlobeViewProps {
  photos: Photo[]
  onPinClick: (pin: GlobePin) => void
}

export type { GlobePin }

export function GlobeView({ photos, onPinClick }: GlobeViewProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  const pins: GlobePin[] = useMemo(() => {
    const locationMap = new Map<string, GlobePin>()
    for (const photo of photos) {
      const key = `${photo.location.lat},${photo.location.lng}`
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          lat: photo.location.lat,
          lng: photo.location.lng,
          name: photo.location.name,
          photos: [],
          size: 0,
        })
      }
      locationMap.get(key)!.photos.push(photo)
    }
    for (const pin of locationMap.values()) {
      pin.size = Math.min(1.5, 0.4 + pin.photos.length * 0.15)
    }
    return Array.from(locationMap.values())
  }, [photos])

  useEffect(() => {
    function updateDimensions() {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (globeRef.current && pins.length > 0) {
      const mainPin = pins.reduce((a, b) => (a.photos.length > b.photos.length ? a : b))
      globeRef.current.pointOfView({ lat: mainPin.lat, lng: mainPin.lng, altitude: 2.5 }, 1000)
    }
  }, [pins])

  return (
    <div ref={containerRef} className="w-full h-full">
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={`${import.meta.env.BASE_URL}textures/earth-blue-marble.jpg`}
        bumpImageUrl={`${import.meta.env.BASE_URL}textures/earth-topology.png`}
        backgroundImageUrl={`${import.meta.env.BASE_URL}textures/night-sky.png`}
        atmosphereColor="#4a6fa5"
        atmosphereAltitude={0.15}
        pointsData={pins}
        pointLat={(d) => (d as GlobePin).lat}
        pointLng={(d) => (d as GlobePin).lng}
        pointAltitude={0.06}
        pointRadius={(d) => (d as GlobePin).size}
        pointColor={() => '#E53E3E'}
        pointLabel={(d) => {
          const pin = d as GlobePin
          return `<div style="background:#1a1a3e;border:1px solid #2a2a4a;border-radius:8px;padding:8px 12px;font-size:12px;color:#e8e8ff;pointer-events:none;">
            <strong>${pin.name}</strong><br/>
            <span style="color:#6b7280;">${pin.photos.length} photo${pin.photos.length !== 1 ? 's' : ''}</span>
          </div>`
        }}
        onPointClick={(point) => onPinClick(point as GlobePin)}
        animateIn={true}
      />
    </div>
  )
}
