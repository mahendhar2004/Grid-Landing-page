/**
 * Guards the published Privacy Policy and Terms.
 *
 * These two pages are the *only* copy of Grid's legal text since 16 Sep 2026
 * - the mobile app links to them and `grid-v2`'s own section arrays were
 *   deleted. Before that, two copies existed and drifted in opposite
 *   directions for months: `grid-v2` named Razorpay and Branch after both
 *   were removed from the product, while these pages named no Grievance
 *   Officer, appointed no Nodal Contact Person and published no redressal
 *   clock. Each looked internally consistent, so nothing caught either.
 *
 * `grid-v2` had unit tests asserting exactly this; this repo has no test
 * runner, so rather than lose the guards with the code they guarded, they
 * are a build step. Deliberately string matching, not parsing: the failure
 * being prevented is a required disclosure quietly disappearing from a
 * rewrite, and a substring is enough to catch that.
 */
import { readFileSync } from 'node:fs'

const PRIVACY = 'src/pages/PrivacyPolicyPage.tsx'
const TERMS = 'src/pages/TermsPage.tsx'

/** [file, required substring, why it is required] */
const REQUIRED = [
  [PRIVACY, 'Mahendhar Seelam', 'IT Rules / DPDP: the Grievance Officer must be named, not just an inbox'],
  [PRIVACY, 'Nodal Contact Person', 'Consumer Protection (E-Commerce) Rules 2020, Rule 4(5)'],
  [PRIVACY, 'resident in India', 'Rule 4(5) requires the nodal person to be resident in India'],
  [PRIVACY, '24 hours', 'Rule 3(2)(a)(i): the acknowledgement window must be published'],
  [PRIVACY, '7 days', 'Rule 3(2)(a)(i) as amended Feb 2026: the resolution window'],
  [PRIVACY, 'Data Protection Board of India', 'DPDP: the escalation route must be stated'],
  [PRIVACY, 'nominate', 'DPDP section 14: the nomination right is easily forgotten'],
  [PRIVACY, 'Galvam', 'Rule 4(3): the operating entity must be identified, not just the brand'],
  [PRIVACY, 'Governing Law', 'the policy must state the law it runs under'],
  [TERMS, 'Mahendhar Seelam', 'the Terms publish the same officers as the Policy'],
  [TERMS, 'Nodal Contact Person', 'Rule 4(5)'],
  [TERMS, 'Indemnification', 'Grid is not a party to the member-to-member sale'],
  [TERMS, 'Galvam', 'Rule 4(3)'],
]

/** Processors named in the text that the product no longer uses. */
const FORBIDDEN = [
  [PRIVACY, 'Razorpay', 'dropped from the product; billing is Apple and Google'],
  [TERMS, 'Razorpay', 'dropped from the product; billing is Apple and Google'],
  [PRIVACY, 'Branch.io', 'replaced by first-party share links'],
]

const sources = new Map()
const read = (file) => {
  if (!sources.has(file)) sources.set(file, readFileSync(file, 'utf8'))
  return sources.get(file)
}

const failures = []
for (const [file, needle, why] of REQUIRED) {
  if (!read(file).includes(needle)) failures.push(`${file}: missing "${needle}" — ${why}`)
}
for (const [file, needle, why] of FORBIDDEN) {
  if (read(file).includes(needle)) failures.push(`${file}: still names "${needle}" — ${why}`)
}

if (failures.length > 0) {
  console.error(`\n✗ Published legal text failed ${failures.length} check(s):\n`)
  for (const failure of failures) console.error(`  - ${failure}`)
  console.error('')
  process.exit(1)
}

console.log(`✓ Published legal text: ${REQUIRED.length} required disclosures present, ${FORBIDDEN.length} retired processors absent`)
