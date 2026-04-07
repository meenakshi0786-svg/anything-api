"use client";

import { useEffect, useRef } from "react";

/**
 * Notte-style grid spotlight effect.
 * - Dot grid pattern across the page
 * - Dots near cursor light up with a radial gradient
 * - Creates a "flashlight on a grid" effect
 */
export function GridSpotlight() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = document.documentElement.scrollHeight;

    const resize = () => {
      width = window.innerWidth;
      height = document.documentElement.scrollHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);

    const DOT_SPACING = 40;
    const DOT_RADIUS = 1;
    const GLOW_RADIUS = 250;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.pageX, y: e.pageY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const mx = mouse.current.x;
      const my = mouse.current.y;

      // Only draw dots in a region around the viewport for performance
      const scrollY = window.scrollY;
      const startRow = Math.max(0, Math.floor((scrollY - GLOW_RADIUS) / DOT_SPACING));
      const endRow = Math.ceil((scrollY + window.innerHeight + GLOW_RADIUS) / DOT_SPACING);
      const startCol = 0;
      const endCol = Math.ceil(width / DOT_SPACING);

      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const x = col * DOT_SPACING;
          const y = row * DOT_SPACING;

          const dx = x - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let alpha = 0.06; // base dim dot
          let radius = DOT_RADIUS;

          if (dist < GLOW_RADIUS) {
            const intensity = 1 - dist / GLOW_RADIUS;
            alpha = 0.06 + intensity * 0.5;
            radius = DOT_RADIUS + intensity * 1.5;
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);

          if (dist < GLOW_RADIUS) {
            const intensity = 1 - dist / GLOW_RADIUS;
            // Blend from gray to brand purple/indigo near cursor
            const r = Math.round(100 + intensity * 99);
            const g = Math.round(100 + intensity * 60);
            const b = Math.round(120 + intensity * 141);
            ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          } else {
            ctx.fillStyle = `rgba(148,163,184,${alpha})`;
          }

          ctx.fill();
        }
      }

      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10 hidden md:block"
      style={{ opacity: 0.7 }}
    />
  );
}
