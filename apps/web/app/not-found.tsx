import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#030712] px-6 text-center">
      {/* Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 600,
          height: 400,
          background:
            "radial-gradient(ellipse at center, rgba(57,255,20,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative">
        <div className="font-mono text-[120px] font-bold leading-none">
          <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            404
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-bold text-white">
          Workflow not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist. Maybe it got scraped,
          or you typed the URL wrong, or it never existed in the first place.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-500"
          >
            Back to home
          </Link>
          <Link
            href="/studio"
            className="rounded-lg border border-gray-700 px-5 py-2.5 text-sm text-gray-300 hover:border-gray-600 hover:text-white"
          >
            Open Studio
          </Link>
        </div>

        {/* Easter egg */}
        <details className="mt-12 text-left">
          <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-400">
            What would API for Anything have done?
          </summary>
          <pre className="mt-3 inline-block overflow-auto rounded-lg border border-gray-800 bg-gray-900 p-4 text-left font-mono text-xs text-gray-400">
{`curl -X POST /v1/run/find-missing-page \\
  -d '{"url": "${typeof window !== "undefined" ? window.location.href : "this page"}"}'

# {
#   "found": false,
#   "suggestions": ["/", "/studio", "/marketplace", "/docs"]
# }`}
          </pre>
        </details>
      </div>
    </div>
  );
}
