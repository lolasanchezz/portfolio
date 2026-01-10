import * as THREE from "three";
import { AsciiEffect } from "three/addons/effects/AsciiEffect.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.z = 5;

const geometry = new THREE.SphereGeometry(2, 36, 15);
const points = new THREE.Points(
  geometry,
  new THREE.PointsMaterial({
    size: 0.02 ,
    color: 0x00ffff,
  })
);
scene.add(points)



const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('firstCanvas') })
renderer.setSize(100, 100);
document.body.appendChild(renderer.domElement)

let controls = new TrackballControls(camera, renderer.domElement);
controls.handleResize();

window.addEventListener("resize", () => {
  camera.aspect = 100 / 100;
  camera.updateProjectionMatrix();

  renderer.setSize(100, 100);
  controls.handleResize();
})
function animate() {
  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
