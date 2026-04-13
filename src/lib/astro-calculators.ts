import type { SensorSpec } from './sensors'
import { getPixelPitch } from './sensors'

// ---------- 500 & NPF Rules (max shutter before star trails) ----------

export function rule500(focalLengthMm: number, cropFactor: number): number {
  return 500 / (focalLengthMm * cropFactor)
}

/**
 * NPF Rule — more accurate than the 500 rule.
 * Formula: (35 × aperture + 30 × pixel_pitch) / (focal_length × cos(declination))
 * Simplified (declination 0 = equator, worst case): (35 × aperture + 30 × pitch) / focal_length
 */
export function ruleNPF(
  focalLengthMm: number,
  aperture: number,
  pixelPitchUm: number,
  declination: number = 0,
): number {
  const cosDecl = Math.cos((declination * Math.PI) / 180)
  return (35 * aperture + 30 * pixelPitchUm) / (focalLengthMm * cosDecl)
}

export interface StarTrailsResult {
  fiveHundredRule: number
  npfRule: number
  recommendation: string
}

export function calculateStarTrails(
  focalLengthMm: number,
  aperture: number,
  sensor: SensorSpec,
  declination: number = 0,
): StarTrailsResult {
  const pitch = getPixelPitch(sensor)
  const rule500Time = rule500(focalLengthMm, sensor.cropFactor)
  const npfTime = ruleNPF(focalLengthMm, aperture, pitch, declination)

  let recommendation = 'Use NPF for pixel-sharp stars. Use 500 Rule for casual shots.'
  if (npfTime < 5) {
    recommendation = 'Very short exposure needed. Consider a star tracker.'
  } else if (npfTime > 25) {
    recommendation = 'Plenty of time — you can expose comfortably.'
  }

  return {
    fiveHundredRule: Math.round(rule500Time * 10) / 10,
    npfRule: Math.round(npfTime * 10) / 10,
    recommendation,
  }
}

// ---------- Exposure equivalence ----------

export interface ExposureSettings {
  iso: number
  aperture: number // f-number
  shutter: number // seconds
}

/**
 * Calculate Exposure Value (EV) — higher = less light collected.
 * EV = log2(aperture² / shutter) - log2(iso / 100)
 */
export function calculateEV(s: ExposureSettings): number {
  return Math.log2((s.aperture * s.aperture) / s.shutter) - Math.log2(s.iso / 100)
}

/**
 * Solve for one unknown given two known values, keeping exposure equivalent to target.
 * unknown can be 'iso', 'aperture', or 'shutter'
 */
export function solveEquivalent(
  target: ExposureSettings,
  partial: Partial<ExposureSettings>,
  unknown: keyof ExposureSettings,
): number | null {
  const targetEV = calculateEV(target)

  if (unknown === 'shutter' && partial.iso && partial.aperture) {
    // EV = log2(N²/t) - log2(iso/100) → t = N² / (2^(EV + log2(iso/100)))
    const shutter = (partial.aperture * partial.aperture) / Math.pow(2, targetEV + Math.log2(partial.iso / 100))
    return shutter
  }
  if (unknown === 'iso' && partial.aperture && partial.shutter) {
    // iso = 100 * 2^(log2(N²/t) - EV)
    const iso = 100 * Math.pow(2, Math.log2((partial.aperture * partial.aperture) / partial.shutter) - targetEV)
    return iso
  }
  if (unknown === 'aperture' && partial.iso && partial.shutter) {
    // aperture = sqrt(t * 2^(EV + log2(iso/100)))
    const aperture = Math.sqrt(partial.shutter * Math.pow(2, targetEV + Math.log2(partial.iso / 100)))
    return aperture
  }
  return null
}

// ---------- Field of View ----------

export interface FOVResult {
  horizontalDeg: number
  verticalDeg: number
  diagonalDeg: number
}

export function calculateFOV(focalLengthMm: number, sensor: SensorSpec): FOVResult {
  const hDeg = 2 * Math.atan(sensor.widthMm / (2 * focalLengthMm)) * (180 / Math.PI)
  const vDeg = 2 * Math.atan(sensor.heightMm / (2 * focalLengthMm)) * (180 / Math.PI)
  const diag = Math.sqrt(sensor.widthMm ** 2 + sensor.heightMm ** 2)
  const dDeg = 2 * Math.atan(diag / (2 * focalLengthMm)) * (180 / Math.PI)
  return {
    horizontalDeg: Math.round(hDeg * 100) / 100,
    verticalDeg: Math.round(vDeg * 100) / 100,
    diagonalDeg: Math.round(dDeg * 100) / 100,
  }
}

// Common deep sky object apparent sizes (arcminutes) for comparison
export const DSO_SIZES: Array<{ name: string; sizeDeg: number; notes: string }> = [
  { name: 'Moon / Sun', sizeDeg: 0.5, notes: '~30 arcmin' },
  { name: 'Andromeda Galaxy (M31)', sizeDeg: 3.0, notes: '~180 arcmin, 6× moon' },
  { name: 'Orion Nebula (M42)', sizeDeg: 1.1, notes: '~66 arcmin' },
  { name: 'Pleiades (M45)', sizeDeg: 2.0, notes: '~120 arcmin' },
  { name: 'Milky Way Core', sizeDeg: 20, notes: 'fills most of a wide lens' },
  { name: 'Rosette Nebula', sizeDeg: 1.3, notes: '~78 arcmin' },
  { name: 'Horsehead Nebula', sizeDeg: 0.13, notes: '~8 arcmin (small)' },
  { name: 'Veil Nebula', sizeDeg: 3.0, notes: '~180 arcmin' },
  { name: 'Ring Nebula (M57)', sizeDeg: 0.025, notes: '~1.5 arcmin (tiny)' },
]

// ---------- Depth of Field / Hyperfocal ----------

export interface DoFResult {
  hyperfocalM: number
  nearLimitM: number
  farLimitM: number | null // null = infinity
  totalDoFM: number | null
}

export function calculateDoF(
  focalLengthMm: number,
  aperture: number,
  focusDistanceM: number,
  sensor: SensorSpec,
  cocMm: number = 0.02, // circle of confusion: typical for digital; scale by crop
): DoFResult {
  // Scale CoC by sensor diagonal relative to full-frame (43.27mm)
  const ffDiag = Math.sqrt(36 * 36 + 24 * 24)
  const sensorDiag = Math.sqrt(sensor.widthMm ** 2 + sensor.heightMm ** 2)
  const scaledCoC = cocMm * (sensorDiag / ffDiag)

  const f = focalLengthMm / 1000 // convert to meters
  const c = scaledCoC / 1000
  const N = aperture
  const s = focusDistanceM

  // Hyperfocal distance (m): H = f²/(N·c) + f
  const H = (f * f) / (N * c) + f

  // Near limit: Dn = s·(H - f) / (H + s - 2f)
  const Dn = (s * (H - f)) / (H + s - 2 * f)

  // Far limit: Df = s·(H - f) / (H - s)
  let Df: number | null = null
  if (s < H) {
    Df = (s * (H - f)) / (H - s)
  }

  const totalDoF = Df !== null ? Df - Dn : null

  return {
    hyperfocalM: Math.round(H * 100) / 100,
    nearLimitM: Math.round(Dn * 100) / 100,
    farLimitM: Df !== null ? Math.round(Df * 100) / 100 : null,
    totalDoFM: totalDoF !== null ? Math.round(totalDoF * 100) / 100 : null,
  }
}

// ---------- Time Lapse ----------

export interface TimeLapseResult {
  totalFrames: number
  totalShootTimeSec: number
  totalShootTimeFormatted: string
  storageGB: number
}

export function calculateTimeLapse(
  clipLengthSec: number,
  playbackFps: number,
  shootIntervalSec: number,
  avgFileSizeMB: number = 25,
): TimeLapseResult {
  const totalFrames = Math.ceil(clipLengthSec * playbackFps)
  const totalShootTimeSec = totalFrames * shootIntervalSec
  const storageMB = totalFrames * avgFileSizeMB

  const hours = Math.floor(totalShootTimeSec / 3600)
  const minutes = Math.floor((totalShootTimeSec % 3600) / 60)
  const seconds = Math.round(totalShootTimeSec % 60)
  const formatted = hours > 0
    ? `${hours}h ${minutes}m ${seconds}s`
    : `${minutes}m ${seconds}s`

  return {
    totalFrames,
    totalShootTimeSec,
    totalShootTimeFormatted: formatted,
    storageGB: Math.round((storageMB / 1024) * 100) / 100,
  }
}

// ---------- Star Trails Duration ----------

export interface StarTrailsPreview {
  arcDegrees: number
  description: string
  suggestion: string
}

/**
 * Calculate how much rotation you'll capture over a shooting duration.
 * Earth rotates 15°/hr (360° in 24 hours).
 */
export function previewStarTrails(durationMinutes: number): StarTrailsPreview {
  const arcDeg = Math.round((durationMinutes / 60) * 15 * 10) / 10

  let description = ''
  let suggestion = ''

  if (arcDeg < 5) {
    description = 'Very short trails — almost pinpoint stars'
    suggestion = 'Shoot at least 30 minutes for visible trails'
  } else if (arcDeg < 15) {
    description = 'Short trails — nice subtle movement'
    suggestion = 'Good for partial arcs or subtle motion'
  } else if (arcDeg < 45) {
    description = 'Medium trails — clear circular motion forming'
    suggestion = 'Aim for 1–2 hours for dramatic effect'
  } else if (arcDeg < 90) {
    description = 'Long trails — dramatic arcs'
    suggestion = 'Great for circular compositions around Polaris'
  } else {
    description = 'Very long trails — huge arcs or near-full circles'
    suggestion = 'Maximum drama. Watch battery & memory.'
  }

  return { arcDegrees: arcDeg, description, suggestion }
}
