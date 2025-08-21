"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Global page transition overlay: briefly fades to opaque over the app
 * on route change, then fades out to reveal the next page.
 */
export default function PageTransitions() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isOpaque, setIsOpaque] = useState(false);
  const timeoutsRef = useRef<number[]>([]);
  const reducedRef = useRef<boolean>(false);

  // Respect reduced motion
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      }
    } catch {
      reducedRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Skip the very first render (initial load) to avoid flash
    const hasMountedKey = "__visaro_pt_mounted";
    const isFirst = typeof window !== "undefined" && !(hasMountedKey in window);
    if (isFirst) {
      // @ts-ignore
      (window as any)[hasMountedKey] = true;
      setIsVisible(false);
      setIsOpaque(false);
      return;
    }

    // Clear any pending timers on re-run/unmount
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];

    if (reducedRef.current) {
      // Skip transitions entirely when reduced motion is preferred
      setIsVisible(false);
      setIsOpaque(false);
      return;
    }

    // Begin transition: show overlay and fade it in next frame
    setIsVisible(true);
    const t1 = window.setTimeout(() => {
      setIsOpaque(true);
    }, 0);

    // After fade-in completes, immediately fade out
    const FADE_IN_MS = 140;
    const HOLD_MS = 40; // brief hold while opaque
    const t2 = window.setTimeout(() => {
      setIsOpaque(false);
      // After fade-out completes, hide overlay
      const FADE_OUT_MS = 260;
      const t3 = window.setTimeout(() => {
        setIsVisible(false);
      }, FADE_OUT_MS);
      timeoutsRef.current.push(t3);
    }, FADE_IN_MS + HOLD_MS);

    timeoutsRef.current.push(t1, t2);

    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, [pathname]);

  return (
    <div
      aria-hidden
      className={`visaro-fade-overlay${isVisible ? " is-visible" : ""}${isOpaque ? " is-opaque" : ""}`}
    />
  );
}


