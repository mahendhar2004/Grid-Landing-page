import { Gift, Zap, Award, Users } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

export default function Referral() {
  return (
    <section id="referrals" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection direction="scale">
          <div className="bg-secondary rounded-[40px] p-10 sm:p-16 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
                Grow the Grid,<br />
                <span className="text-primary">Earn Rewards</span>.
              </h2>
              <p className="text-white/60 text-lg max-w-md mb-8">
                Every friend you bring earns you free listing credits. Build the campus community and save on every listing.
              </p>
              <div className="flex flex-wrap gap-6">
                {[
                  { icon: Gift, label: 'Free Listings' },
                  { icon: Zap, label: 'Grid Credits' },
                  { icon: Award, label: 'Reward Per Referral' },
                ].map((perk) => (
                  <div key={perk.label} className="flex items-center gap-3">
                    <perk.icon size={18} className="text-primary" />
                    <span className="text-white font-bold text-sm">{perk.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="bg-primary/10 border border-primary rounded-full px-8 py-5 flex items-center gap-5 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
                <span className="text-white font-bold text-lg">Refer a Friend</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
