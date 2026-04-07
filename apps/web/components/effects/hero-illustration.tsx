"use client";

/**
 * Hero illustration: a stylized depiction of
 * "website → AI agent → structured API"
 * Animated SVG with glowing connections.
 */
export function HeroIllustration() {
  return (
    <div className="relative mx-auto mt-20 w-full max-w-4xl px-6">
      <svg
        viewBox="0 0 900 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
      >
        {/* ─── Glow filters ──────────────────────────────── */}
        <defs>
          <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#39ff14" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#39ff14" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="card-border" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#39ff14" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* ─── Card 1: Website (left) ────────────────────── */}
        <g>
          <rect x="30" y="60" width="220" height="200" rx="16" fill="#0f172a" stroke="url(#card-border)" strokeWidth="1.5" />
          {/* Browser chrome */}
          <rect x="30" y="60" width="220" height="36" rx="16" fill="#1e293b" />
          <rect x="30" y="80" width="220" height="16" fill="#1e293b" />
          <circle cx="52" cy="78" r="5" fill="#ef4444" opacity="0.7" />
          <circle cx="68" cy="78" r="5" fill="#eab308" opacity="0.7" />
          <circle cx="84" cy="78" r="5" fill="#22c55e" opacity="0.7" />
          <rect x="100" y="73" width="120" height="10" rx="5" fill="#0f172a" />
          {/* Content lines */}
          <rect x="50" y="110" width="140" height="8" rx="4" fill="#1e293b" />
          <rect x="50" y="128" width="100" height="8" rx="4" fill="#1e293b" />
          <rect x="50" y="150" width="180" height="24" rx="6" fill="#39ff1410" stroke="#39ff14" strokeWidth="0.5" opacity="0.5" />
          <text x="85" y="166" fill="#39ff14" fontSize="10" fontFamily="monospace" opacity="0.7">$29.99</text>
          <rect x="50" y="184" width="80" height="8" rx="4" fill="#1e293b" />
          <rect x="50" y="200" width="160" height="8" rx="4" fill="#1e293b" />
          <rect x="50" y="216" width="120" height="8" rx="4" fill="#1e293b" />
          <text x="90" y="52" fill="#94a3b8" fontSize="11" fontFamily="system-ui" textAnchor="middle" fontWeight="600">Any Website</text>
        </g>

        {/* ─── Animated connection line 1 ────────────────── */}
        <g filter="url(#glow-green)">
          <line x1="250" y1="160" x2="340" y2="160" stroke="#39ff14" strokeWidth="2" strokeDasharray="6 4" opacity="0.6">
            <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1.5s" repeatCount="indefinite" />
          </line>
          {/* Arrow */}
          <polygon points="338,153 352,160 338,167" fill="#39ff14" opacity="0.6" />
        </g>

        {/* ─── Card 2: AI Agent (center) ─────────────────── */}
        <g>
          <rect x="340" y="70" width="220" height="180" rx="16" fill="#0f172a" stroke="url(#card-border)" strokeWidth="1.5" />
          {/* Brain / AI icon */}
          <circle cx="450" cy="130" r="30" fill="#6366f110" stroke="#6366f1" strokeWidth="1" opacity="0.5" />
          <text x="450" y="137" fill="#a5b4fc" fontSize="28" textAnchor="middle">&#x2728;</text>
          {/* Neural connections */}
          <circle cx="420" cy="175" r="3" fill="#39ff14" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="450" cy="185" r="3" fill="#6366f1" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="480" cy="175" r="3" fill="#39ff14" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <line x1="420" y1="175" x2="450" y2="185" stroke="#39ff14" strokeWidth="0.5" opacity="0.3" />
          <line x1="450" y1="185" x2="480" y2="175" stroke="#6366f1" strokeWidth="0.5" opacity="0.3" />
          <text x="450" y="215" fill="#94a3b8" fontSize="10" fontFamily="system-ui" textAnchor="middle">Navigate, Extract, Transform</text>
          <text x="450" y="62" fill="#a5b4fc" fontSize="11" fontFamily="system-ui" textAnchor="middle" fontWeight="600">AI Agent</text>
        </g>

        {/* ─── Animated connection line 2 ────────────────── */}
        <g filter="url(#glow-green)">
          <line x1="560" y1="160" x2="650" y2="160" stroke="#39ff14" strokeWidth="2" strokeDasharray="6 4" opacity="0.6">
            <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1.5s" repeatCount="indefinite" />
          </line>
          <polygon points="648,153 662,160 648,167" fill="#39ff14" opacity="0.6" />
        </g>

        {/* ─── Card 3: JSON API (right) ──────────────────── */}
        <g>
          <rect x="650" y="60" width="220" height="200" rx="16" fill="#0f172a" stroke="url(#card-border)" strokeWidth="1.5" />
          {/* JSON content */}
          <text x="670" y="96" fill="#39ff14" fontSize="10" fontFamily="monospace" opacity="0.9">{"{"}</text>
          <text x="685" y="114" fill="#94a3b8" fontSize="10" fontFamily="monospace">"title"<tspan fill="#475569">:</tspan> <tspan fill="#fbbf24">"AirPods Pro"</tspan></text>
          <text x="685" y="132" fill="#94a3b8" fontSize="10" fontFamily="monospace">"price"<tspan fill="#475569">:</tspan> <tspan fill="#a78bfa">189.99</tspan></text>
          <text x="685" y="150" fill="#94a3b8" fontSize="10" fontFamily="monospace">"rating"<tspan fill="#475569">:</tspan> <tspan fill="#a78bfa">4.7</tspan></text>
          <text x="685" y="168" fill="#94a3b8" fontSize="10" fontFamily="monospace">"stock"<tspan fill="#475569">:</tspan> <tspan fill="#fbbf24">"in_stock"</tspan></text>
          <text x="685" y="186" fill="#94a3b8" fontSize="10" fontFamily="monospace">"reviews"<tspan fill="#475569">:</tspan> <tspan fill="#475569">[...]</tspan></text>
          <text x="670" y="204" fill="#39ff14" fontSize="10" fontFamily="monospace" opacity="0.9">{"}"}</text>
          {/* Status badge */}
          <rect x="700" y="220" width="60" height="20" rx="10" fill="#22c55e15" stroke="#22c55e" strokeWidth="0.5" />
          <text x="730" y="234" fill="#22c55e" fontSize="9" fontFamily="system-ui" textAnchor="middle">200 OK</text>
          <text x="760" y="52" fill="#39ff14" fontSize="11" fontFamily="system-ui" textAnchor="middle" fontWeight="600">JSON API</text>
        </g>

        {/* ─── Pulsing dots along the flow ───────────────── */}
        <circle r="4" fill="#39ff14" opacity="0.8" filter="url(#glow-green)">
          <animateMotion dur="3s" repeatCount="indefinite" path="M260,160 L340,160" />
          <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle r="4" fill="#39ff14" opacity="0.8" filter="url(#glow-green)">
          <animateMotion dur="3s" repeatCount="indefinite" path="M570,160 L650,160" />
          <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* ─── Bottom label ──────────────────────────────── */}
        <text x="450" y="300" fill="#475569" fontSize="12" fontFamily="system-ui" textAnchor="middle">
          Describe a task → AI builds the workflow → You call the API
        </text>
      </svg>
    </div>
  );
}
