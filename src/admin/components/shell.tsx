import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { NAV, NAV_GROUPS } from '../nav'
import { navigate } from '../lib/route'
import { useTheme } from '../lib/theme'
import { Avatar, IconButton } from './ui'
import { Logo } from './brand'
import { Icon } from './icons'

/**
 * The frame around every screen: a floating sidebar, a bar with the
 * breadcrumb, search and theme, and the command palette.
 *
 * Navigation is entirely `nav.ts` and the address; nothing here knows what a
 * screen contains.
 */

export function Sidebar({ current, open, onClose, onSignOut }: { current: string; open: boolean; onClose: () => void; onSignOut: () => void }) {
  return (
    <>
      <button
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        className={`fixed inset-0 z-30 bg-[var(--c-scrim)] transition-opacity duration-[var(--dur)] lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside
        aria-label="Console navigation"
        className={`fixed inset-y-[var(--side-inset)] left-[var(--side-inset)] z-40 flex w-[var(--sidebar-w)] flex-col gap-6 overflow-auto rounded-[var(--side-radius)] bg-[var(--c-nav-bg)] px-3.5 py-5 text-[var(--c-nav-text)] transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-[120%]'
        }`}
      >
        <div className="px-2 text-[var(--c-nav-strong)]">
          <Logo size={28} />
        </div>

        <nav className="grid gap-5">
          {NAV_GROUPS.map((group) => (
            <div key={group} className="grid gap-0.5">
              <p className="px-3 pb-1.5 text-xs font-medium text-[var(--c-nav-muted)]">{group}</p>
              {NAV.filter((entry) => entry.group === group).map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  aria-current={entry.id === current ? 'page' : undefined}
                  onClick={() => {
                    navigate(entry.id)
                    onClose()
                  }}
                  className={`flex items-center gap-3 rounded-full px-3.5 py-2.5 text-left text-sm font-medium transition ${
                    entry.id === current
                      ? 'bg-[var(--c-nav-active)] text-[var(--c-nav-strong)]'
                      : 'hover:bg-[var(--c-nav-hover)]'
                  }`}
                >
                  <Icon name={entry.icon} />
                  {entry.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <button
          type="button"
          onClick={onSignOut}
          className="mt-auto flex items-center gap-3 rounded-full border-t border-[var(--c-nav-line)] px-3.5 py-3 text-left text-sm font-medium transition hover:bg-[var(--c-nav-hover)]"
        >
          <Icon name="logout" />
          Sign out
        </button>
      </aside>
    </>
  )
}

export function UtilityBar({ current, onMenu, onSearch }: { current: string; onMenu: () => void; onSearch: () => void }) {
  const { theme, toggle } = useTheme()
  const entry = NAV.find((item) => item.id === current)

  return (
    <div className="mx-auto mb-6 flex max-w-[var(--page-max)] items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <IconButton label="Open menu" onClick={onMenu}>
            <Icon name="home" />
          </IconButton>
        </div>
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-medium text-[var(--c-muted)]">
          <span>{entry?.group ?? 'Console'}</span>
          <span aria-hidden="true">/</span>
          <strong className="font-semibold text-[var(--c-text)]">{entry?.label ?? current}</strong>
        </nav>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onSearch}
          className="hidden h-[var(--control-h)] min-w-[250px] items-center gap-2.5 rounded-full border border-[var(--c-line-strong)] bg-[var(--c-surface)] pl-3.5 pr-2 text-sm text-[var(--c-muted)] transition hover:bg-[var(--c-surface-2)] sm:inline-flex"
        >
          <Icon name="search" size={16} />
          <span>Search or jump to…</span>
          <kbd className="ml-auto rounded-md border border-[var(--c-line-strong)] px-1.5 py-0.5 text-[11px] text-[var(--c-muted)]">Ctrl K</kbd>
        </button>
        <IconButton label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggle}>
          <span key={theme} className="motion-icon grid place-items-center">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </span>
        </IconButton>
        <Avatar name="Grid Admin" />
      </div>
    </div>
  )
}

interface Command {
  readonly label: string
  readonly hint: string
  readonly run: () => void
}

/** Ctrl or Cmd + K: jump to any screen, or straight to a filtered list. */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement>(null)

  const commands = useMemo<ReadonlyArray<Command>>(
    () => [
      ...NAV.map((entry) => ({ label: `Go to ${entry.label}`, hint: entry.group, run: () => navigate(entry.id) })),
      { label: 'Banned members', hint: 'Filter', run: () => navigate('users', { status: 'banned' }) },
      { label: 'Members someone has reported', hint: 'Filter', run: () => navigate('users', { reported: 'yes' }) },
    ],
    [],
  )
  const shown = commands.filter((command) => `${command.label} ${command.hint}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8)

  useEffect(() => {
    if (open) input.current?.focus()
  }, [open])

  if (!open) return null

  function choose(command: Command | undefined) {
    if (!command) return
    command.run()
    onClose()
  }

  return (
    <div className="motion-fade fixed inset-0 z-[70] bg-[var(--c-scrim)]" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(event) => event.stopPropagation()}
        className="motion-sheet mx-auto mt-[14vh] w-[min(560px,94vw)] overflow-clip rounded-[var(--r-card)] border border-[var(--c-line-strong)] bg-[var(--c-surface)] shadow-[var(--c-shadow-lg)]"
      >
        <input
          ref={input}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setActive((n) => (shown.length === 0 ? 0 : (n + 1) % shown.length))
            } else if (event.key === 'ArrowUp') {
              event.preventDefault()
              setActive((n) => (shown.length === 0 ? 0 : (n - 1 + shown.length) % shown.length))
            } else if (event.key === 'Enter') {
              choose(shown[active])
            } else if (event.key === 'Escape') {
              onClose()
            }
          }}
          placeholder="Go to a screen, or a filtered list"
          aria-label="Search commands"
          className="w-full border-b border-[var(--c-line)] bg-transparent px-6 py-4 text-base text-[var(--c-text)] outline-none placeholder:text-[var(--c-faint)]"
        />
        <ul className="max-h-[320px] overflow-auto p-2">
          {shown.length === 0 ? <li className="px-4 py-6 text-center text-sm text-[var(--c-muted)]">Nothing found.</li> : null}
          {shown.map((command, index) => (
            <li key={command.label}>
              <button
                type="button"
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(command)}
                className={`flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-left text-sm ${index === active ? 'bg-[var(--c-surface-2)]' : ''}`}
              >
                <span className="flex-1 text-[var(--c-text)]">{command.label}</span>
                <span className="text-xs text-[var(--c-faint)]">{command.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** The scrolling area beside the sidebar. */
export function Canvas({ children }: { children: ReactNode }) {
  return <main className="min-w-0 px-5 py-6 lg:ml-[calc(var(--sidebar-w)+var(--side-inset)*2)] lg:px-9">{children}</main>
}
