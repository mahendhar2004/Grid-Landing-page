import type { ReactNode } from 'react'

import { EmptyNote, ErrorNote, Panel } from './ui'
import type { ApiError } from '../lib/api'

/**
 * The four states every list screen has, rendered the same way every time.
 *
 * Each screen used to spell this out itself, and they had already drifted:
 * some showed "Loading…" inside a Panel and some outside it, some rendered
 * an error *instead of* the screen and some *above* it, and one showed an
 * empty list and a loading note as the same thing — so "no results" and
 * "not loaded yet" looked identical on a moderation queue.
 *
 * `data === null` is loading, an empty array is empty, and an error is an
 * error. That distinction is the whole point: on a queue, "nothing to do"
 * and "we could not tell you" must never look alike.
 */
export function AsyncScreen<T>({
  data,
  error,
  empty,
  children,
}: {
  readonly data: T[] | null
  readonly error: ApiError | null
  /** What to say when the list is genuinely empty. Say what it means, not "No data". */
  readonly empty: string
  readonly children: (rows: T[]) => ReactNode
}) {
  if (error) {
    return <ErrorNote error={error} />
  }
  if (data === null) {
    return (
      <Panel>
        <EmptyNote>Loading…</EmptyNote>
      </Panel>
    )
  }
  if (data.length === 0) {
    return (
      <Panel>
        <EmptyNote>{empty}</EmptyNote>
      </Panel>
    )
  }
  return <>{children(data)}</>
}
