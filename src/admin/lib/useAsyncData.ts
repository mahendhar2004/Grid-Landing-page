import { useCallback, useEffect, useState } from 'react'

import type { ApiError } from './api'

/**
 * Load data for a screen, with the two things every one of them needs and
 * would otherwise each re-implement: a reload after an action, and protection
 * against a stale response.
 *
 * **The stale-response part is not theoretical.** Every screen here has a
 * filter - report status, triage inbox, organization search - and switching it
 * fires a new request while the old one is still in flight. Without a guard,
 * whichever finishes *last* wins, so a slow response for the tab you just left
 * can overwrite the fast one for the tab you are looking at. The result is a
 * screen quietly showing the wrong list, which on a moderation queue means
 * acting on the wrong report.
 *
 * A generation counter rather than `AbortController`: aborting would also be
 * correct, but the failed request then surfaces as an error the screen has to
 * special-case. Ignoring a superseded result is simpler and has no failure
 * mode to explain.
 *
 * Writing state only after an `await` also keeps React's
 * `set-state-in-effect` rule satisfied honestly, rather than by suppressing
 * it - nothing here writes synchronously during the effect.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[],
): {
  data: T | null
  error: ApiError | null
  reload: () => Promise<void>
} {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [generation, setGeneration] = useState(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps -- `fetcher` is a new closure every render; the caller's own deps are what actually decide when to refetch.
  const run = useCallback(fetcher, deps)

  const reload = useCallback(async () => {
    setGeneration((value) => value + 1)
  }, [])

  useEffect(() => {
    let superseded = false

    void (async () => {
      try {
        const result = await run()
        if (superseded) return
        setData(result)
        setError(null)
      } catch (caught) {
        if (superseded) return
        setError(caught as ApiError)
      }
    })()

    return () => {
      superseded = true
    }
  }, [run, generation])

  return { data, error, reload }
}
