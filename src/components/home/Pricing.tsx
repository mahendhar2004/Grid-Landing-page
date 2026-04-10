import { Wallet, CreditCard, Smartphone, ArrowRight, Zap, Sparkles, ShieldCheck, Gift } from 'lucide-react'
import { motion } from 'framer-motion'
import AnimatedSection from '../ui/AnimatedSection'

const fees = [
  { range: '₹0 – ₹100',       fee: '₹5'  },
  { range: '₹101 – ₹250',     fee: '₹10' },
  { range: '₹251 – ₹500',     fee: '₹15' },
  { range: '₹501 – ₹1,000',   fee: '₹20' },
  { range: '₹1,001 – ₹2,000', fee: '₹30' },
  { range: '₹2,000+',         fee: '₹50' },
]

const payments = [
  { icon: Wallet,     label: 'Grid Wallet' },
  { icon: Smartphone, label: 'UPI' },
  { icon: CreditCard, label: 'Cards' },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32 relative overflow-hidden transition-colors duration-500">
      {/* Precision grid texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--color-text-muted) 1px, transparent 0)', backgroundSize: '48px 48px' }}
      />
      
      {/* Deep lighting effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] pointer-events-none transition-opacity"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, var(--color-primary-soft) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        
        {/* ── Header: Minimal & High Impact ── */}
        <AnimatedSection className="text-center mb-16 lg:mb-20">
          <span className="inline-block text-primary font-bold text-xs tracking-[3px] uppercase mb-6">Economics of Trust</span>
          <h2 className="text-4xl lg:text-7xl font-black text-secondary leading-[1] tracking-tighter mb-8 italic transition-colors">
            Zero <span className="text-primary not-italic">Commission</span>.
          </h2>
          <p className="text-text-muted text-base lg:text-lg max-w-xl mx-auto leading-relaxed transition-colors">
            Marketplace purity. Sell for free, keep every rupee. We only charge a small listing fee to keep the campus circle spam-free.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
          
          {/* ── Left: The "Zero" Laboratory Card ── */}
          <AnimatedSection direction="left">
            <div className="relative group">
              {/* Outer glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative rounded-[36px] border border-border shadow-[0_32px_64px_rgba(0,0,0,0.04)] overflow-hidden transition-colors duration-500"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-violet-500 to-primary" />
                
                <div className="p-6 sm:p-10 lg:p-14">
                  <div className="flex flex-col sm:flex-row items-center gap-10 sm:gap-20">
                    {/* Big Hero Number */}
                    <div className="relative">
                      <motion.div 
                        className="text-[80px] sm:text-[140px] lg:text-[180px] font-black leading-none tracking-tighter text-secondary select-none transition-colors"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        0<span className="text-primary">%</span>
                      </motion.div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-full h-8 bg-black/5 blur-xl rounded-full" />
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-3xl font-black text-secondary mb-4 leading-tight transition-colors">No Cuts. No Hidden Fees.</h3>
                      <p className="text-text-muted text-base mb-8 leading-relaxed transition-colors">
                        Unlike other marketplaces, Grid doesn't take a bite out of your hard-earned money. What the buyer pays is exactly what you get.
                      </p>
                      
                      <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                        {['Zero Commissions', 'Instant Settlement', '100% Transparency'].map((tag) => (
                          <span key={tag} className="px-4 py-2 rounded-xl border text-[11px] font-black text-secondary uppercase tracking-wider transition-colors"
                            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods Strip */}
                  <div className="mt-16 pt-10 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <ShieldCheck size={20} />
                      </div>
                      <p className="text-sm font-bold text-secondary transition-colors">Secured by Razorpay Enterprise</p>
                    </div>
                    
                    <div className="flex items-center gap-6 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                      {payments.map((p) => {
                        const Icon = p.icon
                        return (
                          <div key={p.label} className="flex flex-col items-center gap-1">
                            <Icon size={18} className="text-secondary transition-colors" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted transition-colors">{p.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* ── Right: Precision Fee Instrument ── */}
          <AnimatedSection direction="right" delay={0.1}>
            <div className="relative rounded-[36px] border border-border backdrop-blur-md p-10 lg:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.02)] transition-colors duration-500"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-3 mb-10">
                <div className="w-8 h-8 rounded-lg bg-secondary text-primary flex items-center justify-center transition-colors">
                  <Zap size={16} fill="currentColor" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-secondary uppercase tracking-tight transition-colors">Listing Fee</h4>
                  <p className="text-[10px] font-extrabold text-text-muted tracking-[1px] uppercase transition-colors">Scalable Structure</p>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                {fees.map((row) => (
                  <div key={row.range} className="flex items-center justify-between group">
                    <span className="text-sm font-bold text-text-muted group-hover:text-secondary transition-colors">{row.range}</span>
                    <div className="flex-1 border-b border-dotted border-border mx-4" />
                    <span className="text-base font-black text-secondary transition-colors">{row.fee}</span>
                  </div>
                ))}
                
                {/* Referrals & Signups highlight */}
                <div className="pt-4 mt-6 border-t border-border space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-wider">Signup Bonus</span>
                    </div>
                    <span className="text-sm font-black">1 Free Credit</span>
                  </div>
                  
                  <div className="relative group/referral overflow-hidden flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 shadow-xl"
                    style={{ 
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      borderColor: '#FFD700',
                    }}
                  >
                    {/* Animated gold shimmer */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
                      animate={{ x: ['100%', '-100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                    
                    <div className="relative flex items-center gap-2 text-black">
                      <Gift size={14} className="animate-bounce" />
                      <span className="text-xs font-black uppercase tracking-wider">Referral Credit</span>
                    </div>
                    <span className="relative text-sm font-black text-black">₹0 Fee</span>
                    
                    {/* Outer golden aura */}
                    <div className="absolute -inset-1 bg-yellow-400/20 blur-lg rounded-2xl animate-pulse pointer-events-none" />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-text-muted leading-relaxed italic transition-colors">
                * Fees are one-time per listing and help us maintain high quality standards across the campus circle.
              </p>
            </div>
          </AnimatedSection>

        </div>

        {/* ── Bottom Strip: Referrals CTA ── */}
        <AnimatedSection className="mt-12">
          <div className="rounded-[32px] border border-border p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all duration-500"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Gift size={24} />
              </div>
              <div>
                <p className="text-lg font-black text-secondary tracking-tight transition-colors">Don't want to pay? Refer a friend.</p>
                <p className="text-sm text-text-muted font-medium transition-colors">Earn unlimited free listing credits by bringing peers to Grid.</p>
              </div>
            </div>
            <motion.a 
              href="/#download"
              className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm tracking-[2px] uppercase flex items-center gap-2 hover:gap-4 transition-all shadow-xl shadow-primary/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Credits <ArrowRight size={18} />
            </motion.a>
          </div>
        </AnimatedSection>

      </div>
    </section>
  )
}
