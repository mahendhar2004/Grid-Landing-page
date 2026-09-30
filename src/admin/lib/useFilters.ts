import { useCallback, useMemo } from 'react'

import { replaceRoute, useRoute } from './route'

/**
 * One screen's filters, kept in the address.
 *
 * `defaults` names every filter the screen has and its "no filter" value; only
 * values that differ from it are written to the address, so an unfiltered
 * screen has a clean URL. Values are strings because that is what an address
 * holds; a screen turns them into what its API wants.
 *
 * Every list screen uses this, so a filter behaves the same everywhere: it
 * survives a reload, it is shareable, and "Clear" means the same thing.
 */
export interface Filters<T extends Record<string, string>> {
  readonly values: T
  /** Set one filter. */
  readonly set: (key: keyof T & string, value: string) => void
  /** Reset one filter, or every filter but `keep` when given `'*'`. */
  readonly clear: (key: (keyof T & string) | '*') => void
  /** How many filters differ from their default, the search box included. */
  readonly active: ReadonlyArray<keyof T & string>
}

export function useFilters<T extends Record<string, string>>(
  view: string,
  defaults: T,
  keep: ReadonlyArray<keyof T & string> = [],
): Filters<T> {
  const route = useRoute()

  const values = useMemo(() => {
    const merged: Record<string, string> = { ...defaults }
    if (route.view === view) {
      for (const key of Object.keys(defaults)) {
        const found = route.params.get(key)
        if (found !== null) merged[key] = found
      }
    }
    return merged as T
    // `defaults` is a module-level constant on every screen, by convention.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, view])

  const write = useCallback(
    (next: T) => {
      const params: Record<string, string> = {}
      for (const key of Object.keys(defaults)) {
        if (next[key] !== defaults[key]) params[key] = next[key] as string
      }
      replaceRoute(view, params)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view],
  )

  const set = useCallback((key: keyof T & string, value: string) => write({ ...values, [key]: value }), [values, write])

  const clear = useCallback(
    (key: (keyof T & string) | '*') => {
      if (key === '*') {
        const kept = Object.fromEntries(keep.map((k) => [k, values[k]]))
        write({ ...defaults, ...kept } as T)
      } else {
        write({ ...values, [key]: defaults[key] })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, write, keep.join('|')],
  )

  const active = useMemo(
    () => (Object.keys(defaults) as Array<keyof T & string>).filter((key) => values[key] !== defaults[key] && !keep.includes(key)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, keep.join('|')],
  )

  return { values, set, clear, active }
}
