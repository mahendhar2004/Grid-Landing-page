import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ArrowRight, Sparkles } from 'lucide-react'
import { faqCategories } from '../data/faqs'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedSection from '../components/ui/AnimatedSection'

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(0)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const currentFaqs = faqCategories[activeCategory].faqs

  return (
    <div className="min-h-screen transition-colors duration-1000 relative"
      style={{ backgroundColor: 'var(--color-bg-page)' }}
    >
      <div className="max-w-5xl mx-auto px-6 py-20 lg:py-32 relative z-10"
        style={{ color: 'var(--color-text)' }}
      >
        
        {/* ── Header ── */}
        <AnimatedSection direction="up" className="mb-20">
          <Link to="/" className="group inline-flex items-center gap-2 text-sm font-bold text-primary mb-10 hover:translate-x-[-4px] transition-all">
            <ArrowRight size={16} className="rotate-180" /> Back to Home
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-2xl">
              <span className="inline-block text-primary font-bold text-sm tracking-wide uppercase mb-6">Support Center</span>
              <h1 className="text-5xl sm:text-7xl font-bold text-secondary tracking-tight leading-[0.95] mb-8 transition-colors">
                Frequently Asked<br />
                <span className="text-primary italic">Questions.</span>
              </h1>
              <p className="text-text-muted text-lg leading-relaxed transition-colors max-w-xl">
                Got a question? We've got answers. If you can't find what you're looking for, our support team is just a message away.
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* ── Category Selectors ── */}
        <AnimatedSection direction="up" delay={0.1}>
          <div className="flex flex-wrap gap-3 mb-16">
            {faqCategories.map((cat, i) => (
              <button
                key={cat.name}
                onClick={() => { setActiveCategory(i); setOpenIndex(null) }}
                className={`px-8 py-3.5 rounded-full text-sm font-bold transition-all duration-500 border ${
                  i === activeCategory
                    ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20'
                    : 'bg-surface text-text-muted border-border hover:border-primary/40 hover:text-primary shadow-sm'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* ── FAQ List ── */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-16 items-start">
          <AnimatedSection direction="up" delay={0.2} className="space-y-4">
            {currentFaqs.map((faq, i) => (
              <div
                key={i}
                className="group relative rounded-[32px] border overflow-hidden transition-all duration-500"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-8 text-left relative z-10"
                >
                  <span className={`text-[16px] font-bold tracking-tight transition-all duration-500 ${openIndex === i ? 'text-primary' : 'text-secondary'}`}>
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${openIndex === i ? 'bg-primary text-white rotate-180' : 'bg-muted text-text-muted opacity-40'}`}>
                    <ChevronDown size={14} strokeWidth={3} />
                  </div>
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-10 pb-10 text-[14.5px] text-text-muted leading-relaxed transition-colors font-medium">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </AnimatedSection>

          {/* ── Sidebar ── */}
          <AnimatedSection direction="right" delay={0.3} className="space-y-6">
            <div className="rounded-[40px] border p-8 transition-all duration-1000 shadow-2xl relative overflow-hidden"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 animate-bounce transition-all">
                  <Sparkles size={22} fill="currentColor" />
                </div>
                <h3 className="text-xl font-bold text-secondary tracking-tight mb-4 transition-colors">Still have questions?</h3>
                <p className="text-sm text-text-muted leading-relaxed mb-10 transition-colors">
                  We're here to help. Reach out to our support team and we'll get back to you as soon as possible.
                </p>
                <a
                  href="mailto:contact.galvam@gmail.com"
                  className="group block w-full bg-primary text-white py-4.5 rounded-2xl text-sm font-bold text-center transition-all hover:shadow-xl hover:shadow-primary/30"
                >
                  Contact Support
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4 rounded-3xl border opacity-60 transition-colors"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-text-muted transition-colors">Response in &lt; 24h</span>
            </div>
          </AnimatedSection>
        </div>

      </div>
    </div>
  )
}
