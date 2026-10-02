import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CreditRewards } from './CreditRewards'
import { api } from '../api/endpoints'

vi.mock('../api/endpoints', () => ({ api: { creditRewards: { list: vi.fn(), set: vi.fn() }, monetization: { get: vi.fn() } } }))

const listMock = vi.mocked(api.creditRewards.list)
const setMock = vi.mocked(api.creditRewards.set)
const monetizationMock = vi.mocked(api.monetization.get)

function postingFeature(paid: boolean) {
  return { key: 'LISTING_POST', label: 'Posting a listing', explain: '', model: 'PER_USE', unit: 'listing', enforcedAt: null, pricing: [{ orgType: 'ACADEMIC', isPaid: paid, basePricePaise: paid ? 1500 : 0, discountPaise: 0 }] }
}

function writeReason(text: string) {
  const textarea = document.querySelector('textarea')!
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')!.set!
    setter.call(textarea, text)
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

describe('CreditRewards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listMock.mockResolvedValue([
      { source: 'SIGNUP_BONUS', amountPaise: 5000 },
      { source: 'REFERRAL_REWARD', amountPaise: 2500 },
      // Stored, but set by the plan, so there is nothing to edit for it here.
      { source: 'PLAN_MONTHLY_CREDIT', amountPaise: 0 },
    ])
    setMock.mockResolvedValue({ source: 'SIGNUP_BONUS', amountPaise: 7500 })
    monetizationMock.mockResolvedValue({ features: [postingFeature(false)], plans: [] } as never)
  })
  afterEach(cleanup)

  async function open() {
    render(<CreditRewards />)
    await waitFor(() => expect(screen.getByTestId('reward-SIGNUP_BONUS')).toBeTruthy())
  }

  it('says credits are switched off while posting is free, and not once a posting fee is paid', async () => {
    await open()
    await waitFor(() => expect(screen.getByTestId('credits-off-note')).toBeTruthy())

    cleanup()
    monetizationMock.mockResolvedValue({ features: [postingFeature(true)], plans: [] } as never)
    await open()
    await waitFor(() => expect(monetizationMock).toHaveBeenCalledTimes(2))
    expect(screen.queryByTestId('credits-off-note')).toBeNull()
  })

  it('shows the three rewards in rupees, and leaves out the one a plan decides', async () => {
    await open()

    expect((within(screen.getByTestId('reward-SIGNUP_BONUS')).getByLabelText('Amount (₹)') as HTMLInputElement).value).toBe('50')
    expect((within(screen.getByTestId('reward-REFERRAL_REWARD')).getByLabelText('Amount (₹)') as HTMLInputElement).value).toBe('25')
    // Never configured: shown as zero rather than missing.
    expect((within(screen.getByTestId('reward-SEVEN_DAY_STREAK')).getByLabelText('Amount (₹)') as HTMLInputElement).value).toBe('0')
    expect(screen.queryByTestId('reward-PLAN_MONTHLY_CREDIT')).toBeNull()
  })

  it('offers to save only after a change, and refuses an amount a wallet could not hold', async () => {
    await open()
    const row = within(screen.getByTestId('reward-SIGNUP_BONUS'))
    expect(row.getByRole('button', { name: /Save/ }).hasAttribute('disabled')).toBe(true)

    fireEvent.change(row.getByLabelText('Amount (₹)'), { target: { value: '999999' } })

    expect(row.getByText(/cannot hold more/)).toBeTruthy()
    expect(row.getByRole('button', { name: /Save/ }).hasAttribute('disabled')).toBe(true)
  })

  it('asks for a reason, then saves the amount in paise with it', async () => {
    await open()
    const row = within(screen.getByTestId('reward-SIGNUP_BONUS'))

    fireEvent.change(row.getByLabelText('Amount (₹)'), { target: { value: '75' } })
    fireEvent.click(row.getByRole('button', { name: /Save/ }))
    expect(screen.getByText(/From ₹50 to ₹75/)).toBeTruthy()
    writeReason('Autumn intake.')
    await act(async () => {
      screen.getByRole('dialog').querySelector<HTMLButtonElement>('button[type="submit"]')!.click()
    })

    await waitFor(() => expect(setMock).toHaveBeenCalledWith({ source: 'SIGNUP_BONUS', amountPaise: 7500, reason: 'Autumn intake.' }))
  })
})
