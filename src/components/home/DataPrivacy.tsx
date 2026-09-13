import { Shield, EyeOff, DownloadCloud, Megaphone } from 'lucide-react'
import { motion } from 'framer-motion'
import AnimatedSection from '../ui/AnimatedSection'

const commitments = [
  {
    icon: Shield,
    label: 'Your Data, Your Property',
    body: 'Everything you put into Grid — your profile, your listings, your messages — belongs to you. We hold it in trust and nothing more.',
    accent: 'var(--color-primary)',
    accentSoft: 'var(--color-primary-soft)',
  },
  {
    icon: EyeOff,
    label: 'Never Sold. Ever.',
    body: 'We do not sell, rent or trade your personal data to advertisers, data brokers, or any third-party service. Period.',
    accent: 'var(--color-accent-warm)',
    accentSoft: 'var(--color-accent-warm-soft)',
  },
  {
    icon: DownloadCloud,
    label: 'Export It or Erase It',
    body: "Pull everything Grid holds about you into a file, or delete the account outright — both from inside the app, both built to India's DPDP rules.",
    accent: 'var(--color-accent-green)',
    accentSoft: 'var(--color-accent-green-soft)',
  },
  {
    icon: Megaphone,
    label: "Ads That Don't Profile You",
    body: 'v2 carries sponsored listings, and they are never targeted by gender. That was a deliberate decision about what we are willing to do with what we know.',
    accent: 'var(--color-accent-gold)',
    accentSoft: 'var(--color-accent-gold-soft)',
  },
]

export default function DataPrivacy() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden transition-colors duration-500">
      {/* Dot-grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--color-text-muted) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Soft centre glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] pointer-events-none opacity-30"
        style={{
          background:
            'radial-gradient(ellipse, var(--color-primary-soft) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6">

        {/* Header */}
        <AnimatedSection className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase mb-4">
            <Shield size={14} />
            Privacy Commitment
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-secondary mb-5 transition-colors">
            Your Data Is{' '}
            <span className="text-primary">100% Private</span>
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto leading-relaxed transition-colors">
            Verifying who you are means we hold real information about you. Here is exactly what we
            will and won't do with it.
          </p>
        </AnimatedSection>

        {/* Central trust badge */}
        <AnimatedSection className="flex justify-center mb-12">
          <motion.div
            className="inline-flex items-center gap-3 rounded-full px-6 py-3 border transition-colors duration-500 shadow-md"
            style={{
              backgroundColor: 'var(--color-primary-soft)',
              borderColor: 'var(--color-primary)',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary font-semibold text-sm">
              Zero data selling. Zero compromise.
            </span>
          </motion.div>
        </AnimatedSection>

        {/* Commitment cards */}
        <div className="grid sm:grid-cols-2 gap-6">
          {commitments.map((item, i) => {
            const Icon = item.icon
            return (
              <AnimatedSection
                key={item.label}
                direction={i % 2 === 0 ? 'left' : 'right'}
                delay={i * 0.07}
              >
                <motion.div
                  className="relative rounded-3xl border p-8 h-full overflow-hidden transition-colors duration-500 shadow-lg"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                  whileHover={{
                    y: -5,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.10)',
                    borderColor: item.accent,
                  }}
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                >
                  {/* Top accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px]"
                    style={{
                      background: `linear-gradient(to right, transparent, ${item.accent}, transparent)`,
                    }}
                  />

                  {/* Corner glow */}
                  <div
                    className="absolute -top-16 -right-16 w-40 h-40 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${item.accentSoft}, transparent 70%)`,
                    }}
                  />

                  <div className="relative">
                    {/* Icon */}
                    <motion.div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                      style={{ backgroundColor: item.accentSoft }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                    >
                      <Icon size={22} style={{ color: item.accent }} />
                    </motion.div>

                    <h3 className="text-xl font-extrabold text-secondary mb-3 transition-colors">
                      {item.label}
                    </h3>

                    <div
                      className="w-8 h-[2px] rounded-full mb-4"
                      style={{ backgroundColor: `${item.accent}55` }}
                    />

                    <p className="text-text-muted text-base leading-relaxed transition-colors">
                      {item.body}
                    </p>
                  </div>
                </motion.div>
              </AnimatedSection>
            )
          })}
        </div>

        {/* Bottom note */}
        <AnimatedSection className="text-center mt-14">
          <p className="text-text-muted text-sm leading-relaxed max-w-xl mx-auto transition-colors">
            Have questions about how your data is handled?{' '}
            <a
              href="mailto:contact.galvam@gmail.com"
              className="text-primary font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              Reach out to us
            </a>{' '}
            — we'll respond within 24 hours.
          </p>
        </AnimatedSection>

      </div>
    </section>
  )
}
