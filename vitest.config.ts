import { defineConfig } from 'vitest/config'

/**
 * `jsdom` only for the files that render, which is a small minority of them.
 *
 * The API and helper tests are pure functions and run an order of magnitude
 * faster in `node`; forcing a DOM on the whole suite to serve four component
 * tests would make the fast feedback loop slow for no gain.
 */
export default defineConfig({
  test: {
    environmentMatchGlobs: [
      ['src/admin/components/**', 'jsdom'],
      ['src/admin/screens/**', 'jsdom'],
      // Hooks need a renderer, which needs a DOM.
      ['src/admin/lib/*Action*', 'jsdom'],
      ['src/admin/lib/*Paged*', 'jsdom'],
    ],
    environment: 'node',
  },
})
