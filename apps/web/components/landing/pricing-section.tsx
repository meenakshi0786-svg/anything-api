"use client";

import Link from "next/link";

const PLANS = [
  {
    name: "Self-Host",
    price: "$0",
    cadence: "/forever",
    desc: "Deploy on your own VPS. Pay only for AI tokens.",
    features: [
      "Unlimited workflows",
      "Unlimited runs",
      "Unlimited team members",
      "MIT open source license",
      "MCP server included",
      "Community Discord",
    ],
    cta: "View on GitHub →",
    ctaHref: "https://github.com/meenakshi0786-svg/anything-api",
    highlighted: true,
    badge: "Recommended",
  },
  {
    name: "Pro Cloud",
    price: "$49",
    cadence: "/month",
    desc: "We host it for you. Coming soon.",
    features: [
      "5,000 runs/month",
      "100 browser hours",
      "10 concurrent sessions",
      "Self-healing included",
      "Residential proxies",
      "Priority email support",
    ],
    cta: "Join Waitlist",
    ctaHref: "/waitlist",
    highlighted: false,
    badge: "Coming soon",
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    desc: "Dedicated infrastructure + SOC 2.",
    features: [
      "Unlimited everything",
      "Dedicated infrastructure",
      "SSO / SAML / SCIM",
      "SOC 2 Type II",
      "99.99% SLA",
      "Dedicated CSM",
    ],
    cta: "Contact Sales",
    ctaHref: "mailto:hello@anythingapi.com",
    highlighted: false,
    badge: null,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative z-10 mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <div className="inline-block rounded-full border border-gray-800 bg-gray-900/50 px-3 py-1 text-xs text-gray-400 backdrop-blur">
          Pricing
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Free if you self-host.
          <br />
          <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Forever.
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-gray-400">
          No platform fees. No per-seat pricing. Pay only for AI tokens at provider cost.
        </p>
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border p-8 backdrop-blur transition ${
              plan.highlighted
                ? "border-brand-500/50 bg-gradient-to-b from-brand-500/10 via-gray-900/50 to-gray-900/30 shadow-2xl shadow-brand-500/10"
                : "border-gray-800 bg-gray-900/40"
            }`}
          >
            {/* Top accent line for highlighted */}
            {plan.highlighted && (
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
            )}

            {/* Badge */}
            {plan.badge && (
              <div className="absolute right-4 top-4">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                    plan.highlighted
                      ? "bg-brand-500/20 text-brand-300"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {plan.badge}
                </span>
              </div>
            )}

            <div className="text-sm font-semibold text-brand-400">{plan.name}</div>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-5xl font-bold text-white">{plan.price}</span>
              <span className="text-sm text-gray-500">{plan.cadence}</span>
            </div>

            <p className="mt-3 text-sm text-gray-400">{plan.desc}</p>

            <a
              href={plan.ctaHref}
              target={plan.ctaHref.startsWith("http") ? "_blank" : undefined}
              rel="noopener"
              className={`mt-6 block w-full rounded-xl py-3 text-center text-sm font-semibold transition ${
                plan.highlighted
                  ? "bg-brand-600 text-white hover:bg-brand-500"
                  : "border border-gray-700 bg-gray-900/40 text-white hover:border-gray-600 hover:bg-gray-800"
              }`}
            >
              {plan.cta}
            </a>

            <div className="mt-8 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-3 text-sm text-gray-300"
                >
                  <svg
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cost calculator hint */}
      <p className="mt-10 text-center text-sm text-gray-500">
        Self-hosting cost example:{" "}
        <span className="font-mono text-gray-400">
          $5 VPS + ~$5 OpenRouter
        </span>{" "}
        = <span className="text-green-400">$10/month</span> for thousands of runs.
      </p>
    </section>
  );
}
