import { useState, useRef, useEffect } from 'react'

interface CityResult {
  name: string
  country: string
  admin1?: string
  latitude: number
  longitude: number
}

interface CitySearchProps {
  onSelect: (city: CityResult) => void
}

export function CitySearch({ onSelect }: CitySearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CityResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSearch(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.trim().length < 2) {
      setResults([])
      setShowDropdown(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          name: value.trim(),
          count: '8',
          language: 'en',
          format: 'json',
        })
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`)
        const data = await response.json()
        if (data.results) {
          setResults(data.results.map((r: Record<string, unknown>) => ({
            name: r.name as string,
            country: r.country as string,
            admin1: r.admin1 as string | undefined,
            latitude: r.latitude as number,
            longitude: r.longitude as number,
          })))
          setShowDropdown(true)
        } else {
          setResults([])
          setShowDropdown(true)
        }
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  function handleSelect(city: CityResult) {
    onSelect(city)
    setQuery(city.admin1 ? `${city.name}, ${city.admin1}, ${city.country}` : `${city.name}, ${city.country}`)
    setShowDropdown(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => results.length > 0 && setShowDropdown(true)}
        placeholder="Search city or place..."
        className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">...</div>
      )}

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-bg-surface border border-border rounded-lg shadow-xl z-30 max-h-60 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-3 py-2 text-xs text-text-muted">No results found</div>
          ) : (
            results.map((city, i) => (
              <button
                key={`${city.latitude}-${city.longitude}-${i}`}
                onClick={() => handleSelect(city)}
                className="w-full text-left px-3 py-2 hover:bg-bg-primary/50 transition-colors border-b border-border last:border-b-0"
              >
                <span className="text-sm text-text-primary">{city.name}</span>
                <span className="text-xs text-text-muted ml-2">
                  {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                </span>
                <span className="text-[10px] text-text-muted ml-2 tabular-nums">
                  ({city.latitude.toFixed(2)}, {city.longitude.toFixed(2)})
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
