import { useCallback, useState } from 'react'

import type { ApiError } from './api'

/**
 * Running an admin action: busy state, error capture, reload on success.
 *
 * `useAsyncData` covers reading. This is the other half, and every screen
 * was re-implementing it — `setBusy(true)`, try, `await reload()`, catch,
 * `setActionError`, `finally setBusy(false)` — with small differences that
 * were all bugs waiting: one screen left `busy` true forever on an error
 * path, another reloaded before the write had resolved, a third cleared the
 * previous error only sometimes, so a failed ban looked like a successful
 * one until you noticed nothing had changed.
 *
 * The rules, in one place:
 *
 * - the previous error is cleared when a new attempt starts, so a stale
 *   failure never sits under a fresh success;
 * - `busy` is cleared in `finally`, so a thrown error cannot wedge the
 *   buttons;
 * - the reload is awaited *after* the write resolves, never alongside it —
 *   racing them is how a list re-renders without the change it just made;
 * - the error is returned rather than thrown, because every call site here
 *   wants to show it, not to crash the screen.
 *
 * It returns whether the action succeeded, so a caller can close a form or
 * clear a field only when there is something to close it over.
 */
export function useAdminAction(onSuccess?: () => Promise<void> | void): {
  run: (action: () => Promise<unknown>) => Promise<boolean>
  busy: boolean
  error: ApiError | null
  clearError: () => void
} {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const run = useCallback(
    async (action: () => Promise<unknown>): Promise<boolean> => {
      setError(null)
      setBusy(true)
      try {
        await action()
        await onSuccess?.()
        return true
      } catch (caught) {
        setError(caught as ApiError)
        return false
      } finally {
        setBusy(false)
      }
    },
    [onSuccess],
  )

  const clearError = useCallback(() => setError(null), [])

  return { run, busy, error, clearError }
}
