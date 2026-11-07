// The mirror sphere: a sphere mesh whose material reflects a cube camera at
// its center, displaced radially by a height for each vertex.
import * as THREE from 'three';

/**
 * @typedef {object} MirrorSphere
 * @property {THREE.Mesh} mesh
 * @property {{ cols: number, rows: number }} grid
 *   Size of the height grid that covers the sphere: one column per segment
 *   around it (wrapping at the seam), one row per ring of vertices from pole
 *   to pole.
 * @property {(vertex: number) => { x: number, y: number }} cellOf
 *   Grid cell of a vertex index.
 * @property {(renderer: THREE.WebGLRenderer, scene: THREE.Scene) => void} updateReflection
 *   Re-render the reflection from the sphere's center, without the sphere.
 * @property {(height: (x: number, y: number) => number) => void} displace
 *   Move each vertex to radius + the height of its grid cell from the center,
 *   and update the normals to match, so the reflection ripples too. Each pole
 *   takes the average of its row, so it stays a single point.
 */

/**
 * Create the sphere and add its cube camera to the scene. The caller adds the
 * mesh itself.
 *
 * @param {THREE.Scene} scene
 * @param {number} radius Radius of the undisturbed sphere.
 * @param {number} res Width and height segments of the sphere geometry.
 * @returns {MirrorSphere}
 */
export function createMirrorSphere(scene, radius, res) {
  var cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512);
  var sphereMirror = new THREE.CubeCamera(0.1, 5000, cubeRenderTarget);
  scene.add(sphereMirror);
  var sphereMirrorMaterial = new THREE.MeshBasicMaterial({ envMap: cubeRenderTarget.texture });

  var segments = res, rings = res;
  var sphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, rings),
      sphereMirrorMaterial);
  sphereMirror.position.copy(sphere.position);

  // SphereGeometry lays out (rings + 1) rows of (segments + 1) vertices, from
  // the north pole (row 0) to the south pole. The last vertex of each row
  // repeats the first to close the seam, and every vertex of a pole row sits
  // at the pole.
  var cols = segments, rows = rings + 1;
  var verticesPerRow = segments + 1;

  /** @param {number} vertex */
  function cellOf(vertex) {
    return {
      x: (vertex % verticesPerRow) % cols,
      y: Math.floor(vertex / verticesPerRow),
    };
  }

  var positions = sphere.geometry.attributes.position;
  var normals = sphere.geometry.attributes.normal;
  var a = new THREE.Vector3(), b = new THREE.Vector3();
  var c = new THREE.Vector3(), n = new THREE.Vector3();

  // x wraps around the seam.
  function pointAt(x, y, target) {
    return target.fromBufferAttribute(positions, y * verticesPerRow + (x + cols) % cols);
  }

  function setNormal(vertex, normal) {
    normals.setXYZ(vertex, normal.x, normal.y, normal.z);
  }

  // The normal of the pole in row y, summed over the triangle fan between it
  // and the next row toward the equator. Seen from outside, the fan winds the
  // other way at the south pole.
  function poleNormal(y, ring, target) {
    target.set(0, 0, 0);
    pointAt(0, y, c);
    for (var x = 0; x < cols; x++) {
      pointAt(x, ring, a).sub(c);
      pointAt(x + 1, ring, b).sub(c);
      target.add(y === 0 ? a.cross(b) : b.cross(a));
    }
    return target.normalize();
  }

  // Normals come from the grid rather than computeVertexNormals(), which
  // would treat the seam's two copies of a vertex, and each pole's row of
  // copies, as separate points with different normals.
  function updateNormals() {
    for (var y = 1; y < rows - 1; y++) {
      for (var x = 0; x < cols; x++) {
        pointAt(x + 1, y, a).sub(pointAt(x - 1, y, c));
        pointAt(x, y + 1, b).sub(pointAt(x, y - 1, c));
        n.crossVectors(b, a).normalize();
        setNormal(y * verticesPerRow + x, n);
        if (x === 0) setNormal(y * verticesPerRow + cols, n);
      }
    }
    for (var pole of [[0, 1], [rows - 1, rows - 2]]) {
      poleNormal(pole[0], pole[1], n);
      for (var x = 0; x < verticesPerRow; x++) setNormal(pole[0] * verticesPerRow + x, n);
    }
    normals.needsUpdate = true;
  }

  return {
    mesh: sphere,
    grid: { cols: cols, rows: rows },
    cellOf: cellOf,

    /**
     * @param {THREE.WebGLRenderer} renderer
     * @param {THREE.Scene} scene
     */
    updateReflection(renderer, scene) {
      sphere.visible = false;
      sphereMirror.update(renderer, scene);
      sphere.visible = true;
    },

    /** @param {(x: number, y: number) => number} height */
    displace(height) {
      /** @param {number} y */
      function rowAverage(y) {
        var sum = 0;
        for (var x = 0; x < cols; x++) sum += height(x, y);
        return sum / cols;
      }
      var north = rowAverage(0);
      var south = rowAverage(rows - 1);

      var vertex = new THREE.Vector3();
      for (var i = 0, l = positions.count; i < l; i++) {
        var cell = cellOf(i);
        var h = cell.y === 0 ? north
          : cell.y === rows - 1 ? south
          : height(cell.x, cell.y);
        vertex.fromBufferAttribute(positions, i).setLength(h + radius);
        positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }
      positions.needsUpdate = true;
      updateNormals();
    },
  };
}
