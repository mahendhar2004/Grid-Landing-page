import { Gift, ArrowRight } from 'lucide-react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useState, useEffect } from 'react'
import AnimatedSection from '../ui/AnimatedSection'

export default function FreeListingBonus() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 22,
    seconds: 14
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev
        if (seconds > 0) { seconds-- } 
        else {
          if (minutes > 0) { minutes--; seconds = 59 } 
          else { if (hours > 0) { hours--; minutes = 59; seconds = 59 } }
        }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-24 lg:py-40 relative overflow-hidden bg-background">
      {/* Cinematic Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_50%,var(--color-primary-soft)_0%,transparent_50%)] opacity-30 mix-blend-screen" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-16 lg:gap-32 items-center">
          
          {/* Left Column: The Message */}
          <AnimatedSection direction="left">
            <div className="space-y-10 lg:space-y-14">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-red-500 text-white font-black text-[10px] uppercase tracking-[4px] shadow-xl shadow-red-500/20">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  Flash Reward Active
                </div>

                <h2 className="text-6xl sm:text-7xl lg:text-[100px] font-black leading-[0.85] tracking-tightest italic text-secondary transition-colors">
                  Your First <br />
                  <span className="text-primary not-italic">Listing is Free.</span>
                </h2>

                <p className="text-xl lg:text-2xl text-text-muted font-medium max-w-xl leading-relaxed transition-colors">
                  We're breaking the ice. Start your journey with zero cost. No fumbles, just straight value.
                </p>
              </div>

              {/* Urgency Hook Strip */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-2 rounded-[32px] bg-surface/40 backdrop-blur-3xl border border-border/40 max-w-2xl group">
                <div className="flex-1 px-8 py-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-[3px] text-text-muted opacity-60">Offer Expires In</span>
                    <div className="flex gap-4 text-2xl font-black text-secondary tabular-nums">
                      <div className="flex flex-col items-center">
                        <span className="leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                        <span className="text-[8px] opacity-40 mt-1 uppercase tracking-widest">Hrs</span>
                      </div>
                      <span className="text-primary animate-pulse">:</span>
                      <div className="flex flex-col items-center">
                        <span className="leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                        <span className="text-[8px] opacity-40 mt-1 uppercase tracking-widest">Min</span>
                      </div>
                      <span className="text-primary animate-pulse">:</span>
                      <div className="flex flex-col items-center">
                        <motion.span key={timeLeft.seconds} className="leading-none">{String(timeLeft.seconds).padStart(2, '0')}</motion.span>
                        <span className="text-[8px] opacity-40 mt-1 uppercase tracking-widest">Sec</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-red-500 uppercase tracking-widest">
                      <span>Limited Batch Left</span>
                      <span>88% Fled</span>
                    </div>
                    <div className="h-1.5 w-full bg-border/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '88%' }}
                        className="h-full bg-gradient-to-r from-red-500 to-orange-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                      />
                    </div>
                  </div>
                </div>

                <motion.a
                  href="#download"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-10 py-8 bg-primary text-white rounded-[24px] font-black text-sm uppercase tracking-[4px] shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 transition-all group-hover:brightness-110"
                >
                  Claim <ArrowRight size={20} />
                </motion.a>
              </div>
            </div>
          </AnimatedSection>

          {/* Right Column: Visual Asset */}
          <div className="relative">
            <AnimatedSection direction="scale" delay={0.2}>
              <div className="relative aspect-square max-w-md mx-auto group/visual">
                {/* Rotating Aura Backdrop */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-indigo-500/10 to-transparent blur-[80px] rounded-full opacity-60"
                />

                {/* The "Free Credit" Card Visual with 3D Perspective Tilt */}
                <Card3D>
                  <div className="relative w-32 h-32 lg:w-44 lg:h-44 rounded-full bg-gradient-to-br from-primary to-indigo-700 flex items-center justify-center shadow-2xl shadow-primary/40 relative z-20 overflow-hidden group/gift">
                    <Gift size={64} className="text-white relative z-10 group-hover/gift:scale-110 group-hover/gift:rotate-6 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover/gift:opacity-100 transition-opacity" />
                    {/* Inner spinning ring */}
                    <div className="absolute inset-0 border-2 border-white/10 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none" />
                  </div>
                  
                  {/* Pulsing rings around gift */}
                  <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full border-2 border-primary/20 scale-[1.3] animate-ping pointer-events-none" />

                  <div className="text-center space-y-4 relative z-10">
                    <div className="text-5xl lg:text-7xl font-black text-secondary tracking-tight transition-colors">₹0 FEE</div>
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] font-black uppercase tracking-[5px] text-text-muted opacity-60">Ready to Redeem</span>
                      <p className="text-[13px] font-black text-red-500 uppercase mt-2 italic animate-pulse">Don't fumble this drop 💀</p>
                    </div>
                  </div>
                </Card3D>

                {/* Floating Micro-labels */}
                <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-10 -right-10 px-6 py-3 rounded-2xl bg-secondary text-primary border border-primary/20 font-black text-xs uppercase tracking-widest shadow-2xl"
                >
                  #1 FREE
                </motion.div>
                <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-10 -left-10 px-6 py-3 rounded-2xl bg-surface text-secondary border border-border font-black text-xs uppercase tracking-widest shadow-2xl"
                >
                  LEGIT DROP
                </motion.div>
              </div>
            </AnimatedSection>
          </div>

        </div>
      </div>
    </section>
  )
}

function Card3D({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseX = useSpring(x, { stiffness: 150, damping: 20 })
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 })

  const rotateX = useTransform(mouseY, [0.5, -0.5], [20, -20])
  const rotateY = useTransform(mouseX, [0.5, -0.5], [-20, 20])

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseXPos = event.clientX - rect.left
    const mouseYPos = event.clientY - rect.top
    const xPct = mouseXPos / width - 0.5
    const yPct = mouseYPos / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="relative z-10 w-full h-full p-10 lg:p-14 rounded-[64px] border border-white/20 bg-surface/80 backdrop-blur-3xl shadow-[0_32px_80px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center gap-12 group/card overflow-hidden"
    >
      <div style={{ transform: 'translateZ(75px)' }} className="flex flex-col items-center gap-12">
        {children}
      </div>
      
      {/* Dynamic Lighting/Glow that follows cursor */}
      <motion.div
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([mx, my]) => `radial-gradient(circle at ${((mx as number) + 0.5) * 100}% ${((my as number) + 0.5) * 100}%, rgba(0,123,255,0.15) 0%, transparent 80%)`
          ),
        }}
        className="absolute inset-0 pointer-events-none"
      />
    </motion.div>
  )
}
