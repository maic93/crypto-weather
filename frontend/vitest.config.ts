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
        'src/hooks/**',   // TanStack Query hooks need integration test setup
        'src/lib/api.ts', // HTTP client — covered by backend integration tests
      ],
      thresholds: { lines: 70 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
