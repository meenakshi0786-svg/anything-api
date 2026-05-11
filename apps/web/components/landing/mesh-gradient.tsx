"use client";

/**
 * Animated mesh gradient background — Stripe / Linear style.
 * Pure CSS, no canvas. Looks expensive.
 */
export function MeshGradient() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {/* Top-right green orb */}
      <div
        className="absolute -right-[30%] -top-[20%] h-[80vh] w-[80vh] animate-mesh-1 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(57,255,20,0.12) 0%, rgba(16,185,129,0.06) 35%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Mid-left purple orb */}
      <div
        className="absolute -left-[25%] top-[40%] h-[70vh] w-[70vh] animate-mesh-2 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(139,92,246,0.10) 0%, rgba(99,102,241,0.05) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Bottom-right cyan orb */}
      <div
        className="absolute -right-[20%] bottom-[10%] h-[60vh] w-[60vh] animate-mesh-3 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(6,182,212,0.08) 0%, rgba(14,165,233,0.04) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse at center top, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center top, black 30%, transparent 80%)",
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
