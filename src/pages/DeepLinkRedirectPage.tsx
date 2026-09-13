import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.galvam.grid'

function buildAndroidIntentUrl(appPath: string): string {
  // Android Intent URL: tries to open the app, falls back to Play Store automatically
  const fallback = encodeURIComponent(PLAY_STORE_URL)
  return `intent://${appPath}#Intent;scheme=grid;package=com.galvam.grid;S.browser_fallback_url=${fallback};end`
}

function isMobile(): boolean {
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isAndroid(): boolean {
  return /android/i.test(navigator.userAgent)
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 transition-colors duration-500">
      <div className="text-center max-w-md">{children}</div>
    </div>
  )
}

function PlayStoreButton({ label }: { label: string }) {
  return (
    <a
      href={PLAY_STORE_URL}
      className="inline-block bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors"
    >
      {label}
    </a>
  )
}

// Shown on mobile while the OS processes the intent redirect
function MobileRedirectView() {
  return (
    <Shell>
      <div className="text-7xl mb-6">📱</div>
      <h2 className="text-2xl font-bold text-secondary mb-3 transition-colors">Opening Grid…</h2>
      <p className="text-text-muted mb-6 transition-colors">
        If the app doesn't open,{' '}
        <a href={PLAY_STORE_URL} className="text-primary underline font-medium">
          get it from the Play Store
        </a>
        .
      </p>
    </Shell>
  )
}

// iOS has no App Store build yet, so there is nowhere to send them.
function IOSFallbackView() {
  return (
    <Shell>
      <div className="text-7xl mb-6">📱</div>
      <h2 className="text-2xl font-bold text-secondary mb-3 transition-colors">Grid isn't on iPhone yet</h2>
      <p className="text-text-muted mb-8 transition-colors">
        If you already have Grid installed, this link should have opened it. The iOS app is on the way — Grid v2
        launches on iPhone and Android together.
      </p>
      <Link
        to="/"
        className="inline-block bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors"
      >
        See what's coming
      </Link>
    </Shell>
  )
}

// Shown on desktop/laptop — don't auto-redirect, just show a clear CTA
function DesktopView() {
  return (
    <Shell>
      <div className="text-7xl mb-6">📱</div>
      <h2 className="text-2xl font-bold text-secondary mb-3 transition-colors">Grid is a mobile app</h2>
      <p className="text-text-muted mb-8 transition-colors">
        This link is meant to be opened on your phone. Open it on your Android device, or get the app from the
        Play Store.
      </p>
      <PlayStoreButton label="Get it on Play Store" />
    </Shell>
  )
}

export default function DeepLinkRedirectPage() {
  const location = useLocation()
  const [mobile] = useState(() => isMobile())
  const [iosFallback, setIosFallback] = useState(false)

  useEffect(() => {
    if (!mobile) return // Desktop: show static page, no redirect

    const appPath = (location.pathname.slice(1) + location.search).trim()

    if (isAndroid()) {
      // Android Intent URL: opens app if installed, goes to Play Store if not
      window.location.href = buildAndroidIntentUrl(appPath)
    } else if (isIOS()) {
      // Try the custom scheme. There is no iOS build to fall back to, so show a
      // message rather than sending an iPhone user to the Google Play Store.
      const timer = setTimeout(() => setIosFallback(true), 1500)
      window.location.href = `grid://${appPath}`
      return () => clearTimeout(timer)
    }
  }, [location.pathname, location.search, mobile])

  if (!mobile) return <DesktopView />
  if (iosFallback) return <IOSFallbackView />
  return <MobileRedirectView />
}
