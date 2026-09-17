import { useState } from 'react'

import { AdLineItems } from './AdLineItems'
import { Advertisers } from './Advertisers'
import { Creatives } from './Creatives'

/**
 * The advertising platform, behind one top-level tab.
 *
 * Three screens rather than three tabs, because the top nav already carries
 * ten entries and these are one job: an advertiser buys an order, artwork gets
 * reviewed, an ad runs. Splitting them across the main nav would put two
 * screens somebody opens weekly beside eight they open daily.
 *
 * `Ads` is first and the default, because it is the one with an answer to
 * "what is running right now".
 */

type Section = 'ads' | 'advertisers' | 'creatives'

const SECTIONS: ReadonlyArray<{ id: Section; label: string }> = [
  { id: 'ads', label: 'Ads' },
  { id: 'advertisers', label: 'Advertisers' },
  { id: 'creatives', label: 'Creatives' },
]

export function Ads({ initialSection = 'ads' }: { initialSection?: Section }) {
  const [section, setSection] = useState<Section>(initialSection)

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap gap-1 border-b border-[var(--color-border)]" aria-label="Advertising sections">
        {SECTIONS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setSection(entry.id)}
            aria-current={section === entry.id ? 'page' : undefined}
            className={
              section === entry.id
                ? 'border-b-2 border-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-[var(--color-text)]'
                : 'border-b-2 border-transparent px-3 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }
          >
            {entry.label}
          </button>
        ))}
      </nav>

      {section === 'ads' ? <AdLineItems /> : null}
      {section === 'advertisers' ? <Advertisers /> : null}
      {/*
        Landing on the review queue rather than on everything, because that is
        the only part of this screen that is time-sensitive: an unreviewed
        creative is a campaign that is not running and nobody has noticed.
      */}
      {section === 'creatives' ? <Creatives initialReviewStatus="PENDING" /> : null}
    </div>
  )
}
