"use client";

import Link from "next/link";

const TEMPLATES = [
  { icon: "🛒", name: "Amazon Product Scraper", category: "E-commerce" },
  { icon: "🛍️", name: "Shopify Product Monitor", category: "E-commerce" },
  { icon: "📰", name: "Hacker News Top Stories", category: "News" },
  { icon: "🗞️", name: "Google News Search", category: "News" },
  { icon: "🍽️", name: "Yelp Business Info", category: "Local" },
  { icon: "🐙", name: "GitHub Repo Stats", category: "Developer" },
  { icon: "🦄", name: "Product Hunt Trending", category: "Tech" },
  { icon: "💼", name: "Indeed Job Search", category: "Jobs" },
  { icon: "☀️", name: "Weather Forecast", category: "Utilities" },
  { icon: "🐦", name: "Twitter Profile Stats", category: "Social" },
];

export function TemplatesMarquee() {
  // Duplicate twice so the loop appears seamless
  const doubled = [...TEMPLATES, ...TEMPLATES];

  return (
    <section className="relative z-10 overflow-hidden py-24">
      <div className="text-center">
        <div className="inline-block rounded-full border border-gray-800 bg-gray-900/50 px-3 py-1 text-xs text-gray-400 backdrop-blur">
          Marketplace
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Don&apos;t want to write a prompt?
        </h2>
        <p className="mx-auto mt-3 max-w-xl px-6 text-gray-400">
          Pre-built workflows ready to deploy. One click to install.
        </p>
      </div>

      {/* Marquee row 1 */}
      <div className="relative mt-12 flex overflow-hidden">
        <div
          className="absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-[#030712] to-transparent"
          aria-hidden
        />
        <div
          className="absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-[#030712] to-transparent"
          aria-hidden
        />

        <div className="flex animate-marquee gap-4 pr-4">
          {doubled.map((t, i) => (
            <TemplateCard key={`r1-${i}`} {...t} />
          ))}
        </div>
      </div>

      {/* Marquee row 2 — reverse direction, smaller */}
      <div className="relative mt-4 flex overflow-hidden">
        <div
          className="absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-[#030712] to-transparent"
          aria-hidden
        />
        <div
          className="absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-[#030712] to-transparent"
          aria-hidden
        />

        <div className="flex animate-marquee-reverse gap-4 pr-4">
          {doubled.map((t, i) => (
            <TemplateCard key={`r2-${i}`} {...t} small />
          ))}
        </div>
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/marketplace"
          className="group inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900/40 px-5 py-3 text-sm font-medium text-white backdrop-blur transition hover:border-gray-600 hover:bg-gray-900"
        >
          Browse all templates
          <svg
            className="h-4 w-4 transition group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

function TemplateCard({
  icon,
  name,
  category,
  small = false,
}: {
  icon: string;
  name: string;
  category: string;
  small?: boolean;
}) {
  return (
    <div
      className={`flex flex-shrink-0 items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/40 backdrop-blur transition hover:border-gray-700 hover:bg-gray-900/70 ${
        small ? "px-4 py-3" : "px-5 py-4"
      }`}
    >
      <span className={small ? "text-xl" : "text-2xl"}>{icon}</span>
      <div>
        <div className={small ? "text-xs font-medium text-white" : "text-sm font-semibold text-white"}>
          {name}
        </div>
        <div className={small ? "text-[10px] text-gray-500" : "text-xs text-gray-500"}>
          {category}
        </div>
      </div>
    </div>
  );
}
