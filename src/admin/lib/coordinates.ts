/**
 * Reading a Hub's pin.
 *
 * A Hub's coordinates are the least self-explanatory thing in the console: a
 * bare pair of signed decimals says nothing about which is which, which way
 * is positive, or whether the value in the box is even in the right format.
 * Everything geographic measures from that point, so being unsure about it
 * is expensive.
 */

/**
 * A coordinate as a person reads it - four decimal places (about 11 metres,
 * far finer than a campus needs) and a hemisphere letter.
 *
 * The raw signed number is shown next to this in the editor rather than
 * instead of it: the signed form is what the field accepts and what Google
 * Maps hands back, so a console that only ever renders "23.1793° N" leaves
 * someone guessing whether to type the degree sign.
 */
export function formatCoordinate(value: number, axis: 'lat' | 'lng'): string {
  const hemisphere = axis === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W'
  return `${Math.abs(value).toFixed(4)}° ${hemisphere}`
}

/** Whether a typed pair is usable. `Number('')` is 0, and 0,0 is a real coordinate in the Atlantic. */
export function hasUsableCoordinates(latitude: string, longitude: string): boolean {
  return (
    latitude.trim().length > 0 &&
    longitude.trim().length > 0 &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude))
  )
}

/** A parsed pin. */
export interface LatLng {
  readonly latitude: number
  readonly longitude: number
}

/**
 * One coordinate, in either format a person actually has.
 *
 * Google Maps shows a place as `23°10'36.0"N` when you click it and as
 * `23.176667` when you copy from the URL, and there is no signal about which
 * one a console wants. Accepting only decimals means converting by hand —
 * degrees, minutes over sixty, seconds over three thousand six hundred — for
 * a value where being 665 km wrong is a plausible outcome and looks
 * plausible on the way in.
 *
 * Returns null rather than guessing. A half-understood coordinate is worse
 * than a rejected one.
 */
export function parseCoordinate(input: string): number | null {
  const text = input.trim()
  if (text.length === 0) {
    return null
  }

  // Degrees / minutes / seconds, with the hemisphere as a letter: the
  // separators vary (° ' " vs spaces vs primes), so match numbers in order
  // and take the letter wherever it sits.
  const hemisphere = /([NSEW])\s*$/i.exec(text) ?? /^\s*([NSEW])/i.exec(text)
  if (hemisphere) {
    const numbers = text.match(/\d+(?:\.\d+)?/g)
    if (!numbers || numbers.length === 0) {
      return null
    }
    const [degrees = '0', minutes = '0', seconds = '0'] = numbers
    const magnitude = Number(degrees) + Number(minutes) / 60 + Number(seconds) / 3600
    if (!Number.isFinite(magnitude)) {
      return null
    }
    const letter = hemisphere[1]!.toUpperCase()
    return letter === 'S' || letter === 'W' ? -magnitude : magnitude
  }

  const decimal = Number(text)
  return Number.isFinite(decimal) ? decimal : null
}

/**
 * A whole pin pasted as one string — "23°10'36.0\"N 80°01'30.3\"E" or
 * "23.176667, 80.025083" — because that is the unit people copy.
 *
 * Splitting on the hemisphere letters rather than on the comma: a DMS pair
 * has no comma between the halves, and a decimal pair has no letters, so
 * neither split works for both.
 */
export function parseLatLngPair(input: string): LatLng | null {
  const text = input.trim()
  if (text.length === 0) {
    return null
  }

  const dmsParts = text.match(/[^NSEW]*[NS]|[^NSEW]*[EW]/gi)
  const halves =
    dmsParts && dmsParts.length === 2 ? dmsParts : text.split(/\s*,\s*|\s+/).filter(Boolean)
  if (halves.length !== 2) {
    return null
  }

  const latitude = parseCoordinate(halves[0]!)
  const longitude = parseCoordinate(halves[1]!)
  if (latitude === null || longitude === null) {
    return null
  }
  /*
    Bounds only. This catches the transposition it can - PostGIS stores
    longitude first, so a pair copied from the database arrives reversed, and
    any longitude past 90 gives it away as a latitude.

    It cannot catch the rest, and does not pretend to: 80.02°N 23.18°E is the
    Arctic Ocean, a real coordinate, and nothing in the string says which half
    was meant to be which. The editor's "check the point you typed" link is
    what catches that, because a human looking at a map knows instantly.
  */
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return null
  }
  return { latitude, longitude }
}
