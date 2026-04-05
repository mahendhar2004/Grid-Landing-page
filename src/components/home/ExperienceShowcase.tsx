import { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { EyeOff, ShieldCheck, Moon, Lock, UserX, CheckCheck, Droplets, ArrowRight, Calendar, Sun } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const showcaseSlides = [
  {
    id: 'anonymous',
    tag: 'Stealth Mode',
    number: '01',
    title: ['Your Identity.', 'Your Terms.'],
    description: "Grid's signature Anonymous Mode lets you list items without revealing who you are. One toggle, total privacy across the entire campus.",
    icon: EyeOff,
    color: 'from-violet-600/20 to-purple-600/20',
    primary: 'var(--color-primary)'
  },
  {
    id: 'availability',
    tag: 'Campus Planning',
    number: '02',
    title: ['Plan Your.', 'Resale Today.'],
    description: "Set exactly when your gear is ready to go. Whether it's today or the end of the semester, buyers can see your timeline and plan accordingly.",
    icon: Calendar,
    color: 'from-amber-600/20 to-orange-600/20',
    primary: '#f59e0b'
  },
  {
    id: 'security',
    tag: 'Campus Trust',
    number: '03',
    title: ['Absolute Control.', 'Zero Stress.'],
    description: "Privacy isn't a feature; it's the foundation. Manage your visibility, online status, and interaction rules with our granular privacy engine.",
    icon: ShieldCheck,
    color: 'from-emerald-600/20 to-teal-600/20',
    primary: '#10b981'
  },
  {
    id: 'themes',
    tag: 'Visual Soul',
    number: '04',
    title: ['Perfect Focus.', 'Night & Day.'],
    description: "Switch perfectly between our elite themes. Whether you're studying outdoors or browsing in your room late at night, Grid looks stunning.",
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
    <section id="experience" className="py-24 lg:py-48 relative overflow-hidden bg-background transition-colors duration-1000">

      <div className="max-w-7xl mx-auto px-6 relative z-10 mb-20 lg:mb-32">
        <AnimatedSection direction="left">
          <span className="inline-block text-primary font-bold text-sm tracking-widest uppercase mb-4 italic">The Elite Experience</span>
          <h2 className="text-5xl sm:text-7xl font-black text-secondary tracking-tighter leading-[0.9] italic">
            Engineered for the<br />
            <span className="text-primary not-italic">Campus Professional.</span>
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
                          <FeatureTag icon={ShieldCheck} label="Privacy Score" />
                          <FeatureTag icon={CheckCheck} label="Safe Messaging" />
                        </>
                      )}
                      {slide.id === 'themes' && (
                        <>
                          <FeatureTag icon={Moon} label="Night Focus" />
                          <FeatureTag icon={Sun} label="Pure Tone" />
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
                    <div className="relative w-full max-w-[440px] aspect-[4/3] rounded-[48px] border border-white/5 bg-surface shadow-inner overflow-hidden shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-20" />

                      <div className="absolute inset-0 flex items-center justify-center p-8">
                        {slide.id === 'anonymous' && <AnonymousVisual />}
                        {slide.id === 'availability' && <AvailabilityVisual />}
                        {slide.id === 'security' && <SecurityVisual />}
                        {slide.id === 'themes' && <ThemeVisual />}
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
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-full border-4 border-primary/20 flex items-center justify-center mb-4">
          {isAnon ? <UserX size={40} className="text-primary" /> : <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=128&h=128" className="w-full h-full object-cover rounded-full" />}
        </div>
        <p className="text-lg font-black text-secondary italic tracking-tighter">{isAnon ? 'Identity Hidden' : 'Public student profile'}</p>
      </div>
      <button
        onClick={() => setIsAnon(!isAnon)}
        className="px-6 py-2.5 rounded-full bg-primary text-white font-black text-[9px] tracking-widest uppercase hover:shadow-xl hover:shadow-primary/20 transition-all"
      >
        Toggle Stealth
      </button>
    </div>
  )
}

function SecurityVisual() {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-16 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-primary"
        >
          <ShieldCheck size={20} />
          <span className="text-[8px] font-black mt-2 uppercase tracking-tighter">Verified</span>
        </div>
      ))}
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
