import { EyeOff, UserX, ShieldCheck, MessageCircle, Unlock, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import AnimatedSection from '../ui/AnimatedSection'

const points = [
  {
    icon: UserX,
    label: 'Identity hidden',
    desc: 'Your name appears as "Anonymous Student" to all buyers — no trace back to you',
  },
  {
    icon: EyeOff,
    label: 'Photo masked',
    desc: 'Profile picture is replaced — zero visual identity leak on your listing',
  },
  {
    icon: ShieldCheck,
    label: 'Still campus-verified',
    desc: 'Buyers know you\'re a real, verified student — they just don\'t know who',
  },
  {
    icon: MessageCircle,
    label: 'Chat stays private',
    desc: 'Negotiate the full deal in-chat without ever revealing yourself',
  },
  {
    icon: Unlock,
    label: 'Reveal on your terms',
    desc: 'Unmask yourself only if and when you\'re comfortable — entirely your choice',
  },
]

const enter = (i: number) => ({
  initial: { opacity: 0, x: -20 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true as const },
  transition: { duration: 0.5, delay: 0.2 + i * 0.08, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
})

export default function AnonymousMode() {
  return (
    <section id="anonymous" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection direction="scale">
          <div
            className="relative rounded-[36px] overflow-hidden border border-white/[0.07]"
            style={{ background: 'linear-gradient(135deg, #0a0814 0%, #09090b 50%, #080c18 100%)' }}
          >
            {/* Glow orbs */}
            <motion.div
              className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(139,92,246,0.18), transparent 70%)',
                filter: 'blur(80px)',
              }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(37,99,235,0.12), transparent 70%)',
                filter: 'blur(70px)',
              }}
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            />
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)',
                backgroundSize: '28px 28px',
              }}
            />

            <div className="relative grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]">

              {/* ── Left: copy + feature list ── */}
              <div className="p-10 lg:p-14 flex flex-col justify-center">
                <span className="inline-block text-violet-400 font-bold text-xs tracking-[3px] uppercase mb-5">
                  Anonymous Mode
                </span>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
                  Sell Freely.<br />
                  <span className="text-violet-400">Stay Hidden.</span>
                </h2>
                <p className="text-white/40 text-base max-w-md mb-10 leading-relaxed">
                  One toggle. Full privacy. Sell anything without revealing who you are — your identity is completely yours to control.
                </p>

                <div className="space-y-3">
                  {points.map((p, i) => (
                    <motion.div
                      key={p.label}
                      {...enter(i)}
                      className="flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-4"
                    >
                      <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <p.icon size={15} className="text-violet-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white/75 leading-tight mb-0.5">{p.label}</p>
                        <p className="text-xs text-white/35 leading-snug">{p.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* ── Right: mock listing card ── */}
              <div className="p-10 lg:p-14 flex flex-col justify-center items-center gap-6">

                <motion.div
                  className="w-full max-w-sm rounded-3xl border border-white/[0.1] bg-white/[0.04] overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Image area */}
                  <div className="w-full h-44 bg-white/[0.04] relative flex items-center justify-center">
                    <span className="text-5xl select-none">💻</span>
                    {/* Anonymous badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-violet-500/20 border border-violet-500/30 rounded-full px-3 py-1">
                      <EyeOff size={10} className="text-violet-400" />
                      <span className="text-violet-400 text-[10px] font-bold">Anonymous</span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white/80 font-bold text-base leading-tight">MacBook Pro M1</p>
                        <p className="text-white/35 text-xs mt-0.5">2021 · 16GB · 512GB SSD</p>
                      </div>
                      <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full">
                        Excellent
                      </span>
                    </div>

                    <p className="text-white font-extrabold text-2xl mb-4">₹72,000</p>

                    {/* Seller row */}
                    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 mb-4">
                      {/* Pulsing ghost avatar */}
                      <div className="relative w-8 h-8 flex-shrink-0">
                        <motion.div
                          className="absolute inset-0 rounded-full bg-violet-500/30"
                          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <div className="relative w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                          <UserX size={14} className="text-violet-400" />
                        </div>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs font-bold leading-tight">Anonymous Student</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <ShieldCheck size={9} className="text-emerald-400" />
                          <p className="text-emerald-400 text-[10px]">Campus Verified</p>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2.5">
                      <button className="flex-1 bg-primary/90 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                        <MessageCircle size={12} />
                        Message Seller
                      </button>
                      <button className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                        <Heart size={14} className="text-white/40" />
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Info chip */}
                <motion.div
                  className="flex items-center gap-2.5 bg-white/[0.05] border border-violet-500/20 rounded-2xl px-5 py-3"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                  <p className="text-white/40 text-xs">Real identity never shared — with buyers or with Grid</p>
                </motion.div>

              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
