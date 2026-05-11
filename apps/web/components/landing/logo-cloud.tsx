"use client";

const LOGOS = [
  {
    name: "OpenAI",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5Z" />
      </svg>
    ),
  },
  {
    name: "Anthropic",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
        <path d="M14.4 4h-3.05l5.55 16h3.1L14.4 4zm-7.6 0L1 20h3.1l1.15-3.4h6.05L12.5 20h3.1L9.85 4H6.8zm-1 9.8L8.1 7.5l2.85 6.3H5.8z" />
      </svg>
    ),
  },
  {
    name: "OpenRouter",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-full w-full">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l2-3 4 6 2-3h6" />
      </svg>
    ),
  },
  {
    name: "Playwright",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
        <path d="M2 17V7l5-3 5 3v10l-5 3-5-3zm10 0V7l5-3 5 3v10l-5 3-5-3z" opacity="0.6" />
        <circle cx="7" cy="9" r="1.5" fill="white" />
        <circle cx="17" cy="9" r="1.5" fill="white" />
      </svg>
    ),
  },
  {
    name: "Claude Desktop",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
        <path d="M5 4h14a2 2 0 012 2v10a2 2 0 01-2 2h-5l-2 4-2-4H5a2 2 0 01-2-2V6a2 2 0 012-2zm3 5h8M8 13h6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Cursor",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
        <path d="M3 3l8 18 2-7 7-2L3 3z" />
      </svg>
    ),
  },
  {
    name: "MCP",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-full w-full">
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="4" r="2" />
        <circle cx="12" cy="20" r="2" />
        <circle cx="4" cy="12" r="2" />
        <circle cx="20" cy="12" r="2" />
        <line x1="12" y1="6" x2="12" y2="9" />
        <line x1="12" y1="15" x2="12" y2="18" />
        <line x1="6" y1="12" x2="9" y2="12" />
        <line x1="15" y1="12" x2="18" y2="12" />
      </svg>
    ),
  },
];

export function LogoCloud() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-16">
      <p className="text-center text-xs uppercase tracking-[0.2em] text-gray-500">
        Works with the tools you already use
      </p>
      <div className="mt-8 grid grid-cols-3 items-center justify-items-center gap-8 sm:grid-cols-4 md:grid-cols-7">
        {LOGOS.map((logo) => (
          <div
            key={logo.name}
            className="group flex flex-col items-center gap-2 transition"
            title={logo.name}
          >
            <div className="h-8 w-8 text-gray-500 transition group-hover:text-white">
              {logo.svg}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-600 transition group-hover:text-gray-300">
              {logo.name}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
