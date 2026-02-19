import AnimatedSection from '../ui/AnimatedSection'
import { features, featureColors } from '../../data/features'

export default function Features() {
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-secondary mb-5">
            The <span className="text-primary">Grid<span className="brand-dot" /></span> Advantage
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Everything you need for your campus life, gathered in one powerful app.
          </p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const colors = featureColors[feature.color]
            return (
              <AnimatedSection key={feature.title} delay={i * 0.05}>
                <div className="group p-8 bg-surface rounded-2xl border border-border hover:border-primary hover:bg-white hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.04)] transition-all duration-300 h-full">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colors.bg} ${colors.text}`}>
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-secondary mb-3">{feature.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{feature.description}</p>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
