"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import styles from "./crawler.module.css";

// a little ascii spider that follows the cursor, after the "web crawlers /[•]\ js x css" reel: its
// legs reach out and grab the links, tags and bits of text nearby, and whatever it's holding gets a
// soft tint with its href / text decoding underneath, strung together with a web. it's drawn on a
// character grid like the vines, in the dancers' purple

const TARGETS = "a, button, li, h1, h2, h3, p, figcaption, code, img, [data-crawl]";
const MAX_W = 560; // anything bigger (whole cards, long paragraphs) is too big to grab - its insides aren't
const MAX_H = 160;
const CELL = 7; // css px per character cell, same as the vines
const FONT = 11; // px size of each character - a bit bigger than a cell so lines read as one stroke
const REACH = 190; // px a leg can stretch to grab something
const REST = 56; // px out a leg plants when there's nothing to hold
const STEP = 170; // ms for a leg to take a step
const SPEED = 0.08; // px per ms it crawls at, flat out (80px a second) - it trails the cursor rather than lunging at it
const EASE = 250; // ms to get up to speed or slow to a stop
const FADE = 700; // ms a highlight lingers after it's let go
const DECODE = 380; // ms for a label to unscramble
const GLYPHS = "!<>-_\\/[]{}=+*^?#01";

// the body: a square of characters, with the legs coming out of its sides
const BODY = ["/--\\", "|@@|", "|@@|", "\\--/"];

// 8 legs, 4 a side, as angles from straight up (clockwise). each leg only grabs things in its own
// slice of the circle - nearer its angle than any other leg's - so the legs never cross
const LEGS = [-140, -105, -75, -40, 40, 75, 105, 140].map((d) => (d * Math.PI) / 180);
const SIDE = LEGS.slice(4); // one side's angles, front to back
const GIVE = 0.07; // radians a held foot can stray into the next leg's slice before letting go
// it walks like a real spider, in two alternating sets of four - front-left with second-right and so
// on - taking turns: one set steps while the other keeps its feet down
const gait = (home: number) => (SIDE.indexOf(Math.abs(home)) + (home > 0 ? 1 : 0)) % 2;

type Leg = {
  home: number;
  el: Element | null;
  // where the foot is: an offset from el's box while it's holding something (so it rides along when
  // the page scrolls), otherwise a point on screen
  x: number;
  y: number;
  // the step in progress, from where the foot was to x/y
  fromX: number;
  fromY: number;
  t: number;
};

type Glow = { born: number; gone: number | null; label: string };

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
// how far apart two angles are, the short way round
const apart = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
// the leg whose slice an angle falls in
const owner = (angle: number) => LEGS.reduce((best, home, i) => (apart(angle, home) < apart(angle, LEGS[best]) ? i : best), 0);

// the short "identifier" each thing shows when it's grabbed
const labelFor = (el: Element) => {
  const href = el.getAttribute("href");
  const text = href
    ? href.replace(/^https?:\/\/(www\.)?/, "").replace(/^mailto:/, "")
    : el instanceof HTMLImageElement
      ? el.alt
      : (el.textContent ?? "");
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > 26 ? `${flat.slice(0, 25)}…` : flat;
};

// only mice/trackpads get a spider - on phones and tablets there's no cursor for it to follow
const FINE = "(pointer: fine)";
const onPointerChange = (cb: () => void) => {
  const query = window.matchMedia(FINE);
  query.addEventListener("change", cb);
  return () => query.removeEventListener("change", cb);
};

// no spider on the admin editor - it grabs inputs and buttons and gets in the way there
export default function Crawler() {
  const pathname = usePathname();
  const fine = useSyncExternalStore(onPointerChange, () => window.matchMedia(FINE).matches, () => false);
  if (!fine || pathname.startsWith("/admin")) return null;
  return <CrawlerCanvas />;
}

function CrawlerCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (still.matches || !ref.current) return;

    const canvas = ref.current;
    const ctx = canvas.getContext("2d")!;
    const css = getComputedStyle(document.documentElement);
    const accent = css.getPropertyValue("--accent").trim() || "#5b51e8";
    const tint = css.getPropertyValue("--lavender").trim() || "#ecebfd";
    const muted = css.getPropertyValue("--muted").trim() || "#555";

    // set whenever something might have moved under the spider - while nothing has, it stops
    // redrawing (see `calm` in draw)
    let dirty = true;
    const wake = () => {
      dirty = true;
    };
    // capture, so sideways scrolling in the projects strip counts too
    document.addEventListener("scroll", wake, { capture: true, passive: true });

    let elements: Element[] = [];
    const collect = () => {
      elements = [...document.querySelectorAll(TARGETS)];
      dirty = true;
    };
    collect();
    // pages change under it (client-side navigation, the admin editor), so look again now and then
    const recollect = window.setInterval(collect, 1000);

    let cols = 0;
    let rows = 0;
    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      cols = Math.ceil(window.innerWidth / CELL) + 1;
      rows = Math.ceil(window.innerHeight / CELL) + 1;
      dirty = true;
    };
    fit();
    window.addEventListener("resize", fit);

    let cursor: { x: number; y: number } | null = null;
    const body = { x: 0, y: 0, vx: 0, vy: 0 };
    let legs: Leg[] = [];
    const glows = new Map<Element, Glow>();
    let phase = 0; // which set of legs' turn it is to step

    // where a leg joins the body: down the sides of the box, front legs at the top. in px, on the grid
    const hip = (home: number) => {
      const bx = Math.round(body.x / CELL);
      const by = Math.round(body.y / CELL);
      const row = SIDE.indexOf(Math.abs(home));
      return { x: (home > 0 ? bx + 2 : bx - 3) * CELL, y: (by - 2 + row) * CELL };
    };
    // where a leg plants when it isn't holding anything
    const rest = (home: number) => {
      const h = hip(home);
      return { x: h.x + Math.sin(home) * REST, y: h.y - Math.cos(home) * REST };
    };

    const onMove = (e: PointerEvent) => {
      if (!cursor) {
        // land on the cursor with the legs planted around it, rather than flying in from the corner
        body.x = e.clientX;
        body.y = e.clientY;
        legs = LEGS.map((home) => {
          const { x, y } = rest(home);
          return { home, el: null, x, y, fromX: x, fromY: y, t: 1 };
        });
      }
      cursor = { x: e.clientX, y: e.clientY };
      dirty = true;
    };
    // off the page - curl up until it comes back
    const onLeave = () => {
      cursor = null;
      legs = [];
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    const foot = (leg: Leg, rects: Map<Element, DOMRect>) => {
      const r = leg.el && rects.get(leg.el);
      const x = r ? r.left + leg.x : leg.x;
      const y = r ? r.top + leg.y : leg.y;
      const e = 1 - (1 - leg.t) ** 3;
      return { x: leg.fromX + (x - leg.fromX) * e, y: leg.fromY + (y - leg.fromY) * e };
    };

    // start a step from wherever the foot is now
    const step = (leg: Leg, rects: Map<Element, DOMRect>, el: Element | null, x: number, y: number) => {
      const from = foot(leg, rects);
      Object.assign(leg, { el, x, y, fromX: from.x, fromY: from.y, t: 0 });
    };

    // the character grid for this frame: cell index -> character
    const grid = new Map<number, string>();
    const web = new Map<number, string>();
    const plot = (cells: Map<number, string>, x: number, y: number, ch: string) => {
      const cx = Math.round(x / CELL);
      const cy = Math.round(y / CELL);
      if (cx >= 0 && cy >= 0 && cx < cols && cy < rows) cells.set(cy * cols + cx, ch);
    };
    // a straight run of characters, picked by its slope: - | / \
    const line = (cells: Map<number, string>, x0: number, y0: number, x1: number, y1: number, ch?: string) => {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const glyph =
        ch ??
        (Math.abs(dy) < Math.abs(dx) * 0.42 ? "-" : Math.abs(dx) < Math.abs(dy) * 0.42 ? "|" : dx > 0 === dy > 0 ? "\\" : "/");
      const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / CELL));
      for (let i = 0; i <= n; i += ch ? 2 : 1) plot(cells, x0 + (dx * i) / n, y0 + (dy * i) / n, glyph);
    };

    let last = performance.now();
    let frame = 0;
    let blank = false; // canvas already cleared, nothing to redo
    let calm = 0; // frames in a row where nothing moved
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      const dt = Math.min(now - last, 100);
      last = now;
      if (!cursor && !glows.size) {
        if (!blank) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          blank = true;
        }
        return;
      }
      blank = false;

      // sitting still with every foot down and every label decoded: the last frame is still right,
      // so skip measuring the page and redrawing until the cursor or page moves. it waits a few
      // frames first so both leg sets get a turn to settle
      const settled =
        !dirty &&
        Math.hypot(body.vx, body.vy) < 0.002 &&
        legs.every((l) => l.t >= 1) &&
        [...glows.values()].every((g) => g.gone === null && now - g.born > DECODE);
      calm = settled ? calm + 1 : 0;
      dirty = false;
      if (calm > 3) return;

      // everything grabbable within reach, nearest first. rects are re-read every frame since the
      // page scrolls under the spider
      const rects = new Map<Element, DOMRect>();
      const near: { el: Element; x: number; y: number; d: number }[] = [];
      if (cursor) {
        // crawl towards the cursor at a walking pace, slowing down over the last few steps. velocity
        // is in px per ms, and eases so it never jumps from standing to full speed
        const dx = cursor.x - body.x;
        const dy = cursor.y - body.y;
        const dist = Math.hypot(dx, dy);
        const pace = dist > 2 ? Math.min(SPEED, dist / 400) / dist : 0;
        const ease = Math.min(1, dt / EASE);
        body.vx += (dx * pace - body.vx) * ease;
        body.vy += (dy * pace - body.vy) * ease;
        body.x += body.vx * dt;
        body.y += body.vy * dt;
        for (const el of elements) {
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height || r.width > MAX_W || r.height > MAX_H) continue;
          const x = clamp(body.x, r.left, r.right);
          const y = clamp(body.y, r.top, r.bottom);
          const d = Math.hypot(x - body.x, y - body.y);
          if (d > REACH) continue;
          rects.set(el, r);
          near.push({ el, x, y, d });
        }
        near.sort((a, b) => a.d - b.d);
      }

      // legs hang on to what they've got until it's out of reach or has drifted into the next
      // leg's slice...
      for (const leg of legs) {
        if (!leg.el) continue;
        const f = foot(leg, rects);
        const angle = Math.atan2(f.x - body.x, body.y - f.y);
        const theirs = LEGS[owner(angle)];
        if (
          !rects.has(leg.el) ||
          Math.hypot(f.x - body.x, f.y - body.y) > REACH * 1.15 ||
          apart(angle, leg.home) > apart(angle, theirs) + GIVE
        ) {
          Object.assign(leg, { el: null, x: f.x, y: f.y, fromX: f.x, fromY: f.y, t: 1 });
        }
      }
      const free = (leg: Leg) => gait(leg.home) === phase;
      // ...then whichever leg's slice something falls in reaches for it, if that leg's free. nested
      // things (a link in a list item) count as one, so it doesn't grab the same spot twice
      for (const n of near) {
        const leg = legs[owner(Math.atan2(n.x - body.x, body.y - n.y))];
        if (!leg || leg.el || !free(leg)) continue;
        const taken = legs.filter((l) => l.el).map((l) => l.el!);
        if (taken.some((el) => el === n.el || el.contains(n.el) || n.el.contains(el))) continue;
        const r = rects.get(n.el)!;
        // grab the nearest edge, or if the spider's right on top of it, the spot under the leg's rest
        const spot = rest(leg.home);
        const x = n.d ? n.x : clamp(spot.x, r.left, r.right);
        const y = n.d ? n.y : clamp(spot.y, r.top, r.bottom);
        step(leg, rects, n.el, x - r.left, y - r.top);
      }
      // the rest walk along with the body, each stepping out ahead of where the body's going whenever
      // it trails too far behind
      for (const leg of legs) {
        if (leg.el || leg.t < 1 || !free(leg)) continue;
        const spot = rest(leg.home);
        const f = foot(leg, rects);
        if (Math.hypot(f.x - spot.x, f.y - spot.y) > REST * 0.3) {
          step(leg, rects, null, spot.x + body.vx * STEP * 1.5, spot.y + body.vy * STEP * 1.5);
        }
      }
      for (const leg of legs) leg.t = Math.min(1, leg.t + dt / STEP);
      // once this set's feet are all down, it's the other set's turn
      if (!legs.some((l) => gait(l.home) === phase && l.t < 1)) phase ^= 1;

      // whatever a foot has landed on gets tinted; whatever's been let go fades
      const holding = new Set(legs.filter((l) => l.el && l.t >= 1).map((l) => l.el!));
      for (const el of holding) {
        const glow = glows.get(el);
        if (glow) glow.gone = null;
        else glows.set(el, { born: now, gone: null, label: labelFor(el) });
      }
      for (const [el, glow] of glows) {
        if (!holding.has(el) && glow.gone === null) glow.gone = now;
        if (glow.gone !== null && now - glow.gone > FADE) glows.delete(el);
      }

      const dpr = canvas.width / window.innerWidth;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // highlights: a pale wash (the canvas multiplies, so text under it stays dark), corner ticks,
      // and the label decoding from noise underneath
      ctx.font = `10px ui-monospace, Menlo, monospace`;
      ctx.textAlign = "start";
      ctx.textBaseline = "top";
      ctx.lineWidth = 1;
      for (const [el, glow] of glows) {
        const r = rects.get(el) ?? el.getBoundingClientRect();
        const alpha = glow.gone === null ? 1 : 1 - (now - glow.gone) / FADE;
        const [l, t, rr, b] = [r.left - 3, r.top - 2, r.right + 3, r.bottom + 2];
        ctx.globalAlpha = alpha;
        ctx.fillStyle = tint;
        ctx.fillRect(l, t, rr - l, b - t);
        const k = Math.min(6, (rr - l) / 3, (b - t) / 3);
        ctx.globalAlpha = alpha * 0.7;
        ctx.strokeStyle = accent;
        ctx.beginPath();
        for (const [x, y, sx, sy] of [[l, t, 1, 1], [rr, t, -1, 1], [l, b, 1, -1], [rr, b, -1, -1]]) {
          ctx.moveTo(x + sx * k, y);
          ctx.lineTo(x, y);
          ctx.lineTo(x, y + sy * k);
        }
        ctx.stroke();

        const shown = Math.floor(glow.label.length * Math.min(1, (now - glow.born) / DECODE));
        let label = glow.label.slice(0, shown);
        for (let i = shown; i < glow.label.length; i++) {
          label += glow.label[i] === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        const w = ctx.measureText(label).width;
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = muted;
        ctx.fillText(label, clamp(l, 2, window.innerWidth - w - 2), b + 14 > window.innerHeight ? t - 13 : b + 3);
      }
      if (!cursor) return;

      // the spider itself, as characters on the grid. the web goes down first, so legs draw over it
      grid.clear();
      web.clear();
      const feet = legs.map((leg) => ({ leg, ...foot(leg, rects) }));
      const anchored = feet.filter((f) => f.leg.el);
      for (let i = 0; i < anchored.length - (anchored.length > 2 ? 0 : 1); i++) {
        const a = anchored[i];
        const b = anchored[(i + 1) % anchored.length];
        line(web, a.x, a.y, b.x, b.y, ".");
      }
      // legs: hip -> knee -> foot, every knee bent up like a /\ - the classic ascii spider - so
      // neighbouring legs stack instead of crossing. a leg pointing straight down bends outwards.
      // a stepping leg lifts its knee higher
      for (const { leg, x, y } of feet) {
        const h = hip(leg.home);
        const vx = x - h.x;
        const vy = y - h.y;
        const d = Math.hypot(vx, vy) || 1;
        let nx = -vy / d;
        let ny = vx / d;
        if (-ny + 0.3 * nx * Math.sign(Math.sin(leg.home)) < 0) {
          nx = -nx;
          ny = -ny;
        }
        const bow = Math.max(7, d * 0.38) + Math.sin(Math.PI * leg.t) * 10;
        const kx = h.x + vx * 0.4 + nx * bow;
        const ky = h.y + vy * 0.4 + ny * bow;
        line(grid, h.x, h.y, kx, ky);
        line(grid, kx, ky, x, y);
        plot(grid, kx, ky, "o");
        plot(grid, x, y, "*");
      }
      const bx = Math.round(body.x / CELL);
      const by = Math.round(body.y / CELL);
      BODY.forEach((row, j) => [...row].forEach((ch, i) => plot(grid, (bx - 2 + i) * CELL, (by - 2 + j) * CELL, ch)));

      ctx.font = `${FONT}px ui-monospace, Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = accent;
      for (const [cells, alpha] of [[web, 0.35], [grid, 0.85]] as const) {
        ctx.globalAlpha = alpha;
        for (const [key, ch] of cells) {
          if (cells === web && grid.has(key)) continue;
          ctx.fillText(ch, (key % cols) * CELL, Math.floor(key / cols) * CELL);
        }
      }
      ctx.globalAlpha = 1;
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(recollect);
      document.removeEventListener("scroll", wake, { capture: true });
      window.removeEventListener("resize", fit);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className={styles.layer} aria-hidden="true" />;
}
