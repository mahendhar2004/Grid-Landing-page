import { ArrowRight } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import PhoneMockup3D from './PhoneMockup3D'

export default function Hero() {
  return (
    <section className="relative pt-20 pb-12 lg:pt-28 lg:pb-16 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[140px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/[0.03] rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div>
            <AnimatedSection>
              <span className="inline-flex items-center gap-2 text-primary text-sm font-bold mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                Campus Exclusive
              </span>
            </AnimatedSection>

            <AnimatedSection delay={0.05}>
              <h1 className="text-5xl sm:text-6xl lg:text-[80px] font-extrabold leading-[1.05] tracking-tight text-secondary mb-6">
                Buy and Sell<br />
                <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Within Your Campus.</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <p className="text-lg sm:text-xl text-text-muted max-w-[480px] mb-10 leading-relaxed">
                The student marketplace with real-time chat, trusted campus circles, and listings starting at just ₹5.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <a
                  href="#download"
                  className="group bg-primary text-white px-10 py-4.5 rounded-full font-bold text-lg transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,123,255,0.25)] flex items-center gap-2"
                >
                  Get the App
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <span className="text-text-muted text-sm font-medium">
                  iOS & Android — Coming Soon
                </span>
              </div>
            </AnimatedSection>
          </div>

          {/* 3D Interactive Phone Mockup */}
          <div className="hidden lg:flex justify-end">
            <PhoneMockup3D />
          </div>
        </div>
      </div>
    </section>
  )
}
