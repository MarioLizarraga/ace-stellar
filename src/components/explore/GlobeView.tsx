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
  // Store the latest callback and pins in refs so htmlElement closures aren't stale
  const onPinClickRef = useRef(onPinClick)
  const pinsRef = useRef<GlobePin[]>([])

  onPinClickRef.current = onPinClick

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
    const result = Array.from(locationMap.values())
    pinsRef.current = result
    return result
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

  function createPinElement(d: object): HTMLElement {
    const pin = d as GlobePin
    const pinKey = `${pin.lat},${pin.lng}`

    const container = document.createElement('div')
    container.style.cursor = 'pointer'
    container.style.transform = 'translate(-50%, -100%)'
    container.style.position = 'relative'
    container.dataset.pinKey = pinKey

    container.addEventListener('click', (e) => {
      e.stopPropagation()
      // Find the pin from the ref to get the latest data
      const currentPin = pinsRef.current.find((p) => `${p.lat},${p.lng}` === pinKey)
      if (currentPin) {
        onPinClickRef.current(currentPin)
      }
    })

    const size = 28 + Math.min(12, pin.photos.length * 3)
    const uniqueId = `pinGrad-${pinKey.replace(/[.,\-]/g, '_')}`
    container.innerHTML = `
      <svg width="${size}" height="${Math.round(size * 1.4)}" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 22 12 22s12-13 12-22c0-6.627-5.373-12-12-12z" fill="#E53E3E"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 22 12 22s12-13 12-22c0-6.627-5.373-12-12-12z" fill="url(#${uniqueId})"/>
        <circle cx="12" cy="11" r="5" fill="#fff" opacity="0.9"/>
        <text x="12" y="14" text-anchor="middle" font-size="7" font-weight="bold" fill="#E53E3E">${pin.photos.length}</text>
        <defs>
          <linearGradient id="${uniqueId}" x1="12" y1="0" x2="12" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#FC8181"/>
            <stop offset="0.5" stop-color="#E53E3E"/>
            <stop offset="1" stop-color="#9B2C2C"/>
          </linearGradient>
        </defs>
      </svg>
    `

    container.addEventListener('mouseenter', () => {
      if (container.querySelector('.pin-tooltip')) return
      const tooltip = document.createElement('div')
      tooltip.className = 'pin-tooltip'
      tooltip.style.cssText = `
        position:absolute;bottom:100%;left:50%;transform:translateX(-50%);
        background:#1a1a3e;border:1px solid #2a2a4a;border-radius:8px;
        padding:6px 10px;font-size:11px;color:#e8e8ff;white-space:nowrap;
        pointer-events:none;margin-bottom:4px;z-index:10;
      `
      tooltip.innerHTML = `<strong>${pin.name}</strong><br/><span style="color:#6b7280;">${pin.photos.length} photo${pin.photos.length !== 1 ? 's' : ''}</span>`
      container.appendChild(tooltip)
    })
    container.addEventListener('mouseleave', () => {
      const tooltip = container.querySelector('.pin-tooltip')
      if (tooltip) tooltip.remove()
    })

    return container
  }

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
        htmlElementsData={pins}
        htmlLat={(d) => (d as GlobePin).lat}
        htmlLng={(d) => (d as GlobePin).lng}
        htmlAltitude={0.02}
        htmlElement={createPinElement}
        animateIn={true}
      />
    </div>
  )
}
