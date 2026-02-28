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
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Categories', href: '#categories' },
        { label: 'Safety', href: '#safety' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'FAQs', to: '/faqs' },
      ]
    : [
        { label: 'Home', to: '/' },
        { label: 'FAQs', to: '/faqs' },
        { label: 'Privacy', to: '/privacy' },
      ]

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/60 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_8px_30px_rgba(0,0,0,0.04)] h-[64px] border-b border-white/60'
            : 'bg-white/40 backdrop-blur-xl h-[72px] border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <span className="text-3xl font-extrabold tracking-tight text-secondary">
              Grid<span className="brand-dot" />
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) =>
              'href' in link ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-text-muted font-medium text-[14px] hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.to!}
                  className="text-text-muted font-medium text-[14px] hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
            <a
              href="#download"
              className="bg-primary text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-primary-dark transition-all hover:-translate-y-0.5"
            >
              Get the App
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-secondary"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white/80 backdrop-blur-2xl border-t border-border/50">
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
