"use client";

import { useEffect, useRef } from "react";
import type p5 from "p5";
import vines from "./vines.json";
import styles from "./vineCursor.module.css";

// cursor trail in the spirit of purduehackers.com: the screen is a grid of cells, and every lit cell
// gets an "@" - ascii pixels, like the dancers. the cursor leaves a stem behind it, and sprigs of the
// dotted vines from the figma file grow off the stem dot by dot, hang around, then wither back.
// vines.json is the vine sheet from figma turned into dot grids - each motif's dots are listed
// root-first in growing order, as [x, y, x, y, ...] offsets from the root

const CELL = 7; // css px per cell
const CHAR = "@"; // what each lit cell draws
const FONT = 11; // px size of each character - a bit bigger than a cell so they read as one shape
const STEM_LIFE = 650; // ms a stem pixel lasts
const SPRIG_EVERY = 9; // cells of cursor travel between sprigs
const SPRIG_GAP = 220; // ...or ms between sprigs, so a slow cursor still grows vines
const SPRIG_MIN = 1.5; // cells it has to have moved for the timed ones
const GROW = 700; // ms for a sprig to grow in
const HOLD = 350; // ms it stays fully grown
const WITHER = 600; // ms to wither back
const MAX_STEM = 4000; // cap so a frantic cursor can't pile up work

type Sprig = { x: number; y: number; dots: Int16Array; size: number; age: number };

// rotations in 90° steps keep the dots on the grid. k=0 is upright
const rotate = (x: number, y: number, k: number): [number, number] =>
  [[x, y], [-y, x], [-x, -y], [y, -x]][k] as [number, number];

export default function VineCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || still.matches || !ref.current) return;

    const node = ref.current;
    let cancelled = false;
    let sketch: p5 | undefined;

    // the trail lives out here rather than in the p5 sketch: p5 2.x waits for the page's load
    // event and runs setup async, and the cursor should leave vines from the very first move
    let stem: { x: number; y: number; age: number }[] = [];
    let sprigs: Sprig[] = [];
    let last: { x: number; y: number } | null = null;
    let travelled = 0;
    let side = 1;
    let lastSprig = { x: 0, y: 0, time: 0 };
    let lastMove = 0;

    // a random motif, turned so it grows out to one side of the direction the cursor's moving
    const sprout = (x: number, y: number, dx: number, dy: number) => {
      const motif = vines[Math.floor(Math.random() * vines.length)];
      side = -side;
      const nx = -dy * side;
      const ny = dx * side;
      let k = 0;
      for (let i = 1; i < 4; i++) {
        const [ux, uy] = rotate(0, -1, i);
        const [bx, by] = rotate(0, -1, k);
        if (ux * nx + uy * ny > bx * nx + by * ny) k = i;
      }
      const flip = Math.random() < 0.5 ? -1 : 1;
      const dots = new Int16Array(motif.dots.length);
      for (let i = 0; i < motif.dots.length; i += 2) {
        const [rx, ry] = rotate(motif.dots[i] * flip, motif.dots[i + 1], k);
        dots[i] = rx;
        dots[i + 1] = ry;
      }
      // only the first stretch of each motif grows - the sheet's vines are much bigger than a sprig
      const size = Math.min(dots.length / 2, 20 + Math.floor(Math.random() * 60));
      sprigs.push({ x, y, dots, size, age: 0 });
    };

    const onMove = (e: PointerEvent) => {
      const x = e.clientX / CELL;
      const y = e.clientY / CELL;
      const now = performance.now();
      lastMove = now;
      if (!last) {
        // a fresh trail - aim the first sprig from here, not from wherever the last trail ended
        last = { x, y };
        lastSprig = { x, y, time: now };
        stem.push({ x: Math.round(x), y: Math.round(y), age: 0 });
        return;
      }
      const dx = x - last.x;
      const dy = y - last.y;
      const dist = Math.hypot(dx, dy);
      // chrome fires moves at the same spot when the page changes under a still cursor (the dancers)
      if (!dist) return;
      // fill in every cell between the last position and this one so fast moves don't leave gaps
      const steps = Math.ceil(dist);
      for (let i = 1; i <= steps; i++) {
        stem.push({ x: Math.round(last.x + (dx * i) / steps), y: Math.round(last.y + (dy * i) / steps), age: 0 });
      }
      if (stem.length > MAX_STEM) stem = stem.slice(-MAX_STEM);
      travelled += dist;
      if (travelled > SPRIG_EVERY || (travelled > SPRIG_MIN && now - lastSprig.time > SPRIG_GAP)) {
        // aim off the path since the last sprig - single slow moves are too jittery to steer by
        const ax = x - lastSprig.x;
        const ay = y - lastSprig.y;
        const len = Math.hypot(ax, ay) || 1;
        sprout(Math.round(x), Math.round(y), ax / len, ay / len);
        travelled = 0;
        lastSprig = { x, y, time: now };
      }
      last = { x, y };
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    import("p5").then(({ default: P5 }) => {
      if (cancelled) return;
      sketch = new P5((p: p5) => {
        let canvas: HTMLCanvasElement;
        let cols = 0;
        let rows = 0;
        let lit = new Uint8Array(0); // so overlapping sprigs only stamp a cell once
        let star = document.createElement("canvas");
        let blank = true; // skip clearing an already empty canvas every frame

        const fit = () => {
          cols = Math.ceil(window.innerWidth / CELL);
          rows = Math.ceil(window.innerHeight / CELL);
          lit = new Uint8Array(cols * rows);
          p.resizeCanvas(window.innerWidth, window.innerHeight);
        };

        // the character drawn once up front, then stamped into every lit cell
        const makeStar = () => {
          const dpr = window.devicePixelRatio || 1;
          star = document.createElement("canvas");
          star.width = star.height = Math.ceil(FONT * dpr);
          const ctx = star.getContext("2d")!;
          ctx.scale(dpr, dpr);
          ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--vine").trim() || "#000";
          ctx.font = `${FONT}px ui-monospace, Menlo, monospace`;
          ctx.textAlign = "center";
          // centre it on its actual ink rather than the line box - "*" sits high, "@" doesn't
          const m = ctx.measureText(CHAR);
          ctx.fillText(CHAR, FONT / 2, FONT / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
        };

        p.setup = () => {
          canvas = p.createCanvas(1, 1).elt;
          fit();
          makeStar();
        };

        p.windowResized = fit;

        // runs every frame, but an empty frame is just two length checks
        p.draw = () => {
          const dt = Math.min(p.deltaTime, 100);
          stem = stem.filter((o) => (o.age += dt) < STEM_LIFE);
          sprigs = sprigs.filter((o) => (o.age += dt) < GROW + HOLD + WITHER);
          if (!stem.length && !sprigs.length) {
            // the cursor's been still long enough for everything to fade - start the next trail fresh
            // instead of drawing a stem from where this one stopped
            if (performance.now() - lastMove > STEM_LIFE) last = null;
            if (blank) return;
          }

          const ctx = p.drawingContext as CanvasRenderingContext2D;
          // draw in css px whatever p5's pixel density is
          const d = canvas.width / window.innerWidth;
          ctx.setTransform(d, 0, 0, d, 0, 0);
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
          blank = !stem.length && !sprigs.length;
          lit.fill(0);
          const offset = (CELL - FONT) / 2;
          const put = (x: number, y: number) => {
            if (x < 0 || y < 0 || x >= cols || y >= rows || lit[y * cols + x]) return;
            lit[y * cols + x] = 1;
            ctx.drawImage(star, x * CELL + offset, y * CELL + offset, FONT, FONT);
          };

          for (const o of stem) put(o.x, o.y);
          for (const o of sprigs) {
            // grows out from the root, then withers back from the tips
            const t =
              o.age < GROW ? o.age / GROW : o.age < GROW + HOLD ? 1 : 1 - (o.age - GROW - HOLD) / WITHER;
            const shown = Math.floor(o.size * Math.sqrt(t));
            for (let i = 0; i < shown; i++) put(o.x + o.dots[i * 2], o.y + o.dots[i * 2 + 1]);
          }
        };
      }, node);
    });

    return () => {
      cancelled = true;
      window.removeEventListener("pointermove", onMove);
      sketch?.remove();
    };
  }, []);

  return (
    <div ref={ref} className={styles.layer} aria-hidden="true" />
  );
}
