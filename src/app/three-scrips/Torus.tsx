"use client";
import * as THREE from "three";
import { AsciiEffect } from "three/addons/effects/AsciiEffect.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import React, { useRef, useEffect } from "react";
import styles from "./threestyles.module.css";

const Torus = (props: { width: number; height: number }) => {
  const mountRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const initScene = async () => {
      const canvas = mountRef.current;
      if (!canvas) return;

      const renderer = new THREE.WebGLRenderer({ canvas });
      renderer.setSize(props.width, props.height);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff);
      const camera = new THREE.PerspectiveCamera(
        75,
        props.width / props.height,
        0.1,
        1000
      );

      const geometry = new THREE.TorusGeometry(1.1, 0.7, 20, 40);
      camera.position.z = 3;
      camera.position.x = -3;
      camera.position.y = -2.5;

      const positionAttribute = geometry.getAttribute("position");
      const colors = [];
      const color = new THREE.Color();

      for (let i = 0; i < positionAttribute.count; i++) {
        const z = positionAttribute.getZ(i);

        if (z > 0.3) {
          // top portion
          color.setHex(0xff69b4); // pink
        } else {
          color.setHex(0x8b4513); // brown
        }

        colors.push(color.r, color.g, color.b);
      }

      geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(new Float32Array(colors), 3)
      );

      const points = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
          size: 0.1,
          vertexColors: true,
        })
      );

      


      scene.add(points);

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
      };

      window.addEventListener("resize", handleResize);

      function animate() {
        controls.update();
        points.rotateZ(0.00001);
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
  }, []);

  return (
    <div className={styles.container}>
      <canvas ref={mountRef} id="firstCanvas" />
    </div>
  );
};

export default Torus;
