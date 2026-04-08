import * as Astronomy from 'astronomy-engine'
import type { MoonPhase } from '../types'

function getMoonPhaseName(illumination: Astronomy.IlluminationInfo): string {
  const phase = illumination.phase_angle
  if (phase < 10) return 'New Moon'
  if (phase < 80) return 'Waxing Crescent'
  if (phase < 100) return 'First Quarter'
  if (phase < 170) return 'Waxing Gibbous'
  if (phase < 190) return 'Full Moon'
  if (phase < 260) return 'Waning Gibbous'
  if (phase < 280) return 'Last Quarter'
  if (phase < 350) return 'Waning Crescent'
  return 'New Moon'
}

function getMoonPhaseEmoji(phaseName: string): string {
  const emojis: Record<string, string> = {
    'New Moon': '🌑',
    'Waxing Crescent': '🌒',
    'First Quarter': '🌓',
    'Waxing Gibbous': '🌔',
    'Full Moon': '🌕',
    'Waning Gibbous': '🌖',
    'Last Quarter': '🌗',
    'Waning Crescent': '🌘',
  }
  return emojis[phaseName] || '🌑'
}

export function getMoonDataForMonth(
  year: number,
  month: number,
  lat: number,
  lng: number,
): MoonPhase[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const observer = new Astronomy.Observer(lat, lng, 0)
  const phases: MoonPhase[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day, 12, 0, 0)
    const astroTime = Astronomy.MakeTime(date)
    const illumination = Astronomy.Illumination(Astronomy.Body.Moon, astroTime)
    const phaseName = getMoonPhaseName(illumination)

    let moonrise: string | null = null
    let moonset: string | null = null

    try {
      const riseResult = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, +1, astroTime, 1)
      if (riseResult) {
        moonrise = riseResult.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
    } catch { /* no rise this day */ }

    try {
      const setResult = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, -1, astroTime, 1)
      if (setResult) {
        moonset = setResult.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
    } catch { /* no set this day */ }

    phases.push({
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      phase: `${getMoonPhaseEmoji(phaseName)} ${phaseName}`,
      illumination: Math.round(illumination.phase_fraction * 100),
      moonrise,
      moonset,
      isFullMoon: phaseName === 'Full Moon',
      isNewMoon: phaseName === 'New Moon',
    })
  }

  return phases
}

export function getNextFullMoon(): { date: Date; daysUntil: number } {
  const now = new Date()
  const astroNow = Astronomy.MakeTime(now)
  const nextFull = Astronomy.SearchMoonQuarter(astroNow)

  let result = nextFull
  while (result.quarter !== 2) {
    result = Astronomy.NextMoonQuarter(result)
  }

  const daysUntil = Math.ceil((result.time.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return { date: result.time.date, daysUntil }
}
