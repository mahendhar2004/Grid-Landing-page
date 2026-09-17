import { describe, expect, it } from 'vitest'

import { formatCoordinate, hasUsableCoordinates, parseCoordinate, parseLatLngPair } from './coordinates'

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

describe('parseCoordinate', () => {
  it('reads the decimal form', () => {
    expect(parseCoordinate('23.176667')).toBeCloseTo(23.176667, 6)
    expect(parseCoordinate('-33.8688')).toBeCloseTo(-33.8688, 4)
  })

  it('reads the degrees/minutes/seconds form Google Maps shows on a click', () => {
    expect(parseCoordinate(`23°10'36.0"N`)).toBeCloseTo(23.176667, 5)
    expect(parseCoordinate(`80°01'30.3"E`)).toBeCloseTo(80.025083, 5)
  })

  it('makes south and west negative', () => {
    expect(parseCoordinate(`23°10'36.0"S`)).toBeCloseTo(-23.176667, 5)
    expect(parseCoordinate(`80°01'30.3"W`)).toBeCloseTo(-80.025083, 5)
  })

  it('returns null rather than guessing at nonsense', () => {
    expect(parseCoordinate('near the main gate')).toBeNull()
    expect(parseCoordinate('')).toBeNull()
  })
})

describe('parseLatLngPair', () => {
  it('reads a DMS pair, which has no comma between its halves', () => {
    const pin = parseLatLngPair(`23°10'36.0"N 80°01'30.3"E`)

    expect(pin?.latitude).toBeCloseTo(23.176667, 5)
    expect(pin?.longitude).toBeCloseTo(80.025083, 5)
  })

  it('reads a decimal pair, which has no hemisphere letters', () => {
    const pin = parseLatLngPair('23.176667, 80.025083')

    expect(pin?.latitude).toBeCloseTo(23.176667, 6)
    expect(pin?.longitude).toBeCloseTo(80.025083, 6)
  })

  it('refuses a pair whose latitude cannot be one', () => {
    // Catches the transposition it *can* catch: PostGIS stores longitude
    // first, so a pair copied from the database arrives the wrong way round,
    // and any longitude past 90 gives it away.
    expect(parseLatLngPair('120.5, 23.176667')).toBeNull()
    expect(parseLatLngPair('23.176667, 200')).toBeNull()
  })

  it('cannot detect a transposition where both values are plausible latitudes, and does not pretend to', () => {
    // 80.02°N 23.18°E is the Arctic Ocean - a real place. Nothing in the
    // string says which half was meant to be which, so this parses it and
    // the editor's "check the point you typed" link is what catches it.
    expect(parseLatLngPair('80.025083, 23.176667')).not.toBeNull()
  })

  it('refuses anything it cannot fully read', () => {
    expect(parseLatLngPair('23.176667')).toBeNull()
    expect(parseLatLngPair('somewhere near the lake')).toBeNull()
    expect(parseLatLngPair('')).toBeNull()
  })
})
