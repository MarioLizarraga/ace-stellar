/**
 * Light pollution estimation by sampling NASA GIBS VIIRS satellite tiles.
 * These tiles are already displayed on the map with full CORS support.
 * We fetch the specific tile, draw to canvas, sample the pixel brightness,
 * and map to Bortle scale.
 */

export interface LightPollutionResult {
  bortle: number
  sqm: number
  brightness: number
  source: 'satellite' | 'fallback'
}

// Tile URL for City Lights 2012 — stable annual composite with good contrast
const SAMPLE_TILE_URL = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/2012-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg'

/**
 * Convert lat/lng to pixel coordinates within a specific tile at a given zoom level.
 */
function latLngToTilePixel(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom)
  const xTile = Math.floor(((lng + 180) / 360) * n)
  const latRad = (lat * Math.PI) / 180
  const yTile = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)

  // Fractional position within the tile (0-1)
  const xFrac = ((lng + 180) / 360) * n - xTile
  const yFrac = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n - yTile

  return {
    tileX: xTile,
    tileY: yTile,
    pixelX: Math.floor(xFrac * 256),
    pixelY: Math.floor(yFrac * 256),
  }
}

/**
 * Map pixel brightness (0-255) to Bortle class.
 * Calibrated against known reference sites:
 *   - Big Bend TX (Bortle 2): brightness ~0-3
 *   - Cherry Springs PA (Bortle 2): brightness ~2-5
 *   - Rural areas (Bortle 3-4): brightness ~5-15
 *   - Suburban fringe (Bortle 5): brightness ~15-35
 *   - Suburban (Bortle 6): brightness ~35-60
 *   - Suburban/urban (Bortle 7): brightness ~60-100
 *   - City (Bortle 8): brightness ~100-160
 *   - Inner city (Bortle 9): brightness ~160+
 */
function brightnessToBortle(brightness: number): number {
  if (brightness <= 3) return 1
  if (brightness <= 6) return 2
  if (brightness <= 15) return 3
  if (brightness <= 30) return 4
  if (brightness <= 50) return 5
  if (brightness <= 75) return 6
  if (brightness <= 110) return 7
  if (brightness <= 160) return 8
  return 9
}

// Approximate SQM values per Bortle class
const BORTLE_TO_SQM: Record<number, number> = {
  1: 22.0, 2: 21.9, 3: 21.7, 4: 20.5, 5: 19.5,
  6: 18.9, 7: 18.4, 8: 17.8, 9: 17.0,
}

/**
 * Fetch light pollution data by sampling the NASA GIBS VIIRS tile pixel.
 * Samples a 5x5 area around the point and averages for stability.
 */
export async function fetchLightPollution(lat: number, lng: number): Promise<LightPollutionResult> {
  try {
    const zoom = 8
    const { tileX, tileY, pixelX, pixelY } = latLngToTilePixel(lat, lng, zoom)

    const url = SAMPLE_TILE_URL
      .replace('{z}', zoom.toString())
      .replace('{x}', tileX.toString())
      .replace('{y}', tileY.toString())

    const img = new Image()
    img.crossOrigin = 'anonymous'

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout')), 10000)
      img.onload = () => { clearTimeout(timer); resolve() }
      img.onerror = () => { clearTimeout(timer); reject(new Error('Load failed')) }
      img.src = url
    })

    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('No canvas')

    ctx.drawImage(img, 0, 0)

    // Sample a 5x5 area and average for stability
    let totalBrightness = 0
    let samples = 0
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const px = Math.max(0, Math.min(255, pixelX + dx))
        const py = Math.max(0, Math.min(255, pixelY + dy))
        const pixel = ctx.getImageData(px, py, 1, 1).data
        // Perceived brightness
        totalBrightness += 0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2]
        samples++
      }
    }

    const avgBrightness = Math.round(totalBrightness / samples)
    const bortle = brightnessToBortle(avgBrightness)
    const sqm = BORTLE_TO_SQM[bortle] || 19.5

    return {
      bortle,
      sqm,
      brightness: avgBrightness,
      source: 'satellite',
    }
  } catch {
    return { bortle: 5, sqm: 19.5, brightness: 0, source: 'fallback' }
  }
}

// Bortle descriptions and colors
export const BORTLE_INFO: Record<number, { label: string; color: string; description: string }> = {
  1: { label: 'Excellent Dark', color: '#000000', description: 'Zodiacal light, gegenschein visible. M33 naked eye. Best possible sky.' },
  2: { label: 'Typical Dark', color: '#0a0a2e', description: 'Airglow visible. M33 easy naked eye. Zodiacal band visible.' },
  3: { label: 'Rural Sky', color: '#1a1a5e', description: 'Some light pollution on horizon. Milky Way structured and impressive.' },
  4: { label: 'Rural/Suburban', color: '#2d5a2d', description: 'Light pollution domes visible. Milky Way still impressive but losing detail.' },
  5: { label: 'Suburban', color: '#7a7a2d', description: 'Milky Way weak. Only bright Messier objects visible. LP filters help.' },
  6: { label: 'Bright Suburban', color: '#a06020', description: 'Milky Way barely visible near zenith. Naked eye limit ~5.0 mag.' },
  7: { label: 'Suburban/Urban', color: '#c04020', description: 'Milky Way invisible. Only bright clusters/nebulae. Narrowband needed.' },
  8: { label: 'City Sky', color: '#d03030', description: 'Only Moon, planets, and brightest stars visible. Narrowband-only for DSO.' },
  9: { label: 'Inner City', color: '#ff4040', description: 'Only Moon and planets visible. Astrophotography extremely limited.' },
}
