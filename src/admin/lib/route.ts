import { useMemo, useSyncExternalStore } from 'react'

/**
 * The address is the state: `#users?org=<id>&status=banned`.
 *
 * A filtered view can therefore be bookmarked, pasted to someone, and reached
 * with the back button, and there is one place that knows where the console is.
 * Nothing here talks to the server; screens read their own filters with
 * `useFilters`.
 */
export interface Route {
  readonly view: string
  readonly params: URLSearchParams
}

const DEFAULT_VIEW = 'home'

export function parseHash(hash: string): Route {
  const [view = '', query = ''] = hash.replace(/^#/, '').split('?')
  return { view: view || DEFAULT_VIEW, params: new URLSearchParams(query) }
}

export function buildHash(view: string, params?: Readonly<Record<string, string>>): string {
  const query = new URLSearchParams(params ?? {}).toString()
  return `#${view}${query ? `?${query}` : ''}`
}

function subscribe(listener: () => void): () => void {
  window.addEventListener('hashchange', listener)
  return () => window.removeEventListener('hashchange', listener)
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => '')
  return useMemo(() => parseHash(hash), [hash])
}

/** Go to a screen, optionally with filters already applied (an entry in the browser's history). */
export function navigate(view: string, params?: Readonly<Record<string, string>>): void {
  window.location.hash = buildHash(view, params)
}

/** Change the filters of the current screen without adding a history entry for every keystroke. */
export function replaceRoute(view: string, params: Readonly<Record<string, string>>): void {
  window.history.replaceState(null, '', buildHash(view, params))
  // `replaceState` is silent; tell everything reading the address.
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}
