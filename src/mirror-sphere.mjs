// The mirror sphere: a sphere mesh whose material reflects a cube camera at
// its center, displaced radially by a height for each vertex.

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
 *   Move each vertex to radius + the height of its grid cell from the center.
 *   Each pole takes the average of its row, so it stays a single point.
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
  var sphereMirror = new THREE.CubeCamera(0.1, 5000, 512);
  scene.add(sphereMirror);
  var sphereMirrorMaterial = new THREE.MeshBasicMaterial({ envMap: sphereMirror.renderTarget });

  var segments = res, rings = res;
  var sphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, rings),
      sphereMirrorMaterial);
  sphereMirror.position.set(0, 0, 0);
  sphereMirror.position = sphere.position;

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
      sphereMirror.updateCubeMap(renderer, scene);
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

      var geometry = sphere.geometry;
      for (var i = 0, l = geometry.vertices.length; i < l; i++) {
        var cell = cellOf(i);
        var h = cell.y === 0 ? north
          : cell.y === rows - 1 ? south
          : height(cell.x, cell.y);
        var vertex = geometry.vertices[i];
        var vec = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
        vec.setLength(h + radius);
        vertex.x = vec.x;
        vertex.y = vec.y;
        vertex.z = vec.z;
      }
      geometry.verticesNeedUpdate = true;
    },
  };
}
