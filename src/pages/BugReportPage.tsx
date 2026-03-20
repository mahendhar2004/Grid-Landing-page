import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'crash',           label: 'App Crash',        icon: '💥' },
  { value: 'ui_bug',          label: 'UI Bug',            icon: '🎨' },
  { value: 'performance',     label: 'Performance',       icon: '⚡' },
  { value: 'payment_issue',   label: 'Payment Issue',     icon: '💳' },
  { value: 'chat_issue',      label: 'Chat Issue',        icon: '💬' },
  { value: 'feature_request', label: 'Feature Request',   icon: '✨' },
  { value: 'other',           label: 'Other',             icon: '📋' },
]

const SEVERITIES = [
  { value: 'low',      label: 'Low',      desc: 'Minor inconvenience',          color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { value: 'medium',   label: 'Medium',   desc: 'Affects usage',                color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'high',     label: 'High',     desc: 'Major functionality broken',   color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { value: 'critical', label: 'Critical', desc: 'App unusable / data loss',     color: 'text-red-600 bg-red-50 border-red-200' },
]

const VALID_CATEGORIES = new Set(CATEGORIES.map((c) => c.value))
const VALID_SEVERITIES = new Set(SEVERITIES.map((s) => s.value))
const ALLOWED_MIME   = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const ALLOWED_EXT    = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])
const MAX_FILE_MB    = 5
const MAX_FILES      = 3
const RATE_LIMIT_MS  = 2 * 60 * 1000
const RATE_LIMIT_KEY = 'grid_bugreport_last'

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

function validateFile(f: File): string | null {
  const ext = '.' + (f.name.split('.').pop() ?? '').toLowerCase()
  if (!ALLOWED_MIME.has(f.type) || !ALLOWED_EXT.has(ext)) return `"${f.name}" — only JPG, PNG, WebP or GIF allowed`
  if (f.size > MAX_FILE_MB * 1024 * 1024) return `"${f.name}" exceeds ${MAX_FILE_MB}MB`
  return null
}

function storagePath(f: File) {
  const ext = (f.name.split('.').pop() ?? 'jpg').toLowerCase()
  return `landing-page/${crypto.randomUUID()}.${ext}`
}

// ── Types ─────────────────────────────────────────────────────────────────────

type ImageFile = { file: File; preview: string; uploading: boolean; error: string | null }
type FormState = { name: string; email: string; title: string; description: string; category: string; severity: string; honeypot: string }

// ── Component ─────────────────────────────────────────────────────────────────

export default function BugReportPage() {
  const [form, setForm] = useState<FormState>({
    name: '', email: '', title: '', description: '',
    category: 'other', severity: 'medium', honeypot: '',
  })
  const [images, setImages] = useState<ImageFile[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    const maxLengths: Record<string, number> = { name: 100, email: 254, title: 200, description: 5000 }
    const max = maxLengths[name]
    setForm((prev) => ({ ...prev, [name]: max ? value.slice(0, max) : value }))
  }

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files)
    const remaining = MAX_FILES - images.length
    if (remaining <= 0) { setError(`Maximum ${MAX_FILES} screenshots allowed.`); return }
    for (const f of arr.slice(0, remaining)) {
      const err = validateFile(f)
      if (err) { setError(err); return }
    }
    setImages((prev) => [...prev, ...arr.slice(0, remaining).map((f) => ({
      file: f, preview: URL.createObjectURL(f), uploading: false, error: null,
    }))])
    setError(null)
  }, [images.length])

  function removeImage(i: number) {
    setImages((prev) => { URL.revokeObjectURL(prev[i].preview); return prev.filter((_, j) => j !== i) })
  }

  async function uploadImages(): Promise<string[]> {
    const urls: string[] = []
    for (let i = 0; i < images.length; i++) {
      setImages((prev) => prev.map((x, j) => j === i ? { ...x, uploading: true } : x))
      const path = storagePath(images[i].file)
      const { error: upErr } = await supabase.storage.from('bug-report-images').upload(path, images[i].file, { contentType: images[i].file.type, upsert: false })
      if (upErr) { setImages((prev) => prev.map((x, j) => j === i ? { ...x, uploading: false, error: 'Failed' } : x)); throw new Error('Upload failed') }
      const { data: { publicUrl } } = supabase.storage.from('bug-report-images').getPublicUrl(path)
      urls.push(publicUrl)
      setImages((prev) => prev.map((x, j) => j === i ? { ...x, uploading: false } : x))
    }
    return urls
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (form.honeypot) return
    if (isRateLimited()) { setError('Please wait a moment before submitting another report.'); return }
    if (!form.name.trim() || !form.email.trim() || !form.title.trim() || !form.description.trim()) { setError('Please fill in all required fields.'); return }
    if (!isValidEmail(form.email.trim())) { setError('Please enter a valid email address.'); return }
    if (!VALID_CATEGORIES.has(form.category) || !VALID_SEVERITIES.has(form.severity)) { setError('Invalid selection.'); return }

    setLoading(true)
    try {
      const screenshotUrls = images.length ? await uploadImages() : []
      const { error: sbErr } = await supabase.from('bug_reports').insert({
        reporter_id: null,
        title: sanitize(form.title),
        description: sanitize(form.description),
        category: form.category,
        severity: form.severity,
        screenshots: screenshotUrls,
        device_info: {
          source: 'landing_page',
          reporter_name: sanitize(form.name),
          reporter_email: form.email.trim().toLowerCase(),
        },
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
    images.forEach((img) => URL.revokeObjectURL(img.preview))
    setImages([])
    setForm({ name: '', email: '', title: '', description: '', category: 'other', severity: 'medium', honeypot: '' })
    setSubmitted(false)
    setError(null)
  }

  // ── Success ──────────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-20">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-[0_20px_40px_rgba(16,185,129,0.3)]">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-secondary tracking-tight mb-3">Report received.</h2>
          <p className="text-text-muted text-sm leading-relaxed mb-8">
            We've logged your report and will follow up at <span className="font-semibold text-secondary">{form.email}</span> if we need more information. Thank you for helping us improve.
          </p>
          <button
            onClick={resetForm}
            className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Submit another report →
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
          <span className="inline-block text-[10px] font-bold uppercase tracking-[3px] text-primary mb-5">Bug Report</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-secondary leading-[1.06] mb-5">
            Found something<br />
            <span className="text-primary">broken?</span>
          </h1>
          <p className="text-text-muted text-base leading-relaxed mb-10 max-w-sm">
            Every report reaches our team directly. We read each one and fix what matters most.
          </p>

          {/* Info cards */}
          <div className="space-y-3">
            {[
              { icon: '⚡', title: 'Fast response', desc: 'Critical bugs are triaged within 24 hours' },
              { icon: '🔒', title: 'Secure & private', desc: 'Your data is only used to resolve the issue' },
              { icon: '✉️', title: 'We follow up', desc: "We'll email you when your bug is fixed" },
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
                { label: 'Leave a Review', to: '/reviews' },
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

          <div className="p-8 lg:p-10 space-y-7">

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

            {/* Category */}
            <Field label="Category" required>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: c.value }))}
                    className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-center transition-all ${
                      form.category === c.value
                        ? 'border-primary bg-primary/5 text-secondary shadow-sm'
                        : 'border-border/60 text-text-muted hover:border-primary/40 hover:bg-muted/30'
                    }`}
                  >
                    <span className="text-lg leading-none">{c.icon}</span>
                    <span className="text-[11px] font-semibold leading-tight">{c.label}</span>
                  </button>
                ))}
              </div>
            </Field>

            {/* Severity */}
            <Field label="Severity" required>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SEVERITIES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, severity: s.value }))}
                    className={`px-3 py-3 rounded-xl border text-left transition-all ${
                      form.severity === s.value
                        ? `${s.color} border-current shadow-sm`
                        : 'border-border/60 text-text-muted hover:border-primary/40'
                    }`}
                  >
                    <p className={`text-xs font-bold ${form.severity === s.value ? '' : 'text-secondary'}`}>{s.label}</p>
                    <p className="text-[10px] mt-0.5 leading-tight opacity-70">{s.desc}</p>
                  </button>
                ))}
              </div>
            </Field>

            {/* Title */}
            <Field label="Bug Title" required hint={`${form.title.length}/200`}>
              <TextInput
                id="title" name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. App crashes when opening wallet"
                maxLength={200}
              />
            </Field>

            {/* Description */}
            <Field label="Description" required hint={`${form.description.length}/5000`}>
              <textarea
                id="description" name="description"
                value={form.description} onChange={handleChange}
                rows={5} maxLength={5000}
                placeholder="Describe what happened, what you expected, and the steps to reproduce it…"
                className="w-full px-4 py-3 border border-border/60 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors placeholder:text-text-muted/50 bg-[#fafafa]"
                required
              />
            </Field>

            {/* Screenshots */}
            <Field label="Screenshots" hint={`${images.length}/${MAX_FILES} · max ${MAX_FILE_MB}MB · JPG, PNG, WebP`}>
              {images.length < MAX_FILES && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    dragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border/60 hover:border-primary/50 hover:bg-primary/[0.02]'
                  }`}
                >
                  <input
                    ref={fileInputRef} type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple className="hidden"
                    onChange={(e) => e.target.files && addFiles(e.target.files)}
                  />
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-secondary">
                    {dragging ? 'Drop here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-xs text-text-muted mt-1">{MAX_FILES - images.length} slot{MAX_FILES - images.length !== 1 ? 's' : ''} remaining</p>
                </div>
              )}

              {images.length > 0 && (
                <div className="flex gap-3 flex-wrap mt-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border/60 group shadow-sm">
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      {img.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                        </div>
                      )}
                      {img.error && (
                        <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                          <span className="text-white text-[9px] font-bold">Failed</span>
                        </div>
                      )}
                      {!img.uploading && (
                        <button
                          type="button" onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full text-white text-[11px] font-bold hidden group-hover:flex items-center justify-center hover:bg-red-600 transition-colors leading-none"
                        >×</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
              type="button"
              onClick={handleSubmit as any}
              disabled={loading}
              className="w-full bg-secondary text-white font-bold py-4 px-6 rounded-2xl hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 hover:shadow-lg text-[15px] tracking-tight"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  {images.length > 0 ? 'Uploading & Submitting…' : 'Submitting…'}
                </span>
              ) : 'Submit Bug Report'}
            </button>

            <p className="text-xs text-text-muted text-center leading-relaxed">
              Submitted reports are reviewed by our team. We'll reach out at your email if we need more details.
            </p>
          </div>
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
      required
    />
  )
}
