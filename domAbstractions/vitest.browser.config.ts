import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    include: [
        'tests/browser/**/*.{test,spec}.{ts,tsx}',
        'tests/**/*.browser.{test,spec}.ts',
    ],
    browser: {
      enabled: true,
      provider: playwright(),
      // https://vitest.dev/guide/browser/playwright
      instances: [
                {browser: 'firefox'}
      ],
    },
  },
})
