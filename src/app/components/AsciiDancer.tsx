"use client";

import { useEffect, useRef } from "react";

// from the ipod-website project - frames come from the ipod ad, turned into ascii in touchdesigner
type AsciiAnimation = {
  fps: number;
  frames: string[][];
};

// every dancer on the page shares one download of the frames, each frame joined into one string
// up front so playback is just swapping text
let framesRequest: Promise<{ fps: number; texts: string[] }> | null = null;
const loadFrames = () =>
  (framesRequest ??= fetch("/ascii-frames.json")
    .then((res) => res.json() as Promise<AsciiAnimation>)
    .then(({ fps, frames }) => ({ fps, texts: frames.map((f) => f.join("\n")) })));

// the text is written straight into the <pre> rather than through react state - re-rendering
// two 7,680-character blocks 30 times a second was a big chunk of the lag. it also stops while
// it's scrolled off screen or the tab is in the background
export default function AsciiDancer({ className, offset = 0 }: { className?: string; offset?: number }) {
  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // hold still on one frame for people who've asked for less motion
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cancelled = false;
    let texts: string[] = [];
    let fps = 30;
    let frame = 0;
    let visible = true;
    let timer = 0;

    const show = () => {
      el.textContent = texts[frame];
      frame = (frame + 1) % texts.length;
    };
    const sync = () => {
      window.clearInterval(timer);
      timer = 0;
      if (texts.length && visible && !document.hidden && !still) timer = window.setInterval(show, 1000 / fps);
    };

    loadFrames().then((data) => {
      if (cancelled) return;
      texts = data.texts;
      fps = data.fps;
      frame = ((offset % texts.length) + texts.length) % texts.length;
      show();
      sync();
    });

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [offset]);

  return <pre ref={ref} className={className} aria-hidden="true" />;
}
