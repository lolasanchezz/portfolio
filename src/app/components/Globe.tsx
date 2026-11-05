"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";

// the dotted globe from the old site (lolas.website) - a sphere drawn as points, slowly turning,
// and you can grab it and spin it around
export default function Globe({ size = 260, className }: { size?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;

    // same sphere + navy dots as the old site
    const points = new THREE.Points(
      new THREE.SphereGeometry(2, 36, 15),
      new THREE.PointsMaterial({ size: 0.09, color: 0x1e3c6b }),
    );
    scene.add(points);

    const controls = new TrackballControls(camera, renderer.domElement);
    // no zooming - otherwise the scroll wheel gets stuck on the globe instead of scrolling the page
    controls.noZoom = true;
    controls.noPan = true;
    controls.rotateSpeed = 3;
    controls.handleResize();

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const loop = () => {
      if (!still) points.rotation.y += 0.003;
      controls.update();
      renderer.render(scene, camera);
    };
    // only spin while it's on screen - otherwise it's redrawing 60 times a second for nobody
    const io = new IntersectionObserver(([entry]) => renderer.setAnimationLoop(entry.isIntersecting ? loop : null));
    io.observe(mount);

    return () => {
      io.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();
      points.geometry.dispose();
      (points.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [size]);

  return <div ref={ref} className={className} style={{ width: size, height: size, cursor: "grab" }} aria-hidden="true" />;
}
