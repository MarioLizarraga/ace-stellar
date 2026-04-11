import beginnerGuide from './beginner-guide.json'
import cameraSettings from './camera-settings-cheat-sheet.json'
import milkyWay from './milky-way-photography.json'
import moonPhoto from './moon-photography.json'
import rule500 from './500-rule-npf-rule.json'
import equipment from './essential-equipment.json'
import focusStars from './how-to-focus-stars.json'
import planning from './planning-astro-shoot.json'
import editing from './editing-stacking-basics.json'
import lightPollution from './light-pollution-dark-skies.json'

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  tags: string[]
  author: string
  date: string
  readTime: number
  featured: boolean
  body: string
}

export const articles: Article[] = [
  beginnerGuide,
  cameraSettings,
  milkyWay,
  moonPhoto,
  rule500,
  equipment,
  focusStars,
  planning,
  editing,
  lightPollution,
] as Article[]
