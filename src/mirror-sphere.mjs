// The mirror sphere: a sphere mesh whose material reflects a cube camera at
// its center, displaced radially by a height for each vertex.

/**
 * @typedef {object} MirrorSphere
 * @property {THREE.Mesh} mesh
 * @property {(renderer: THREE.WebGLRenderer, scene: THREE.Scene) => void} updateReflection
 *   Re-render the reflection from the sphere's center, without the sphere.
 * @property {(height: (i: number) => number) => void} displace
 *   Move each vertex i to radius + height(i) from the center.
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

  return {
    mesh: sphere,

    /**
     * @param {THREE.WebGLRenderer} renderer
     * @param {THREE.Scene} scene
     */
    updateReflection(renderer, scene) {
      sphere.visible = false;
      sphereMirror.updateCubeMap(renderer, scene);
      sphere.visible = true;
    },

    /** @param {(i: number) => number} height */
    displace(height) {
      var geometry = sphere.geometry;
      for (var i = 0, l = geometry.vertices.length; i < l; i++) {
        var vertex = geometry.vertices[i];
        var vec = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
        vec.setLength(height(i) + radius);
        vertex.x = vec.x;
        vertex.y = vec.y;
        vertex.z = vec.z;
      }
      geometry.verticesNeedUpdate = true;
    },
  };
}
