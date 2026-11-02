// Characterization tests for the ripple simulation. The expected heights pin
// its current behavior, so a change to them must be a deliberate behavior
// change, re-recorded with `npm run test:unit:update` in the same commit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scenarios, run } from './ripple-scenarios.mjs';
import expected from './ripple.fixture.json' with { type: 'json' };

for (const sc of scenarios) {
  test(sc.name, () => {
    assert.deepEqual(run(sc), expected[sc.name]);
  });
}
