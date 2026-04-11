import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageTransition } from '../components/layout/PageTransition'
import { ArticleCard } from '../components/blog/ArticleCard'
import { articles } from '../data/articles'

const categories = ['All', 'Beginner', 'Technique', 'Gear', 'Planning', 'Editing']

export function LearnPage() {
  const [activeCategory, setActiveCategory] = useState('All')

  const sorted = [...articles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const filtered =
    activeCategory === 'All'
      ? sorted
      : sorted.filter((a) => a.category === activeCategory.toLowerCase())

  return (
    <PageTransition>
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl text-center tracking-[0.3em] mb-4"
        >
          <span className="font-extralight">LE</span>
          <span className="font-bold">ARN</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-text-muted text-center text-sm mb-10 max-w-xl mx-auto"
        >
          Guides, tutorials, and tips to level up your astrophotography — from first
          shot to advanced techniques.
        </motion.p>

        {/* Category filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs tracking-[0.15em] uppercase px-4 py-1.5 rounded-full border transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-accent text-white border-accent'
                  : 'bg-transparent text-text-muted border-border hover:border-accent/40 hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Article grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((article, i) => (
            <ArticleCard
              key={article.id}
              slug={article.slug}
              title={article.title}
              excerpt={article.excerpt}
              category={article.category}
              date={article.date}
              readTime={article.readTime}
              featured={article.featured}
              index={i}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-text-muted text-center text-sm mt-12">
            No articles in this category yet. Check back soon!
          </p>
        )}
      </div>
    </PageTransition>
  )
}
