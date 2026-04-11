import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageTransition } from '../components/layout/PageTransition'
import { articles } from '../data/articles'
import type { Article } from '../data/articles'

const categoryColors: Record<string, string> = {
  beginner: 'bg-astro-green/20 text-astro-green',
  technique: 'bg-accent/20 text-accent',
  gear: 'bg-astro-yellow/20 text-astro-yellow',
  planning: 'bg-purple-500/20 text-purple-400',
  editing: 'bg-pink-500/20 text-pink-400',
  astronomy: 'bg-cyan-500/20 text-cyan-400',
}

function renderMarkdown(body: string) {
  const paragraphs = body.split('\n\n')

  return paragraphs.map((block, i) => {
    const trimmed = block.trim()
    if (!trimmed) return null

    // Heading ### (h3 — subheading)
    if (trimmed.startsWith('### ')) {
      const text = trimmed.slice(4)
      return (
        <h3
          key={i}
          className="text-lg font-semibold text-text-primary mt-8 mb-3 tracking-wide"
        >
          {renderInline(text)}
        </h3>
      )
    }

    // Heading ## (h2 — section heading)
    if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3)
      return (
        <h2
          key={i}
          className="text-xl font-semibold text-text-primary mt-10 mb-4 tracking-wide"
        >
          {renderInline(text)}
        </h2>
      )
    }

    // Unordered list block (lines starting with -)
    const lines = trimmed.split('\n')
    if (lines.every((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '))) {
      return (
        <ul key={i} className="list-disc list-inside space-y-1.5 mb-4 text-[#a8b2c1] text-sm leading-relaxed pl-2">
          {lines.map((line, j) => {
            const content = line.trim().replace(/^[-*]\s+/, '')
            return <li key={j}>{renderInline(content)}</li>
          })}
        </ul>
      )
    }

    // Table block (lines starting with |)
    if (lines.every((l) => l.trim().startsWith('|'))) {
      const dataRows = lines.filter((l) => !l.trim().match(/^\|[\s-|]+\|$/))
      if (dataRows.length === 0) return null
      const headerCells = dataRows[0]
        .split('|')
        .filter((c) => c.trim() !== '')
        .map((c) => c.trim())
      const bodyRows = dataRows.slice(1).map((row) =>
        row
          .split('|')
          .filter((c) => c.trim() !== '')
          .map((c) => c.trim())
      )
      return (
        <div key={i} className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-text-muted border border-border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-bg-surface/50">
                {headerCells.map((cell, ci) => (
                  <th
                    key={ci}
                    className="px-3 py-2 text-left text-text-primary font-medium text-xs tracking-wider uppercase"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri} className="border-t border-border">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    // Mixed block with list items and non-list lines
    const hasListItems = lines.some((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '))
    if (hasListItems) {
      return (
        <div key={i} className="mb-4">
          {lines.map((line, j) => {
            const t = line.trim()
            if (t.startsWith('- ') || t.startsWith('* ')) {
              const content = t.replace(/^[-*]\s+/, '')
              return (
                <ul key={j} className="list-disc list-inside text-[#a8b2c1] text-sm leading-relaxed pl-2">
                  <li>{renderInline(content)}</li>
                </ul>
              )
            }
            return (
              <p key={j} className="text-[#a8b2c1] text-sm leading-relaxed mb-1">
                {renderInline(t)}
              </p>
            )
          })}
        </div>
      )
    }

    // Regular paragraph (may contain \n line breaks)
    return (
      <p key={i} className="text-[#a8b2c1] text-sm leading-relaxed mb-4">
        {lines.map((line, j) => (
          <span key={j}>
            {j > 0 && <br />}
            {renderInline(line)}
          </span>
        ))}
      </p>
    )
  })
}

function renderInline(text: string): React.ReactNode {
  // Process **bold** patterns
  const parts: React.ReactNode[] = []
  const regex = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(
      <strong key={match.index} className="text-text-primary font-semibold">
        {match[1]}
      </strong>
    )
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length === 0 ? text : parts
}

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()

  const sorted = [...articles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const index = sorted.findIndex((a) => a.slug === slug)
  const article: Article | undefined = sorted[index]
  const prevArticle: Article | undefined = sorted[index + 1]
  const nextArticle: Article | undefined = sorted[index - 1]

  if (!article) {
    return (
      <PageTransition>
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-light text-text-primary mb-4">Article not found</h1>
          <Link to="/learn" className="text-accent text-sm hover:underline">
            Back to Learn
          </Link>
        </div>
      </PageTransition>
    )
  }

  const colorClass = categoryColors[article.category] || 'bg-accent/20 text-accent'
  const formattedDate = new Date(article.date + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <PageTransition>
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            to="/learn"
            className="text-[#8b95a5] text-sm hover:text-accent transition-colors inline-flex items-center gap-1"
          >
            <span>&larr;</span> Back to Learn
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ${colorClass}`}
            >
              {article.category}
            </span>
            <span className="text-[11px] text-[#8b95a5]">{article.readTime} min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight mb-4">
            {article.title}
          </h1>

          <div className="flex items-center gap-3 text-[#8b95a5] text-xs">
            <span>By {article.author}</span>
            <span>&middot;</span>
            <span>{formattedDate}</span>
          </div>
        </motion.div>

        {/* Body */}
        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          {renderMarkdown(article.body)}
        </motion.article>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-12 pt-6 border-t border-border"
        >
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2.5 py-1 rounded-full bg-bg-surface/50 text-text-muted border border-border tracking-wider"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Prev / Next navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border">
          {prevArticle ? (
            <Link
              to={`/learn/${prevArticle.slug}`}
              className="group bg-bg-surface/30 border border-border rounded-xl p-4 hover:border-accent/30 transition-all"
            >
              <p className="text-[10px] text-[#8b95a5] uppercase tracking-wider mb-1">
                &larr; Previous Article
              </p>
              <p className="text-sm text-text-primary group-hover:text-accent transition-colors">
                {prevArticle.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
          {nextArticle ? (
            <Link
              to={`/learn/${nextArticle.slug}`}
              className="group bg-bg-surface/30 border border-border rounded-xl p-4 hover:border-accent/30 transition-all text-right"
            >
              <p className="text-[10px] text-[#8b95a5] uppercase tracking-wider mb-1">
                Next Article &rarr;
              </p>
              <p className="text-sm text-text-primary group-hover:text-accent transition-colors">
                {nextArticle.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </PageTransition>
  )
}
