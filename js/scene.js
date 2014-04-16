var WIDTH = 400,
    HEIGHT = 300;

var VIEW_ANGLE = 45,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000;

var $container = $('#container');

var renderer;
if (Detector.webgl) {
  renderer = new THREE.WebGLRenderer();
} else {
  renderer = new THREE.CanvasRenderer();
}
var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

var scene = new THREE.Scene();

camera.position.z = 300;

renderer.setSize(WIDTH, HEIGHT);

$container.append(renderer.domElement);

var sphereMaterial = new THREE.MeshLambertMaterial({
  color: 0xCC0000
});

var radius = 50, segments = 16, rings = 16;

var sphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, rings),
    sphereMaterial);

var pointLight = new THREE.PointLight( 0xFFFFFF );

pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.x = 130;

scene.add(pointLight);

scene.add(sphere);

var skybox = new THREE.Mesh(
    new THREE.CubeGeometry(500,500,500),
    new THREE.MeshBasicMaterial({ color: 0x0000FF, depthWrite: false })
    );
skybox.flipSided = true;
var bgCam = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
var bgScene = new THREE.Scene();
bgScene.add(bgCam);
//bgScene.add(skybox);
scene.add(skybox);

var render = function() {
  // renderer.render(bgScene, bgCam);
  renderer.render(scene, camera);
  return true;
}
render();
