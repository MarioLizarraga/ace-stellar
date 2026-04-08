import type { SavedLocation } from '../../types'

interface LocationSelectorProps {
  locations: SavedLocation[]
  selectedId: string
  onChange: (id: string) => void
}

export function LocationSelector({ locations, selectedId, onChange }: LocationSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs tracking-widest uppercase text-text-muted">Location</label>
      <select
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary min-w-[200px]"
      >
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
        ))}
      </select>
    </div>
  )
}
