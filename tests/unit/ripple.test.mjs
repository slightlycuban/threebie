// Characterization tests for the ripple simulation. The expected heights pin
// its current behavior, so a change to them must be a deliberate behavior
// change, re-recorded with `npm run test:unit:update` in the same commit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRipple } from '../../src/ripple.mjs';
import { scenarios, run } from './ripple-scenarios.mjs';
import expected from './ripple.fixture.json' with { type: 'json' };

for (const sc of scenarios) {
  test(sc.name, () => {
    assert.deepEqual(run(sc), expected[sc.name]);
  });
}

/** Cells with a non-zero height, as "x,y" strings. */
function disturbedCells(sim, cols, rows) {
  const cells = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) if (sim.height(x, y) !== 0) cells.push(`${x},${y}`);
  }
  return cells;
}

test('one step moves a disturbance only to the adjacent cells', () => {
  const sim = createRipple(9, 9);
  sim.disturb(4, 4, 10);
  sim.step();
  assert.deepEqual(disturbedCells(sim, 9, 9), ['4,3', '3,4', '5,4', '4,5']);
});

test('a lone impulse dies out', () => {
  const sim = createRipple(25, 26);
  sim.disturb(12, 12, 10);
  for (let f = 0; f < 600; f++) sim.step();
  let peak = 0;
  for (let y = 0; y < 26; y++) {
    for (let x = 0; x < 25; x++) peak = Math.max(peak, Math.abs(sim.height(x, y)));
  }
  assert.ok(peak < 0.01, `peak height after 600 steps is ${peak}`);
});

test('columns wrap around: the first column neighbors the last', () => {
  const sim = createRipple(9, 9);
  sim.disturb(0, 4, 10);
  sim.step();
  assert.deepEqual(disturbedCells(sim, 9, 9), ['0,3', '1,4', '8,4', '0,5']);
});

test('rows do not wrap: past the first row is the cell itself', () => {
  const sim = createRipple(9, 9);
  sim.disturb(4, 0, 10);
  sim.step();
  assert.deepEqual(disturbedCells(sim, 9, 9), ['3,0', '4,0', '5,0', '4,1']);
});

test('rows do not wrap: past the last row is the cell itself', () => {
  const sim = createRipple(9, 9);
  sim.disturb(4, 8, 10);
  sim.step();
  assert.deepEqual(disturbedCells(sim, 9, 9), ['4,7', '3,8', '4,8', '5,8']);
});
