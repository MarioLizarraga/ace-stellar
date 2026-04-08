import { motion } from 'framer-motion'

export function DashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-extralight tracking-widest">
        DASH<span className="font-bold">BOARD</span>
      </h1>
    </motion.div>
  )
}
