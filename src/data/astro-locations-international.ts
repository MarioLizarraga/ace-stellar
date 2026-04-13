export interface IntlAstroLocation {
  id: string
  name: string
  country: string
  region: string
  lat: number
  lng: number
  bortle: number
  bestFor: string
  bestMonths: string
  budget: '$' | '$$' | '$$$'
  safety: string
}

export const astroLocationsInternational: IntlAstroLocation[] = [
  // South America
  { id: 'atacama-chile', name: 'Atacama Desert (San Pedro)', country: 'Chile', region: 'South America', lat: -22.91, lng: -68.20, bortle: 1, bestFor: 'Milky Way core, deep sky, southern objects', bestMonths: 'Mar–Nov', budget: '$$', safety: 'Altitude 2400m+, extreme dryness, sunburn at altitude' },
  { id: 'patagonia-argentina', name: 'El Chaltén (Patagonia)', country: 'Argentina', region: 'South America', lat: -49.33, lng: -72.89, bortle: 2, bestFor: 'Fitz Roy + Milky Way, dramatic peaks', bestMonths: 'Mar–May, Sep–Nov', budget: '$$', safety: 'Extreme wind, cold, remote trails' },
  { id: 'salar-uyuni-bolivia', name: 'Salar de Uyuni', country: 'Bolivia', region: 'South America', lat: -20.13, lng: -67.49, bortle: 1, bestFor: 'Salt flat reflections + stars, surreal landscapes', bestMonths: 'Apr–Nov (dry)', budget: '$', safety: 'Altitude 3600m, altitude sickness risk, isolated' },

  // Africa
  { id: 'namibrand-namibia', name: 'NamibRand Nature Reserve', country: 'Namibia', region: 'Africa', lat: -24.91, lng: 15.96, bortle: 1, bestFor: 'Southern sky, Sossusvlei dunes + stars', bestMonths: 'Apr–Oct', budget: '$$', safety: 'Wildlife (scorpions, snakes), hot days, remote' },
  { id: 'sutherland-south-africa', name: 'Sutherland (SAAO)', country: 'South Africa', region: 'Africa', lat: -32.38, lng: 20.81, bortle: 2, bestFor: 'Southern deep sky, observatory tours', bestMonths: 'Apr–Sep', budget: '$$', safety: 'Cold nights, long drive from Cape Town' },
  { id: 'merzouga-morocco', name: 'Sahara Desert (Merzouga)', country: 'Morocco', region: 'Africa', lat: 31.08, lng: -4.01, bortle: 1, bestFor: 'Sand dunes + Milky Way, desert camps', bestMonths: 'Sep–May', budget: '$', safety: 'Heat, dehydration, stick with tour groups' },
  { id: 'makgadikgadi-botswana', name: 'Makgadikgadi Salt Pans', country: 'Botswana', region: 'Africa', lat: -20.67, lng: 25.27, bortle: 1, bestFor: 'Salt pan reflections, flat horizon 360°', bestMonths: 'May–Oct', budget: '$$', safety: 'Wildlife (lions, hyenas at night), need 4x4 and guide' },

  // Europe
  { id: 'lofoten-norway', name: 'Lofoten Islands', country: 'Norway', region: 'Europe', lat: 68.23, lng: 14.56, bortle: 2, bestFor: 'Aurora borealis, fjords + northern lights', bestMonths: 'Sep–Mar', budget: '$$$', safety: 'Extreme cold (-10 to -20°C), icy roads, polar darkness' },
  { id: 'landmannalaugar-iceland', name: 'Landmannalaugar', country: 'Iceland', region: 'Europe', lat: 63.99, lng: -19.06, bortle: 2, bestFor: 'Aurora + volcanic landscapes, hot springs', bestMonths: 'Sep–Mar', budget: '$$$', safety: 'Extreme weather changes, F-roads need 4x4, volcanic terrain' },
  { id: 'la-palma-spain', name: 'Roque de los Muchachos (La Palma)', country: 'Spain', region: 'Europe', lat: 28.76, lng: -17.89, bortle: 1, bestFor: 'Above-cloud observing, first Starlight Reserve', bestMonths: 'May–Oct', budget: '$$', safety: 'Altitude 2400m, steep mountain roads, cold at summit' },
  { id: 'galloway-scotland', name: 'Galloway Forest Dark Sky Park', country: 'Scotland', region: 'Europe', lat: 55.08, lng: -4.48, bortle: 3, bestFor: 'IDA certified, Milky Way, accessible from cities', bestMonths: 'Sep–Mar', budget: '$$', safety: 'Rain and cloud cover common, midges in summer, cold' },
  { id: 'abisko-sweden', name: 'Abisko', country: 'Sweden', region: 'Europe', lat: 68.35, lng: 18.83, bortle: 2, bestFor: 'Clearest aurora skies in Scandinavia', bestMonths: 'Sep–Mar', budget: '$$$', safety: 'Extreme cold, polar night, limited facilities' },
  { id: 'alqueva-portugal', name: 'Alqueva Dark Sky Reserve', country: 'Portugal', region: 'Europe', lat: 38.21, lng: -7.49, bortle: 2, bestFor: 'First Starlight Tourism certified, mild climate', bestMonths: 'Apr–Oct', budget: '$$', safety: 'Mild climate, very safe, easy access from Lisbon' },

  // Middle East
  { id: 'wahiba-oman', name: 'Wahiba Sands', country: 'Oman', region: 'Middle East', lat: 22.18, lng: 58.51, bortle: 1, bestFor: 'Desert dunes + Milky Way, canyons', bestMonths: 'Oct–Apr', budget: '$$', safety: 'Heat, need 4x4, respectful dress code' },
  { id: 'wadi-rum-jordan', name: 'Wadi Rum', country: 'Jordan', region: 'Middle East', lat: 29.57, lng: 35.42, bortle: 1, bestFor: 'Mars-like landscape + stars, Bedouin camps', bestMonths: 'Mar–Nov', budget: '$$', safety: 'Very safe for tourists, heat in summer, cold winter nights' },

  // Asia
  { id: 'achi-japan', name: 'Achi Village', country: 'Japan', region: 'Asia', lat: 35.42, lng: 137.75, bortle: 3, bestFor: 'Darkest village in Japan, cultural foregrounds', bestMonths: 'Apr–Oct', budget: '$$$', safety: 'Rural area, limited English signage, mountain roads' },
  { id: 'hanle-india', name: 'Hanle (Indian Astronomical Observatory)', country: 'India', region: 'Asia', lat: 32.78, lng: 78.96, bortle: 1, bestFor: 'Highest observatory, Pangong Lake + stars', bestMonths: 'Jun–Sep', budget: '$', safety: 'Altitude 4500m+, permits required, altitude sickness, remote' },
  { id: 'gobi-mongolia', name: 'Gobi Desert', country: 'Mongolia', region: 'Asia', lat: 43.50, lng: 104.50, bortle: 1, bestFor: 'Nomadic ger camps + pristine sky, wide-field', bestMonths: 'May–Oct', budget: '$', safety: 'Extremely remote, no infrastructure, extreme temperatures' },
  { id: 'hehuanshan-taiwan', name: 'Hehuanshan (合歡山)', country: 'Taiwan', region: 'Asia', lat: 24.14, lng: 121.28, bortle: 2, bestFor: 'Mountain dark sky park, sea of clouds + stars', bestMonths: 'Oct–Apr', budget: '$$', safety: 'Altitude 3200m, mountain roads, cold and windy' },

  // Oceania
  { id: 'warrumbungle-australia', name: 'Warrumbungle National Park', country: 'Australia', region: 'Oceania', lat: -31.28, lng: 149.01, bortle: 2, bestFor: 'IDA certified, southern sky, outback foregrounds', bestMonths: 'Apr–Oct', budget: '$$', safety: 'Snakes, spiders, bushfire season, remote' },
  { id: 'aoraki-nz', name: 'Aoraki Mackenzie (Lake Tekapo)', country: 'New Zealand', region: 'Oceania', lat: -44.00, lng: 170.48, bortle: 2, bestFor: 'Mount Cook + stars, IDA Dark Sky Reserve', bestMonths: 'Mar–Oct', budget: '$$', safety: 'Cold, changeable weather, sandflies' },

  // North America (non-US)
  { id: 'jasper-canada', name: 'Jasper National Park', country: 'Canada', region: 'North America', lat: 52.87, lng: -117.85, bortle: 1, bestFor: 'Largest dark sky preserve, aurora + Milky Way', bestMonths: 'Aug–Apr (aurora), Jun–Sep (MW)', budget: '$$', safety: 'Grizzly and black bears, extreme cold in winter' },
  { id: 'san-pedro-martir-mexico', name: 'Sierra de San Pedro Mártir', country: 'Mexico', region: 'North America', lat: 31.03, lng: -115.47, bortle: 1, bestFor: 'National observatory, pristine Baja sky', bestMonths: 'Apr–Oct', budget: '$', safety: 'Remote mountain road, no services, cold at summit' },

  // Polar / Nordic
  { id: 'utsjoki-finland', name: 'Utsjoki (Lapland)', country: 'Finland', region: 'Polar', lat: 69.91, lng: 27.03, bortle: 1, bestFor: 'Aurora + snowy landscapes, frozen lakes', bestMonths: 'Sep–Mar', budget: '$$$', safety: 'Extreme cold, polar night, reindeer on roads' },
  { id: 'ilulissat-greenland', name: 'Ilulissat', country: 'Greenland', region: 'Polar', lat: 69.22, lng: -51.10, bortle: 1, bestFor: 'Icebergs + aurora + stars, otherworldly', bestMonths: 'Sep–Mar', budget: '$$$', safety: 'Extreme cold, very expensive, limited flights' },
]
