import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globalSetup: ['./tests/global-setup.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/casa_fiorelli_test?schema=public',
      JWT_SECRET: 'test-secret-casa-fiorelli-1945',
      CORS_ORIGIN: 'http://localhost:5173',
    },
    hookTimeout: 120_000,
    testTimeout: 30_000,
    // Suites share one seeded database, so they must not run concurrently.
    fileParallelism: false,
  },
})
