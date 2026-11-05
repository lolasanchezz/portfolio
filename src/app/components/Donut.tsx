"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";

// the dotted donut from the old site (lolas.website) - pink frosting on top, brown underneath,
// slowly turning, and you can grab it and spin it around
export default function Donut({ size = 260, className }: { size?: number; className?: string }) {
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
    // same tilted view as the old site
    camera.position.set(-3, -2.5, 3);

    const geometry = new THREE.TorusGeometry(1.5, 0.7, 20, 40);
    // color each dot: frosting on the top side, dough on the bottom
    const position = geometry.getAttribute("position");
    const colors = new Float32Array(position.count * 3);
    const pink = new THREE.Color(0xff69b4);
    const brown = new THREE.Color(0x8b4513);
    for (let i = 0; i < position.count; i++) {
      (position.getZ(i) > 0.3 ? pink : brown).toArray(colors, i * 3);
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const points = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.1, vertexColors: true }));
    scene.add(points);

    const controls = new TrackballControls(camera, renderer.domElement);
    // no zooming - otherwise the scroll wheel gets stuck on the donut instead of scrolling the page
    controls.noZoom = true;
    controls.noPan = true;
    controls.rotateSpeed = 3;
    controls.handleResize();

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const loop = () => {
      if (!still) points.rotation.z += 0.004;
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
      geometry.dispose();
      (points.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [size]);

  return <div ref={ref} className={className} style={{ width: size, height: size, cursor: "grab" }} aria-hidden="true" />;
}
