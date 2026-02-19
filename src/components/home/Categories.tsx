import AnimatedSection from '../ui/AnimatedSection'
import { categoryGroups } from '../../data/categories'

export default function Categories() {
  return (
    <section id="categories" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-secondary mb-5">
            <span className="text-primary">112+</span> Categories, 8 Groups
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            From tech gadgets to kitchen essentials — everything a student needs, organized perfectly.
          </p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categoryGroups.map((group, i) => (
            <AnimatedSection key={group.name} delay={i * 0.05}>
              <div className="group bg-white border border-border rounded-2xl p-6 hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${group.color}`}>
                  <group.icon size={22} />
                </div>
                <h3 className="font-bold text-secondary mb-1">{group.name}</h3>
                <p className="text-xs text-primary font-semibold mb-3">{group.count} categories</p>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="text-[11px] px-2.5 py-1 bg-surface text-text-muted rounded-full border border-border"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
