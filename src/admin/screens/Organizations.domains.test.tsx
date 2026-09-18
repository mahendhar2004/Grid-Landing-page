import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Organizations } from './Organizations'
import { api } from '../api/endpoints'
import type { AdminOrganization, OrganizationDomain } from '../api/types'

vi.mock('../api/endpoints', () => ({
  api: {
    organizations: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      domains: { list: vi.fn(), attach: vi.fn(), detach: vi.fn() },
    },
  },
}))

const listMock = vi.mocked(api.organizations.list)
const domainsListMock = vi.mocked(api.organizations.domains.list)
const attachMock = vi.mocked(api.organizations.domains.attach)
const detachMock = vi.mocked(api.organizations.domains.detach)

const ORGANIZATION: AdminOrganization = {
  id: 'org_iitd',
  domain: 'iitd.ac.in',
  name: 'IIT Delhi',
  type: 'ACADEMIC',
  placeCount: 1,
  pendingPlaceCount: 0,
  memberCount: 900,
  listingCount: 40,
}

function domain(overrides: Partial<OrganizationDomain> = {}): OrganizationDomain {
  return {
    domain: 'iitd.ac.in',
    isPrimary: true,
    verifiedVia: 'ADMIN',
    reviewState: 'NOT_REQUIRED',
    addedAt: '2026-01-01T00:00:00.000Z',
    memberCount: 900,
    ...overrides,
  }
}

async function openDomains(domains: OrganizationDomain[]) {
  listMock.mockResolvedValue([ORGANIZATION])
  domainsListMock.mockResolvedValue(domains)
  render(<Organizations />)
  await waitFor(() => expect(screen.getByText('IIT Delhi')).toBeTruthy())
  fireEvent.click(screen.getByRole('button', { name: 'Domains' }))
  await waitFor(() => expect(domainsListMock).toHaveBeenCalledWith('org_iitd'))
}

describe('Organizations — domains (BR-066)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    attachMock.mockResolvedValue(domain({ domain: 'iitd.ernet.in', isPrimary: false }))
    detachMock.mockResolvedValue(undefined)
  })

  afterEach(cleanup)

  it('lists every domain with how it was trusted and how many came through it', async () => {
    await openDomains([domain(), domain({ domain: 'iitd.ernet.in', isPrimary: false, verifiedVia: 'GOOGLE_HD', memberCount: 12 })])

    await waitFor(() => expect(screen.getByText('iitd.ernet.in')).toBeTruthy())
    expect(screen.getByText('Primary')).toBeTruthy()
    expect(screen.getByText('GOOGLE_HD')).toBeTruthy()
    expect(screen.getByText('12 members')).toBeTruthy()
  })

  it('never offers to release the primary, which is what names the organisation', async () => {
    await openDomains([domain()])

    // The row's own domain appears twice - once in the organisation header and
    // once in its domains list - so this asserts on the badge that only the
    // list renders.
    await waitFor(() => expect(screen.getByText('Primary')).toBeTruthy())
    expect(screen.queryByRole('button', { name: 'Release' })).toBeNull()
  })

  it('attaches a domain with a reason, saying plainly who it admits', async () => {
    await openDomains([domain()])

    fireEvent.change(screen.getByTestId('domain-attach-input'), {
      target: { value: 'iitd.ernet.in' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Attach' }))
    // Attaching a domain admits everyone at it - the prompt says so before the
    // reason is typed, not after.
    await waitFor(() =>
      expect(screen.getByText(/will be able to join this organisation/)).toBeTruthy(),
    )
    fireEvent.change(screen.getByRole('textbox', { name: /reason/i }), {
      target: { value: 'Second campus domain.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Attach it' }))

    await waitFor(() =>
      expect(attachMock).toHaveBeenCalledWith('org_iitd', 'iitd.ernet.in', 'Second campus domain.'),
    )
  })

  it('offers release on a non-primary domain even though the server may refuse it', async () => {
    // The refusal names how many members are in the way, which is more useful
    // than a control that silently is not there.
    await openDomains([domain(), domain({ domain: 'iitd.ernet.in', isPrimary: false, memberCount: 12 })])

    await waitFor(() => expect(screen.getByRole('button', { name: 'Release' })).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: 'Release' }))
    fireEvent.change(screen.getByRole('textbox', { name: /reason/i }), {
      target: { value: 'Brand retired.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Release it' }))

    await waitFor(() =>
      expect(detachMock).toHaveBeenCalledWith('org_iitd', 'iitd.ernet.in', 'Brand retired.'),
    )
  })

  it('shows a pending domain as awaiting review rather than as settled', async () => {
    await openDomains([domain(), domain({ domain: 'iitd.ernet.in', isPrimary: false, reviewState: 'PENDING' })])

    await waitFor(() => expect(screen.getByText('Awaiting review')).toBeTruthy())
  })
})
