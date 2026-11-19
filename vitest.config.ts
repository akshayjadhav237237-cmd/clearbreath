import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    testTimeout: 30000,
    hookTimeout: 30000,
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
      include: ['src/**'],
      exclude: ['src/main.tsx', '**/*.test.{ts,tsx}', '**/*.d.ts'],
    },
  },
});
