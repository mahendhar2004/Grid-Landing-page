import { useCallback, useSyncExternalStore } from 'react'

/**
 * Light or dark, remembered.
 *
 * `admin.html` decides the first paint (stored choice, else the system's) and
 * writes it to <html data-theme>. This reads and changes that one attribute, so
 * the page and React can never disagree about which theme is showing.
 */
export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'grid-console-theme'
const listeners = new Set<() => void>()

function current(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setTheme(theme: Theme): void {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.classList.toggle('dark', theme === 'dark')
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Private mode or blocked storage: the choice holds for this visit only.
  }
  listeners.forEach((listener) => listener())
}

export function useTheme(): { theme: Theme; toggle: () => void } {
  const theme = useSyncExternalStore(subscribe, current, () => 'light' as Theme)
  const toggle = useCallback(() => setTheme(current() === 'dark' ? 'light' : 'dark'), [])
  return { theme, toggle }
}
