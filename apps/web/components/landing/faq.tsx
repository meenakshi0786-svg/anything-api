"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Is API for Anything really free?",
    a: "Yes — the platform is fully open source under the MIT license. Self-host it on any VPS and pay only for AI tokens (we recommend OpenRouter for the cheapest Claude/GPT pricing). There's no platform fee, no usage tax, no lock-in.",
  },
  {
    q: "How is this different from Notte.cc or Browserbase?",
    a: "We offer the same 'describe → API' magic, but we're open source and self-hostable. They're closed-source SaaS with vendor lock-in. We also have a built-in marketplace with one-click templates, a visual workflow builder, and an MCP server for Cursor/Claude Desktop — none of which they have.",
  },
  {
    q: "What can I scrape with this?",
    a: "Anything that loads in a browser. Product data, job listings, news, prices, social media, reviews, GitHub stats, weather, real estate. We have 10 ready-to-use templates and you can build any workflow with a plain English prompt.",
  },
  {
    q: "Will it bypass CAPTCHAs and bot detection?",
    a: "We have basic anti-detection (canvas/WebGL fingerprint spoofing, human-like mouse movements). For heavy anti-bot sites with CAPTCHA, you'd need to add a service like 2Captcha or use a residential proxy provider — both supported via env vars.",
  },
  {
    q: "How does the AI planner work?",
    a: "When you describe a task, our planner sends the prompt to Claude (via OpenRouter) along with our automation primitives. The LLM returns a structured workflow DAG with steps, dependencies, and JSON schemas. The worker then executes it using Playwright with AI fallbacks for selectors that fail.",
  },
  {
    q: "What if a website changes its layout?",
    a: "Our self-healing engine detects when a step fails (selector not found, unexpected page state), takes a screenshot, asks the AI to find a new selector, validates the fix, and updates the workflow with a new version. Zero manual maintenance for most layout changes.",
  },
  {
    q: "Can I use OpenAI, Anthropic, or another LLM?",
    a: "Yes — set OPENAI_API_KEY, ANTHROPIC_API_KEY, or OPENROUTER_API_KEY in your .env. The LLM client auto-detects which provider you've configured and routes requests accordingly. OpenRouter is recommended because it works with Claude, GPT, Llama, Gemini, and others through one key.",
  },
  {
    q: "How do I integrate with Cursor or Claude Desktop?",
    a: "Run our MCP server (apps/mcp-server) and add it to your MCP config. Each of your active workflows becomes a tool the AI can call with structured input. See the MCP docs for the 3-line setup.",
  },
  {
    q: "Is the data secure? Do you see my scraped content?",
    a: "If self-hosted, all data stays on your infrastructure. The only outbound calls are to your chosen LLM provider (OpenAI/Anthropic/OpenRouter) for planning and extraction. Credentials are stored encrypted (AES-256-GCM) in your database and only decrypted inside the browser session — never sent to LLMs.",
  },
  {
    q: "What's on the roadmap?",
    a: "Hosted cloud version with billing, residential proxy provider integrations, CAPTCHA solving, SOC 2 compliance, public workflow gallery, real-time multiplayer in Studio, and a CLI tool. Vote on features at /roadmap.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative mx-auto max-w-3xl px-6 py-24">
      <div className="text-center">
        <div className="inline-block rounded-full border border-gray-800 bg-gray-900/50 px-3 py-1 text-xs text-gray-400 backdrop-blur">
          FAQ
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Questions, answered
        </h2>
      </div>

      <div className="mt-12 divide-y divide-gray-800 rounded-2xl border border-gray-800 bg-gray-900/40 backdrop-blur">
        {FAQS.map((faq, idx) => (
          <div key={faq.q}>
            <button
              onClick={() => setOpen(open === idx ? null : idx)}
              className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-gray-900/50"
            >
              <span className="pr-4 text-sm font-medium text-white">
                {faq.q}
              </span>
              <svg
                className={`h-4 w-4 flex-shrink-0 text-gray-500 transition ${
                  open === idx ? "rotate-180 text-brand-400" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
            {open === idx && (
              <div className="px-6 pb-5 text-sm leading-relaxed text-gray-400">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-gray-500">
        Still have questions?{" "}
        <a href="https://github.com/meenakshi0786-svg/anything-api/discussions" target="_blank" rel="noopener" className="text-brand-400 hover:text-brand-300">
          Ask on GitHub Discussions
        </a>
      </p>
    </section>
  );
}
