import { motion } from 'framer-motion'
import { ArrowDown, Instagram } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import PhoneMockup3D from './PhoneMockup3D'

/* ── Looping shimmer keyframe injected once ── */
const shimmerStyle = `
@keyframes shimmer-loop {
  0%   { transform: translateX(-120%) skewX(-12deg); }
  100% { transform: translateX(220%)  skewX(-12deg); }
}
@keyframes aura-pulse {
  0%,100% { opacity: 0.35; transform: scale(1);    }
  50%      { opacity: 0.15; transform: scale(1.18); }
}
@keyframes aura-pulse-slow {
  0%,100% { opacity: 0.18; transform: scale(1);    }
  50%      { opacity: 0.06; transform: scale(1.32); }
}
.shimmer-loop::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.28) 50%, transparent 80%);
  animation: shimmer-loop 2.6s cubic-bezier(0.4,0,0.6,1) infinite;
  pointer-events: none;
}
.aura-ring-1 {
  animation: aura-pulse      2.4s ease-in-out infinite;
}
.aura-ring-2 {
  animation: aura-pulse-slow 2.4s ease-in-out 0.8s infinite;
}
`

export default function Hero() {
  return (
    <section className="relative pt-20 pb-12 lg:pt-28 lg:pb-16 overflow-hidden transition-colors duration-500">
      <style>{shimmerStyle}</style>

      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.08] rounded-full blur-[140px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/[0.05] rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 items-center">

          {/* Text */}
          <div>
            <AnimatedSection>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 transition-colors">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[2px] leading-none">Grid v2 — Coming Soon</span>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.05}>
              <h1 className="text-[44px] sm:text-6xl lg:text-[80px] font-black leading-[0.95] sm:leading-[1] tracking-tighter text-secondary mb-6 transition-colors italic">
                Nobody here<br />
                <span className="bg-gradient-to-r from-primary via-primary-bright to-primary bg-clip-text text-transparent not-italic">is a stranger.</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <p className="text-lg sm:text-xl text-text-muted max-w-[500px] mb-10 leading-relaxed transition-colors">
                Grid v2 verifies you by your college or work email and puts you in your Hub — a marketplace made only of people from your campus or your office. Buy, sell and request from your own crowd.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <div className="flex flex-row items-center gap-3 sm:gap-5 flex-wrap">

                {/* ── Primary CTA — scroll into the story ── */}
                <div className="relative">
                  {/* Pulsing aura rings */}
                  <span className="aura-ring-1 absolute inset-0 rounded-[22px] bg-primary blur-[18px] pointer-events-none" />
                  <span className="aura-ring-2 absolute -inset-2 rounded-[28px] bg-primary/60 blur-[28px] pointer-events-none" />

                  <motion.a
                    href="#hubs"
                    whileHover={{ scale: 1.04, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                    className="shimmer-loop relative flex items-center gap-3 sm:gap-4 overflow-hidden rounded-[16px] sm:rounded-[20px] px-5 sm:px-7 py-3.5 sm:py-4.5 shadow-[0_8px_40px_rgba(110,82,232,0.45),0_2px_12px_rgba(110,82,232,0.25),inset_0_1px_0_rgba(255,255,255,0.18)]"
                    style={{
                      background: 'linear-gradient(135deg, #8468F5 0%, #6E52E8 40%, #4A3AC4 100%)',
                    }}
                  >
                    {/* Frosted glass icon well */}
                    <span className="relative flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/30 shadow-inner text-white"
                      style={{ background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(8px)' }}>
                      <ArrowDown size={20} strokeWidth={2.5} />
                    </span>

                    {/* Text block */}
                    <span className="flex flex-col items-start leading-none gap-1">
                      <span className="text-white/65 text-[8px] sm:text-[9px] font-bold uppercase tracking-[2px] sm:tracking-[2.5px]">What's new in v2</span>
                      <span className="text-white text-[14px] sm:text-[17px] font-black tracking-tight">See what's coming</span>
                    </span>

                    {/* Top-edge highlight */}
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  </motion.a>
                </div>

                {/* ── Secondary — follow the build ── */}
                <motion.a
                  href="https://www.instagram.com/gridmarketplace?igsh=eXZ1ZjFsOGxrZDR0"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                  className="relative flex items-center gap-3 sm:gap-4 px-5 sm:px-7 py-3.5 sm:py-4.5 rounded-[16px] sm:rounded-[20px] border border-border/50 overflow-hidden"
                  style={{ background: 'var(--color-surface)', backdropFilter: 'blur(16px)' }}
                >
                  {/* Subtle inner glow */}
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                  <span className="flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl border border-border/60 flex items-center justify-center text-secondary"
                    style={{ background: 'var(--bg-page)' }}>
                    <Instagram size={20} strokeWidth={2} />
                  </span>

                  <span className="flex flex-col items-start leading-none gap-1">
                    <span className="text-text-muted text-[8px] sm:text-[9px] font-bold uppercase tracking-[2px] sm:tracking-[2.5px]">Follow the build</span>
                    <span className="text-secondary text-[14px] sm:text-[17px] font-black tracking-tight">@gridmarketplace</span>
                  </span>
                </motion.a>

              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <p className="mt-7 text-[11px] font-bold uppercase tracking-[1.5px] text-text-muted transition-colors">
                Verified students &amp; employees only · Android &amp; iOS at launch
              </p>
            </AnimatedSection>
          </div>

          {/* 3D Interactive Phone Mockup */}
          <div className="flex justify-center lg:justify-end lg:pr-12 transform scale-[0.8] sm:scale-90 lg:scale-100 mt-8 lg:mt-0 transition-all duration-700">
            <PhoneMockup3D />
          </div>
        </div>
      </div>
    </section>
  )
}
