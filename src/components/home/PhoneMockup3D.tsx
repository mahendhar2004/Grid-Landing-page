import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import {
  Sun, Moon, ArrowLeft, Send, Plus, Search, Bell, ArrowRight, Heart,
  Home as HomeIcon, ClipboardList, Map as MapIcon, MessageSquare, User,
  Laptop, Armchair, Smartphone, Monitor, Calculator, BookOpen, Zap,
  Crosshair, Plus as PlusIcon, Minus, Image as ImageIcon, Smile,
  BadgeCheck, Flame, Clock, CheckCheck,
} from 'lucide-react'

/* ─── v2 palette. Light page ground is warm (#FAF8F6), never pure white. ─── */
function palette(dark: boolean) {
  return {
    bg: dark ? '#12101A' : '#FAF8F6',
    surface: dark ? '#1C1926' : '#FFFFFF',
    surface2: dark ? '#252131' : '#F3F0EC',
    ink: dark ? '#FAFAFA' : '#171521',
    ink2: dark ? '#9B98A3' : '#6B6875',
    ink3: dark ? '#6B6875' : '#9B98A3',
    hair: dark ? 'rgba(255,255,255,0.09)' : 'rgba(23,21,33,0.08)',
    indigo: '#6E52E8',
    indigoDeep: '#4A3AC4',
    indigoBright: '#8468F5',
    indigoTint: dark ? 'rgba(110,82,232,0.20)' : '#EFEBFF',
    terracotta: dark ? '#E8735A' : '#B34A32',
    terracottaTint: dark ? 'rgba(232,115,90,0.16)' : '#FDEEE9',
    gold: dark ? '#F0C878' : '#B8853A',
    emerald: dark ? '#3DBF92' : '#1B7A5C',
    emeraldTint: dark ? 'rgba(27,122,92,0.20)' : '#E8F5EF',
  }
}

const INDIGO_GRAD = 'linear-gradient(135deg, #4A3AC4 0%, #8468F5 100%)'
const TERRA_GRAD = 'linear-gradient(145deg, #B34A32 0%, #D9694F 100%)'

/* Listing art is a gradient tile with a centred outline glyph — v2 uses no photography. */
const boosted = [
  { price: '₹8,500', title: 'MacBook Air M1 — barely used', meta: 'Gachibowli Hub · 2h ago', grad: 'linear-gradient(150deg,#2C4CA8,#5B7FE8)', Icon: Laptop },
  { price: '₹3,200', title: 'Study table + chair combo', meta: 'Gachibowli Hub · 5h ago', grad: 'linear-gradient(150deg,#8A5A2E,#C98B4E)', Icon: Armchair },
]

const wanted = [
  { cat: 'Electronics', urgent: true, title: 'Looking for a scientific calculator', budget: '₹500', who: 'SwiftEagle', offers: '3 offers' },
  { cat: 'Books', urgent: false, title: 'Data Structures textbook, any edition', budget: '₹300', who: 'CalmRiver', offers: 'No offers' },
]

const categories = [
  { label: 'Electronics', color: '#3D6FE0', Icon: Smartphone, active: true },
  { label: 'Furniture', color: '#C97C2E', Icon: Armchair },
  { label: 'Books', color: '#7748C4', Icon: BookOpen },
  { label: 'Sports', color: '#2E9B6B', Icon: Zap },
]

const requestRows = [
  { title: 'Need a laptop charger, 65W USB-C', budget: '₹900', who: 'MellowFox', offers: '5 offers', hot: true, left: 'Urgent · 6h left' },
  { title: 'TI-84 scientific calculator', budget: '₹500', who: 'SwiftEagle', offers: '5 offers', hot: true, left: '1d left' },
  { title: 'Badminton racket, intermediate', budget: '₹800', who: 'CalmRiver', offers: '4 offers', hot: false, left: '2d left' },
]

const sheetPreview = [
  { price: '₹8,500', title: 'MacBook Air M1', grad: 'linear-gradient(150deg,#2C4CA8,#5B7FE8)', Icon: Laptop },
  { price: '₹3,200', title: 'Study table', grad: 'linear-gradient(150deg,#8A5A2E,#C98B4E)', Icon: Armchair },
  { price: '₹12,000', title: 'iPhone 12', grad: 'linear-gradient(150deg,#3A3550,#6D6688)', Icon: Smartphone },
]

/* Map pins — indigo marks listings, terracotta marks requests. */
const mapPins = [
  { top: '19%', left: '17%', kind: 'listing', count: 9, Icon: Laptop },
  { top: '16%', left: '58%', kind: 'request', count: 4, Icon: Calculator },
  { top: '39%', left: '26%', kind: 'listing', count: 6, Icon: Monitor },
  { top: '37%', left: '64%', kind: 'listing', count: 3, Icon: Armchair },
]

const navItems = [
  { label: 'Home', Icon: HomeIcon },
  { label: 'Requests', Icon: ClipboardList },
  { label: 'Map', Icon: MapIcon },
  { label: 'Chat', Icon: MessageSquare },
  { label: 'Profile', Icon: User },
]

/* Floating cards around the phone */
const notifications = [
  { title: 'Offer received', sub: '₹2,900 for Study Table', tone: 'indigo' as const, Icon: ArrowLeftRightGlyph },
  { title: 'Sold!', sub: 'MacBook Air M1 · ₹8,500', tone: 'emerald' as const, Icon: BadgeCheck },
  { title: 'New request nearby', sub: 'Laptop charger, 65W USB-C', tone: 'terracotta' as const, Icon: ClipboardList },
  { title: 'Hub verified', sub: 'Welcome to IIT Delhi Hub', tone: 'indigo' as const, Icon: BadgeCheck },
  { title: 'Boosted', sub: 'Your listing is trending', tone: 'gold' as const, Icon: Flame },
]

function ArrowLeftRightGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" />
    </svg>
  )
}

/* Cards sit clear of the phone silhouette so they never mask the screen. */
const cardPositions = [
  { className: 'absolute -left-[196px] top-12 z-20', from: 'left' as const },
  { className: 'absolute -left-[214px] top-1/2 -translate-y-1/2 z-20', from: 'left' as const },
  { className: 'absolute -left-[182px] bottom-16 z-20', from: 'left' as const },
]

export default function PhoneMockup3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeScreen, setActiveScreen] = useState(0)
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const [cardSet, setCardSet] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const c = palette(isDarkMode)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springCfg = { stiffness: 150, damping: 20, mass: 0.5 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springCfg)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springCfg)

  const floatX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), springCfg)
  const floatY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-20, 20]), springCfg)
  const floatX2 = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, -15]), springCfg)
  const floatY2 = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springCfg)

  const handleMouse = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0) }

  /* Cycle through the five tabs */
  useEffect(() => {
    const interval = setInterval(() => setActiveScreen(s => (s + 1) % 5), 4200)
    return () => clearInterval(interval)
  }, [])

  const runCardCycle = useCallback(() => {
    const staggerIn = 500, holdTime = 3000, staggerOut = 400, pauseTime = 1000
    setVisibleCards([0])
    const t1 = setTimeout(() => setVisibleCards([0, 1]), staggerIn)
    const t2 = setTimeout(() => setVisibleCards([0, 1, 2]), staggerIn * 2)
    const outStart = staggerIn * 2 + holdTime
    const t3 = setTimeout(() => setVisibleCards([0, 1]), outStart)
    const t4 = setTimeout(() => setVisibleCards([0]), outStart + staggerOut)
    const t5 = setTimeout(() => setVisibleCards([]), outStart + staggerOut * 2)
    const t6 = setTimeout(() => setCardSet(p => (p + 1) % Math.ceil(notifications.length / 3)), outStart + staggerOut * 2 + pauseTime)
    return [t1, t2, t3, t4, t5, t6]
  }, [])

  useEffect(() => {
    const timers = runCardCycle()
    return () => timers.forEach(clearTimeout)
  }, [cardSet, runCardCycle])

  const currentNotifs = [
    notifications[(cardSet * 3) % notifications.length],
    notifications[(cardSet * 3 + 1) % notifications.length],
    notifications[(cardSet * 3 + 2) % notifications.length],
  ]

  const noteTone: Record<string, { bg: string; fg: string }> = {
    indigo: { bg: '#EFEBFF', fg: '#4A3AC4' },
    emerald: { bg: '#E8F5EF', fg: '#155E45' },
    terracotta: { bg: '#FDEEE9', fg: '#B34A32' },
    gold: { bg: '#FBF3E3', fg: '#B8853A' },
  }

  const parallaxStyles = [
    { x: floatX2, y: floatY2 },
    { x: floatX, y: floatY2 },
    { x: floatX, y: floatY },
  ]

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      style={{ perspective: 1200 }}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
    >
      {/* ─── Floating notification cards ─── */}
      {cardPositions.map((pos, i) => {
        const n = currentNotifs[i]
        const tone = noteTone[n.tone]
        return (
          <motion.div key={`pos-${i}`} className={pos.className} style={parallaxStyles[i]}>
            <AnimatePresence mode="wait">
              {visibleCards.includes(i) && (
                <motion.div
                  key={`card-${cardSet}-${i}`}
                  initial={{ opacity: 0, x: pos.from === 'left' ? -30 : 30, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: pos.from === 'left' ? -20 : 20, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_10px_30px_-8px_rgba(79,60,201,0.24),0_1px_2px_rgba(0,0,0,0.04)] px-4 py-3 flex items-center gap-3 border border-[rgba(23,21,33,0.06)]"
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: tone.bg, color: tone.fg }}>
                    <n.Icon size={15} strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#171521] whitespace-nowrap">{n.title}</p>
                    <p className="text-[9px] text-[#6B6875] whitespace-nowrap">{n.sub}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}

      {/* ─── 3D Phone ─── */}
      <motion.div
        className="relative z-10"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative w-[300px] h-[620px] bg-gradient-to-b from-[#232228] via-[#141317] to-[#08080a] rounded-[44px] p-[10px] shadow-[0_40px_80px_-20px_rgba(23,21,33,0.55),0_18px_40px_-12px_rgba(79,60,201,0.35),0_0_0_1px_rgba(255,255,255,0.08)_inset,0_1px_0_rgba(255,255,255,0.14)_inset]">
          {/* Polished rail highlight down each side of the frame */}
          <div className="absolute inset-0 rounded-[44px] pointer-events-none" style={{ background: 'linear-gradient(100deg, rgba(255,255,255,0.16) 0%, transparent 12%, transparent 88%, rgba(255,255,255,0.10) 100%)' }} />
          {/* Side buttons */}
          <div className="absolute -left-[3px] top-[120px] w-[3px] h-[30px] bg-[#2a2a2a] rounded-l-sm" />
          <div className="absolute -left-[3px] top-[170px] w-[3px] h-[50px] bg-[#2a2a2a] rounded-l-sm" />
          <div className="absolute -left-[3px] top-[230px] w-[3px] h-[50px] bg-[#2a2a2a] rounded-l-sm" />
          <div className="absolute -right-[3px] top-[180px] w-[3px] h-[60px] bg-[#2a2a2a] rounded-r-sm" />

          {/* Screen */}
          <div className="w-full h-full rounded-[36px] overflow-hidden relative transition-colors duration-500" style={{ backgroundColor: c.bg }}>
            {/* Glass glare — a single soft diagonal sweep across the panel */}
            <div
              className="absolute inset-0 z-[60] pointer-events-none rounded-[36px]"
              style={{
                background: 'linear-gradient(118deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 22%, transparent 46%, transparent 100%)',
              }}
            />
            {/* Edge vignette — keeps the panel from looking like a flat rectangle */}
            <div
              className="absolute inset-0 z-[59] pointer-events-none rounded-[36px]"
              style={{ boxShadow: 'inset 0 0 24px rgba(0,0,0,0.10), inset 0 0 2px rgba(0,0,0,0.18)' }}
            />
            {/* Dynamic Island */}
            <div className="absolute top-0 left-0 right-0 z-30">
              <div className="flex justify-center pt-[12px]">
                <div className="w-[90px] h-[24px] bg-black rounded-full flex items-center justify-end pr-[9px]">
                  <div className="w-[9px] h-[9px] rounded-full bg-[#1c1c1e] ring-[1.5px] ring-[#2a2a2a]" />
                </div>
              </div>

              <div className="flex justify-between items-center px-[18px] -mt-[26px] pb-[6px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold tabular-nums" style={{ color: c.ink }}>9:41</span>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-0.5 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-amber-400' : 'hover:bg-black/5 text-slate-400'}`}
                    aria-label="Toggle preview theme"
                  >
                    {isDarkMode ? <Sun size={9} /> : <Moon size={9} />}
                  </button>
                </div>
                <div className="flex items-center gap-[5px]">
                  <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                    <rect x="0" y="6" width="3" height="5" rx="0.8" fill={c.ink} />
                    <rect x="4" y="3.5" width="3" height="7.5" rx="0.8" fill={c.ink} />
                    <rect x="8" y="1.5" width="3" height="9.5" rx="0.8" fill={c.ink} />
                    <rect x="12" y="0" width="3" height="11" rx="0.8" fill={c.ink} />
                  </svg>
                  <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                    <path d="M1 4.5C3.2 1.7 10.8 1.7 13 4.5" stroke={c.ink} strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M2.8 6.8C4.4 4.8 9.6 4.8 11.2 6.8" stroke={c.ink} strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M4.7 9C5.5 7.8 8.5 7.8 9.3 9" stroke={c.ink} strokeWidth="1.4" strokeLinecap="round" />
                    <circle cx="7" cy="10.2" r="0.9" fill={c.ink} />
                  </svg>
                  <div className="relative flex items-center">
                    <div className="w-[22px] h-[11px] rounded-[3px] border-[1.2px] relative" style={{ borderColor: c.ink }}>
                      <div className="absolute inset-[1.5px] right-[2px] rounded-[1.5px]" style={{ backgroundColor: c.emerald }} />
                    </div>
                    <div className="w-[2px] h-[5px] rounded-r-[1px] -ml-[0.5px]" style={{ backgroundColor: c.ink }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Screen content */}
            <div className="pt-[54px] flex-1 h-full overflow-hidden">
              <AnimatePresence mode="wait">
                {activeScreen === 0 && <HomeScreen key="home" c={c} />}
                {activeScreen === 1 && <RequestsScreen key="requests" c={c} />}
                {activeScreen === 2 && <MapScreen key="map" c={c} />}
                {activeScreen === 3 && <ChatScreen key="chat" c={c} />}
                {activeScreen === 4 && <ProfileScreen key="profile" isDarkMode={isDarkMode} />}
              </AnimatePresence>
            </div>

            {/* iOS home indicator */}
            <div
              className="absolute bottom-[6px] left-1/2 -translate-x-1/2 z-[58] w-[104px] h-[4px] rounded-full pointer-events-none"
              style={{ backgroundColor: c.ink, opacity: 0.22 }}
            />

            {/* Floating create button — sits above the tab bar, right aligned */}
            <AnimatePresence>
              {activeScreen < 2 && (
                <motion.div
                  key="fab"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: 0.25, type: 'spring', stiffness: 320, damping: 22 }}
                  className="absolute right-[14px] bottom-[74px] z-40 w-[42px] h-[42px] rounded-full flex items-center justify-center text-white shadow-[0_10px_24px_-6px_rgba(79,60,201,0.6)]"
                  style={{ background: INDIGO_GRAD }}
                >
                  <Plus size={20} strokeWidth={2.6} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tab bar — five tabs, Map is new in v2. Fades with the screen so it never
                pops out from under a still-visible screen mid-transition. */}
            <AnimatePresence>
              {activeScreen !== 3 && (
              <motion.div
                key="tabbar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-0 left-0 right-0 z-50 h-[62px] flex items-start justify-around px-2 pt-2.5 border-t"
                style={{ backgroundColor: c.surface, borderColor: c.hair, boxShadow: '0 -8px 20px rgba(23,21,33,0.04)' }}
              >
                {navItems.map((item, idx) => {
                  const isActive = idx === activeScreen
                  return (
                    <div key={item.label} className="flex flex-col items-center gap-[3px] w-[46px]">
                      <div
                        className="w-[30px] h-[20px] rounded-full flex items-center justify-center transition-colors duration-300"
                        style={{ backgroundColor: isActive ? c.indigoTint : 'transparent', color: isActive ? c.indigo : c.ink3 }}
                      >
                        <item.Icon size={14} strokeWidth={isActive ? 2.6 : 2} />
                      </div>
                      <span
                        className="text-[7.5px] tracking-tight transition-colors duration-300"
                        style={{ color: isActive ? c.indigo : c.ink3, fontWeight: isActive ? 700 : 500 }}
                      >
                        {item.label}
                      </span>
                    </div>
                  )
                })}
              </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

type C = ReturnType<typeof palette>

/* Crossfade rather than slide — a horizontal shift gets clipped by the 280px frame
   and reads as a rendering fault mid-transition. */
const screenMotion = {
  initial: { opacity: 0, scale: 0.985 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.985 },
  transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] as const },
}

/* ─────────────────────────── HOME ─────────────────────────── */

function HomeScreen({ c }: { c: C }) {
  return (
    <motion.div {...screenMotion} className="h-full overflow-hidden">
      {/* Header: brand mark + Hub pill */}
      <div className="flex items-center justify-between px-3.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-[22px] h-[22px] rounded-[7px] flex items-center justify-center" style={{ background: INDIGO_GRAD }}>
            <div className="grid grid-cols-2 gap-[1.5px]">
              {[0, 1, 2, 3].map(i => <div key={i} className="w-[3px] h-[3px] rounded-[0.5px] bg-white" />)}
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full px-2 py-[3px]" style={{ backgroundColor: c.surface2 }}>
            <span className="w-[4px] h-[4px] rounded-full" style={{ backgroundColor: c.emerald }} />
            <span className="text-[8.5px] font-bold" style={{ color: c.ink }}>IIT Delhi Hub</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center" style={{ backgroundColor: c.surface2, color: c.ink2 }}>
            <Search size={10} strokeWidth={2.4} />
          </div>
          <div className="relative w-[22px] h-[22px] rounded-full flex items-center justify-center" style={{ backgroundColor: c.surface2, color: c.ink2 }}>
            <Bell size={10} strokeWidth={2.4} />
            <span className="absolute top-0 right-0 w-[6px] h-[6px] rounded-full border-[1.2px]" style={{ backgroundColor: c.terracotta, borderColor: c.bg }} />
          </div>
        </div>
      </div>

      {/* Pulse strip — the trust-by-construction moment */}
      <div className="px-3.5 mb-3">
        <div
          className="rounded-[16px] px-3 py-2.5 flex items-center gap-2.5 border"
          style={{
            background: 'linear-gradient(120deg,#F2EEFF,#FBF0FA)',
            borderColor: 'rgba(110,82,232,0.14)',
          }}
        >
          <div className="flex -space-x-[7px]">
            {[{ l: 'A', b: '#6E52E8' }, { l: 'R', b: '#B34A32' }, { l: 'P', b: '#1B7A5C' }].map(a => (
              <div key={a.l} className="w-[20px] h-[20px] rounded-full flex items-center justify-center text-[8px] font-bold text-white ring-[1.5px] ring-[#F7F3FF]" style={{ backgroundColor: a.b }}>
                {a.l}
              </div>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold leading-tight text-[#171521]">12 people in your Hub bought today</p>
            <p className="text-[8px] text-[#6B6875] mt-[1px]">See what's trending nearby</p>
          </div>
          <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(110,82,232,0.12)', color: '#4A3AC4' }}>
            <ArrowRight size={9} strokeWidth={2.6} />
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 px-3.5 mb-3">
        <span className="text-[8px] font-semibold px-2 py-[4px] rounded-full text-white" style={{ background: INDIGO_GRAD }}>Filters</span>
        {['For you', 'Newest', 'Nearest'].map(f => (
          <span key={f} className="text-[8px] font-semibold px-2 py-[4px] rounded-full border" style={{ color: c.ink2, borderColor: c.hair, backgroundColor: c.surface }}>{f}</span>
        ))}
      </div>

      {/* Category row */}
      <div className="flex gap-3 px-3.5 mb-3.5">
        {categories.map(cat => (
          <div key={cat.label} className="flex flex-col items-center gap-1 w-[44px]">
            <div
              className="w-[34px] h-[34px] rounded-[12px] flex items-center justify-center"
              style={cat.active
                ? { background: INDIGO_GRAD, color: '#fff' }
                : { backgroundColor: c.surface, color: cat.color, border: `1px solid ${c.hair}` }}
            >
              <cat.Icon size={15} strokeWidth={2.1} />
            </div>
            <span className="text-[7px] font-semibold truncate w-full text-center" style={{ color: cat.active ? c.ink : c.ink2 }}>{cat.label}</span>
          </div>
        ))}
      </div>

      {/* Boosted this week */}
      <div className="flex items-baseline justify-between px-3.5 mb-2">
        <p className="text-[10.5px] font-bold" style={{ color: c.ink }}>Boosted this week</p>
        <span className="text-[8px] font-semibold" style={{ color: c.indigo }}>See all</span>
      </div>
      <div className="flex gap-2.5 px-3.5 mb-3.5">
        {boosted.map(b => (
          <div key={b.title} className="w-[118px] rounded-[16px] overflow-hidden flex-shrink-0 shadow-[0_10px_22px_-8px_rgba(79,60,201,0.22)]" style={{ backgroundColor: c.surface }}>
            <div className="relative h-[86px] flex items-center justify-center" style={{ background: b.grad }}>
              <b.Icon size={30} strokeWidth={1.4} className="text-white/85" />
              <span className="absolute top-1.5 left-1.5 text-[6.5px] font-black uppercase tracking-wide px-1.5 py-[2px] rounded-full text-white" style={{ backgroundColor: 'rgba(184,133,58,0.92)' }}>
                Boosted
              </span>
              <div className="absolute top-1.5 right-1.5 w-[16px] h-[16px] rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center">
                <Heart size={8} className="text-white" strokeWidth={2.4} />
              </div>
              <div className="absolute inset-x-0 bottom-0 h-[34px]" style={{ background: 'linear-gradient(to top, rgba(10,8,20,0.78), transparent)' }} />
              <p className="absolute bottom-1.5 left-2 text-[13px] font-extrabold text-white tabular-nums leading-none">{b.price}</p>
            </div>
            <div className="px-2 py-1.5">
              <p className="text-[8px] font-semibold truncate" style={{ color: c.ink }}>{b.title}</p>
              <p className="text-[7px] mt-[1px] truncate" style={{ color: c.ink3 }}>{b.meta}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Wanted near you — terracotta is reserved for requests */}
      <div className="flex items-baseline justify-between px-3.5 mb-2">
        <p className="text-[10.5px] font-bold" style={{ color: c.ink }}>Wanted near you</p>
      </div>
      <div className="flex gap-2.5 px-3.5">
        {wanted.map(w => (
          <div key={w.title} className="w-[118px] rounded-[14px] p-2.5 flex-shrink-0 shadow-[0_10px_20px_-8px_rgba(217,105,79,0.4)]" style={{ background: TERRA_GRAD }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[6px] font-black uppercase tracking-wider text-white/75">{w.cat}</span>
              {w.urgent && <span className="text-[6px] font-black uppercase px-1.5 py-[1px] rounded-full bg-white/25 text-white">Urgent</span>}
            </div>
            <p className="text-[8.5px] font-bold text-white leading-snug mb-2 line-clamp-2">{w.title}</p>
            <p className="text-[6px] font-black uppercase tracking-wider text-white/65">Max budget</p>
            <p className="text-[13px] font-extrabold text-white tabular-nums leading-none mt-[2px]">{w.budget}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/* ─────────────────────────── REQUESTS ─────────────────────────── */

function RequestsScreen({ c }: { c: C }) {
  const stats = [
    { value: '47', label: 'Open asks' },
    { value: '9', label: 'Fulfilled today' },
    { value: '₹2.1L', label: 'Wanted value' },
  ]

  return (
    <motion.div {...screenMotion} className="h-full overflow-hidden px-3.5">
      <p className="text-[15px] font-extrabold tracking-tight mb-3" style={{ color: c.ink }}>Requests</p>

      {/* Stat band */}
      <div className="rounded-[16px] px-3 py-2.5 flex items-center justify-between mb-3" style={{ backgroundColor: c.surface, border: `1px solid ${c.hair}` }}>
        {stats.map((s, i) => (
          <div key={s.label} className="flex-1 flex flex-col items-center" style={i < 2 ? { borderRight: `1px solid ${c.hair}` } : undefined}>
            <p className="text-[13px] font-extrabold tabular-nums leading-none" style={{ color: i === 2 ? c.terracotta : c.ink }}>{s.value}</p>
            <p className="text-[6.5px] font-bold uppercase tracking-wider mt-1" style={{ color: c.ink3 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category pills with counts */}
      <div className="flex gap-1.5 mb-3">
        <span className="text-[8px] font-bold px-2 py-[4px] rounded-full text-white" style={{ backgroundColor: c.ink }}>All 47</span>
        {[['Electronics', '14'], ['Books', '11'], ['Furniture', '6']].map(([l, n]) => (
          <span key={l} className="text-[8px] font-semibold px-2 py-[4px] rounded-full border" style={{ color: c.ink2, borderColor: c.hair, backgroundColor: c.surface }}>
            {l} {n}
          </span>
        ))}
      </div>

      <p className="text-[10.5px] font-bold mb-2" style={{ color: c.ink }}>Getting the most offers</p>

      <div className="flex flex-col gap-2">
        {requestRows.map(r => (
          <div key={r.title} className="rounded-[14px] p-2.5" style={{ backgroundColor: c.surface, border: `1px solid ${c.hair}` }}>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="text-[9px] font-bold leading-snug flex-1" style={{ color: c.ink }}>{r.title}</p>
              <div className="text-right flex-shrink-0">
                <p className="text-[6px] font-black uppercase tracking-wider" style={{ color: c.ink3 }}>Max</p>
                <p className="text-[12px] font-extrabold tabular-nums leading-none" style={{ color: c.terracotta }}>{r.budget}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-[14px] h-[14px] rounded-full flex items-center justify-center text-[6px] font-bold text-white" style={{ backgroundColor: c.indigo }}>
                  {r.who[0]}
                </span>
                <span className="text-[7.5px] font-semibold" style={{ color: c.ink2 }}>{r.who}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-[3px] text-[7px] font-bold px-1.5 py-[2px] rounded-full" style={{ backgroundColor: c.terracottaTint, color: c.terracotta }}>
                  {r.hot && <Flame size={7} strokeWidth={2.6} />}{r.offers}
                </span>
                <span className="flex items-center gap-[2px] text-[7px]" style={{ color: c.ink3 }}>
                  <Clock size={7} strokeWidth={2.4} />{r.left}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/* ─────────────────────────── MAP + HUB SHEET ─────────────────────────── */

function MapScreen({ c }: { c: C }) {
  const dark = c.bg === '#12101A'
  return (
    <motion.div {...screenMotion} className="h-full relative overflow-hidden">
      {/* Map ground */}
      <div className="absolute inset-0" style={{ backgroundColor: dark ? '#1B1826' : '#EDE7DE' }}>
        {/* Blocks */}
        {[
          { t: '6%', l: '8%', w: '24%', h: '11%' }, { t: '5%', l: '48%', w: '20%', h: '12%' },
          { t: '6%', l: '73%', w: '19%', h: '9%' }, { t: '21%', l: '6%', w: '14%', h: '10%' },
          { t: '20%', l: '24%', w: '16%', h: '13%' }, { t: '22%', l: '72%', w: '20%', h: '11%' },
          { t: '39%', l: '7%', w: '18%', h: '12%' }, { t: '38%', l: '52%', w: '15%', h: '9%' },
          { t: '40%', l: '74%', w: '17%', h: '13%' }, { t: '56%', l: '10%', w: '22%', h: '11%' },
          { t: '57%', l: '52%', w: '14%', h: '10%' }, { t: '58%', l: '72%', w: '18%', h: '12%' },
        ].map((b, i) => (
          <div key={i} className="absolute rounded-[4px]" style={{ top: b.t, left: b.l, width: b.w, height: b.h, backgroundColor: dark ? '#241F31' : '#DED2BE' }} />
        ))}
        {/* A park and a waterway, so the ground reads as a real place */}
        <div className="absolute rounded-[8px]" style={{ top: '22%', left: '42%', width: '15%', height: '13%', backgroundColor: dark ? '#1E2A24' : '#D3E3CC' }} />
        <div className="absolute -rotate-[18deg]" style={{ top: '47%', left: '-10%', width: '130%', height: '9px', backgroundColor: dark ? '#1B2733' : '#D9E4EC' }} />

        {/* Roads — a primary grid plus thinner side streets */}
        {[{ t: '17%' }, { t: '35%' }, { t: '53%' }].map(r => (
          <div key={r.t} className="absolute left-0 right-0" style={{ top: r.t, height: '6px', backgroundColor: dark ? '#2A2537' : '#F7F3EC' }} />
        ))}
        {[{ l: '21%' }, { l: '42%' }, { l: '69%' }].map(r => (
          <div key={r.l} className="absolute top-0 bottom-0" style={{ left: r.l, width: '6px', backgroundColor: dark ? '#2A2537' : '#F7F3EC' }} />
        ))}
        <div className="absolute left-0 right-0" style={{ top: '26%', height: '2.5px', backgroundColor: dark ? '#252030' : '#F2ECE2' }} />
        <div className="absolute top-0 bottom-0" style={{ left: '56%', width: '2.5px', backgroundColor: dark ? '#252030' : '#F2ECE2' }} />
      </div>

      {/* Radius ring + you-are-here */}
      <div className="absolute rounded-full border-[1.5px] border-dashed pointer-events-none"
        style={{ width: 188, height: 188, top: '33%', left: '50%', transform: 'translate(-50%,-50%)', borderColor: 'rgba(110,82,232,0.45)', backgroundColor: 'rgba(110,82,232,0.05)' }} />
      <div className="absolute" style={{ top: '33%', left: '50%', transform: 'translate(-50%,-50%)' }}>
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: 'rgba(110,82,232,0.22)' }}
          animate={{ scale: [1, 2.6, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
        />
        <div className="relative w-[13px] h-[13px] rounded-full ring-[2.5px] ring-white" style={{ backgroundColor: c.indigo }} />
      </div>

      {/* Pins */}
      {mapPins.map((p, i) => (
        <div key={i} className="absolute" style={{ top: p.top, left: p.left }}>
          <div
            className="relative w-[25px] h-[25px] flex items-center justify-center shadow-[0_5px_12px_-3px_rgba(23,21,33,0.4)]"
            style={{
              backgroundColor: p.kind === 'listing' ? c.indigo : c.terracotta,
              borderRadius: '50% 50% 50% 0',
              transform: 'rotate(-45deg)',
            }}
          >
            <p.Icon size={11} strokeWidth={2.2} className="text-white" style={{ transform: 'rotate(45deg)' }} />
            <span
              className="absolute -top-[5px] -right-[5px] w-[13px] h-[13px] rounded-full flex items-center justify-center text-[6.5px] font-bold text-white ring-[1.5px] ring-white"
              style={{ backgroundColor: c.ink, transform: 'rotate(45deg)' }}
            >
              {p.count}
            </span>
          </div>
        </div>
      ))}

      {/* Glass filter strip — note the active state is ink, not indigo */}
      <div className="absolute top-2 left-0 right-0 px-3 flex gap-1.5 z-20">
        <span className="text-[8px] font-bold px-2.5 py-[5px] rounded-full text-white shadow-sm" style={{ backgroundColor: c.ink }}>All Hubs</span>
        {['Electronics', 'Books'].map(f => (
          <span key={f} className="text-[8px] font-semibold px-2.5 py-[5px] rounded-full backdrop-blur-md shadow-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.72)', color: '#171521' }}>{f}</span>
        ))}
      </div>

      {/* Map controls */}
      <div className="absolute right-2.5 top-[22%] flex flex-col gap-1.5 z-20">
        <div className="w-[26px] h-[26px] rounded-full backdrop-blur-md flex items-center justify-center shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.72)', color: '#171521' }}>
          <Crosshair size={12} strokeWidth={2.2} />
        </div>
        <div className="rounded-full backdrop-blur-md flex flex-col items-center shadow-sm overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.72)', color: '#171521' }}>
          <div className="w-[26px] h-[24px] flex items-center justify-center"><PlusIcon size={11} strokeWidth={2.6} /></div>
          <div className="w-[14px] h-px" style={{ backgroundColor: 'rgba(23,21,33,0.14)' }} />
          <div className="w-[26px] h-[24px] flex items-center justify-center"><Minus size={11} strokeWidth={2.6} /></div>
        </div>
      </div>

      {/* Bottom sheet */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-0 right-0 z-30 px-3.5 pt-2 pb-[70px]"
        style={{ backgroundColor: c.surface, borderRadius: '20px 20px 0 0', boxShadow: '0 -12px 40px rgba(23,21,33,0.16)' }}
      >
        <div className="w-[32px] h-[3.5px] rounded-full mx-auto mb-2.5" style={{ backgroundColor: c.hair }} />

        <div className="flex items-center gap-2 mb-1.5">
          <p className="text-[13px] font-bold tracking-tight" style={{ color: c.ink }}>Gachibowli Hub</p>
          <span className="flex items-center gap-1 text-[6.5px] font-black uppercase tracking-wider px-1.5 py-[2px] rounded-full" style={{ backgroundColor: c.emeraldTint, color: c.emerald }}>
            <span className="w-[3px] h-[3px] rounded-full" style={{ backgroundColor: c.emerald }} />Active
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[8px] font-semibold" style={{ color: c.ink2 }}>128 members</span>
          <span className="w-[2.5px] h-[2.5px] rounded-full" style={{ backgroundColor: c.ink3 }} />
          <span className="text-[8px] font-semibold" style={{ color: c.ink2 }}>0.4 km away</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex -space-x-[5px]">
            {[['#6E52E8', 'K'], ['#B34A32', 'N'], ['#1B7A5C', 'S'], ['#7748C4', 'D']].map(([bg, initial]) => (
              <div
                key={initial}
                className="w-[16px] h-[16px] rounded-full flex items-center justify-center text-[7px] font-bold text-white"
                style={{ backgroundColor: bg, border: `1.5px solid ${c.surface}` }}
              >
                {initial}
              </div>
            ))}
          </div>
          <span className="text-[7.5px]" style={{ color: c.ink3 }}>12 members active nearby</span>
        </div>

        {/* Toggle — ink active fill, per the design */}
        <div className="flex gap-1.5 mb-2.5">
          <span className="text-[8px] font-bold px-2.5 py-[4px] rounded-full text-white" style={{ backgroundColor: c.ink }}>Listings (9)</span>
          <span className="text-[8px] font-semibold px-2.5 py-[4px] rounded-full border" style={{ color: c.ink2, borderColor: c.hair }}>Requests (4)</span>
        </div>

        <div className="flex gap-2">
          {sheetPreview.map(s => (
            <div key={s.title} className="w-[80px] rounded-[12px] overflow-hidden flex-shrink-0" style={{ backgroundColor: c.surface, border: `1px solid ${c.hair}` }}>
              <div className="h-[52px] flex items-center justify-center" style={{ background: s.grad }}>
                <s.Icon size={20} strokeWidth={1.5} className="text-white/85" />
              </div>
              <div className="px-1.5 py-1.5">
                <p className="text-[9px] font-extrabold tabular-nums leading-none" style={{ color: c.ink }}>{s.price}</p>
                <p className="text-[6.5px] truncate mt-[2px]" style={{ color: c.ink3 }}>{s.title}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────────────── CHAT + DEAL FLOW ─────────────────────────── */

function ChatScreen({ c }: { c: C }) {
  return (
    <motion.div {...screenMotion} className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pb-2.5 border-b" style={{ borderColor: c.hair }}>
        <ArrowLeft size={13} strokeWidth={2.4} style={{ color: c.ink2 }} />
        <div className="relative">
          <div className="w-[24px] h-[24px] rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: c.indigoTint, color: c.indigoDeep }}>M</div>
          <span className="absolute bottom-0 right-0 w-[7px] h-[7px] rounded-full border-[1.5px]" style={{ backgroundColor: c.emerald, borderColor: c.bg }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10.5px] font-bold leading-tight" style={{ color: c.ink }}>MellowFox</p>
          <p className="text-[7px]" style={{ color: c.emerald }}>Online</p>
        </div>
      </div>

      {/* Pinned listing */}
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ backgroundColor: c.surface2, borderColor: c.hair }}>
        <div className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(150deg,#8A5A2E,#C98B4E)' }}>
          <Armchair size={13} strokeWidth={1.6} className="text-white/85" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[8.5px] font-bold truncate" style={{ color: c.ink }}>Study Table with Chair</p>
          <p className="text-[7.5px] font-semibold" style={{ color: c.ink2 }}>₹3,200 · Active</p>
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1 px-3 py-2.5 flex flex-col gap-2 overflow-hidden">
        <div className="max-w-[72%] self-start rounded-[12px] rounded-bl-[4px] px-2.5 py-1.5" style={{ backgroundColor: c.surface2 }}>
          <p className="text-[8.5px] leading-snug" style={{ color: c.ink }}>Hey, is this still available?</p>
        </div>

        <div className="max-w-[72%] self-end rounded-[12px] rounded-br-[4px] px-2.5 py-1.5" style={{ background: INDIGO_GRAD }}>
          <p className="text-[8.5px] leading-snug text-white">Yes! Want to come see it today?</p>
        </div>

        {/* The deal block — v2's headline capability */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-[88%] self-center rounded-[14px] p-2.5"
          style={{ backgroundColor: c.surface, border: `1.5px solid ${c.indigoTint}` }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-[16px] h-[16px] rounded-full flex items-center justify-center" style={{ backgroundColor: c.indigoTint, color: c.indigo }}>
              <ArrowLeftRightGlyph />
            </span>
            <span className="text-[6.5px] font-black uppercase tracking-wider" style={{ color: c.indigo }}>Price proposed</span>
          </div>

          <p className="text-[8.5px] font-semibold leading-snug mb-2" style={{ color: c.ink }}>
            MellowFox proposed <span className="font-extrabold tabular-nums">₹2,900</span> for this listing.
          </p>

          <div className="flex gap-1.5">
            <div className="flex-1 rounded-[8px] py-[5px] flex items-center justify-center" style={{ backgroundColor: c.emerald }}>
              <span className="text-[8px] font-bold text-white">Accept</span>
            </div>
            <div className="flex-1 rounded-[8px] py-[5px] flex items-center justify-center border" style={{ borderColor: c.hair }}>
              <span className="text-[8px] font-bold" style={{ color: c.ink }}>Counter</span>
            </div>
          </div>

          <p className="text-[7px] text-center mt-1.5" style={{ color: c.emerald }}>You'd save ₹300</p>
        </motion.div>

        {/* Structured pickup details */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.35 }}
          className="max-w-[78%] self-end rounded-[12px] rounded-br-[4px] px-2.5 py-2"
          style={{ background: INDIGO_GRAD }}
        >
          <p className="text-[6.5px] font-black uppercase tracking-wider text-white/70 mb-1">Pickup details</p>
          <p className="text-[8.5px] font-semibold text-white leading-snug">Main gate, Hostel Block C</p>
          <p className="text-[8px] text-white/75 mt-[1px]">Today, 5:00 PM</p>
        </motion.div>

        {/* Safety card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62, duration: 0.35 }}
          className="w-[88%] self-center rounded-[12px] px-2.5 py-2 flex gap-2"
          style={{ backgroundColor: c.emeraldTint }}
        >
          <BadgeCheck size={12} strokeWidth={2.4} style={{ color: c.emerald }} className="flex-shrink-0 mt-[1px]" />
          <div>
            <p className="text-[8px] font-bold leading-tight" style={{ color: c.emerald }}>Meet safely</p>
            <p className="text-[7px] leading-snug mt-[2px]" style={{ color: c.ink2 }}>
              Meet in a public place and check the item before paying.
            </p>
          </div>
        </motion.div>

        {/* Closing exchange */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.74, duration: 0.35 }}
          className="max-w-[72%] self-start rounded-[12px] rounded-bl-[4px] px-2.5 py-1.5"
          style={{ backgroundColor: c.surface2 }}
        >
          <p className="text-[8.5px] leading-snug" style={{ color: c.ink }}>Perfect, see you at 5!</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.86, duration: 0.35 }}
          className="max-w-[72%] self-end flex flex-col items-end"
        >
          <div className="rounded-[12px] rounded-br-[4px] px-2.5 py-1.5" style={{ background: INDIGO_GRAD }}>
            <p className="text-[8.5px] leading-snug text-white">Deal. I'll bring the chair down.</p>
          </div>
          <div className="flex items-center gap-[3px] mt-[3px] pr-[2px]">
            <span className="text-[6.5px]" style={{ color: c.ink3 }}>5:02 PM</span>
            <CheckCheck size={8} strokeWidth={2.6} style={{ color: c.indigo }} />
          </div>
        </motion.div>

        {/* Quick replies */}
        <div className="flex gap-1.5 mt-auto pt-1">
          {['When can we meet?', 'I can come today'].map(q => (
            <span key={q} className="text-[7.5px] font-semibold px-2 py-[4px] rounded-full border whitespace-nowrap" style={{ color: c.ink2, borderColor: c.hair, backgroundColor: c.surface }}>{q}</span>
          ))}
        </div>
      </div>

      {/* Composer */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-t" style={{ borderColor: c.hair }}>
        <ImageIcon size={13} strokeWidth={2.2} style={{ color: c.ink3 }} />
        <Smile size={13} strokeWidth={2.2} style={{ color: c.ink3 }} />
        <div className="flex-1 rounded-full px-2.5 py-[5px]" style={{ backgroundColor: c.surface2 }}>
          <span className="text-[8px]" style={{ color: c.ink3 }}>Message</span>
        </div>
        <div className="w-[24px] h-[24px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: INDIGO_GRAD }}>
          <Send size={11} strokeWidth={2.4} className="text-white" />
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Profile: restored verbatim from v1. Do not modify until asked. ─── */

function ProfileScreen({ isDarkMode }: { isDarkMode: boolean }) {
  const menuSections = [
    {
      title: 'MY ACTIVITY',
      items: [
        { icon: <WalletMenuSvg />, label: 'My Wallet', sub: 'Balance & Payments' },
        { icon: <HeartMenuSvg />, label: 'Wishlist', sub: 'Saved items' },
        { icon: <ClipboardMenuSvg />, label: 'My Listings', sub: 'Manage selling' },
        { icon: <GiftMenuSvg />, label: 'Referrals', sub: 'Invite friends', badge: '3 Credits' },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        { icon: <HelpMenuSvg />, label: 'Help & FAQ' },
        { icon: <BugMenuSvg />, label: 'Report a Bug' },
        { icon: <MailMenuSvg />, label: 'Contact Support' },
      ],
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full overflow-y-auto pb-2 px-3"
      style={{ scrollbarWidth: 'none' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className={`text-[15px] font-extrabold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Profile</p>
        <div className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? "#a1a1aa" : "#18181b"} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
        </div>
      </div>

      {/* Dark Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-3 mb-2"
        style={{ background: 'linear-gradient(135deg, #323235 0%, #131316 40%, #000 100%)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center border-2 border-zinc-600 flex-shrink-0">
            <span className="text-white text-[13px] font-bold">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-extrabold text-white tracking-tight">Arjun H.</p>
            <p className="text-[9px] text-zinc-400 truncate">arjun.sharma@gmail.com</p>
            <div className="mt-1.5 inline-flex items-center gap-1 bg-white/[0.12] rounded-md px-2 py-0.5 border border-white/[0.08]">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="#a1a1aa" stroke="none"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9z" /></svg>
              <span className="text-[7px] font-bold text-white tracking-wide">IIT Hyderabad</span>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fafafa" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          </div>
        </div>
      </motion.div>

      {/* Dark Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center rounded-xl py-2 px-4 mb-2 border border-zinc-800"
        style={{ background: '#111' }}
      >
        <div className="flex-1 text-center">
          <p className="text-[14px] font-black text-white tracking-tight">12</p>
          <p className="text-[7px] font-semibold text-zinc-500 uppercase tracking-wider">Listings</p>
        </div>
        <div className="w-px h-5 bg-white/10" />
        <div className="flex-1 text-center">
          <p className="text-[14px] font-black text-white tracking-tight">8</p>
          <p className="text-[7px] font-semibold text-zinc-500 uppercase tracking-wider">Sold</p>
        </div>
      </motion.div>

      {/* Menu Sections */}
      {menuSections.map((section, sIdx) => (
        <div key={section.title} className="mb-1.5">
          <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-[1.5px] ml-1 mb-1">{section.title}</p>
          <div className={`rounded-xl border overflow-hidden transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'}`}>
            {section.items.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i + 0.2 + sIdx * 0.1 }}
                className={`flex items-center gap-2 px-2.5 py-1.5 transition-colors ${i < section.items.length - 1 ? (isDarkMode ? 'border-b border-zinc-800' : 'border-b border-slate-50') : ''}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-50 text-slate-600'}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[9px] font-semibold transition-colors ${isDarkMode ? 'text-zinc-200' : 'text-slate-900'}`}>{item.label}</p>
                  {'sub' in item && item.sub && <p className="text-[7px] text-zinc-500">{item.sub}</p>}
                </div>
                {'badge' in item && item.badge && (
                  <span className="text-[6px] font-bold text-white bg-primary rounded px-1.5 py-0.5">{item.badge}</span>
                )}
                <svg className="w-2.5 h-2.5 text-zinc-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center pt-1"
      >
        <span className="text-[9px] font-bold text-red-500">Log Out</span>
      </motion.div>
    </motion.div>
  )
}


/* ─── Profile Menu Icon SVGs ─── */

function WalletMenuSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
}

function HeartMenuSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  )
}

function ClipboardMenuSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  )
}

function GiftMenuSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  )
}

function HelpMenuSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function BugMenuSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2l1.88 1.88M14.12 3.88L16 2M9 7.13v-1a3.003 3.003 0 116 0v1" /><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 014-4h4a4 4 0 014 4v3c0 3.3-2.7 6-6 6z" /><path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5" /><path d="M6 13H2" /><path d="M3 21c0-2.1 1.7-3.9 3.8-4" /><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" /><path d="M22 13h-4" /><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </svg>
  )
}

function MailMenuSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  )
}
