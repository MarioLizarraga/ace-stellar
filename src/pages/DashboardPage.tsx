import { useState } from 'react'
import { PageTransition } from '../components/layout/PageTransition'
import { LocationSelector } from '../components/dashboard/LocationSelector'
import { MoonCalendar } from '../components/dashboard/MoonCalendar'
import { MilkyWayPlanner } from '../components/dashboard/MilkyWayPlanner'
import { WeatherStation } from '../components/dashboard/WeatherStation'
import locationsData from '../data/locations.json'
import type { SavedLocation } from '../types'

const locations = locationsData as SavedLocation[]

export function DashboardPage() {
  const [selectedLocationId, setSelectedLocationId] = useState(locations[0]?.id || '')
  const selectedLocation = locations.find((l) => l.id === selectedLocationId) || locations[0]

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
          <h2 className="text-lg font-light tracking-widest">
            WEATHER <span className="font-bold">STATION</span>
          </h2>
          {locations.map((loc) => (
            <WeatherStation key={loc.id} location={loc} />
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
