import { Gift, Zap, Award, ArrowRight } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

export default function Referral() {
  return (
    <section id="referrals" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection direction="scale">
          <div className="relative bg-secondary rounded-[32px] p-10 sm:p-16 lg:p-20 overflow-hidden">
            {/* Subtle pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
                backgroundSize: '32px 32px',
              }}
            />
            {/* Accent glow */}
            <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12">
              <div>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
                  Grow the Grid,<br />
                  <span className="text-primary">Earn Rewards</span>.
                </h2>
                <p className="text-white/50 text-lg max-w-md mb-10 leading-relaxed">
                  Every friend you bring earns you free listing credits. Build the campus community and save on every listing.
                </p>
                <div className="flex flex-wrap gap-x-8 gap-y-4">
                  {[
                    { icon: Gift, label: 'Free Listings' },
                    { icon: Zap, label: 'Grid Credits' },
                    { icon: Award, label: 'Reward Per Referral' },
                  ].map((perk) => (
                    <div key={perk.label} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <perk.icon size={16} className="text-primary" />
                      </div>
                      <span className="text-white/90 font-semibold text-sm">{perk.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-shrink-0">
                <a href="#download" className="group bg-primary hover:bg-primary-dark text-white px-8 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(0,123,255,0.3)]">
                  Refer a Friend
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
