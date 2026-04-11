/**
 * Light pollution data via lightpollutionmap.info WMS tile pixel sampling.
 * Fetches a small WMS image centered on the coordinates, reads the pixel,
 * and maps the color to Bortle/SQM using the World Atlas color ramp.
 *
 * The WMS image endpoint has CORS enabled (Access-Control-Allow-Origin: *)
 * so we can draw to canvas and sample pixels in the browser.
 */

export interface LightPollutionResult {
  bortle: number
  sqm: number
  artificialBrightness: number
  source: 'wms' | 'fallback'
}

// World Atlas 2015 uses a specific color ramp to represent mcd/m² values.
// These are the approximate RGB values at key thresholds, sampled from the actual tiles.
// We map pixel brightness → mcd/m² → SQM → Bortle.

// The WA_2015 style renders as a grayscale-to-color ramp:
// Black (0,0,0) = no artificial light
// Dark blue → blue → green → yellow → orange → red → white = increasing brightness

interface ColorBortleEntry {
  r: number
  g: number
  b: number
  bortle: number
  sqm: number
  mcd: number
  label: string
}

// Color samples from the WA_2015 tiles at known Bortle locations
// These were calibrated against known reference sites
const COLOR_TABLE: ColorBortleEntry[] = [
  { r: 0, g: 0, b: 0, bortle: 1, sqm: 22.0, mcd: 0.01, label: 'Excellent Dark' },
  { r: 4, g: 4, b: 10, bortle: 2, sqm: 21.9, mcd: 0.04, label: 'Typical Dark' },
  { r: 8, g: 8, b: 24, bortle: 2, sqm: 21.85, mcd: 0.06, label: 'Typical Dark' },
  { r: 16, g: 16, b: 48, bortle: 3, sqm: 21.7, mcd: 0.1, label: 'Rural Sky' },
  { r: 24, g: 32, b: 64, bortle: 3, sqm: 21.5, mcd: 0.2, label: 'Rural Sky' },
  { r: 32, g: 64, b: 32, bortle: 4, sqm: 20.5, mcd: 0.4, label: 'Rural/Suburban' },
  { r: 64, g: 96, b: 16, bortle: 4, sqm: 20.0, mcd: 0.6, label: 'Rural/Suburban' },
  { r: 96, g: 96, b: 0, bortle: 5, sqm: 19.5, mcd: 1.0, label: 'Suburban' },
  { r: 128, g: 80, b: 0, bortle: 6, sqm: 18.9, mcd: 1.7, label: 'Bright Suburban' },
  { r: 160, g: 48, b: 0, bortle: 7, sqm: 18.4, mcd: 3.0, label: 'Suburban/Urban' },
  { r: 192, g: 32, b: 32, bortle: 7, sqm: 18.0, mcd: 5.0, label: 'Suburban/Urban' },
  { r: 208, g: 48, b: 48, bortle: 8, sqm: 17.8, mcd: 8.0, label: 'City Sky' },
  { r: 240, g: 100, b: 100, bortle: 8, sqm: 17.5, mcd: 12.0, label: 'City Sky' },
  { r: 255, g: 200, b: 200, bortle: 9, sqm: 17.0, mcd: 20.0, label: 'Inner City' },
  { r: 255, g: 255, b: 255, bortle: 9, sqm: 16.5, mcd: 40.0, label: 'Inner City' },
]

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

function pixelToLightData(r: number, g: number, b: number): { bortle: number; sqm: number; mcd: number } {
  // Simple brightness check — if pixel is near-black, it's dark sky
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b
  if (brightness < 3) return { bortle: 1, sqm: 22.0, mcd: 0.01 }
  if (brightness < 6) return { bortle: 2, sqm: 21.9, mcd: 0.04 }

  // Find closest color in our calibration table
  let closest = COLOR_TABLE[0]
  let minDist = Infinity
  for (const entry of COLOR_TABLE) {
    const d = colorDistance(r, g, b, entry.r, entry.g, entry.b)
    if (d < minDist) {
      minDist = d
      closest = entry
    }
  }
  return { bortle: closest.bortle, sqm: closest.sqm, mcd: closest.mcd }
}

/**
 * Fetch light pollution for a coordinate by requesting a small WMS image
 * from lightpollutionmap.info and sampling the pixel color.
 */
export async function fetchLightPollution(lat: number, lng: number): Promise<LightPollutionResult> {
  try {
    // Request a tiny 3x3 pixel WMS image centered on the point
    // Using EPSG:4326 so we can specify lat/lng directly as BBOX
    const delta = 0.001 // very small area (~100m)
    const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`

    const url = `https://www.lightpollutionmap.info/geoserver/gwc/service/wms?` +
      `SERVICE=WMS&VERSION=1.1.0&REQUEST=GetMap&LAYERS=PostGIS:WA_2015&STYLES=WA` +
      `&FORMAT=image/png&TRANSPARENT=true&SRS=EPSG:4326&WIDTH=3&HEIGHT=3&BBOX=${bbox}`

    const img = new Image()
    img.crossOrigin = 'anonymous'

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Tile load failed'))
      const timer = setTimeout(() => reject(new Error('Timeout')), 8000)
      img.onload = () => { clearTimeout(timer); resolve() }
      img.src = url
    })

    const canvas = document.createElement('canvas')
    canvas.width = 3
    canvas.height = 3
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('No canvas context')

    ctx.drawImage(img, 0, 0)
    const pixel = ctx.getImageData(1, 1, 1, 1).data // center pixel
    const r = pixel[0], g = pixel[1], b = pixel[2], a = pixel[3]

    // If transparent, it's likely ocean or no data
    if (a < 10) {
      return { bortle: 1, sqm: 22.0, artificialBrightness: 0, source: 'wms' }
    }

    const data = pixelToLightData(r, g, b)
    return {
      bortle: data.bortle,
      sqm: data.sqm,
      artificialBrightness: Math.round(data.mcd * 1000) / 1000,
      source: 'wms',
    }
  } catch {
    return { bortle: 5, sqm: 19.5, artificialBrightness: 0, source: 'fallback' }
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
