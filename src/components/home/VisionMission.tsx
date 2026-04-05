import { Compass, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import AnimatedSection from '../ui/AnimatedSection'

export default function VisionMission() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden transition-colors duration-500">
      {/* Dot-grid */}
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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] pointer-events-none opacity-[0.4]"
        style={{
          background:
            'radial-gradient(ellipse, var(--color-primary-soft) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6">

        <AnimatedSection className="text-center mb-16">
          <span className="inline-block text-primary font-bold text-sm tracking-wide uppercase mb-4">
            Our Purpose
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-secondary mb-5 transition-colors">
            What Drives <span className="text-primary">Grid</span>
          </h2>
          <p className="text-text-muted text-lg max-w-xl mx-auto leading-relaxed transition-colors">
            Every product decision, every design choice, every line of code — anchored to this.
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* Vision */}
          <AnimatedSection direction="left">
            <motion.div
              className="relative rounded-3xl border border-border/70 p-10 h-full overflow-hidden transition-colors duration-500 shadow-xl"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              whileHover={{
                y: -6,
                boxShadow: '0 16px 56px rgba(0,0,0,0.11)',
                borderColor: 'var(--color-primary)',
              }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
              {/* Corner glow */}
              <div
                className="absolute -top-20 -right-20 w-52 h-52 rounded-full pointer-events-none transition-colors"
                style={{
                  background:
                    'radial-gradient(circle, var(--color-primary-soft), transparent 70%)',
                }}
              />

              <div className="relative">
                <motion.div
                  className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"
                  style={{ backgroundColor: 'var(--color-primary-soft)' }}
                  whileHover={{ scale: 1.12, backgroundColor: 'rgba(37,99,235,0.18)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                >
                  <Compass size={22} className="text-primary" />
                </motion.div>

                <p className="text-xs font-bold tracking-[3px] uppercase text-primary mb-3">
                  Vision
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-secondary leading-snug mb-6 transition-colors">
                  The Digital Pulse of Every Campus
                </h3>

                <div className="w-10 h-[2px] bg-primary/30 rounded-full mb-6" />

                <p className="text-text-muted text-base leading-relaxed transition-colors">
                  To become the most trusted digital pulse of every college campus, where students can seamlessly trade, connect, and build a sustainable local economy.
                </p>
              </div>
            </motion.div>
          </AnimatedSection>

          {/* Mission */}
          <AnimatedSection direction="right" delay={0.07}>
            <motion.div
              className="relative rounded-3xl border border-border/70 p-10 h-full overflow-hidden transition-colors duration-500 shadow-xl"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              whileHover={{
                y: -6,
                boxShadow: '0 16px 56px rgba(0,0,0,0.11)',
                borderColor: 'var(--color-primary)',
              }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500/0 via-violet-500 to-violet-500/0" />
              {/* Corner glow */}
              <div
                className="absolute -top-20 -right-20 w-52 h-52 rounded-full pointer-events-none transition-colors"
                style={{
                  background:
                    'radial-gradient(circle, var(--color-primary-soft), transparent 70%)',
                }}
              />

              <div className="relative">
                <motion.div
                  className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6"
                  style={{ backgroundColor: 'rgba(139,92,246,0.1)' }}
                  whileHover={{ scale: 1.12, backgroundColor: 'rgba(139,92,246,0.18)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                >
                  <Target size={22} className="text-violet-600" />
                </motion.div>

                <p className="text-xs font-bold tracking-[3px] uppercase text-violet-600 mb-3">
                  Mission
                </p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-secondary leading-snug mb-6 transition-colors">
                  Empower Students, Simplify Campus Life
                </h3>

                <div className="w-10 h-[2px] bg-violet-500/30 rounded-full mb-6" />

                <p className="text-text-muted text-base leading-relaxed transition-colors">
                  To empower students by providing a secure, high-performance marketplace that simplifies campus life, reduces waste, and fosters trust through reliable campus-scoped interactions.
                </p>
              </div>
            </motion.div>
          </AnimatedSection>

        </div>
      </div>
    </section>
  )
}
