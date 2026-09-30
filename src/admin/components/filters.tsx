import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { Icon } from './icons'

/**
 * The one filter bar every list screen uses.
 *
 * A screen declares what it can filter and sort by and hands the values here;
 * it never draws a filter itself. That is what keeps "select an organisation
 * to see only its members" the same gesture on every screen, and it is why a
 * new list is a few lines and not another copy of a search box.
 */

export interface Option<T extends string = string> {
  readonly value: T
  readonly label: string
  /** Small right-aligned text, e.g. a member count. */
  readonly hint?: string
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="relative flex items-center">
      <span className="sr-only">{placeholder}</span>
      <span className="pointer-events-none absolute left-3.5 text-[var(--c-faint)]">
        <Icon name="search" size={16} />
      </span>
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-[var(--control-h)] w-[min(300px,80vw)] rounded-full border border-[var(--c-line-strong)] bg-[var(--c-surface)] pl-10 pr-4 text-sm text-[var(--c-text)] outline-none placeholder:text-[var(--c-faint)] focus:border-[var(--c-focus)]"
      />
    </label>
  )
}

/**
 * A pill that opens a list of choices. `allValue` is the "no filter" option:
 * while it is selected the pill looks idle, and once anything else is chosen it
 * turns to the brand colour, so what is narrowing the list is visible at a
 * glance.
 */
export function Dropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  allValue,
  searchable = false,
  alignRight = false,
}: {
  label: string
  value: T
  options: ReadonlyArray<Option<T>>
  onChange: (value: T) => void
  allValue?: T
  searchable?: boolean
  alignRight?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const root = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selected = options.find((option) => option.value === value)
  const filtering = allValue !== undefined && value !== allValue
  const shown = query ? options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase())) : options

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          setOpen((was) => !was)
          setQuery('')
        }}
        className={`inline-flex h-[var(--control-h)] items-center gap-2 rounded-full border pl-4 pr-3 text-sm font-medium transition ${
          filtering
            ? 'border-[var(--c-brand)] bg-[var(--c-brand-soft)] text-[var(--c-brand)]'
            : 'border-[var(--c-line-strong)] bg-[var(--c-surface)] text-[var(--c-text)] hover:bg-[var(--c-surface-2)]'
        }`}
      >
        <span className={filtering ? 'opacity-80' : 'text-[var(--c-muted)]'}>{label}</span>
        <span>{selected?.label ?? ''}</span>
        <span className="opacity-60">
          <Icon name="chevron" size={14} />
        </span>
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-label={label}
          className={`absolute top-[calc(100%+8px)] z-30 max-h-[340px] min-w-[250px] overflow-auto rounded-[var(--r-inner)] border border-[var(--c-line)] bg-[var(--c-surface)] p-2 shadow-[var(--c-shadow-lg)] ${
            alignRight ? 'right-0' : 'left-0'
          }`}
        >
          {searchable ? (
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              aria-label={`Search ${label.toLowerCase()}`}
              className="mb-1.5 h-9 w-full rounded-full border border-[var(--c-line)] bg-[var(--c-surface-2)] px-4 text-sm text-[var(--c-text)] outline-none focus:border-[var(--c-focus)]"
            />
          ) : null}
          {shown.length === 0 ? <p className="px-3 py-4 text-sm text-[var(--c-muted)]">Nothing matches.</p> : null}
          {shown.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-2 text-left text-sm transition hover:bg-[var(--c-surface-2)] ${
                option.value === value ? 'font-semibold text-[var(--c-brand)]' : 'text-[var(--c-text)]'
              }`}
            >
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              {option.hint ? <span className="text-xs text-[var(--c-faint)]">{option.hint}</span> : null}
              {option.value === value ? <Icon name="check" size={15} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/** A removable pill saying what is narrowing the list. */
export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--c-brand-soft)] py-1 pl-3.5 pr-1.5 text-[13px] font-semibold text-[var(--c-brand)]">
      {label}
      <button
        type="button"
        aria-label={`Remove filter ${label}`}
        onClick={onRemove}
        className="grid h-5 w-5 place-items-center rounded-full bg-[var(--c-brand)]/15 transition hover:bg-[var(--c-brand)]/30"
      >
        <Icon name="x" size={12} />
      </button>
    </span>
  )
}

export function FilterChips({
  chips,
  onRemove,
  onClearAll,
}: {
  chips: ReadonlyArray<{ readonly key: string; readonly label: string }>
  onRemove: (key: string) => void
  onClearAll: () => void
}) {
  if (chips.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <FilterChip key={chip.key} label={chip.label} onRemove={() => onRemove(chip.key)} />
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="rounded-full px-3 py-1 text-[13px] font-semibold text-[var(--c-muted)] transition hover:bg-[var(--c-surface-2)] hover:text-[var(--c-text)]"
      >
        Clear all
      </button>
    </div>
  )
}

/** The rounded bar the controls sit in: filters on the left, count and sort on the right. */
export function Toolbar({ children, count, sort }: { children: ReactNode; count?: string; sort?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-[var(--r-card)] border border-[var(--c-line)] bg-[var(--c-surface)] p-3 shadow-[var(--c-shadow)]">
      {children}
      <span className="flex-1" />
      {count ? <span className="px-2 text-[13px] tabular-nums text-[var(--c-muted)]">{count}</span> : null}
      {sort}
    </div>
  )
}
