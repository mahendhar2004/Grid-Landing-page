import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { faqCategories } from '../data/faqs'
import { motion, AnimatePresence } from 'framer-motion'

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(0)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const currentFaqs = faqCategories[activeCategory].faqs

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12">
          <Link to="/" className="text-primary text-sm font-semibold hover:underline">&larr; Back to Home</Link>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-secondary mt-6 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-text-muted text-lg">
            Everything you need to know about Grid. Can't find what you're looking for?{' '}
            <a href="mailto:support@grid.app" className="text-primary hover:underline">Contact support</a>.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {faqCategories.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => { setActiveCategory(i); setOpenIndex(null) }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                i === activeCategory
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface text-text-muted border border-border hover:border-primary hover:text-primary'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* FAQ list */}
        <div className="space-y-3">
          {currentFaqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white border border-border rounded-2xl overflow-hidden hover:border-slate-200 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-secondary pr-4">{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`text-text-muted flex-shrink-0 transition-transform duration-300 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="px-6 pb-6 text-text-muted leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-16 bg-primary-soft rounded-3xl p-10 text-center">
          <h3 className="text-2xl font-bold text-secondary mb-3">Still have questions?</h3>
          <p className="text-text-muted mb-6">
            We're here to help. Reach out to our support team and we'll get back to you as soon as possible.
          </p>
          <a
            href="mailto:support@grid.app"
            className="inline-block bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
