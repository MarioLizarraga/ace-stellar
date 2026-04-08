interface FilterBarProps {
  categories: string[]
  activeCategory: string | null
  locations: string[]
  activeLocation: string | null
  sortBy: 'newest' | 'oldest' | 'featured'
  onCategoryChange: (category: string | null) => void
  onLocationChange: (location: string | null) => void
  onSortChange: (sort: 'newest' | 'oldest' | 'featured') => void
}

const categoryLabels: Record<string, string> = {
  'moon': 'Moon',
  'milky-way': 'Milky Way',
  'deep-sky': 'Deep Sky',
  'landscape': 'Landscape',
  'planetary': 'Planetary',
}

export function FilterBar({
  categories,
  activeCategory,
  locations,
  activeLocation,
  sortBy,
  onCategoryChange,
  onLocationChange,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-8">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-3 py-1.5 rounded-full text-xs tracking-wider uppercase transition-colors ${
            activeCategory === null
              ? 'bg-accent text-white'
              : 'bg-bg-surface text-text-muted hover:text-text-primary border border-border'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(activeCategory === cat ? null : cat)}
            className={`px-3 py-1.5 rounded-full text-xs tracking-wider uppercase transition-colors ${
              activeCategory === cat
                ? 'bg-accent text-white'
                : 'bg-bg-surface text-text-muted hover:text-text-primary border border-border'
            }`}
          >
            {categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

      <select
        value={activeLocation || ''}
        onChange={(e) => onLocationChange(e.target.value || null)}
        className="bg-bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary"
      >
        <option value="">All Locations</option>
        {locations.map((loc) => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>

      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as 'newest' | 'oldest' | 'featured')}
        className="bg-bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary ml-auto"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="featured">Featured</option>
      </select>
    </div>
  )
}
