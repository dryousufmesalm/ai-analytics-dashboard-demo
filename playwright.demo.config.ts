import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "demo-recording.spec.ts",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3000",
    video: "on",
    viewport: { width: 1280, height: 720 },
    launchOptions: { slowMo: 350 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://127.0.0.1:3000",
    timeout: 180_000,
  },
});
