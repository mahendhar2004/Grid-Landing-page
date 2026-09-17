import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AdUnits } from './AdUnits'
import { api } from '../api/endpoints'
import type { AdUnit } from '../api/types'

vi.mock('../api/endpoints', () => ({
  api: { adUnits: { list: vi.fn(), create: vi.fn(), update: vi.fn() } },
}))

const listMock = vi.mocked(api.adUnits.list)
const createMock = vi.mocked(api.adUnits.create)
const updateMock = vi.mocked(api.adUnits.update)

function adUnit(overrides: Partial<AdUnit> = {}): AdUnit {
  return {
    id: 'ad_1',
    title: 'TUF+ DSA course',
    sponsorName: 'takeuforward',
    imageUrl: 'https://x/1.jpg',
    targetUrl: 'https://takeuforward.org/plus?ref=grid',
    disclosure: null,
    category: 'BOOKS',
    keywords: ['dsa'],
    minPricePaise: null,
    maxPricePaise: null,
    priorityWeight: 1,
    isActive: true,
    impressionCount: 1000,
    clickCount: 25,
    createdAt: '2026-09-17T00:00:00.000Z',
    updatedAt: '2026-09-17T00:00:00.000Z',
    ...overrides,
  }
}

async function renderScreen(rows: AdUnit[], nextCursor: string | null = null) {
  listMock.mockResolvedValue({ adUnits: rows, nextCursor })
  render(<AdUnits />)
  await waitFor(() => expect(listMock).toHaveBeenCalled())
}

describe('AdUnits', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createMock.mockResolvedValue(adUnit())
    updateMock.mockResolvedValue(adUnit())
  })

  afterEach(() => {
    cleanup()
  })

  const rowList = () => within(screen.getByRole('list'))

  it('shows an ad with its reach and how well it converts', async () => {
    await renderScreen([adUnit()])
    await waitFor(() => expect(screen.getByRole('list')).toBeTruthy())

    expect(rowList().getByText('TUF+ DSA course')).toBeTruthy()
    expect(rowList().getByText(/1,000 seen/)).toBeTruthy()
    // 25 of 1000 - the only number here that says whether it works.
    expect(rowList().getByText('2.5%')).toBeTruthy()
  })

  it('says nothing rather than 0% when an ad has never been seen', async () => {
    // A rate computed from zero impressions is a division by zero dressed up
    // as a fact about the ad.
    await renderScreen([adUnit({ impressionCount: 0, clickCount: 0 })])
    await waitFor(() => expect(screen.getByRole('list')).toBeTruthy())

    expect(rowList().getByText('—')).toBeTruthy()
  })

  it('pauses a live ad rather than deleting it', async () => {
    await renderScreen([adUnit({ isActive: true })])
    await waitFor(() => expect(screen.getByRole('list')).toBeTruthy())

    await act(async () => {
      rowList().getByText('Pause').click()
    })

    await waitFor(() => expect(updateMock).toHaveBeenCalledWith('ad_1', { isActive: false }))
  })

  it('resumes a paused one', async () => {
    await renderScreen([adUnit({ isActive: false })])
    await waitFor(() => expect(screen.getByRole('list')).toBeTruthy())

    await act(async () => {
      rowList().getByText('Resume').click()
    })

    await waitFor(() => expect(updateMock).toHaveBeenCalledWith('ad_1', { isActive: true }))
  })

  it('shows the partner wording on a row that has one', async () => {
    await renderScreen([adUnit({ disclosure: 'As an Amazon Associate I earn from qualifying purchases.' })])

    expect(await screen.findByText(/As an Amazon Associate/)).toBeTruthy()
  })

  it('fills Amazon’s required wording in one tap, because retyping it is how it gets subtly wrong', async () => {
    await renderScreen([adUnit()])
    await act(async () => {
      screen.getByText('New ad').click()
    })

    await act(async () => {
      screen.getByText('Use Amazon’s wording').click()
    })

    const filled = screen
      .getAllByRole('textbox')
      .some((input) => (input as HTMLInputElement).value === 'As an Amazon Associate I earn from qualifying purchases.')
    expect(filled).toBe(true)
  })

  it('sends an empty disclosure as null, not as an empty string', async () => {
    await renderScreen([])
    await act(async () => {
      screen.getByText('New ad').click()
    })

    const setValue = (label: string, value: string) => {
      const input = screen.getByLabelText(label, { exact: false }) as HTMLInputElement
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      setter.call(input, value)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }

    await act(async () => {
      setValue('Title', 'TUF+')
      setValue('Sponsor name', 'takeuforward')
      setValue('Image URL', 'https://x/1.jpg')
      setValue('Target URL', 'https://takeuforward.org/plus?ref=grid')
    })
    await act(async () => {
      screen.getByText('Create ad').click()
    })

    await waitFor(() => expect(createMock).toHaveBeenCalled())
    expect(createMock.mock.calls[0]![0]).toMatchObject({
      disclosure: null,
      // The tracking parameters have to survive intact or the commission is lost.
      targetUrl: 'https://takeuforward.org/plus?ref=grid',
    })
  })
})
