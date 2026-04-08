import { useRef, useEffect, useMemo, useState } from 'react'
import Globe from 'react-globe.gl'
import type { GlobeMethods } from 'react-globe.gl'
import * as THREE from 'three'
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

function createPinMesh(pin: GlobePin): THREE.Object3D {
  const group = new THREE.Group()

  const scale = 0.8 + Math.min(0.8, pin.photos.length * 0.15)

  // Cone body (upside down — point touches globe)
  const coneHeight = 5 * scale
  const coneRadius = 1.5 * scale
  const coneGeo = new THREE.ConeGeometry(coneRadius, coneHeight, 16)
  const coneMat = new THREE.MeshPhongMaterial({
    color: 0xE53E3E,
    shininess: 80,
    emissive: 0x991111,
    emissiveIntensity: 0.3,
  })
  const cone = new THREE.Mesh(coneGeo, coneMat)
  // Rotate so point faces down, then shift up so tip is at origin
  cone.rotation.x = Math.PI
  cone.position.y = coneHeight / 2
  group.add(cone)

  // Sphere head on top
  const sphereRadius = 1.8 * scale
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, 16, 16)
  const sphereMat = new THREE.MeshPhongMaterial({
    color: 0xCC3333,
    shininess: 100,
    emissive: 0x881111,
    emissiveIntensity: 0.3,
  })
  const sphere = new THREE.Mesh(sphereGeo, sphereMat)
  sphere.position.y = coneHeight + sphereRadius * 0.6
  group.add(sphere)

  // White dot inside sphere (like Google Maps)
  const dotGeo = new THREE.SphereGeometry(sphereRadius * 0.45, 12, 12)
  const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const dot = new THREE.Mesh(dotGeo, dotMat)
  dot.position.y = coneHeight + sphereRadius * 0.6
  dot.position.z = sphereRadius * 0.55
  group.add(dot)

  // Scale the whole thing down to globe proportions
  group.scale.setScalar(0.6)

  return group
}

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

  // Add lighting to the scene for the Phong material
  useEffect(() => {
    if (!globeRef.current) return
    const scene = globeRef.current.scene()
    // Check if we already added our light
    if (scene.getObjectByName('pin-light')) return

    const light = new THREE.DirectionalLight(0xffffff, 1.5)
    light.name = 'pin-light'
    light.position.set(50, 50, 50)
    scene.add(light)

    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    ambient.name = 'pin-ambient'
    scene.add(ambient)
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
        customLayerData={pins}
        customThreeObject={(d) => createPinMesh(d as GlobePin)}
        customThreeObjectUpdate={(obj, d) => {
          const pin = d as GlobePin
          Object.assign(obj.position, globeRef.current?.getCoords(pin.lat, pin.lng, 0))
        }}
        onCustomLayerClick={(obj) => onPinClick(obj as GlobePin)}
        onCustomLayerHover={(obj) => {
          if (containerRef.current) {
            containerRef.current.style.cursor = obj ? 'pointer' : 'default'
          }
        }}
        // Keep pointLabel for hover tooltip
        pointsData={pins}
        pointLat={(d) => (d as GlobePin).lat}
        pointLng={(d) => (d as GlobePin).lng}
        pointAltitude={0}
        pointRadius={0.001}
        pointColor={() => 'rgba(0,0,0,0)'}
        pointLabel={(d) => {
          const pin = d as GlobePin
          return `<div style="background:#1a1a3e;border:1px solid #2a2a4a;border-radius:8px;padding:8px 12px;font-size:12px;color:#e8e8ff;">
            <strong>${pin.name}</strong><br/>
            <span style="color:#6b7280;">${pin.photos.length} photo${pin.photos.length !== 1 ? 's' : ''}</span>
          </div>`
        }}
        animateIn={true}
      />
    </div>
  )
}
