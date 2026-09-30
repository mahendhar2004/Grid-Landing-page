import type { ReactNode } from 'react'

/**
 * The console's shared pieces ("Atlas").
 *
 * Every screen is built from these and never writes its own button, card or
 * badge, so the look lives in two places only: this file and
 * `design/tokens.css`. Everything is rounded - cards, controls, badges - and
 * every colour is a token, so light and dark are the same markup.
 *
 * The originals (Panel, Button, Field, ReasonPrompt, ErrorNote, EmptyNote,
 * Badge, MoreRow) keep their names and props, so no screen had to change to
 * adopt the look.
 */

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-clip rounded-[var(--r-card)] border border-[var(--c-line)] bg-[var(--c-surface)] shadow-[var(--c-shadow)] ${className}`}
    >
      {children}
    </div>
  )
}

/** A card with a title row, for the screens that group things. */
export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Panel>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--c-line)] px-6 py-4">
        <h2 className="text-sm font-semibold text-[var(--c-text)]">{title}</h2>
        {action}
      </div>
      {children}
    </Panel>
  )
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold leading-tight tracking-tight text-[var(--c-text)]">
          {title}
        </h1>
        {subtitle ? <p className="mt-1.5 max-w-2xl text-sm text-[var(--c-muted)]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export function Button({
  children,
  onClick,
  variant = 'default',
  disabled = false,
  type = 'button',
  size = 'md',
  label,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
  disabled?: boolean
  type?: 'button' | 'submit'
  size?: 'md' | 'sm'
  /** For icon-only buttons: what a screen reader announces. */
  label?: string
}) {
  const styles = {
    default: 'border border-[var(--c-line-strong)] bg-[var(--c-surface)] text-[var(--c-text)] hover:bg-[var(--c-surface-2)]',
    primary: 'bg-[var(--c-primary)] text-[var(--c-on-primary)] hover:bg-[var(--c-primary-hover)]',
    // Outlined rather than filled: a destructive action should read as
    // destructive without being the loudest thing on screen.
    danger: 'border border-[var(--c-danger)]/40 text-[var(--c-danger)] hover:bg-[var(--c-danger-soft)]',
    ghost: 'text-[var(--c-muted)] hover:bg-[var(--c-surface-2)] hover:text-[var(--c-text)]',
  }[variant]
  const sizing = size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-[var(--control-h)] px-[18px] text-sm'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${sizing} ${styles}`}
    >
      {children}
    </button>
  )
}

export function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid h-[var(--control-h)] w-[var(--control-h)] place-items-center rounded-full border border-[var(--c-line-strong)] bg-[var(--c-surface)] text-[var(--c-text)] transition hover:bg-[var(--c-surface-2)]"
    >
      {children}
    </button>
  )
}

/** One choice out of a few, always visible. For more than about four, use a Dropdown. */
export function Segmented<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: ReadonlyArray<{ value: T; label: string }>
  value: T
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex gap-0.5 rounded-full bg-[var(--c-surface-2)] p-1">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          aria-pressed={item.value === value}
          onClick={() => onChange(item.value)}
          className={`h-8 rounded-full px-4 text-[13px] font-medium transition ${
            item.value === value
              ? 'bg-[var(--c-surface)] text-[var(--c-text)] shadow-[var(--c-shadow)]'
              : 'text-[var(--c-muted)] hover:text-[var(--c-text)]'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function Avatar({ name, large = false }: { name: string; large?: boolean }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-[var(--c-brand-soft)] font-semibold text-[var(--c-brand)] ${
        large ? 'h-12 w-12 text-base' : 'h-8 w-8 text-xs'
      }`}
    >
      {initials || '?'}
    </span>
  )
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-[var(--c-text)]">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-[var(--control-h)] w-full rounded-full border border-[var(--c-line-strong)] bg-[var(--c-surface)] px-4 text-sm text-[var(--c-text)] outline-none placeholder:text-[var(--c-faint)] focus:border-[var(--c-focus)]"
      />
      {hint ? <span className="mt-1.5 block text-xs text-[var(--c-muted)]">{hint}</span> : null}
    </label>
  )
}

/**
 * Every destructive action collects a reason before it runs.
 *
 * Not ceremony: the reason is stored on the audit row and on the item itself,
 * and it is what makes the log readable six months later. Requiring it also
 * forces a moment of thought between deciding to ban someone and doing it.
 */
export function ReasonPrompt({
  title,
  confirmLabel,
  variant = 'default',
  onConfirm,
  onCancel,
  busy = false,
  children,
}: {
  title: string
  confirmLabel: string
  variant?: 'default' | 'primary' | 'danger'
  onConfirm: (reason: string) => void
  onCancel: () => void
  busy?: boolean
  children?: ReactNode
}) {
  return (
    <div className="motion-fade fixed inset-0 z-50 flex items-center justify-center bg-[var(--c-scrim)] p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="motion-sheet w-full max-w-md overflow-clip rounded-[var(--r-card)] border border-[var(--c-line)] bg-[var(--c-surface)] p-6 shadow-[var(--c-shadow-lg)]"
      >
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--c-text)]">{title}</h2>
        {children}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            const reason = String(new FormData(event.currentTarget).get('reason') ?? '').trim()
            if (reason.length > 0) {
              onConfirm(reason)
            }
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-[var(--c-text)]">Reason (required)</span>
            <textarea
              name="reason"
              required
              rows={3}
              autoFocus
              maxLength={1000}
              className="w-full rounded-[var(--r-inner)] border border-[var(--c-line-strong)] bg-[var(--c-surface)] px-4 py-3 text-sm text-[var(--c-text)] outline-none focus:border-[var(--c-focus)]"
            />
          </label>
          <div className="mt-5 flex justify-end gap-2">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant={variant} disabled={busy}>
              {busy ? 'Working…' : confirmLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * A failure the reader can act on.
 *
 * Shows the correlation id when there is one - that is the whole reason the
 * backend returns it, and hiding it turns a findable log line back into
 * "something went wrong".
 */
export function ErrorNote({ error }: { error: { message: string; correlationId?: string | null } | null }) {
  if (!error) return null
  return (
    <div
      role="alert"
      className="rounded-[var(--r-inner)] border border-[var(--c-danger)]/40 bg-[var(--c-danger-soft)] px-4 py-3 text-sm text-[var(--c-danger)]"
    >
      {error.message}
      {error.correlationId ? <span className="mt-1 block font-mono text-xs opacity-70">ref {error.correlationId}</span> : null}
    </div>
  )
}

/**
 * A list that is still loading: soft rows with a sheen instead of the word
 * "Loading…", which is kept for screen readers. Same height as a real row, so
 * the page does not jump when the data arrives.
 */
export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="grid gap-2 p-4" aria-busy="true">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="motion-shimmer h-[60px] rounded-[var(--r-inner)]" aria-hidden="true" />
      ))}
    </div>
  )
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="px-4 py-12 text-center text-sm text-[var(--c-muted)]">{children}</p>
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'warn' | 'good' | 'bad' | 'brand' }) {
  const styles = {
    neutral: 'bg-[var(--c-surface-2)] text-[var(--c-muted)]',
    warn: 'bg-[var(--c-attn-soft)] text-[var(--c-attn-ink)]',
    good: 'bg-[var(--c-ok-soft)] text-[var(--c-ok)]',
    bad: 'bg-[var(--c-danger-soft)] text-[var(--c-danger)]',
    brand: 'bg-[var(--c-brand-soft)] text-[var(--c-brand)]',
  }[tone]
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>{children}</span>
}

/** A number with its label, for the top of a screen. */
export function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <Panel className="px-6 py-5">
      <p className="text-[13px] text-[var(--c-muted)]">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold leading-none tracking-tight text-[var(--c-text)]">
        {value}
      </p>
      {note ? <p className="mt-2 text-xs text-[var(--c-muted)]">{note}</p> : null}
    </Panel>
  )
}

/**
 * How many rows are on screen, and whether that is all of them.
 *
 * Every list in this console was one capped fetch with **no indication that
 * anything had been cut off** - at 101 open reports it showed 100 and looked
 * complete. A count alone would not fix that, because "100" reads as a total
 * unless something says otherwise; the honest version is the count *and* the
 * fact that more exist, together, which is why they are one component rather
 * than a number in the header and a button at the bottom.
 *
 * Renders nothing at all when there is one short page, which is the common
 * case and does not need a chrome row explaining itself.
 */
export function MoreRow({
  shown,
  hasMore,
  loading,
  onLoadMore,
}: {
  readonly shown: number
  readonly hasMore: boolean
  readonly loading: boolean
  readonly onLoadMore: () => void
}) {
  if (!hasMore && shown === 0) {
    return null
  }
  return (
    <div className="flex items-center gap-3 border-t border-[var(--c-line)] px-6 py-3">
      <span className="text-xs text-[var(--c-muted)]">{hasMore ? `Showing the first ${shown}` : `${shown} in total`}</span>
      {hasMore ? (
        <Button size="sm" onClick={onLoadMore} disabled={loading}>
          {loading ? 'Loading…' : 'Load more'}
        </Button>
      ) : null}
    </div>
  )
}
