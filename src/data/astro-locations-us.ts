export interface AstroLocation {
  id: string
  name: string
  state: string
  region: string
  lat: number
  lng: number
  bortle: number
  bestFor: string
  bestMonths: string
  safety: string
}

export const astroLocationsUS: AstroLocation[] = [
  // Southwest
  { id: 'big-bend', name: 'Big Bend National Park', state: 'TX', region: 'Southwest', lat: 29.25, lng: -103.25, bortle: 2, bestFor: 'Milky Way, star trails, wide-field', bestMonths: 'Oct–Apr (avoid summer heat)', safety: 'Rattlesnakes, extreme heat, remote' },
  { id: 'chaco-culture', name: 'Chaco Culture NHP', state: 'NM', region: 'Southwest', lat: 36.06, lng: -107.97, bortle: 2, bestFor: 'Milky Way over ancient ruins', bestMonths: 'Apr–Oct', safety: 'Very remote, rough road, bring everything' },
  { id: 'monument-valley', name: 'Monument Valley', state: 'UT/AZ', region: 'Southwest', lat: 36.98, lng: -110.10, bortle: 2, bestFor: 'Iconic buttes + Milky Way', bestMonths: 'Mar–Oct', safety: 'Navajo Nation permits may be required' },
  { id: 'grand-canyon-north', name: 'Grand Canyon (North Rim)', state: 'AZ', region: 'Southwest', lat: 36.20, lng: -112.05, bortle: 3, bestFor: 'Canyon + stars, star trails', bestMonths: 'May–Oct (North Rim closed in winter)', safety: 'Altitude 8000ft, cold nights, cliff edges' },
  { id: 'death-valley', name: 'Death Valley', state: 'CA', region: 'Southwest', lat: 36.46, lng: -116.87, bortle: 1, bestFor: 'Darkest sky in the lower 48', bestMonths: 'Oct–Apr ONLY (deadly heat in summer)', safety: 'EXTREME heat, bring extra water, no cell service' },
  { id: 'bryce-canyon', name: 'Bryce Canyon', state: 'UT', region: 'Southwest', lat: 37.57, lng: -112.18, bortle: 2, bestFor: 'Hoodoos + Milky Way, astro festivals', bestMonths: 'Apr–Oct', safety: 'Altitude 8000ft, cold, icy in winter' },

  // West Coast
  { id: 'joshua-tree', name: 'Joshua Tree National Park', state: 'CA', region: 'West Coast', lat: 33.87, lng: -115.90, bortle: 3, bestFor: 'Alien landscape + stars, rock formations', bestMonths: 'Oct–May', safety: 'Scorpions, rattlesnakes, hot days' },
  { id: 'crater-lake', name: 'Crater Lake', state: 'OR', region: 'West Coast', lat: 42.87, lng: -122.17, bortle: 2, bestFor: 'Lake reflections + Milky Way', bestMonths: 'Jul–Sep (snow closes roads)', safety: 'Altitude, snow 8 months/year, cold' },
  { id: 'olympic-rialto', name: 'Olympic NP (Rialto Beach)', state: 'WA', region: 'West Coast', lat: 47.92, lng: -124.64, bortle: 2, bestFor: 'Sea stacks + stars, ocean foreground', bestMonths: 'Jun–Sep', safety: 'Tides, slippery rocks, rain, cold' },
  { id: 'trona-pinnacles', name: 'Trona Pinnacles', state: 'CA', region: 'West Coast', lat: 35.62, lng: -117.37, bortle: 2, bestFor: 'Otherworldly tufa formations', bestMonths: 'Oct–Apr', safety: 'Very remote, rough dirt road, no cell service' },

  // Mountain West
  { id: 'central-idaho-dsr', name: 'Central Idaho Dark Sky Reserve', state: 'ID', region: 'Mountain West', lat: 44.16, lng: -114.93, bortle: 1, bestFor: 'Largest dark sky reserve in US', bestMonths: 'Jun–Oct', safety: 'Bear country (black + grizzly), very remote' },
  { id: 'grand-teton', name: 'Grand Teton National Park', state: 'WY', region: 'Mountain West', lat: 43.74, lng: -110.80, bortle: 2, bestFor: 'Tetons + Milky Way, barn foreground', bestMonths: 'Jun–Sep', safety: 'Grizzly bears, bison, cold' },
  { id: 'great-sand-dunes', name: 'Great Sand Dunes', state: 'CO', region: 'Mountain West', lat: 37.73, lng: -105.51, bortle: 2, bestFor: 'Sand dunes + stars', bestMonths: 'Apr–Oct', safety: 'Altitude 8000ft+, afternoon lightning, cold nights' },
  { id: 'glacier-np', name: 'Glacier National Park', state: 'MT', region: 'Mountain West', lat: 48.76, lng: -113.79, bortle: 2, bestFor: 'Stunning mountain terrain + stars', bestMonths: 'Jul–Sep', safety: 'Grizzly bear country, prepare accordingly' },

  // Great Plains & Midwest
  { id: 'badlands', name: 'Badlands National Park', state: 'SD', region: 'Great Plains', lat: 43.75, lng: -102.50, bortle: 2, bestFor: 'Dramatic formations + Milky Way', bestMonths: 'Apr–Oct', safety: 'Rattlesnakes, extreme temperature swings' },
  { id: 'theodore-roosevelt', name: 'Theodore Roosevelt NP', state: 'ND', region: 'Great Plains', lat: 46.97, lng: -103.45, bortle: 2, bestFor: 'Painted canyon + dark sky', bestMonths: 'May–Sep', safety: 'Bison, very cold winters' },
  { id: 'headlands-mi', name: 'Headlands International Dark Sky Park', state: 'MI', region: 'Great Plains', lat: 45.77, lng: -84.76, bortle: 3, bestFor: 'Most accessible dark sky from Detroit/Chicago', bestMonths: 'May–Oct', safety: 'Mosquitoes in summer' },

  // Southeast
  { id: 'big-cypress', name: 'Big Cypress National Preserve', state: 'FL', region: 'Southeast', lat: 25.85, lng: -81.07, bortle: 3, bestFor: 'Swamp reflections + stars', bestMonths: 'Nov–Apr (dry season)', safety: 'Alligators, mosquitoes, wet terrain' },
  { id: 'shenandoah', name: 'Shenandoah National Park', state: 'VA', region: 'Southeast', lat: 38.53, lng: -78.35, bortle: 4, bestFor: 'Accessible from DC, Blue Ridge views', bestMonths: 'Apr–Oct', safety: 'Black bears, fog, Skyline Drive closes at night sometimes' },
  { id: 'outer-banks', name: 'Cape Hatteras / Outer Banks', state: 'NC', region: 'Southeast', lat: 35.22, lng: -75.53, bortle: 3, bestFor: 'Lighthouse + Milky Way', bestMonths: 'Apr–Sep', safety: 'Mosquitoes, sand, ocean currents' },

  // Northeast
  { id: 'cherry-springs', name: 'Cherry Springs State Park', state: 'PA', region: 'Northeast', lat: 41.66, lng: -77.82, bortle: 2, bestFor: 'East coast gold standard dark sky', bestMonths: 'Apr–Oct', safety: 'Bears, cold, limited facilities' },
  { id: 'acadia', name: 'Acadia National Park', state: 'ME', region: 'Northeast', lat: 44.35, lng: -68.21, bortle: 3, bestFor: 'Cadillac Mountain, first sunrise in US', bestMonths: 'Jun–Oct', safety: 'Cold, rocky terrain, fog' },
  { id: 'adirondacks', name: 'Adirondack Park', state: 'NY', region: 'Northeast', lat: 44.17, lng: -74.42, bortle: 2, bestFor: 'Massive wilderness, lake reflections', bestMonths: 'May–Oct', safety: 'Black bears, blackflies in June, cold' },

  // Hawaii & Alaska
  { id: 'mauna-kea', name: 'Mauna Kea', state: 'HI', region: 'Hawaii & Alaska', lat: 19.82, lng: -155.47, bortle: 1, bestFor: 'World-class, above clouds, observatory', bestMonths: 'Year-round', safety: 'Altitude 14000ft — altitude sickness risk, no scuba 24h before' },
  { id: 'haleakala', name: 'Haleakala', state: 'HI', region: 'Hawaii & Alaska', lat: 20.71, lng: -156.17, bortle: 2, bestFor: 'Above clouds, volcanic crater + stars', bestMonths: 'Year-round', safety: 'Altitude 10000ft, cold, reservation required for sunrise' },
  { id: 'denali', name: 'Denali National Park', state: 'AK', region: 'Hawaii & Alaska', lat: 63.33, lng: -150.50, bortle: 1, bestFor: 'Aurora + stars in winter', bestMonths: 'Sep–Mar (dark season)', safety: 'Extreme cold, grizzly bears, very remote' },
]
