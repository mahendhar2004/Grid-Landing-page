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
export default function middleware(request: NextRequest) {
  const secret = process.env['ADMIN_PATH_SEGMENT']
  const { pathname } = request.nextUrl

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
