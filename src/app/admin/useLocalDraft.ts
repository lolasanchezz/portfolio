"use client";

import { useEffect, useRef } from "react";

// keeps a copy of unsaved editor state in localStorage on every change, so a reload, crash or
// closed tab doesn't lose anything. saving to disk (dirty -> false) clears the copy.
// on load, a leftover copy is handed to `restore`.
export function useLocalDraft<T>(key: string, value: T, dirty: boolean, restore: (draft: T, at: Date) => void) {
  // false until the first write-effect run has passed - that run happens before a restored
  // draft has landed in state, so it must not overwrite (or clear) the saved copy
  const started = useRef(false);
  // only ever called once, on load, so the first one passed in is the one we keep
  const restoreRef = useRef(restore);

  // once, on load: bring back anything left over from last time
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw) as { value: T; at: string };
        restoreRef.current(saved.value, new Date(saved.at));
      }
    } catch {
      // storage blocked or the copy is unreadable - start from what's on disk
    }
  }, [key]);

  // every change after that: write it down, or clear it once everything is saved
  useEffect(() => {
    if (!started.current) {
      started.current = true;
      return;
    }
    try {
      if (dirty) localStorage.setItem(key, JSON.stringify({ value, at: new Date().toISOString() }));
      else localStorage.removeItem(key);
    } catch {
      // storage full or blocked - nothing to do but keep going
    }
  }, [key, value, dirty]);

  // throw away the local copy and go back to what's on disk
  return () => {
    try {
      localStorage.removeItem(key);
    } catch {}
    window.location.reload();
  };
}

export const restoredNote = (at: Date) =>
  `restored unsaved changes from ${at.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`;
