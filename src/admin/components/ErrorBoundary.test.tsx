import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ErrorBoundary } from './ErrorBoundary'

function Boom({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('undefined is not an object (evaluating hubLatitude.toFixed)')
  }
  return <p>the screen</p>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React logs caught render errors itself; the boundary logs its own too.
    // Neither is a test failure, and both would drown the output.
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders the screen when nothing is wrong', () => {
    render(
      <ErrorBoundary resetKey="organizations" label="Organizations">
        <Boom shouldThrow={false} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('the screen')).toBeTruthy()
  })

  it('catches a crash and names the screen, instead of blanking the console', () => {
    render(
      <ErrorBoundary resetKey="organizations" label="Organizations">
        <Boom shouldThrow />
      </ErrorBoundary>,
    )

    // The failure this exists for: one `undefined.toFixed()` unmounted the
    // whole tree, and a white page is indistinguishable from a failed
    // deploy, a dropped session, or the API being down.
    expect(screen.getByTestId('screen-error-boundary')).toBeTruthy()
    expect(screen.getByText(/The Organizations screen hit an error/)).toBeTruthy()
  })

  it('shows the real message, because the reader is the person who will fix it', () => {
    render(
      <ErrorBoundary resetKey="organizations" label="Organizations">
        <Boom shouldThrow />
      </ErrorBoundary>,
    )

    expect(screen.getByText(/hubLatitude\.toFixed/)).toBeTruthy()
  })

  it('clears itself when the admin navigates, so a fixed screen recovers', () => {
    const { rerender } = render(
      <ErrorBoundary resetKey="organizations" label="Organizations">
        <Boom shouldThrow />
      </ErrorBoundary>,
    )
    expect(screen.getByTestId('screen-error-boundary')).toBeTruthy()

    // Without the reset a tripped boundary stays tripped forever - you would
    // fix the data, come back, and still see the old error.
    rerender(
      <ErrorBoundary resetKey="reports" label="Reports">
        <Boom shouldThrow={false} />
      </ErrorBoundary>,
    )

    expect(screen.queryByTestId('screen-error-boundary')).toBeNull()
    expect(screen.getByText('the screen')).toBeTruthy()
  })
})
