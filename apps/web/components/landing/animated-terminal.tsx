"use client";

import { useEffect, useState, useRef } from "react";

/**
 * Auto-typing terminal that demonstrates the platform.
 * Cycles through: prompt → workflow generation → API call → JSON output.
 */

const SCRIPT: { type: "command" | "output"; text: string; delay?: number }[] = [
  { type: "command", text: "# 1. Describe your automation in English", delay: 200 },
  {
    type: "command",
    text: 'curl -X POST https://api.anythingapi.com/v1/workflows \\\n  -d \'{"mode":"ai","prompt":"Get Amazon product data"}\'',
    delay: 400,
  },
  { type: "output", text: "✓ Workflow created · 5 steps generated · 8.2s", delay: 600 },
  { type: "output", text: "  Endpoint: POST /v1/run/amazon-product-data-x7k2", delay: 200 },
  { type: "command", text: "\n# 2. Call your new API", delay: 400 },
  {
    type: "command",
    text: 'curl -X POST .../v1/run/amazon-product-data-x7k2 \\\n  -d \'{"url":"https://amazon.com/dp/B09V3KXJPB"}\'',
    delay: 400,
  },
  { type: "output", text: "{", delay: 200 },
  { type: "output", text: '  "title": "Apple AirPods Pro (2nd Gen)",', delay: 50 },
  { type: "output", text: '  "price": 189.99,', delay: 50 },
  { type: "output", text: '  "rating": 4.7,', delay: 50 },
  { type: "output", text: '  "reviews": 89432,', delay: 50 },
  { type: "output", text: '  "in_stock": true,', delay: 50 },
  { type: "output", text: '  "_meta": { "runtime_ms": 3200 }', delay: 50 },
  { type: "output", text: "}", delay: 200 },
];

const TYPING_SPEED = 18; // ms per char
const RESET_DELAY = 4000; // ms to wait before restarting

export function AnimatedTerminal() {
  const [lines, setLines] = useState<{ type: string; text: string }[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [step, setStep] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (paused) return;

    if (step >= SCRIPT.length) {
      // Restart after delay
      const timer = setTimeout(() => {
        setLines([]);
        setCurrentLine("");
        setStep(0);
        setCharIndex(0);
      }, RESET_DELAY);
      return () => clearTimeout(timer);
    }

    const current = SCRIPT[step];

    if (charIndex >= current.text.length) {
      // Line done — commit it and move on
      const timer = setTimeout(() => {
        setLines((prev) => [...prev, { type: current.type, text: current.text }]);
        setCurrentLine("");
        setCharIndex(0);
        setStep((s) => s + 1);
      }, current.delay || 100);
      return () => clearTimeout(timer);
    }

    const speed = current.type === "output" && current.text.startsWith("  ") ? 5 : TYPING_SPEED;
    const timer = setTimeout(() => {
      setCurrentLine(current.text.slice(0, charIndex + 1));
      setCharIndex((i) => i + 1);
    }, speed);
    return () => clearTimeout(timer);
  }, [step, charIndex, paused]);

  // Auto-scroll on new content
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines, currentLine]);

  return (
    <div className="mx-auto mt-16 w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 text-left shadow-2xl shadow-brand-600/5">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-gray-800 bg-gray-900 px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-red-500/80" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <div className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs text-gray-500">terminal — anything-api</span>
        <button
          onClick={() => setPaused((p) => !p)}
          className="ml-auto rounded px-2 py-0.5 text-[10px] text-gray-500 hover:bg-gray-800 hover:text-gray-300"
        >
          {paused ? "▶ play" : "⏸ pause"}
        </button>
      </div>

      {/* Terminal body */}
      <pre
        ref={containerRef}
        className="h-[420px] overflow-hidden p-6 font-mono text-sm leading-relaxed scroll-smooth"
      >
        <code>
          {lines.map((line, i) => (
            <Line key={i} type={line.type} text={line.text} />
          ))}
          {currentLine && <Line type={SCRIPT[step]?.type || "command"} text={currentLine} />}
          {!paused && step < SCRIPT.length && <span className="inline-block w-2 h-4 align-middle bg-green-400 animate-pulse" />}
        </code>
      </pre>
    </div>
  );
}

function Line({ type, text }: { type: string; text: string }) {
  const lines = text.split("\n");
  if (type === "output") {
    return (
      <>
        {lines.map((l, i) => (
          <div key={i} className="text-gray-400">
            {colorOutput(l)}
          </div>
        ))}
      </>
    );
  }
  if (text.startsWith("#")) {
    return (
      <>
        {lines.map((l, i) => (
          <div key={i} className="text-gray-500">
            {l}
          </div>
        ))}
      </>
    );
  }
  return (
    <>
      {lines.map((l, i) => (
        <div key={i}>
          {i === 0 ? <span className="text-green-400">$ </span> : <span>  </span>}
          {colorCommand(l)}
        </div>
      ))}
    </>
  );
}

function colorCommand(line: string) {
  const parts = line.split(/('[^']+'|"[^"]+"|https?:\/\/\S+)/g);
  return parts.map((p, i) => {
    if (/^['"].+['"]$/.test(p)) {
      return <span key={i} className="text-yellow-300">{p}</span>;
    }
    if (/^https?:\/\//.test(p)) {
      return <span key={i} className="text-brand-400">{p}</span>;
    }
    return <span key={i} className="text-white">{p}</span>;
  });
}

function colorOutput(line: string) {
  // Status lines (start with ✓)
  if (line.includes("✓")) {
    return <span className="text-green-400">{line}</span>;
  }
  // JSON values
  return line.split(/("[^"]+"|\d+\.?\d*|true|false|null)/g).map((p, i) => {
    if (/^"/.test(p)) return <span key={i} className="text-yellow-300">{p}</span>;
    if (/^\d/.test(p)) return <span key={i} className="text-purple-400">{p}</span>;
    if (p === "true" || p === "false" || p === "null") return <span key={i} className="text-purple-400">{p}</span>;
    if (/^"\w+"\s*:/.test(p)) return <span key={i} className="text-brand-300">{p}</span>;
    return <span key={i} className="text-gray-400">{p}</span>;
  });
}
