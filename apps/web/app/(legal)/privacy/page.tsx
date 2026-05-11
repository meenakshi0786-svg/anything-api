import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How API for Anything handles your data.",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-6 text-gray-300">
      <div>
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="rounded-xl border border-green-900/30 bg-green-950/20 p-5">
        <p className="text-sm">
          <strong className="text-green-400">TL;DR:</strong> If you self-host, your data never touches our servers. The only outbound calls go to your AI provider (OpenAI/Anthropic/OpenRouter) for workflow planning and extraction. We keep this short and human-readable on purpose.
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-white">1. What we collect</h2>
        <p>
          When you use the hosted version of API for Anything, we collect:
        </p>
        <ul className="ml-6 list-disc space-y-1">
          <li>Your email and password (hashed with scrypt — we never see plaintext)</li>
          <li>Workflows you create (steps, schemas, settings)</li>
          <li>Run history (inputs, outputs, runtime, error logs)</li>
          <li>API key metadata (creation time, last used, prefix only)</li>
          <li>Standard server logs (IP, user agent, timestamps)</li>
        </ul>
        <p className="mt-3">
          We do <strong>not</strong> collect: third-party tracking cookies, marketing pixels, browsing history outside our app.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">2. What we send to LLM providers</h2>
        <p>
          When you create or run a workflow, we send the following to your configured LLM provider (OpenAI, Anthropic, or OpenRouter):
        </p>
        <ul className="ml-6 list-disc space-y-1">
          <li>Your natural language prompt (for planning)</li>
          <li>The simplified DOM of pages being scraped (for extraction)</li>
          <li>Step configs and run inputs</li>
        </ul>
        <p className="mt-3">
          We <strong>never</strong> send credentials stored in your vault to LLMs.
          Vault data is decrypted only inside the browser session.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">3. Data retention</h2>
        <ul className="ml-6 list-disc space-y-1">
          <li>Workflows: kept until you delete them</li>
          <li>Run logs: 30 days (free tier), 90 days (pro), unlimited (enterprise)</li>
          <li>Screenshots and DOM snapshots: 7 days</li>
          <li>Account data: kept until you request deletion</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">4. Your rights (GDPR / CCPA)</h2>
        <p>You can:</p>
        <ul className="ml-6 list-disc space-y-1">
          <li>Export all your data via Settings → Export</li>
          <li>Delete your account at any time</li>
          <li>Request a copy of any data we hold about you</li>
          <li>Opt out of any non-essential processing</li>
        </ul>
        <p className="mt-3">
          Email <a href="mailto:privacy@anythingapi.com" className="text-brand-400 hover:underline">privacy@anythingapi.com</a> to exercise any of these rights.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">5. Self-hosting</h2>
        <p>
          When you self-host the open source version, none of this applies — your data lives entirely on your infrastructure. We have no visibility, no telemetry, no phone-home.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">6. Changes</h2>
        <p>
          We&apos;ll email you and post a notice on this page if we materially change anything. No surprises.
        </p>
      </section>

      <p className="text-sm text-gray-500">
        Questions? Email <a href="mailto:privacy@anythingapi.com" className="text-brand-400 hover:underline">privacy@anythingapi.com</a>.
      </p>
    </div>
  );
}
