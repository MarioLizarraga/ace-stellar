interface AstroScoreProps {
  score: number
  size?: 'sm' | 'md'
}

export function AstroScore({ score, size = 'md' }: AstroScoreProps) {
  const color = score >= 70 ? 'text-astro-green' : score >= 40 ? 'text-astro-yellow' : 'text-astro-red'
  const bg = score >= 70 ? 'bg-astro-green/20' : score >= 40 ? 'bg-astro-yellow/20' : 'bg-astro-red/20'
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'

  return (
    <div className={`${sizeClass} ${bg} rounded-lg flex items-center justify-center`}>
      <span className={`font-bold tabular-nums ${color}`}>{score}</span>
    </div>
  )
}
