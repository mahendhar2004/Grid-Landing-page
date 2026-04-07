import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.galvam.grid'

function buildAndroidIntentUrl(appPath: string): string {
  // Android Intent URL: tries to open the app, falls back to Play Store automatically
  const fallback = encodeURIComponent(PLAY_STORE_URL)
  return `intent://${appPath}#Intent;scheme=grid;package=com.galvam.grid;S.browser_fallback_url=${fallback};end`
}

export default function DeepLinkRedirectPage() {
  const location = useLocation()
  const [status, setStatus] = useState<'opening' | 'redirecting'>('opening')

  useEffect(() => {
    // Strip the leading slash to get the app path (e.g. "product/abc123?foo=bar")
    const appPath = (location.pathname.slice(1) + location.search).trim()

    const ua = navigator.userAgent.toLowerCase()
    const isAndroid = /android/.test(ua)
    const isIOS = /iphone|ipad|ipod/.test(ua)

    if (isAndroid) {
      // Android Intent URL handles installed/uninstalled automatically via browser_fallback_url.
      // No JS timer needed — Android takes over immediately.
      window.location.href = buildAndroidIntentUrl(appPath)
      setStatus('redirecting')
    } else if (isIOS) {
      // Try custom scheme; if app not installed iOS ignores it, so fall back to Play Store
      // after a short delay (replace PLAY_STORE_URL with App Store URL when available)
      const timer = setTimeout(() => {
        setStatus('redirecting')
        window.location.href = PLAY_STORE_URL
      }, 1500)
      window.location.href = `grid://${appPath}`
      return () => clearTimeout(timer)
    } else {
      // Desktop: redirect to Play Store after a brief pause
      const timer = setTimeout(() => {
        setStatus('redirecting')
        window.location.href = PLAY_STORE_URL
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [location.pathname, location.search])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-7xl mb-6">📱</div>
        <h2 className="text-2xl font-bold mb-3">Opening Grid...</h2>
        <p className="text-lg mb-2">
          {status === 'opening'
            ? 'Launching the Grid app for you.'
            : 'Taking you to the Play Store...'}
        </p>
        <p className="text-sm text-gray-500">
          If nothing happens,{' '}
          <a
            href={PLAY_STORE_URL}
            className="text-violet-600 underline font-medium"
          >
            download Grid from the Play Store
          </a>
          .
        </p>
      </div>
    </div>
  )
}
