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
