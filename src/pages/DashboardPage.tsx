import { useState } from 'react'
import { PageTransition } from '../components/layout/PageTransition'
import { LocationSelector } from '../components/dashboard/LocationSelector'
import { MoonCalendar } from '../components/dashboard/MoonCalendar'
import { MilkyWayPlanner } from '../components/dashboard/MilkyWayPlanner'
import { WeatherStation } from '../components/dashboard/WeatherStation'
import locationsData from '../data/locations.json'
import type { SavedLocation } from '../types'

const defaultLocations = locationsData as SavedLocation[]

function getAllLocations(): SavedLocation[] {
  const saved = JSON.parse(localStorage.getItem('ace-stellar-locations') || '[]') as SavedLocation[]
  return [...defaultLocations, ...saved]
}

export function DashboardPage() {
  const [locations, setLocations] = useState(() => getAllLocations())
  const [selectedLocationId, setSelectedLocationId] = useState(locations[0]?.id || '')
  const selectedLocation = locations.find((l) => l.id === selectedLocationId) || locations[0]
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newLat, setNewLat] = useState('')
  const [newLng, setNewLng] = useState('')
  const [newBortle, setNewBortle] = useState('5')

  function handleAddLocation() {
    const lat = parseFloat(newLat)
    const lng = parseFloat(newLng)
    const bortle = parseInt(newBortle, 10)
    if (!newName.trim() || isNaN(lat) || isNaN(lng)) return

    const newLoc: SavedLocation = {
      id: newName.trim().toLowerCase().replace(/\s+/g, '-'),
      name: newName.trim(),
      lat,
      lng,
      bortle: isNaN(bortle) ? 5 : Math.min(9, Math.max(1, bortle)),
    }

    const saved = JSON.parse(localStorage.getItem('ace-stellar-locations') || '[]') as SavedLocation[]
    saved.push(newLoc)
    localStorage.setItem('ace-stellar-locations', JSON.stringify(saved))

    setLocations([...locations, newLoc])
    setNewName('')
    setNewLat('')
    setNewLng('')
    setNewBortle('5')
    setShowAddForm(false)
  }

  return (
    <PageTransition>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-extralight tracking-widest">
            DASH<span className="font-bold">BOARD</span>
          </h1>
          <LocationSelector
            locations={locations}
            selectedId={selectedLocationId}
            onChange={setSelectedLocationId}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <MoonCalendar lat={selectedLocation.lat} lng={selectedLocation.lng} />
          <MilkyWayPlanner lat={selectedLocation.lat} lng={selectedLocation.lng} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-light tracking-widest">
              WEATHER <span className="font-bold">STATION</span>
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs text-accent hover:underline"
            >
              {showAddForm ? 'Cancel' : '+ Add Location'}
            </button>
          </div>

          {showAddForm && (
            <div className="bg-bg-surface/50 border border-border rounded-xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Location name"
                  className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
                />
                <input
                  value={newLat}
                  onChange={(e) => setNewLat(e.target.value)}
                  placeholder="Latitude"
                  type="number"
                  step="any"
                  className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
                />
                <input
                  value={newLng}
                  onChange={(e) => setNewLng(e.target.value)}
                  placeholder="Longitude"
                  type="number"
                  step="any"
                  className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
                />
                <input
                  value={newBortle}
                  onChange={(e) => setNewBortle(e.target.value)}
                  placeholder="Bortle (1-9)"
                  type="number"
                  min="1"
                  max="9"
                  className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
                />
                <button
                  onClick={handleAddLocation}
                  className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent/80 transition-colors"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-text-muted mt-2">
                Tip: Get coordinates from Google Maps — right-click any spot and copy the lat/lng.
              </p>
            </div>
          )}

          {locations.map((loc) => (
            <WeatherStation key={loc.id} location={loc} />
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
