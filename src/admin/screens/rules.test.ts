import { describe, expect, it } from 'vitest'

import { daysError } from './grantDays'
import { MAX_REWARD_RUPEES, problemWithReward, rupeesFromPaise } from './rewardRules'
import { compareVersions, consequenceOf, problemWithVersions } from './versionRules'

describe('daysError', () => {
  it.each([
    ['30', null],
    ['1', null],
    ['365', null],
    ['', /Enter/],
    ['  ', /Enter/],
    ['0', /1 to 365/],
    ['366', /1 to 365/],
    ['-3', /1 to 365/],
    ['1.5', /whole number/],
    ['soon', /whole number/],
  ])('%j', (raw, expected) => {
    const result = daysError(raw)
    if (expected === null) expect(result).toBeNull()
    else expect(result).toMatch(expected)
  })
})

describe('compareVersions', () => {
  it.each([
    ['3.0.0', '3.0.0', 0],
    ['3.1.0', '3.0.9', 1],
    ['3.0.9', '3.1.0', -1],
    ['10.0.0', '9.9.9', 1],
  ])('%s against %s', (a, b, sign) => {
    expect(Math.sign(compareVersions(a, b) ?? NaN)).toBe(sign)
  })

  it('is null for something that is not a version', () => {
    expect(compareVersions('3.0', '3.0.0')).toBeNull()
    expect(compareVersions('3.0.0', 'latest')).toBeNull()
  })
})

describe('problemWithVersions', () => {
  it('accepts a floor at or below the latest', () => {
    expect(problemWithVersions('3.0.0', '3.1.0')).toBeNull()
    expect(problemWithVersions('3.1.0', '3.1.0')).toBeNull()
  })

  it('refuses text that is not a version, naming which field', () => {
    expect(problemWithVersions('3', '3.0.0')).toMatch(/minimum version/)
    expect(problemWithVersions('3.0.0', 'new')).toMatch(/latest version/)
  })

  it('refuses a floor above the latest, and says what that would do to people', () => {
    expect(problemWithVersions('3.2.0', '3.1.0')).toMatch(/cannot be newer/)
  })
})

describe('consequenceOf', () => {
  const current = { min: '3.0.0', latest: '3.1.0' }

  it('warns that raising the floor stops older builds, and to wait for the stores', () => {
    expect(consequenceOf(current, { min: '3.1.0', latest: '3.1.0' })).toMatch(/stopped at launch.*live in both stores/)
  })

  it('says lowering the floor lets builds back in', () => {
    expect(consequenceOf({ min: '3.1.0', latest: '3.1.0' }, { min: '3.0.0', latest: '3.1.0' })).toMatch(/let back in/)
  })

  it('says raising only the latest blocks nobody', () => {
    expect(consequenceOf(current, { min: '3.0.0', latest: '3.2.0' })).toMatch(/Nobody is blocked/)
  })

  it('has nothing to say when nothing moves', () => {
    expect(consequenceOf(current, current)).toBeNull()
  })
})

describe('problemWithReward', () => {
  it.each([
    ['0', null],
    ['50', null],
    ['12.5', null],
    [String(MAX_REWARD_RUPEES), null],
    ['', /Enter an amount/],
    ['abc', /number/],
    ['-1', /negative/],
    [String(MAX_REWARD_RUPEES + 1), /cannot hold/],
    ['1.234', /two decimal/],
  ])('%j', (raw, expected) => {
    const result = problemWithReward(raw)
    if (expected === null) expect(result).toBeNull()
    else expect(result).toMatch(expected)
  })

  it('shows paise as rupees', () => {
    expect(rupeesFromPaise(5000)).toBe('50')
    expect(rupeesFromPaise(1250)).toBe('12.5')
  })
})
