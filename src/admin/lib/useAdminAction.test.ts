import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useAdminAction } from './useAdminAction'

describe('useAdminAction', () => {
  it('reports success and reloads afterwards, never alongside', async () => {
    const order: string[] = []
    const onSuccess = vi.fn(async () => {
      order.push('reload')
    })
    const { result } = renderHook(() => useAdminAction(onSuccess))

    let succeeded: boolean | undefined
    await act(async () => {
      succeeded = await result.current.run(async () => {
        order.push('write')
      })
    })

    expect(succeeded).toBe(true)
    // Racing them is how a list re-renders without the change it just made.
    expect(order).toEqual(['write', 'reload'])
  })

  it('captures the error rather than throwing, because the screen wants to show it', async () => {
    const { result } = renderHook(() => useAdminAction())

    let succeeded: boolean | undefined
    await act(async () => {
      succeeded = await result.current.run(async () => {
        throw Object.assign(new Error('still has 3 members'), { status: 409 })
      })
    })

    expect(succeeded).toBe(false)
    expect(result.current.error?.message).toBe('still has 3 members')
  })

  it('clears busy even when the action throws, so a failure cannot wedge the buttons', async () => {
    const { result } = renderHook(() => useAdminAction())

    await act(async () => {
      await result.current.run(async () => {
        throw new Error('boom')
      })
    })

    await waitFor(() => expect(result.current.busy).toBe(false))
  })

  it('clears a previous error when a retry starts, so a stale failure never sits under a fresh success', async () => {
    const { result } = renderHook(() => useAdminAction())

    await act(async () => {
      await result.current.run(async () => {
        throw new Error('first attempt')
      })
    })
    expect(result.current.error).not.toBeNull()

    await act(async () => {
      await result.current.run(async () => undefined)
    })

    expect(result.current.error).toBeNull()
  })

  it('does not reload when the write failed', async () => {
    const onSuccess = vi.fn()
    const { result } = renderHook(() => useAdminAction(onSuccess))

    await act(async () => {
      await result.current.run(async () => {
        throw new Error('rejected')
      })
    })

    // Reloading after a refusal shows the unchanged list as though the
    // action had worked.
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
