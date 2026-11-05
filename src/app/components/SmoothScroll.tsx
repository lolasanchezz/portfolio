"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import Snap from "lenis/snap";
import "lenis/dist/lenis.css";

// eased, momentum-y scrolling site-wide (lenis). anything marked `data-snap` is a section the page
// settles onto when you stop scrolling close to it - that's what brings the projects fully into view
export default function SmoothScroll() {
  const pathname = usePathname();

  // rebuilt per page so it picks up that page's data-snap sections
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // anchors: the "projects <" style links glide to their section too.
    // lerp = how quickly the page catches up to your scroll (0.1 floaty ... 1 no smoothing)
    const lenis = new Lenis({ autoRaf: true, lerp: 0.16, anchors: true });
    // proximity = only snaps when you stop within 15% of a screen of a section, so it never traps you.
    // debounce = how long it waits after you stop before snapping, duration = how long the snap takes
    const snap = new Snap(lenis, { type: "proximity", distanceThreshold: "15%", debounce: 250, duration: 0.6 });
    snap.addElements([...document.querySelectorAll<HTMLElement>("[data-snap]")], { align: "start" });

    return () => {
      snap.destroy();
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
