import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef } from 'react'
import {
  Banknote, Store, TrendingUp,
  Monitor, GraduationCap,
  Zap, BadgePercent, Shuffle,
  Flag, Briefcase, Home, Sparkles
} from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const problemSolutions = [
  {
    category: "The Setup Squeeze",
    problem: "Starting a new semester shouldn't break the bank. Local shops charge 3x for basic coolers, cycles, and induction stoves knowing you're desperate.",
    solution: "Skip the market. Buy premium hostel amenities (coolers, beds, gear) directly from seniors at 'no-brainer' prices. Save thousands instantly.",
    problemIcon: Store,
    solutionIcon: BadgePercent,
    accent: "#ef4444",
    solutionAccent: "#10b981",
    gradient: "from-rose-500/10 via-transparent to-transparent",
    solutionGradient: "from-emerald-500/10 via-transparent to-transparent"
  },
  {
    category: "The Logistics Void",
    problem: "Navigating campus social groups to sell your used cycle or novels is a nightmare. Lowballers, ghosting, and awkward public meetups eat your time.",
    solution: "Close deals in minutes. List with a tap, chat securely, and schedule pick-ups using your campus credits. Zero commission, zero stress.",
    problemIcon: Shuffle,
    solutionIcon: Zap,
    accent: "#f59e0b",
    solutionAccent: "#3b82f6",
    gradient: "from-amber-500/10 via-transparent to-transparent",
    solutionGradient: "from-blue-500/10 via-transparent to-transparent"
  }
]

const useCases = [
  {
    year: "Year 4 • Graduate & Cash Out",
    title: "Liquidate for the Next Chapter.",
    description: "Don't leave your room value behind. Sell your cooler, bed, fan, and years of collected novels to the incoming juniors. Walk out with a clean room and a heavy wallet.",
    icon: Banknote,
    nodeIcon: Flag,
    color: "amber",
    tag: "The Big Payout"
  },
  {
    year: "Year 3 • The Tech Upgrade",
    title: "Flip Your Productivity.",
    description: "Done with that heavy-duty mechanical keyboard or specialized coding monitor? Flip it on Grid to fund your internship travel or new professional laptop.",
    icon: Monitor,
    nodeIcon: Briefcase,
    color: "blue",
    tag: "Professional Edge"
  },
  {
    year: "Year 2 • Survival & Comfort",
    title: "Upgrade Without the Cost.",
    description: "Hostel life is a marathon. Trade up your first-year cycle for a geared one, or swap your old chair for a better workstation. Buy cheap, sell for the same.",
    icon: TrendingUp,
    nodeIcon: Home,
    color: "rose",
    tag: "Life Optimization"
  },
  {
    year: "Year 1 • The Smart Start",
    title: "Join the Shared Economy.",
    description: "Start your journey by making every rupee count. Grab a pre-owned cycle and a stack of self-help books for the price of a single pizza. Value from day one.",
    icon: GraduationCap,
    nodeIcon: Sparkles,
    color: "emerald",
    tag: "Foundational Value"
  }
]

export default function Lifecycle() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  })

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const glowY = useTransform(smoothProgress, [0, 1], ["0%", "100%"])
  const pathLength = useTransform(smoothProgress, [0, 1], [0, 1])

  return (
    <section ref={containerRef} id="lifecycle" className="py-24 lg:py-64 relative overflow-hidden bg-background">

      {/* ── Extraordinary Background Orbs ────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] -left-[10%] w-[800px] h-[800px] bg-primary/5 blur-[160px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, 60, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-500/5 blur-[140px] rounded-full"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* ── Hero Heading ──────────────────────────────────────────────────────── */}
        <div className="text-center mb-40">
          <AnimatedSection direction="scale">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-surface-base border border-border/40 mb-10 backdrop-blur-2xl shadow-xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-[6px] text-text-muted">The Campus Lifecycle</span>
            </div>
            <h2 className="text-6xl sm:text-[140px] font-black leading-[0.8] tracking-tightest mb-12 text-secondary italic">
              The Grid <br />
              <span className="text-primary not-italic bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Ecosystem.</span>
            </h2>
            <p className="text-text-muted text-lg sm:text-2xl max-w-3xl mx-auto font-semibold italic opacity-60">
              We've re-engineered the campus market from the ground up. <br />
              Buy, Use, Sell, Repeat. 100% Student Value.
            </p>
          </AnimatedSection>
        </div>

        {/* ── 1. Comparison Grid (Problem vs Solution) ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-64">
          {problemSolutions.map((item, idx) => (
            <ProblemSolutionCard key={idx} item={item} index={idx} />
          ))}
        </div>

        {/* ── 2. The Great Connector (Timeline) ─────────────────────────────────── */}
        <div className="relative">

          <div className="text-center mb-32">
            <h3 className="text-2xl sm:text-5xl font-black text-secondary italic tracking-tighter mb-4">Your 4-Year Journey</h3>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.5)]" />
          </div>

          <div className="relative">
            {/* The Liquid Energy Pipe */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-border/10 hidden lg:block overflow-hidden">
              <motion.div
                style={{ top: glowY }}
                className="absolute left-1/2 -translate-x-1/2 w-4 h-64 bg-gradient-to-b from-primary via-blue-500 to-transparent blur-3xl opacity-80"
              />
              <motion.div
                style={{ scaleY: pathLength }}
                className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-primary to-blue-500 origin-top shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]"
              />
            </div>

            <div className="space-y-40 lg:space-y-72 relative">
              {useCases.map((useCase, index) => (
                <LifecycleNode key={index} item={useCase} index={index} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-64 text-center">
          <AnimatedSection>
            <div className="p-12 rounded-[64px] bg-surface-base border border-border/40 backdrop-blur-3xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <span className="text-[12px] font-black uppercase tracking-[15px] text-text-muted opacity-30 italic block mb-4">
                The Full Cycle of Campus Life.
              </span>
              <p className="text-secondary text-2xl font-black italic">Start your economy today.</p>
            </div>
          </AnimatedSection>
        </div>

      </div>
    </section>
  )
}

function ProblemSolutionCard({ item, index }: { item: typeof problemSolutions[0], index: number }) {
  return (
    <AnimatedSection direction={index % 2 === 0 ? 'left' : 'right'} delay={0.1}>
      <div className="relative group perspective-1000">
        <motion.div
          whileHover={{ rotateX: 2, rotateY: index % 2 === 0 ? 2 : -2, y: -5 }}
          className="relative bg-[#0a0a0a] border border-white/5 rounded-[56px] overflow-hidden shadow-3xl overflow-hidden transition-all duration-700"
        >
          {/* Subtle Dynamic Gradients */}
          <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-40 group-hover:opacity-60 transition-opacity`} />
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${item.solutionGradient} blur-[100px] opacity-20`} />

          <div className="relative z-10 p-10 lg:p-14">

            <div className="flex flex-col gap-12">

              {/* Problem Block */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40">
                    <item.problemIcon size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[4px] text-white/30">The Struggle</span>
                </div>
                <h4 className="text-2xl font-black text-white italic">{item.category}</h4>
                <p className="text-lg text-white/50 font-medium leading-relaxed italic pr-10">
                  {item.problem}
                </p>
              </div>

              {/* The "Bridge" */}
              <div className="h-[1px] w-full bg-gradient-to-r from-white/0 via-white/10 to-white/0" />

              {/* Solution Block */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)]">
                    <item.solutionIcon size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[4px] text-primary">The Grid Flip</span>
                </div>
                <p className="text-xl text-white font-bold leading-relaxed">
                  {item.solution}
                </p>
              </div>

            </div>
          </div>

          {/* Bottom Bar Styling */}
          <div className="h-2 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />
        </motion.div>
      </div>
    </AnimatedSection>
  )
}

function LifecycleNode({ item, index }: { item: typeof useCases[0], index: number }) {
  const isEven = index % 2 === 0

  return (
    <div className="relative group">

      {/* Node Marker */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-12 h-12 rounded-full border-4 border-background bg-surface-base shadow-2xl flex items-center justify-center transition-all duration-500 group-hover:border-primary group-hover:scale-125"
          >
            <div className="w-3 h-3 rounded-full bg-primary group-hover:scale-125 transition-transform duration-500" />
          </motion.div>
          {/* Visual Pulse */}
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
        </div>
      </div>

      <div className={`flex flex-col lg:flex-row items-center gap-16 lg:gap-40 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>

        {/* Content Half */}
        <div className="flex-1 w-full lg:max-w-xl">
          <AnimatedSection direction={isEven ? 'left' : 'right'}>
            <div className={`${isEven ? 'lg:text-right' : 'text-left'} space-y-8`}>
              <div className={`flex items-center gap-4 ${isEven ? 'lg:justify-end' : 'justify-start'}`}>
                <span className="text-[10px] font-black uppercase tracking-[10px] text-primary italic opacity-50">{item.tag}</span>
              </div>
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-text-muted opacity-40 italic">{item.year}</h4>
                <h3 className="text-4xl sm:text-7xl font-black text-secondary tracking-tightest leading-none italic group-hover:text-primary transition-colors duration-500">
                  {item.title}
                </h3>
              </div>
              <p className="text-lg sm:text-xl text-text-muted font-semibold leading-relaxed italic opacity-80 max-w-lg ml-auto mr-auto lg:mr-0 lg:ml-auto">
                {item.description}
              </p>
            </div>
          </AnimatedSection>
        </div>

        {/* Visual Half */}
        <div className="flex-1 w-full max-w-[400px]">
          <AnimatedSection direction={isEven ? 'right' : 'left'}>
            <motion.div
              whileHover={{ rotateY: isEven ? -15 : 15, scale: 1.05 }}
              className="relative aspect-square rounded-[80px] p-1 shadow-3xl group-hover:shadow-primary/20 transition-all duration-1000"
            >
              {/* Complex Glass Surface */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-[80px] backdrop-blur-3xl border border-white/5" />
              <div className="absolute inset-4 bg-[#0a0a0a] rounded-[64px]" />

              <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
                  <div className="relative p-10 rounded-[48px] bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-sm">
                    <item.icon size={84} strokeWidth={1} className="text-primary drop-shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.5)]" />
                  </div>
                </div>
              </div>

              {/* Corner Accents */}
              <div className="absolute top-10 right-10 w-3 h-3 rounded-full bg-primary/40 blur-sm" />
              <div className="absolute bottom-10 left-10 w-3 h-3 rounded-full bg-blue-500/40 blur-sm" />
            </motion.div>
          </AnimatedSection>
        </div>

      </div>
    </div>
  )
}
