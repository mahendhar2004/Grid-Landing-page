import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold text-primary/20 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-secondary mb-4">Page Not Found</h2>
        <p className="text-text-muted text-lg mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors"
        >
          <Home size={18} />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
