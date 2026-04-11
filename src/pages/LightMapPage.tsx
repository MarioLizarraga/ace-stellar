import { useState, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { PageTransition } from '../components/layout/PageTransition'
import { CitySearch } from '../components/dashboard/CitySearch'
import { BORTLE_INFO, fetchLightPollution } from '../lib/light-pollution'
import type { LightPollutionResult } from '../lib/light-pollution'
import {
  isGitHubConfigured,
  addLocationToRepo,
} from '../lib/github-api'
import type { SavedLocation } from '../types'
import locationsData from '../data/locations.json'
import 'leaflet/dist/leaflet.css'

const savedLocations = locationsData as SavedLocation[]

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
    maxNativeZoom: 8,
    attribution: 'NASA EOSDIS GIBS | VIIRS SNPP Day/Night Band',
  },
  {
    id: 'viirs_noaa20',
    label: 'VIIRS NOAA-20 Daily',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_NOAA20_DayNightBand_At_Sensor_Radiance/default/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png',
    maxNativeZoom: 8,
    attribution: 'NASA EOSDIS GIBS | VIIRS NOAA-20 Day/Night Band',
  },
  {
    id: 'black_marble',
    label: 'Black Marble (Annual)',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png',
    maxNativeZoom: 8,
    attribution: 'NASA EOSDIS GIBS | VIIRS Black Marble Nighttime Lights',
  },
  {
    id: 'city_lights',
    label: 'City Lights 2012',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/2012-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg',
    maxNativeZoom: 8,
    attribution: 'NASA EOSDIS GIBS | VIIRS City Lights 2012',
  },
] as const

interface ClickedPoint {
  lat: number
  lng: number
}

// Light pollution data is fetched from lightpollutionmap.info's WMS GetFeatureInfo

function MapClickHandler({ onClick }: { onClick: (coords: ClickedPoint) => void }) {
  useMapEvents({
    click(e) {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function FlyToHandler({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  const prevCenter = useRef(center)
  if (prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1]) {
    prevCenter.current = center
    map.flyTo(center, zoom, { duration: 1.5 })
  }
  return null
}

export function LightMapPage() {
  const [activeLayer, setActiveLayer] = useState('city_lights')
  const [opacity, setOpacity] = useState(0.7)
  const [clickedPoint, setClickedPoint] = useState<ClickedPoint | null>(null)
  const [lightInfo, setLightInfo] = useState<LightPollutionResult | null>(null)
  const [lightLoading, setLightLoading] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveBortle, setSaveBortle] = useState('5')
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [flyTo, setFlyTo] = useState<{ center: [number, number]; zoom: number }>({ center: [30, -98], zoom: 4 })

  const currentOverlay = OVERLAY_LAYERS.find((l) => l.id === activeLayer) || OVERLAY_LAYERS[0]

  const handleMapClick = useCallback(async (coords: ClickedPoint) => {
    setClickedPoint(coords)
    setSaveName('')
    setLightInfo(null)
    setLightLoading(true)

    const info = await fetchLightPollution(coords.lat, coords.lng)
    setLightInfo(info)
    setSaveBortle(info.bortle.toString())
    setLightLoading(false)
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
        setLightInfo(null)
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
    setFlyTo({ center: [city.latitude, city.longitude], zoom: 10 })
    const displayName = city.admin1
      ? `${city.name}, ${city.admin1}, ${city.country}`
      : `${city.name}, ${city.country}`
    setSaveName(displayName)
    setClickedPoint({ lat: city.latitude, lng: city.longitude })

    setLightInfo(null)
    setLightLoading(true)
    fetchLightPollution(city.latitude, city.longitude).then((info) => {
      setLightInfo(info)
      setSaveBortle(info.bortle.toString())
      setLightLoading(false)
    })
  }

  return (
    <PageTransition>
      <div className="relative z-10 h-[calc(100vh-4rem)] flex flex-col">
        {/* Top bar */}
        <div className="bg-bg-surface/50 border-b border-border px-4 py-3 flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-extralight tracking-widest shrink-0">
            LIGHT <span className="font-bold">MAP</span>
          </h1>

          <div className="w-64">
            <CitySearch onSelect={goToCity} />
          </div>

          <select
            value={activeLayer}
            onChange={(e) => setActiveLayer(e.target.value)}
            className="bg-bg-primary border border-border rounded-lg px-2 py-1.5 text-xs text-text-primary"
          >
            {OVERLAY_LAYERS.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted">Opacity</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-20 h-1 accent-accent"
            />
          </div>

          {statusMsg && (
            <span className={`text-xs ml-auto ${statusMsg.includes('Failed') ? 'text-astro-red' : 'text-accent'}`}>
              {statusMsg}
            </span>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={flyTo.center}
            zoom={flyTo.zoom}
            maxZoom={18}
            className="h-full w-full"
            style={{ background: '#0a0a1a' }}
          >
            <FlyToHandler center={flyTo.center} zoom={flyTo.zoom} />

            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap &copy; CARTO'
              maxZoom={18}
            />

            <TileLayer
              key={currentOverlay.id}
              url={currentOverlay.url}
              maxNativeZoom={currentOverlay.maxNativeZoom}
              maxZoom={18}
              opacity={opacity}
              attribution={currentOverlay.attribution}
            />

            <MapClickHandler onClick={handleMapClick} />

            {clickedPoint && (
              <Marker position={[clickedPoint.lat, clickedPoint.lng]} icon={defaultIcon}>
                <Popup minWidth={280} maxWidth={320}>
                  <div style={{ color: '#0a0a1a' }}>
                    {/* Coordinates */}
                    <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '13px' }}>
                      {clickedPoint.lat.toFixed(4)}, {clickedPoint.lng.toFixed(4)}
                    </p>

                    {/* Light pollution info */}
                    {lightLoading && (
                      <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Analyzing light pollution...</p>
                    )}
                    {lightInfo && (
                      <div style={{ background: '#f5f5f5', borderRadius: '6px', padding: '10px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #ddd',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px', fontWeight: 700, color: '#fff',
                            backgroundColor: BORTLE_INFO[lightInfo.bortle]?.color || '#333',
                          }}>
                            {lightInfo.bortle}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>Bortle {lightInfo.bortle}</p>
                            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{BORTLE_INFO[lightInfo.bortle]?.label}</p>
                          </div>
                          {lightInfo.source === 'wms' && (
                            <span style={{ fontSize: '9px', color: '#4a6fa5', marginLeft: 'auto', background: '#e8f0fe', padding: '1px 6px', borderRadius: '8px' }}>live</span>
                          )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11px', color: '#555', marginBottom: '4px' }}>
                          <span>SQM: <strong>{lightInfo.sqm}</strong> mag/arcsec²</span>
                          <span>Brightness: <strong>{lightInfo.artificialBrightness}</strong> mcd/m²</span>
                        </div>
                        <p style={{ fontSize: '10px', color: '#888', marginTop: '4px', marginBottom: 0, lineHeight: 1.4 }}>
                          {BORTLE_INFO[lightInfo.bortle]?.description}
                        </p>
                      </div>
                    )}

                    {/* Save form */}
                    <input
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="Location name"
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', marginBottom: '6px', boxSizing: 'border-box' }}
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
                        width: '100%', padding: '8px', background: '#4a6fa5', color: 'white',
                        border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 600,
                        cursor: saving ? 'wait' : 'pointer', opacity: !saveName.trim() ? 0.5 : 1,
                      }}
                    >
                      {saving ? 'Saving...' : 'Save to Plan'}
                    </button>
                  </div>
                </Popup>
              </Marker>
            )}

            {savedLocations.map((loc) => (
              <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={savedIcon}>
                <Popup>
                  <div style={{ color: '#0a0a1a' }}>
                    <p style={{ fontWeight: 600, marginBottom: '2px' }}>{loc.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', border: '1px solid #ddd',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: 700, color: '#fff',
                        backgroundColor: BORTLE_INFO[loc.bortle]?.color || '#333',
                      }}>
                        {loc.bortle}
                      </div>
                      <span style={{ fontSize: '11px', color: '#666' }}>
                        Bortle {loc.bortle} — {BORTLE_INFO[loc.bortle]?.label}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Legend */}
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
            <p className="text-[8px] text-text-muted mt-2 pt-1 border-t border-border">Click anywhere for light data</p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
