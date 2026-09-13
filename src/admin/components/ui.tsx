import type { ReactNode } from 'react'

/**
 * The console's shared pieces.
 *
 * Deliberately plain. This is a tool for one person working a queue, not a
 * product surface - the marketing site's motion and gradients would be noise
 * here, and every minute spent on them is a minute not spent on the thing that
 * actually decides moderation quality, which is how fast a queue can be read.
 *
 * Dark-only, set on `<html>` by `admin.html` before React runs.
 */

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] ${className}`}>
      {children}
    </div>
  )
}

export function Button({
  children,
  onClick,
  variant = 'default',
  disabled = false,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'primary' | 'danger'
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  const styles = {
    default: 'border border-[var(--color-border)] text-[var(--color-text)] hover:bg-white/5',
    primary: 'bg-[var(--color-primary)] text-white hover:opacity-90',
    // Outlined rather than filled: a destructive action should be legible as
    // destructive without being the loudest thing on screen, or it becomes
    // the thing the eye goes to first.
    danger: 'border border-red-500/40 text-red-400 hover:bg-red-500/10',
  }[variant]

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${styles}`}
    >
      {children}
    </button>
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
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--bg-page)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
      />
      {hint ? <span className="mt-1 block text-xs text-[var(--color-text-muted)]">{hint}</span> : null}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Panel className="w-full max-w-md p-5">
        <h2 className="mb-3 text-base font-bold text-[var(--color-text)]">{title}</h2>
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
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Reason (required)
            </span>
            <textarea
              name="reason"
              required
              rows={3}
              autoFocus
              maxLength={1000}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--bg-page)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </label>
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant={variant} disabled={busy}>
              {busy ? 'Working…' : confirmLabel}
            </Button>
          </div>
        </form>
      </Panel>
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
    <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
      {error.message}
      {error.correlationId ? (
        <span className="mt-1 block font-mono text-xs opacity-70">ref {error.correlationId}</span>
      ) : null}
    </div>
  )
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">{children}</p>
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'warn' | 'good' | 'bad' }) {
  const styles = {
    neutral: 'bg-white/10 text-[var(--color-text-muted)]',
    warn: 'bg-amber-500/15 text-amber-300',
    good: 'bg-emerald-500/15 text-emerald-300',
    bad: 'bg-red-500/15 text-red-300',
  }[tone]
  return <span className={`rounded px-2 py-0.5 text-xs font-semibold ${styles}`}>{children}</span>
}
