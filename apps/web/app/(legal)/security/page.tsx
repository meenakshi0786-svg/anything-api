import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security",
  description: "How API for Anything keeps your data secure.",
};

export default function SecurityPage() {
  return (
    <div className="space-y-6 text-gray-300">
      <div>
        <h1 className="text-3xl font-bold text-white">Security</h1>
        <p className="mt-2 text-sm text-gray-500">
          How we protect your data.
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-white">Authentication</h2>
        <ul className="ml-6 list-disc space-y-1">
          <li>Passwords hashed with <code className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-brand-400">scrypt</code> using a per-user salt — we never see plaintext</li>
          <li>JWT tokens signed with HS256, 7-day expiry, rotatable</li>
          <li>API keys hashed with SHA-256 in the database — only the prefix is visible after creation</li>
          <li>OAuth via Google and GitHub (email scope only)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">Encryption</h2>
        <ul className="ml-6 list-disc space-y-1">
          <li>All connections over HTTPS with TLS 1.2+</li>
          <li>Credential vault encrypted with AES-256-GCM at rest</li>
          <li>Vault contents are decrypted only inside the browser session — never sent to LLMs</li>
          <li>Database connections encrypted in transit</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">Infrastructure</h2>
        <ul className="ml-6 list-disc space-y-1">
          <li>Hosted version runs on isolated containers per user session</li>
          <li>Browser sessions are ephemeral — destroyed after each run</li>
          <li>Workers run in sandboxed environments with no persistent disk access</li>
          <li>PostgreSQL with daily encrypted backups, 30-day retention</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">LLM Provider Boundary</h2>
        <p>
          When you create or run a workflow, we send page DOM and your prompt to your configured LLM provider (OpenAI / Anthropic / OpenRouter). We <strong>never</strong> send:
        </p>
        <ul className="ml-6 list-disc space-y-1">
          <li>Vault credentials</li>
          <li>API keys</li>
          <li>Other users&apos; data</li>
          <li>Authentication tokens</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">Compliance</h2>
        <ul className="ml-6 list-disc space-y-1">
          <li>GDPR-compliant data handling (export, delete, opt-out)</li>
          <li>SOC 2 Type II — in progress, expected Q3 2026</li>
          <li>HIPAA — not currently supported, do not use for PHI</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">Reporting vulnerabilities</h2>
        <p>
          Found a security issue? Please report responsibly:
        </p>
        <div className="mt-2 rounded-lg border border-gray-800 bg-gray-900 p-4">
          <p className="text-sm">
            Email: <a href="mailto:security@anythingapi.com" className="text-brand-400 hover:underline">security@anythingapi.com</a>
          </p>
          <p className="mt-1 text-sm">
            We acknowledge reports within 24 hours and resolve critical issues within 72 hours. We don&apos;t currently run a paid bug bounty program.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">Self-host security</h2>
        <p>
          When self-hosting, you&apos;re responsible for:
        </p>
        <ul className="ml-6 list-disc space-y-1">
          <li>Generating a strong <code className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-brand-400">JWT_SECRET</code> (use <code className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-brand-400">openssl rand -hex 32</code>)</li>
          <li>Securing your PostgreSQL and Redis instances</li>
          <li>Keeping your VPS patched</li>
          <li>Restricting database/Redis ports to localhost</li>
          <li>Using HTTPS in production (Caddy/nginx + Let&apos;s Encrypt)</li>
        </ul>
      </section>
    </div>
  );
}
