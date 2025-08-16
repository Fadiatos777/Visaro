"use client";

import { useEffect, useRef } from "react";

/**
 * Teal (#509887) border-focused gradient with a soft inward glow pulse (every 5s).
 * Simple, comfortable, and elegant.
 */
export default function BackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrame = useRef<number | null>(null);
  const lastCycleRef = useRef<number>(-1);

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

    // Offscreen blueprint canvas (regenerated per pulse cycle)
    const bp = document.createElement("canvas");
    const bpCtx = bp.getContext("2d", { alpha: true })!;
    const sizeBlueprint = () => {
      const { innerWidth: w, innerHeight: h } = window;
      bp.width = Math.floor(w * DPR);
      bp.height = Math.floor(h * DPR);
      bpCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    sizeBlueprint();

    const start = performance.now();

    // Seedable PRNG
    const mulberry32 = (seed: number) => {
      let t = seed >>> 0;
      return () => {
        t |= 0; t = (t + 0x6D2B79F5) | 0;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
      };
    };

    const drawBlueprint = (seed: number) => {
      const { innerWidth: w, innerHeight: h } = window;
      bpCtx.clearRect(0, 0, w, h);
      const rnd = mulberry32(seed);

      // Grid
      bpCtx.save();
      bpCtx.strokeStyle = "rgba(80,152,135,0.08)";
      bpCtx.lineWidth = 1;
      const spacing = 48;
      for (let x = spacing / 2; x < w; x += spacing) { bpCtx.beginPath(); bpCtx.moveTo(x, 0); bpCtx.lineTo(x, h); bpCtx.stroke(); }
      for (let y = spacing / 2; y < h; y += spacing) { bpCtx.beginPath(); bpCtx.moveTo(0, y); bpCtx.lineTo(w, y); bpCtx.stroke(); }
      bpCtx.restore();

      // Nodes
      const nodeCount = 6 + Math.floor(rnd() * 6);
      const nodes: Array<{x:number,y:number}> = [];
      for (let i = 0; i < nodeCount; i++) nodes.push({ x: w * (0.15 + rnd() * 0.7), y: h * (0.2 + rnd() * 0.6) });

      // Connections
      bpCtx.globalCompositeOperation = "lighter";
      bpCtx.strokeStyle = "rgba(80,152,135,0.18)";
      bpCtx.lineWidth = 2;
      bpCtx.setLineDash([8, 6]);
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i];
        const b = nodes[Math.floor(rnd() * nodes.length)];
        const mx = (a.x + b.x) / 2 + (rnd() - 0.5) * 60;
        const my = (a.y + b.y) / 2 + (rnd() - 0.5) * 60;
        bpCtx.beginPath(); bpCtx.moveTo(a.x, a.y); bpCtx.quadraticCurveTo(mx, my, b.x, b.y); bpCtx.stroke();
      }
      bpCtx.setLineDash([]);

      // Node circles
      for (const n of nodes) {
        const r = 6 + rnd() * 10;
        const grad = bpCtx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2);
        grad.addColorStop(0, "rgba(80,152,135,0.5)"); grad.addColorStop(1, "rgba(80,152,135,0)");
        bpCtx.fillStyle = grad; bpCtx.beginPath(); bpCtx.arc(n.x, n.y, r * 2, 0, Math.PI * 2); bpCtx.fill();
        bpCtx.strokeStyle = "rgba(80,152,135,0.6)"; bpCtx.lineWidth = 1.5; bpCtx.beginPath(); bpCtx.arc(n.x, n.y, r, 0, Math.PI * 2); bpCtx.stroke();
      }

      // Arcs
      const arcCount = 3 + Math.floor(rnd() * 4);
      bpCtx.strokeStyle = "rgba(80,152,135,0.15)";
      for (let i = 0; i < arcCount; i++) {
        const cx = w * rnd(); const cy = h * rnd(); const rad = 80 + rnd() * Math.min(w, h) * 0.25;
        const a0 = rnd() * Math.PI * 2; const a1 = a0 + (Math.PI * 0.3 + rnd() * Math.PI * 0.5);
        bpCtx.beginPath(); bpCtx.arc(cx, cy, rad, a0, a1); bpCtx.stroke();
      }
    };
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

      // Blueprint: regenerate per pulse cycle
      const pulsePeriod = 6000;
      const cycle = Math.floor(elapsed / pulsePeriod);
      if (cycle !== lastCycleRef.current) { lastCycleRef.current = cycle; drawBlueprint(cycle + 1337); }

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

      // Fade blueprint with pulse
      const within = (elapsed % 6000) / 6000;
      const pulseEase = Math.sin(within * Math.PI);
      const bpAlpha = 0.18 * pulseEase;
      if (bpAlpha > 0.001) { ctx.save(); ctx.globalAlpha = bpAlpha; ctx.globalCompositeOperation = "lighter"; ctx.drawImage(bp, 0, 0, w, h); ctx.restore(); }

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


