import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Banknote, Cpu, Zap, Bike, Box, Sparkles } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const useCases = [
  {
    year: "Year 4 • The Big Payout",
    title: "Monetize the Exit.",
    description: "Don't just leave your room—liquidate it. Your books, your cycle, your whole room setup. Sell it all to the juniors and walk out with a pocket full of cash for your post-college life.",
    icon: Banknote,
    gradient: "from-amber-600/30 to-yellow-600/30",
    tags: ["💰 Instant Cashout", "Room Liquidation", "Flip to Earn"]
  },
  {
    year: "Year 3 • The Pro-Tech Flip",
    title: "Finish, Sell, Repeat.",
    description: "Finished your robotics project? Don't let that 4k monitor or specialized GPU gather dust. Flip your high-value tech back into cash to fund your next big move or internship.",
    icon: Cpu,
    gradient: "from-blue-600/30 to-indigo-600/30",
    tags: ["Tech Earning", "Flip Potential", "High ROI"]
  },
  {
    year: "Year 2 • The Comfort Upgrade",
    title: "Sell Your Old Grind.",
    description: "Hostel life evolving? Sell your first kettle or mini-stove to the next batch. On Grid, what you bought for comfort is just cash waiting to be unlocked.",
    icon: Zap,
    gradient: "from-rose-600/30 to-pink-600/30",
    tags: ["Unlock Value", "Hostel Flip", "Cashback"]
  },
  {
    year: "Year 2 • The Social Swap",
    title: "Earn as You Move.",
    description: "Bought a cycle or a beast speaker and don't need it anymore? Sell it in minutes to a junior who is just starting their campus social era. Turn your gear into currency.",
    icon: Bike,
    gradient: "from-orange-600/30 to-rose-600/30",
    tags: ["Instant Sale", "Liquid Assets", "Social Cash"]
  },
  {
    year: "Year 1 • The Smart Start",
    title: "Join the Economy.",
    description: "Start smart—buy it for cheap, and know you'll sell it for the same price later. Every rupee spent on Grid is protected by the campus resale economy. Buy, Use, Sell.",
    icon: Box,
    gradient: "from-emerald-600/30 to-teal-600/30",
    tags: ["Resale Ready", "Smart Buy", "Flip Circle"]
  },
  {
    year: "Orientation • The First Hook",
    title: "Earn Day One.",
    description: "Got extra orientation kits or stuff you don't need? Sell it on day one. Start your college life as a seller and set the tone for your campus bank account.",
    icon: Sparkles,
    gradient: "from-blue-600/30 to-emerald-600/30",
    tags: ["First Earning", "Grid Wallet", "Hostel Hustle"]
  }
]

export default function UseCases() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  })

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1])
  const opacityLine = useTransform(scrollYProgress, [0, 0.05], [0, 1])
  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  return (
    <section ref={containerRef} id="use-cases" className="py-24 lg:py-60 relative overflow-hidden bg-background transition-colors duration-1000">
      
      {/* Floating Cash Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.4]">
        {[...Array(12)].map((_, i) => (
          <motion.div
             key={i}
             animate={{ 
               y: [0, -40, 0], 
               x: [0, 15, 0],
               opacity: [0.2, 0.5, 0.2]
             }}
             transition={{ 
               duration: 5 + i, 
               repeat: Infinity, 
               ease: "easeInOut" 
             }}
             className="absolute w-2 h-2 rounded-full border border-primary/20"
             style={{ 
               top: `${(i * 15) % 100}%`, 
               left: `${(i * 24) % 100}%` 
             }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        
        <div className="text-center mb-52">
          <AnimatedSection>
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8 font-medium backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[4px] leading-none">The Earning Engine</span>
            </div>
            <motion.h2 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="text-5xl sm:text-8xl font-black leading-[0.9] tracking-tighter mb-12 text-secondary italic"
            >
              Don't Just Exit.<br />
              <span className="text-primary not-italic">Cash Out.</span>
            </motion.h2>
          </AnimatedSection>
        </div>

        <div className="relative">
          {/* Liquid Flow Path (Ultra Premium Gold Flow) */}
          <motion.div 
            style={{ opacity: opacityLine }}
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1px] bg-border/10 hidden lg:block z-0"
          >
            <motion.div 
              className="absolute top-0 left-[-1px] right-[-1px] bg-gradient-to-b from-primary/0 via-primary to-primary/0 origin-top"
              style={{ height: "100%", scaleY: pathLength, boxShadow: '0 0 30px var(--color-primary)' }}
            />
            {/* The Liquid Gold Pulse */}
            <motion.div 
              style={{ top: glowY }}
              className="absolute left-1/2 -translate-x-1/2 w-6 h-64 bg-gradient-to-b from-primary via-primary/50 to-transparent blur-3xl opacity-60"
            />
          </motion.div>

          <div className="space-y-64 relative z-10">
            {useCases.map((useCase, index) => {
              const isEven = index % 2 === 0
              return (
                <div key={`${useCase.year}-${index}`} className="relative group">
                  
                  {/* Premium Year Node */}
                  <div className="absolute left-1/2 -translate-x-1/2 -top-16 hidden lg:flex flex-col items-center gap-3 z-20">
                    <div className="p-1.5 rounded-full bg-surface border border-primary/20 shadow-2xl backdrop-blur-xl group-hover:border-primary transition-colors duration-500">
                      <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_var(--color-primary)]" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[5px] text-text-muted opacity-30 bg-background px-3 transition-opacity group-hover:opacity-100 italic">{useCase.year}</span>
                  </div>
                  
                  <div className={`flex flex-col lg:flex-row items-center gap-16 lg:gap-48 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                    
                    {/* Material Text Tile */}
                    <div className="flex-1 w-full lg:max-w-md">
                      <AnimatedSection direction={isEven ? 'left' : 'right'}>
                        <div className={`${isEven ? 'lg:text-right' : 'lg:text-left'} space-y-6`}>
                          <motion.h3 
                            className="text-4xl sm:text-6xl font-black text-secondary leading-none tracking-tighter italic"
                            whileHover={{ skewX: -5 }}
                          >
                            {useCase.title}
                          </motion.h3>
                          <p className="text-text-muted text-base sm:text-lg leading-relaxed font-semibold italic opacity-80">
                            {useCase.description}
                          </p>
                          <div className={`flex flex-wrap gap-4 pt-6 ${isEven ? 'justify-end' : 'justify-start'}`}>
                            {useCase.tags.map(tag => (
                              <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-primary border-l-2 border-primary/20 pl-2">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </AnimatedSection>
                    </div>

                    {/* Material Glass Visual */}
                    <div className="flex-1 w-full max-w-[320px]">
                      <AnimatedSection direction={isEven ? 'right' : 'left'}>
                        <motion.div 
                          whileHover={{ rotateY: isEven ? -10 : 10, rotateX: 5, y: -10 }}
                          className={`relative aspect-[4/3] rounded-[48px] overflow-hidden border p-10 flex items-center justify-center transition-all duration-700 bg-gradient-to-br ${useCase.gradient} border-white/5 shadow-3xl group-hover:shadow-primary/20`}
                        >
                          {/* Inner Radiant Core */}
                          <div className="absolute inset-0 bg-surface/30 backdrop-blur-3xl" />
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
                          
                          <div className="relative z-10 w-24 h-24 bg-surface/90 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl flex items-center justify-center ring-4 ring-primary/5">
                             <useCase.icon size={44} strokeWidth={1.2} className="text-primary drop-shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]" />
                          </div>

                          {/* Orbiting Shine */}
                          <motion.div 
                             animate={{ rotate: 360 }}
                             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                             className="absolute inset-[-50%] border-2 border-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </motion.div>
                      </AnimatedSection>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Minimal Footer Signature */}
        <div className="mt-64 text-center">
          <AnimatedSection>
             <span className="text-[11px] font-black uppercase tracking-[12px] text-text-muted opacity-20 italic">
              Fund your campus lifestyle.
            </span>
          </AnimatedSection>
        </div>

      </div>
    </section>
  )
}
