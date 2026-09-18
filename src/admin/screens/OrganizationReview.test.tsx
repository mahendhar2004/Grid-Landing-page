import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { OrganizationReview } from './OrganizationReview'
import { api } from '../api/endpoints'
import type { AdminOrganization, PendingReview } from '../api/types'

vi.mock('../api/endpoints', () => ({
  api: {
    organizations: {
      list: vi.fn(),
      review: { list: vi.fn(), confirm: vi.fn(), correct: vi.fn() },
    },
  },
}))

const listMock = vi.mocked(api.organizations.review.list)
const confirmMock = vi.mocked(api.organizations.review.confirm)
const correctMock = vi.mocked(api.organizations.review.correct)
const organizationsListMock = vi.mocked(api.organizations.list)

function review(overrides: Partial<PendingReview> = {}): PendingReview {
  return {
    domain: 'amazon.in',
    verifiedVia: 'DIRECTORY',
    addedAt: '2026-09-18T00:00:00.000Z',
    membersThroughDomain: 3,
    organization: {
      id: 'org_amazon',
      name: 'Amazon',
      shortName: 'amazon',
      type: 'CORPORATE',
      memberCount: 412,
      otherDomains: ['amazon.com'],
    },
    ...overrides,
  }
}

function organization(overrides: Partial<AdminOrganization> = {}): AdminOrganization {
  return {
    id: 'org_foo',
    domain: 'foocollege.ac.in',
    name: 'Foo College',
    type: 'ACADEMIC',
    hubId: 'hub_foo',
    hubName: 'Foo College Hub',
    hubStatus: 'ACTIVE',
    memberCount: 61,
    listingCount: 9,
    ...overrides,
  }
}

async function renderReview(rows: PendingReview[] = [review()]) {
  listMock.mockResolvedValue(rows)
  render(<OrganizationReview />)
  await waitFor(() => expect(listMock).toHaveBeenCalled())
}

describe('OrganizationReview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    organizationsListMock.mockResolvedValue([organization()])
    confirmMock.mockResolvedValue(undefined)
    correctMock.mockResolvedValue({ membersMoved: 3, listingsMoved: 2, requestsMoved: 1 })
  })

  afterEach(cleanup)

  it('shows what the member is being admitted into, not just what they claimed', async () => {
    await renderReview()

    // "Is this domain this organisation?" is not answerable on its own.
    await waitFor(() => expect(screen.getByText('amazon.in')).toBeTruthy())
    expect(screen.getByText(/amazon\.com/)).toBeTruthy()
    expect(screen.getByText(/412 members/)).toBeTruthy()
  })

  it('offers correct as well as confirm, and nothing that rejects', async () => {
    await renderReview()

    await waitFor(() => expect(screen.getByRole('button', { name: 'It belongs here' })).toBeTruthy())
    expect(screen.getByRole('button', { name: 'It belongs somewhere else' })).toBeTruthy()
    // A verified address proves the member belongs to *some* organisation, so
    // there is nothing here that turns one away.
    expect(screen.queryByText(/reject/i)).toBeNull()
  })

  it('confirms with a reason, because an unexplained decision is not an audit trail', async () => {
    await renderReview()

    fireEvent.click(screen.getByRole('button', { name: 'It belongs here' }))
    fireEvent.change(screen.getByRole('textbox', { name: /reason/i }), {
      target: { value: 'It is them.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(confirmMock).toHaveBeenCalledWith('amazon.in', 'It is them.'))
  })

  it('moves the domain to the organisation picked, and says how much moved with it', async () => {
    await renderReview()

    fireEvent.click(screen.getByRole('button', { name: 'It belongs somewhere else' }))
    fireEvent.change(screen.getByTestId('review-correct-search-amazon.in'), {
      target: { value: 'foo' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    await waitFor(() => expect(screen.getByTestId('review-correct-option-org_foo')).toBeTruthy())
    fireEvent.click(screen.getByTestId('review-correct-option-org_foo'))
    fireEvent.change(screen.getByRole('textbox', { name: /reason/i }), {
      target: { value: 'Wrong pick.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Move it' }))

    await waitFor(() => expect(correctMock).toHaveBeenCalledWith('amazon.in', 'org_foo', 'Wrong pick.'))
    // An admin who has just moved three people should be told they moved three
    // people, not left to infer it from the row disappearing.
    await waitFor(() =>
      expect(screen.getByText(/3 members, 2 listings, 1 request\./)).toBeTruthy(),
    )
  })

  it('never offers to correct a domain to where it already is', async () => {
    organizationsListMock.mockResolvedValue([organization(), organization({ id: 'org_amazon', name: 'Amazon' })])
    await renderReview()

    fireEvent.click(screen.getByRole('button', { name: 'It belongs somewhere else' }))
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))

    await waitFor(() => expect(screen.getByTestId('review-correct-option-org_foo')).toBeTruthy())
    // Correcting something to where it already is is not a decision, and the
    // server refuses it - so it is never offered.
    expect(screen.queryByTestId('review-correct-option-org_amazon')).toBeNull()
  })

  it('says plainly when there is nothing to review', async () => {
    await renderReview([])

    await waitFor(() => expect(screen.getByText('Nothing to review.')).toBeTruthy())
  })
})
