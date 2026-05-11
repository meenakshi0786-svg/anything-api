"use client";

const STEPS = [
  {
    number: "01",
    title: "Describe in plain English",
    description: "Tell us what you want — \"Get product price from any Amazon URL\". No code, no selectors, no Playwright knowledge required.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    color: "green",
  },
  {
    number: "02",
    title: "AI builds the workflow",
    description: "Our planner generates a full automation: navigate, wait, extract, paginate. Self-healing kicks in when sites change.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    color: "purple",
  },
  {
    number: "03",
    title: "Call your new API",
    description: "Production-ready REST endpoint with structured JSON output. Use it from any language, schedule it, or pipe it to Claude/Cursor via MCP.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>
    ),
    color: "blue",
  },
];

const COLOR_CLASSES = {
  green: { bg: "bg-green-500/10", text: "text-green-400", ring: "ring-green-500/20" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", ring: "ring-purple-500/20" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", ring: "ring-blue-500/20" },
};

export function HowItWorks() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <div className="inline-block rounded-full border border-gray-800 bg-gray-900/50 px-3 py-1 text-xs text-gray-400 backdrop-blur">
          How it works
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          From idea to API in 60 seconds
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-gray-400">
          Three steps. No code. No selectors. No infrastructure to manage.
        </p>
      </div>

      {/* Steps */}
      <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-12">
        {STEPS.map((step, idx) => {
          const colors = COLOR_CLASSES[step.color as keyof typeof COLOR_CLASSES];
          return (
            <div key={step.number} className="relative">
              {/* Connecting line */}
              {idx < STEPS.length - 1 && (
                <div className="absolute left-[calc(50%+1px)] top-12 hidden h-px w-[calc(100%-3rem)] translate-x-12 bg-gradient-to-r from-gray-700 to-transparent lg:block" />
              )}

              <div className="relative flex flex-col items-center text-center">
                {/* Step number badge */}
                <div className="absolute -top-3 right-4 hidden font-mono text-xs text-gray-600 lg:block">
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ${colors.bg} ${colors.ring}`}>
                  <div className={`h-8 w-8 ${colors.text}`}>{step.icon}</div>
                </div>

                <h3 className="mt-6 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
