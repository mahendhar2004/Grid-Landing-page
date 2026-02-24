import AnimatedSection from '../ui/AnimatedSection'
import { features, featureColors } from '../../data/features'

export default function Features() {
  return (
    <section id="features" className="relative py-24 lg:py-32">
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => {
            const colors = featureColors[feature.color]
            return (
              <AnimatedSection key={feature.title} delay={i * 0.05}>
                <div className="group relative p-7 bg-white rounded-2xl border border-border hover:border-primary/30 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all duration-300 h-full">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${colors.bg} ${colors.text} group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon size={22} />
                  </div>
                  <h3 className="text-[17px] font-bold text-secondary mb-2.5">{feature.title}</h3>
                  <p className="text-text-muted text-[13px] leading-relaxed">{feature.description}</p>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
