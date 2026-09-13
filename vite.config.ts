import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Two entry points, deliberately.
 *
 * `index.html` is the public marketing site. `admin.html` is the internal
 * console, served only from a secret path that `vercel.json` rewrites here.
 *
 * They are separate *entries*, not two routes in one app, and that is the
 * whole point. Rollup builds an independent chunk graph per entry, so nothing
 * imported only by the console can reach the public bundle. A visitor who
 * downloads everything the marketing site serves finds no admin route, no
 * admin component, and no trace of the path.
 *
 * A single-bundle SPA could not do this: a secret route would just be a string
 * in the JavaScript every visitor already has, findable in a minute by anyone
 * who opens the bundle. The secret is only worth anything because the code it
 * guards is not shipped alongside it.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
})
