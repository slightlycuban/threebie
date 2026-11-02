// Mouse-click picking: turn a mousedown into the first intersection with one
// of the target meshes.

/*
 * totally borrowed this from:
 * http://stemkoski.github.io/Three.js/Mouse-Click.html
 */

/**
 * On every mousedown, raycast from the camera through the cursor and pass the
 * nearest hit on any target to onHit. Clicks that miss are ignored.
 *
 * @param {THREE.PerspectiveCamera} camera
 * @param {THREE.Object3D[]} targetList Objects that can be clicked.
 * @param {(hit: THREE.Intersection) => void} onHit
 */
export function onClick(camera, targetList, onHit) {
  var projector = new THREE.Projector();
  var mouse = { x: 0, y: 0 };

  function onDocumentMouseDown(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    projector.unprojectVector(vector, camera);
    var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

    var intersections = ray.intersectObjects(targetList);
    if (intersections.length > 0) {
      onHit(intersections[0]);
    }
  }

  document.addEventListener('mousedown', onDocumentMouseDown, false);
}
