"use client";

import { useEffect, useState } from "react";

/**
 * Stylized mockup of the Studio chat interface,
 * showing a typing animation that loops.
 */
const PROMPT = "Get product price and title from any Amazon URL";

export function StudioMockup() {
  const [chars, setChars] = useState(0);
  const [phase, setPhase] = useState<"typing" | "thinking" | "done">("typing");

  useEffect(() => {
    if (phase === "typing") {
      if (chars < PROMPT.length) {
        const t = setTimeout(() => setChars((c) => c + 1), 40);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("thinking"), 600);
      return () => clearTimeout(t);
    }
    if (phase === "thinking") {
      const t = setTimeout(() => setPhase("done"), 2000);
      return () => clearTimeout(t);
    }
    // done — restart after a pause
    const t = setTimeout(() => {
      setChars(0);
      setPhase("typing");
    }, 5000);
    return () => clearTimeout(t);
  }, [chars, phase]);

  return (
    <div className="relative w-full max-w-[560px]">
      {/* Glow behind */}
      <div
        className="absolute -inset-8 -z-10 rounded-3xl opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(57,255,20,0.15) 0%, rgba(99,102,241,0.08) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Mac window */}
      <div className="overflow-hidden rounded-2xl border border-gray-700/60 bg-gray-950/95 shadow-2xl backdrop-blur-xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-gray-800 bg-gray-900/80 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
          <div className="ml-3 flex items-center gap-1.5 rounded-md bg-gray-950 px-3 py-1 text-[10px] text-gray-500">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            anythingapi.com / studio
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-[140px_1fr] divide-x divide-gray-800/60">
          {/* Sidebar */}
          <div className="bg-gray-950/50 p-3">
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded bg-gradient-to-br from-green-400 to-green-600 text-[9px] font-bold text-gray-950 flex items-center justify-center">
                A
              </div>
              <div className="h-2 w-12 rounded bg-gray-800" />
            </div>
            <div className="mt-3 rounded-md bg-brand-600/30 px-2 py-1 text-[10px] text-white">
              + New
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-1.5 rounded-md bg-gray-800 px-2 py-1">
                <div className="h-2 w-2 rounded-full bg-brand-400" />
                <div className="text-[9px] text-white">Studio</div>
              </div>
              {["Workflows", "Runs", "Schedules", "Marketplace", "Docs"].map((label) => (
                <div key={label} className="px-2 py-1 text-[9px] text-gray-500">
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="p-4">
            {/* Welcome message */}
            <div className="mb-3 max-w-[80%] rounded-2xl bg-gray-800/80 px-3 py-2">
              <div className="text-[10px] leading-relaxed text-gray-300">
                Welcome to Studio! Describe what you want to automate...
              </div>
            </div>

            {/* User message (typing) */}
            <div className="mb-3 ml-auto max-w-[80%] rounded-2xl bg-brand-600 px-3 py-2">
              <div className="text-[10px] text-white">
                {PROMPT.slice(0, chars)}
                {phase === "typing" && (
                  <span className="ml-0.5 inline-block h-2 w-0.5 animate-pulse bg-white align-middle" />
                )}
              </div>
            </div>

            {/* Thinking / response */}
            {phase === "thinking" && (
              <div className="mb-3 max-w-[80%] rounded-2xl bg-gray-800/80 px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.3s]" />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.15s]" />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" />
                  </div>
                  <div className="text-[9px] text-gray-400">Building your workflow...</div>
                </div>
              </div>
            )}

            {phase === "done" && (
              <>
                <div className="mb-2 max-w-[85%] rounded-2xl bg-gray-800/80 px-3 py-2">
                  <div className="text-[10px] text-gray-300">
                    Your workflow <strong className="text-white">Amazon Product Scraper</strong> is ready!
                  </div>
                </div>

                {/* Workflow card */}
                <div className="mb-3 rounded-lg border border-green-700/40 bg-green-950/30 p-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-[9px] font-medium text-green-400">Workflow Ready</span>
                  </div>
                  <div className="mt-1.5 rounded bg-gray-950 px-1.5 py-0.5 font-mono text-[9px] text-gray-400">
                    POST /v1/run/amazon-product-scraper
                  </div>
                  <div className="mt-1.5 flex gap-1">
                    <button className="rounded bg-brand-600 px-2 py-0.5 text-[9px] font-medium text-white">
                      Test Now
                    </button>
                    <button className="rounded border border-gray-700 px-2 py-0.5 text-[9px] text-gray-400">
                      View
                    </button>
                  </div>
                </div>

                {/* Live run viewer */}
                <div className="rounded-lg border border-gray-800 bg-gray-950/80 p-2.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                      <span className="text-[8px] font-semibold uppercase tracking-wider text-green-400">
                        Completed
                      </span>
                    </div>
                    <span className="font-mono text-[8px] text-gray-500">3.2s</span>
                  </div>
                  <div className="space-y-1">
                    {[
                      { id: "navigate", time: "1.7s", color: "green" },
                      { id: "wait_for_title", time: "0.1s", color: "green" },
                      { id: "extract_product", time: "1.4s", color: "green" },
                    ].map((step) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-2 rounded bg-gray-900/50 px-2 py-1"
                      >
                        <svg className="h-2.5 w-2.5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span className="flex-1 truncate font-mono text-[9px] text-gray-300">
                          {step.id}
                        </span>
                        <span className="font-mono text-[8px] text-gray-500">{step.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Input bar */}
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-3 py-1.5">
              <div className="flex-1 text-[9px] text-gray-500">
                Describe what you want to automate...
              </div>
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-600">
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
