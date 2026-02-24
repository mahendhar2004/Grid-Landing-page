import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion'

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
  { label: 'Home', icon: <HomeSvg />, active: true },
  { label: 'Chat', icon: <ChatSvg />, active: false, badge: 3 },
  { label: 'Sell', icon: <SellSvg />, active: false, primary: true },
  { label: 'List', icon: <ListSvg />, active: false },
  { label: 'Profile', icon: <ProfileSvg />, active: false },
]

/* ─── Notification card data ─── */
const notifications = [
  { icon: <CheckCircleSvg />, bg: 'bg-green-50', iconColor: 'text-green-600', title: 'Sold!', sub: 'HP Laptop • ₹28,000' },
  { icon: <MessageBubbleSvg />, bg: 'bg-blue-50', iconColor: 'text-blue-600', title: 'New Message', sub: '"Is this still available?"' },
  { icon: <StarSvg />, bg: 'bg-amber-50', iconColor: 'text-amber-500', title: '5.0 Rating', sub: 'Trusted Seller' },
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
          <div className="w-full h-full bg-white rounded-[36px] overflow-hidden relative">
            {/* Dynamic Island */}
            <div className="absolute top-0 left-0 right-0 flex justify-center pt-2 z-30">
              <div className="w-[100px] h-[28px] bg-black rounded-full flex items-center justify-center gap-2">
                <div className="w-[8px] h-[8px] rounded-full bg-[#1a1a2e] ring-1 ring-[#333]" />
              </div>
            </div>

            {/* Status bar */}
            <div className="relative z-20 flex justify-between items-center px-6 pt-3 pb-1">
              <span className="text-[10px] font-bold text-slate-900">9:41</span>
              <div className="flex items-center gap-1">
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><rect x="0" y="3" width="2" height="7" rx="0.5" fill="#1a1a1a"/><rect x="3" y="2" width="2" height="8" rx="0.5" fill="#1a1a1a"/><rect x="6" y="1" width="2" height="9" rx="0.5" fill="#1a1a1a"/><rect x="9" y="0" width="2" height="10" rx="0.5" fill="#1a1a1a"/></svg>
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 7.5C3.5 3 10.5 3 13 7.5" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/><circle cx="7" cy="8.5" r="1" fill="#1a1a1a"/></svg>
                <div className="w-[22px] h-[10px] rounded-[3px] border border-slate-900 relative ml-0.5">
                  <div className="absolute inset-[1.5px] right-[3px] bg-green-500 rounded-[1.5px]" />
                  <div className="absolute -right-[2px] top-[2.5px] w-[1.5px] h-[5px] bg-slate-900 rounded-r-sm" />
                </div>
              </div>
            </div>

            {/* Screen content with auto-cycling */}
            <div className="px-0 pt-1 pb-2 flex-1 overflow-hidden h-[calc(100%-100px)]">
              <AnimatePresence mode="wait">
                {activeScreen === 0 && <HomeScreen key="home" />}
                {activeScreen === 1 && <ChatScreen key="chat" />}
                {activeScreen === 2 && <ProfileScreen key="profile" />}
              </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 px-2 pb-4 pt-2">
              <div className="flex justify-around items-center">
                {navItems.map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-0.5 relative">
                    {item.primary ? (
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center -mt-5 shadow-lg shadow-primary/30">
                        {item.icon}
                      </div>
                    ) : (
                      <div className={`w-6 h-6 ${item.active ? 'text-primary' : 'text-slate-400'}`}>
                        {item.icon}
                      </div>
                    )}
                    {item.badge && (
                      <div className="absolute -top-0.5 right-0 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-[7px] text-white font-bold">{item.badge}</span>
                      </div>
                    )}
                    <span className={`text-[8px] font-medium ${item.active ? 'text-primary' : 'text-slate-400'} ${item.primary ? 'mt-0.5' : ''}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              {/* Home indicator */}
              <div className="flex justify-center mt-2">
                <div className="w-[100px] h-[4px] bg-slate-900 rounded-full" />
              </div>
            </div>
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

function HomeScreen() {
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
          <p className="text-[16px] font-extrabold text-slate-900 tracking-tight">
            Grid<span className="text-primary">.</span>
          </p>
          <div className="flex items-center gap-2">
            {/* Search icon */}
            <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
            {/* Notification bell with badge */}
            <div className="relative w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[5px] text-white font-bold">4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter chips row */}
        <div className="flex gap-1.5 mb-2">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
            <span className="text-[8px] font-semibold text-slate-600">Filters</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1">
            <span className="text-[8px] font-semibold text-slate-600">Sort: Relevant</span>
            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>

        {/* Items count */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[8px] font-semibold text-slate-400">24 items</span>
          <div className="flex-1 h-px bg-slate-100" />
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
            <div className="bg-white px-2.5 py-2">
              <p className="text-[10px] font-bold text-slate-900 truncate">{p.title}</p>
              <div className="flex items-center justify-between mt-0.5">
                <div className="flex items-center gap-1">
                  <svg width="7" height="7" viewBox="0 0 24 24" fill="#94a3b8" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                  <span className="text-[7px] text-slate-400">{p.location}</span>
                </div>
                <span className="text-[7px] text-slate-400">{p.time}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function ChatScreen() {
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
      <p className="text-[14px] font-bold text-slate-900 mb-3">Messages</p>
      <div className="flex flex-col gap-2">
        {chats.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.07 * i + 0.1 }}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-[11px] font-bold">{c.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-900">{c.name}</p>
                <span className="text-[8px] text-slate-400">{c.time}</span>
              </div>
              <p className="text-[9px] text-slate-500 truncate">{c.msg}</p>
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

function ProfileScreen() {
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
      className="h-full overflow-y-auto pb-2 px-4"
      style={{ scrollbarWidth: 'none' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[15px] font-extrabold text-slate-900 tracking-tight">Profile</p>
        <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </div>
      </div>

      {/* Dark Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-3.5 mb-2.5"
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
        className="flex items-center rounded-xl py-3 px-4 mb-3 border border-zinc-800"
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
        <div key={section.title} className="mb-2.5">
          <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-[1.5px] ml-1 mb-1">{section.title}</p>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            {section.items.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i + 0.2 + sIdx * 0.1 }}
                className={`flex items-center gap-2 px-2.5 py-2 ${i < section.items.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 text-slate-600">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-semibold text-slate-900">{item.label}</p>
                  {'sub' in item && item.sub && <p className="text-[7px] text-zinc-400">{item.sub}</p>}
                </div>
                {'badge' in item && item.badge && (
                  <span className="text-[6px] font-bold text-white bg-primary rounded px-1.5 py-0.5">{item.badge}</span>
                )}
                <svg className="w-2.5 h-2.5 text-zinc-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
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

/* ─── SVG Icons for bottom nav ─── */

function HomeSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" />
    </svg>
  )
}

function ChatSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-full h-full">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}

function SellSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function ListSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-full h-full">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function ProfileSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-full h-full">
      <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 10-16 0" />
    </svg>
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

function StarSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
