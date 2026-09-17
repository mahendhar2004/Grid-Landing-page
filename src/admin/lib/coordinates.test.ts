import { describe, expect, it } from 'vitest'

import { formatCoordinate, hasUsableCoordinates } from './coordinates'

describe('formatCoordinate', () => {
  it('names the hemisphere, so a sign does not have to be decoded', () => {
    expect(formatCoordinate(23.1793, 'lat')).toBe('23.1793° N')
    expect(formatCoordinate(-23.1793, 'lat')).toBe('23.1793° S')
    expect(formatCoordinate(79.9865, 'lng')).toBe('79.9865° E')
    expect(formatCoordinate(-79.9865, 'lng')).toBe('79.9865° W')
  })

  it('treats zero as the positive hemisphere rather than printing a minus', () => {
    expect(formatCoordinate(0, 'lat')).toBe('0.0000° N')
    expect(formatCoordinate(0, 'lng')).toBe('0.0000° E')
  })

  it('keeps four decimals - about 11 metres, far finer than a campus needs', () => {
    expect(formatCoordinate(23.1, 'lat')).toBe('23.1000° N')
    expect(formatCoordinate(23.17934567, 'lat')).toBe('23.1793° N')
  })
})

describe('hasUsableCoordinates', () => {
  it('accepts a real pair', () => {
    expect(hasUsableCoordinates('23.1793', '79.9865')).toBe(true)
    expect(hasUsableCoordinates('-33.8688', '151.2093')).toBe(true)
  })

  it('refuses a blank, which would otherwise become 0,0 in the Atlantic', () => {
    // `Number('')` is 0, and 0,0 is a real coordinate - so a blank field
    // would silently move a Hub into the ocean.
    expect(hasUsableCoordinates('', '')).toBe(false)
    expect(hasUsableCoordinates('23.1793', '')).toBe(false)
    expect(hasUsableCoordinates('   ', '79.9865')).toBe(false)
  })

  it('refuses text', () => {
    expect(hasUsableCoordinates('near the gate', '79.9865')).toBe(false)
  })

  it('accepts a genuine zero, which is a place even if an unlikely one', () => {
    expect(hasUsableCoordinates('0', '0')).toBe(true)
  })
})
