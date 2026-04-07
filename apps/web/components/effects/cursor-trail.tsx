"use client";

import { useEffect, useRef } from "react";

/**
 * Notte-style cursor particle trail.
 * - Small glowing particles spawn at cursor position
 * - They drift outward, shrink, and fade
 * - Creates a sparkle/comet-tail effect on movement
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -1000, y: -1000 });
  const lastMouse = useRef({ x: -1000, y: -1000 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    const spawnParticles = () => {
      const dx = mouse.current.x - lastMouse.current.x;
      const dy = mouse.current.y - lastMouse.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);

      // Spawn more particles when moving faster
      const count = Math.min(3, Math.floor(speed / 8));

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 0.3 + Math.random() * 1.2;
        particles.current.push({
          x: mouse.current.x + (Math.random() - 0.5) * 8,
          y: mouse.current.y + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 0.3, // slight upward drift
          life: 0,
          maxLife: 30 + Math.random() * 40,
          size: 1.5 + Math.random() * 2.5,
          hue: 0, // white (achromatic)
        });
      }

      lastMouse.current = { ...mouse.current };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      spawnParticles();

      // Update and draw particles
      particles.current = particles.current.filter((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;

        const progress = p.life / p.maxLife;
        const alpha = 1 - progress;
        const size = p.size * (1 - progress * 0.5);

        if (alpha <= 0) return false;

        // Glowing dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);

        const gradient = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, size
        );
        gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
        gradient.addColorStop(0.5, `rgba(220,220,220,${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(200,200,200,0)`);

        ctx.fillStyle = gradient;
        ctx.fill();

        return true;
      });

      // Cap particle count for performance
      if (particles.current.length > 150) {
        particles.current = particles.current.slice(-150);
      }

      raf.current = requestAnimationFrame(animate);
    };

    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40 hidden md:block"
    />
  );
}
