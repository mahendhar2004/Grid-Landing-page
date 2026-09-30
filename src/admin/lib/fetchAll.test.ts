import { describe, expect, it, vi } from 'vitest'

import { fetchAllByCursor, fetchAllByOffset } from './fetchAll'

describe('fetchAllByOffset', () => {
  it('reads pages until one comes back short', async () => {
    const page = vi.fn(async (offset: number) => (offset === 0 ? [1, 2] : offset === 2 ? [3, 4] : [5]))

    expect(await fetchAllByOffset(page, 2)).toEqual([1, 2, 3, 4, 5])
    expect(page.mock.calls.map((call) => call[0])).toEqual([0, 2, 4])
  })

  it('stops after one request when the first page is short', async () => {
    const page = vi.fn(async () => [1])

    expect(await fetchAllByOffset(page, 100)).toEqual([1])
    expect(page).toHaveBeenCalledTimes(1)
  })

  it('stops at its ceiling rather than reading a never-ending list', async () => {
    const page = vi.fn(async () => [1, 2])

    expect((await fetchAllByOffset(page, 2, 3)).length).toBe(6)
    expect(page).toHaveBeenCalledTimes(3)
  })
})

describe('fetchAllByCursor', () => {
  it('follows the cursor to the end', async () => {
    const page = vi.fn(async (cursor: string | null) =>
      cursor === null ? { items: ['a'], nextCursor: 'c1' } : cursor === 'c1' ? { items: ['b'], nextCursor: 'c2' } : { items: ['c'], nextCursor: null },
    )

    expect(await fetchAllByCursor(page)).toEqual(['a', 'b', 'c'])
    expect(page.mock.calls.map((call) => call[0])).toEqual([null, 'c1', 'c2'])
  })

  it('stops at its ceiling even if the server keeps saying there is more', async () => {
    const page = vi.fn(async () => ({ items: ['x'], nextCursor: 'again' }))

    expect(await fetchAllByCursor(page, 4)).toHaveLength(4)
    expect(page).toHaveBeenCalledTimes(4)
  })
})
