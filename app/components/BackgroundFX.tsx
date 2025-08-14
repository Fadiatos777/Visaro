"use client";

import { useEffect, useRef } from "react";

/**
 * Teal (#509887) border-focused gradient with a soft inward glow pulse (every 5s).
 * Simple, comfortable, and elegant.
 */
export default function BackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const teal = "#509887";

    const start = performance.now();
    const draw = () => {
      const now = performance.now();
      const elapsed = now - start;
      const { innerWidth: w, innerHeight: h } = window;
      ctx.clearRect(0, 0, w, h);

      const maxR = Math.hypot(w, h);

      // Base vignette: stronger teal at edges, subtle at center
      const baseGrad = ctx.createRadialGradient(
        w / 2,
        h / 2,
        0,
        w / 2,
        h / 2,
        maxR
      );
      baseGrad.addColorStop(0.0, "rgba(80,152,135,0.02)");
      baseGrad.addColorStop(0.55, "rgba(80,152,135,0.07)");
      baseGrad.addColorStop(0.8, "rgba(80,152,135,0.16)");
      baseGrad.addColorStop(1.0, "rgba(80,152,135,0.34)");
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, w, h);

      // Water-drop style ripples from center outward.
      // Use two staggered ripples so there is no visible reset point.
      const ripplePeriod = 10000; // ms for one full travel center -> edge
      const rippleCount = 2;

      // Additive blend for glow effect
      const prevComp = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < rippleCount; i++) {
        const p = ((elapsed / ripplePeriod) + i / rippleCount) % 1; // 0..1
        const radius = p * maxR;
        const thickness = maxR * 0.12; // band thickness
        // Strength eases in/out and decays slightly as the ring expands
        const ease = Math.sin(Math.PI * p); // 0..1..0
        const strength = Math.max(0, ease) * (1 - p * 0.35); // fade as it grows

        const inner = Math.max(0, radius - thickness);
        const outer = radius + thickness;
        const ring = ctx.createRadialGradient(w / 2, h / 2, inner, w / 2, h / 2, outer);
        ring.addColorStop(0.0, "rgba(80,152,135,0)");
        ring.addColorStop(0.5, `rgba(80,152,135,${(0.45 * strength).toFixed(3)})`);
        ring.addColorStop(1.0, "rgba(80,152,135,0)");

        ctx.fillStyle = ring;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.globalCompositeOperation = prevComp;

      animationFrame.current = requestAnimationFrame(draw);
    };
    if (!prefersReduced) {
      animationFrame.current = requestAnimationFrame(draw);
    } else {
      // Static background fallback (no animations)
      const { innerWidth: w, innerHeight: h } = window;
      const grad = ctx.createRadialGradient(
        w * 0.7,
        h * 0.3,
        60,
        w * 0.7,
        h * 0.3,
        Math.max(w, h)
      );
      grad.addColorStop(0, "rgba(80,152,135,0.28)");
      grad.addColorStop(1, "rgba(80,152,135,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="visaro-bgfx"
      aria-hidden
    />
  );
}


