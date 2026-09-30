import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { LoadingRows } from './ui'

describe('LoadingRows', () => {
  afterEach(() => cleanup())

  it('tells a screen reader it is loading and shows shimmering rows for everyone else', () => {
    const { container } = render(<LoadingRows rows={3} />)

    expect(screen.getByText('Loading…')).toBeTruthy()
    expect(container.querySelectorAll('.motion-shimmer')).toHaveLength(3)
    expect(container.firstElementChild?.getAttribute('aria-busy')).toBe('true')
  })
})
