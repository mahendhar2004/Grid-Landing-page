import { Shield, IndianRupee, Sparkles, Lock, CreditCard, CircleDollarSign, Wallet } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text */}
          <AnimatedSection direction="left">
            <span className="inline-block text-primary font-bold text-sm tracking-wide uppercase mb-4">Pricing & Payments</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-secondary mb-6">
              Built for <span className="text-primary">Student Budgets</span>.
            </h2>
            <p className="text-text-muted text-lg mb-10 leading-relaxed">
              Listing fees start at just ₹5. Every rupee goes toward keeping Grid fast, secure, and spam-free for your campus.
            </p>

            <div className="space-y-5">
              {[
                { icon: IndianRupee, title: 'Starts at ₹5', desc: 'Scales gently with your product price — smaller items cost even less.' },
                { icon: CircleDollarSign, title: 'Zero Commission', desc: 'We never take a cut. The full sale amount is yours.' },
                { icon: Sparkles, title: 'Free with Referrals', desc: 'Earn credits by inviting friends — list for free, forever.' },
                { icon: Shield, title: 'Razorpay Secured', desc: 'Bank-grade encryption on every transaction.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center flex-shrink-0 border border-border group-hover:bg-primary-soft transition-colors">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary mb-1">{item.title}</h4>
                    <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Visual */}
          <AnimatedSection direction="right" className="flex justify-center lg:justify-end">
            <div className="space-y-4 w-full max-w-[360px]">
              {/* Fee card */}
              <div className="bg-white rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-border text-center">
                <p className="text-text-muted text-sm font-semibold mb-3">Listing fee from</p>
                <p className="text-6xl font-extrabold text-primary mb-1">₹5</p>
                <p className="text-text-muted text-xs mb-6">Scales with product price. No surprises.</p>

                <div className="grid grid-cols-2 gap-3 text-left">
                  {[
                    { icon: Wallet, label: 'Grid Wallet', sub: 'Load & pay instantly' },
                    { icon: CreditCard, label: 'UPI & Cards', sub: 'All methods supported' },
                  ].map((item) => (
                    <div key={item.label} className="bg-surface rounded-xl p-3 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/[0.06] flex items-center justify-center flex-shrink-0">
                        <item.icon size={15} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-secondary leading-tight">{item.label}</p>
                        <p className="text-[10px] text-text-muted">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex gap-2.5 flex-wrap justify-center">
                {[
                  { icon: Shield, label: 'Razorpay Secured', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                  { icon: Lock, label: 'Encrypted', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                ].map((badge) => (
                  <div key={badge.label} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border ${badge.color}`}>
                    <badge.icon size={14} />
                    {badge.label}
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
