/**
 * Light pollution data from lightpollutionmap.info's WMS GetFeatureInfo endpoint.
 * Returns actual artificial sky brightness (mcd/m²) from the World Atlas 2015 dataset
 * and VIIRS satellite radiance, at full resolution for any lat/lng.
 */

// SQM (mag/arcsec²) to Bortle mapping
const SQM_TO_BORTLE: [number, number][] = [
  [21.99, 1],
  [21.89, 2],
  [21.69, 3],
  [20.49, 4],
  [19.50, 5],
  [18.94, 6],
  [18.38, 7],
  [17.80, 8],
  [0, 9],
]

function sqmToBortle(sqm: number): number {
  for (const [threshold, bortle] of SQM_TO_BORTLE) {
    if (sqm >= threshold) return bortle
  }
  return 9
}

// Convert artificial brightness (mcd/m²) to SQM
function artifBrightnessToSQM(artif_mcd: number): number {
  const total = artif_mcd + 0.171 // add natural sky background
  return -2.5 * Math.log10(total) + 16.57
}

// Convert artificial brightness to Bortle
function artifBrightnessToBortle(artif_mcd: number): number {
  const sqm = artifBrightnessToSQM(artif_mcd)
  return sqmToBortle(sqm)
}

export interface LightPollutionResult {
  bortle: number
  sqm: number
  artificialBrightness: number
  viirsRadiance: number | null
  source: 'world-atlas' | 'viirs' | 'fallback'
}

/**
 * Fetch accurate light pollution data for a coordinate using
 * lightpollutionmap.info's WMS GetFeatureInfo endpoint.
 * Returns Bortle class, SQM, and artificial brightness in mcd/m².
 */
export async function fetchLightPollution(lat: number, lng: number): Promise<LightPollutionResult> {
  const delta = 0.05 // small bbox around the point
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`
  const baseUrl = 'https://www.lightpollutionmap.info/geoserver/ows'

  try {
    // Fetch World Atlas 2015 (artificial sky brightness in mcd/m²)
    const waParams = new URLSearchParams({
      service: 'WMS',
      version: '1.1.1',
      request: 'GetFeatureInfo',
      layers: 'PostGIS:WA_2015',
      query_layers: 'PostGIS:WA_2015',
      info_format: 'application/json',
      x: '128',
      y: '128',
      width: '256',
      height: '256',
      srs: 'EPSG:4326',
      bbox,
    })

    const waResponse = await fetch(`${baseUrl}?${waParams}`, {
      signal: AbortSignal.timeout(8000),
    })

    if (waResponse.ok) {
      const waData = await waResponse.json()
      const grayIndex = waData?.features?.[0]?.properties?.GRAY_INDEX
      if (typeof grayIndex === 'number' && grayIndex >= 0) {
        const sqm = Math.round(artifBrightnessToSQM(grayIndex) * 100) / 100
        const bortle = artifBrightnessToBortle(grayIndex)

        // Also try to get VIIRS radiance for extra info
        let viirsRadiance: number | null = null
        try {
          const viirsParams = new URLSearchParams({
            service: 'WMS',
            version: '1.1.1',
            request: 'GetFeatureInfo',
            layers: 'PostGIS:VIIRS_2024',
            query_layers: 'PostGIS:VIIRS_2024',
            info_format: 'application/json',
            x: '128',
            y: '128',
            width: '256',
            height: '256',
            srs: 'EPSG:4326',
            bbox,
          })
          const viirsResponse = await fetch(`${baseUrl}?${viirsParams}`, {
            signal: AbortSignal.timeout(5000),
          })
          if (viirsResponse.ok) {
            const viirsData = await viirsResponse.json()
            const redBand = viirsData?.features?.[0]?.properties?.RED_BAND
            if (typeof redBand === 'number') {
              viirsRadiance = redBand
            }
          }
        } catch { /* VIIRS is optional */ }

        return {
          bortle,
          sqm,
          artificialBrightness: Math.round(grayIndex * 1000) / 1000,
          viirsRadiance,
          source: 'world-atlas',
        }
      }
    }
  } catch { /* fallback below */ }

  // Fallback
  return {
    bortle: 5,
    sqm: 19.5,
    artificialBrightness: 0,
    viirsRadiance: null,
    source: 'fallback',
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
