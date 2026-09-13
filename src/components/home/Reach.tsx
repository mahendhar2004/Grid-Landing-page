import { motion } from 'framer-motion'
import { Send, Binoculars, MapPin } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

/* Seller side — how far a listing is allowed to travel */
const postTiers = [
  { name: 'Same Hostel', body: 'Just your building. The fastest pickup there is.', width: 22 },
  { name: 'Your Org', body: 'Everyone in your Hub, nobody outside it.', width: 48 },
  { name: 'Shared Hub', body: 'Your Hub plus the ones it has been paired with.', width: 74 },
  { name: 'Global Radius', body: 'Anyone in range, wherever they verified in.', width: 100 },
]

/* Buyer side — how wide you choose to look */
const browseScopes = [
  { name: 'My org only', body: 'The default. Only your own Hub.' },
  { name: 'Nearby, same type', body: 'Widen to other campuses or other offices, in 10, 25 or 50 km bands.' },
  { name: 'Global', body: 'Everything Grid can show you, everywhere.' },
]

export default function Reach() {
  return (
    <section id="reach" className="py-24 lg:py-32 relative overflow-hidden transition-colors duration-500">
      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--color-text-muted) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* ── Header ── */}
        <AnimatedSection className="text-center mb-16 lg:mb-20">
          <span className="inline-block text-primary font-bold text-xs tracking-[3px] uppercase mb-6">Reach</span>
          <h2 className="text-4xl lg:text-7xl font-black text-secondary leading-[1] tracking-tighter mb-8 italic transition-colors">
            Decide how far <span className="text-primary not-italic">it travels</span>.
          </h2>
          <p className="text-text-muted text-base lg:text-lg max-w-2xl mx-auto leading-relaxed transition-colors">
            Staying inside your Hub shouldn't mean being stuck in it. In v2 every listing carries its own reach setting, and how widely you browse is a separate choice entirely — one you make, not one made for you.
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">

          {/* ── Seller side ── */}
          <AnimatedSection direction="left" className="h-full">
            <div
              className="relative rounded-[32px] border p-7 sm:p-10 h-full transition-colors duration-500"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-3.5 mb-9">
                <span className="w-11 h-11 rounded-2xl bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                  <Send size={19} strokeWidth={2.2} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-secondary tracking-tight transition-colors">When you post</h3>
                  <p className="text-[10px] font-black uppercase tracking-[1.5px] text-text-muted transition-colors">Four levels of visibility</p>
                </div>
              </div>

              <div className="flex flex-col gap-7">
                {postTiers.map((tier, i) => (
                  <div key={tier.name}>
                    <div className="flex items-baseline justify-between gap-4 mb-2.5">
                      <span className="text-[14px] font-black text-secondary transition-colors">{tier.name}</span>
                      <span className="text-[11px] font-bold text-text-muted tracking-tight transition-colors">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Reach bar */}
                    <div className="h-1.5 rounded-full mb-2.5 overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                      <motion.div
                        className="h-full rounded-full bg-primary origin-left"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        style={{ width: `${tier.width}%` }}
                      />
                    </div>

                    <p className="text-[13px] text-text-muted leading-relaxed transition-colors">{tier.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* ── Buyer side ── */}
          <AnimatedSection direction="right" delay={0.1} className="h-full">
            <div
              className="relative rounded-[32px] border p-7 sm:p-10 h-full flex flex-col transition-colors duration-500"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-start justify-between gap-4 mb-9">
                <div className="flex items-center gap-3.5">
                  <span
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-accent-green-soft)', color: 'var(--color-accent-green)' }}
                  >
                    <Binoculars size={19} strokeWidth={2.2} />
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-secondary tracking-tight transition-colors">When you browse</h3>
                    <p className="text-[10px] font-black uppercase tracking-[1.5px] text-text-muted transition-colors">Your call, always</p>
                  </div>
                </div>

                <span
                  className="flex-shrink-0 text-[9px] font-black uppercase tracking-[1.5px] px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--color-accent-green-soft)', color: 'var(--color-accent-green)' }}
                >
                  Free
                </span>
              </div>

              <div className="flex flex-col gap-5 mb-9">
                {browseScopes.map((scope, i) => (
                  <motion.div
                    key={scope.name}
                    className="rounded-2xl border p-5 transition-colors duration-500"
                    style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--color-border)' }}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.45, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className="text-[14px] font-black text-secondary mb-1.5 transition-colors">{scope.name}</p>
                    <p className="text-[13px] text-text-muted leading-relaxed transition-colors">{scope.body}</p>
                  </motion.div>
                ))}
              </div>

              <p className="mt-auto text-[13px] text-text-muted leading-relaxed transition-colors">
                Looking further afield costs nothing and never has. Widening your own search is free for every user, on every tier.
              </p>
            </div>
          </AnimatedSection>
        </div>

        {/* ── The map ── */}
        <AnimatedSection delay={0.1} className="mt-6 lg:mt-8">
          <div
            className="relative rounded-[32px] border p-7 sm:p-12 overflow-hidden transition-colors duration-500"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {/* Pin constellation */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.07]" aria-hidden="true">
              {[
                { top: '18%', left: '72%' }, { top: '54%', left: '84%' },
                { top: '32%', left: '91%' }, { top: '72%', left: '68%' },
              ].map((pos, i) => (
                <MapPin key={i} size={64} className="absolute text-primary" style={pos} />
              ))}
            </div>

            <div className="relative grid lg:grid-cols-[auto_1fr] gap-7 lg:gap-12 items-center">
              <div className="flex items-center gap-3.5 lg:flex-col lg:items-start lg:gap-5">
                <span className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                  <MapPin size={22} strokeWidth={2.2} />
                </span>
                <p className="text-[10px] font-black uppercase tracking-[2px] text-primary transition-colors">
                  New in v2
                </p>
              </div>

              <div className="lg:max-w-3xl">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tighter mb-4 transition-colors">
                  Tap a pin, see what's inside.
                </h3>
                <p className="text-[14px] sm:text-base text-text-muted leading-relaxed transition-colors">
                  v2 adds a map of the Hubs around you. Tap one and its listings slide up from the bottom — a quick way to work out which campus or office nearby actually has the thing you're after, without leaving the feed behind.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

      </div>
    </section>
  )
}
