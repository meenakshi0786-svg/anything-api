import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
      <nav className="border-b border-gray-800/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              A
            </div>
            <span className="text-lg font-semibold text-white">
              API for Anything
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-400 hover:text-white">
              Features
            </a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white">
              Pricing
            </a>
            <a href="#docs" className="text-sm text-gray-400 hover:text-white">
              Docs
            </a>
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
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
          </span>
          Now in public beta
        </div>

        <h1 className="mt-8 text-5xl font-bold tracking-tight text-white sm:text-7xl">
          Turn any website into
          <br />
          <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            a callable API
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
          Describe what you want in plain English. Our AI builds the automation.
          You get a production-ready REST API returning structured JSON.
          No code required.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/studio"
            className="rounded-xl bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500"
          >
            Start Building — Free
          </Link>
          <a
            href="#docs"
            className="rounded-xl border border-gray-700 px-8 py-3.5 text-base font-semibold text-gray-300 transition hover:border-gray-600 hover:text-white"
          >
            View Docs
          </a>
        </div>

        {/* Code example */}
        <div className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 text-left shadow-2xl">
          <div className="flex items-center gap-2 border-b border-gray-800 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-xs text-gray-500">
              terminal
            </span>
          </div>
          <pre className="overflow-x-auto p-6 font-mono text-sm leading-relaxed">
            <code>
              <span className="text-gray-500"># 1. Describe your automation</span>
              {"\n"}
              <span className="text-green-400">$</span>{" "}
              <span className="text-white">curl -X POST</span>{" "}
              <span className="text-brand-400">https://api.anythingapi.com/v1/workflows</span>
              {" \\\n  "}
              <span className="text-gray-400">-d</span>{" "}
              <span className="text-yellow-300">{`'{"mode":"ai","prompt":"Get price from any Amazon URL"}'`}</span>
              {"\n\n"}
              <span className="text-gray-500"># 2. Call your new API</span>
              {"\n"}
              <span className="text-green-400">$</span>{" "}
              <span className="text-white">curl -X POST</span>{" "}
              <span className="text-brand-400">https://api.anythingapi.com/v1/run/amazon-scraper</span>
              {" \\\n  "}
              <span className="text-gray-400">-d</span>{" "}
              <span className="text-yellow-300">{`'{"url":"https://amazon.com/dp/B09V3KXJPB"}'`}</span>
              {"\n\n"}
              <span className="text-gray-500"># 3. Get structured JSON</span>
              {"\n"}
              <span className="text-gray-400">{`{`}</span>
              {"\n"}
              {"  "}<span className="text-brand-300">"title"</span>: <span className="text-yellow-300">"Apple AirPods Pro"</span>,
              {"\n"}
              {"  "}<span className="text-brand-300">"price"</span>: <span className="text-purple-400">189.99</span>,
              {"\n"}
              {"  "}<span className="text-brand-300">"rating"</span>: <span className="text-purple-400">4.7</span>,
              {"\n"}
              {"  "}<span className="text-brand-300">"reviews"</span>: <span className="text-gray-400">[...]</span>
              {"\n"}
              <span className="text-gray-400">{`}`}</span>
            </code>
          </pre>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-center text-3xl font-bold text-white">
          Everything you need to automate the web
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-gray-400">
          From simple data extraction to complex multi-step workflows with authentication
        </p>

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
              title: "Browser Infrastructure",
              desc: "Scalable Playwright browser pool with anti-detection, proxy rotation, and session persistence.",
              icon: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25",
            },
            {
              title: "Scheduling + Webhooks",
              desc: "Run workflows on a cron schedule. Get results delivered to your webhook automatically.",
              icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
            },
            {
              title: "Marketplace",
              desc: "Browse and install community-built workflows. Share yours and earn per-use royalties.",
              icon: "M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 transition hover:border-gray-700"
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
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-center text-3xl font-bold text-white">
          Simple, usage-based pricing
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-gray-400">
          Start free. Scale as you grow. No surprise bills.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {[
            {
              name: "Free",
              price: "$0",
              desc: "Get started with the basics",
              features: [
                "100 runs/month",
                "5 browser hours",
                "2 concurrent sessions",
                "5 workflows",
                "Community support",
              ],
              cta: "Start Free",
              highlighted: false,
            },
            {
              name: "Pro",
              price: "$49",
              desc: "For serious builders",
              features: [
                "5,000 runs/month",
                "100 browser hours",
                "10 concurrent sessions",
                "50 workflows",
                "Self-healing",
                "Residential proxies",
                "Email support",
              ],
              cta: "Start Pro Trial",
              highlighted: true,
            },
            {
              name: "Team",
              price: "$149",
              desc: "For teams and agencies",
              features: [
                "25,000 runs/month",
                "500 browser hours",
                "50 concurrent sessions",
                "Unlimited workflows",
                "Team workspaces",
                "Priority support",
                "99.9% SLA",
              ],
              cta: "Contact Sales",
              highlighted: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-brand-500 bg-brand-500/5 shadow-lg shadow-brand-500/10"
                  : "border-gray-800 bg-gray-900/50"
              }`}
            >
              <div className="text-sm font-medium text-brand-400">
                {plan.name}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">
                  {plan.price}
                </span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="mt-2 text-sm text-gray-400">{plan.desc}</p>

              <button
                className={`mt-6 w-full rounded-xl py-3 text-sm font-semibold transition ${
                  plan.highlighted
                    ? "bg-brand-600 text-white hover:bg-brand-500"
                    : "border border-gray-700 text-white hover:border-gray-600"
                }`}
              >
                {plan.cta}
              </button>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-gray-300"
                  >
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-brand-400"
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

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-white">
          Ready to turn any website into an API?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-gray-400">
          Join thousands of developers automating the web with AI.
          Free to start, no credit card required.
        </p>
        <Link
          href="/studio"
          className="mt-8 inline-block rounded-xl bg-brand-600 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500"
        >
          Get Started — It's Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-brand-600 text-[10px] font-bold text-white">
                A
              </div>
              API for Anything
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white">Docs</a>
              <a href="#" className="hover:text-white">GitHub</a>
              <a href="#" className="hover:text-white">Twitter</a>
              <a href="#" className="hover:text-white">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
