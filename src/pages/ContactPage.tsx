import { useState } from 'react'
import { Instagram, Mail, Clock, ArrowRight, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import AnimatedSection from '../components/ui/AnimatedSection'

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
    setForm((prev: FormState) => ({ ...prev, [name]: max ? value.slice(0, max) : value }))
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

  // ── Success State ─────────────────────────────────────────────────────────────

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
            <Mail size={32} />
          </div>
          <h2 className="text-3xl font-bold text-secondary tracking-tight mb-4 transition-colors">Message received!</h2>
          <p className="text-text-muted text-base leading-relaxed mb-10 transition-colors">
            We've got your message and we'll get back to you at <span className="text-primary font-semibold">{form.email}</span> within 24 hours.
          </p>
          <button
            onClick={() => { setSubmitted(false); setError(null); setForm({ name: '', email: '', subject: 'general', message: '', honeypot: '' }) }}
            className="flex items-center gap-2 mx-auto text-sm font-bold text-primary hover:text-primary-dark transition-all"
          >
            Send another message <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    )
  }

  // ── Page View ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen transition-colors duration-1000 relative"
      style={{ backgroundColor: 'var(--color-bg-page)' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32 relative z-10 lg:grid lg:grid-cols-[1fr_1.3fr] lg:gap-24 lg:items-start"
        style={{ color: 'var(--color-text)' }}
      >

        {/* ── Left Content ── */}
        <AnimatedSection direction="left" className="mb-20 lg:mb-0 lg:sticky lg:top-28">
          <span className="inline-block text-primary font-bold text-sm tracking-wide uppercase mb-6">Contact Us</span>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-secondary leading-[1.05] mb-8 transition-colors">
            Let's keep in<br />
            <span className="text-primary">touch.</span>
          </h1>
          
          <p className="text-text-muted text-lg leading-relaxed mb-12 max-w-sm transition-colors">
            Have a question, an idea, or just want to say hi? We're here to help and we read every message.
          </p>

          <div className="space-y-4 max-w-md">
            {/* Contact Channels */}
            <a href="mailto:contact.galvam@gmail.com" 
              className="group flex items-center gap-5 p-6 rounded-[32px] border transition-all duration-500 hover:shadow-xl"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Mail size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-secondary transition-colors">Email Us</p>
                <p className="text-xs text-text-muted opacity-70 transition-colors">contact.galvam@gmail.com</p>
              </div>
              <ArrowRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </a>

            <a href="https://www.instagram.com/grid_galvam" target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-5 p-6 rounded-[32px] border transition-all duration-500 hover:shadow-xl"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                <Instagram size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-secondary transition-colors">Instagram</p>
                <p className="text-xs text-text-muted opacity-70 transition-colors">@grid_galvam</p>
              </div>
              <ArrowRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </a>

            <div className="flex items-center gap-5 p-6 rounded-[32px] border transition-all duration-500"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-secondary transition-colors">Response Time</p>
                <p className="text-xs text-text-muted opacity-70 transition-colors">Usually within 24 hours</p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* ── Right Content ── */}
        <AnimatedSection direction="right">
          <div className="relative rounded-[48px] border shadow-2xl transition-all duration-1000 overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="p-10 lg:p-14 relative z-10 transition-colors duration-1000">
              <h3 className="text-2xl font-bold text-secondary mb-10 transition-colors">Send us a message</h3>

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
                    <TextInput id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="name@example.com" maxLength={254} autoComplete="email" />
                  </Field>
                </div>

                <Field label="Subject" required>
                  <div className="relative">
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full px-6 py-4 border rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
                      style={{ backgroundColor: 'var(--color-bg-page)', borderColor: 'var(--color-border)', color: 'var(--color-secondary)' }}
                    >
                      {SUBJECTS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-6 flex items-center">
                      <ChevronDown size={18} className="text-text-muted/40" />
                    </div>
                  </div>
                </Field>

                <Field label="Your Message" required hint={`${form.message.length}/3000`}>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={6}
                    maxLength={3000}
                    placeholder="Tell us what's on your mind..."
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
                      <motion.span key="normal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        Send Message <ArrowRight size={18} />
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

// ── Atomic Field Components ───────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <label className="text-sm font-bold text-secondary transition-colors">
          {label}
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
