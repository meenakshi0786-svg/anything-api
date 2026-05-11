"use client";

const USE_CASES = [
  {
    title: "Price monitoring",
    description: "Track competitor prices across thousands of product pages. Alert when prices change.",
    badge: "E-commerce",
    badgeColor: "from-orange-400 to-red-400",
    code: "GET prices every 6h",
    icon: "💰",
  },
  {
    title: "Lead enrichment",
    description: "Look up companies, extract contact info, social profiles, tech stack — all from a URL.",
    badge: "Sales",
    badgeColor: "from-blue-400 to-cyan-400",
    code: "POST /enrich-company",
    icon: "🎯",
  },
  {
    title: "Job aggregation",
    description: "Pull listings from Indeed, LinkedIn, AngelList. Normalize into one feed.",
    badge: "HR",
    badgeColor: "from-purple-400 to-pink-400",
    code: "GET jobs/remote-eng",
    icon: "💼",
  },
  {
    title: "Content monitoring",
    description: "Watch competitor blogs, news sites, social feeds. Get summaries via Claude.",
    badge: "Marketing",
    badgeColor: "from-green-400 to-emerald-400",
    code: "POST /watch-feed",
    icon: "👀",
  },
  {
    title: "Research automation",
    description: "Scrape papers, extract citations, build knowledge graphs. Pipe to RAG.",
    badge: "AI/ML",
    badgeColor: "from-indigo-400 to-purple-400",
    code: "POST /research",
    icon: "🔬",
  },
  {
    title: "Market intelligence",
    description: "Aggregate reviews, ratings, sentiment from Yelp, Trustpilot, App Store.",
    badge: "Insights",
    badgeColor: "from-yellow-400 to-orange-400",
    code: "GET /reviews/aggregate",
    icon: "📊",
  },
];

export function UseCases() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <div className="inline-block rounded-full border border-gray-800 bg-gray-900/50 px-3 py-1 text-xs text-gray-400 backdrop-blur">
          What you can build
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Real use cases.
          <br />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Real APIs in minutes.
          </span>
        </h2>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {USE_CASES.map((useCase) => (
          <div
            key={useCase.title}
            className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/40 p-6 backdrop-blur transition hover:border-gray-700 hover:bg-gray-900/70"
          >
            {/* Hover gradient */}
            <div
              className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-3xl transition group-hover:opacity-100"
              style={{
                background: "radial-gradient(circle, rgba(57,255,20,0.15), transparent)",
              }}
              aria-hidden
            />

            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div className="text-3xl">{useCase.icon}</div>
                <span
                  className={`rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-950 ${useCase.badgeColor}`}
                >
                  {useCase.badge}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-white">
                {useCase.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                {useCase.description}
              </p>

              <div className="mt-4 flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 font-mono text-[11px] text-brand-400">
                <span className="text-gray-600">$</span> {useCase.code}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
