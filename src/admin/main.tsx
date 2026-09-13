import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AdminApp } from './AdminApp'
import '../index.css'

/**
 * The console's own entry point.
 *
 * Mounts `#admin-root`, not `#root`, so nothing here can ever be accidentally
 * loaded by the public site's `main.tsx` or vice versa. Sharing `index.css` is
 * deliberate and safe - it is the Tailwind import and the theme variables,
 * which Tailwind tree-shakes per entry anyway.
 */
const container = document.getElementById('admin-root')
if (!container) {
  throw new Error('admin-root is missing from admin.html')
}

createRoot(container).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
)
