import { Shield, Lock, Wallet, CreditCard, Smartphone, Gift, CheckCircle2, ArrowRight, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const fees = [
  { range: '₹0 – ₹100',    fee: '₹5' },
  { range: '₹101 – ₹500',  fee: '₹10' },
  { range: '₹501 – ₹2,000',fee: '₹20' },
  { range: '₹2,000+',      fee: '₹30' },
]

const payments = [
  { icon: Wallet,      label: 'Grid Wallet',  sub: 'Instant pay'       },
  { icon: Smartphone,  label: 'UPI',          sub: 'PhonePe, GPay…'    },
  { icon: CreditCard,  label: 'Debit Card',   sub: 'All major banks'   },
  { icon: CreditCard,  label: 'Credit Card',  sub: 'Visa, Mastercard'  },
]

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
})

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-white relative overflow-hidden">

      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <motion.div className="text-center mb-16" {...fade()}>
          <span className="inline-block text-primary font-bold text-sm tracking-wide uppercase mb-4">
            Pricing & Payments
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-secondary mb-5">
            Simple pricing.<br className="sm:hidden" /> <span className="text-primary">No surprises.</span>
          </h2>
          <p className="text-text-muted text-lg max-w-xl mx-auto">
            A tiny listing fee, zero commission, and free if you refer friends.
            Everything else stays in your pocket.
          </p>
        </motion.div>

        {/* ── Key stats row ───────────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-3 divide-x divide-border/60 mb-16 rounded-2xl border border-border/60 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden"
          {...fade(0.1)}
        >
          {[
            { number: '₹5',   label: 'Starting fee',   sub: 'Scales with price, not commission',  highlight: true },
            { number: '0%',   label: 'Commission',      sub: 'You keep 100% of what you earn',     highlight: false },
            { number: 'Free', label: 'With referrals',  sub: 'Earn credits, list for free forever', highlight: false },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center justify-center text-center py-10 px-6 gap-1.5 relative ${stat.highlight ? 'bg-primary/[0.03]' : ''}`}
            >
              {stat.highlight && (
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-primary rounded-none" />
              )}
              <span className={`text-4xl sm:text-5xl font-extrabold leading-none tracking-tight ${stat.highlight ? 'text-primary' : 'text-secondary'}`}>
                {stat.number}
              </span>
              <span className="text-sm font-bold text-secondary">{stat.label}</span>
              <span className="text-xs text-text-muted leading-snug max-w-[140px]">{stat.sub}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Two-column: fee table + payments ────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">

          {/* Fee breakdown */}
          <motion.div
            className="rounded-2xl border border-border/60 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.05)] p-8"
            {...fade(0.18)}
          >
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap size={15} className="text-primary" />
              </div>
              <h3 className="font-bold text-secondary text-[15px]">Listing fee by price</h3>
            </div>

            <div className="space-y-0 divide-y divide-border/50">
              {fees.map((row, i) => (
                <motion.div
                  key={row.range}
                  className="flex items-center justify-between py-3.5 group"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.22 + i * 0.07, ease: [0.4, 0, 0.2, 1] }}
                >
                  <span className="text-[13.5px] text-text-muted font-medium">{row.range}</span>
                  <span className="text-[14px] font-bold text-secondary tabular-nums">{row.fee}</span>
                </motion.div>
              ))}

              {/* Free row */}
              <motion.div
                className="flex items-center justify-between py-3.5"
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.22 + fees.length * 0.07, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="flex items-center gap-2">
                  <Gift size={13} className="text-primary" />
                  <span className="text-[13.5px] text-primary font-semibold">With referral credit</span>
                </div>
                <span className="text-[14px] font-bold text-primary">Free</span>
              </motion.div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-[12px] text-text-muted bg-muted/60 rounded-xl px-4 py-3">
              <CheckCircle2 size={13} className="text-primary flex-shrink-0" />
              <span>One-time fee per listing. <strong className="text-secondary font-semibold">Zero commission</strong> on the final sale price — ever.</span>
            </div>
          </motion.div>

          {/* Payment methods + security */}
          <motion.div
            className="rounded-2xl border border-border/60 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.05)] p-8 flex flex-col gap-6"
            {...fade(0.24)}
          >
            {/* Payment methods */}
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard size={15} className="text-primary" />
                </div>
                <h3 className="font-bold text-secondary text-[15px]">Accepted payments</h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {payments.map((p, i) => (
                  <motion.div
                    key={p.label}
                    className="flex items-center gap-3 rounded-xl border border-border/60 px-4 py-3 bg-white hover:border-primary/30 hover:bg-primary/[0.02] transition-colors duration-200"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: 0.28 + i * 0.06 }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <p.icon size={15} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-secondary leading-tight">{p.label}</p>
                      <p className="text-[11px] text-text-muted">{p.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/60" />

            {/* Security badges */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="flex-1 flex items-center gap-2.5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <Shield size={15} className="text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-[12.5px] font-bold text-blue-700 leading-tight">Razorpay Secured</p>
                  <p className="text-[11px] text-blue-500">PCI-DSS compliant</p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <Lock size={15} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-[12.5px] font-bold text-emerald-700 leading-tight">Bank-grade Encryption</p>
                  <p className="text-[11px] text-emerald-500">256-bit SSL / TLS</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Referral nudge ───────────────────────────────────────────── */}
        <motion.div
          className="rounded-2xl border border-primary/20 bg-primary/[0.03] px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          {...fade(0.32)}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Gift size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-secondary mb-0.5">List for free with referrals</p>
            <p className="text-[13px] text-text-muted leading-snug">
              Refer a friend who signs up → earn listing credits. Use them to list as many items as you want, completely free.
            </p>
          </div>
          <a
            href="/#download"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-primary whitespace-nowrap hover:gap-2.5 transition-all duration-200"
          >
            Start referring <ArrowRight size={14} />
          </a>
        </motion.div>

      </div>
    </section>
  )
}
