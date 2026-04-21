import { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion'
import { 
  EyeOff, ShieldCheck, Moon, Lock, UserX, CheckCheck, Droplets, 
  ArrowRight, Calendar, Sun, MessageCircle, Tag, ArrowLeftRight, 
  CheckCircle2, MapPin, Home, Clock, Send, Zap, BellRing, Search
} from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const showcaseSlides = [
  {
    id: 'chat',
    tag: 'Smart Chat',
    number: '01',
    title: ['Bargain, agree,', 'and close — in chat.'],
    description: "Send an offer. Seller counters. You accept. Share the pickup spot — all without leaving the conversation. Grid's built-in deal flow means no chaotic back-and-forth on WhatsApp.",
    icon: MessageCircle,
    color: 'from-primary/20 to-blue-600/20',
    primary: 'var(--color-primary)'
  },
  {
    id: 'availability',
    tag: 'Pickup Scheduling',
    number: '02',
    title: ['Tell buyers', 'when you\'re free.'],
    description: "Selling your textbook but exams aren't over yet? Set your item as available from a specific date. Buyers see it, plan around it — no awkward 'I\'ll get back to you' messages.",
    icon: Calendar,
    color: 'from-amber-600/20 to-orange-600/20',
    primary: '#f59e0b'
  },
  {
    id: 'requests',
    tag: 'Product Requests',
    number: '03',
    title: ['Can\'t find it?', 'Just request it.'],
    description: "Looking for a specific lab coat, a mini-fridge, or a rare textbook? Post a request. Sellers across the campus get notified and reach out to you if they have it.",
    icon: Zap,
    color: 'from-blue-600/20 to-cyan-600/20',
    primary: '#0ea5e9'
  },
  {
    id: 'anonymous',
    tag: 'Anonymous Mode',
    number: '04',
    title: ['Sell without', 'showing your face.'],
    description: "Don't want your hostel neighbours knowing you're selling your calculator? Go anonymous. List, chat, and close deals — your identity stays hidden until you choose to reveal it.",
    icon: EyeOff,
    color: 'from-violet-600/20 to-purple-600/20',
    primary: 'var(--color-primary)'
  },
  {
    id: 'security',
    tag: 'Privacy Controls',
    number: '05',
    title: ['You control', 'who reaches you.'],
    description: "Hide your online status, control who can message you, and manage exactly how visible you are. Sell on your terms — without feeling exposed or pressured.",
    icon: ShieldCheck,
    color: 'from-emerald-600/20 to-teal-600/20',
    primary: '#10b981'
  },
  {
    id: 'themes',
    tag: 'Dark & Light Mode',
    number: '06',
    title: ['Built for late nights', 'and bright days.'],
    description: "Browsing listings at 2AM before your lab submission? Or outside between lectures? Grid's Dark and Light modes adapt to your environment — sharp, clear, and easy on the eyes.",
    icon: Moon,
    color: 'from-blue-600/20 to-indigo-600/20',
    primary: '#3b82f6'
  }
]

export default function ExperienceShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { scrollXProgress } = useScroll({ container: scrollRef })

  const scaleX = useSpring(scrollXProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <section id="experience" className="pt-24 lg:pt-48 pb-12 lg:pb-20 relative overflow-hidden bg-background transition-colors duration-1000">

      <div className="max-w-7xl mx-auto px-6 relative z-10 mb-20 lg:mb-32">
        <AnimatedSection direction="left">
          <span className="inline-block text-primary font-bold text-sm tracking-widest uppercase mb-4 italic">Built for campus life</span>
          <h2 className="text-5xl sm:text-7xl font-black text-secondary tracking-tighter leading-[0.9] italic">
            Features that actually<br />
            <span className="text-primary not-italic">make sense for students.</span>
          </h2>
        </AnimatedSection>
      </div>

      {/* Large Horizontal Slide Reel */}
      <div className="relative group">

        {/* Subtle Side Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

        <div
          ref={scrollRef}
          className="flex gap-6 lg:gap-12 overflow-x-auto scrollbar-hide px-4 lg:px-[calc((100vw-min(1280px,94vw))/2)] py-10 snap-x snap-mandatory"
        >
          {showcaseSlides.map((slide) => (
            <div
              key={slide.id}
              className="flex-shrink-0 w-[calc(100vw-32px)] lg:w-[1100px] snap-center"
            >
              <div className="relative h-full min-h-[500px] lg:min-h-[600px] p-6 lg:p-20 rounded-[40px] lg:rounded-[64px] border border-border/40 bg-surface/50 backdrop-blur-3xl overflow-hidden group/card shadow-2xl transition-all duration-700 hover:border-primary/20">

                {/* Visual Ambience for each card */}
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} opacity-0 group-hover/card:opacity-30 transition-all duration-1000`} />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-32 items-center">

                  {/* Copy Block */}
                  <div className="space-y-8 lg:space-y-12 order-2 lg:order-1">
                    <div className="space-y-4 lg:space-y-6">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] lg:text-xs font-black italic text-primary tracking-widest uppercase">{slide.number} // {slide.tag}</span>
                      </div>
                      <h3 className="text-3xl lg:text-7xl font-black tracking-tighter leading-[0.95] lg:leading-[0.9] italic whitespace-pre-line">
                        <span className="text-secondary block">{slide.title[0]}</span>
                        <span className="text-primary block">{slide.title[1]}</span>
                      </h3>
                      <p className="text-sm lg:text-lg text-secondary/60 font-medium max-w-md leading-relaxed tracking-tight">
                        {slide.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 lg:gap-4">
                      {slide.id === 'requests' && (
                        <>
                          <FeatureTag icon={Zap} label="Instantly Notify" />
                          <FeatureTag icon={Search} label="Targeted Search" />
                          <FeatureTag icon={BellRing} label="Smart Match" />
                        </>
                      )}
                      {slide.id === 'anonymous' && (
                        <>
                          <FeatureTag icon={EyeOff} label="Masked Avatar" />
                          <FeatureTag icon={Lock} label="Campus Trust" />
                        </>
                      )}
                      {slide.id === 'availability' && (
                        <>
                          <FeatureTag icon={Calendar} label="Planning Sync" />
                          <FeatureTag icon={Droplets} label="Future Resale" />
                        </>
                      )}
                      {slide.id === 'security' && (
                        <>
                          <FeatureTag icon={EyeOff} label="Hide Online Status" />
                          <FeatureTag icon={CheckCheck} label="Read Receipts" />
                        </>
                      )}
                      {slide.id === 'themes' && (
                        <>
                          <FeatureTag icon={Moon} label="Night Focus" />
                          <FeatureTag icon={Sun} label="Pure Tone" />
                        </>
                      )}
                      {slide.id === 'chat' && (
                        <>
                          <FeatureTag icon={Tag} label="Make Offer" />
                          <FeatureTag icon={ArrowLeftRight} label="Counter Offer" />
                          <FeatureTag icon={MapPin} label="Pickup Details" />
                        </>
                      )}
                    </div>

                    <div className="pt-6 lg:pt-10">
                      <button
                        onClick={() => document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex items-center gap-3 text-[10px] lg:text-[11px] font-black text-primary uppercase tracking-[4px] lg:tracking-[5px] hover:translate-x-2 active:scale-95 transition-all duration-500 italic"
                      >
                        Explore {slide.tag} <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Visual Side */}
                  <div className="order-1 lg:order-2 flex justify-center">
                    <div className="relative w-full max-w-[520px] lg:max-w-none lg:w-full min-h-[400px] lg:min-h-[550px] rounded-[48px] border border-white/5 bg-surface shadow-inner overflow-hidden shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-20" />

                      <div className="absolute inset-0 flex items-center justify-center p-4 lg:p-10">
                        {slide.id === 'anonymous' && <AnonymousVisual />}
                        {slide.id === 'availability' && <AvailabilityVisual />}
                        {slide.id === 'requests' && <RequestsVisual />}
                        {slide.id === 'security' && <SecurityVisual />}
                        {slide.id === 'themes' && <ThemeVisual />}
                        {slide.id === 'chat' && <ChatVisual />}
                      </div>

                      {/* Material Overlay */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cinematic Progress Bar */}
        <div className="max-w-7xl mx-auto px-6 mt-16 flex items-center gap-6">
          <div className="flex-1 h-[2px] bg-border/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary shadow-[0_0_15px_var(--color-primary)]"
              style={{ scaleX, originX: 0 }}
            />
          </div>
          <div className="flex gap-4">
            {showcaseSlides.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-border/40" />
            ))}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[5px] text-text-muted opacity-30 italic">Swipe to experience</span>
        </div>

      </div>
    </section>
  )
}

function FeatureTag({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="px-5 py-3 rounded-2xl bg-surface border border-border/60 flex items-center gap-3 transition-colors hover:border-primary/20">
      <Icon size={16} className="text-primary" />
      <span className="text-[11px] font-black text-secondary tracking-tight italic uppercase">{label}</span>
    </div>
  )
}

// ── Visual Assets ─────────────────────────────────────────────────────────────

function AvailabilityVisual() {
  return (
    <div className="flex flex-col items-center gap-10 w-full">
      <div className="w-full space-y-4">
        {[14, 15, 16].map((day) => (
          <div
            key={day}
            className={`flex items-center justify-between p-4 rounded-2xl border ${day === 16 ? 'bg-primary/10 border-primary/40' : 'bg-surface border-border'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${day === 16 ? 'bg-primary text-white' : 'bg-muted text-text-muted'}`}>
                {day}
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${day === 16 ? 'text-primary' : 'text-text-muted'}`}>
                {day === 16 ? 'Available for pickup' : 'Currently in use'}
              </p>
            </div>
            {day === 16 && <Calendar size={16} className="text-primary" />}
          </div>
        ))}
      </div>
    </div>
  )
}

function AnonymousVisual() {
  const [isAnon, setIsAnon] = useState(true)
  return (
    <div className="flex flex-col items-center gap-10 w-full">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-primary/20 flex items-center justify-center mb-6 overflow-hidden bg-muted shadow-2xl">
          {isAnon ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key="anon"
              className="w-full h-full flex items-center justify-center bg-zinc-900"
            >
              <UserX size={48} className="text-primary" />
            </motion.div>
          ) : (
            <motion.img 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key="girl"
              src="/images/girl_avatar.png" 
              className="w-full h-full object-cover" 
            />
          )}
        </div>
        <div className="text-center">
          <p className="text-[20px] font-black text-secondary tracking-tightest italic mb-1 uppercase">
            {isAnon ? 'Identity Hidden' : 'Sanya Malhotra'}
          </p>
          <p className="text-[10px] text-primary font-bold tracking-widest uppercase italic bg-primary/10 px-3 py-1 rounded-full">
            {isAnon ? 'GRID ENCRYPTION ACTIVE' : '3rd Year // IIT Bombay'}
          </p>
        </div>
      </div>

      <button
        onClick={() => setIsAnon(!isAnon)}
        className="px-10 py-4 rounded-full bg-primary text-white font-black uppercase tracking-[3px] text-[10px] italic shadow-2xl shadow-primary/40 active:scale-95 transition-all hover:brightness-110"
      >
        {isAnon ? 'Stealth Mode On' : 'Go Stealth'}
      </button>
    </div>
  )
}

function RequestsVisual() {
  const [items, setItems] = useState([
    { title: 'Mini Fridge', details: 'Looking for 40L+, good condition', icon: <Zap size={10} />, active: true },
    { title: 'Lab Coat', details: 'Size M, white, urgently needed', icon: <Zap size={10} />, active: false },
  ])

  return (
    <div className="flex flex-col gap-6 w-full px-4">
      <div className="p-5 rounded-3xl bg-primary/10 border border-primary/30 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <Search size={14} strokeWidth={3} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-primary italic">active request</span>
        </div>
        <div>
          <h4 className="text-lg font-black text-secondary tracking-tight italic">Engineering Graphics Set</h4>
          <p className="text-[10px] text-text-muted font-medium mt-1">Found 4 potential matching sellers in your hostels</p>
        </div>
        <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-muted relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/20" />
                </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-[8px] font-black text-text-muted">+12</div>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${item.active ? 'bg-surface border-primary/20 shadow-lg' : 'bg-surface/40 border-border opacity-60'}`}>
            <div className="flex flex-col gap-0.5">
              <span className="text-[12px] font-black text-secondary tracking-tight">{item.title}</span>
              <span className="text-[9px] text-text-muted font-medium">{item.details}</span>
            </div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.active ? 'bg-primary text-white' : 'bg-border text-text-muted'}`}>
                {item.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SecurityVisual() {
  const [onlineVisible, setOnlineVisible] = useState(false)
  const [messagingOpen, setMessagingOpen] = useState(true)
  const [profileVisible, setProfileVisible] = useState(true)

  const controls = [
    {
      label: 'Show as Online',
      sub: 'Others can see when you\'re active',
      enabled: onlineVisible,
      toggle: () => setOnlineVisible(p => !p),
    },
    {
      label: 'Read Receipts',
      sub: 'Let others know when you\'ve read',
      enabled: messagingOpen,
      toggle: () => setMessagingOpen(p => !p),
    },
    {
      label: 'Public Profile',
      sub: 'Your listings are discoverable',
      enabled: profileVisible,
      toggle: () => setProfileVisible(p => !p),
    },
  ]

  return (
    <div className="flex flex-col gap-3 w-full">
      {controls.map((c) => (
        <div
          key={c.label}
          className="flex items-center justify-between px-4 py-3 rounded-2xl border border-border/40 bg-surface/60 backdrop-blur-sm"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-black text-secondary tracking-tight">{c.label}</span>
            <span className="text-[9px] text-secondary/40 font-medium">{c.sub}</span>
          </div>
          {/* Toggle pill */}
          <button
            onClick={c.toggle}
            className={`relative w-10 h-5 rounded-full transition-all duration-400 flex-shrink-0 ${c.enabled ? 'bg-emerald-500' : 'bg-border/60'
              }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${c.enabled ? 'left-[22px]' : 'left-0.5'
                }`}
            />
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Chat Visual ───────────────────────────────────────────────────────────────

type ChatMsg =
  | { type: 'text'; text: string; isMe: boolean; time: string }
  | { type: 'offer'; price: number; isMe: boolean; time: string }
  | { type: 'counter'; price: number; isMe: boolean; time: string }
  | { type: 'accept'; price: number; isMe: boolean; time: string }
  | { type: 'pickup'; address: string; timeSlot: string; isMe: boolean; time: string }

const chatScript: ChatMsg[] = [
  { type: 'text', text: 'Hey! Is the MacBook still available?', isMe: false, time: '10:01 AM' },
  { type: 'text', text: 'Yes! Just listed it today.', isMe: true, time: '10:02 AM' },
  { type: 'offer', price: 38000, isMe: false, time: '10:03 AM' },
  { type: 'counter', price: 41000, isMe: true, time: '10:04 AM' },
  { type: 'accept', price: 41000, isMe: false, time: '10:05 AM' },
  { type: 'text', text: 'Deal! When can I collect it?', isMe: false, time: '10:06 AM' },
  { type: 'pickup', address: 'Library Wing, Level 2', timeSlot: 'Today, 4:00 PM', isMe: true, time: '10:07 AM' },
]

function ChatVisual() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [cycle, setCycle] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setVisibleCount(0)
    let i = 0
    const timers: ReturnType<typeof setTimeout>[] = []

    const reveal = () => {
      i++
      setVisibleCount(i)
      if (i < chatScript.length) {
        timers.push(setTimeout(reveal, 900))
      } else {
        timers.push(setTimeout(() => setCycle(c => c + 1), 2800))
      }
    }

    timers.push(setTimeout(reveal, 600))
    return () => timers.forEach(clearTimeout)
  }, [cycle])

  // auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [visibleCount])

  return (
    <div className="flex flex-col w-full h-full max-h-[500px] lg:max-h-[600px] rounded-[40px] overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-2xl transition-all duration-700">
      {/* Chat header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-[#111] flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-primary flex items-center justify-center text-white text-[13px] font-black shadow-lg">R</div>
        <div>
          <p className="text-[13px] font-black text-white tracking-tight">Rahul K.</p>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[9px] text-green-400 font-black uppercase tracking-widest">Active Now</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4 scrollbar-hide">
        <AnimatePresence>
          {chatScript.slice(0, visibleCount).map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}
            >
              {m.type === 'text' ? (
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[12px] font-semibold leading-relaxed ${m.isMe
                    ? 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/20'
                    : 'bg-zinc-800 text-zinc-100 rounded-tl-none'
                  }`}>
                  {m.text}
                  <div className="flex justify-end items-center gap-1.5 mt-1.5 opacity-60">
                    <span className="text-[7px] font-black">{m.time}</span>
                    {m.isMe && <CheckCheck size={10} className="text-white" />}
                  </div>
                </div>
              ) : m.type === 'offer' ? (
                <ChatDealCard
                  gradient="from-indigo-500 to-indigo-700"
                  label="OFFER RECEIVED"
                  icon={<Tag size={12} className="text-white" />}
                  time={m.time}
                  isMe={m.isMe}
                >
                  <p className="text-[18px] font-black text-white leading-none">₹{(m as any).price.toLocaleString()}</p>
                  <p className="text-[8px] text-white/60 font-bold mt-1 uppercase tracking-wider">Buyer's Intention</p>
                </ChatDealCard>
              ) : m.type === 'counter' ? (
                <ChatDealCard
                  gradient="from-amber-500 to-orange-600"
                  label="COUNTER OFFER"
                  icon={<ArrowLeftRight size={12} className="text-white" />}
                  time={m.time}
                  isMe={m.isMe}
                >
                  <p className="text-[18px] font-black text-white leading-none">₹{(m as any).price.toLocaleString()}</p>
                  <p className="text-[8px] text-white/70 font-bold mt-1 uppercase tracking-wider">Your Proposal</p>
                </ChatDealCard>
              ) : m.type === 'accept' ? (
                <ChatDealCard
                  gradient="from-emerald-500 to-emerald-600"
                  label="OFFER ACCEPTED"
                  icon={<CheckCircle2 size={12} className="text-white" />}
                  time={m.time}
                  isMe={m.isMe}
                >
                  <p className="text-[15px] font-black text-white leading-none">Deal Confirmed</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Tag size={12} className="text-white/70" />
                    <p className="text-[18px] font-black text-white">₹{(m as any).price.toLocaleString()}</p>
                  </div>
                </ChatDealCard>
              ) : m.type === 'pickup' ? (
                <ChatDealCard
                  gradient="from-violet-500 to-violet-700"
                  label="PICKUP DETAILS"
                  icon={<MapPin size={12} className="text-white" />}
                  time={m.time}
                  isMe={m.isMe}
                >
                  <div className="flex flex-col gap-2 mt-2.5 p-3 bg-black/20 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                        <Home size={11} className="text-white" />
                      </div>
                      <span className="text-[11px] font-black text-white tracking-tight">{(m as any).address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                        <Clock size={11} className="text-white" />
                      </div>
                      <span className="text-[11px] font-black text-white tracking-tight">{(m as any).timeSlot}</span>
                    </div>
                  </div>
                </ChatDealCard>
              ) : null}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-3 px-4 py-4 border-t border-white/5 bg-[#111] flex-shrink-0">
        <div className="flex-1 bg-zinc-800/80 rounded-2xl px-4 py-2 border border-white/5">
          <span className="text-[11px] text-zinc-500 font-medium">Message Rahul...</span>
        </div>
        <button className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-transform">
          <Send size={14} strokeWidth={3} className="text-white" />
        </button>
      </div>
    </div>
  )
}

function ChatDealCard({
  gradient, label, icon, time, isMe, children
}: {
  gradient: string; label: string; icon: React.ReactNode;
  time: string; isMe: boolean; children: React.ReactNode
}) {
  return (
    <div className="max-w-[82%] w-full">
      <div className={`w-full bg-gradient-to-br ${gradient} rounded-[16px] p-3 shadow-xl border border-white/10 relative overflow-hidden`}>
        <div className="absolute -right-3 -top-3 w-12 h-12 bg-white/10 rounded-full blur-xl" />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
            <span className="text-[7px] font-black text-white/80 uppercase tracking-widest">{label}</span>
          </div>
          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">{icon}</div>
        </div>
        {children}
      </div>
      <div className={`flex items-center gap-1 mt-1 px-1 opacity-50 ${isMe ? 'justify-end' : 'justify-start'}`}>
        <span className="text-[6px] font-bold text-text-muted">{time}</span>
        {isMe && <CheckCheck size={8} className="text-primary" />}
      </div>
    </div>
  )
}

function ThemeVisual() {
  const [themeIndex, setThemeIndex] = useState(1); // 0: Light, 1: Dark

  useEffect(() => {
    const timer = setInterval(() => {
      setThemeIndex((prev) => (prev === 0 ? 1 : 0));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const themes = [
    { name: 'Paper Light', bg: 'bg-white', text: 'text-slate-900', border: 'border-slate-200', accent: 'bg-blue-600', icon: Sun },
    { name: 'Elite Dark', bg: 'bg-slate-950', text: 'text-slate-100', border: 'border-slate-800', accent: 'bg-primary', icon: Moon }
  ];

  const current = themes[themeIndex];

  return (
    <div className="flex flex-col items-center gap-10 w-full px-6">
      <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-[44px] overflow-hidden border-4 bg-background shadow-2xl transition-all duration-1000"
        style={{ borderColor: 'var(--color-border)' }}>

        {/* Mockup UI Morph */}
        <motion.div
          animate={{ backgroundColor: themeIndex === 0 ? '#ffffff' : '#020617' }}
          className="absolute inset-0 p-6 flex flex-col gap-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className={`w-8 h-8 rounded-full ${current.bg} ${current.border} border flex items-center justify-center`}>
              <current.icon size={14} className={themeIndex === 0 ? 'text-blue-600' : 'text-primary'} />
            </div>
            <div className="h-4 w-20 rounded-full bg-border/20 blur-[1px]" />
          </div>

          {[...Array(3)].map((_, i) => (
            <div key={i} className={`p-4 rounded-3xl border transition-colors duration-700 ${current.bg} ${current.border}`}>
              <div className={`w-full h-3 rounded-full mb-3 ${themeIndex === 0 ? 'bg-slate-100' : 'bg-slate-900/50'}`} />
              <div className={`w-[70%] h-2 rounded-full ${themeIndex === 0 ? 'bg-slate-50' : 'bg-slate-900/30'}`} />
            </div>
          ))}

          {/* Action Button */}
          <div className={`mt-auto h-12 rounded-2xl w-full flex items-center justify-center font-black text-[10px] uppercase tracking-widest text-white shadow-xl transition-all duration-700 ${current.accent}`}>
            {current.name}
          </div>
        </motion.div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-border/30 rounded-full" />
      </div>

      <div className="flex gap-3">
        {themes.map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${themeIndex === i ? 'w-6 bg-primary' : 'bg-border/20'}`} />
        ))}
      </div>
    </div>
  )
}
