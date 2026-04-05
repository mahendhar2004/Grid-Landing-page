import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import AnimatedSection from '../ui/AnimatedSection'
import { features } from '../../data/features'

const iconStyle: Record<string, { iconBg: string; iconText: string }> = {
  blue:   { iconBg: 'bg-blue-50',    iconText: 'text-blue-600'    },
  orange: { iconBg: 'bg-orange-50',  iconText: 'text-orange-600'  },
  green:  { iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
  cyan:   { iconBg: 'bg-cyan-50',    iconText: 'text-cyan-600'    },
  purple: { iconBg: 'bg-purple-50',  iconText: 'text-purple-600'  },
  teal:   { iconBg: 'bg-teal-50',    iconText: 'text-teal-600'    },
  pink:   { iconBg: 'bg-pink-50',    iconText: 'text-pink-600'    },
  rose:   { iconBg: 'bg-rose-50',    iconText: 'text-rose-600'    },
  indigo: { iconBg: 'bg-indigo-50',  iconText: 'text-indigo-600'  },
  slate:  { iconBg: 'bg-slate-100',  iconText: 'text-slate-600'   },
  violet: { iconBg: 'bg-violet-50',  iconText: 'text-violet-600'  },
  amber:  { iconBg: 'bg-amber-50',   iconText: 'text-amber-600'   },
}

// ── Individual card ────────────────────────────────────────────────────────
function FeatureCard({
  feature, isHovered, onEnter, onLeave,
}: {
  feature: typeof features[0]
  isHovered: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mouse, setMouse] = useState({ x: 50, y: 50 })
  const c = iconStyle[feature.color] ?? iconStyle.slate

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const r = cardRef.current.getBoundingClientRect()
    setMouse({ x: e.clientX - r.left, y: e.clientY - r.top })
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative rounded-2xl h-full overflow-hidden transition-colors duration-500 border ${isHovered ? 'shadow-2xl shadow-primary/10' : 'shadow-sm'}`}
      style={{ 
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      animate={{
        y: isHovered ? -8 : 0,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      {/* ── Subtle mouse-follow highlight ── */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovered ? 0.3 : 0,
          background: `radial-gradient(400px circle at ${mouse.x}px ${mouse.y}px, var(--color-primary-soft), transparent 80%)`,
        }}
      />

      {/* ── Content ── */}
      <div className="relative p-7 z-10">

        {/* Icon */}
        <motion.div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors duration-500 ${c.iconBg} ${c.iconText}`}
          style={{ 
            backgroundColor: 'var(--color-primary-soft)',
            color: 'var(--color-primary)' 
          }}
          animate={{ scale: isHovered ? 1.15 : 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 24 }}
        >
          <feature.icon size={21} />
        </motion.div>

        {/* Title */}
        <h3 className="text-[16px] font-bold leading-snug mb-2.5 transition-colors duration-500 text-secondary">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-[12.5px] leading-relaxed transition-colors duration-500 text-text-muted">
          {feature.description}
        </p>
      </div>
    </motion.div>
  )
}

// ── Section ────────────────────────────────────────────────────────────────
export default function Features() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section
      id="features"
      className="relative py-24 lg:py-32 overflow-hidden transition-colors duration-500"
    >
      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--color-text-muted) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block text-primary font-bold text-sm tracking-wide uppercase mb-4">Why Grid</span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-secondary mb-5">
            The <span className="text-primary">Grid</span> Advantage
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Everything you need for your campus life, gathered in one powerful app.
          </p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {features.map((feature, i) => (
            <AnimatedSection key={feature.title} delay={i * 0.04}>
              <FeatureCard
                feature={feature}
                isHovered={hovered === i}
                onEnter={() => setHovered(i)}
                onLeave={() => setHovered(null)}
              />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
