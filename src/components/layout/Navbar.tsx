import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/explore', label: 'Explore' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-1" onClick={() => setMobileOpen(false)}>
          <span className="text-xl tracking-[0.5em] text-text-primary font-extralight">
            ACE
          </span>
          <span className="text-xl tracking-[0.5em] text-text-primary font-bold">
            STELLAR
          </span>
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `text-sm tracking-[0.2em] uppercase transition-colors pb-1 border-b-2 ${
                  isActive
                    ? 'text-text-primary border-accent font-semibold'
                    : 'text-text-muted border-transparent hover:text-text-primary'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-text-primary p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <div className="space-y-1.5">
            <div className={`w-5 h-0.5 bg-text-primary transition-transform ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <div className={`w-5 h-0.5 bg-text-primary transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-text-primary transition-transform ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-bg-primary/95 backdrop-blur-md border-b border-border">
          <div className="px-4 py-4 space-y-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block text-sm tracking-[0.2em] uppercase ${
                    isActive ? 'text-text-primary font-semibold' : 'text-text-muted'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
