import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

interface ArticleCardProps {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: number
  featured?: boolean
  index: number
}

const categoryColors: Record<string, string> = {
  beginner: 'bg-astro-green/20 text-astro-green',
  technique: 'bg-accent/20 text-accent',
  gear: 'bg-astro-yellow/20 text-astro-yellow',
  planning: 'bg-purple-500/20 text-purple-400',
  editing: 'bg-pink-500/20 text-pink-400',
  astronomy: 'bg-cyan-500/20 text-cyan-400',
}

export function ArticleCard({ slug, title, excerpt, category, date, readTime, featured, index }: ArticleCardProps) {
  const colorClass = categoryColors[category] || 'bg-accent/20 text-accent'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="h-full"
    >
      <Link
        to={`/learn/${slug}`}
        className={`flex flex-col h-full bg-bg-surface/30 border border-border rounded-xl p-6 hover:border-accent/30 transition-all duration-300 hover:bg-bg-surface/50 ${
          featured ? 'ring-1 ring-accent/20' : ''
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ${colorClass}`}>
            {category}
          </span>
          <span className="text-[10px] text-[#8b95a5]">{readTime} min read</span>
          {featured && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-astro-yellow/10 text-astro-yellow uppercase tracking-wider font-medium">
              Featured
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-accent transition-colors">
          {title}
        </h3>

        <p className="text-[#a8b2c1] text-sm leading-relaxed mb-3 flex-1">
          {excerpt}
        </p>

        <p className="text-[11px] text-[#8b95a5] mt-auto">
          {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </Link>
    </motion.div>
  )
}
