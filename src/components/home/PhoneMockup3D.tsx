import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { Sun, Moon, ArrowLeft, Send, Check, CheckCheck, Tag, CheckCircle2, XCircle, ArrowLeftRight, MapPin, Home, Clock, User } from 'lucide-react'

/* ─── Product data for realistic feed ─── */
const feedProducts = [
  {
    title: 'HP Laptop i5 11th Gen',
    price: '₹28,000',
    category: 'Electronics',
    time: '2h ago',
    location: 'Hostel Block A',
    gradient: 'from-slate-700 to-slate-900',
    seller: 'Rahul K.',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
  },
  {
    title: 'Engineering Physics — Serway',
    price: '₹180',
    category: 'Books',
    time: '5h ago',
    location: 'Library Wing',
    gradient: 'from-blue-600 to-indigo-800',
    seller: 'Priya S.',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop',
  },
  {
    title: 'Study Desk + Chair Combo',
    price: '₹1,200',
    category: 'Furniture',
    time: '1d ago',
    location: 'Gate 2',
    gradient: 'from-amber-600 to-orange-800',
    seller: 'Arun M.',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop',
  },
]

const navItems = [
  { label: 'Home', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.42 4.95-4.95 1.42 1.42-4.95 4.95-1.42Z"/></svg>, active: true },
  { label: 'Chat', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>, active: false, badge: 3 },
  { label: 'Create', icon: null, active: false, primary: true },
  { label: 'MyListings', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 12H3m18-6H3m18 12H3"/></svg>, active: false },
  { label: 'Profile', icon: <User size={20} />, active: false },
]

/* ─── Notification card data ─── */
const notifications = [
  { icon: <CheckCircleSvg />, bg: 'bg-green-50', iconColor: 'text-green-600', title: 'Sold!', sub: 'HP Laptop • ₹28,000' },
  { icon: <MessageBubbleSvg />, bg: 'bg-blue-50', iconColor: 'text-blue-600', title: 'New Message', sub: '"Is this still available?"' },
  { icon: <BellRingSvg />, bg: 'bg-violet-50', iconColor: 'text-violet-600', title: 'Price Drop', sub: 'MacBook Air • ₹42,000' },
  { icon: <UserPlusSvg />, bg: 'bg-pink-50', iconColor: 'text-pink-600', title: 'New Buyer', sub: 'Priya wants your textbook' },
  { icon: <PackageSvg />, bg: 'bg-teal-50', iconColor: 'text-teal-600', title: 'Listed!', sub: 'Calculator • ₹650' },
]

/* Card positions around the phone */
const cardPositions = [
  { className: 'absolute -left-16 top-16 z-20', from: 'left' as const },
  { className: 'absolute -right-12 top-32 z-20', from: 'right' as const },
  { className: 'absolute -left-8 bottom-28 z-20', from: 'left' as const },
]

export default function PhoneMockup3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeScreen, setActiveScreen] = useState(0)
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const [cardSet, setCardSet] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [activeChatUser, setActiveChatUser] = useState<any>(null)
  const [isInConversation, setIsInConversation] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  /* Spring config for smooth follow */
  const springCfg = { stiffness: 150, damping: 20, mass: 0.5 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springCfg)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springCfg)

  /* Floating elements follow mouse with parallax */
  const floatX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), springCfg)
  const floatY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-20, 20]), springCfg)
  const floatX2 = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, -15]), springCfg)
  const floatY2 = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springCfg)

  const handleMouse = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  /* Cycle screen every 4 seconds */
  useEffect(() => {
    const interval = setInterval(() => setActiveScreen(s => (s + 1) % 3), 4000)
    return () => clearInterval(interval)
  }, [])

  /* ─── Staggered card cycle: fade in one-by-one, hold, fade out one-by-one ─── */
  const runCardCycle = useCallback(() => {
    const staggerIn = 500
    const holdTime = 3000
    const staggerOut = 400
    const pauseTime = 1000

    setVisibleCards([0])
    const t1 = setTimeout(() => setVisibleCards([0, 1]), staggerIn)
    const t2 = setTimeout(() => setVisibleCards([0, 1, 2]), staggerIn * 2)

    const outStart = staggerIn * 2 + holdTime
    const t3 = setTimeout(() => setVisibleCards([0, 1]), outStart)
    const t4 = setTimeout(() => setVisibleCards([0]), outStart + staggerOut)
    const t5 = setTimeout(() => setVisibleCards([]), outStart + staggerOut * 2)

    const cycleTime = outStart + staggerOut * 2 + pauseTime
    const t6 = setTimeout(() => {
      setCardSet(prev => (prev + 1) % Math.ceil(notifications.length / 3))
    }, cycleTime)

    return [t1, t2, t3, t4, t5, t6]
  }, [])

  useEffect(() => {
    const timers = runCardCycle()
    return () => timers.forEach(clearTimeout)
  }, [cardSet, runCardCycle])

  /* Get the 3 notifications for the current set */
  const currentNotifs = [
    notifications[(cardSet * 3) % notifications.length],
    notifications[(cardSet * 3 + 1) % notifications.length],
    notifications[(cardSet * 3 + 2) % notifications.length],
  ]

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
      {/* ─── Floating notification cards with staggered cycle ─── */}
      {cardPositions.map((pos, i) => (
        <motion.div
          key={`pos-${i}`}
          className={pos.className}
          style={parallaxStyles[i]}
        >
          <AnimatePresence mode="wait">
            {visibleCards.includes(i) && (
              <motion.div
                key={`card-${cardSet}-${i}`}
                initial={{ opacity: 0, x: pos.from === 'left' ? -30 : 30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: pos.from === 'left' ? -20 : 20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] px-4 py-3 flex items-center gap-3 border border-slate-100/80"
              >
                <div className={`w-9 h-9 ${currentNotifs[i].bg} rounded-full flex items-center justify-center ${currentNotifs[i].iconColor}`}>
                  {currentNotifs[i].icon}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-900">{currentNotifs[i].title}</p>
                  <p className="text-[9px] text-slate-500">{currentNotifs[i].sub}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      {/* ─── 3D Phone ─── */}
      <motion.div
        className="relative z-10"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Phone body */}
        <div className="relative w-[300px] h-[620px] bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-[44px] p-[10px] shadow-[0_25px_60px_rgba(0,0,0,0.15),0_8px_20px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.05)_inset]">
          {/* Side buttons (volume, power) */}
          <div className="absolute -left-[3px] top-[120px] w-[3px] h-[30px] bg-[#2a2a2a] rounded-l-sm" />
          <div className="absolute -left-[3px] top-[170px] w-[3px] h-[50px] bg-[#2a2a2a] rounded-l-sm" />
          <div className="absolute -left-[3px] top-[230px] w-[3px] h-[50px] bg-[#2a2a2a] rounded-l-sm" />
          <div className="absolute -right-[3px] top-[180px] w-[3px] h-[60px] bg-[#2a2a2a] rounded-r-sm" />

          {/* Screen */}
          <div className={`w-full h-full rounded-[36px] overflow-hidden relative transition-colors duration-500 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
            {/* Dynamic Island */}
            <div className="absolute top-0 left-0 right-0 z-30">
              {/* Island pill */}
              <div className="flex justify-center pt-[12px]">
                <div className="w-[90px] h-[24px] bg-black rounded-full flex items-center justify-end pr-[9px]">
                  {/* Camera dot */}
                  <div className="w-[9px] h-[9px] rounded-full bg-[#1c1c1e] ring-[1.5px] ring-[#2a2a2a]" />
                </div>
              </div>

              {/* Status bar — sits beside the island */}
              <div className="flex justify-between items-center px-[18px] -mt-[26px] pb-[6px]">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-semibold tabular-nums ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>9:41</span>
                  {/* Dark mode toggle icon */}
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-0.5 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-amber-400' : 'hover:bg-black/5 text-slate-400'}`}
                  >
                    {isDarkMode ? <Sun size={9} /> : <Moon size={9} />}
                  </button>
                </div>
                {/* Right icons */}
                <div className="flex items-center gap-[5px]">
                  {/* Signal bars */}
                  <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                    <rect x="0"  y="6"   width="3" height="5"  rx="0.8" fill={isDarkMode ? "#FFF" : "#1a1a1a"}/>
                    <rect x="4"  y="3.5" width="3" height="7.5" rx="0.8" fill={isDarkMode ? "#FFF" : "#1a1a1a"}/>
                    <rect x="8"  y="1.5" width="3" height="9.5" rx="0.8" fill={isDarkMode ? "#FFF" : "#1a1a1a"}/>
                    <rect x="12" y="0"   width="3" height="11" rx="0.8" fill={isDarkMode ? "#FFF" : "#1a1a1a"}/>
                  </svg>
                  {/* WiFi — 3 arcs + dot */}
                  <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                    <path d="M1 4.5C3.2 1.7 10.8 1.7 13 4.5" stroke={isDarkMode ? "#FFF" : "#1a1a1a"} strokeWidth="1.4" strokeLinecap="round"/>
                    <path d="M2.8 6.8C4.4 4.8 9.6 4.8 11.2 6.8" stroke={isDarkMode ? "#FFF" : "#1a1a1a"} strokeWidth="1.4" strokeLinecap="round"/>
                    <path d="M4.7 9C5.5 7.8 8.5 7.8 9.3 9" stroke={isDarkMode ? "#FFF" : "#1a1a1a"} strokeWidth="1.4" strokeLinecap="round"/>
                    <circle cx="7" cy="10.2" r="0.9" fill={isDarkMode ? "#FFF" : "#1a1a1a"}/>
                  </svg>
                  {/* Battery */}
                  <div className="relative flex items-center">
                    <div className={`w-[22px] h-[11px] rounded-[3px] border-[1.2px] relative ${isDarkMode ? 'border-white/80' : 'border-slate-800'}`}>
                      <div className="absolute inset-[1.5px] right-[2px] bg-green-500 rounded-[1.5px]" />
                    </div>
                    <div className={`w-[2px] h-[5px] rounded-r-[1px] -ml-[0.5px] ${isDarkMode ? 'bg-white/80' : 'bg-slate-800'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Screen content area */}
            <div className={`px-0 pt-[56px] pb-2 flex-1 overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
              <AnimatePresence mode="wait">
                {activeScreen === 0 && <HomeScreen key="home" isDarkMode={isDarkMode} />}
                {activeScreen === 1 && (
                  isInConversation ? (
                    <ConversationScreen
                      key="convo"
                      user={activeChatUser}
                      isDarkMode={isDarkMode}
                      onBack={() => setIsInConversation(false)}
                    />
                  ) : (
                    <ChatScreen
                      key="chat"
                      isDarkMode={isDarkMode}
                      onSelectChat={(user) => {
                        setActiveChatUser(user)
                        setIsInConversation(true)
                      }}
                    />
                  )
                )}
                {activeScreen === 2 && <ProfileScreen key="profile" isDarkMode={isDarkMode} />}
              </AnimatePresence>
            </div>

            {/* Premium Floating Tab Bar - Hidden when in conversation */}
            {!isInConversation && (
              <div className="absolute bottom-2 left-0 right-0 px-4 z-50 pointer-events-none">
                <div className="flex justify-center relative">
                  {/* The Floating Pill */}
                  <div className={`flex justify-around items-center w-[250px] h-[54px] rounded-full border shadow-2xl transition-all duration-500 overflow-hidden pointer-events-auto ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-zinc-800 to-black border-white/10 shadow-black/40' 
                      : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-slate-200/50'
                  }`}>
                    {navItems.map((item, idx) => {
                      const isActive = activeScreen === (idx === 0 ? 0 : idx === 1 ? 1 : idx === 4 ? 2 : -1)
                      
                      // Spacer for the center FAB
                      if (item.primary) return <div key="fab-spacer" className="w-12" />

                      return (
                        <div key={item.label} className="flex flex-col items-center justify-center relative group p-2">
                          <div className={`transition-all duration-300 ${
                            isActive 
                              ? (isDarkMode ? 'text-white' : 'text-primary scale-110') 
                              : (isDarkMode ? 'text-white/40' : 'text-slate-300')
                          }`}>
                            {item.icon}
                          </div>
                          
                          {/* Active Dot Indicator */}
                          {isActive && (
                            <motion.div 
                              layoutId="navDot"
                              className={`absolute -bottom-1 w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-white' : 'bg-primary'}`}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                          )}

                          {item.badge && item.badge > 0 && (
                            <div className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center px-1">
                              <span className="text-[7px] text-white font-black leading-none">{item.badge}</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Center Floating Action Button (SELL/CREATE) */}
                  <div className="absolute bottom-[4px] left-1/2 -translate-x-1/2 pointer-events-auto">
                    <div className={`w-[44px] h-[44px] rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-xl border-[2.5px] transition-transform hover:scale-105 active:scale-95 ${
                      isDarkMode ? 'border-zinc-800' : 'border-white'
                    }`}>
                      <div className="relative">
                        <div className="w-[14px] h-[2px] bg-white rounded-full" />
                        <div className="w-[2px] h-[14px] bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Visual Home Indicator below pill */}
                <div className="flex justify-center mt-1.5">
                   <div className={`w-12 h-1 rounded-full transition-colors ${isDarkMode ? 'bg-zinc-800' : 'bg-slate-200'}`} />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Screen dots indicator */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {['Home', 'Chat', 'Profile'].map((label, i) => (
          <button
            key={label}
            onClick={() => setActiveScreen(i)}
            className={`h-2 rounded-full transition-all duration-300 ${activeScreen === i ? 'w-6 bg-primary' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── Screen Components ─── */

function HomeScreen({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      {/* ─── Premium Header (matches actual app) ─── */}
      <div className="px-4 mb-2">
        {/* App name + action icons row */}
        <div className="flex items-center justify-between mb-2.5">
          <p className={`text-[16px] font-extrabold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Grid<span className="text-primary">.</span>
          </p>
          <div className="flex items-center gap-2">
            {/* Search icon */}
            <div className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? "#a1a1aa" : "#64748b"} strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
            {/* Notification bell with badge */}
            <div className={`relative w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? "#a1a1aa" : "#64748b"} strokeWidth="2.5" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[5px] text-white font-bold">4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter chips row */}
        <div className="flex gap-1.5 mb-2">
          <div className={`flex items-center gap-1 border rounded-lg px-2 py-1 transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? "#a1a1aa" : "#64748b"} strokeWidth="2.5" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
            <span className={`text-[8px] font-semibold transition-colors ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>Filters</span>
          </div>
          <div className={`flex items-center gap-1 border rounded-lg px-2 py-1 transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-100'}`}>
            <span className={`text-[8px] font-semibold transition-colors ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>Sort: Relevant</span>
            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? "#a1a1aa" : "#64748b"} strokeWidth="3" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>

        {/* Items count */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[8px] font-semibold text-slate-400">24 items</span>
          <div className={`flex-1 h-px transition-colors ${isDarkMode ? 'bg-zinc-800' : 'bg-slate-100'}`} />
        </div>
      </div>

      {/* ─── Product Feed (single column, full-bleed cards) ─── */}
      <div className="px-3 flex flex-col gap-2.5 overflow-hidden">
        {feedProducts.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i + 0.15 }}
            className="relative rounded-2xl overflow-hidden shadow-sm"
          >
            {/* Product image area with gradient overlay */}
            <div className={`h-[110px] bg-gradient-to-br ${p.gradient} relative`}>
              {/* Product image */}
              <img src={p.image} alt={p.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              {/* Top gradient for category badge readability */}
              <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/40 to-transparent" />
              {/* Bottom gradient for price readability */}
              <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/70 to-transparent" />

              {/* Category badge - top left */}
              <span className="absolute top-2 left-2 text-[7px] font-bold text-white bg-white/20 backdrop-blur-sm rounded-md px-1.5 py-0.5">
                {p.category}
              </span>

              {/* Heart / save button - top right */}
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              </div>

              {/* Price - bottom left */}
              <p className="absolute bottom-2 left-2.5 text-[13px] font-extrabold text-white drop-shadow-sm">
                {p.price}
              </p>

              {/* Chat button - bottom right */}
              <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
            </div>

            {/* Product info row below image */}
            <div className={`px-2.5 py-2 transition-colors ${isDarkMode ? 'bg-zinc-900 border-t border-zinc-800' : 'bg-white'}`}>
              <p className={`text-[10px] font-bold truncate transition-colors ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>{p.title}</p>
              <div className="flex items-center justify-between mt-0.5">
                <div className="flex items-center gap-1">
                  <svg width="7" height="7" viewBox="0 0 24 24" fill={isDarkMode ? "#71717a" : "#94a3b8"} stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                  <span className={`text-[7px] transition-colors ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{p.location}</span>
                </div>
                <span className={`text-[7px] transition-colors ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{p.time}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function ConversationScreen({ user, isDarkMode, onBack }: { user: any, isDarkMode: boolean, onBack: () => void }) {
  const messages = [
    { text: "Hey! Is the laptop still available?", isMe: false, time: "10:02 AM", read: true },
    { text: "Yes it is! Multiple people are asking though.", isMe: true, time: "10:03 AM", read: true },
    { type: 'offer', price: 25000, isMe: false, time: "10:03 AM", read: true, status: 'pending' },
    { text: "Could you do ₹27,000? It's in mint condition.", isMe: true, time: "10:05 AM", read: true },
    { type: 'counter', price: 27000, isMe: true, time: "10:05 AM", read: true, status: 'pending' },
    { type: 'fee', fee: 149, isMe: false, time: "10:06 AM", read: true },
    { type: 'accept', price: 27000, isMe: false, time: "10:08 AM", read: true },
    { text: "Perfect! Where can I collect it?", isMe: false, time: "10:09 AM", read: true },
    { type: 'pickup', address: "Library Wing, Level 2", timeSlot: "Today, 4:00 PM", isMe: true, time: "10:10 AM", read: true },
    { text: "See you there! Thanks.", isMe: false, time: "10:11 AM", read: true },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-40 flex flex-col h-full"
    >
      {/* Header */}
      <div className={`px-4 py-3 flex items-center gap-3 border-b transition-colors ${isDarkMode ? 'bg-black border-zinc-800' : 'bg-white border-slate-100'}`}>
        <button onClick={onBack} className={`p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-600'}`}>
          <ArrowLeft size={16} strokeWidth={2.5} />
        </button>
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${user?.color || 'from-primary to-blue-600'} flex items-center justify-center flex-shrink-0 shadow-sm text-white text-[10px] font-bold`}>
          {user?.avatar || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[11px] font-bold truncate transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'User'}</p>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[7px] text-green-500 font-bold uppercase tracking-wider">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide">
        {messages.map((m: any, i) => (
          <div key={i} className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}>
            {m.type === 'offer' || m.type === 'counter' || m.type === 'accept' || m.type === 'pickup' || m.type === 'fee' ? (
              <div className="max-w-[82%] w-full">
                <DealCard type={m.type} data={m} isMe={m.isMe} />
                <div className={`flex items-center justify-end gap-1 mt-1 opacity-50 px-1`}>
                  <span className="text-[6px] font-bold tabular-nums transition-colors duration-300" style={{ color: isDarkMode ? '#888' : '#64748b' }}>{m.time}</span>
                  {m.isMe && (
                    m.read ? <CheckCheck size={8} className="text-primary" /> : <Check size={8} className="text-zinc-400" />
                  )}
                </div>
              </div>
            ) : (
              <div className={`max-w-[85%] px-3 py-2 rounded-2xl relative ${
                m.isMe
                  ? 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/10'
                  : (isDarkMode ? 'bg-zinc-800 text-zinc-100 rounded-tl-none' : 'bg-slate-100 text-slate-800 rounded-tl-none')
              }`}>
                <p className="text-[10px] leading-[1.4] font-medium">{m.text}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 opacity-70`}>
                  <span className="text-[6px] font-bold tabular-nums">{m.time}</span>
                  {m.isMe && (
                    m.read ? <CheckCheck size={8} className="text-white" /> : <Check size={8} className="text-white" />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className={`p-3 border-t transition-colors ${isDarkMode ? 'bg-black border-zinc-800' : 'bg-white border-slate-100'}`}>
        <div className={`flex items-center gap-2 rounded-2xl px-3 py-2 transition-colors ${isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-slate-50 border border-slate-100'}`}>
          <input
            type="text"
            placeholder="Type a message..."
            readOnly
            className="flex-1 bg-transparent border-none text-[10px] placeholder:text-zinc-500 focus:outline-none"
          />
          <button className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/20">
            <Send size={10} strokeWidth={3} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function DealCard({ type, data, isMe }: { type: string, data: any, isMe: boolean }) {
  let gradient = 'from-zinc-700 to-zinc-900'
  let label = ''
  let IconComp: any = Tag
  let content = null

  if (type === 'offer') {
    gradient = 'from-indigo-500 to-indigo-700'
    label = 'OFFER RECEIVED'
    IconComp = Tag
    content = (
      <>
        <p className="text-[16px] font-black text-white leading-tight">₹{data.price.toLocaleString()}</p>
        <p className="text-[6px] font-bold text-white/60 mt-0.5">Respond via the action bar</p>
      </>
    )
  } else if (type === 'counter') {
    gradient = 'from-amber-500 to-amber-600'
    label = 'COUNTER OFFER'
    IconComp = ArrowLeftRight
    content = (
      <>
        <p className="text-[16px] font-black text-white leading-tight">₹{data.price.toLocaleString()}</p>
        <p className="text-[6px] font-bold text-white/70 mt-0.5">{isMe ? 'Your counter offer' : 'Seller proposed this price'}</p>
      </>
    )
  } else if (type === 'accept') {
    gradient = 'from-emerald-500 to-emerald-600'
    label = 'OFFER ACCEPTED'
    IconComp = CheckCircle2
    content = (
      <>
        <p className="text-[14px] font-black text-white leading-tight">Deal Confirmed</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Tag size={10} className="text-white/70" />
          <p className="text-[16px] font-bold text-white">₹{data.price.toLocaleString()}</p>
        </div>
      </>
    )
  } else if (type === 'pickup') {
    gradient = 'from-violet-500 to-violet-600'
    label = 'PICKUP DETAILS'
    IconComp = MapPin
    content = (
      <div className="flex flex-col gap-1.5 mt-2 p-2 bg-black/20 rounded-xl">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center">
            <Home size={10} className="text-white" />
          </div>
          <span className="text-[9px] font-bold text-white truncate">{data.address}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center">
            <Clock size={10} className="text-white" />
          </div>
          <span className="text-[9px] font-bold text-white">{data.timeSlot}</span>
        </div>
      </div>
    )
  } else if (type === 'fee') {
    gradient = 'from-zinc-800 to-zinc-950 border-white/5'
    label = 'GRID TRUST FEE'
    IconComp = CheckCircle2
    content = (
      <div className="flex items-center justify-between mt-1">
        <div>
          <p className="text-[14px] font-black text-white leading-tight">₹{data.fee}</p>
          <p className="text-[6px] font-bold text-white/40 mt-0.5 uppercase tracking-wide">Platform Protection</p>
        </div>
        <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">
          <span className="text-[7px] font-bold text-green-400">SECURE DEAL</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full bg-gradient-to-br ${gradient} rounded-[20px] p-3 shadow-xl border border-white/10 relative overflow-hidden transition-all duration-500 hover:scale-[1.02]`}>
      {/* Decorative glass effect */}
      <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-4 -bottom-4 w-12 h-12 bg-black/10 rounded-full blur-xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-white/30 animate-pulse" />
          <span className="text-[7px] font-black text-white/80 uppercase tracking-[1.5px]">{label}</span>
        </div>
        <div className={`w-5 h-5 rounded-full bg-white/20 flex items-center justify-center`}>
          <IconComp size={10} className="text-white" />
        </div>
      </div>
      {content}
      {data.status === 'declined' && (
        <div className="mt-2 inline-flex items-center gap-1 bg-red-500/30 border border-red-500/20 rounded-full px-2 py-0.5">
          <XCircle size={8} className="text-white" />
          <span className="text-[7px] font-black text-white uppercase tracking-wider">Declined</span>
        </div>
      )}
    </div>
  )
}

function ChatScreen({ isDarkMode, onSelectChat }: { isDarkMode: boolean, onSelectChat: (user: any) => void }) {
  const chats = [
    { name: 'Rahul K.', msg: 'Is the laptop still available?', time: '2m', avatar: 'R', color: 'from-blue-400 to-blue-600', unread: 2 },
    { name: 'Priya S.', msg: 'Can we meet at canteen?', time: '15m', avatar: 'P', color: 'from-pink-400 to-rose-500', unread: 0 },
    { name: 'Arun M.', msg: 'Thanks! Deal done', time: '1h', avatar: 'A', color: 'from-emerald-400 to-green-600', unread: 0 },
    { name: 'Sneha R.', msg: 'What about ₹500?', time: '2h', avatar: 'S', color: 'from-amber-400 to-orange-500', unread: 1 },
    { name: 'Vikram P.', msg: 'Sent you the location', time: '3h', avatar: 'V', color: 'from-violet-400 to-purple-600', unread: 0 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="px-4"
    >
      <p className={`text-[14px] font-bold mb-3 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Messages</p>
      <div className="flex flex-col gap-2">
        {chats.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.07 * i + 0.1 }}
            onClick={() => onSelectChat(c)}
            className={`flex items-center gap-2.5 p-2 rounded-xl transition-colors cursor-pointer ${isDarkMode ? 'hover:bg-zinc-900' : 'hover:bg-slate-50'}`}
          >
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <span className="text-white text-[11px] font-bold">{c.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-[10px] font-bold transition-colors ${isDarkMode ? 'text-zinc-200' : 'text-slate-900'}`}>{c.name}</p>
                <span className={`text-[8px] transition-colors ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{c.time}</span>
              </div>
              <p className={`text-[9px] truncate transition-colors ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{c.msg}</p>
            </div>
            {c.unread > 0 && (
              <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[7px] text-white font-bold">{c.unread}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

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
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? "#a1a1aa" : "#18181b"} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
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
              <svg width="8" height="8" viewBox="0 0 24 24" fill="#a1a1aa" stroke="none"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9z"/></svg>
              <span className="text-[7px] font-bold text-white tracking-wide">IIT Hyderabad</span>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fafafa" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
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
                <svg className="w-2.5 h-2.5 text-zinc-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
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


/* ─── Notification Icon SVGs ─── */

function CheckCircleSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
    </svg>
  )
}

function MessageBubbleSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}


function BellRingSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}

function UserPlusSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  )
}

function PackageSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
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
