import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Logo } from './brand'

describe('Logo', () => {
  afterEach(() => cleanup())

  it('reads as "Grid" to a screen reader and draws the wordmark with its blue stop', () => {
    const { container } = render(<Logo />)

    expect(screen.getByRole('img', { name: 'Grid' })).toBeTruthy()
    expect(container.textContent).toBe('Grid.')
    expect((container.querySelector('[aria-hidden="true"]') as HTMLElement).style.color).toBe('rgb(59, 130, 246)')
  })
})
