// Characterization tests for the ripple simulation. The fixture was recorded
// from the original code in scene.html, bugs included, so a change to it here
// must be a deliberate behavior change.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRipple } from '../../src/ripple.mjs';
import scenarios from './ripple.fixture.json' with { type: 'json' };

const RES = 25;
const VERTICES = 676; // the sphere's vertex count, which the grid doesn't match

for (const sc of scenarios) {
  test(sc.name, () => {
    const sim = createRipple(RES);
    for (let f = 0; f < sc.frames; f++) {
      if (f === 0 || sc.held) sim.disturb(sc.vertex % RES, Math.floor(sc.vertex / RES), 10);
      sim.step();
    }
    const heights = [];
    for (let i = 0; i < VERTICES; i++) heights.push(sim.height(i) ?? null);
    assert.deepEqual(heights, sc.heights);
  });
}
