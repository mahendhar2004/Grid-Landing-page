import { useState } from 'react'

import type { ApiError } from '../lib/api'
import type { ModerationImage } from '../api/types'
import { Button, ErrorNote } from './ui'

/**
 * The pictures behind a report, opened on demand.
 *
 * A moderator cannot tell a scam photo from a stolen one from a title, and a
 * report about a removed listing used to show nothing at all - the photos were
 * switched off for everyone, moderators included. This asks the API for
 * five-minute links when (and only when) somebody wants to look, so a queue of
 * fifty rows does not sign hundreds of links nobody opens, and the server can
 * record who looked at what.
 *
 * Each picture opens full size in a new tab. The links expire, so closing and
 * reopening fetches fresh ones rather than reusing dead ones.
 */
export function ReportedImages({
  load,
  count,
  noun = 'photo',
}: {
  /** Fetches the links. Called each time the strip is opened. */
  load: () => Promise<ModerationImage[]>
  /** How many there are, when the row already knows - shown on the button. */
  count?: number
  noun?: string
}) {
  const [images, setImages] = useState<ModerationImage[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  async function open() {
    setBusy(true)
    setError(null)
    try {
      setImages(await load())
    } catch (caught) {
      setError(caught as ApiError)
    } finally {
      setBusy(false)
    }
  }

  if (images === null) {
    return (
      <div className="mt-3">
        <Button size="sm" onClick={() => void open()} disabled={busy}>
          {busy ? 'Opening…' : `Show ${noun}s${count !== undefined ? ` (${count})` : ''}`}
        </Button>
        <ErrorNote error={error} />
      </div>
    )
  }

  if (images.length === 0) {
    return <p className="mt-3 text-xs text-[var(--color-text-muted)]">No {noun}s were attached.</p>
  }

  return (
    <div className="mt-3">
      <ul className="flex flex-wrap gap-2" aria-label={`Reported ${noun}s`}>
        {images.map((image, index) => (
          <li key={image.key}>
            <a href={image.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${noun} ${index + 1} full size`}>
              <img
                src={image.url}
                alt={`Reported ${noun} ${index + 1}`}
                loading="lazy"
                className="h-28 w-28 rounded-[var(--r-inner)] border border-[var(--c-line-strong)] object-cover"
              />
            </a>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setImages(null)}
        className="mt-2 text-xs text-[var(--color-text-muted)] underline"
      >
        Hide {noun}s
      </button>
    </div>
  )
}
