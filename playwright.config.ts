import { defineConfig, devices } from "@playwright/test"

const PORT = 3111

/**
 * Uji end-to-end berjalan pada build produksi dengan Quran.com API tiruan
 * (lihat e2e/mock-quran-api.cjs), jadi hasilnya tidak bergantung pada jaringan.
 *
 * Urutan: `bun run build:e2e` lalu `bun run test:e2e`.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "bun run start:e2e",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
