import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageTransition } from '../components/layout/PageTransition'
import photosData from '../data/photos.json'
import { articles } from '../data/articles'
import type { Photo } from '../types'

const photos = photosData as Photo[]
const featuredPhotos = photos.filter((p) => p.featured).slice(0, 6)

const latestArticles = [...articles]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 3)

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export function HomePage() {
  return (
    <PageTransition>
      <div className="relative z-10">
        {/* Hero section */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="max-w-3xl"
          >
            <motion.p variants={fadeUp} className="text-accent text-sm tracking-[0.3em] uppercase mb-4">
              Astrophotography
            </motion.p>
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-7xl font-extralight tracking-[0.3em] mb-2">
              ACE
            </motion.h1>
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-7xl font-bold tracking-[0.3em] mb-8">
              STELLAR
            </motion.h1>
            <motion.p variants={fadeUp} className="text-text-muted text-lg max-w-xl mx-auto leading-relaxed mb-12">
              Capturing the night sky from dark sites around the world.
              Plan your next shoot, explore the gallery, and discover where each photo was taken.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              <Link
                to="/dashboard"
                className="bg-accent text-white px-6 py-3 rounded-lg text-sm tracking-wider uppercase font-medium hover:bg-accent/80 transition-colors"
              >
                Plan a Shoot
              </Link>
              <Link
                to="/gallery"
                className="bg-bg-surface border border-border text-text-primary px-6 py-3 rounded-lg text-sm tracking-wider uppercase font-medium hover:border-accent/40 transition-colors"
              >
                View Gallery
              </Link>
              <Link
                to="/explore"
                className="bg-bg-surface border border-border text-text-primary px-6 py-3 rounded-lg text-sm tracking-wider uppercase font-medium hover:border-accent/40 transition-colors"
              >
                Explore Globe
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* What this is */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="bg-bg-surface/30 border border-border rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">🌕</div>
              <h3 className="text-sm font-semibold tracking-wider uppercase mb-2">Plan</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Moon phases, milky way visibility scores, and 16-day weather forecasts for your favorite dark sky locations.
              </p>
            </div>
            <div className="bg-bg-surface/30 border border-border rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">📷</div>
              <h3 className="text-sm font-semibold tracking-wider uppercase mb-2">Capture</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Browse the gallery filtered by category — moon, milky way, deep sky, landscape, and planetary shots with full EXIF data.
              </p>
            </div>
            <div className="bg-bg-surface/30 border border-border rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="text-sm font-semibold tracking-wider uppercase mb-2">Explore</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                Spin an interactive 3D globe to see exactly where each photo was taken. Click anywhere to save new shooting locations.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Featured photos */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-lg font-light tracking-widest text-center mb-8">
              FEATURED <span className="font-bold">SHOTS</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {featuredPhotos.map((photo, i) => {
                const gradients = [
                  'from-indigo-900 to-purple-900',
                  'from-blue-900 to-cyan-900',
                  'from-violet-900 to-fuchsia-900',
                  'from-slate-900 to-blue-900',
                  'from-purple-900 to-indigo-900',
                  'from-cyan-900 to-blue-900',
                ]
                return (
                  <Link
                    key={photo.id}
                    to="/gallery"
                    className="group relative aspect-square rounded-lg overflow-hidden"
                  >
                    <img
                      src={photo.thumbnail || photo.src}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.parentElement!.classList.add('bg-gradient-to-br', ...gradients[i % gradients.length].split(' '))
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                      <div className="p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-text-primary text-xs font-medium">{photo.title}</p>
                        <p className="text-text-muted text-[10px]">{photo.location.name}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        </section>

        {/* Latest articles */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-lg font-light tracking-widest text-center mb-8">
              LATEST <span className="font-bold">ARTICLES</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {latestArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/learn/${article.slug}`}
                  className="group bg-bg-surface/30 border border-border rounded-xl p-5 hover:border-accent/30 transition-all duration-300 hover:bg-bg-surface/50"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent uppercase tracking-wider font-medium">
                      {article.category}
                    </span>
                    <span className="text-[10px] text-text-muted">{article.readTime} min</span>
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-2 group-hover:text-accent transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-text-muted text-xs leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link
                to="/learn"
                className="text-accent text-sm hover:underline tracking-wider"
              >
                View all articles &rarr;
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Instagram link */}
        <section className="text-center py-16 px-4">
          <p className="text-text-muted text-sm mb-3">Follow the journey</p>
          <a
            href="https://instagram.com/ace.stellar.photography"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent text-lg hover:underline tracking-wider"
          >
            @ace.stellar.photography
          </a>
        </section>
      </div>
    </PageTransition>
  )
}
