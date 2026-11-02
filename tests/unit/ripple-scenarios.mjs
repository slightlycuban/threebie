// Inputs for the ripple characterization tests. Shared by the test and by
// record-ripple-fixture.mjs, which records the heights the test expects.
import { createRipple } from '../../src/ripple.mjs';

const RES = 25;
const VERTICES = 676; // the sphere's vertex count, which the grid doesn't match

/**
 * @typedef {object} Scenario
 * @property {string} name
 * @property {number} x Grid column to disturb.
 * @property {number} y Grid row to disturb.
 * @property {number} frames Simulation steps to run.
 * @property {boolean} held Disturb on every frame, not just the first.
 */

/** @type {Scenario[]} */
export const scenarios = [
  { name: 'held click near the middle', x: 12, y: 12, frames: 30, held: true },
  { name: 'held click on the first vertex (wraps left and up)', x: 0, y: 0, frames: 30, held: true },
  { name: 'held click on the last row (bottom-row rule)', x: 20, y: 24, frames: 30, held: true },
  { name: 'single impulse', x: 12, y: 12, frames: 30, held: false },
];

/**
 * Run a scenario and return the height read for each sphere vertex, with
 * null where there is no height.
 *
 * @param {Scenario} sc
 * @returns {(number | null)[]}
 */
export function run(sc) {
  const sim = createRipple(RES);
  for (let f = 0; f < sc.frames; f++) {
    if (f === 0 || sc.held) sim.disturb(sc.x, sc.y, 10);
    sim.step();
  }
  const heights = [];
  for (let i = 0; i < VERTICES; i++) heights.push(sim.height(i) ?? null);
  return heights;
}
