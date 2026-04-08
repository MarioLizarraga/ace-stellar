export interface PhotoLocation {
  name: string
  lat: number
  lng: number
}

export interface PhotoExif {
  camera: string
  lens: string
  focalLength: string
  aperture: string
  shutter: string
  iso: number
}

export interface Photo {
  id: string
  title: string
  description?: string
  src: string
  thumbnail: string
  date: string
  location: PhotoLocation
  category: 'moon' | 'milky-way' | 'deep-sky' | 'landscape' | 'planetary'
  tags: string[]
  exif: PhotoExif
  featured: boolean
}

export interface SavedLocation {
  id: string
  name: string
  lat: number
  lng: number
  bortle: number
}

export interface DailyForecast {
  date: string
  cloudCover: number
  humidity: number
  windSpeed: number
  temperature: number
  dewPoint: number
  visibility: number
  astroScore: number
  isHistorical?: boolean
}

export interface MoonPhase {
  date: string
  phase: string
  illumination: number
  moonrise: string | null
  moonset: string | null
  isFullMoon: boolean
  isNewMoon: boolean
}

export interface MilkyWayNight {
  date: string
  score: number
  coreVisibleStart: string | null
  coreVisibleEnd: string | null
  moonInterference: 'none' | 'low' | 'medium' | 'high'
}
