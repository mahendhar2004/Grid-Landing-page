import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Mail, Clock, MessageSquare, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

// ── Constants ──────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { value: 'general',      label: 'General Question' },
  { value: 'partnership',  label: 'Partnership / Collaboration' },
  { value: 'feature',      label: 'Feature Request' },
  { value: 'media',        label: 'Media Enquiry' },
  { value: 'other',        label: 'Other' },
]

const RATE_LIMIT_MS  = 2 * 60 * 1000
const RATE_LIMIT_KEY = 'grid_contact_last'

// ── Security helpers ───────────────────────────────────────────────────────────

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

// ── Types ──────────────────────────────────────────────────────────────────────

type FormState = { name: string; email: string; subject: string; message: string; honeypot: string }

// ── Component ──────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({
    name: '', email: '', subject: 'general', message: '', honeypot: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    const maxLengths: Record<string, number> = { name: 100, email: 254, message: 3000 }
    const max = maxLengths[name]
    setForm(prev => ({ ...prev, [name]: max ? value.slice(0, max) : value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (form.honeypot) return
    if (isRateLimited()) { setError('Please wait a moment before sending another message.'); return }
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    if (!isValidEmail(form.email.trim())) { setError('Please enter a valid email address.'); return }

    const subjectLabel = SUBJECTS.find(s => s.value === form.subject)?.label || 'General Question'

    setLoading(true)
    try {
      const { error: sbErr } = await supabase.from('contact_messages').insert({
        name: sanitize(form.name),
        email: form.email.trim().toLowerCase(),
        subject: subjectLabel,
        message: sanitize(form.message),
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

  // ── Success ───────────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-20">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-6 shadow-[0_20px_40px_rgba(0,123,255,0.3)]">
            <Mail size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-secondary tracking-tight mb-3">Message sent!</h2>
          <p className="text-text-muted text-sm leading-relaxed mb-8">
            We've received your message and will get back to you at <span className="font-semibold text-secondary">{form.email}</span> within 24 hours.
          </p>
          <button
            onClick={() => { setSubmitted(false); setError(null); setForm({ name: '', email: '', subject: 'general', message: '', honeypot: '' }) }}
            className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Send another message →
          </button>
        </div>
      </div>
    )
  }

  // ── Page ──────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24 lg:grid lg:grid-cols-[1fr_1.4fr] lg:gap-20 lg:items-start">

        {/* ── Left panel ── */}
        <div className="mb-14 lg:mb-0 lg:sticky lg:top-28">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[3px] text-primary mb-5">Contact Us</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-secondary leading-[1.06] mb-5">
            Let's<br />
            <span className="text-primary">talk.</span>
          </h1>
          <p className="text-text-muted text-base leading-relaxed mb-10 max-w-sm">
            Have a question, idea, or just want to say hello? We read every message and reply within 24 hours.
          </p>

          {/* Contact channels */}
          <div className="space-y-3">
            <a
              href="mailto:contact.galvam@gmail.com"
              className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-border/60 shadow-sm hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/12 transition-colors">
                <Mail size={18} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-secondary">Email</p>
                <p className="text-xs text-text-muted mt-0.5 truncate">contact.galvam@gmail.com</p>
              </div>
              <ArrowRight size={15} className="text-text-muted/40 group-hover:text-primary mt-0.5 ml-auto flex-shrink-0 transition-colors" />
            </a>

            <a
              href="https://www.instagram.com/grid_galvam"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-border/60 shadow-sm hover:border-pink-300/60 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0 group-hover:bg-pink-100 transition-colors">
                <Instagram size={18} className="text-pink-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary">Instagram</p>
                <p className="text-xs text-text-muted mt-0.5">@grid_galvam</p>
              </div>
              <ArrowRight size={15} className="text-text-muted/40 group-hover:text-pink-400 mt-0.5 ml-auto flex-shrink-0 transition-colors" />
            </a>

            <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-border/60 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary">Response Time</p>
                <p className="text-xs text-text-muted mt-0.5">Usually within 24 hours</p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-8 pt-8 border-t border-border/50">
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-text-muted/60 mb-4">Quick Links</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'FAQs', to: '/faqs' },
                { label: 'Report a Bug', to: '/bug-report' },
                { label: 'Leave a Review', to: '/reviews' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-1.5 text-xs font-semibold text-text-muted bg-white border border-border/60 px-3 py-1.5 rounded-full hover:text-primary hover:border-primary/30 transition-colors"
                >
                  <MessageSquare size={10} />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div className="bg-white rounded-3xl border border-border/60 shadow-[0_4px_40px_rgba(0,0,0,0.06)] overflow-hidden">

          {/* Header stripe */}
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

            {/* Subject */}
            <Field label="Subject" required>
              <div className="relative">
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-[#fafafa] text-secondary appearance-none cursor-pointer"
                >
                  {SUBJECTS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                  <svg className="w-4 h-4 text-text-muted/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </Field>

            {/* Message */}
            <Field label="Message" required hint={`${form.message.length}/3000`}>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={6}
                maxLength={3000}
                placeholder="Tell us what's on your mind…"
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
                  Sending…
                </span>
              ) : 'Send Message'}
            </button>

            <p className="text-xs text-text-muted text-center leading-relaxed">
              We read every message and reply within 24 hours.
            </p>
          </form>
        </div>

      </div>
    </div>
  )
}

// ── Small field components ─────────────────────────────────────────────────────

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
