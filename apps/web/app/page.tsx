import Link from "next/link";
import { CursorGlow } from "@/components/effects/cursor-glow";
import { GridSpotlight } from "@/components/effects/grid-spotlight";
import { CursorTrail } from "@/components/effects/cursor-trail";
import { AmbientBackground } from "@/components/effects/ambient-bg";
import { HeroIllustration } from "@/components/effects/hero-illustration";
import { GitHubStarButton } from "@/components/github-star-button";
import { AnimatedTerminal } from "@/components/landing/animated-terminal";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ComparisonTable } from "@/components/landing/comparison-table";
import { FeaturedTemplates } from "@/components/landing/featured-templates";
import { FAQ } from "@/components/landing/faq";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#030712] overflow-x-hidden">
      {/* Background effects */}
      <AmbientBackground />
      <CursorGlow />
      <GridSpotlight />
      <CursorTrail />

      {/* Nav */}
      <nav className="relative z-20 border-b border-gray-800/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600 text-sm font-bold text-gray-950">
              A
            </div>
            <span className="text-lg font-semibold text-white">
              API for Anything
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <a href="#how-it-works" className="hidden text-sm text-gray-400 hover:text-white sm:inline">
              How it works
            </a>
            <a href="#features" className="hidden text-sm text-gray-400 hover:text-white sm:inline">
              Features
            </a>
            <a href="#pricing" className="hidden text-sm text-gray-400 hover:text-white sm:inline">
              Pricing
            </a>
            <a href="/docs" className="hidden text-sm text-gray-400 hover:text-white sm:inline">
              Docs
            </a>
            <GitHubStarButton compact />
            <Link
              href="/studio"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24 text-center">
        <a
          href="https://github.com/meenakshi0786-svg/anything-api"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-400 backdrop-blur transition hover:border-brand-500/50 hover:bg-brand-500/20"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
          </span>
          Open source · MCP-native · Self-hostable
        </a>

        <h1 className="mt-8 text-5xl font-bold tracking-tight text-white sm:text-7xl">
          <span className="inline-block mr-3 sm:mr-4">Turn</span>
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
              any website
            </span>
            <svg
              className="absolute -bottom-2 left-0 w-full text-brand-400"
              viewBox="0 0 200 8"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                d="M0 4 Q 50 0, 100 4 T 200 4"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
              />
            </svg>
          </span>
          <span> into</span>
          <br />
          <span className="hero-glow inline-block">
            <span className="hero-shimmer">
              <span className="hero-gradient-text">a callable API</span>
            </span>
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
          Replace 200 lines of Playwright code with one English sentence.
          Our AI builds the workflow. You get a production REST API returning structured JSON.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/studio"
            className="rounded-xl bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500"
          >
            Start Building — Free
          </Link>
          <a
            href="/docs"
            className="rounded-xl border border-gray-700 bg-gray-900/40 px-8 py-3.5 text-base font-semibold text-gray-300 backdrop-blur transition hover:border-gray-600 hover:text-white"
          >
            View Docs
          </a>
        </div>

        {/* Trust line */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
          <span>✓ No credit card</span>
          <span>✓ Self-host on any VPS</span>
          <span>✓ MIT licensed</span>
          <span>✓ Multi-LLM support</span>
        </div>

        {/* Animated terminal */}
        <AnimatedTerminal />
      </section>

      {/* How it works */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* Featured templates */}
      <FeaturedTemplates />

      {/* Comparison */}
      <ComparisonTable />

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <div className="inline-block rounded-full border border-gray-800 bg-gray-900/50 px-3 py-1 text-xs text-gray-400 backdrop-blur">
            Features
          </div>
          <h2 className="mt-4 text-3xl font-bold text-white">
            Everything you need to automate the web
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            From simple data extraction to complex multi-step workflows with authentication
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Describe to API",
              desc: "Tell us what you want in plain English. Our AI generates a production API in under 60 seconds.",
              icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
            },
            {
              title: "Self-Healing Workflows",
              desc: "When a website changes its layout, our AI detects the break and auto-repairs the workflow. Zero maintenance.",
              icon: "M11.42 15.17l-5.648-3.014A.75.75 0 006 12.87v6.104a.75.75 0 00.328.654l5.648 3.014a.75.75 0 00.793 0l5.648-3.014A.75.75 0 0018.75 18.974v-6.104a.75.75 0 00-.328-.654l-5.648-3.014a.75.75 0 00-.793 0z",
            },
            {
              title: "Visual + Chat Builder",
              desc: "Build workflows through conversation or drag-and-drop. Debug with live execution replay.",
              icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
            },
            {
              title: "MCP for Cursor / Claude",
              desc: "Each workflow becomes a tool inside Cursor or Claude Desktop. Three lines of config.",
              icon: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25",
            },
            {
              title: "Scheduling + Webhooks",
              desc: "Run workflows on cron. Get results at your webhook with automatic retry on 5xx errors.",
              icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
            },
            {
              title: "Marketplace",
              desc: "Browse 10 ready-to-use templates. Install with one click. Coming soon: community publishing.",
              icon: "M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6 backdrop-blur transition hover:border-gray-700 hover:bg-gray-900/60"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600/20">
                <svg
                  className="h-5 w-5 text-brand-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Hero illustration */}
        <HeroIllustration />
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <div className="inline-block rounded-full border border-gray-800 bg-gray-900/50 px-3 py-1 text-xs text-gray-400 backdrop-blur">
            Pricing
          </div>
          <h2 className="mt-4 text-3xl font-bold text-white">
            Free if you self-host. Forever.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-400">
            No platform fees. No per-seat pricing. Pay only for AI tokens at provider cost.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {[
            {
              name: "Self-Host",
              price: "$0",
              priceLabel: "/month forever",
              desc: "Run on your own VPS",
              features: [
                "Unlimited workflows",
                "Unlimited runs",
                "Unlimited team members",
                "Open source MIT license",
                "Pay only for AI tokens (~$5/month typical)",
                "Community Discord support",
              ],
              cta: "View on GitHub",
              ctaHref: "https://github.com/meenakshi0786-svg/anything-api",
              highlighted: true,
            },
            {
              name: "Pro Cloud",
              price: "$49",
              priceLabel: "/month",
              desc: "Hosted by us · Coming soon",
              features: [
                "5,000 runs/month",
                "100 browser hours",
                "10 concurrent sessions",
                "Self-healing included",
                "Residential proxy access",
                "Email support",
              ],
              cta: "Join Waitlist",
              ctaHref: "/waitlist",
              highlighted: false,
            },
            {
              name: "Enterprise",
              price: "Custom",
              priceLabel: "",
              desc: "For teams + SOC 2",
              features: [
                "Unlimited runs",
                "Dedicated infra",
                "SSO / SAML",
                "SOC 2 Type II",
                "99.99% SLA",
                "Dedicated CSM",
              ],
              cta: "Contact Sales",
              ctaHref: "mailto:hello@anythingapi.com",
              highlighted: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 backdrop-blur ${
                plan.highlighted
                  ? "border-brand-500/50 bg-brand-500/5 shadow-2xl shadow-brand-500/10"
                  : "border-gray-800 bg-gray-900/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-brand-400">
                  {plan.name}
                </div>
                {plan.highlighted && (
                  <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-medium uppercase text-brand-400">
                    Recommended
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">
                  {plan.price}
                </span>
                <span className="text-sm text-gray-400">{plan.priceLabel}</span>
              </div>
              <p className="mt-2 text-sm text-gray-400">{plan.desc}</p>

              <a
                href={plan.ctaHref}
                target={plan.ctaHref.startsWith("http") ? "_blank" : undefined}
                rel="noopener"
                className={`mt-6 block w-full rounded-xl py-3 text-center text-sm font-semibold transition ${
                  plan.highlighted
                    ? "bg-brand-600 text-white hover:bg-brand-500"
                    : "border border-gray-700 text-white hover:border-gray-600 hover:bg-gray-800"
                }`}
              >
                {plan.cta}
              </a>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-gray-300"
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Ready to turn any website into an API?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-gray-400">
          Free to start. No credit card. Open source forever.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/studio"
            className="inline-block rounded-xl bg-brand-600 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500"
          >
            Start Building — It&apos;s Free
          </Link>
          <GitHubStarButton />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 bg-gray-950/40 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600 text-xs font-bold text-gray-950">
                  A
                </div>
                <span className="text-sm font-semibold text-white">
                  API for Anything
                </span>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Open source · MCP-native · Self-hostable
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Product
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-400">
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/marketplace" className="hover:text-white">Templates</Link></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#features" className="hover:text-white">Features</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Resources
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-400">
                <li><a href="https://github.com/meenakshi0786-svg/anything-api" target="_blank" rel="noopener" className="hover:text-white">GitHub</a></li>
                <li><a href="https://github.com/meenakshi0786-svg/anything-api/discussions" target="_blank" rel="noopener" className="hover:text-white">Discussions</a></li>
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Legal
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
                <li><Link href="/security" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-gray-800/50 pt-6 sm:flex-row">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} API for Anything. MIT licensed.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/meenakshi0786-svg/anything-api" target="_blank" rel="noopener" className="text-xs text-gray-500 hover:text-white">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
