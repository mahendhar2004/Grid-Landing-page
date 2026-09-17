import { useCallback, useEffect, useRef, useState } from 'react'

import type { ApiError } from './api'

/** Joins deps into one comparable key. A NUL cannot appear in any filter value here, so it cannot collide. */
const SEPARATOR = '\u0000'

/**
 * A list that can be longer than one request.
 *
 * Every screen here used to fetch once with a hard cap — 100 rows, 200 for
 * the audit log — with no "load more" and, worse, **no sign that anything had
 * been cut off**. At 101 open reports the console showed 100 and looked
 * complete. Every one of these endpoints has taken `offset` from the start;
 * nothing was reading it.
 *
 * `useAsyncData` stays the right tool for a screen whose data is one bounded
 * fetch (pricing, tiers, the counts). This is its paged sibling, and it keeps
 * the same two properties that one exists for:
 *
 * - **Stale-response protection.** Changing a filter fires a new first page
 *   while an older page is in flight; a generation counter drops anything
 *   from a superseded query, so a slow response for the filter you just left
 *   cannot append itself to the one you are looking at. On a moderation queue
 *   that is acting on the wrong row.
 * - **Filters reset paging.** Switching from OPEN to ACTIONED starts at offset
 *   zero, because page three of the previous question is not page three of
 *   this one. That happens here rather than in each screen's own `useEffect`,
 *   which is where it would be forgotten.
 *
 * `hasMore` is inferred from a full page rather than a server count: a page
 * shorter than `pageSize` is the last one. That is one fewer number for the
 * API to return and to keep honest, and its only cost is one extra empty
 * fetch when the total is an exact multiple of the page size.
 *
 * **`deps` must be scalars, and they are what actually restarts this.**
 * `useAsyncData` keys its effect on the identity of the fetcher returned by
 * `useCallback`, which works only because every call site passes a fresh
 * arrow each render - pass it a stable function and the filter silently stops
 * resetting the list. That is a footgun worth not shipping twice, so this one
 * keys on a signature of `deps` itself and keeps the latest closure in a ref.
 * The cost is that a dep has to stringify meaningfully; every filter in this
 * console is a string, a boolean or null.
 */
export function usePagedData<T>(
  fetchPage: (offset: number) => Promise<T[]>,
  deps: readonly unknown[],
  pageSize: number,
): {
  rows: T[] | null
  error: ApiError | null
  hasMore: boolean
  loadingMore: boolean
  loadMore: () => void
  reload: () => Promise<void>
} {
  const [rows, setRows] = useState<T[] | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  /** Bumped by a reload; anything from an older generation is dropped. */
  const [generation, setGeneration] = useState(0)
  const [pagesWanted, setPagesWanted] = useState(1)
  const generationRef = useRef(0)

  const depsKey = deps.map((dep) => String(dep)).join(SEPARATOR)

  // Always the newest closure, so the request uses current props without the
  // identity of the function deciding when to fire.
  const fetchRef = useRef(fetchPage)
  useEffect(() => {
    fetchRef.current = fetchPage
  })

  // A filter changed, so the answer to "what is page two" changed with it.
  useEffect(() => {
    setPagesWanted(1)
    setRows(null)
  }, [depsKey])

  const reload = useCallback(async () => {
    setPagesWanted(1)
    setGeneration((value) => value + 1)
  }, [])

  const loadMore = useCallback(() => {
    setPagesWanted((value) => value + 1)
  }, [])

  useEffect(() => {
    generationRef.current += 1
    const mine = generationRef.current
    const offset = (pagesWanted - 1) * pageSize
    if (offset > 0) setLoadingMore(true)

    void (async () => {
      try {
        const page = await fetchRef.current(offset)
        if (generationRef.current !== mine) return
        // Replace on the first page, append after — so a reload cannot
        // duplicate what is already on screen.
        setRows((current) => (offset === 0 || current === null ? page : [...current, ...page]))
        setHasMore(page.length === pageSize)
        setError(null)
      } catch (caught) {
        if (generationRef.current !== mine) return
        setError(caught as ApiError)
      } finally {
        if (generationRef.current === mine) setLoadingMore(false)
      }
    })()
  }, [depsKey, generation, pagesWanted, pageSize])

  return { rows, error, hasMore, loadingMore, loadMore, reload }
}

/**
 * The same thing, for a route that pages by cursor instead of offset.
 *
 * `GET /v1/admin/ad-units` is the only admin list that does - it follows Rule
 * 25's cursor pagination, like the app-facing feeds, rather than the
 * `limit`/`offset` the other admin routes use. Rather than ask the API to
 * change shape for one screen, or hand-roll accumulation inside that screen,
 * this is the cursor-shaped sibling.
 *
 * Same two properties as `usePagedData`: a superseded response is dropped, and
 * changing a filter starts over rather than appending page two of a different
 * question. The difference is only in what "next page" is named.
 */
export function useCursorPagedData<T>(
  fetchPage: (cursor: string | null) => Promise<{ rows: T[]; nextCursor: string | null }>,
  deps: readonly unknown[],
): {
  rows: T[] | null
  error: ApiError | null
  hasMore: boolean
  loadingMore: boolean
  loadMore: () => void
  reload: () => Promise<void>
} {
  const [rows, setRows] = useState<T[] | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [generation, setGeneration] = useState(0)
  /** The cursor to fetch. `null` means the first page; changing it is what asks for the next one. */
  const [requestCursor, setRequestCursor] = useState<string | null>(null)
  const generationRef = useRef(0)

  const depsKey = deps.map((dep) => String(dep)).join(SEPARATOR)

  const fetchRef = useRef(fetchPage)
  useEffect(() => {
    fetchRef.current = fetchPage
  })

  useEffect(() => {
    setRequestCursor(null)
    setRows(null)
  }, [depsKey])

  const reload = useCallback(async () => {
    setRequestCursor(null)
    setRows(null)
    setGeneration((value) => value + 1)
  }, [])

  const loadMore = useCallback(() => {
    setRequestCursor((current) => nextCursor ?? current)
  }, [nextCursor])

  useEffect(() => {
    generationRef.current += 1
    const mine = generationRef.current
    if (requestCursor !== null) setLoadingMore(true)

    void (async () => {
      try {
        const page = await fetchRef.current(requestCursor)
        if (generationRef.current !== mine) return
        setRows((current) => (requestCursor === null || current === null ? page.rows : [...current, ...page.rows]))
        setNextCursor(page.nextCursor)
        setError(null)
      } catch (caught) {
        if (generationRef.current !== mine) return
        setError(caught as ApiError)
      } finally {
        if (generationRef.current === mine) setLoadingMore(false)
      }
    })()
  }, [depsKey, generation, requestCursor])

  return { rows, error, hasMore: nextCursor !== null, loadingMore, loadMore, reload }
}
