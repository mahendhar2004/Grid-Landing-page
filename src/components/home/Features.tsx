import { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { features } from '../../data/features'
import AnimatedSection from '../ui/AnimatedSection'
import { ChevronRight } from 'lucide-react'

export default function Features() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      checkScroll()
      return () => el.removeEventListener('scroll', checkScroll)
    }
  }, [])

  return (
    <section id="features" className="pt-12 lg:pt-20 pb-24 lg:pb-60 relative overflow-hidden bg-background transition-colors duration-1000">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 mb-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <AnimatedSection direction="left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 font-bold text-[10px] uppercase tracking-tighter">
              <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              The Grid Advantage
            </div>
            <h2 className="text-5xl sm:text-7xl font-black text-secondary tracking-tighter leading-[0.9] italic">
              Engineered for<br />
              <span className="text-primary not-italic">Campus Life.</span>
            </h2>
          </AnimatedSection>

          <AnimatedSection direction="right" className="max-w-md">
            <p className="text-text-muted text-lg font-medium leading-relaxed italic opacity-80">
              Every feature is built specifically for the chaos, timing, and needs of a student. No generic marketplace bloat—just sheer utility.
            </p>
          </AnimatedSection>
        </div>
      </div>

      {/* Premium Horizontal Reel */}
      <div className="relative group">
        
        {/* Scroll Fades */}
        <div className={`absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none transition-opacity duration-500 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none transition-opacity duration-500 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />

        <motion.div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide px-6 lg:px-[calc((100vw-min(1280px,94vw))/2)] py-10 snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.6 }}
              className="flex-shrink-0 w-[300px] sm:w-[380px] snap-center"
            >
              <div className="group/card relative h-full p-8 rounded-[40px] bg-surface border border-border/40 transition-all duration-700 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden">
                
                {/* Visual Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 rounded-full" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-14 h-14 rounded-2xl bg-surface border border-border/60 shadow-inner flex items-center justify-center mb-8 group-hover/card:scale-110 group-hover/card:border-primary/20 transition-all duration-500">
                    <feature.icon size={26} strokeWidth={1.5} className="text-primary drop-shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.3)]" />
                  </div>

                  <h3 className="text-2xl font-black text-secondary tracking-tight mb-4 italic transition-colors group-hover/card:text-primary">
                    {feature.title}
                  </h3>

                  <p className="text-text-muted text-[15px] leading-relaxed font-medium transition-colors group-hover/card:text-text italic opacity-80 group-hover/card:opacity-100">
                    {feature.description}
                  </p>

                  <button 
                    onClick={() => document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' })}
                    className="mt-auto pt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover/card:opacity-100 transition-all duration-500 translate-y-2 group-hover/card:translate-y-0 active:scale-95 cursor-pointer"
                  >
                    Learn More <ChevronRight size={12} />
                  </button>
                </div>

                {/* Material Texture */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
              </div>
            </motion.div>
          ))}
          
          {/* Spacer for end scroll */}
          <div className="flex-shrink-0 w-20 sm:w-40" />
        </motion.div>

        {/* Scroll Progress Dash */}
        <div className="max-w-7xl mx-auto px-6 mt-12 flex items-center gap-4">
          <div className="h-[2px] flex-1 bg-border/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              style={{
                width: '100%',
                scaleX: useSpring(useTransform(useScroll({ container: scrollRef }).scrollXProgress, [0, 1], [0.05, 1]), { stiffness: 100, damping: 30 })
              }}
            />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[4px] text-text-muted opacity-30 italic">Swipe to explore</span>
        </div>

      </div>
    </section>
  )
}
