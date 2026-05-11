import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "API for Anything — Turn any website into a callable API";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #030712 0%, #0a1628 50%, #030712 100%)",
          padding: 80,
          position: "relative",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Glow accent */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(57,255,20,0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            filter: "blur(60px)",
            display: "flex",
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "linear-gradient(135deg, #39ff14, #10b981)",
              fontSize: 44,
              fontWeight: 800,
              color: "#030712",
            }}
          >
            A
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "white" }}>
            API for Anything
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 80,
          }}
        >
          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "white",
            }}
          >
            Turn any website into
          </div>
          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #39ff14, #6366f1)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            a callable API.
          </div>
        </div>

        {/* Subtext */}
        <div
          style={{
            marginTop: 32,
            fontSize: 28,
            color: "#94a3b8",
            display: "flex",
          }}
        >
          Describe in English. AI builds the workflow. You get JSON.
        </div>

        {/* Footer pill */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 80,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 20px",
            border: "1px solid rgba(57,255,20,0.4)",
            borderRadius: 999,
            background: "rgba(57,255,20,0.08)",
            fontSize: 20,
            color: "#39ff14",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#39ff14",
              display: "flex",
            }}
          />
          Open source · Self-hostable · MCP-native
        </div>
      </div>
    ),
    { ...size }
  );
}
