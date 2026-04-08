import * as Astronomy from 'astronomy-engine'
import type { MilkyWayNight } from '../types'

const GC_RA = 17.75 * 15   // Galactic center RA in degrees (17h 45m)
const GC_DEC = -29.0        // Galactic center Dec in degrees

function getGalacticCenterTransit(date: Date, observer: Astronomy.Observer): { rise: Date | null; set: Date | null; maxAlt: number } {
  const startOfNight = new Date(date)
  startOfNight.setHours(18, 0, 0, 0)
  const endOfNight = new Date(date)
  endOfNight.setDate(endOfNight.getDate() + 1)
  endOfNight.setHours(6, 0, 0, 0)

  let rise: Date | null = null
  let set: Date | null = null
  let maxAlt = -90
  let wasAboveHorizon = false

  for (let minutes = 0; minutes <= 720; minutes += 15) {
    const checkTime = new Date(startOfNight.getTime() + minutes * 60 * 1000)
    const astroTime = Astronomy.MakeTime(checkTime)

    const equ = { ra: GC_RA / 15, dec: GC_DEC }
    const hor = Astronomy.Horizon(astroTime, observer, equ.ra, equ.dec, 'normal')
    const alt = hor.altitude

    if (alt > maxAlt) maxAlt = alt
    if (alt > 10 && !wasAboveHorizon) {
      rise = checkTime
      wasAboveHorizon = true
    }
    if (alt <= 10 && wasAboveHorizon && !set) {
      set = checkTime
    }
  }

  return { rise, set, maxAlt }
}

function getMoonInterference(date: Date, _observer: Astronomy.Observer): 'none' | 'low' | 'medium' | 'high' {
  const astroTime = Astronomy.MakeTime(date)
  const illum = Astronomy.Illumination(Astronomy.Body.Moon, astroTime)
  const fraction = illum.phase_fraction

  if (fraction < 0.1) return 'none'
  if (fraction < 0.3) return 'low'
  if (fraction < 0.6) return 'medium'
  return 'high'
}

export function getMilkyWayForecast(lat: number, lng: number, days: number = 30): MilkyWayNight[] {
  const observer = new Astronomy.Observer(lat, lng, 0)
  const nights: MilkyWayNight[] = []
  const today = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    date.setHours(0, 0, 0, 0)

    const gc = getGalacticCenterTransit(date, observer)
    const moonInterference = getMoonInterference(date, observer)

    // Score: 0-100
    const altScore = Math.min(40, Math.max(0, gc.maxAlt) * (40 / 60))
    const moonScores = { none: 40, low: 30, medium: 15, high: 0 }
    const moonScore = moonScores[moonInterference]
    let windowHours = 0
    if (gc.rise && gc.set) {
      windowHours = (gc.set.getTime() - gc.rise.getTime()) / (1000 * 60 * 60)
    }
    const windowScore = Math.min(20, windowHours * (20 / 6))

    const score = Math.round(altScore + moonScore + windowScore)

    const formatTime = (d: Date | null) =>
      d ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null

    nights.push({
      date: date.toISOString().split('T')[0],
      score,
      coreVisibleStart: formatTime(gc.rise),
      coreVisibleEnd: formatTime(gc.set),
      moonInterference,
    })
  }

  return nights.sort((a, b) => b.score - a.score)
}
