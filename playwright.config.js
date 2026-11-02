// @ts-check
const { defineConfig } = require('@playwright/test');

const PORT = 8123;

module.exports = defineConfig({
  testDir: 'tests',
  // Software WebGL is slow; keep runs serial so frame stepping isn't starved.
  workers: 1,
  timeout: 120_000,
  expect: {
    // SwiftShader output is deterministic, but allow a hair of tolerance.
    toMatchSnapshot: { maxDiffPixelRatio: 0.001 },
  },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    viewport: { width: 800, height: 600 },
    launchOptions: {
      // No GPU on this machine: render WebGL in software.
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
    },
  },
  webServer: {
    command: `node tests/serve.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}/scene.html`,
    reuseExistingServer: true,
  },
  projects: [
    {
      // Deterministic checks: fake clock, fixed frame counts, pinned snapshots.
      name: 'smoke',
      testMatch: /smoke\.spec\.js/,
    },
    {
      // Real-time video of each demo for humans to watch. Not part of `npm test`.
      name: 'record',
      testMatch: /record\.spec\.js/,
      use: { video: { mode: 'on', size: { width: 800, height: 600 } } },
    },
  ],
});
