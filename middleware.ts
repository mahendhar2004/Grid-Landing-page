import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export const config = {
  /**
   * Every path except the build output and the well-known files. The console
   * lives behind an arbitrary secret segment, so there is no narrower matcher
   * that could be written here without naming the secret in the repo.
   */
  matcher: ['/((?!assets|favicon|icon|\\.well-known).*)'],
}

/**
 * Serves the admin console, and only to someone who already knows where it is.
 *
 * **Why this is middleware and not a `vercel.json` rewrite.** A rewrite can
 * only match a literal path or a path *parameter*. A literal would mean
 * committing the secret to the repository; a parameter like `/:secret/admin`
 * matches any segment at all, so `example.com/anything/admin` would serve the
 * console and the secret would be worth nothing. Middleware is the only place
 * the real value can be compared without being written down in git or shipped
 * in a bundle.
 *
 * The secret lives in `ADMIN_PATH_SEGMENT`, a Vercel environment variable. It
 * is never imported by client code, never prefixed `VITE_`, and therefore
 * never reaches the browser. Combined with the console being a separate Vite
 * entry, a visitor who downloads the entire public site finds no admin route,
 * no admin component and no path.
 *
 * **This is still not authentication, and nothing downstream treats it as
 * such.** A path leaks - through history, a bookmark, a shared screen, an
 * access log. Someone who learns it reaches a sign-in screen and then gets 403
 * from `requireAdmin` on every request behind it, exactly as they would at
 * `/admin`. This layer buys quiet, not safety.
 */
/**
 * Escapes text before it is interpolated into the HTML below. The title and
 * description come from the API, which means they originate as a listing
 * title someone typed - so this is the boundary where user input becomes
 * markup, and the one place an injected `</title><script>` would land.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

interface SharePreview {
  revealed: boolean
  title: string
  description: string
  imageUrl: string | null
}

/**
 * Renders a share link's landing page.
 *
 * **Server-rendered, and it has to be.** Every crawler that matters - the one
 * behind a WhatsApp paste, Twitter, Slack, iMessage - fetches the URL and
 * reads the HTML. None of them executes JavaScript. A React route rendering
 * these tags client-side would be invisible to all of them, and the preview
 * is the entire reason this path exists.
 *
 * A person who opens the link gets the same HTML, plus a redirect: the app's
 * own scheme first, then the store if nothing handles it. Attempting the
 * scheme is deliberately silent - a device without Grid installed simply does
 * nothing, which is why the store fallback is on a timer rather than an error
 * handler.
 */
function sharePage(preview: SharePreview, canonicalUrl: string, appPath: string): string {
  const title = escapeHtml(preview.title)
  const description = escapeHtml(preview.description)
  // Falls back to the site icon, which is what index.html already uses for
  // og:image - not an invented filename that would 404 and leave the card
  // blank in every chat app.
  const image = preview.imageUrl ? escapeHtml(preview.imageUrl) : `${SITE_ORIGIN}/icon.png`

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · Grid</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${escapeHtml(canonicalUrl)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Grid">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${escapeHtml(canonicalUrl)}">
<meta property="og:image" content="${image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">
<style>
  body{margin:0;font:16px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
       background:#0b0b0f;color:#f4f4f5;display:grid;place-items:center;min-height:100vh;padding:24px}
  main{max-width:420px;text-align:center}
  h1{font-size:22px;margin:0 0 8px}
  p{color:#a1a1aa;margin:0 0 24px}
  a{display:inline-block;background:#6366f1;color:#fff;text-decoration:none;
    padding:12px 24px;border-radius:10px;font-weight:600}
</style>
</head>
<body>
<main>
  <h1>${title}</h1>
  <p>${description}</p>
  <a href="${escapeHtml(STORE_URL)}">Get Grid</a>
</main>
<script>
  // Try the installed app first. Nothing happens if it is not installed,
  // which is why the store fallback is on a timer - there is no event for
  // "no handler for this scheme".
  var opened = Date.now();
  window.location.href = ${JSON.stringify(`grid://${appPath}`)};
  setTimeout(function () {
    // Still here, and the tab was never backgrounded, so the scheme went
    // unhandled. A device that did switch to the app reports a gap far
    // larger than the timer.
    if (Date.now() - opened < 2000 && !document.hidden) {
      window.location.href = ${JSON.stringify(STORE_URL)};
    }
  }, 1200);
</script>
</body>
</html>`
}

/** Where a visitor without the app is sent. Play only for now; add the App Store link at iOS launch. */
const STORE_URL = 'https://play.google.com/store/apps/details?id=com.galvam.grid'
const SITE_ORIGIN = 'https://gridmarketplace.in'

/** The three segments `packages/constants/src/share.ts` defines. Kept literal so an unknown segment 404s rather than reaching the API. */
const SHARE_SEGMENTS = new Set(['listing', 'request', 'u'])

async function handleShareLink(request: NextRequest, segment: string, id: string) {
  const apiBase = process.env['SHARE_PREVIEW_API_URL'] ?? process.env['VITE_API_URL']
  const canonicalUrl = `${SITE_ORIGIN}/l/${segment}/${id}`
  const appPath = `l/${segment}/${id}`

  /**
   * A generic card, used when the API cannot be reached or is not configured.
   * The link still previews as Grid and still opens the app - degrading to a
   * blank page because an upstream call failed would be worse than showing
   * less.
   */
  const fallback: SharePreview = {
    revealed: false,
    title: 'Grid',
    description: 'Buy and sell within your campus or company.',
    imageUrl: null,
  }

  let preview = fallback
  if (apiBase) {
    try {
      const response = await fetch(`${apiBase}/v1/public/share/${segment}/${id}`, {
        headers: { accept: 'application/json' },
        // A crawler will not wait. Better a generic card quickly than a
        // correct one too late to be rendered.
        signal: AbortSignal.timeout(2500),
      })
      if (response.status === 404) {
        return new NextResponse('Not found', { status: 404 })
      }
      if (response.ok) {
        const json = (await response.json()) as { data?: SharePreview }
        if (json.data) preview = json.data
      }
    } catch {
      // Deliberately swallowed: every failure mode here - timeout, DNS, a
      // 500 - has the same correct answer, which is the generic card above.
    }
  }

  return new NextResponse(sharePage(preview, canonicalUrl, appPath), {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // Long enough that a link pasted into a busy group chat is not fetched
      // from the API once per member.
      'cache-control': 'public, max-age=300',
    },
  })
}

export default async function middleware(request: NextRequest) {
  const secret = process.env['ADMIN_PATH_SEGMENT']
  const { pathname } = request.nextUrl

  // Share links, checked before the admin path: `/l/...` is a fixed, public
  // prefix and can never collide with a secret segment.
  const share = /^\/l\/([^/]+)\/([^/]+)\/?$/.exec(pathname)
  if (share) {
    const [, segment, id] = share
    if (!SHARE_SEGMENTS.has(segment!)) {
      return new NextResponse('Not found', { status: 404 })
    }
    return handleShareLink(request, segment!, decodeURIComponent(id!))
  }

  const isAdminShaped = pathname.endsWith('/admin') || pathname.includes('/admin/')
  if (!isAdminShaped) {
    return NextResponse.next()
  }

  /**
   * Unconfigured means unreachable, not open. A deploy that forgot the
   * variable must not fall back to serving the console from every
   * admin-shaped path - failing closed is the only safe direction here.
   */
  if (!secret) {
    return new NextResponse('Not found', { status: 404 })
  }

  const expected = `/${secret}/admin`
  if (pathname === expected || pathname.startsWith(`${expected}/`)) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin.html'
    return NextResponse.rewrite(url)
  }

  /**
   * Admin-shaped but wrong secret. A 404 rather than a 403: a 403 would
   * confirm that something exists at this shape, which is precisely the
   * information the secret is meant to withhold.
   */
  return new NextResponse('Not found', { status: 404 })
}
