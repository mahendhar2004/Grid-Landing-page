import { ArrowRight } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import PhoneMockup3D from './PhoneMockup3D'

export default function Hero() {
  return (
    <section className="relative pt-20 pb-12 lg:pt-28 lg:pb-16 overflow-hidden transition-colors duration-500">
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
                <span className="text-[10px] font-black uppercase tracking-[2px] leading-none">Campus Exclusive</span>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.05}>
              <h1 className="text-[44px] sm:text-6xl lg:text-[80px] font-black leading-[0.95] sm:leading-[1] tracking-tighter text-secondary mb-6 transition-colors italic">
                Buy and Sell<br />
                <span className="bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent not-italic">Within Your Campus.</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <p className="text-lg sm:text-xl text-text-muted max-w-[480px] mb-10 leading-relaxed transition-colors">
                Sell what you no longer need, find what you do — all within your campus, from students like you.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                <a
                  href="#download"
                  className="group bg-primary text-white px-10 py-5 rounded-2xl font-black text-sm tracking-[2px] uppercase transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/30 flex items-center gap-2"
                >
                  Get the App
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <div className="flex flex-col">
                   <span className="text-secondary font-black text-xs uppercase tracking-widest transition-colors mb-0.5">
                    Live on Android
                  </span>
                  <span className="text-text-muted text-[10px] font-black uppercase tracking-[2px] transition-colors">
                    iOS Release Soon
                  </span>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* 3D Interactive Phone Mockup - Now visible on mobile */}
          <div className="flex justify-center lg:justify-end lg:pr-12 transform scale-[0.8] sm:scale-90 lg:scale-100 mt-8 lg:mt-0 transition-all duration-700">
            <PhoneMockup3D />
          </div>
        </div>
      </div>
    </section>
  )
}
