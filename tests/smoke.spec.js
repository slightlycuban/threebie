// @ts-check
// Deterministic smoke tests for the demo pages.
//
// Playwright's fake clock drives requestAnimationFrame, so the ripple
// simulation advances an exact number of frames between checks. Each page is
// checked for console errors, rendered output (screenshots), and the state of
// the displaced vertices (a JSON snapshot plus a count of broken vertices).
//
// These snapshots pin *current* behavior, bugs included. A step that is meant
// to change behavior updates them with `npm run test:update` in the same
// commit; a step that isn't must leave them untouched.
const { test, expect } = require('@playwright/test');

const FRAME_MS = 16; // fake-timers fires requestAnimationFrame every 16ms
const FRAMES_AFTER_CLICK = 30;

const pages = [
  {
    file: 'scene.html',
    // The sphere sits in the middle of the view.
    clickAt: { x: 400, y: 300 },
    meshExpr: 'demo.sphere',
  },
];

/** Read every vertex of the page's displaced mesh, rounded for stable snapshots. */
async function readVertices(page, meshExpr) {
  return page.evaluate((expr) => {
    // eslint-disable-next-line no-eval
    const mesh = (0, eval)(expr);
    const round = (n) => (Number.isFinite(n) ? Math.round(n * 1000) / 1000 : String(n));
    const vertices = mesh.geometry.vertices;
    let nonFinite = 0;
    let collapsed = 0;
    for (const v of vertices) {
      if (![v.x, v.y, v.z].every(Number.isFinite)) nonFinite++;
      else if (v.x === 0 && v.y === 0 && v.z === 0) collapsed++;
    }
    return {
      count: vertices.length,
      nonFinite,
      collapsed,
      positions: vertices.map((v) => [round(v.x), round(v.y), round(v.z)]),
    };
  }, meshExpr);
}

async function stepFrames(page, n) {
  await page.clock.runFor(n * FRAME_MS);
}

/**
 * Capture the WebGL canvas as a PNG.
 *
 * Playwright's page screenshot waits on timers and animation frames, which the
 * fake clock holds back, so it hangs. Instead, redraw the current frame
 * (without stepping the ripple simulation) and read the canvas in the same
 * task, while the drawing buffer is still valid.
 */
async function canvasPng(page) {
  const dataUrl = await page.evaluate(() => {
    const { renderer, scene, camera } = window.demo;
    renderer.render(scene, camera);
    return renderer.domElement.toDataURL('image/png');
  });
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

for (const demo of pages) {
  test.describe(demo.file, () => {
    test('renders, ripples on click, and matches the baseline', async ({ page }) => {
      const problems = [];
      page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
      page.on('console', (m) => {
        if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text()}`);
      });

      // Freeze time: install() alone lets the fake clock keep flowing in real
      // time, which would run a varying number of frames while the page loads.
      await page.clock.install({ time: 0 });
      await page.clock.pauseAt(1000);
      await page.goto(`/${demo.file}`, { waitUntil: 'networkidle' });
      await stepFrames(page, 1);

      const before = await readVertices(page, demo.meshExpr);
      expect(await canvasPng(page)).toMatchSnapshot(`${demo.file}-initial.png`);

      await page.mouse.click(demo.clickAt.x, demo.clickAt.y);
      await stepFrames(page, FRAMES_AFTER_CLICK);
      const after = await readVertices(page, demo.meshExpr);

      // The click must actually disturb the surface.
      expect(after.positions).not.toEqual(before.positions);

      expect(await canvasPng(page)).toMatchSnapshot(`${demo.file}-after-click.png`);

      const summary = { count: after.count, nonFinite: after.nonFinite, collapsed: after.collapsed };
      expect(JSON.stringify(summary, null, 2)).toMatchSnapshot(`${demo.file}-vertex-summary.json`);
      expect(JSON.stringify(after.positions)).toMatchSnapshot(`${demo.file}-vertices.json`);

      expect(problems, 'console errors/warnings').toEqual([]);
    });
  });
}
