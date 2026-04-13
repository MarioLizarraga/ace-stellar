import * as Astronomy from 'astronomy-engine'

export interface PlanetOpposition {
  planet: string
  date: string
  daysUntil: number
  notes: string
}

const PLANET_NOTES: Record<string, string> = {
  Mars: 'Closest approach — best time to image. Surface detail visible. ~26 months between oppositions.',
  Jupiter: 'Annual event. Great Red Spot, cloud bands, and moons visible. Biggest and brightest in the sky.',
  Saturn: 'Annual event. Rings at maximum tilt around opposition (depends on year). Moon Titan visible.',
  Uranus: 'Annual. Tiny blue disk, challenging. Telescope needed.',
  Neptune: 'Annual. Extremely small and faint. Telescope with 200mm+ required.',
}

export function getUpcomingOppositions(yearsAhead: number = 3): PlanetOpposition[] {
  const now = new Date()
  const limit = new Date()
  limit.setFullYear(limit.getFullYear() + yearsAhead)

  const results: PlanetOpposition[] = []
  const outerPlanets: Astronomy.Body[] = [
    Astronomy.Body.Mars,
    Astronomy.Body.Jupiter,
    Astronomy.Body.Saturn,
    Astronomy.Body.Uranus,
    Astronomy.Body.Neptune,
  ]

  for (const body of outerPlanets) {
    let searchTime = Astronomy.MakeTime(now)
    for (let i = 0; i < 5; i++) {
      try {
        const event = Astronomy.SearchRelativeLongitude(body, 180, searchTime)
        if (!event) break
        if (event.date > limit) break

        const daysUntil = Math.ceil((event.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntil < 0) {
          // Move forward and try again
          searchTime = Astronomy.MakeTime(new Date(event.date.getTime() + 86400000))
          continue
        }

        const planetName = Astronomy.Body[body]
        results.push({
          planet: planetName,
          date: event.date.toISOString().split('T')[0],
          daysUntil,
          notes: PLANET_NOTES[planetName] || '',
        })

        // Advance past this opposition to find the next one
        searchTime = Astronomy.MakeTime(new Date(event.date.getTime() + 86400000 * 30))
      } catch {
        break
      }
    }
  }

  return results.sort((a, b) => a.date.localeCompare(b.date))
}
