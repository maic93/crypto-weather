// frontend/vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.ts',
    coverage: {
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.config.*',
        '**/next-env.d.ts',
        'src/types/**',
        // Next.js app shell files
        'src/app/layout.tsx',
        'src/app/providers.tsx',
        // All page-level files (Next.js pages are not unit-testable in jsdom)
        'src/app/**/page.tsx',
        // Server-side libs
        'src/app/api/**',
        'src/lib/coingecko-server.ts',
        'src/lib/forecast-engine.ts',
        'src/hooks/**',
        'src/lib/api.ts',
        // Layout components that need full app context
        'src/components/layout/AnimatedBackground.tsx',
        'src/components/layout/LoadingScreen.tsx',
        'src/components/layout/ErrorScreen.tsx',
      ],
      thresholds: { lines: 70 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
