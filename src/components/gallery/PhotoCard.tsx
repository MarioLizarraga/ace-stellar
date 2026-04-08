import { motion } from 'framer-motion'
import type { Photo } from '../../types'

interface PhotoCardProps {
  photo: Photo
  index: number
  onClick: () => void
}

const gradients = [
  'from-indigo-900 to-purple-900',
  'from-blue-900 to-cyan-900',
  'from-violet-900 to-fuchsia-900',
  'from-slate-900 to-blue-900',
  'from-purple-900 to-indigo-900',
]

export function PhotoCard({ photo, index, onClick }: PhotoCardProps) {
  const gradient = gradients[index % gradients.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg"
      onClick={onClick}
    >
      <img
        src={photo.thumbnail || photo.src}
        alt={photo.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          target.parentElement!.classList.add('bg-gradient-to-br', ...gradient.split(' '))
        }}
      />

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-end">
        <div className="p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-text-primary text-sm font-semibold">{photo.title}</h3>
          <p className="text-text-muted text-xs mt-1">{photo.location.name}</p>
        </div>
      </div>
    </motion.div>
  )
}
