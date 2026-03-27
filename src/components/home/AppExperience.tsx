import { Zap, BanIcon, Sparkles, Layers, Search, MessageCircle, MegaphoneOff, ShoppingBag, ScanEye, Wand2, Vibrate, Moon } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const cards = [
  {
    icon: Zap,
    title: 'Blazing Fast',
    description: 'A feed that loads instantly, search that responds as you type, and messages that arrive in real-time.',
    accent: {
      icon: 'bg-blue-500/15 text-blue-400',
      row: 'border-blue-500/15 bg-blue-500/[0.06]',
      dot: 'bg-blue-500/20 text-blue-400',
      value: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
    },
    rows: [
      { icon: Layers,        label: 'Feed loads in',      value: '< 1s'      },
      { icon: Search,        label: 'Search responds in', value: '< 300ms'   },
      { icon: MessageCircle, label: 'Message delivery',   value: 'Real-time' },
    ],
    glow: { pos: '-top-20 -left-20', color: 'rgba(0,123,255,0.2)' },
    bg: 'linear-gradient(145deg, #080c18 0%, #0a0e20 100%)',
  },
  {
    icon: BanIcon,
    title: 'Zero Ads. Always.',
    description: 'Grid is 100% ad-free. No one can pay to appear higher — every listing earns its place on its own.',
    accent: {
      icon: 'bg-rose-500/15 text-rose-400',
      row: 'border-rose-500/15 bg-rose-500/[0.06]',
      dot: 'bg-rose-500/20 text-rose-400',
      value: 'text-rose-300 bg-rose-500/10 border-rose-500/20',
    },
    rows: [
      { icon: MegaphoneOff, label: 'Sponsored banners', value: 'Zero' },
      { icon: ShoppingBag,  label: 'Paid listing boosts', value: 'Zero' },
      { icon: ScanEye,      label: 'Tracking pixels',   value: 'Zero' },
    ],
    glow: { pos: '-top-20 left-1/2 -translate-x-1/2', color: 'rgba(244,63,94,0.15)' },
    bg: 'linear-gradient(145deg, #0e0809 0%, #0b0a0c 100%)',
  },
  {
    icon: Sparkles,
    title: 'Beautifully Designed',
    description: 'Every screen, every animation, every tap is crafted to feel effortless. Not just functional — a joy.',
    accent: {
      icon: 'bg-violet-500/15 text-violet-400',
      row: 'border-violet-500/15 bg-violet-500/[0.06]',
      dot: 'bg-violet-500/20 text-violet-400',
      value: 'text-violet-300 bg-violet-500/10 border-violet-500/20',
    },
    rows: [
      { icon: Wand2,   label: 'Animations',      value: 'Native smooth' },
      { icon: Vibrate, label: 'Haptic feedback',  value: 'Every tap'    },
      { icon: Moon,    label: 'Dark mode',        value: 'Built-in'     },
    ],
    glow: { pos: '-top-20 -right-20', color: 'rgba(139,92,246,0.2)' },
    bg: 'linear-gradient(145deg, #0d0814 0%, #090810 100%)',
  },
]

export default function AppExperience() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">

        <AnimatedSection className="text-center mb-16">
          <span className="inline-block text-primary font-bold text-sm tracking-wide uppercase mb-4">The Grid Experience</span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-secondary mb-5">
            Built for <span className="text-primary">Students</span>, Not Ads.
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            No clutter. No interruptions. Just a beautifully designed marketplace that respects your time.
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-3 gap-5">
          {cards.map((card, i) => (
            <AnimatedSection key={card.title} delay={i * 0.07}>
              <div
                className="relative rounded-3xl overflow-hidden border border-white/[0.08] h-full flex flex-col p-8"
                style={{ background: card.bg }}
              >
                {/* Glow */}
                <div
                  className={`absolute ${card.glow.pos} w-56 h-56 rounded-full pointer-events-none`}
                  style={{ background: `radial-gradient(circle, ${card.glow.color}, transparent 70%)`, filter: 'blur(60px)' }}
                />

                <div className="relative flex flex-col h-full">
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-6 ${card.accent.icon}`}>
                    <card.icon size={20} />
                  </div>

                  {/* Title + description */}
                  <h3 className="text-xl font-extrabold text-white mb-2.5">{card.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed mb-8">{card.description}</p>

                  {/* Rows — identical structure across all cards */}
                  <div className="mt-auto space-y-2.5">
                    {card.rows.map((row) => (
                      <div
                        key={row.label}
                        className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${card.accent.row}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${card.accent.dot}`}>
                            <row.icon size={12} />
                          </div>
                          <span className="text-white/50 text-xs font-medium">{row.label}</span>
                        </div>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${card.accent.value}`}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

      </div>
    </section>
  )
}
