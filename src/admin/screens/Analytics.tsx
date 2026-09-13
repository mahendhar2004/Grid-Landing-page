import { useState } from 'react'

import { apiGet } from '../lib/api'
import { useAsyncData } from '../lib/useAsyncData'
import { Button, EmptyNote, ErrorNote, Panel } from '../components/ui'

/**
 * The four dashboards: growth, marketplace, money, trust.
 *
 * **No chart library.** A sparkline is a `<polyline>` and a bar is a `<div>`
 * with a width, and the smallest charting package that could draw these is
 * larger than this entire bundle. That is not a micro-optimisation - the
 * console is loaded over whatever connection an admin happens to have when a
 * report needs handling, and nothing here is worth a 200 KB download.
 *
 * **The date range is a first-class control, not a filter.** The API refuses
 * a request without one, so it is the first thing on the screen rather than
 * something tucked into a menu. The presets exist because "last 30 days" is
 * what someone actually wants nine times out of ten.
 *
 * Every number is a count of something that happened in the window, except
 * the ones explicitly labelled as current totals - mixing "signups this
 * month" with "users in total" without saying which is which is how a
 * dashboard starts lying.
 */

type Dashboard = 'growth' | 'marketplace' | 'money' | 'trust'

const DASHBOARDS: ReadonlyArray<{ id: Dashboard; label: string }> = [
  { id: 'growth', label: 'Growth' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'money', label: 'Money' },
  { id: 'trust', label: 'Trust' },
]

const PRESETS: ReadonlyArray<{ days: number; label: string }> = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
  { days: 365, label: '1 year' },
]

interface TimePoint {
  bucket: string
  count: number
}

interface NamedCount {
  label: string
  count: number
}

interface NamedAmount {
  label: string
  amountPaise: number
}

interface Envelope<T> {
  range: { from: string; to: string; bucket: 'day' | 'week' }
  cached: boolean
  data: T
}

interface Growth {
  signups: TimePoint[]
  activeUsers: number
  totalUsers: number
  totalOrganizations: number
  totalHubs: number
  activeHubs: number
  signupsByOrganization: NamedCount[]
}

interface Marketplace {
  listingsPosted: TimePoint[]
  listingsSold: TimePoint[]
  requestsPosted: TimePoint[]
  requestsFulfilled: TimePoint[]
  medianHoursToSale: number | null
  listingsByCategory: NamedCount[]
  listingsByHub: NamedCount[]
}

interface Money {
  topUpPaise: number
  spendByType: NamedAmount[]
  spendTotalPaise: number
  revenueByHub: NamedAmount[]
  activeSubscriptions: NamedCount[]
  creditsGrantedPaise: number
}

interface Trust {
  reportsFiled: TimePoint[]
  reportsByCategory: NamedCount[]
  openReports: number
  reportsPerThousandListings: number | null
  bansIssued: number
  bansByLevel: NamedCount[]
  moderationFlagsRaised: number
  moderationFlagsReviewed: number
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function rupees(paise: number): string {
  // `en-IN` for lakh/crore grouping - an admin reading Indian revenue should
  // see 1,00,000 rather than 100,000.
  return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

/** One number and what it means. The unit of every dashboard here. */
function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Panel className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-black text-[var(--color-text)]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p> : null}
    </Panel>
  )
}

/**
 * A filled sparkline. Drawn in a 100x30 viewBox and stretched, so it stays
 * sharp at any width without measuring the container.
 *
 * A flat line at zero is a real answer and is drawn as one - an empty chart
 * would read as "failed to load", which is a different thing entirely.
 */
function Sparkline({ points, label }: { points: TimePoint[]; label: string }) {
  const total = points.reduce((sum, point) => sum + point.count, 0)
  const max = Math.max(1, ...points.map((point) => point.count))

  // One point cannot describe a line; two identical coordinates draw nothing.
  const coords =
    points.length > 1
      ? points.map((point, index) => {
          const x = (index / (points.length - 1)) * 100
          const y = 30 - (point.count / max) * 28
          return `${x.toFixed(2)},${y.toFixed(2)}`
        })
      : ['0,29', '100,29']

  return (
    <Panel className="p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{label}</p>
        <p className="text-lg font-black text-[var(--color-text)]">{total.toLocaleString('en-IN')}</p>
      </div>
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-2 h-16 w-full" aria-hidden="true">
        <polyline
          points={`0,30 ${coords.join(' ')} 100,30`}
          fill="var(--color-primary)"
          fillOpacity="0.12"
          stroke="none"
        />
        <polyline
          points={coords.join(' ')}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        Peak {max.toLocaleString('en-IN')} · {points.length} points
      </p>
    </Panel>
  )
}

/** A breakdown, largest first, each bar relative to the largest. */
function BarList({
  title,
  rows,
  format,
}: {
  title: string
  rows: ReadonlyArray<{ label: string; value: number }>
  format?: (value: number) => string
}) {
  const max = Math.max(1, ...rows.map((row) => row.value))
  const show = format ?? ((value: number) => value.toLocaleString('en-IN'))

  return (
    <Panel className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">Nothing in this window.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm text-[var(--color-text)]">{row.label}</span>
                <span className="shrink-0 text-sm font-semibold text-[var(--color-text)]">{show(row.value)}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)]"
                  style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

function GrowthView({ data }: { data: Growth }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active users" value={data.activeUsers.toLocaleString('en-IN')} hint="Posted a listing or request in this window" />
        <Stat label="Total users" value={data.totalUsers.toLocaleString('en-IN')} hint="All time, excluding deleted" />
        <Stat label="Organizations" value={data.totalOrganizations.toLocaleString('en-IN')} hint="All time" />
        <Stat label="Hubs" value={`${data.activeHubs} / ${data.totalHubs}`} hint="On the map / total" />
      </div>
      <Sparkline points={data.signups} label="Signups" />
      <BarList
        title="Signups by organization"
        rows={data.signupsByOrganization.map((row) => ({ label: row.label, value: row.count }))}
      />
    </div>
  )
}

function MarketplaceView({ data }: { data: Marketplace }) {
  const posted = data.listingsPosted.reduce((sum, point) => sum + point.count, 0)
  const sold = data.listingsSold.reduce((sum, point) => sum + point.count, 0)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat
          label="Sell-through"
          // Of what was posted in this window, against what sold in it - close
          // enough to be useful, and labelled so nobody reads it as a cohort
          // rate. A true cohort rate needs the sales of things posted in the
          // window, which is a different and much more expensive query.
          value={posted === 0 ? '—' : `${Math.round((sold / posted) * 100)}%`}
          hint={`${sold.toLocaleString('en-IN')} sold / ${posted.toLocaleString('en-IN')} posted, both within the window`}
        />
        <Stat
          label="Median time to sale"
          value={
            data.medianHoursToSale === null
              ? '—'
              : data.medianHoursToSale < 48
                ? `${Math.round(data.medianHoursToSale)}h`
                : `${Math.round(data.medianHoursToSale / 24)}d`
          }
          hint={data.medianHoursToSale === null ? 'Nothing sold in this window' : 'Half sell faster than this'}
        />
        <Stat
          label="Requests fulfilled"
          value={data.requestsFulfilled.reduce((sum, point) => sum + point.count, 0).toLocaleString('en-IN')}
          hint={`${data.requestsPosted.reduce((sum, point) => sum + point.count, 0).toLocaleString('en-IN')} posted`}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Sparkline points={data.listingsPosted} label="Listings posted" />
        <Sparkline points={data.listingsSold} label="Listings sold" />
        <Sparkline points={data.requestsPosted} label="Requests posted" />
        <Sparkline points={data.requestsFulfilled} label="Requests fulfilled" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <BarList
          title="Listings by category"
          rows={data.listingsByCategory.map((row) => ({ label: row.label, value: row.count }))}
        />
        <BarList
          title="Listings by hub"
          rows={data.listingsByHub.map((row) => ({ label: row.label, value: row.count }))}
        />
      </div>
    </div>
  )
}

function MoneyView({ data }: { data: Money }) {
  const subscribers = data.activeSubscriptions.reduce((sum, row) => sum + row.count, 0)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Top-ups" value={rupees(data.topUpPaise)} hint="Money into wallets in this window" />
        <Stat label="Spent" value={rupees(data.spendTotalPaise)} hint="Fees, boosts and reach, in this window" />
        <Stat
          label="Credits given away"
          value={rupees(data.creditsGrantedPaise)}
          hint="Signup, referral and streak grants - a real cost"
        />
        <Stat label="Subscribers" value={subscribers.toLocaleString('en-IN')} hint="Active right now, not in the window" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <BarList
          title="Spend by type"
          rows={data.spendByType.map((row) => ({ label: row.label, value: row.amountPaise }))}
          format={rupees}
        />
        <BarList
          title="Revenue by hub"
          rows={data.revenueByHub.map((row) => ({ label: row.label, value: row.amountPaise }))}
          format={rupees}
        />
      </div>
      <BarList
        title="Active subscriptions by tier"
        rows={data.activeSubscriptions.map((row) => ({ label: row.label, value: row.count }))}
      />
    </div>
  )
}

function TrustView({ data }: { data: Trust }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Reports per 1,000 listings"
          value={data.reportsPerThousandListings === null ? '—' : data.reportsPerThousandListings.toFixed(1)}
          hint={data.reportsPerThousandListings === null ? 'No listings posted in this window' : 'The number that scales with the product'}
        />
        <Stat label="Open reports" value={data.openReports.toLocaleString('en-IN')} hint="Waiting right now, not in the window" />
        <Stat label="Bans issued" value={data.bansIssued.toLocaleString('en-IN')} hint="In this window" />
        <Stat
          label="Scanner flags"
          value={`${data.moderationFlagsReviewed} / ${data.moderationFlagsRaised}`}
          hint="Reviewed / raised in this window"
        />
      </div>
      <Sparkline points={data.reportsFiled} label="Reports filed" />
      <div className="grid gap-4 lg:grid-cols-2">
        <BarList
          title="Reports by category"
          rows={data.reportsByCategory.map((row) => ({ label: row.label, value: row.count }))}
        />
        <BarList
          title="Bans by level"
          rows={data.bansByLevel.map((row) => ({ label: `Level ${row.label}`, value: row.count }))}
        />
      </div>
    </div>
  )
}

export function Analytics() {
  const [dashboard, setDashboard] = useState<Dashboard>('growth')
  const [from, setFrom] = useState(() => daysAgo(30))
  const [to, setTo] = useState(today)

  const { data, error, reload } = useAsyncData(
    () =>
      apiGet<Envelope<Growth | Marketplace | Money | Trust>>('/v1/admin/analytics', {
        dashboard,
        // The API takes instants. A date input gives a day, and the end of a
        // day is the start of the next - sending `to` bare would silently
        // exclude everything that happened on the day the admin picked.
        from: new Date(`${from}T00:00:00.000Z`).toISOString(),
        to: new Date(`${to}T00:00:00.000Z`).toISOString(),
      }),
    [dashboard, from, to],
  )

  function applyPreset(days: number) {
    setFrom(daysAgo(days))
    setTo(today())
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-[var(--color-text)]">Analytics</h1>
        <div className="flex flex-wrap gap-1">
          {DASHBOARDS.map((entry) => (
            <Button
              key={entry.id}
              variant={dashboard === entry.id ? 'primary' : 'default'}
              onClick={() => setDashboard(entry.id)}
            >
              {entry.label}
            </Button>
          ))}
        </div>
      </div>

      <Panel className="flex flex-wrap items-end gap-3 p-4">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            From
          </span>
          <input
            type="date"
            value={from}
            max={to}
            onChange={(event) => setFrom(event.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--bg-page)] px-3 py-2 text-sm text-[var(--color-text)]"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            To
          </span>
          <input
            type="date"
            value={to}
            min={from}
            onChange={(event) => setTo(event.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--bg-page)] px-3 py-2 text-sm text-[var(--color-text)]"
          />
        </label>
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((preset) => (
            <Button key={preset.days} onClick={() => applyPreset(preset.days)}>
              {preset.label}
            </Button>
          ))}
        </div>
        {/* Results are cached for five minutes server-side. Without a way to
            bypass that, an admin who just banned someone and wants to see the
            count move has no option but to wait and wonder. */}
        <Button onClick={() => void reload()}>Refresh</Button>
        {data?.cached ? (
          <span className="text-xs text-[var(--color-text-muted)]">Cached · up to 5 minutes old</span>
        ) : null}
      </Panel>

      <ErrorNote error={error} />

      {data === null ? (
        <Panel>
          <EmptyNote>Loading…</EmptyNote>
        </Panel>
      ) : dashboard === 'growth' ? (
        <GrowthView data={data.data as Growth} />
      ) : dashboard === 'marketplace' ? (
        <MarketplaceView data={data.data as Marketplace} />
      ) : dashboard === 'money' ? (
        <MoneyView data={data.data as Money} />
      ) : (
        <TrustView data={data.data as Trust} />
      )}
    </div>
  )
}
