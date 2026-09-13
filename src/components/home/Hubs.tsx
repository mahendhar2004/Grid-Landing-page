import { motion } from 'framer-motion'
import { AtSign, ShieldCheck, Users, GraduationCap, Briefcase, Quote } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const gateSteps = [
  {
    icon: AtSign,
    title: 'You enter a work or college email',
    body: 'Gmail, Outlook and the other personal domains are turned away at the door. Only an organisation address gets you in.',
  },
  {
    icon: ShieldCheck,
    title: 'We check the organisation is real',
    body: "Grid looks up the domain's mail records before it trusts it. A made-up college in a signup form doesn't survive that.",
  },
  {
    icon: Users,
    title: "You're inside your Hub",
    body: 'A one-time code, and you\'re browsing. No password to invent, no profile to fill in first.',
  },
]

const hubTypes = [
  {
    icon: GraduationCap,
    kind: 'Academic Hub',
    label: 'Campuses',
    body: 'Hostels, labs and libraries. Cycles, mini-fridges, coolers, monitors and textbooks — the things that change hands every single semester.',
    accent: 'var(--color-primary)',
    soft: 'var(--color-primary-soft)',
  },
  {
    icon: Briefcase,
    kind: 'Corporate Hub',
    label: 'Workplaces',
    body: 'New in v2. Offices get Hubs of their own under the same verified-by-email rule — desks, chairs, monitors, and everything else that moves when a team does.',
    accent: 'var(--color-accent-warm)',
    soft: 'var(--color-accent-warm-soft)',
    isNew: true,
  },
]

export default function Hubs() {
  return (
    <section id="hubs" className="py-24 lg:py-32 relative overflow-hidden transition-colors duration-500">
      {/* Ambient light */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] max-w-full h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, var(--color-primary-soft) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* ── Header ── */}
        <AnimatedSection className="text-center mb-16 lg:mb-20">
          <span className="inline-block text-primary font-bold text-xs tracking-[3px] uppercase mb-6">The Hub</span>
          <h2 className="text-4xl lg:text-7xl font-black text-secondary leading-[1] tracking-tighter mb-8 italic transition-colors">
            Your Hub is the <span className="text-primary not-italic">whole point</span>.
          </h2>
          <p className="text-text-muted text-base lg:text-lg max-w-2xl mx-auto leading-relaxed transition-colors">
            Most marketplaces put you in a crowd of strangers and then spend years trying to make it feel safe. Grid v2 starts from the other end — you only ever see people who verified into the same campus or office as you.
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">

          {/* ── Left: the gate ── */}
          <AnimatedSection direction="left">
            <div
              className="relative rounded-[32px] border p-7 sm:p-10 h-full transition-colors duration-500"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <h3 className="text-[11px] font-black uppercase tracking-[2px] text-text-muted mb-8 transition-colors">
                How you get in
              </h3>

              <div className="relative flex flex-col gap-8">
                {/* Vertical connector */}
                <div className="absolute left-[21px] top-8 bottom-8 w-px bg-border" aria-hidden="true" />

                {gateSteps.map((step, i) => {
                  const Icon = step.icon
                  return (
                    <motion.div
                      key={step.title}
                      className="relative flex gap-5"
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <span
                        className="relative z-10 flex-shrink-0 w-[43px] h-[43px] rounded-2xl flex items-center justify-center text-primary border"
                        style={{ backgroundColor: 'var(--color-primary-soft)', borderColor: 'var(--color-border)' }}
                      >
                        <Icon size={19} strokeWidth={2.2} />
                      </span>
                      <div className="pt-1.5">
                        <p className="text-[15px] font-black text-secondary leading-snug mb-1.5 transition-colors">
                          {step.title}
                        </p>
                        <p className="text-[13px] text-text-muted leading-relaxed transition-colors">
                          {step.body}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </AnimatedSection>

          {/* ── Right: the two hub types ── */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {hubTypes.map((hub, i) => {
              const Icon = hub.icon
              return (
                <AnimatedSection key={hub.kind} direction="right" delay={i * 0.1}>
                  <div
                    className="group relative rounded-[32px] border p-7 sm:p-10 overflow-hidden transition-colors duration-500"
                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                      style={{ backgroundColor: hub.accent }}
                    />

                    <div className="flex items-start justify-between gap-4 mb-6">
                      <span
                        className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: hub.soft, color: hub.accent }}
                      >
                        <Icon size={22} strokeWidth={2.2} />
                      </span>
                      {hub.isNew && (
                        <span
                          className="text-[9px] font-black uppercase tracking-[1.5px] px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: hub.soft, color: hub.accent }}
                        >
                          New in v2
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] font-black uppercase tracking-[2px] mb-2 transition-colors" style={{ color: hub.accent }}>
                      {hub.kind}
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-black text-secondary tracking-tight mb-3 transition-colors">
                      {hub.label}
                    </h3>
                    <p className="text-[14px] text-text-muted leading-relaxed transition-colors">
                      {hub.body}
                    </p>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>

        {/* ── The proof ── */}
        <AnimatedSection delay={0.1} className="mt-6 lg:mt-8">
          <div
            className="relative rounded-[32px] border p-7 sm:p-12 overflow-hidden transition-colors duration-500"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <Quote
              size={140}
              className="absolute -top-4 -right-4 text-primary opacity-[0.06] pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative grid lg:grid-cols-[auto_1fr] gap-7 lg:gap-12 items-center">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tighter italic leading-[1.15] lg:max-w-[340px] transition-colors">
                “3 people in your Hub bought this.”
              </p>
              <p className="text-[14px] sm:text-base text-text-muted leading-relaxed transition-colors">
                That line is only worth anything if the network behind it is real. Big marketplaces approximate it with an algorithm and quick-commerce apps can't say it at all — because they have no idea who your people are. On Grid it isn't a recommendation, it's just a fact about your Hub. That's the advantage v2 is built around.
              </p>
            </div>
          </div>
        </AnimatedSection>

      </div>
    </section>
  )
}
