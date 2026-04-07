"use client";

/**
 * Notte-style ambient background.
 * - Dark base with subtle noise texture
 * - Floating aurora / nebula gradient blobs
 * - Slow-moving glowing orbs
 * - Grid overlay for depth
 */
export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* ─── Base noise texture overlay ──────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* ─── Top aurora / nebula glow ────────────────────── */}
      <div
        className="absolute -top-[400px] left-1/2 -translate-x-1/2 animate-aurora-1"
        style={{
          width: "1200px",
          height: "800px",
          background:
            "radial-gradient(ellipse at center, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.06) 35%, rgba(139,92,246,0.04) 60%, transparent 80%)",
          filter: "blur(80px)",
        }}
      />

      {/* ─── Left nebula blob ────────────────────────────── */}
      <div
        className="absolute -left-[200px] top-[20%] animate-aurora-2"
        style={{
          width: "700px",
          height: "700px",
          background:
            "radial-gradient(ellipse at center, rgba(34,197,94,0.08) 0%, rgba(16,185,129,0.05) 40%, transparent 70%)",
          filter: "blur(100px)",
          borderRadius: "50%",
        }}
      />

      {/* ─── Right nebula blob ───────────────────────────── */}
      <div
        className="absolute -right-[200px] top-[40%] animate-aurora-3"
        style={{
          width: "800px",
          height: "600px",
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,0.07) 0%, rgba(168,85,247,0.04) 40%, transparent 70%)",
          filter: "blur(100px)",
          borderRadius: "50%",
        }}
      />

      {/* ─── Center highlight for hero section ───────────── */}
      <div
        className="absolute top-[5%] left-1/2 -translate-x-1/2"
        style={{
          width: "900px",
          height: "500px",
          background:
            "radial-gradient(ellipse at center, rgba(57,255,20,0.04) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />

      {/* ─── Floating orbs ───────────────────────────────── */}
      <div
        className="absolute top-[15%] left-[15%] animate-float-1"
        style={{
          width: "6px",
          height: "6px",
          background: "rgba(57,255,20,0.6)",
          borderRadius: "50%",
          boxShadow: "0 0 20px 8px rgba(57,255,20,0.15)",
        }}
      />
      <div
        className="absolute top-[25%] right-[20%] animate-float-2"
        style={{
          width: "4px",
          height: "4px",
          background: "rgba(99,102,241,0.5)",
          borderRadius: "50%",
          boxShadow: "0 0 15px 6px rgba(99,102,241,0.12)",
        }}
      />
      <div
        className="absolute top-[45%] left-[60%] animate-float-3"
        style={{
          width: "5px",
          height: "5px",
          background: "rgba(16,185,129,0.5)",
          borderRadius: "50%",
          boxShadow: "0 0 18px 7px rgba(16,185,129,0.12)",
        }}
      />
      <div
        className="absolute top-[65%] left-[25%] animate-float-2"
        style={{
          width: "3px",
          height: "3px",
          background: "rgba(255,255,255,0.4)",
          borderRadius: "50%",
          boxShadow: "0 0 12px 5px rgba(255,255,255,0.08)",
        }}
      />
      <div
        className="absolute top-[55%] right-[30%] animate-float-1"
        style={{
          width: "4px",
          height: "4px",
          background: "rgba(57,255,20,0.4)",
          borderRadius: "50%",
          boxShadow: "0 0 14px 5px rgba(57,255,20,0.1)",
        }}
      />

      {/* ─── Subtle grid overlay for depth ───────────────── */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ─── Bottom fade to solid for content sections ──── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[300px]"
        style={{
          background: "linear-gradient(to top, rgb(3,7,18) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
