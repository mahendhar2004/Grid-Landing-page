/** `major.minor.patch`, the only shape the server accepts. */
const VERSION = /^(\d+)\.(\d+)\.(\d+)$/

/** Orders two versions: negative if `a` is older, zero if equal, positive if newer. `null` if either is not a version. */
export function compareVersions(a: string, b: string): number | null {
  const left = VERSION.exec(a.trim())
  const right = VERSION.exec(b.trim())
  if (!left || !right) return null
  for (let part = 1; part <= 3; part += 1) {
    const difference = Number(left[part]) - Number(right[part])
    if (difference !== 0) return difference
  }
  return 0
}

/** The first thing wrong with the floor and the latest as typed, in words, or null. */
export function problemWithVersions(min: string, latest: string): string | null {
  if (!VERSION.test(min.trim())) return 'The minimum version must look like 3.1.0.'
  if (!VERSION.test(latest.trim())) return 'The latest version must look like 3.1.0.'
  if ((compareVersions(min, latest) ?? 0) > 0) {
    return 'The minimum cannot be newer than the latest: that would block people from a version that is not yet the newest there is.'
  }
  return null
}

/** What a change does to people, said plainly, so raising the floor is never done without knowing it. */
export function consequenceOf(current: { min: string; latest: string }, next: { min: string; latest: string }): string | null {
  const floorMoved = compareVersions(next.min, current.min)
  const latestMoved = compareVersions(next.latest, current.latest)
  if (floorMoved !== null && floorMoved > 0) {
    return `Anyone on a build older than ${next.min.trim()} will be stopped at launch and told to update. Raise it only once ${next.min.trim()} is live in both stores.`
  }
  if (floorMoved !== null && floorMoved < 0) {
    return `Builds from ${next.min.trim()} up will be let back in.`
  }
  if (latestMoved !== null && latestMoved > 0) {
    return `Anyone on a build older than ${next.latest.trim()} will see a dismissible "update available" bar. Nobody is blocked.`
  }
  return null
}
