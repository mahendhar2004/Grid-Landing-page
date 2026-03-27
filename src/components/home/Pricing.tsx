import { Shield, Lock, Wallet, CreditCard, Smartphone, Gift, CheckCircle2, ArrowRight, Zap, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const fees = [
  { range: '₹0 – ₹100',       fee: '₹5'  },
  { range: '₹101 – ₹250',     fee: '₹10' },
  { range: '₹251 – ₹500',     fee: '₹15' },
  { range: '₹501 – ₹1,000',   fee: '₹20' },
  { range: '₹1,001 – ₹2,000', fee: '₹30' },
  { range: '₹2,000+',         fee: '₹50' },
]

const payments = [
  { icon: Wallet,     label: 'Grid Wallet', sub: 'Instant pay'         },
  { icon: Smartphone, label: 'UPI',         sub: 'PhonePe, GPay & more' },
  { icon: CreditCard, label: 'Debit Card',  sub: 'All major banks'     },
  { icon: CreditCard, label: 'Credit Card', sub: 'Visa, Mastercard'    },
]

const enterAnim = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] as [number,number,number,number] },
})

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-white relative overflow-hidden">

      {/* Dot-grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)', backgroundSize: '28px 28px' }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.04) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-6xl mx-auto px-6">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <motion.div className="text-center mb-16" {...enterAnim(0)}>
          <span className="inline-block text-primary font-bold text-sm tracking-wide uppercase mb-4">Pricing & Payments</span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-secondary mb-5">
            Simple pricing.<br className="sm:hidden" /> <span className="text-primary">No surprises.</span>
          </h2>
          <p className="text-text-muted text-lg max-w-xl mx-auto leading-relaxed">
            A small one-time listing fee. Zero commission on sales. Free forever if you refer friends.
          </p>
        </motion.div>

        {/* ── Hero stat strip ─────────────────────────────────────────── */}
        <motion.div
          className="relative rounded-3xl overflow-hidden mb-6 border border-border/70 shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
          {...enterAnim(1)}
          whileHover={{ boxShadow: '0 8px_40px rgba(0,0,0,0.10)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/60 pointer-events-none" />

          <div className="relative grid grid-cols-3 divide-x divide-border/70">

            {/* Stat 1 — hero */}
            <motion.div
              className="relative flex flex-col items-center justify-center text-center py-12 px-8 overflow-hidden cursor-default"
              whileHover={{ backgroundColor: 'rgba(37,99,235,0.03)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(37,99,235,0.06), transparent 65%)' }}
              />
              <motion.span
                className="text-6xl sm:text-7xl font-black tracking-tight text-primary leading-none mb-2 block"
                whileHover={{ scale: 1.06 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
              >
                ₹5
              </motion.span>
              <span className="text-[13px] font-bold text-secondary mb-1">Starting fee</span>
              <span className="text-[12px] text-text-muted max-w-[130px] leading-snug">Scales with your listing price, up to ₹50</span>
            </motion.div>

            {/* Stat 2 */}
            <motion.div
              className="flex flex-col items-center justify-center text-center py-12 px-8 cursor-default"
              whileHover={{ backgroundColor: 'rgba(0,0,0,0.015)' }}
              transition={{ duration: 0.2 }}
            >
              <motion.span
                className="text-6xl sm:text-7xl font-black tracking-tight text-secondary leading-none mb-2 block"
                whileHover={{ scale: 1.06 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
              >
                0%
              </motion.span>
              <span className="text-[13px] font-bold text-secondary mb-1">Commission</span>
              <span className="text-[12px] text-text-muted max-w-[130px] leading-snug">You keep 100% of what the buyer pays</span>
            </motion.div>

            {/* Stat 3 */}
            <motion.div
              className="flex flex-col items-center justify-center text-center py-12 px-8 cursor-default"
              whileHover={{ backgroundColor: 'rgba(37,99,235,0.025)' }}
              transition={{ duration: 0.2 }}
            >
              <motion.span
                className="text-6xl sm:text-7xl font-black tracking-tight text-secondary leading-none mb-2 block"
                whileHover={{ scale: 1.06 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
              >
                Free
              </motion.span>
              <span className="text-[13px] font-bold text-secondary mb-1">With referrals</span>
              <span className="text-[12px] text-text-muted max-w-[130px] leading-snug">Earn credits, list as many times as you want</span>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Two columns ─────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 mb-6">

          {/* Left — Fee table */}
          <motion.div
            className="rounded-3xl border border-border/70 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden"
            {...enterAnim(2)}
            whileHover={{
              y: -5,
              boxShadow: '0 12px 48px rgba(0,0,0,0.10)',
              borderColor: 'rgba(37,99,235,0.2)',
            }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            {/* Card header */}
            <div className="flex items-center gap-3 px-8 pt-8 pb-6 border-b border-border/50">
              <motion.div
                className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"
                whileHover={{ scale: 1.15, backgroundColor: 'rgba(37,99,235,0.18)' }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              >
                <Zap size={16} className="text-primary" />
              </motion.div>
              <div>
                <p className="text-[14px] font-bold text-secondary leading-tight">Listing fee by price</p>
                <p className="text-[11.5px] text-text-muted">One-time. Not per sale.</p>
              </div>
            </div>

            {/* Fee rows */}
            <div className="px-8 py-4">
              {fees.map((row, i) => (
                <motion.div
                  key={row.range}
                  className="relative flex items-center justify-between py-3.5 border-b border-border/40 last:border-0 cursor-default overflow-hidden rounded-lg"
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.07, ease: [0.4, 0, 0.2, 1] }}
                  whileHover={{ x: 4 }}
                >
                  {/* Row hover background */}
                  <motion.div
                    className="absolute inset-0 rounded-lg -mx-2 pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    style={{ background: 'rgba(37,99,235,0.04)' }}
                    transition={{ duration: 0.15 }}
                  />
                  {/* Left indicator */}
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full bg-primary"
                    initial={{ height: 0, opacity: 0 }}
                    whileHover={{ height: 20, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <div className="relative flex items-center gap-3 pl-2">
                    <span className="text-[13.5px] text-text-muted font-medium transition-colors duration-150 group-hover:text-secondary">
                      {row.range}
                    </span>
                  </div>
                  <motion.span
                    className="relative text-[14px] font-bold tabular-nums"
                    whileHover={{ color: '#2563eb' }}
                    transition={{ duration: 0.15 }}
                    style={{ color: '#1e293b' }}
                  >
                    {row.fee}
                  </motion.span>
                </motion.div>
              ))}

              {/* Free row */}
              <motion.div
                className="relative flex items-center justify-between py-3.5 cursor-default overflow-hidden rounded-lg"
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + fees.length * 0.07, ease: [0.4, 0, 0.2, 1] }}
                whileHover={{ x: 4 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-lg -mx-2 pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  style={{ background: 'rgba(37,99,235,0.06)' }}
                  transition={{ duration: 0.15 }}
                />
                <div className="relative flex items-center gap-3 pl-2">
                  <Sparkles size={13} className="text-primary" />
                  <span className="text-[13.5px] font-semibold text-primary">With referral credit</span>
                </div>
                <span className="relative text-[14px] font-bold text-primary">Free</span>
              </motion.div>
            </div>

            {/* Card footer */}
            <div className="mx-8 mb-8 flex flex-col gap-2.5 pt-2">
              {[
                'One-time fee to go live — not a percentage',
                'Pay via Wallet, UPI, or Card instantly',
                'Zero commission on the final sale price',
              ].map(text => (
                <div key={text} className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-[12px] text-text-muted leading-snug">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Payment methods + security */}
          <motion.div
            className="rounded-3xl border border-border/70 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col"
            {...enterAnim(3)}
            whileHover={{
              y: -5,
              boxShadow: '0 12px 48px rgba(0,0,0,0.10)',
              borderColor: 'rgba(37,99,235,0.2)',
            }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            {/* Card header */}
            <div className="flex items-center gap-3 px-8 pt-8 pb-6 border-b border-border/50">
              <motion.div
                className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"
                whileHover={{ scale: 1.15, backgroundColor: 'rgba(37,99,235,0.18)' }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              >
                <CreditCard size={16} className="text-primary" />
              </motion.div>
              <div>
                <p className="text-[14px] font-bold text-secondary leading-tight">Pay your way</p>
                <p className="text-[11.5px] text-text-muted">All major payment methods accepted</p>
              </div>
            </div>

            {/* Payment tiles */}
            <div className="px-8 py-6 grid grid-cols-2 gap-3 flex-1">
              {payments.map((p, i) => (
                <motion.div
                  key={p.label}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 px-4 py-3.5 cursor-default"
                  initial={{ opacity: 0, scale: 0.93 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.38 + i * 0.07 }}
                  whileHover={{
                    y: -4,
                    scale: 1.03,
                    borderColor: 'rgba(37,99,235,0.3)',
                    backgroundColor: 'rgba(37,99,235,0.025)',
                    boxShadow: '0 6px 20px rgba(37,99,235,0.10)',
                  }}
                  transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                >
                  <motion.div
                    className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0"
                    whileHover={{ backgroundColor: 'rgba(37,99,235,0.12)', scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p.icon size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                  </motion.div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-secondary leading-tight">{p.label}</p>
                    <p className="text-[11px] text-text-muted leading-snug">{p.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Security strip */}
            <div className="mx-8 mb-8 rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/60">
              <motion.div
                className="flex items-center gap-3 px-5 py-4 bg-blue-50/60 cursor-default"
                whileHover={{ backgroundColor: 'rgba(219,234,254,0.8)', x: 3 }}
                transition={{ duration: 0.2 }}
              >
                <Shield size={15} className="text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-[12.5px] font-bold text-blue-700 leading-tight">Razorpay Secured</p>
                  <p className="text-[11px] text-blue-500">PCI-DSS Level 1 certified</p>
                </div>
              </motion.div>
              <motion.div
                className="flex items-center gap-3 px-5 py-4 bg-emerald-50/60 cursor-default"
                whileHover={{ backgroundColor: 'rgba(209,250,229,0.8)', x: 3 }}
                transition={{ duration: 0.2 }}
              >
                <Lock size={15} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-[12.5px] font-bold text-emerald-700 leading-tight">Bank-grade Encryption</p>
                  <p className="text-[11px] text-emerald-500">256-bit TLS / SSL on all transactions</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* ── Referral strip ──────────────────────────────────────────── */}
        <motion.div
          className="relative rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/[0.04] via-primary/[0.025] to-transparent px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 overflow-hidden cursor-default"
          {...enterAnim(4)}
          whileHover={{
            y: -4,
            borderColor: 'rgba(37,99,235,0.35)',
            boxShadow: '0 10px 40px rgba(37,99,235,0.10)',
          }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(37,99,235,0.06), transparent 60%)' }}
          />
          <motion.div
            className="relative w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0"
            whileHover={{ scale: 1.15, rotate: -8, backgroundColor: 'rgba(37,99,235,0.16)' }}
            transition={{ type: 'spring', stiffness: 380, damping: 20 }}
          >
            <Gift size={20} className="text-primary" />
          </motion.div>
          <div className="relative flex-1 min-w-0">
            <p className="text-[14.5px] font-bold text-secondary mb-1">List for free with referrals</p>
            <p className="text-[13px] text-text-muted leading-snug">
              Invite a friend who signs up on Grid → you earn a free listing credit. Use credits to list items at zero cost, with no expiry.
            </p>
          </div>
          <motion.a
            href="/#download"
            className="relative flex items-center gap-1.5 text-[13px] font-semibold text-primary whitespace-nowrap"
            whileHover={{ gap: '10px' }}
            transition={{ duration: 0.2 }}
          >
            Start referring <ArrowRight size={14} />
          </motion.a>
        </motion.div>

      </div>
    </section>
  )
}
