import { motion } from 'framer-motion'
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
                <span className="text-[10px] font-black uppercase tracking-[2px] leading-none">Two-Way Campus Commerce</span>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.05}>
              <h1 className="text-[44px] sm:text-6xl lg:text-[80px] font-black leading-[0.95] sm:leading-[1] tracking-tighter text-secondary mb-6 transition-colors italic">
                Buy, Sell &<br />
                <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent not-italic">Request on Campus.</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <p className="text-lg sm:text-xl text-text-muted max-w-[480px] mb-10 leading-relaxed transition-colors">
                The ultimate student marketplace. Sell what you no longer need, or request what you're looking for, from people you trust.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <div className="flex flex-row items-center gap-3 sm:gap-5 flex-wrap">

                {/* ── PREMIUM Google Play CTA ── */}
                <div className="relative">
                  {/* Pulsing aura rings */}
                  <span className="aura-ring-1 absolute inset-0 rounded-[22px] bg-primary blur-[18px] pointer-events-none" />
                  <span className="aura-ring-2 absolute -inset-2 rounded-[28px] bg-primary/60 blur-[28px] pointer-events-none" />

                  <motion.a
                    href="#download"
                    whileHover={{ scale: 1.04, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                    className="shimmer-loop relative flex items-center gap-3 sm:gap-4 overflow-hidden rounded-[16px] sm:rounded-[20px] px-4 sm:px-6 py-3 sm:py-4 shadow-[0_8px_40px_rgba(0,123,255,0.45),0_2px_12px_rgba(0,123,255,0.25),inset_0_1px_0_rgba(255,255,255,0.18)]"
                    style={{
                      background: 'linear-gradient(135deg, #1a7fff 0%, #007BFF 40%, #0056cc 100%)',
                    }}
                  >
                    {/* Frosted glass icon well */}
                    <span className="relative flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/30 shadow-inner"
                      style={{ background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(8px)' }}>
                      {/* Exact Play Store icon */}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.395 13l2.302-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.635-8.635z" />
                      </svg>
                    </span>

                    {/* Text block */}
                    <span className="flex flex-col items-start leading-none gap-0.5">
                      <span className="text-white/65 text-[8px] sm:text-[9px] font-bold uppercase tracking-[2px] sm:tracking-[2.5px]">Get it on</span>
                      <span className="text-white text-[14px] sm:text-[17px] font-black tracking-tight transition-all">Google Play</span>
                      {/* Star rating row */}
                      <span className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} width="9" height="9" viewBox="0 0 24 24" fill="rgba(255,255,255,0.85)">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                        <span className="text-white/50 text-[8px] font-bold ml-0.5 tracking-tight">4.9</span>
                      </span>
                    </span>

                    {/* Top-edge highlight */}
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  </motion.a>
                </div>

                {/* ── iOS Coming Soon — frosted glass ── */}
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                  className="relative flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 rounded-[16px] sm:rounded-[20px] border border-border/50 cursor-default overflow-hidden"
                  style={{ background: 'rgba(var(--color-surface-rgb, 250,250,250), 0.4)', backdropFilter: 'blur(16px)' }}
                >
                  {/* Subtle inner glow */}
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                  {/* Apple logo icon well */}
                  <span className="flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl border border-border/60 flex items-center justify-center"
                    style={{ background: 'rgba(var(--color-surface-rgb, 250,250,250), 0.6)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-secondary">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                  </span>

                  <span className="flex flex-col items-start leading-none gap-0.5">
                    <span className="text-text-muted text-[8px] sm:text-[9px] font-bold uppercase tracking-[2px] sm:tracking-[2.5px]">Coming soon</span>
                    <span className="text-secondary text-[14px] sm:text-[17px] font-black tracking-tight transition-all">App Store</span>
                    <span className="text-text-muted text-[9px] font-medium mt-1">iOS release on the way</span>
                  </span>
                </motion.div>

              </div>
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
