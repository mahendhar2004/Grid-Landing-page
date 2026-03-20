import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'

interface Review {
  id: string
  reviewer_name: string
  college: string | null
  rating: number
  feedback: string
}

// Build a marquee row with enough duplicates to fill 2× viewport widths
function buildRow(reviews: Review[], offset: number, total: number) {
  return Array.from({ length: total }, (_, i) => ({
    ...reviews[(i + offset) % reviews.length],
    _key: `${offset}-${i}`,
  }))
}

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    supabase
      .from('reviews')
      .select('id, reviewer_name, college, rating, feedback')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReviews(data || [])
        setLoaded(true)
      })
  }, [])

  if (!loaded || reviews.length === 0) return null

  // Need enough cards so translateX(-50%) loops seamlessly
  const total = Math.max(10, Math.ceil(10 / reviews.length) * reviews.length * 2)
  const row1 = buildRow(reviews, 0, total)
  const row2 = buildRow(reviews, Math.floor(reviews.length / 2), total)

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  const avgDisplay = avg.toFixed(1)
  const speed = Math.max(30, reviews.length * 10)

  return (
    <section className="relative py-24 lg:py-32 bg-secondary overflow-hidden">

      {/* ── Background texture ── */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── Ambient glow orbs ── */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/[0.12] rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/[0.08] rounded-full blur-[110px] pointer-events-none" />

      {/* ── Heading ── */}
      <div className="relative max-w-7xl mx-auto px-6 mb-14 text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Aggregate stars + count */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-xl leading-none ${i < Math.round(avg) ? 'text-amber-400' : 'text-white/15'}`}
                >★</span>
              ))}
            </div>
            <span className="text-white/50 text-sm font-semibold tabular-nums">
              {avgDisplay} average · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </span>
          </div>

          <span className="inline-block text-[10px] font-bold uppercase tracking-[3px] text-primary mb-5">
            Student Reviews
          </span>

          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Loved by students{' '}
            <span className="text-primary">across campuses</span>
          </h2>
        </motion.div>
      </div>

      {/* ── Marquee rows ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.25 }}
        className="space-y-4"
      >
        {/* Row 1 — scrolls left */}
        <div className="group relative overflow-hidden">
          <div
            className="flex gap-4 animate-ticker group-hover:[animation-play-state:paused]"
            style={{ width: 'max-content', animationDuration: `${speed}s` }}
          >
            {row1.map((r) => <ReviewCard key={r._key} review={r} />)}
          </div>
          <EdgeFade />
        </div>

        {/* Row 2 — scrolls right */}
        <div className="group relative overflow-hidden">
          <div
            className="flex gap-4 animate-ticker group-hover:[animation-play-state:paused]"
            style={{ width: 'max-content', animationDuration: `${speed * 1.15}s`, animationDirection: 'reverse' }}
          >
            {row2.map((r) => <ReviewCard key={r._key} review={r} />)}
          </div>
          <EdgeFade />
        </div>
      </motion.div>

      {/* ── Bottom CTA strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="relative max-w-7xl mx-auto px-6 mt-14 text-center"
      >
        <a
          href="/reviews"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 font-semibold transition-colors"
        >
          Share your experience
          <span className="text-primary">→</span>
        </a>
      </motion.div>

    </section>
  )
}

// ── Edge fade overlay ─────────────────────────────────────────────────────────
function EdgeFade() {
  return (
    <>
      <div className="absolute inset-y-0 left-0 w-28 lg:w-40 bg-gradient-to-r from-secondary to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-28 lg:w-40 bg-gradient-to-l from-secondary to-transparent pointer-events-none z-10" />
    </>
  )
}

// ── Review Card ───────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="
      w-[320px] flex-shrink-0 select-none
      bg-white rounded-3xl p-6
      shadow-[0_8px_40px_rgba(0,0,0,0.35)]
      border border-white/10
      flex flex-col gap-4
      transition-transform duration-300 hover:-translate-y-1
    ">
      {/* Stars */}
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`text-base leading-none ${i < review.rating ? 'text-amber-400' : 'text-gray-200'}`}>
            ★
          </span>
        ))}
      </div>

      {/* Feedback */}
      <p className="text-secondary/75 text-[13px] leading-relaxed line-clamp-3 flex-1">
        "{review.feedback}"
      </p>

      {/* Reviewer */}
      <div className="flex items-center gap-3 pt-3 border-t border-border/60">
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-primary">
            {review.reviewer_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-secondary truncate">{review.reviewer_name}</p>
          {review.college && (
            <p className="text-[11px] text-text-muted truncate">{review.college}</p>
          )}
        </div>
      </div>
    </div>
  )
}
