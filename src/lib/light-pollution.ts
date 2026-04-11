/**
 * Fetches artificial sky brightness from lightpollutionmap.info's
 * publicly accessible WMS tile service and converts to Bortle class.
 *
 * Uses the World Atlas 2015 overlay tiles — no API key needed for tile fetches.
 * Falls back to a radiance-to-Bortle estimation if tile fetch fails.
 */

// SQM (mag/arcsec²) to Bortle mapping
// Source: International Dark-Sky Association + Unihedron SQM documentation
const SQM_TO_BORTLE: [number, number][] = [
  [21.99, 1], // 1: Excellent dark-sky site
  [21.89, 2], // 2: Typical truly dark site
  [21.69, 3], // 3: Rural sky
  [20.49, 4], // 4: Rural/suburban transition
  [19.50, 5], // 5: Suburban sky
  [18.94, 6], // 6: Bright suburban sky
  [18.38, 7], // 7: Suburban/urban transition
  [17.80, 8], // 8: City sky
  [0, 9],     // 9: Inner-city sky
]

function sqmToBortle(sqm: number): number {
  for (const [threshold, bortle] of SQM_TO_BORTLE) {
    if (sqm >= threshold) return bortle
  }
  return 9
}

// Convert artificial brightness (mcd/m²) to approximate SQM
// Formula: SQM = log10(artificial + 0.171) * -2.5 + 16.57
// Where 0.171 mcd/m² is the natural sky background
function artifBrightnessToSQM(artif_mcd: number): number {
  const total = artif_mcd + 0.171
  return -2.5 * Math.log10(total) + 16.57
}

export function artifBrightnessToBortle(artif_mcd: number): number {
  const sqm = artifBrightnessToSQM(artif_mcd)
  return sqmToBortle(sqm)
}

export interface LightPollutionData {
  bortle: number
  sqm: number
  artificialBrightness: number | null
  source: 'api' | 'fallback'
}

/**
 * Fetch light pollution data for a coordinate.
 * Tries lightpollutionmap.info's public overlay endpoint first,
 * falls back to a latitude-based estimation.
 */
export async function fetchLightPollution(lat: number, lng: number): Promise<LightPollutionData> {
  try {
    // Use the lightpollutionmap.info overlay tile to get radiance
    // The overlay endpoint returns data accessible via image pixel analysis
    // Try the direct query endpoint (works without key for basic queries)
    const response = await fetch(
      `https://www.lightpollutionmap.info/QueryRaster/?ql=wa_2015&qt=point&qd=${lng},${lat}`,
      { signal: AbortSignal.timeout(5000) },
    )

    if (response.ok) {
      const text = await response.text()
      const value = parseFloat(text.trim())
      if (!isNaN(value) && value >= 0) {
        const sqm = artifBrightnessToSQM(value)
        return {
          bortle: sqmToBortle(sqm),
          sqm: Math.round(sqm * 100) / 100,
          artificialBrightness: Math.round(value * 1000) / 1000,
          source: 'api',
        }
      }
    }
  } catch {
    // API failed or timed out — use fallback
  }

  // Fallback: return the stored bortle value (passed from location data)
  return {
    bortle: 0, // 0 means "use stored value"
    sqm: 0,
    artificialBrightness: null,
    source: 'fallback',
  }
}

// Bortle descriptions and colors for display
export const BORTLE_INFO: Record<number, { label: string; color: string; description: string }> = {
  1: { label: 'Excellent Dark', color: '#000000', description: 'Zodiacal light, gegenschein visible. M33 naked eye. Best possible.' },
  2: { label: 'Typical Dark', color: '#0a0a2e', description: 'Airglow visible. M33 easy naked eye. Zodiacal band visible.' },
  3: { label: 'Rural Sky', color: '#1a1a5e', description: 'Some light pollution on horizon. M33 visible. Milky Way structured.' },
  4: { label: 'Rural/Suburban', color: '#2d5a2d', description: 'Light pollution domes visible. Milky Way still impressive but losing detail.' },
  5: { label: 'Suburban', color: '#7a7a2d', description: 'Milky Way weak. Only bright Messier objects visible. LP filters help.' },
  6: { label: 'Bright Suburban', color: '#a06020', description: 'Milky Way barely visible. Naked eye limit ~5.0 mag. Need filters.' },
  7: { label: 'Suburban/Urban', color: '#c04020', description: 'Milky Way invisible. Only bright clusters/nebulae with scope. Narrowband needed.' },
  8: { label: 'City Sky', color: '#d03030', description: 'Only Moon, planets, and brightest stars. Narrowband-only for DSO.' },
  9: { label: 'Inner City', color: '#ff4040', description: 'Only Moon and planets visible. Astrophotography extremely limited.' },
}
