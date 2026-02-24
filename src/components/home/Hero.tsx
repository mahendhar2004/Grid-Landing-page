import { Smartphone, ArrowRight } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import PhoneMockup3D from './PhoneMockup3D'

export default function Hero() {
  return (
    <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/[0.02] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div>
            <AnimatedSection>
              <span className="inline-flex items-center gap-2 bg-primary-soft text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                100% Campus Exclusive
              </span>
            </AnimatedSection>

            <AnimatedSection delay={0.05}>
              <h1 className="text-5xl sm:text-6xl lg:text-[80px] font-extrabold leading-[1.05] tracking-tight text-secondary mb-6">
                Buy and Sell<br />
                <span className="text-primary">Within Your Campus.</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <p className="text-lg sm:text-xl text-text-muted max-w-[540px] mb-10 leading-relaxed">
                Grid is the marketplace built for students. With 112+ categories,
                real-time chat, and trusted campus circles — experience the safest way to trade.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <a
                  href="#download"
                  className="group bg-primary text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-primary-dark transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,123,255,0.2)] flex items-center gap-2"
                >
                  Get the App
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <div className="flex items-center gap-3 text-text-muted text-sm font-semibold">
                  <Smartphone size={18} />
                  <span>Coming to App Store & Play Store</span>
                </div>
              </div>
            </AnimatedSection>

            {/* Social proof stats */}
            <AnimatedSection delay={0.2}>
              <div className="flex items-center gap-6 mt-12 pt-8 border-t border-border">
                <div>
                  <p className="text-2xl font-extrabold text-secondary">900+</p>
                  <p className="text-xs text-text-muted font-medium">Colleges</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <p className="text-2xl font-extrabold text-secondary">112+</p>
                  <p className="text-xs text-text-muted font-medium">Categories</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <p className="text-2xl font-extrabold text-secondary">100%</p>
                  <p className="text-xs text-text-muted font-medium">Verified</p>
                </div>
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
