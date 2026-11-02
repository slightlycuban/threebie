// Renderer, scene, camera, skybox and mouse controls. Uses the global THREE,
// Detector, THREEx and OrbitControls scripts that the page loads first.

/**
 * Create the renderer, scene and camera, and add the canvas to $container.
 *
 * @param {JQuery} $container Element the canvas is appended to.
 * @returns {{ renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera }}
 */
export function createStage($container) {
  var WIDTH = window.innerWidth, HEIGHT = window.innerHeight;
  var VIEW_ANGLE = 45, ASPECT = WIDTH / HEIGHT, NEAR = 0.1, FAR = 20000;
  var renderer;

  if (Detector.webgl) {
    renderer = new THREE.WebGLRenderer();
  } else {
    renderer = new THREE.CanvasRenderer();
  }
  renderer.setSize(WIDTH, HEIGHT);

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  camera.position.z = 300;

  $container.append(renderer.domElement);

  // Use helper WindowResize for this bit
  THREEx.WindowResize(renderer, camera);

  return { renderer, scene, camera };
}

/**
 * Surround the scene with the dawn-mountain skybox.
 *
 * @param {THREE.Scene} scene
 */
export function addSkybox(scene) {
  /**
   * Skybox stuff
   * combine the 6 image (prefix + x/y/x + pos/neg)
   * into a materialArray, which is the inside of our skybox
   */
  var imagePrefix = "img/dawnmountain-";
  var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
  var imageSuffix = ".png";

  var materialArray = [];
  for (var i = 0; i < 6; i++) {
    materialArray.push( new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
      side: THREE.BackSide }));
  }
  var skyMaterial = new THREE.MeshFaceMaterial( materialArray );

  var skybox = new THREE.Mesh(
      new THREE.BoxGeometry(10000,10000,10000),
      skyMaterial
      );
  skybox.flipSided = true;
  scene.add(skybox);
}

/**
 * Orbit the camera with the mouse.
 *
 * @param {THREE.PerspectiveCamera} camera
 * @param {THREE.WebGLRenderer} renderer Its canvas receives the mouse events.
 * @param {() => void} onChange Runs whenever the view moves.
 * @returns {THREE.OrbitControls}
 */
export function addOrbitControls(camera, renderer, onChange) {
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', onChange);
  return controls;
}
