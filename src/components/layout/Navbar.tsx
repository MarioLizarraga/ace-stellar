import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/explore', label: 'Explore' },
]

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-1">
          <span className="text-xl tracking-[0.5em] text-text-primary font-extralight">
            ACE
          </span>
          <span className="text-xl tracking-[0.5em] text-text-primary font-bold">
            STELLAR
          </span>
        </NavLink>

        <div className="flex items-center gap-8">
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
      </div>
    </nav>
  )
}
