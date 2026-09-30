/**
 * Read every page of a list, up to a bound.
 *
 * For the places that need *all* of something rather than a screenful: the
 * organisations to choose from, the creatives waiting for review. A route has a
 * fixed maximum page (50 for advertisers and creatives, 100 for organisations),
 * and asking for more is a 400. The Action Centre asked for 100 of each of the
 * ad lists, swallowed the error, and reported "nothing waiting" for creatives
 * and advertisers that were in fact waiting. Ask for what the route allows, and
 * keep going.
 *
 * `maxPages` is a ceiling, not a target: a list that is somehow enormous stops
 * being read rather than hammering the API, and the caller gets what was read.
 */
export async function fetchAllByOffset<T>(
  page: (offset: number) => Promise<readonly T[]>,
  pageSize: number,
  maxPages = 10,
): Promise<T[]> {
  const all: T[] = []
  for (let index = 0; index < maxPages; index += 1) {
    const rows = await page(index * pageSize)
    all.push(...rows)
    if (rows.length < pageSize) break
  }
  return all
}

export async function fetchAllByCursor<T>(
  page: (cursor: string | null) => Promise<{ readonly items: readonly T[]; readonly nextCursor: string | null }>,
  maxPages = 10,
): Promise<T[]> {
  const all: T[] = []
  let cursor: string | null = null
  for (let index = 0; index < maxPages; index += 1) {
    const result = await page(cursor)
    all.push(...result.items)
    if (result.nextCursor === null) break
    cursor = result.nextCursor
  }
  return all
}
