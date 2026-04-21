import { Outlet, useSearchParams } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

/**
 * When the site is loaded inside the Grid mobile app's WebView (About / Privacy /
 * Terms / FAQs screens), the URL is appended with `?embed=1`. In that mode the
 * app already renders a native header, so we hide the website's own Navbar and
 * Footer to prevent a duplicate header pushing the content down.
 */
export default function Layout() {
  const [searchParams] = useSearchParams()
  const isEmbedded = searchParams.get('embed') === '1'

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500">
      {!isEmbedded && <Navbar />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isEmbedded && <Footer />}
    </div>
  )
}
