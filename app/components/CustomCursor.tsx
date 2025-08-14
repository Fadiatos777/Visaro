"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A smooth, modern circular cursor that follows the pointer with easing.
 * Color: #8D8D8D to match the site's palette.
 */
export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isDown, setIsDown] = useState(false);

  // Target and rendered positions for smoothing
  const targetX = useRef(0);
  const targetY = useRef(0);
  const posX = useRef(0);
  const posY = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      targetX.current = e.clientX;
      targetY.current = e.clientY;
      setIsVisible(true);
    };
    const onEnter = () => setIsVisible(true);
    const onLeave = () => setIsVisible(false);
    const onDown = () => setIsDown(true);
    const onUp = () => setIsDown(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("blur", onLeave, { passive: true });
    window.addEventListener("focus", onEnter, { passive: true });

    let raf = 0;
    const animate = () => {
      // Ease toward target for smoothness
      posX.current += (targetX.current - posX.current) * 0.18;
      posY.current += (targetY.current - posY.current) * 0.18;

      const el = cursorRef.current;
      if (el) {
        el.style.transform = `translate3d(${posX.current}px, ${posY.current}px, 0)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("focus", onEnter);
    };
  }, []);

  return (
    <>
      {/* Main cursor dot */}
      <div
        ref={cursorRef}
        aria-hidden
        className="visaro-cursor"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: "translate3d(-9999px, -9999px, 0)",
          // Scale when pressed for tactile feedback
          transition: isDown ? "opacity 120ms ease" : "opacity 180ms ease",
        }}
      />
    </>
  );
}


