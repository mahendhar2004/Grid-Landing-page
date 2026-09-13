import { ScanEye, ShieldAlert, EyeOff, Users } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const pillars = [
  {
    icon: ScanEye,
    title: 'Checked before it posts',
    body: 'Every photo and every description is screened automatically the moment it is submitted — so nothing sits on the feed waiting for someone to notice it and report it.',
  },
  {
    icon: ShieldAlert,
    title: 'Consequences that escalate',
    body: 'A first breach restricts the account. Then a seven-day suspension. Then it is permanent. The same ladder applies to everyone, with no quiet exceptions.',
  },
  {
    icon: EyeOff,
    title: 'Anonymous when you want it',
    body: 'Drop your name from a listing, or from a single conversation. Either side can turn it on, at any point, without explaining why.',
  },
]

export default function TrustSafety() {
  return (
    <section id="safety" className="py-24 lg:py-32 relative overflow-hidden transition-colors duration-500">
      {/* Ambient light */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] max-w-full h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, var(--color-primary-soft) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* ── Header ── */}
        <AnimatedSection className="text-center mb-16 lg:mb-20">
          <span className="inline-block text-primary font-bold text-xs tracking-[3px] uppercase mb-6">Trust &amp; Safety</span>
          <h2 className="text-4xl lg:text-7xl font-black text-secondary leading-[1] tracking-tighter mb-8 italic transition-colors">
            Screened before <span className="text-primary not-italic">it reaches you</span>.
          </h2>
          <p className="text-text-muted text-base lg:text-lg max-w-2xl mx-auto leading-relaxed transition-colors">
            Verification gets the right people in. Everything below keeps it that way once they are.
          </p>
        </AnimatedSection>

        {/* ── Pillars ── */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-8">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon
            return (
              <AnimatedSection key={pillar.title} delay={i * 0.1}>
                <div
                  className="group relative rounded-[32px] border p-7 sm:p-9 h-full overflow-hidden transition-colors duration-500"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                  <span className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-7">
                    <Icon size={22} strokeWidth={2.2} />
                  </span>

                  <h3 className="text-xl font-black text-secondary tracking-tight mb-3 transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-[14px] text-text-muted leading-relaxed transition-colors">
                    {pillar.body}
                  </p>
                </div>
              </AnimatedSection>
            )
          })}
        </div>

        {/* ── The structural point ── */}
        <AnimatedSection delay={0.1}>
          <div
            className="relative rounded-[32px] border p-7 sm:p-12 transition-colors duration-500"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="grid lg:grid-cols-[auto_1fr] gap-7 lg:gap-12 items-center">
              <div className="flex items-center gap-3.5 lg:flex-col lg:items-start lg:gap-5">
                <span className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                  <Users size={22} strokeWidth={2.2} />
                </span>
                <p className="text-[10px] font-black uppercase tracking-[2px] text-primary transition-colors">
                  The real safeguard
                </p>
              </div>

              <div className="lg:max-w-3xl">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tighter mb-4 transition-colors">
                  The best moderation is a small room.
                </h3>
                <p className="text-[14px] sm:text-base text-text-muted leading-relaxed transition-colors">
                  Automated screening and a ban ladder are the backstop, not the plan. The plan is that the person on the other end of the deal verified into the same campus or office you did, has a reputation there, and has to keep seeing you around. That constraint does more work than any filter we could write.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

      </div>
    </section>
  )
}
