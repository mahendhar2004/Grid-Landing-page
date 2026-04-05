import { Zap, Sparkles, ShieldCheck, Gauge, MousePointer2 } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const experiencePillars = [
  {
    icon: Zap,
    title: 'Performance',
    subtitle: 'Blazing Fast Feed',
    description: 'Engineered for speed. A feed that loads instantly, search that responds as you type, and real-time synchronization across all your campus devices.',
    metric: '< 100ms',
    metricLabel: 'Response Time',
    color: 'blue'
  },
  {
    icon: ShieldCheck,
    title: 'Trust',
    subtitle: 'Campus Circles Only',
    description: 'Every listing, chat, and deal is gated within your exclusive college community. No outsiders, no spam — just your trusted circle.',
    metric: '100%',
    metricLabel: 'Student Only',
    color: 'emerald'
  },
  {
    icon: Sparkles,
    title: 'Craftsmanship',
    subtitle: 'Native Smoothness',
    description: 'Every screen and animation is crafted to feel effortless. Native-grade fluidity with haptic feedback that makes every deal a joy.',
    metric: '60 FPS',
    metricLabel: 'Fluid Motion',
    color: 'violet'
  }
]

const colorStyles: Record<string, any> = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-100',
    metricBg: 'bg-blue-600',
    glow: 'from-blue-200/20'
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    border: 'border-emerald-100',
    metricBg: 'bg-emerald-600',
    glow: 'from-emerald-200/20'
  },
  violet: {
    bg: 'bg-violet-50',
    icon: 'text-violet-600',
    border: 'border-violet-100',
    metricBg: 'bg-violet-600',
    glow: 'from-violet-200/20'
  }
}

export default function AppExperience() {
  return (
    <section id="experience" className="py-24 lg:py-32 relative overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        
        <AnimatedSection direction="up" className="text-center mb-16 lg:mb-24">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border transition-colors duration-700 ${'bg-surface/50 border-border text-text-muted'}`}>
            <Gauge size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Engineered for Excellence</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-secondary tracking-tight leading-[1.1] mb-6 transition-colors">
            Built for Students.<br /><span className="text-primary">Optimized for Life.</span>
          </h2>
          <p className="text-text-muted text-lg max-w-xl mx-auto leading-relaxed transition-colors">
            We stripped away the complexity of traditional marketplaces to build an experience that's fast, focused, and undeniably premium.
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-3 gap-8 relative">
          {experiencePillars.map((p, i) => {
            const s = colorStyles[p.color]
            return (
              <AnimatedSection key={p.title} delay={i * 0.1} direction="up" className="h-full">
                <div 
                  className="group relative h-full rounded-[40px] border p-8 lg:p-10 transition-all duration-500 hover:shadow-2xl flex flex-col overflow-hidden"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  
                  {/* Subtle Glow Ascent */}
                  <div className={`absolute inset-0 bg-gradient-to-b ${s.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                  <div className="relative z-10 flex flex-col h-full">
                    {/* Header: Icon + Title */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500"
                        style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
                      >
                        <p.icon size={22} />
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 text-primary`}>{p.title}</p>
                        <h3 className="text-xl font-bold text-secondary leading-none transition-colors">{p.subtitle}</h3>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-text-muted text-sm leading-relaxed mb-10 flex-1 transition-colors">
                      {p.description}
                    </p>

                    {/* Highly Premium Stat/Metric View */}
                    <div className="mt-auto pt-8 border-t border-border/50">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 transition-colors">{p.metricLabel}</p>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full bg-primary animate-pulse`} />
                            <span className="text-2xl font-black text-secondary tabular-nums tracking-tighter transition-colors">{p.metric}</span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-muted group-hover:text-primary group-hover:border-primary/20 transition-all duration-500">
                          <MousePointer2 size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            )
          })}
        </div>

        {/* Global Accent Background Orb (Subtle) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-[120px] -z-10 transition-opacity" />
      </div>
    </section>
  )
}
