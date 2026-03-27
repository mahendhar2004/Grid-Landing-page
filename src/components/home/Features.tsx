import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
      className="relative rounded-2xl h-full overflow-hidden bg-white"
      onMouseMove={handleMouseMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      animate={{
        y: isHovered ? -8 : 0,
        scale: isHovered ? 1.02 : 1,
        boxShadow: isHovered
          ? '0 0 0 1px rgba(0,0,0,0.09), 0 8px 24px rgba(0,0,0,0.09), 0 24px 56px rgba(0,0,0,0.07)'
          : '0 0 0 1px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.04)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      {/* ── Subtle white shine sweep on hover enter ── */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            key="shine"
            className="absolute inset-0 pointer-events-none z-10"
            initial={{ x: '-100%' }}
            animate={{ x: '220%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            style={{
              background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.65) 50%, transparent 65%)',
              width: '100%',
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Subtle mouse-follow highlight ── */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(280px circle at ${mouse.x}px ${mouse.y}px, rgba(0,0,0,0.025), transparent 70%)`,
        }}
      />

      {/* ── Content ── */}
      <div className="relative p-7 z-10">

        {/* Icon */}
        <motion.div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${c.iconBg} ${c.iconText}`}
          animate={{ scale: isHovered ? 1.15 : 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 24 }}
        >
          <feature.icon size={21} />
        </motion.div>

        {/* Title */}
        <motion.h3
          className="text-[16px] font-bold leading-snug mb-2.5"
          animate={{ color: isHovered ? '#111827' : '#374151' }}
          transition={{ duration: 0.2 }}
        >
          {feature.title}
        </motion.h3>

        {/* Description */}
        <motion.p
          className="text-[12.5px] leading-relaxed"
          animate={{ color: isHovered ? '#6B7280' : '#9CA3AF' }}
          transition={{ duration: 0.2 }}
        >
          {feature.description}
        </motion.p>
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
      className="relative py-24 lg:py-32 overflow-hidden bg-white"
    >
      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.055) 1px, transparent 0)',
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
