import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ArrowRight, ChevronDown, Upload, X, Shield, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import AnimatedSection from '../components/ui/AnimatedSection'

// ── Constants ──────────────────────────────────────────────────────────────────

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
  { value: 'low',      label: 'Low',      desc: 'Minor issue' },
  { value: 'medium',   label: 'Medium',   desc: 'Affects usage' },
  { value: 'high',     label: 'High',     desc: 'Broken feature' },
  { value: 'critical', label: 'Critical', desc: 'App unusable' },
]

const VALID_CATEGORIES = new Set(CATEGORIES.map((c) => c.value))
const VALID_SEVERITIES = new Set(SEVERITIES.map((s) => s.value))
const ALLOWED_MIME   = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const ALLOWED_EXT    = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])
const MAX_FILE_MB    = 5
const MAX_FILES      = 3
const RATE_LIMIT_MS  = 2 * 60 * 1000
const RATE_LIMIT_KEY = 'grid_bugreport_last'

// ── Security & Utils ───────────────────────────────────────────────────────────

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
  if (!ALLOWED_MIME.has(f.type) || !ALLOWED_EXT.has(ext)) return `"${f.name}" — invalid format`
  if (f.size > MAX_FILE_MB * 1024 * 1024) return `"${f.name}" exceeds ${MAX_FILE_MB}MB`
  return null
}

function storagePath(f: File) {
  const ext = (f.name.split('.').pop() ?? 'jpg').toLowerCase()
  return `landing-page/${crypto.randomUUID()}.${ext}`
}

// ── Types ──────────────────────────────────────────────────────────────────────

type ImageFile = { file: File; preview: string; uploading: boolean; error: string | null }
type FormState = { name: string; email: string; title: string; description: string; category: string; severity: string; honeypot: string }

// ── Component ──────────────────────────────────────────────────────────────────

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const maxLengths: Record<string, number> = { name: 100, email: 254, title: 200, description: 5000 }
    const max = maxLengths[name]
    setForm((prev) => ({ ...prev, [name]: max ? value.slice(0, max) : value }))
  }

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files)
    const remaining = MAX_FILES - images.length
    if (remaining <= 0) { setError(`Maximum ${MAX_FILES} images allowed.`); return }
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
    if (isRateLimited()) { setError('Please wait before reporting again.'); return }
    if (!form.name.trim() || !form.email.trim() || !form.title.trim() || !form.description.trim()) { setError('Please fill in all fields.'); return }
    if (!isValidEmail(form.email.trim())) { setError('Invalid email.'); return }
    if (!VALID_CATEGORIES.has(form.category) || !VALID_SEVERITIES.has(form.severity)) { setError('Invalid selection.'); return }

    setLoading(true)
    try {
      const screenshotUrls = images.length ? await uploadImages() : []
      const { error: sbErr } = await supabase.from('bug_reports').insert({
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

  const resetForm = () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview))
    setImages([])
    setForm({ name: '', email: '', title: '', description: '', category: 'other', severity: 'medium', honeypot: '' })
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
            <Shield size={32} />
          </div>
          <h2 className="text-3xl font-bold text-secondary tracking-tight mb-4 transition-colors">Report Received</h2>
          <p className="text-text-muted text-base leading-relaxed mb-10 transition-colors">
            Thank you for helping us improve. We'll investigate this report and follow up at <span className="text-primary font-semibold">{form.email}</span>.
          </p>
          <button
            onClick={resetForm}
            className="flex items-center gap-2 mx-auto text-sm font-bold text-primary hover:text-primary-dark transition-all"
          >
            Submit another report <ArrowRight size={16} />
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
          
          <span className="inline-block text-primary font-bold text-sm tracking-wide uppercase mb-6">Support</span>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-secondary leading-[1.05] mb-8 transition-colors">
            Report a<br />
            <span className="text-primary italic">Bug.</span>
          </h1>
          
          <p className="text-text-muted text-lg leading-relaxed mb-12 max-w-sm transition-colors">
            Found something broken? Let us know and we'll fix it. Your reports help make Grid better for everyone.
          </p>

          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-5 p-6 rounded-[32px] border transition-all duration-500"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-secondary transition-colors">Swift Response</p>
                <p className="text-xs text-text-muted opacity-70 transition-colors">Critical reports triaged within 24h</p>
              </div>
            </div>

            <div className="flex items-center gap-5 p-6 rounded-[32px] border transition-all duration-500"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-secondary transition-colors">Always Improving</p>
                <p className="text-xs text-text-muted opacity-70 transition-colors">Continuous updates and fixes</p>
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
              <h3 className="text-2xl font-bold text-secondary mb-10 transition-colors">Submit Report</h3>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <Field label="Category" required>
                    <div className="relative">
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange as any}
                        className="w-full px-6 py-4 border rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
                        style={{ backgroundColor: 'var(--color-bg-page)', borderColor: 'var(--color-border)', color: 'var(--color-secondary)' }}
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-6 flex items-center">
                        <ChevronDown size={18} className="text-text-muted/40" />
                      </div>
                    </div>
                  </Field>

                  <Field label="Severity" required>
                    <div className="relative">
                      <select
                        name="severity"
                        value={form.severity}
                        onChange={handleChange as any}
                        className="w-full px-6 py-4 border rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
                        style={{ backgroundColor: 'var(--color-bg-page)', borderColor: 'var(--color-border)', color: 'var(--color-secondary)' }}
                      >
                        {SEVERITIES.map(s => (
                          <option key={s.value} value={s.value}>{s.label} — {s.desc}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-6 flex items-center">
                        <ChevronDown size={18} className="text-text-muted/40" />
                      </div>
                    </div>
                  </Field>
                </div>

                <Field label="Bug Title" required hint={`${form.title.length}/200`}>
                  <TextInput id="title" name="title" value={form.title} onChange={handleChange} placeholder="Short summary of the issue..." maxLength={200} />
                </Field>

                <Field label="Description" required hint={`${form.description.length}/5000`}>
                  <textarea
                    id="description" name="description"
                    value={form.description} onChange={handleChange}
                    rows={5} maxLength={5000}
                    placeholder="Describe what happened and how to reproduce it..."
                    className="w-full px-6 py-6 border rounded-3xl text-sm font-semibold leading-relaxed resize-none focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-text-muted/40"
                    style={{ backgroundColor: 'var(--color-bg-page)', borderColor: 'var(--color-border)', color: 'var(--color-secondary)' }}
                    required
                  />
                </Field>

                <Field label="Screenshots" hint={`${images.length}/${MAX_FILES} · max ${MAX_FILE_MB}MB`}>
                  <div className="space-y-4">
                    {images.length < MAX_FILES && (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 ${
                          dragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border/60 hover:border-primary/50'
                        }`}
                        style={{ backgroundColor: 'var(--color-bg-page)' }}
                      >
                        <input
                          ref={fileInputRef} type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          multiple className="hidden"
                          onChange={(e) => e.target.files && addFiles(e.target.files)}
                        />
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                          <Upload size={22} />
                        </div>
                        <p className="text-sm font-bold text-secondary">
                          {dragging ? 'Drop here' : 'Click or drag screenshots here'}
                        </p>
                        <p className="text-xs text-text-muted mt-2">Up to {MAX_FILES} images</p>
                      </div>
                    )}

                    {images.length > 0 && (
                      <div className="flex gap-4 flex-wrap">
                        {images.map((img, i) => (
                          <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-border group"
                            style={{ borderColor: 'var(--color-border)' }}
                          >
                            <img src={img.preview} alt="" className="w-full h-full object-cover" />
                            {img.uploading && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              </div>
                            )}
                            <button
                              type="button" onClick={() => removeImage(i)}
                              className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 backdrop-blur-md rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                        Submitting...
                      </motion.span>
                    ) : (
                      <motion.span key="normal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        Submit Report <ArrowRight size={18} />
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
