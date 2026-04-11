import { useState, useRef } from 'react'
import { PageTransition } from '../components/layout/PageTransition'
import { AstroCalendar } from '../components/dashboard/AstroCalendar'
import { WeatherStation } from '../components/dashboard/WeatherStation'
import { CitySearch } from '../components/dashboard/CitySearch'
import {
  isGitHubConfigured,
  hasBakedToken,
  setGitHubToken,
  clearGitHubToken,
  addLocationToRepo,
  removeLocationFromRepo,
  saveLocationsToRepo,
  verifyToken,
} from '../lib/github-api'
import locationsData from '../data/locations.json'
import type { SavedLocation } from '../types'

const allLocations = locationsData as SavedLocation[]

export function DashboardPage() {
  const [locations, setLocations] = useState(allLocations)
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newLat, setNewLat] = useState('')
  const [newLng, setNewLng] = useState('')
  const [newBortle, setNewBortle] = useState('5')
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  const baked = hasBakedToken()
  const [ghConfigured, setGhConfigured] = useState(isGitHubConfigured)
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [tokenInput, setTokenInput] = useState('')
  const [verifying, setVerifying] = useState(false)

  async function handleSaveToken() {
    if (!tokenInput.trim()) return
    setVerifying(true)
    setGitHubToken(tokenInput.trim())
    const valid = await verifyToken()
    setVerifying(false)
    if (valid) {
      setGhConfigured(true)
      setShowTokenInput(false)
      setTokenInput('')
      setStatusMsg('GitHub connected!')
      setTimeout(() => setStatusMsg(null), 3000)
    } else {
      clearGitHubToken()
      setStatusMsg('Invalid token — check permissions and try again')
      setTimeout(() => setStatusMsg(null), 5000)
    }
  }

  async function handleAddLocation() {
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

    setLocations([...locations, newLoc])
    setNewName('')
    setNewLat('')
    setNewLng('')
    setNewBortle('5')
    setShowAddForm(false)

    if (ghConfigured) {
      setSaving(true)
      setStatusMsg('Saving to GitHub...')
      try {
        await addLocationToRepo(newLoc)
        setStatusMsg('Saved! Site will redeploy in ~30s.')
        setTimeout(() => setStatusMsg(null), 4000)
      } catch (err) {
        setStatusMsg(`Save failed: ${err instanceof Error ? err.message : 'unknown error'}`)
        setTimeout(() => setStatusMsg(null), 5000)
      } finally {
        setSaving(false)
      }
    }
  }

  async function handleRemoveLocation(id: string) {
    const loc = locations.find((l) => l.id === id)
    setLocations(locations.filter((l) => l.id !== id))
    if (selectedLocationId === id) {
      const remaining = locations.filter((l) => l.id !== id)
      setSelectedLocationId(remaining[0]?.id || '')
    }

    if (ghConfigured) {
      setSaving(true)
      setStatusMsg('Removing from GitHub...')
      try {
        await removeLocationFromRepo(id)
        setStatusMsg(`Removed "${loc?.name}". Site will redeploy in ~30s.`)
        setTimeout(() => setStatusMsg(null), 4000)
      } catch (err) {
        if (loc) setLocations((prev) => [...prev, loc])
        setStatusMsg(`Remove failed: ${err instanceof Error ? err.message : 'unknown error'}`)
        setTimeout(() => setStatusMsg(null), 5000)
      } finally {
        setSaving(false)
      }
    }
  }

  return (
    <PageTransition>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-extralight tracking-widest">
            PL<span className="font-bold">AN</span>
          </h1>
          <div className="flex items-center gap-4">
            {/* Only show GitHub connect UI when there's no baked-in token */}
            {!baked && (
              ghConfigured ? (
                <button
                  onClick={() => { clearGitHubToken(); setGhConfigured(false) }}
                  className="text-[10px] text-astro-green border border-astro-green/30 rounded-full px-2 py-0.5 hover:bg-astro-green/10 transition-colors"
                  title="Click to disconnect GitHub"
                >
                  GH connected
                </button>
              ) : (
                <button
                  onClick={() => setShowTokenInput(!showTokenInput)}
                  className="text-[10px] text-text-muted border border-border rounded-full px-2 py-0.5 hover:text-text-primary transition-colors"
                  title="Connect GitHub to persist changes"
                >
                  Connect GitHub
                </button>
              )
            )}
          </div>
        </div>

        {/* Status message */}
        {statusMsg && (
          <div className={`mb-4 text-xs px-3 py-2 rounded-lg border ${
            statusMsg.includes('failed') || statusMsg.includes('Invalid')
              ? 'bg-astro-red/10 border-astro-red/30 text-astro-red'
              : 'bg-accent/10 border-accent/30 text-accent'
          }`}>
            {saving && '⏳ '}{statusMsg}
          </div>
        )}

        {/* Token input — only for local dev when no baked token */}
        {showTokenInput && !ghConfigured && !baked && (
          <div className="mb-6 bg-bg-surface/50 border border-border rounded-xl p-4 space-y-3">
            <p className="text-sm text-text-primary">Connect your GitHub to save locations permanently.</p>
            <p className="text-xs text-text-muted">
              Create a <a href="https://github.com/settings/tokens/new?scopes=repo&description=Ace+Stellar" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Personal Access Token</a> with <code className="text-text-primary">repo</code> scope.
            </p>
            <div className="flex gap-2">
              <input
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                type="password"
                className="flex-1 bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono"
              />
              <button
                onClick={handleSaveToken}
                disabled={verifying}
                className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent/80 transition-colors disabled:opacity-50"
              >
                {verifying ? 'Verifying...' : 'Connect'}
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <AstroCalendar lat={locations[0]?.lat ?? 29.25} lng={locations[0]?.lng ?? -103.25} />
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
            <div className="bg-bg-surface/50 border border-border rounded-xl p-4 space-y-3">
              <div>
                <label className="text-xs tracking-widest uppercase text-text-muted mb-1 block">Search by City</label>
                <CitySearch
                  onSelect={(city) => {
                    const displayName = city.admin1
                      ? `${city.name}, ${city.admin1}, ${city.country}`
                      : `${city.name}, ${city.country}`
                    setNewName(displayName)
                    setNewLat(city.latitude.toString())
                    setNewLng(city.longitude.toString())
                  }}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs text-text-muted">or enter manually</span>
                <div className="flex-1 border-t border-border" />
              </div>

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
                  disabled={saving}
                  className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent/80 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Add'}
                </button>
              </div>

              {!ghConfigured && (
                <p className="text-xs text-astro-yellow">
                  GitHub not connected — location will only appear until the page is redeployed.
                </p>
              )}
            </div>
          )}

          {locations.map((loc, index) => (
            <div
              key={loc.id}
              draggable
              onDragStart={() => { dragItem.current = index }}
              onDragEnter={() => { dragOverItem.current = index }}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={async () => {
                if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) return
                const reordered = [...locations]
                const [dragged] = reordered.splice(dragItem.current, 1)
                reordered.splice(dragOverItem.current, 0, dragged)
                dragItem.current = null
                dragOverItem.current = null
                setLocations(reordered)
                if (ghConfigured) {
                  try { await saveLocationsToRepo(reordered) } catch { /* silent */ }
                }
              }}
              className="cursor-grab active:cursor-grabbing"
            >
              <WeatherStation
                location={loc}
                onRemove={() => handleRemoveLocation(loc.id)}
                dragHandle={
                  <div className="flex flex-col gap-0.5 py-2 px-1 text-text-muted shrink-0 cursor-grab" title="Drag to reorder">
                    <div className="w-4 h-0.5 bg-text-muted/40 rounded" />
                    <div className="w-4 h-0.5 bg-text-muted/40 rounded" />
                    <div className="w-4 h-0.5 bg-text-muted/40 rounded" />
                  </div>
                }
              />
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
