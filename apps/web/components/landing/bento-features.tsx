"use client";

/**
 * Linear-style bento grid: featured cards with mini visualizations,
 * different sizes for visual rhythm.
 */
export function BentoFeatures() {
  return (
    <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <div className="inline-block rounded-full border border-gray-800 bg-gray-900/50 px-3 py-1 text-xs text-gray-400 backdrop-blur">
          Built for developers
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Everything you need.
          <br />
          <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            Nothing you don&apos;t.
          </span>
        </h2>
      </div>

      {/* Bento grid */}
      <div className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-6 lg:grid-rows-[auto_auto_auto]">
        {/* Big featured card — Studio chat */}
        <BentoCard
          className="lg:col-span-4 lg:row-span-2"
          eyebrow="Studio"
          title="Describe in English. Ship as API."
          description="Our AI planner reads your prompt, generates a multi-step workflow with input/output schemas, and exposes a REST endpoint. Self-healing keeps it working when sites change."
        >
          <ChatVisual />
        </BentoCard>

        {/* MCP card */}
        <BentoCard
          className="lg:col-span-2"
          eyebrow="MCP-native"
          title="Cursor + Claude Desktop"
          description="Each workflow becomes a tool inside your AI editor."
          accent="purple"
        >
          <MCPVisual />
        </BentoCard>

        {/* Self-healing */}
        <BentoCard
          className="lg:col-span-2"
          eyebrow="Self-healing"
          title="Auto-repairs broken workflows"
          description="When selectors break, AI patches them. Zero maintenance."
          accent="green"
        >
          <HealingVisual />
        </BentoCard>

        {/* Live execution */}
        <BentoCard
          className="lg:col-span-3"
          eyebrow="Observability"
          title="Live execution viewer"
          description="Watch each step run in real time. Click any step to inspect its output. Replay any past run."
          accent="cyan"
        >
          <LiveRunVisual />
        </BentoCard>

        {/* Marketplace */}
        <BentoCard
          className="lg:col-span-3"
          eyebrow="Marketplace"
          title="10 templates, one click"
          description="Pre-built workflows for Amazon, GitHub, Shopify, Hacker News, Yelp, Indeed, and more."
          accent="orange"
        >
          <MarketplaceVisual />
        </BentoCard>
      </div>
    </section>
  );
}

function BentoCard({
  className = "",
  eyebrow,
  title,
  description,
  children,
  accent = "brand",
}: {
  className?: string;
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  accent?: "brand" | "purple" | "green" | "cyan" | "orange";
}) {
  const accentColors = {
    brand: "from-brand-500/20 via-transparent to-transparent",
    purple: "from-purple-500/20 via-transparent to-transparent",
    green: "from-green-500/20 via-transparent to-transparent",
    cyan: "from-cyan-500/20 via-transparent to-transparent",
    orange: "from-orange-500/20 via-transparent to-transparent",
  };

  const accentText = {
    brand: "text-brand-400",
    purple: "text-purple-400",
    green: "text-green-400",
    cyan: "text-cyan-400",
    orange: "text-orange-400",
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/40 p-6 backdrop-blur transition hover:border-gray-700 hover:bg-gray-900/60 ${className}`}
    >
      {/* Accent gradient */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accentColors[accent]} opacity-50 transition group-hover:opacity-100`}
      />

      <div className="relative flex h-full flex-col">
        <div className="flex-shrink-0">
          <div className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${accentText[accent]}`}>
            {eyebrow}
          </div>
          <h3 className="mt-2 text-xl font-bold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">{description}</p>
        </div>
        {children && <div className="mt-6 flex-1">{children}</div>}
      </div>
    </div>
  );
}

// ─── Mini visuals for each card ──────────────────────────

function ChatVisual() {
  return (
    <div className="relative h-full min-h-[280px] rounded-xl border border-gray-800 bg-gray-950/60 p-4">
      <div className="space-y-3">
        <div className="ml-auto max-w-[70%] rounded-2xl bg-brand-600 px-3 py-2 text-xs text-white">
          Get product price from any Amazon URL
        </div>
        <div className="max-w-[80%] rounded-2xl bg-gray-800/80 px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <div className="flex gap-0.5">
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.3s]" />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.15s]" />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" />
            </div>
            Generating workflow...
          </div>
        </div>
        <div className="rounded-lg border border-green-700/40 bg-green-950/30 p-3">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="font-medium text-green-400">Workflow Ready</span>
          </div>
          <div className="mt-2 rounded bg-gray-950 px-2 py-1 font-mono text-[10px] text-green-400">
            POST /v1/run/amazon-product-scraper
          </div>
        </div>
      </div>
    </div>
  );
}

function MCPVisual() {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-3 font-mono text-[10px]">
      <div className="text-purple-400">{`{`}</div>
      <div className="ml-3 text-gray-400">
        <span className="text-brand-300">&quot;mcpServers&quot;</span>: {"{"}
      </div>
      <div className="ml-6 text-gray-400">
        <span className="text-brand-300">&quot;anything-api&quot;</span>: {"{"}
      </div>
      <div className="ml-9 text-gray-500">
        <span className="text-brand-300">&quot;command&quot;</span>:{" "}
        <span className="text-yellow-300">&quot;npx&quot;</span>
      </div>
      <div className="ml-6 text-gray-400">{"}"}</div>
      <div className="ml-3 text-gray-400">{"}"}</div>
      <div className="text-purple-400">{`}`}</div>
    </div>
  );
}

function HealingVisual() {
  return (
    <div className="space-y-2 rounded-xl border border-gray-800 bg-gray-950/60 p-3">
      <div className="flex items-center gap-2 text-[10px]">
        <svg className="h-3 w-3 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <code className="text-gray-400">.product-price → not found</code>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-gray-500">
        <svg className="h-3 w-3 animate-spin text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        AI patching selector...
      </div>
      <div className="flex items-center gap-2 text-[10px]">
        <svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        <code className="text-green-400">.a-price .a-offscreen → fixed</code>
      </div>
    </div>
  );
}

function LiveRunVisual() {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-3">
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
          <span className="font-semibold uppercase tracking-wider text-blue-400">Running</span>
        </div>
        <span className="font-mono text-gray-500">2.4s</span>
      </div>
      <div className="mt-2 space-y-1">
        {[
          { id: "navigate", status: "done", time: "1.2s" },
          { id: "wait_for_title", status: "done", time: "0.1s" },
          { id: "extract_data", status: "running", time: "..." },
          { id: "transform", status: "pending", time: "" },
        ].map((step) => (
          <div
            key={step.id}
            className="flex items-center gap-2 rounded bg-gray-900/60 px-2 py-1 text-[9px]"
          >
            {step.status === "done" && (
              <svg className="h-2.5 w-2.5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
            {step.status === "running" && (
              <div className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-blue-400/30 border-t-blue-400" />
            )}
            {step.status === "pending" && (
              <div className="h-2.5 w-2.5 rounded-full border-2 border-gray-700" />
            )}
            <span className="flex-1 truncate font-mono text-gray-300">{step.id}</span>
            <span className="font-mono text-gray-500">{step.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketplaceVisual() {
  const items = [
    { icon: "🛒", name: "Amazon" },
    { icon: "🐙", name: "GitHub" },
    { icon: "💼", name: "Indeed" },
    { icon: "📰", name: "HackerNews" },
    { icon: "☀️", name: "Weather" },
    { icon: "🍽️", name: "Yelp" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <div
          key={item.name}
          className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-950/60 px-2.5 py-2"
        >
          <span className="text-base">{item.icon}</span>
          <span className="text-[10px] font-medium text-gray-300">{item.name}</span>
        </div>
      ))}
    </div>
  );
}
