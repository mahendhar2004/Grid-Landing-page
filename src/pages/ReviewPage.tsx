import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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
    if (isRateLimited()) { setError('Please wait a moment before submitting another review.'); return }
    if (!form.name.trim() || !form.email.trim() || !form.feedback.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    if (!isValidEmail(form.email.trim())) { setError('Please enter a valid email address.'); return }
    if (form.rating < 1 || form.rating > 5 || !Number.isInteger(form.rating)) {
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

  // ── Success ──────────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-20">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-6 shadow-[0_20px_40px_rgba(0,123,255,0.3)]">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-secondary tracking-tight mb-3">Thanks for the review!</h2>
          <p className="text-text-muted text-sm leading-relaxed mb-8">
            Your feedback has been submitted. Our team will review it and may feature it on our homepage.
          </p>
          <button
            onClick={resetForm}
            className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Submit another review →
          </button>
        </div>
      </div>
    )
  }

  // ── Form ─────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24 lg:grid lg:grid-cols-[1fr_1.4fr] lg:gap-20 lg:items-start">

        {/* ── Left panel ── */}
        <div className="mb-14 lg:mb-0 lg:sticky lg:top-28">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[3px] text-primary mb-5">Leave a Review</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-secondary leading-[1.06] mb-5">
            Share your<br />
            <span className="text-primary">experience.</span>
          </h1>
          <p className="text-text-muted text-base leading-relaxed mb-10 max-w-sm">
            Your honest feedback helps other students discover Grid and helps us keep improving.
          </p>

          {/* Info cards */}
          <div className="space-y-3">
            {[
              { icon: '⭐', title: 'Your voice matters', desc: 'Selected reviews are featured on our homepage' },
              { icon: '🔒', title: 'Honest & private', desc: 'Your email is never shared publicly' },
              { icon: '🎓', title: 'For students', desc: 'Help your campus community make better decisions' },
            ].map((card) => (
              <div key={card.title} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-border/60 shadow-sm">
                <span className="text-xl mt-0.5 flex-shrink-0">{card.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-secondary">{card.title}</p>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="mt-8 pt-8 border-t border-border/50">
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-text-muted/60 mb-4">Quick Links</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'FAQs', to: '/faqs' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'Report a Bug', to: '/bug-report' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-1.5 text-xs font-semibold text-text-muted bg-white border border-border/60 px-3 py-1.5 rounded-full hover:text-primary hover:border-primary/30 transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div className="bg-white rounded-3xl border border-border/60 shadow-[0_4px_40px_rgba(0,0,0,0.06)] overflow-hidden">

          {/* Form header stripe */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-primary/30" />

          <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-7">

            {/* Honeypot */}
            <div style={{ display: 'none' }} aria-hidden="true">
              <input name="honeypot" type="text" value={form.honeypot} onChange={handleChange} tabIndex={-1} autoComplete="off" />
            </div>

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Your Name" required>
                <TextInput id="name" name="name" value={form.name} onChange={handleChange} placeholder="Ravi Kumar" maxLength={100} autoComplete="name" />
              </Field>
              <Field label="Email Address" required>
                <TextInput id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="ravi@college.edu" maxLength={254} autoComplete="email" />
              </Field>
            </div>

            {/* College */}
            <Field label="College / University">
              <TextInput id="college" name="college" value={form.college} onChange={handleChange} placeholder="e.g. IIT Bombay (optional)" maxLength={100} />
            </Field>

            {/* Star Rating */}
            <Field label="Your Rating" required>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, rating: star }))}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`${star} star`}
                  >
                    <span className={
                      star <= (hoveredRating || form.rating)
                        ? 'text-amber-400'
                        : 'text-gray-200'
                    }>★</span>
                  </button>
                ))}
                {form.rating > 0 && (
                  <span className="text-sm text-text-muted ml-1">
                    {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][form.rating]}
                  </span>
                )}
              </div>
            </Field>

            {/* Feedback */}
            <Field label="Your Feedback" required hint={`${form.feedback.length}/2000`}>
              <textarea
                id="feedback" name="feedback"
                value={form.feedback} onChange={handleChange}
                rows={5} maxLength={2000}
                placeholder="Tell us what you love about Grid, or how we can improve…"
                className="w-full px-4 py-3 border border-border/60 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors placeholder:text-text-muted/50 bg-[#fafafa]"
                required
              />
            </Field>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-white font-bold py-4 px-6 rounded-2xl hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 hover:shadow-lg text-[15px] tracking-tight"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Submitting…
                </span>
              ) : 'Submit Review'}
            </button>

            <p className="text-xs text-text-muted text-center leading-relaxed">
              Submitted reviews are read by our team. We may feature your review on the homepage with your name.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Small field components ────────────────────────────────────────────────────

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-secondary">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-[11px] text-text-muted">{hint}</span>}
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
      className="w-full px-4 py-3 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors placeholder:text-text-muted/50 bg-[#fafafa]"
    />
  )
}
