import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { usePagedData } from './usePagedData'

/** A page of `n` rows, labelled by the offset they came from, so a test can tell pages apart. */
const page = (offset: number, n: number) => Array.from({ length: n }, (_, i) => `row-${offset + i}`)

describe('usePagedData', () => {
  it('loads the first page and reports whether there is more', async () => {
    const fetchPage = vi.fn(async (offset: number) => page(offset, 3))
    const { result } = renderHook(() => usePagedData(fetchPage, ['a'], 3))

    await waitFor(() => expect(result.current.rows).not.toBeNull())
    expect(result.current.rows).toEqual(['row-0', 'row-1', 'row-2'])
    // A full page means there might be another one.
    expect(result.current.hasMore).toBe(true)
  })

  it('treats a short page as the end, without needing a server count', async () => {
    const fetchPage = vi.fn(async () => page(0, 2))
    const { result } = renderHook(() => usePagedData(fetchPage, ['a'], 3))

    await waitFor(() => expect(result.current.rows).toHaveLength(2))
    expect(result.current.hasMore).toBe(false)
  })

  it('appends the next page rather than replacing what is on screen', async () => {
    const fetchPage = vi.fn(async (offset: number) => page(offset, 2))
    const { result } = renderHook(() => usePagedData(fetchPage, ['a'], 2))
    await waitFor(() => expect(result.current.rows).toHaveLength(2))

    act(() => result.current.loadMore())

    await waitFor(() => expect(result.current.rows).toHaveLength(4))
    expect(result.current.rows).toEqual(['row-0', 'row-1', 'row-2', 'row-3'])
    expect(fetchPage).toHaveBeenLastCalledWith(2)
  })

  it('starts over at offset zero when a filter changes', async () => {
    // Page three of the previous question is not page three of this one.
    const fetchPage = vi.fn(async (offset: number) => page(offset, 2))
    const { result, rerender } = renderHook(({ filter }) => usePagedData(fetchPage, [filter], 2), {
      initialProps: { filter: 'a' },
    })
    await waitFor(() => expect(result.current.rows).toHaveLength(2))
    act(() => result.current.loadMore())
    await waitFor(() => expect(result.current.rows).toHaveLength(4))

    rerender({ filter: 'b' })

    await waitFor(() => expect(result.current.rows).toHaveLength(2))
    expect(fetchPage).toHaveBeenLastCalledWith(0)
  })

  it('drops a response from a filter that has already been left', async () => {
    /*
      The failure this exists to prevent: switching filters fires a second
      request while the first is in flight, and without a guard whichever
      finishes last wins. On a moderation queue that means acting on a row
      from a list you are no longer looking at.
    */
    const resolvers: Array<(rows: string[]) => void> = []
    const fetchPage = vi.fn(
      () => new Promise<string[]>((resolve) => resolvers.push(resolve)),
    )
    const { result, rerender } = renderHook(({ filter }) => usePagedData(fetchPage, [filter], 2), {
      initialProps: { filter: 'a' },
    })

    rerender({ filter: 'b' })
    await waitFor(() => expect(resolvers).toHaveLength(2))

    // The second (current) filter answers first, then the abandoned one.
    await act(async () => {
      resolvers[1]!(['current'])
    })
    await act(async () => {
      resolvers[0]!(['stale'])
    })

    expect(result.current.rows).toEqual(['current'])
  })

  it('replaces rather than appends on reload, so a refresh cannot duplicate the list', async () => {
    const fetchPage = vi.fn(async (offset: number) => page(offset, 2))
    const { result } = renderHook(() => usePagedData(fetchPage, ['a'], 2))
    await waitFor(() => expect(result.current.rows).toHaveLength(2))

    await act(async () => {
      await result.current.reload()
    })

    await waitFor(() => expect(result.current.rows).toEqual(['row-0', 'row-1']))
  })

  it('surfaces an error without wedging the list', async () => {
    const fetchPage = vi.fn(async () => {
      throw new Error('nope')
    })
    const { result } = renderHook(() => usePagedData(fetchPage, ['a'], 2))

    await waitFor(() => expect(result.current.error).not.toBeNull())
    expect(result.current.loadingMore).toBe(false)
  })
})
