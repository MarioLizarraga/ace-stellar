import { useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { PageTransition } from '../components/layout/PageTransition'
import { CitySearch } from '../components/dashboard/CitySearch'
import { BORTLE_INFO } from '../lib/light-pollution'
import {
  isGitHubConfigured,
  addLocationToRepo,
} from '../lib/github-api'
import type { SavedLocation } from '../types'
import locationsData from '../data/locations.json'
import 'leaflet/dist/leaflet.css'

const savedLocations = locationsData as SavedLocation[]

// Fix Leaflet default marker icon
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const savedIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  className: 'opacity-70',
})

const OVERLAY_LAYERS = [
  {
    id: 'viirs_daily',
    label: 'VIIRS Daily (Latest)',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_DayNightBand_At_Sensor_Radiance/default/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png',
    maxZoom: 8,
    attribution: 'NASA EOSDIS GIBS | VIIRS SNPP Day/Night Band',
  },
  {
    id: 'viirs_noaa20',
    label: 'VIIRS NOAA-20 Daily',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_NOAA20_DayNightBand_At_Sensor_Radiance/default/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png',
    maxZoom: 8,
    attribution: 'NASA EOSDIS GIBS | VIIRS NOAA-20 Day/Night Band',
  },
  {
    id: 'black_marble',
    label: 'Black Marble (Annual)',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png',
    maxZoom: 8,
    attribution: 'NASA EOSDIS GIBS | VIIRS Black Marble Nighttime Lights',
  },
  {
    id: 'city_lights',
    label: 'City Lights 2012',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/2012-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg',
    maxZoom: 8,
    attribution: 'NASA EOSDIS GIBS | VIIRS City Lights 2012',
  },
] as const

interface ClickedPoint {
  lat: number
  lng: number
}

function MapClickHandler({ onClick }: { onClick: (coords: ClickedPoint) => void }) {
  useMapEvents({
    click(e) {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function estimateBortleFromLatLng(lat: number, _lng: number): number {
  // Very rough fallback based on typical patterns
  // This is only used as display text — the map overlay IS the real data
  const absLat = Math.abs(lat)
  if (absLat > 60) return 2
  if (absLat > 45) return 3
  return 5
}

export function LightMapPage() {
  const [activeLayer, setActiveLayer] = useState('viirs_2024')
  const [opacity, setOpacity] = useState(0.6)
  const [clickedPoint, setClickedPoint] = useState<ClickedPoint | null>(null)
  const [saveName, setSaveName] = useState('')
  const [saveBortle, setSaveBortle] = useState('5')
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([30, -98])
  const [mapZoom, setMapZoom] = useState(4)
  const [mapKey, setMapKey] = useState(0)

  const currentOverlay = OVERLAY_LAYERS.find((l) => l.id === activeLayer) || OVERLAY_LAYERS[0]

  const handleMapClick = useCallback((coords: ClickedPoint) => {
    setClickedPoint(coords)
    const bortle = estimateBortleFromLatLng(coords.lat, coords.lng)
    setSaveBortle(bortle.toString())
    setSaveName('')
  }, [])

  async function handleSaveLocation() {
    if (!clickedPoint || !saveName.trim()) return

    const newLoc: SavedLocation = {
      id: saveName.trim().toLowerCase().replace(/\s+/g, '-'),
      name: saveName.trim(),
      lat: Math.round(clickedPoint.lat * 10000) / 10000,
      lng: Math.round(clickedPoint.lng * 10000) / 10000,
      bortle: parseInt(saveBortle, 10) || 5,
    }

    setSaving(true)
    setStatusMsg('Saving...')

    if (isGitHubConfigured()) {
      try {
        await addLocationToRepo(newLoc)
        setStatusMsg(`"${newLoc.name}" saved to Plan! Site will redeploy in ~30s.`)
        setClickedPoint(null)
        setTimeout(() => setStatusMsg(null), 4000)
      } catch (err) {
        setStatusMsg(`Failed: ${err instanceof Error ? err.message : 'unknown'}`)
        setTimeout(() => setStatusMsg(null), 5000)
      }
    } else {
      setStatusMsg('GitHub not connected — location not saved permanently')
      setTimeout(() => setStatusMsg(null), 4000)
    }
    setSaving(false)
  }

  function goToCity(city: { name: string; country: string; admin1?: string; latitude: number; longitude: number }) {
    setMapCenter([city.latitude, city.longitude])
    setMapZoom(10)
    setMapKey((k) => k + 1)
    const displayName = city.admin1
      ? `${city.name}, ${city.admin1}, ${city.country}`
      : `${city.name}, ${city.country}`
    setSaveName(displayName)
    setClickedPoint({ lat: city.latitude, lng: city.longitude })
  }

  return (
    <PageTransition>
      <div className="relative z-10 h-[calc(100vh-4rem)] flex flex-col">
        {/* Top bar */}
        <div className="bg-bg-surface/50 border-b border-border px-4 py-3 flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-extralight tracking-widest shrink-0">
            LIGHT <span className="font-bold">MAP</span>
          </h1>

          {/* City search */}
          <div className="w-64">
            <CitySearch onSelect={goToCity} />
          </div>

          {/* Layer selector */}
          <select
            value={activeLayer}
            onChange={(e) => setActiveLayer(e.target.value)}
            className="bg-bg-primary border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary"
          >
            {OVERLAY_LAYERS.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>

          {/* Opacity slider */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted">Opacity</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-20 h-1 accent-accent"
            />
          </div>

          {/* Status */}
          {statusMsg && (
            <span className={`text-xs ml-auto ${statusMsg.includes('Failed') ? 'text-astro-red' : 'text-accent'}`}>
              {statusMsg}
            </span>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            key={mapKey}
            center={mapCenter}
            zoom={mapZoom}
            className="h-full w-full"
            style={{ background: '#0a0a1a' }}
          >
            {/* Dark basemap */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            />

            {/* Light pollution overlay — NASA GIBS VIIRS satellite data */}
            <TileLayer
              key={currentOverlay.id}
              url={currentOverlay.url}
              maxZoom={currentOverlay.maxZoom}
              opacity={opacity}
              attribution={currentOverlay.attribution}
            />

            <MapClickHandler onClick={handleMapClick} />

            {/* Clicked point marker */}
            {clickedPoint && (
              <Marker position={[clickedPoint.lat, clickedPoint.lng]} icon={defaultIcon}>
                <Popup>
                  <div style={{ minWidth: '220px', color: '#0a0a1a' }}>
                    <p style={{ fontWeight: 600, marginBottom: '4px' }}>
                      {clickedPoint.lat.toFixed(4)}, {clickedPoint.lng.toFixed(4)}
                    </p>
                    <input
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="Location name"
                      style={{ width: '100%', padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', marginBottom: '4px' }}
                    />
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      <select
                        value={saveBortle}
                        onChange={(e) => setSaveBortle(e.target.value)}
                        style={{ flex: 1, padding: '4px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}
                      >
                        {[1,2,3,4,5,6,7,8,9].map((b) => (
                          <option key={b} value={b}>Bortle {b} — {BORTLE_INFO[b]?.label}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleSaveLocation}
                      disabled={saving || !saveName.trim()}
                      style={{
                        width: '100%', padding: '6px', background: '#4a6fa5', color: 'white',
                        border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                        cursor: saving ? 'wait' : 'pointer', opacity: !saveName.trim() ? 0.5 : 1,
                      }}
                    >
                      {saving ? 'Saving...' : 'Save to Plan'}
                    </button>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Existing saved locations */}
            {savedLocations.map((loc) => (
              <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={savedIcon}>
                <Popup>
                  <div style={{ color: '#0a0a1a' }}>
                    <p style={{ fontWeight: 600 }}>{loc.name}</p>
                    <p style={{ fontSize: '11px', color: '#666' }}>
                      Bortle {loc.bortle} — {BORTLE_INFO[loc.bortle]?.label}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Bortle legend */}
          <div className="absolute bottom-4 right-4 z-[1000] bg-bg-primary/90 border border-border rounded-lg p-3">
            <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2">Bortle Scale</p>
            <div className="space-y-1">
              {[1,2,3,4,5,6,7,8,9].map((b) => (
                <div key={b} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm border border-border/50" style={{ backgroundColor: BORTLE_INFO[b].color }} />
                  <span className="text-[9px] text-text-muted">{b}: {BORTLE_INFO[b].label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
