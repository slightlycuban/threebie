// Renderer, scene, camera, skybox and mouse controls.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Create the renderer, scene and camera, and add the canvas to container.
 *
 * @param {HTMLElement} container Element the canvas is appended to.
 * @returns {{ renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera }}
 */
export function createStage(container) {
  var WIDTH = window.innerWidth, HEIGHT = window.innerHeight;
  var VIEW_ANGLE = 45, ASPECT = WIDTH / HEIGHT, NEAR = 0.1, FAR = 20000;
  var renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(WIDTH, HEIGHT);

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  camera.position.z = 300;

  container.appendChild(renderer.domElement);

  // Keep the canvas filling the window.
  window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  return { renderer, scene, camera };
}

/**
 * Surround the scene with the dawn-mountain skybox.
 *
 * @param {THREE.Scene} scene
 */
export function addSkybox(scene) {
  var imagePrefix = "img/dawnmountain-";
  var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
  var imageSuffix = ".png";

  // One material per face of a big box, seen from inside. (A cube texture
  // as scene.background would show the images mirrored left to right.)
  var loader = new THREE.TextureLoader();
  var materialArray = [];
  for (var i = 0; i < 6; i++) {
    var texture = loader.load(imagePrefix + directions[i] + imageSuffix);
    texture.colorSpace = THREE.SRGBColorSpace;
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide }));
  }

  var skybox = new THREE.Mesh(
      new THREE.BoxGeometry(10000, 10000, 10000),
      materialArray
      );
  scene.add(skybox);
}

/**
 * Orbit the camera with the mouse. The caller's animation loop must call
 * controls.update() and render every frame.
 *
 * @param {THREE.PerspectiveCamera} camera
 * @param {THREE.WebGLRenderer} renderer Its canvas receives the mouse events.
 * @returns {OrbitControls}
 */
export function addOrbitControls(camera, renderer) {
  return new OrbitControls(camera, renderer.domElement);
}
