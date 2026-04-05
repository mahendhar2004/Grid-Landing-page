import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { UserCheck, Search, MessageCircle, Handshake } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: UserCheck,
    title: 'Sign Up Instantly',
    description: "Create your account with Google in seconds. Select your college, set your graduation year, and you're all set.",
    tag: 'Free & instant',
  },
  {
    number: '02',
    icon: Search,
    title: 'Browse or List',
    description: 'Explore items listed by your campus peers or post your own with photos, price, and category.',
    tag: '100+ categories',
  },
  {
    number: '03',
    icon: MessageCircle,
    title: 'Chat in Real-Time',
    description: 'Message buyers or sellers directly. Negotiate prices, ask questions, and finalize details — all in-app.',
    tag: 'Negotiate freely',
  },
  {
    number: '04',
    icon: Handshake,
    title: 'Close the Deal',
    description: 'Meet on campus and make the exchange. Safe, local, and hassle-free — no shipping needed.',
    tag: 'Campus-safe',
  },
]

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0)
  const [userHovered, setUserHovered] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-80px' })

  // Auto-advance through steps unless user is hovering
  useEffect(() => {
    if (userHovered) return
    const timer = setInterval(() => {
      setActiveStep(prev => (prev + 1) % steps.length)
    }, 2200)
    return () => clearInterval(timer)
  }, [userHovered])

  return (
    <section id="how-it-works" className="py-24 lg:py-32 relative overflow-hidden transition-colors duration-500">

      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--color-text-muted) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6" ref={sectionRef}>

        {/* ── Header ── */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <span className="inline-block text-primary font-bold text-sm tracking-wide uppercase mb-4">
            Getting Started
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-secondary mb-5 transition-colors">
            How <span className="text-primary">Grid</span> Works
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto transition-colors">
            Four simple steps from signup to sealed deal. It's that easy.
          </p>
        </motion.div>

        {/* ── Step tracker bar ── */}
        <div className="hidden lg:flex justify-center mb-12">
          <div className="flex items-center gap-0">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center">
                {/* Circle */}
                <motion.button
                  onClick={() => { setActiveStep(i); setUserHovered(true) }}
                  className="relative w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold z-10 transition-colors duration-300 cursor-pointer"
                  animate={{
                    backgroundColor: activeStep === i ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: activeStep === i ? '#ffffff' : 'var(--color-text-muted)',
                    boxShadow: activeStep === i
                      ? '0 0 0 4px var(--color-primary-soft)'
                      : '0 0 0 1px var(--color-border)',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {step.number}
                </motion.button>

                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="w-32 h-[2px] bg-border relative overflow-hidden mx-1">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-primary origin-left"
                      animate={{ scaleX: activeStep > i ? 1 : 0 }}
                      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Step cards ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => {
            const isActive = activeStep === i
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.1 + i * 0.12, ease: [0.4, 0, 0.2, 1] }}
                onHoverStart={() => { setActiveStep(i); setUserHovered(true) }}
                onHoverEnd={() => setUserHovered(false)}
                className="cursor-default"
              >
                <motion.div
                  className="relative rounded-2xl p-6 h-full overflow-hidden transition-colors duration-500 border"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)'
                  }}
                  animate={{
                    y: isActive ? -6 : 0,
                    boxShadow: isActive
                      ? '0 0 0 1.5px var(--color-primary-soft), 0 12px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)'
                      : '0 0 0 1px var(--color-border), 0 2px 8px rgba(0,0,0,0.04)',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                >
                  {/* Maximum Intensity Ghost step number — Deep Cut Positioning */}
                  <motion.div
                    key={`${step.number}-${isActive}`}
                    className="absolute -bottom-4 -right-2 text-[104px] font-black leading-none select-none pointer-events-none"
                    initial={{ opacity: isActive ? 0.02 : 0.04 }}
                    animate={{ opacity: isActive ? 0.7 : 0.04 }}
                    transition={{ 
                      duration: 2.2, 
                      ease: [0.65, 0, 0.35, 1], // Deep cubic-bezier for a slow-build, heavy finish
                    }}
                    style={{ 
                      color: 'var(--color-primary)',
                      transformOrigin: 'bottom right'
                    }}
                  >
                    {step.number}
                  </motion.div>

                  {/* Active top accent line */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-[2.5px] rounded-t-2xl bg-primary origin-left"
                    animate={{ scaleX: isActive ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300"
                      animate={{
                        backgroundColor: isActive ? 'var(--color-primary-soft)' : 'var(--color-border)',
                        scale: isActive ? 1.08 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                      style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                    >
                      <step.icon size={22} />
                    </motion.div>

                    {/* Title */}
                    <h3 className={`text-[15px] font-bold mb-2 leading-snug transition-colors duration-500 ${isActive ? 'text-primary' : 'text-secondary'}`}>
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[12.5px] text-text-muted leading-relaxed mb-4 transition-colors duration-500">
                      {step.description}
                    </p>

                    {/* Tag */}
                    <motion.span
                      className="inline-block text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full transition-colors duration-300"
                      animate={{
                        backgroundColor: isActive ? 'var(--color-primary-soft)' : 'var(--color-border)',
                        color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      }}
                      transition={{ duration: 0.25 }}
                    >
                      {step.tag}
                    </motion.span>
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Mobile step dots ── */}
        <div className="flex lg:hidden justify-center gap-2 mt-8">
          {steps.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => { setActiveStep(i); setUserHovered(true) }}
              className="h-1.5 rounded-full"
              animate={{
                width: activeStep === i ? 24 : 8,
                backgroundColor: activeStep === i ? 'var(--color-primary)' : 'var(--color-border)',
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
