import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { Menu, X, ChevronDown, Sun, Moon } from 'lucide-react'

const MORE_LINKS = [
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Delete Account', to: '/delete-account' },
  { label: 'Report a Bug', to: '/bug-report' },
  { label: 'Leave a Review', to: '/reviews' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setMoreOpen(false)
  }, [pathname])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all border-b ${
          scrolled
            ? 'bg-surface/70 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_30px_rgba(0,0,0,0.04)] h-[64px] border-border/60'
            : 'bg-surface/40 backdrop-blur-xl h-[72px] border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between font-family-sans">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <span className="text-3xl font-black tracking-tight text-secondary">
              Grid<span className="brand-dot" />
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-7">

            {[
              { label: 'Home', to: '/' },
              { label: 'Contact Us', to: '/contact' },
              { label: 'FAQs', to: '/faqs' },
              { label: 'Privacy Policy', to: '/privacy' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-bold text-[13px] uppercase tracking-widest transition-colors duration-300 ${
                  pathname === link.to
                    ? 'text-primary'
                    : 'text-text-muted hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* More dropdown */}
            <div ref={moreRef} className="relative">
              <button
                onClick={() => setMoreOpen((o) => !o)}
                className="flex items-center gap-1 font-bold text-[13px] uppercase tracking-widest transition-colors duration-300 text-text-muted hover:text-primary"
              >
                More
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {moreOpen && (
                <div className="absolute right-0 top-full mt-3 w-52 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-border/60 bg-surface overflow-hidden">
                  <div className="py-1.5">
                    {MORE_LINKS.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`block px-4 py-2.5 text-[13px] transition-colors font-bold uppercase tracking-widest ${
                          pathname === link.to
                            ? 'text-primary bg-primary/5'
                            : 'text-text-muted hover:text-secondary hover:bg-muted/50'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-[1.5px] bg-border mx-2" />

            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all duration-500 scale-100 hover:scale-105 active:scale-95 cursor-pointer ${
                theme === 'dark' 
                ? 'bg-zinc-900 border-zinc-800 text-primary shadow-[0_0_20px_rgba(37,99,235,0.1)]' 
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-primary/30'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Moon size={18} fill="currentColor" /> : <Sun size={18} />}
            </button>

            <a
              href="/#download"
              className="bg-primary text-white px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-[2px] hover:bg-primary-dark transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/20"
            >
              Get App
            </a>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all duration-500 ${
                theme === 'dark' 
                ? 'bg-zinc-900 border-zinc-800 text-primary' 
                : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              {theme === 'dark' ? <Moon size={20} fill="currentColor" /> : <Sun size={20} />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 transition-colors duration-300 text-secondary"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden backdrop-blur-2xl border-t bg-surface/95 border-border/50 overflow-hidden">
            <div className="px-6 py-6 flex flex-col gap-1">
              {[
                { label: 'Home', to: '/' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'FAQs', to: '/faqs' },
                { label: 'Privacy Policy', to: '/privacy' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`font-black text-sm uppercase tracking-[3px] py-3 transition-colors ${
                    pathname === link.to
                      ? 'text-primary'
                      : 'text-text-muted hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t mt-3 pt-4 border-border/50">
                <p className="text-[10px] font-black uppercase tracking-[4px] mb-3 px-0.5 text-text-muted/40">Navigation</p>
                {MORE_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                      pathname === link.to
                        ? 'text-primary'
                        : 'text-text-muted hover:text-primary'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <a
                href="/#download"
                className="bg-primary text-white w-full py-4 rounded-[20px] font-black text-xs uppercase tracking-[3px] text-center mt-6 shadow-2xl shadow-primary/30"
              >
                Get App
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
