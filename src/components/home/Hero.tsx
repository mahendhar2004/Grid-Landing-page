import { Smartphone } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

export default function Hero() {
  return (
    <section className="pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div>
            <AnimatedSection>
              <span className="inline-flex items-center gap-2 bg-primary-soft text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
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
                Grid<span className="brand-dot" /> is the marketplace built for students. With 112+ categories,
                real-time chat, and trusted campus circles — experience the safest way to trade.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <a
                  href="#download"
                  className="bg-primary text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-primary-dark transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,123,255,0.2)]"
                >
                  Get the App
                </a>
                <div className="flex items-center gap-3 text-text-muted text-sm font-semibold">
                  <Smartphone size={18} />
                  <span>Coming to App Store & Play Store</span>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Phone mockup */}
          <AnimatedSection direction="right" className="hidden lg:flex justify-end">
            <div className="w-[300px] h-[620px] bg-black rounded-[40px] p-3 border-[8px] border-[#1a1a1a] shadow-[0_50px_100px_rgba(0,0,0,0.15)]">
              <div className="w-full h-full bg-surface rounded-3xl overflow-hidden p-10 flex flex-col items-center">
                <img src="/icon.png" className="w-10 h-10 mb-10 rounded-lg" alt="Grid" />
                <div className="w-full bg-white rounded-xl p-3 border border-border text-xs text-text-muted mb-8">
                  Search "Engineering Books"
                </div>
                <div className="grid grid-cols-2 gap-3 w-full">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-white rounded-xl border border-border" />
                  ))}
                </div>
                <div className="mt-auto w-full flex justify-around pt-6 border-t border-border">
                  {['Home', 'Chat', 'Sell', 'List', 'Profile'].map((label) => (
                    <div key={label} className="flex flex-col items-center gap-1">
                      <div className={`w-5 h-5 rounded-full ${label === 'Sell' ? 'bg-primary' : 'bg-slate-200'}`} />
                      <span className="text-[8px] text-text-muted">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
