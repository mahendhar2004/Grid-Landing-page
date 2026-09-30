import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Dropdown, FilterChips, SearchBox } from './filters'

const OPTIONS = [
  { value: 'all', label: 'All organisations' },
  { value: 'a', label: 'IIT Delhi', hint: '312' },
  { value: 'b', label: 'BITS Hyderabad' },
]

describe('Dropdown', () => {
  afterEach(() => cleanup())

  it('shows the chosen option on the pill and opens the list on click', () => {
    render(<Dropdown label="Organisation" value="a" options={OPTIONS} onChange={() => undefined} allValue="all" />)

    expect(screen.getByRole('button', { name: /Organisation.*IIT Delhi/ })).toBeTruthy()
    expect(screen.queryByRole('listbox')).toBeNull()

    act(() => screen.getByRole('button', { name: /Organisation/ }).click())

    expect(screen.getByRole('listbox')).toBeTruthy()
    expect(screen.getAllByRole('option')).toHaveLength(3)
    expect(screen.getByRole('option', { name: /IIT Delhi/ }).getAttribute('aria-selected')).toBe('true')
  })

  it('reports a choice and closes', () => {
    const onChange = vi.fn()
    render(<Dropdown label="Organisation" value="all" options={OPTIONS} onChange={onChange} allValue="all" />)

    act(() => screen.getByRole('button', { name: /Organisation/ }).click())
    act(() => screen.getByRole('option', { name: 'BITS Hyderabad' }).click())

    expect(onChange).toHaveBeenCalledWith('b')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('narrows a long list as you type in its own search box', () => {
    render(<Dropdown label="Organisation" value="all" options={OPTIONS} onChange={() => undefined} allValue="all" searchable />)

    act(() => screen.getByRole('button', { name: /Organisation/ }).click())
    fireEvent.change(screen.getByLabelText('Search organisation'), { target: { value: 'bits' } })

    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['BITS Hyderabad'])

    fireEvent.change(screen.getByLabelText('Search organisation'), { target: { value: 'zzz' } })
    expect(screen.getByText('Nothing matches.')).toBeTruthy()
  })

  it('closes on Escape and on a click outside', () => {
    render(
      <div>
        <span>outside</span>
        <Dropdown label="Organisation" value="all" options={OPTIONS} onChange={() => undefined} allValue="all" />
      </div>,
    )

    act(() => screen.getByRole('button', { name: /Organisation/ }).click())
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()

    act(() => screen.getByRole('button', { name: /Organisation/ }).click())
    fireEvent.mouseDown(screen.getByText('outside'))
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})

describe('FilterChips', () => {
  afterEach(() => cleanup())

  it('renders nothing when nothing is narrowing the list', () => {
    const { container } = render(<FilterChips chips={[]} onRemove={() => undefined} onClearAll={() => undefined} />)

    expect(container.textContent).toBe('')
  })

  it('removes one filter, or all of them', () => {
    const onRemove = vi.fn()
    const onClearAll = vi.fn()
    render(<FilterChips chips={[{ key: 'org', label: 'Organisation IIT Delhi' }]} onRemove={onRemove} onClearAll={onClearAll} />)

    act(() => screen.getByRole('button', { name: 'Remove filter Organisation IIT Delhi' }).click())
    act(() => screen.getByRole('button', { name: 'Clear all' }).click())

    expect(onRemove).toHaveBeenCalledWith('org')
    expect(onClearAll).toHaveBeenCalled()
  })
})

describe('SearchBox', () => {
  afterEach(() => cleanup())

  it('reports what is typed', () => {
    const onChange = vi.fn()
    render(<SearchBox value="" onChange={onChange} placeholder="Search name or email" />)

    fireEvent.change(screen.getByPlaceholderText('Search name or email'), { target: { value: 'asha' } })

    expect(onChange).toHaveBeenCalledWith('asha')
  })
})
