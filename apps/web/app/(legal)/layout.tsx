import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#030712]">
      <nav className="border-b border-gray-800/50">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600 text-sm font-bold text-gray-950">
              A
            </div>
            <span className="text-sm font-semibold text-white">
              API for Anything
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white"
          >
            ← Back to home
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <article className="legal-content">{children}</article>
      </main>
    </div>
  );
}
