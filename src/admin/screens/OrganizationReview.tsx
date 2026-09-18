import { useState } from 'react'

import { api } from '../api/endpoints'
import type { AdminOrganization, AdminPlace, PendingReview } from '../api/types'
import type { ApiError } from '../lib/api'
import { useAsyncData } from '../lib/useAsyncData'
import { Badge, Button, EmptyNote, ErrorNote, Panel, ReasonPrompt } from '../components/ui'

/**
 * Domains waiting for somebody to say whether they belong where they claim
 * (docs/grid-v2/BRD.md BR-064).
 *
 * **Nothing here is blocked.** Every member behind every row in this queue has
 * already verified an address, joined, and started posting and messaging. That
 * is deliberate: the realistic failure is somebody picking the wrong name out
 * of a list, not an intruder, and withholding the product from every honest
 * member to guard against a rare dishonest one is the worse trade.
 *
 * So there are two answers, not three. **Confirm** lets it stand. **Correct**
 * moves the domain and everyone who came in through it to the right
 * organisation. There is no reject, because a verified address proves the
 * member belongs to *some* organisation — refusing them would leave a real
 * person with a real address nowhere to be.
 *
 * Each row shows the organisation being claimed **with its other domains and
 * its size**, because "is this domain this organisation?" is not answerable on
 * its own. "Is amazon.in Amazon, which already holds amazon.com and has 412
 * members?" is. It deliberately shows no member addresses: the question is
 * about a domain, which nobody's individual address helps answer.
 */

const PAGE_SIZE = 25

type Decision =
  | { kind: 'confirm'; review: PendingReview }
  | {
      kind: 'correct'
      review: PendingReview
      target: AdminOrganization
      /**
       * The target's places, and which one was chosen (Grid BR-076).
       *
       * Prefilled with the oldest — the place the organisation grew from, and
       * the likeliest answer — but never sent unasked when there is more than
       * one: this moves every member of the domain, and an organisation with
       * a Delhi and a Sonipat campus has two very different right answers.
       */
      places: AdminPlace[]
      targetHubId: string
    }

export function OrganizationReview() {
  const { data, error, reload } = useAsyncData<PendingReview[]>(() => api.organizations.review.list(PAGE_SIZE), [])
  const [decision, setDecision] = useState<Decision | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<ApiError | null>(null)
  const [outcome, setOutcome] = useState<string | null>(null)

  async function submit(reason: string) {
    if (!decision) return
    setBusy(true)
    setActionError(null)
    try {
      if (decision.kind === 'confirm') {
        await api.organizations.review.confirm(decision.review.domain, reason)
        setOutcome(`${decision.review.domain} confirmed.`)
      } else {
        const moved = await api.organizations.review.correct(
          decision.review.domain,
          decision.target.id,
          decision.targetHubId,
          reason,
        )
        // An admin who has just moved forty people should be told they moved
        // forty people, not left to infer it from the row disappearing.
        setOutcome(
          `${decision.review.domain} moved to ${decision.target.name} — ` +
            `${moved.membersMoved} member${moved.membersMoved === 1 ? '' : 's'}, ` +
            `${moved.listingsMoved} listing${moved.listingsMoved === 1 ? '' : 's'}, ` +
            `${moved.requestsMoved} request${moved.requestsMoved === 1 ? '' : 's'}.`,
        )
      }
      setDecision(null)
      await reload()
    } catch (caught) {
      setActionError(caught as ApiError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <Panel className="p-4">
        <h2 className="text-base font-bold text-[var(--color-text)]">Domains awaiting review</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Nobody here is waiting on you to get in — they are already in. This is where a wrong pick
          gets corrected.
        </p>
      </Panel>

      <ErrorNote error={error} />
      <ErrorNote error={actionError} />
      {outcome ? (
        <Panel className="p-3 text-sm text-[var(--color-text)]">{outcome}</Panel>
      ) : null}

      {data && data.length === 0 ? <EmptyNote>Nothing to review.</EmptyNote> : null}

      {(data ?? []).map((review) => (
        <Panel key={review.domain} className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-[var(--color-text)]">
              {review.domain}
            </span>
            <Badge tone={review.verifiedVia === 'DIRECTORY' ? 'warn' : 'neutral'}>
              {review.verifiedVia === 'DIRECTORY' ? 'Member picked it' : 'New organisation'}
            </Badge>
            <span className="text-xs text-[var(--color-text-muted)]">
              {review.membersThroughDomain === 1
                ? '1 member joined through it'
                : `${review.membersThroughDomain} members joined through it`}
            </span>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] p-3">
            <div className="text-sm font-semibold text-[var(--color-text)]">
              {review.organization.name}
              {review.organization.shortName ? (
                <span className="ml-2 text-xs font-normal text-[var(--color-text-muted)]">
                  {review.organization.shortName}
                </span>
              ) : null}
            </div>
            <div className="mt-1 text-xs text-[var(--color-text-muted)]">
              {review.organization.memberCount === 1
                ? '1 member'
                : `${review.organization.memberCount} members`}
              {' · '}
              {review.organization.otherDomains.length > 0
                ? `also reached by ${review.organization.otherDomains.join(', ')}`
                : 'no other domains'}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => setDecision({ kind: 'confirm', review })}>
              It belongs here
            </Button>
            <CorrectPicker
              review={review}
              onPick={(target, places) =>
                setDecision({
                  kind: 'correct',
                  review,
                  target,
                  places,
                  // The oldest, which is the place the organisation grew from.
                  targetHubId: places[0]?.id ?? '',
                })
              }
            />
          </div>
        </Panel>
      ))}

      {decision ? (
        <ReasonPrompt
          title={
            decision.kind === 'confirm'
              ? `Confirm ${decision.review.domain}`
              : `Move ${decision.review.domain} to ${decision.target.name}`
          }
          confirmLabel={decision.kind === 'confirm' ? 'Confirm' : 'Move it'}
          variant="primary"
          busy={busy}
          onCancel={() => setDecision(null)}
          onConfirm={(reason) => {
            void submit(reason)
          }}
        >
          {decision.kind === 'correct' ? (
            <>
              <p className="mb-3 text-sm text-[var(--color-text-muted)]">
                {decision.review.membersThroughDomain === 1 ? 'The member' : 'The members'} who
                joined through this domain move too, along with whatever they still have listed.
                Anything they already sold or fulfilled stays where it happened.
              </p>
              {decision.places.length > 1 ? (
                <fieldset className="mb-3 space-y-1" data-testid="review-correct-places">
                  <legend className="mb-1 text-xs font-semibold text-[var(--color-text)]">
                    Which place?
                  </legend>
                  <p className="mb-2 text-xs text-[var(--color-text-muted)]">
                    {decision.target.name} occupies {decision.places.length} places, and nothing
                    about the domain says which one these members are at.
                  </p>
                  {decision.places.map((place) => (
                    <label key={place.id} className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                      <input
                        type="radio"
                        name="correct-place"
                        value={place.id}
                        checked={decision.targetHubId === place.id}
                        onChange={() => setDecision({ ...decision, targetHubId: place.id })}
                      />
                      <span>
                        {place.name}
                        <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                          {place.memberCount} member{place.memberCount === 1 ? '' : 's'}
                        </span>
                      </span>
                    </label>
                  ))}
                </fieldset>
              ) : null}
            </>
          ) : null}
        </ReasonPrompt>
      ) : null}
    </div>
  )
}

/**
 * Finding the organisation a domain should have gone to.
 *
 * A search rather than a dropdown, for the same reason the app's own picker is
 * one: the list this is chosen from is every organisation on Grid, and a
 * select element with all of them is not a control anybody can use.
 */
function CorrectPicker({
  review,
  onPick,
}: {
  review: PendingReview
  onPick: (organization: AdminOrganization, places: AdminPlace[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<AdminOrganization[]>([])
  const [searching, setSearching] = useState(false)
  const [picking, setPicking] = useState<string | null>(null)

  /**
   * The places are fetched when an organisation is picked, not for every row of
   * the search results: most searches end in one pick, and asking for the
   * places of ten organisations to show one list would be nine wasted calls.
   */
  async function pick(organization: AdminOrganization) {
    setPicking(organization.id)
    try {
      onPick(organization, await api.organizations.places.list(organization.id))
    } finally {
      setPicking(null)
    }
  }

  async function search() {
    setSearching(true)
    try {
      const found = await api.organizations.list(term.trim() || undefined, 10, 0)
      // Never offer the organisation it is already attached to - "correcting"
      // it to where it already is is not a decision, and the server refuses it.
      setResults(found.filter((organization) => organization.id !== review.organization.id))
    } finally {
      setSearching(false)
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>It belongs somewhere else</Button>
    )
  }

  return (
    <div className="w-full space-y-2">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          void search()
        }}
      >
        <input
          data-testid={`review-correct-search-${review.domain}`}
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Find the right organisation"
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--bg-page)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
        <Button type="submit" disabled={searching}>
          {searching ? 'Searching…' : 'Search'}
        </Button>
      </form>
      {results.map((organization) => (
        <button
          key={organization.id}
          type="button"
          data-testid={`review-correct-option-${organization.id}`}
          disabled={picking !== null}
          onClick={() => void pick(organization)}
          className="block w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-left text-sm text-[var(--color-text)] hover:border-[var(--color-primary)]"
        >
          {organization.name}
          <span className="ml-2 text-xs text-[var(--color-text-muted)]">
            {organization.domain} · {organization.memberCount} members
          </span>
        </button>
      ))}
    </div>
  )
}
