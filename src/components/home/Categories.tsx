import { Plus } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import { categoryGroups } from '../../data/categories'

export default function Categories() {
  return (
    <section id="categories" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block text-primary font-bold text-sm tracking-wide uppercase mb-4">Marketplace</span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-secondary mb-5">
            If You Own It, You Can <span className="text-primary">List It</span>.
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Textbooks, tech, furniture, fashion — if a student might need it or want to sell it, there's a place for it on Grid.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-5 max-w-4xl mx-auto">
          {categoryGroups.map((group, i) => (
            <AnimatedSection key={group.name} delay={i * 0.05}>
              <div className="group bg-white border border-border rounded-2xl p-5 lg:p-6 text-center hover:border-primary/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${group.color} group-hover:scale-110 transition-transform duration-300`}>
                  <group.icon size={22} />
                </div>
                <h3 className="font-bold text-secondary text-sm">{group.name}</h3>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* "And more" row */}
        <AnimatedSection delay={0.4} className="mt-5 max-w-4xl mx-auto">
          <div className="bg-surface border border-border rounded-2xl px-6 py-4 flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus size={16} className="text-primary" />
            </div>
            <p className="text-sm font-semibold text-text-muted">
              <span className="text-secondary">112+ categories</span> across 8 groups — and if it's not listed, just pick "Other" and post anyway.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
