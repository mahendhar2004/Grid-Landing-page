import { useEffect, useState } from 'react'

import { clearTokens, getAccessToken } from './lib/api'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Canvas, CommandPalette, Sidebar, UtilityBar } from './components/shell'
import { navigate, useRoute } from './lib/route'
import { NAV } from './nav'
import { ActionCentre } from './screens/ActionCentre'
import { Ads } from './screens/Ads'
import { Analytics } from './screens/Analytics'
import { AuditLog } from './screens/AuditLog'
import { Monetization } from './screens/Monetization'
import { OrganizationReview } from './screens/OrganizationReview'
import { Organizations } from './screens/Organizations'
import { Reports } from './screens/Reports'
import { SignIn } from './screens/SignIn'
import { Triage } from './screens/Triage'
import { Users } from './screens/Users'

/**
 * The console: sign-in, then a frame (sidebar, breadcrumb, search, theme)
 * around one screen at a time.
 *
 * Which screen is showing is the address (`#users?org=...`), read by
 * `useRoute`, so every view - filters included - can be bookmarked and shared,
 * and the back button works. The list of screens is `nav.ts`.
 */
export function AdminApp() {
  const [signedIn, setSignedIn] = useState(() => getAccessToken() !== null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { view } = useRoute()
  const known = NAV.some((entry) => entry.id === view)
  const tab = known ? view : 'home'

  useEffect(() => {
    function recheck() {
      setSignedIn(getAccessToken() !== null)
    }
    window.addEventListener('focus', recheck)
    return () => window.removeEventListener('focus', recheck)
  }, [])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((was) => !was)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!signedIn) {
    return <SignIn onSignedIn={() => setSignedIn(true)} />
  }

  return (
    <div className="min-h-screen bg-[var(--c-bg)]">
      <Sidebar
        current={tab}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSignOut={() => {
          clearTokens()
          setSignedIn(false)
        }}
      />
      <Canvas>
        <UtilityBar current={tab} onMenu={() => setMenuOpen(true)} onSearch={() => setPaletteOpen(true)} />
        {/*
          Every screen inside its own boundary, keyed by tab.

          A render error anywhere unmounts the whole React tree, so one bad
          number used to blank the entire console - and a white page cannot be
          told apart from a failed deploy, a dropped session, or the API being
          down. Per-screen, a crash costs that screen: the nav still works and
          the other six still load. The key also clears a tripped boundary on
          navigation, so a fixed screen recovers by switching tabs rather than
          by reloading.
        */}
        {/* Keyed by screen: a new screen arrives with one soft rise; changing a
            filter on the same screen does not replay it. */}
        <div key={tab} className="motion-page mx-auto max-w-[var(--page-max)]">
          <ErrorBoundary resetKey={tab} label={NAV.find((entry) => entry.id === tab)?.label ?? tab}>
            {tab === 'home' ? <ActionCentre onOpenTab={(next) => navigate(next)} /> : null}
            {tab === 'reports' ? <Reports /> : null}
            {tab === 'triage' ? <Triage /> : null}
            {tab === 'users' ? <Users /> : null}
            {tab === 'organizations' ? <Organizations /> : null}
            {tab === 'organization-review' ? <OrganizationReview /> : null}
            {tab === 'monetization' ? <Monetization /> : null}
            {tab === 'ads' ? <Ads /> : null}
            {tab === 'analytics' ? <Analytics /> : null}
            {tab === 'audit' ? <AuditLog /> : null}
          </ErrorBoundary>
        </div>
      </Canvas>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
