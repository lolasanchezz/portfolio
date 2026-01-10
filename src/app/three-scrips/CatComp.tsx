'use client'
import * as THREE from 'three';
import { AsciiEffect } from "three/addons/effects/AsciiEffect.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import React, { useRef, useEffect } from 'react'
import styles from "./threestyles.module.css"

const CatComp = (props:{width: number, height: number}) => {
  const mountRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const initScene = async () => {
      const loader = new STLLoader()
      const geometry2 = await loader.loadAsync('/cat.stl')
      
      const canvas = mountRef.current;
      if (!canvas) return;
      
      const renderer = new THREE.WebGLRenderer({ canvas });
      renderer.setSize(props.width, props.height);
      
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xFFFFFF);
      const camera = new THREE.PerspectiveCamera(
        70,
        props.width / props.height,
        0.1,
        1000
      );
      
      camera.position.y = 10;
      camera.position.z = 0;
      camera.position.x = 0
      
      const color = 0x000000;
      const intensity = 0;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(0, 0, 0);
      light.target.position.set(3,3,3);
      
      const points = new THREE.Points(
        geometry2,
        new THREE.PointsMaterial({
          size: 0.00000001,
          color: 0x000000,
        })
      );
      
      // Center the geometry
      geometry2.computeBoundingBox();
      const boundingBox = geometry2.boundingBox;
      if (!boundingBox) return;
      
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);
      
      // Offset the geometry so its center is at the origin
      geometry2.translate(-center.x, -center.y, -center.z);
      
      points.scale.set(0.1,0.1,0.1)
      points.position.set(0,0,0)
      points.rotation.x = -Math.PI / 2; // Rotate to face forward
      points.rotation.z = Math.PI/5
      scene.add(points);
      
      // Position camera to view the centered object
      const size = new THREE.Vector3();
      boundingBox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / Math.tan(fov / 2)) * 0.1; // Adjusted for scale
      camera.position.set(0, 0, cameraZ);
      camera.lookAt(0, 0, 0);
      
      let controls = new TrackballControls(camera, renderer.domElement);

      // append the effect DOM element before creating controls so getBoundingClientRect()
      // returns correct dimensions immediately (prevents controls having zero size)
      if (canvas.parentElement) {
        canvas.parentElement.replaceChild(renderer.domElement, canvas);
      } 
      controls = new TrackballControls(camera, renderer.domElement);
      controls.handleResize();
      
      const handleResize = () => {
        camera.aspect = props.width / props.height;
        camera.updateProjectionMatrix();
      
        renderer.setSize(props.width, props.height);
        controls.handleResize();
      }
      
      window.addEventListener("resize", handleResize);
      
      function animate() {
        controls.update();
        points.rotateZ(0.00001)
        renderer.render(scene, camera);
      }
      renderer.setAnimationLoop(animate);
      
      // Cleanup
      return () => {
        window.removeEventListener("resize", handleResize);
        renderer.setAnimationLoop(null);
        renderer.dispose();
      };
    };
    
    initScene();
  }, [])
  
  return (
    <div className = {styles.container}>
  <canvas ref={mountRef} id="firstCanvas" />
  </div>
)
}

export default CatComp;