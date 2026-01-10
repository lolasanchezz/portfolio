import * as THREE from "three";
import { AsciiEffect } from "three/addons/effects/AsciiEffect.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";


const loader = new STLLoader()
const geometry2 = await loader.loadAsync('./stls/cat.stl')

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('firstCanvas') });
renderer.setSize(window.innerWidth, window.innerHeight);





const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
let effect;

camera.position.y = 10;
camera.position.z = 0;
camera.position.x = 0
//camera.rotateX(2);
//camera.rotateY(90)
//camera.rotateZ(90)


const color = 0x000000;
const intensity = 0;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(0, 0, 0);
light.target.position.set(3,3,3);
//scene.add(light)
const points = new THREE.Points(
  geometry2,
  new THREE.PointsMaterial({
    size: 0.00001,
    color: 0xffffff,
  })
);

// Center the geometry
geometry2.computeBoundingBox();
const boundingBox = geometry2.boundingBox;
const center = new THREE.Vector3();
boundingBox.getCenter(center);

// Offset the geometry so its center is at the origin
geometry2.translate(-center.x, -center.y, -center.z);

points.scale.set(0.1,0.1,0.1)
points.position.set(0,0,0)
points.rotation.x = -Math.PI / 2; // Rotate to face forward
scene.add( points);

// Position camera to view the centered object
const size = new THREE.Vector3();
boundingBox.getSize(size);
const maxDim = Math.max(size.x, size.y, size.z);
const fov = camera.fov * (Math.PI / 180);
let cameraZ = Math.abs(maxDim / Math.tan(fov / 2)) * 0.1; // Adjusted for scale
camera.position.set(0, 0, cameraZ);
camera.lookAt(0, 0, 0);


effect = new AsciiEffect(renderer, " .:-+*=%@#", { invert: true });
effect.setSize(window.innerWidth, window.innerHeight);
effect.domElement.style.color = "black";
let controls;
// append the effect DOM element before creating controls so getBoundingClientRect()
// returns correct dimensions immediately (prevents controls having zero size)
const canvas = document.getElementById('firstCanvas');
if (canvas) {
  canvas.parentElement.replaceChild(effect.domElement, canvas);
} 
controls = new TrackballControls(camera, effect.domElement);
controls.handleResize();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  effect.setSize(window.innerWidth, window.innerHeight);
  controls.handleResize();
})
function animate() {
  controls.update();
  effect.render(scene, camera);
  points.rotateZ(0.003)
  //if (Math.random() > 0.5) {points.rotateY(Math.random()/100)}

}
renderer.setAnimationLoop(animate);
