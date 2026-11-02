/*
 * Two-buffer ripple simulation on a res-by-res grid of heights. It has no
 * three.js dependency; a surface reads height(i) for each of its vertices.
 *
 * Borrowed from http://bit.ly/1jehGDZ
 * and from http://bit.ly/1nGXUTn
 */

/**
 * @typedef {object} Ripple
 * @property {(x: number, y: number, amount: number) => void} disturb
 *   Add `amount` to the height at grid cell (x, y).
 * @property {() => void} step Advance the simulation by one frame.
 * @property {(i: number) => number} height
 *   Height at grid index i (row-major, `x + y * res`).
 */

/**
 * @param {number} res Grid cells per side.
 * @returns {Ripple}
 */
export function createRipple(res) {
  var buffer1 = [];
  var buffer2 = [];

  // make l = (res ** 2 ) + 1 just to give a little buffer
  for (var i = 0, l = res * res + 1; i < l; i++) {
    buffer1[i] = buffer2[i] = 0;
  }

  return {
    disturb(x, y, amount) {
      buffer1[x + (y * res)] += amount;
    },

    step() {
      for (var i = 0, l = res * res; i < l; i++) {
        // let's try making things wrap around
        var left = (i % res) == 0 ? i - 1 + res : i - 1;
        var right = ((i + 1) % res) == 0 ? i + 1 - res : i + 1;
        var up = (i) < res ? i - res + l : i - res;
        var down = (i) > (l - res) ? (i % res) + res : i + res;
        buffer2[i] = (
            (buffer1[left]
              + buffer1[right]
              + buffer1[up]
              + buffer1[down])
            / 2) - buffer2[i];
        buffer1[i] += (buffer2[i] - buffer1[i]) * 0.5;
        buffer1[i] *= 0.85;
      }
      var temp = buffer1;
      buffer1 = buffer2;
      buffer2 = temp;
    },

    height(i) {
      return buffer2[i];
    },
  };
}
