interface BortleIndicatorProps {
  bortle: number
}

const bortleColors = [
  '',
  '#000000', '#1a1a2e', '#2d2d5e', '#3d5a3d', '#7a7a3d',
  '#a06030', '#c04020', '#d03030', '#ff4040',
]

const bortleLabels = [
  '',
  'Excellent Dark', 'Typical Dark', 'Rural Sky', 'Rural/Suburban', 'Suburban',
  'Bright Suburban', 'Suburban/Urban', 'City Sky', 'Inner City',
]

export function BortleIndicator({ bortle }: BortleIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-3 h-3 rounded-full border border-border"
        style={{ backgroundColor: bortleColors[bortle] }}
      />
      <span className="text-xs text-text-muted">
        Bortle {bortle} — {bortleLabels[bortle]}
      </span>
    </div>
  )
}
