"use client";

import Link from "next/link";

const FEATURED = [
  {
    icon: "🛒",
    name: "Amazon Product Scraper",
    description: "Title, price, rating, reviews from any Amazon URL",
    category: "E-commerce",
    runtime: "~3s",
  },
  {
    icon: "💼",
    name: "Indeed Job Search",
    description: "Search jobs by query + location → structured JSON",
    category: "Jobs",
    runtime: "~5s",
  },
  {
    icon: "📰",
    name: "Hacker News Top Stories",
    description: "Top 30 stories with title, points, comments, URL",
    category: "News",
    runtime: "~2s",
  },
  {
    icon: "🐙",
    name: "GitHub Repo Stats",
    description: "Stars, forks, language, last commit, topics",
    category: "Developer",
    runtime: "~3s",
  },
  {
    icon: "☀️",
    name: "Weather Forecast",
    description: "Current weather + 5-day forecast for any city",
    category: "Utilities",
    runtime: "~3s",
  },
  {
    icon: "🍽️",
    name: "Yelp Business Info",
    description: "Rating, hours, price range, reviews from Yelp",
    category: "Local",
    runtime: "~4s",
  },
];

export function FeaturedTemplates() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <div className="inline-block rounded-full border border-gray-800 bg-gray-900/50 px-3 py-1 text-xs text-gray-400 backdrop-blur">
          Templates
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Don&apos;t want to write a prompt?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-gray-400">
          Install pre-built workflows with one click. 10 templates ready to deploy, no AI generation needed.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED.map((t) => (
          <div
            key={t.name}
            className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/40 p-5 backdrop-blur transition hover:border-gray-700 hover:bg-gray-900/60"
          >
            {/* Hover glow */}
            <div
              className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/0 blur-3xl transition group-hover:bg-brand-500/10"
              aria-hidden
            />

            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gray-800 text-2xl">
                {t.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-white">{t.name}</h3>
                  <span className="rounded bg-gray-800 px-1.5 py-0.5 font-mono text-[10px] text-gray-400">
                    {t.runtime}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-gray-400">
                  {t.description}
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  {t.category}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-center">
        <Link
          href="/marketplace"
          className="group inline-flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/40 px-5 py-3 text-sm font-medium text-white backdrop-blur transition hover:border-gray-700 hover:bg-gray-900"
        >
          Browse all 10 templates
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
