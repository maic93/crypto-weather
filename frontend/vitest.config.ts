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
        'src/app/layout.tsx',
        'src/app/providers.tsx',
        'src/app/page.tsx',
        'src/hooks/**',
        'src/lib/api.ts',
        // Server-side files - Next.js API routes and server libs
        'src/app/api/**',
        'src/lib/coingecko-server.ts',
        'src/lib/forecast-engine.ts',
      ],
      thresholds: { lines: 70 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
