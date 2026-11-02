/*
 * Two-buffer ripple simulation on a cols-by-rows grid of heights. It has no
 * three.js dependency; a surface maps each of its vertices to a grid cell and
 * reads that cell's height.
 *
 * Borrowed from http://bit.ly/1jehGDZ
 * and from http://bit.ly/1nGXUTn
 */

/**
 * @typedef {object} Ripple
 * @property {(x: number, y: number, amount: number) => void} disturb
 *   Add `amount` to the height at grid cell (x, y).
 * @property {() => void} step Advance the simulation by one frame.
 * @property {(x: number, y: number) => number} height
 *   Height at grid cell (x, y).
 */

/**
 * @param {number} cols Grid columns (x).
 * @param {number} rows Grid rows (y).
 * @returns {Ripple}
 */
export function createRipple(cols, rows) {
  var buffer1 = [];
  var buffer2 = [];

  // make l = (cols * rows) + 1 just to give a little buffer
  for (var i = 0, l = cols * rows + 1; i < l; i++) {
    buffer1[i] = buffer2[i] = 0;
  }

  return {
    disturb(x, y, amount) {
      buffer1[x + (y * cols)] += amount;
    },

    step() {
      for (var i = 0, l = cols * rows; i < l; i++) {
        // let's try making things wrap around
        var left = (i % cols) == 0 ? i - 1 + cols : i - 1;
        var right = ((i + 1) % cols) == 0 ? i + 1 - cols : i + 1;
        var up = (i) < cols ? i - cols + l : i - cols;
        var down = (i) > (l - cols) ? (i % cols) + cols : i + cols;
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

    height(x, y) {
      return buffer2[x + (y * cols)];
    },
  };
}
