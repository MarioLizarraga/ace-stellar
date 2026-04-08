import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CoordPickerProps {
  clickedCoords: { lat: number; lng: number } | null
  onSave: (name: string, lat: number, lng: number) => void
  onDismiss: () => void
}

export function CoordPicker({ clickedCoords, onSave, onDismiss }: CoordPickerProps) {
  const [name, setName] = useState('')
  const [manualLat, setManualLat] = useState('')
  const [manualLng, setManualLng] = useState('')
  const [showManual, setShowManual] = useState(false)

  function handleSaveClicked() {
    if (!clickedCoords || !name.trim()) return
    onSave(name.trim(), clickedCoords.lat, clickedCoords.lng)
    setName('')
  }

  function handleSaveManual() {
    const lat = parseFloat(manualLat)
    const lng = parseFloat(manualLng)
    if (isNaN(lat) || isNaN(lng) || !name.trim()) return
    onSave(name.trim(), lat, lng)
    setName('')
    setManualLat('')
    setManualLng('')
    setShowManual(false)
  }

  return (
    <div className="absolute bottom-4 left-4 z-20 space-y-2">
      <button
        onClick={() => setShowManual(!showManual)}
        className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-muted hover:text-text-primary transition-colors"
      >
        {showManual ? 'Cancel' : '+ Add coordinates manually'}
      </button>

      <AnimatePresence>
        {showManual && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-bg-surface border border-border rounded-lg p-4 space-y-2"
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Location name"
              className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary"
            />
            <div className="flex gap-2">
              <input
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                placeholder="Latitude"
                type="number"
                step="any"
                className="flex-1 bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary"
              />
              <input
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                placeholder="Longitude"
                type="number"
                step="any"
                className="flex-1 bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary"
              />
            </div>
            <button
              onClick={handleSaveManual}
              className="w-full bg-accent text-white rounded py-1 text-xs font-medium hover:bg-accent/80 transition-colors"
            >
              Save Location
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {clickedCoords && !showManual && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-bg-surface border border-border rounded-lg p-3 space-y-2"
          >
            <p className="text-xs text-text-muted">
              Lat: <span className="text-text-primary tabular-nums">{clickedCoords.lat.toFixed(4)}</span>{' '}
              Lng: <span className="text-text-primary tabular-nums">{clickedCoords.lng.toFixed(4)}</span>
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name this location"
              className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-sm text-text-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveClicked}
                className="flex-1 bg-accent text-white rounded py-1 text-xs font-medium hover:bg-accent/80 transition-colors"
              >
                Save
              </button>
              <button
                onClick={onDismiss}
                className="flex-1 bg-bg-primary text-text-muted rounded py-1 text-xs hover:text-text-primary transition-colors"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
