import * as Astronomy from 'astronomy-engine'

export interface SunTwilightData {
  sunrise: string | null
  sunset: string | null
  astroTwilightEnd: string | null   // when sky gets truly dark (evening)
  astroTwilightStart: string | null // when sky starts brightening (morning)
  goldenHourStart: string | null    // evening golden hour
  goldenHourEnd: string | null      // evening golden hour end (= sunset)
  blueHourStart: string | null      // after sunset
  blueHourEnd: string | null        // after blue hour = astro twilight approaching
  darknessHours: number             // total hours of astronomical darkness
}

export interface PlanetVisibility {
  name: string
  rises: string | null
  sets: string | null
  isVisible: boolean
  altitude: number // max altitude during the night
}

export interface DayAstroInfo {
  sun: SunTwilightData
  planets: PlanetVisibility[]
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function getBodyAltitude(body: Astronomy.Body, observer: Astronomy.Observer, time: Astronomy.AstroTime): number {
  const equ = Astronomy.Equator(body, time, observer, true, true)
  const hor = Astronomy.Horizon(time, observer, equ.ra, equ.dec, 'normal')
  return hor.altitude
}

function searchAltitude(
  body: Astronomy.Body,
  observer: Astronomy.Observer,
  targetAlt: number,
  direction: number,
  startTime: Astronomy.AstroTime,
  limitDays: number,
): Date | null {
  try {
    const steps = Math.floor(limitDays * 24 * 4) // 15 min steps
    let prevAlt = -999
    for (let i = 0; i <= steps; i++) {
      const t = Astronomy.MakeTime(new Date(startTime.date.getTime() + i * 15 * 60 * 1000))
      const alt = getBodyAltitude(body, observer, t)

      if (direction > 0 && prevAlt < targetAlt && alt >= targetAlt) {
        return t.date
      }
      if (direction < 0 && prevAlt > targetAlt && alt <= targetAlt) {
        return t.date
      }
      prevAlt = alt
    }
  } catch { /* not found */ }
  return null
}

export function getSunTwilightData(date: Date, lat: number, lng: number): SunTwilightData {
  const observer = new Astronomy.Observer(lat, lng, 0)
  const noon = new Date(date)
  noon.setHours(12, 0, 0, 0)
  const noonTime = Astronomy.MakeTime(noon)

  let sunrise: string | null = null
  let sunset: string | null = null

  try {
    const riseResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, noonTime, 1)
    if (riseResult) sunrise = formatTime(riseResult.date)
  } catch { /* polar regions */ }

  try {
    const setResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, noonTime, 1)
    if (setResult) sunset = formatTime(setResult.date)
  } catch { /* polar regions */ }

  // Calculate twilight times by scanning for sun altitude thresholds
  const evening = new Date(date)
  evening.setHours(12, 0, 0, 0)
  const eveningTime = Astronomy.MakeTime(evening)

  // Astronomical twilight: sun at -18°
  const astroEnd = searchAltitude(Astronomy.Body.Sun, observer, -18, -1, eveningTime, 0.75)

  // Next morning astronomical twilight start
  const morningStart = new Date(date)
  morningStart.setDate(morningStart.getDate() + 1)
  morningStart.setHours(0, 0, 0, 0)
  const morningTime = Astronomy.MakeTime(morningStart)
  const astroStart = searchAltitude(Astronomy.Body.Sun, observer, -18, +1, morningTime, 0.5)

  // Golden hour: sun between 6° and 0° (evening)
  const goldenStart = searchAltitude(Astronomy.Body.Sun, observer, 6, -1, eveningTime, 0.5)

  // Blue hour: sun between 0° and -6° (evening)
  const blueStart = searchAltitude(Astronomy.Body.Sun, observer, -0.5, -1, eveningTime, 0.5)
  const blueEnd = searchAltitude(Astronomy.Body.Sun, observer, -6, -1, eveningTime, 0.75)

  // Darkness hours
  let darknessHours = 0
  if (astroEnd && astroStart) {
    darknessHours = Math.max(0, (astroStart.getTime() - astroEnd.getTime()) / (1000 * 60 * 60))
  }

  return {
    sunrise,
    sunset,
    astroTwilightEnd: astroEnd ? formatTime(astroEnd) : null,
    astroTwilightStart: astroStart ? formatTime(astroStart) : null,
    goldenHourStart: goldenStart ? formatTime(goldenStart) : null,
    goldenHourEnd: sunset,
    blueHourStart: blueStart ? formatTime(blueStart) : null,
    blueHourEnd: blueEnd ? formatTime(blueEnd) : null,
    darknessHours: Math.round(darknessHours * 10) / 10,
  }
}

const VISIBLE_PLANETS: Astronomy.Body[] = [
  Astronomy.Body.Venus,
  Astronomy.Body.Mars,
  Astronomy.Body.Jupiter,
  Astronomy.Body.Saturn,
]

export function getPlanetVisibility(date: Date, lat: number, lng: number): PlanetVisibility[] {
  const observer = new Astronomy.Observer(lat, lng, 0)
  const results: PlanetVisibility[] = []

  // Check each planet's visibility during nighttime (8pm to 5am)
  const nightStart = new Date(date)
  nightStart.setHours(20, 0, 0, 0)

  for (const body of VISIBLE_PLANETS) {
    const name = Astronomy.Body[body] || body.toString()
    let rises: string | null = null
    let sets: string | null = null
    let maxAlt = -90
    let isAboveHorizon = false

    try {
      const startTime = Astronomy.MakeTime(nightStart)
      const riseResult = Astronomy.SearchRiseSet(body, observer, +1, startTime, 0.5)
      if (riseResult) rises = formatTime(riseResult.date)
    } catch { /* */ }

    try {
      const startTime = Astronomy.MakeTime(nightStart)
      const setResult = Astronomy.SearchRiseSet(body, observer, -1, startTime, 0.5)
      if (setResult) sets = formatTime(setResult.date)
    } catch { /* */ }

    // Sample altitude during night
    for (let h = 0; h < 9; h++) {
      const checkTime = new Date(nightStart.getTime() + h * 60 * 60 * 1000)
      const t = Astronomy.MakeTime(checkTime)
      try {
        const alt = getBodyAltitude(body, observer, t)
        if (alt > maxAlt) maxAlt = alt
        if (alt > 5) isAboveHorizon = true
      } catch { /* */ }
    }

    results.push({
      name,
      rises,
      sets,
      isVisible: isAboveHorizon,
      altitude: Math.round(maxAlt),
    })
  }

  return results
}

export function getDayAstroInfo(date: Date, lat: number, lng: number): DayAstroInfo {
  return {
    sun: getSunTwilightData(date, lat, lng),
    planets: getPlanetVisibility(date, lat, lng),
  }
}
