// @ts-check
// Real-time recordings of each demo for people to watch (`npm run record`).
// Videos land in test-results/. Software WebGL is slow, so expect a low frame
// rate; these show what happens, not how smooth it is.
const { test } = require('@playwright/test');

const RECORD_MS = 8000;

test('scene.html: click the sphere and watch it ripple', async ({ page }) => {
  await page.goto('/scene.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.mouse.click(400, 300);
  await page.waitForTimeout(RECORD_MS);
});
