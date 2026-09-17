import { useEffect, useState } from 'react'

import { clearTokens, getAccessToken } from './lib/api'
import { ActionCentre } from './screens/ActionCentre'
import { Analytics } from './screens/Analytics'
import { AuditLog } from './screens/AuditLog'
import { Organizations } from './screens/Organizations'
import { Pricing } from './screens/Pricing'
import { Reports } from './screens/Reports'
import { SignIn } from './screens/SignIn'
import { Tiers } from './screens/Tiers'
import { Triage } from './screens/Triage'

/**
 * The console shell.
 *
 * No router. The whole tool is seven flat screens with no deep links worth
 * having, and adding `react-router` here would pull the public site's routing
 * dependency into a bundle that exists specifically to share nothing with it.
 * A `useState` is the honest shape for seven tabs.
 *
 * The secret path this is served from is handled entirely by `vercel.json` -
 * nothing in this bundle knows or needs to know what it is, which is what
 * keeps it out of the JavaScript.
 */

type Tab = 'home' | 'reports' | 'triage' | 'organizations' | 'pricing' | 'tiers' | 'analytics' | 'audit'

const TABS: ReadonlyArray<{ id: Tab; label: string }> = [
  // First, and the landing tab. The console had no answer to "what do I need
  // to do?" - you found out by opening seven tabs, which is fine daily and
  // useless the moment something is urgent.
  { id: 'home', label: 'What needs you' },
  { id: 'reports', label: 'Reports' },
  { id: 'triage', label: 'Inboxes' },
  { id: 'organizations', label: 'Organizations' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'tiers', label: 'Tiers' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'audit', label: 'Audit log' },
]

export function AdminApp() {
  const [signedIn, setSignedIn] = useState(() => getAccessToken() !== null)
  const [tab, setTab] = useState<Tab>('home')

  /**
   * A 401 anywhere clears the token (see `lib/api.ts`), but the shell has no
   * way to know that happened. This re-checks when the tab regains focus,
   * which is when someone returns to a console they left open long enough for
   * the token to expire - the alternative is a screen full of errors and no
   * explanation.
   */
  useEffect(() => {
    function recheck() {
      setSignedIn(getAccessToken() !== null)
    }
    window.addEventListener('focus', recheck)
    return () => window.removeEventListener('focus', recheck)
  }, [])

  if (!signedIn) {
    return <SignIn onSignedIn={() => setSignedIn(true)} />
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--bg-page)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
          <span className="mr-2 text-sm font-bold text-[var(--color-text)]">Grid Console</span>
          {TABS.map((entry) => (
            <button
              key={entry.id}
              onClick={() => setTab(entry.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                tab === entry.id
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-muted)] hover:bg-white/5'
              }`}
            >
              {entry.label}
            </button>
          ))}
          <button
            onClick={() => {
              clearTokens()
              setSignedIn(false)
            }}
            className="ml-auto rounded-lg px-3 py-1.5 text-sm font-semibold text-[var(--color-text-muted)] hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {tab === 'home' ? <ActionCentre onOpenTab={(next) => setTab(next as Tab)} /> : null}
        {tab === 'reports' ? <Reports /> : null}
        {tab === 'triage' ? <Triage /> : null}
        {tab === 'organizations' ? <Organizations /> : null}
        {tab === 'pricing' ? <Pricing /> : null}
        {tab === 'tiers' ? <Tiers /> : null}
        {tab === 'analytics' ? <Analytics /> : null}
        {tab === 'audit' ? <AuditLog /> : null}
      </main>
    </div>
  )
}
