import { execSync } from 'node:child_process'

const TEST_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/casa_fiorelli_test?schema=public'

/**
 * Prepares the dedicated test database once per run.
 * Migrations are applied with `migrate deploy` (never `db push --force-reset`,
 * which would be a destructive command) and the seed itself truncates the
 * tables before repopulating them, so each run starts from a known state.
 */
export default function setup() {
  const env = { ...process.env, DATABASE_URL: TEST_DATABASE_URL, NODE_ENV: 'test' }

  execSync('npx prisma migrate deploy', { env, stdio: 'ignore' })
  execSync('npx tsx prisma/seed.ts', { env, stdio: 'ignore' })
}
