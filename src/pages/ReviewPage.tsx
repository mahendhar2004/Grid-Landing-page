import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, ShieldCheck, ArrowRight, Heart, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import AnimatedSection from '../components/ui/AnimatedSection'

// ── Constants ─────────────────────────────────────────────────────────────────

const RATE_LIMIT_MS  = 2 * 60 * 1000
const RATE_LIMIT_KEY = 'grid_review_last'

// ── Security helpers ──────────────────────────────────────────────────────────

function sanitize(v: string) {
  return v.replace(/<[^>]*>/g, '').replace(/&/g, '&amp;').replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;').replace(/\x00/g, '').trim()
}

function isValidEmail(e: string) {
  return e.length <= 254 &&
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/.test(e)
}

function isRateLimited() {
  try { const l = localStorage.getItem(RATE_LIMIT_KEY); return !!l && Date.now() - +l < RATE_LIMIT_MS } catch { return false }
}
function markSubmission() {
  try { localStorage.setItem(RATE_LIMIT_KEY, String(Date.now())) } catch {}
}

// ── Types ─────────────────────────────────────────────────────────────────────

type FormState = {
  name: string; email: string; college: string
  rating: number; feedback: string; honeypot: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReviewPage() {
  const [form, setForm] = useState<FormState>({
    name: '', email: '', college: '', rating: 0, feedback: '', honeypot: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredRating, setHoveredRating] = useState(0)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    const maxLengths: Record<string, number> = { name: 100, email: 254, college: 100, feedback: 2000 }
    const max = maxLengths[name]
    setForm((prev) => ({ ...prev, [name]: max ? value.slice(0, max) : value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (form.honeypot) return
    if (isRateLimited()) { setError('Please wait a moment before submitting again.'); return }
    if (!form.name.trim() || !form.email.trim() || !form.feedback.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    if (!isValidEmail(form.email.trim())) { setError('Invalid email address.'); return }
    if (form.rating < 1 || form.rating > 5) {
      setError('Please select a star rating.')
      return
    }

    setLoading(true)
    try {
      const { error: sbErr } = await supabase.from('reviews').insert({
        reviewer_name: sanitize(form.name),
        reviewer_email: form.email.trim().toLowerCase(),
        college: form.college.trim() ? sanitize(form.college) : null,
        rating: form.rating,
        feedback: sanitize(form.feedback),
      })
      if (sbErr) throw new Error(sbErr.message)
      markSubmission()
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ name: '', email: '', college: '', rating: 0, feedback: '', honeypot: '' })
    setSubmitted(false)
    setError(null)
  }

  // ── Success View ──
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-20 transition-colors duration-1000 relative"
        style={{ backgroundColor: 'var(--color-bg-page)' }}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center relative z-10 p-12 rounded-[40px] border shadow-2xl transition-all duration-1000"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-xl transition-colors"
            style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
          >
            <Heart size={32} />
          </div>
          <h2 className="text-3xl font-bold text-secondary tracking-tight mb-4 transition-colors">Shared with love</h2>
          <p className="text-text-muted text-base leading-relaxed mb-10 transition-colors">
            Thank you for sharing your experience. Your feedback helps the entire campus community thrive on Grid.
          </p>
          <button
            onClick={resetForm}
            className="flex items-center gap-2 mx-auto text-sm font-bold text-primary hover:text-primary-dark transition-all"
          >
            Submit another review <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen transition-colors duration-1000 relative"
      style={{ backgroundColor: 'var(--color-bg-page)' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32 relative z-10 lg:grid lg:grid-cols-[1fr_1.3fr] lg:gap-24 lg:items-start"
        style={{ color: 'var(--color-text)' }}
      >

        {/* ── Left Content ── */}
        <AnimatedSection direction="left" className="mb-20 lg:mb-0 lg:sticky lg:top-28">
          <Link to="/" className="group inline-flex items-center gap-2 text-sm font-bold text-primary mb-10 hover:translate-x-[-4px] transition-all">
            <ArrowRight size={16} className="rotate-180" /> Back to Home
          </Link>
          
          <span className="inline-block text-primary font-bold text-sm tracking-wide uppercase mb-6">Feedback</span>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-secondary leading-[1.05] mb-8 transition-colors">
            Share your<br />
            <span className="text-primary italic">Word.</span>
          </h1>
          
          <p className="text-text-muted text-lg leading-relaxed mb-12 max-w-sm transition-colors">
            Tell us about your experience with Grid. Your feedback helps other students decide and helps us improve the campus marketplace.
          </p>

          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-5 p-6 rounded-[32px] border transition-all duration-500"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-500">
                <Star size={20} fill="currentColor" />
              </div>
              <div>
                <p className="text-sm font-bold text-secondary transition-colors">Community Impact</p>
                <p className="text-xs text-text-muted opacity-70 transition-colors">Selected reviews are featured on our homepage</p>
              </div>
            </div>

            <div className="flex items-center gap-5 p-6 rounded-[32px] border transition-all duration-500"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-secondary transition-colors">Verified Privacy</p>
                <p className="text-xs text-text-muted opacity-70 transition-colors">Your email remains private and secure</p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* ── Right Content — Form ── */}
        <AnimatedSection direction="right">
          <div className="relative rounded-[48px] border shadow-2xl transition-all duration-1000 overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="p-10 lg:p-14 relative z-10 transition-colors duration-1000">
              <h3 className="text-2xl font-bold text-secondary mb-10 transition-colors flex items-center gap-3">
                <Sparkles size={24} className="text-primary" />
                Submit Review
              </h3>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Honeypot */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <input name="honeypot" type="text" value={form.honeypot} onChange={handleChange} tabIndex={-1} autoComplete="off" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <Field label="Your Name" required>
                    <TextInput id="name" name="name" value={form.name} onChange={handleChange} placeholder="What's your name?" maxLength={100} autoComplete="name" />
                  </Field>
                  <Field label="Email Address" required>
                    <TextInput id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="name@college.edu" maxLength={254} autoComplete="email" />
                  </Field>
                </div>

                <Field label="College / University">
                  <TextInput id="college" name="college" value={form.college} onChange={handleChange} placeholder="e.g. IIT Delhi" maxLength={100} />
                </Field>

                <Field label="Your Rating" required>
                  <div className="flex items-center gap-3 pt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, rating: star }))}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="group relative transition-all active:scale-90"
                      >
                        <Star
                          size={32}
                          className={`transition-all duration-300 ${
                            star <= (hoveredRating || form.rating)
                              ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                              : 'text-border group-hover:text-amber-400/50'
                          }`}
                        />
                        {star === (hoveredRating || form.rating) && (
                          <motion.div 
                            layoutId="star-glow"
                            className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full"
                          />
                        )}
                      </button>
                    ))}
                    {form.rating > 0 && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm font-bold text-amber-500 ml-4 italic"
                      >
                        {['', 'Not great', 'Fair', 'Good', 'Excellent', 'Absolute love!'][form.rating]}
                      </motion.span>
                    )}
                  </div>
                </Field>

                <Field label="Your Feedback" required hint={`${form.feedback.length}/2000`}>
                  <textarea
                    id="feedback" name="feedback"
                    value={form.feedback} onChange={handleChange}
                    rows={5} maxLength={2000}
                    placeholder="What did you love? Any suggestions for improvement?"
                    className="w-full px-6 py-6 border rounded-3xl text-sm font-semibold leading-relaxed resize-none focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-text-muted/40"
                    style={{ backgroundColor: 'var(--color-bg-page)', borderColor: 'var(--color-border)', color: 'var(--color-secondary)' }}
                    required
                  />
                </Field>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-sm text-red-500 font-semibold">{error}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white font-bold py-5 px-6 rounded-2xl hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-50 transition-all text-[15px] flex items-center justify-center gap-3 shadow-lg"
                >
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        Sending...
                      </motion.span>
                    ) : (
                      <motion.span key="normal" initial={{ opacity: 1 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        Submit Review <ArrowRight size={18} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </form>
            </div>
          </div>
        </AnimatedSection>

      </div>
    </div>
  )
}

// ── Small Field Components ──

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <label className="text-sm font-bold text-secondary transition-colors">
          {label}{required && <span className="text-primary ml-1">*</span>}
        </label>
        {hint && <span className="text-[11px] text-text-muted opacity-50">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function TextInput({ id, name, value, onChange, placeholder, maxLength, type = 'text', autoComplete }: {
  id: string; name: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string; maxLength?: number; type?: string; autoComplete?: string
}) {
  return (
    <input
      id={id} name={name} type={type} value={value} onChange={onChange}
      placeholder={placeholder} maxLength={maxLength} autoComplete={autoComplete}
      className="w-full px-6 py-4 border rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-text-muted/40"
      style={{ backgroundColor: 'var(--color-bg-page)', borderColor: 'var(--color-border)', color: 'var(--color-secondary)' }}
    />
  )
}
