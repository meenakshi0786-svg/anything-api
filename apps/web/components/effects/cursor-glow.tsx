"use client";

import { useEffect, useRef } from "react";

/**
 * Notte-style cursor glow effect.
 * - Large soft gradient orb follows the mouse
 * - Smooth lag for organic feel
 * - Spotlight illumination on dark backgrounds
 */
export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      // Smooth lerp — 0.08 gives a nice trailing feel
      pos.current.x += (target.current.x - pos.current.x) * 0.08;
      pos.current.y += (target.current.y - pos.current.y) * 0.08;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${pos.current.x - 300}px, ${pos.current.y - 300}px)`;
      }

      raf.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed top-0 left-0 z-30 hidden md:block"
      style={{
        width: 600,
        height: 600,
        background:
          "radial-gradient(circle, rgba(57,255,20,0.18) 0%, rgba(0,255,65,0.09) 30%, rgba(57,255,20,0.03) 50%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(40px)",
        willChange: "transform",
      }}
    />
  );
}
