export function calculateAstroScore(
  cloudCover: number,
  humidity: number,
  windSpeed: number,
  visibility: number,
): number {
  const cloudScore = Math.max(0, 50 * (1 - cloudCover / 100))
  const humidityScore = Math.max(0, 20 * (1 - Math.max(0, humidity - 40) / 50))
  const windScore = Math.max(0, 15 * (1 - Math.min(windSpeed, 40) / 40))
  const visNorm = Math.min(visibility, 20000) / 20000
  const visScore = 15 * visNorm
  return Math.round(cloudScore + humidityScore + windScore + visScore)
}
