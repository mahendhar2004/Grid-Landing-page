import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ReportedImages } from './ReportedImages'

describe('ReportedImages', () => {
  afterEach(() => cleanup())

  it('asks for nothing until a moderator asks to look', () => {
    const load = vi.fn()
    render(<ReportedImages load={load} count={2} />)

    expect(screen.getByRole('button', { name: 'Show photos (2)' })).toBeTruthy()
    expect(load).not.toHaveBeenCalled()
  })

  it('shows each picture, linked to its full-size view in a new tab', async () => {
    const load = vi.fn().mockResolvedValue([
      { key: 'listings/a.jpg', url: 'https://signed.example/a' },
      { key: 'listings/b.jpg', url: 'https://signed.example/b' },
    ])
    render(<ReportedImages load={load} />)

    fireEvent.click(screen.getByRole('button', { name: /Show photos/ }))

    const first = await screen.findByAltText('Reported photo 1')
    expect(first.getAttribute('src')).toBe('https://signed.example/a')
    const link = screen.getByRole('link', { name: 'Open photo 1 full size' })
    expect(link.getAttribute('href')).toBe('https://signed.example/a')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
    expect(screen.getByAltText('Reported photo 2')).toBeTruthy()
  })

  it('says so when nothing was attached, rather than showing an empty strip', async () => {
    render(<ReportedImages load={vi.fn().mockResolvedValue([])} noun="screenshot" />)

    fireEvent.click(screen.getByRole('button', { name: /Show screenshots/ }))

    expect(await screen.findByText('No screenshots were attached.')).toBeTruthy()
  })

  it('shows the error and lets the moderator try again, instead of failing silently', async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce({ message: 'Could not reach the API.', correlationId: 'corr-1' })
      .mockResolvedValueOnce([{ key: 'k', url: 'https://signed.example/k' }])
    render(<ReportedImages load={load} />)

    fireEvent.click(screen.getByRole('button', { name: /Show photos/ }))
    expect(await screen.findByText(/Could not reach the API/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Show photos/ }))
    await waitFor(() => expect(screen.getByAltText('Reported photo 1')).toBeTruthy())
  })

  it('fetches fresh links each time it is reopened, since the old ones expire', async () => {
    const load = vi.fn().mockResolvedValue([{ key: 'k', url: 'https://signed.example/k' }])
    render(<ReportedImages load={load} />)

    fireEvent.click(screen.getByRole('button', { name: /Show photos/ }))
    await screen.findByAltText('Reported photo 1')
    fireEvent.click(screen.getByRole('button', { name: 'Hide photos' }))
    fireEvent.click(screen.getByRole('button', { name: /Show photos/ }))

    await waitFor(() => expect(load).toHaveBeenCalledTimes(2))
  })
})
