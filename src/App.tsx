import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Navbar } from './components/layout/Navbar'
import { StarBackground } from './components/layout/StarBackground'
import { HomePage } from './pages/HomePage'
import { DashboardPage } from './pages/DashboardPage'
import { GalleryPage } from './pages/GalleryPage'
import { ExplorePage } from './pages/ExplorePage'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/explore" element={<ExplorePage />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-bg-primary text-text-primary font-sans">
        <StarBackground />
        <Navbar />
        <main className="pt-16">
          <AnimatedRoutes />
        </main>
      </div>
    </HashRouter>
  )
}
