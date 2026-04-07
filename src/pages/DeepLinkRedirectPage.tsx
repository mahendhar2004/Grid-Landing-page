import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.galvam.grid'

function buildAndroidIntentUrl(appPath: string): string {
  // Android Intent URL: tries to open the app, falls back to Play Store automatically
  const fallback = encodeURIComponent(PLAY_STORE_URL)
  return `intent://${appPath}#Intent;scheme=grid;package=com.galvam.grid;S.browser_fallback_url=${fallback};end`
}

function isMobile(): boolean {
  const ua = navigator.userAgent.toLowerCase()
  return /android|iphone|ipad|ipod/.test(ua)
}

function isAndroid(): boolean {
  return /android/i.test(navigator.userAgent)
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

// Shown on mobile while the OS processes the intent redirect
function MobileRedirectView() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-7xl mb-6">📱</div>
        <h2 className="text-2xl font-bold mb-3">Opening Grid...</h2>
        <p className="text-gray-500 mb-6">
          If the app doesn't open,{' '}
          <a href={PLAY_STORE_URL} className="text-violet-600 underline font-medium">
            download it from the Play Store
          </a>
          .
        </p>
      </div>
    </div>
  )
}

// Shown on desktop/laptop — don't auto-redirect, just show a clear CTA
function DesktopView() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">📱</div>
        <h2 className="text-2xl font-bold mb-3">Grid is a mobile app</h2>
        <p className="text-gray-500 mb-8">
          This link is meant to be opened on your phone. Open it on your Android device, or download the app from the Play Store.
        </p>
        <a
          href={PLAY_STORE_URL}
          className="inline-block bg-violet-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-violet-700 transition-colors"
        >
          Download on Play Store
        </a>
      </div>
    </div>
  )
}

export default function DeepLinkRedirectPage() {
  const location = useLocation()
  const [mobile] = useState(() => isMobile())

  useEffect(() => {
    if (!mobile) return // Desktop: show static page, no redirect

    const appPath = (location.pathname.slice(1) + location.search).trim()

    if (isAndroid()) {
      // Android Intent URL: opens app if installed, goes to Play Store if not
      window.location.href = buildAndroidIntentUrl(appPath)
    } else if (isIOS()) {
      // Try custom scheme; fall back to Play Store if app not installed
      const timer = setTimeout(() => {
        window.location.href = PLAY_STORE_URL
      }, 1500)
      window.location.href = `grid://${appPath}`
      return () => clearTimeout(timer)
    }
  }, [location.pathname, location.search, mobile])

  if (!mobile) return <DesktopView />
  return <MobileRedirectView />
}
