import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isHome = pathname === '/'

  const navLinks = isHome
    ? [
        { label: 'Features', href: '#features' },
        { label: 'Safety', href: '#safety' },
        { label: 'FAQs', to: '/faqs' },
      ]
    : [
        { label: 'Home', to: '/' },
        { label: 'FAQs', to: '/faqs' },
        { label: 'Privacy', to: '/privacy' },
      ]

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-secondary text-white text-center py-2.5 px-4 text-[13px] font-medium tracking-wide">
        Expanding to 900+ Premier Institutions across India. Coming soon on iOS & Android.
      </div>

      {/* Navbar */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-sm h-[72px]'
            : 'bg-white/80 backdrop-blur-xl h-[80px]'
        } border-b border-border`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-extrabold tracking-tight text-secondary">
            Grid<span className="brand-dot" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              'href' in link ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-text-muted font-semibold text-[15px] hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.to!}
                  className="text-text-muted font-semibold text-[15px] hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
            <a
              href="#download"
              className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-primary-dark transition-colors hover:-translate-y-0.5 transform"
            >
              Get the App
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-secondary"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-border shadow-lg">
            <div className="px-6 py-4 flex flex-col gap-3">
              {navLinks.map((link) =>
                'href' in link ? (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-text-muted font-semibold text-base py-2 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.to!}
                    className="text-text-muted font-semibold text-base py-2 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <a
                href="#download"
                className="bg-primary text-white px-6 py-3 rounded-full font-semibold text-sm text-center mt-2"
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
