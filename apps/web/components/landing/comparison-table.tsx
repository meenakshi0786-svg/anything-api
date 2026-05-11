"use client";

const COMPARISONS = [
  { feature: "Open source", afa: true, notte: false, browserbase: false, diy: true },
  { feature: "Self-hostable on any VPS", afa: true, notte: false, browserbase: false, diy: true },
  { feature: "Describe in plain English", afa: true, notte: true, browserbase: false, diy: false },
  { feature: "Pre-built workflow templates", afa: true, notte: false, browserbase: false, diy: false },
  { feature: "Visual workflow builder", afa: true, notte: false, browserbase: false, diy: false },
  { feature: "Live execution viewer", afa: true, notte: true, browserbase: false, diy: false },
  { feature: "MCP server for Cursor / Claude Desktop", afa: true, notte: false, browserbase: false, diy: false },
  { feature: "Multi-LLM (OpenAI · Anthropic · OpenRouter)", afa: true, notte: false, browserbase: false, diy: true },
  { feature: "Auto-generated REST endpoint", afa: true, notte: true, browserbase: false, diy: false },
  { feature: "Webhook delivery with retries", afa: true, notte: true, browserbase: false, diy: false },
  { feature: "Cron scheduling", afa: true, notte: true, browserbase: false, diy: false },
  { feature: "Pay only for AI tokens (no platform markup)", afa: true, notte: false, browserbase: false, diy: true },
];

function YesIcon() {
  return (
    <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function NoIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function ComparisonTable() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <div className="inline-block rounded-full border border-gray-800 bg-gray-900/50 px-3 py-1 text-xs text-gray-400 backdrop-blur">
          How we compare
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          The open alternative
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-gray-400">
          Same capabilities as the closed-source giants. Open source. Self-hostable. Yours.
        </p>
      </div>

      <div className="mt-12 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Feature
              </th>
              <th className="bg-brand-600/5 px-6 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600 text-xs font-bold text-gray-950">
                    A
                  </div>
                  <span className="text-xs font-semibold text-white">API for Anything</span>
                  <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[9px] font-medium uppercase text-green-400">
                    Yours
                  </span>
                </div>
              </th>
              <th className="px-6 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="text-xs font-semibold text-gray-300">Notte.cc</div>
                  <span className="text-[10px] text-gray-500">Closed-source</span>
                </div>
              </th>
              <th className="px-6 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="text-xs font-semibold text-gray-300">Browserbase</div>
                  <span className="text-[10px] text-gray-500">Closed-source</span>
                </div>
              </th>
              <th className="px-6 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="text-xs font-semibold text-gray-300">DIY (Playwright)</div>
                  <span className="text-[10px] text-gray-500">Build it yourself</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISONS.map((row, i) => (
              <tr
                key={row.feature}
                className={`border-b border-gray-800/50 ${
                  i % 2 === 0 ? "bg-gray-900/20" : ""
                }`}
              >
                <td className="px-6 py-3 text-sm text-gray-300">{row.feature}</td>
                <td className="bg-brand-600/5 px-6 py-3 text-center">
                  <div className="flex justify-center">{row.afa ? <YesIcon /> : <NoIcon />}</div>
                </td>
                <td className="px-6 py-3 text-center">
                  <div className="flex justify-center">{row.notte ? <YesIcon /> : <NoIcon />}</div>
                </td>
                <td className="px-6 py-3 text-center">
                  <div className="flex justify-center">{row.browserbase ? <YesIcon /> : <NoIcon />}</div>
                </td>
                <td className="px-6 py-3 text-center">
                  <div className="flex justify-center">{row.diy ? <YesIcon /> : <NoIcon />}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Honest disclaimer */}
      <p className="mt-6 text-center text-xs text-gray-500">
        Notte and Browserbase have CAPTCHA solving, residential proxies, and SOC 2 — capabilities we{" "}
        <a href="/roadmap" className="underline hover:text-gray-300">
          plan to add
        </a>
        . For now, we&apos;re strongest at developer experience and openness.
      </p>
    </section>
  );
}
