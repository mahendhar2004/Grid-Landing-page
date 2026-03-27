import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'

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
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/70 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_30px_rgba(0,0,0,0.04)] h-[64px] border-b border-white/60'
            : 'bg-white/40 backdrop-blur-xl h-[72px] border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <span className="text-3xl font-extrabold tracking-tight text-secondary">
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
                className={`font-medium text-[14px] transition-colors duration-300 ${
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
                className="flex items-center gap-1 font-medium text-[14px] transition-colors duration-300 text-text-muted hover:text-primary"
              >
                More
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {moreOpen && (
                <div className="absolute right-0 top-full mt-3 w-52 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-border/60 bg-white overflow-hidden">
                  <div className="py-1.5">
                    {MORE_LINKS.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`block px-4 py-2.5 text-sm transition-colors font-medium ${
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

            <a
              href="/#download"
              className="bg-primary text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-primary-dark transition-all hover:-translate-y-0.5 shadow-sm"
            >
              Get the App
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 transition-colors duration-300 text-secondary"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden backdrop-blur-2xl border-t bg-white/95 border-border/50">
            <div className="px-6 py-4 flex flex-col gap-1">
              {[
                { label: 'Home', to: '/' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'FAQs', to: '/faqs' },
                { label: 'Privacy Policy', to: '/privacy' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`font-semibold text-base py-2.5 transition-colors ${
                    pathname === link.to
                      ? 'text-primary'
                      : 'text-text-muted hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t mt-2 pt-3 border-border/50">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2 px-0.5 text-text-muted/50">More</p>
                {MORE_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block py-2 text-sm font-medium transition-colors ${
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
                className="bg-primary text-white px-6 py-3 rounded-full font-semibold text-sm text-center mt-3"
              >
                Get the App
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
