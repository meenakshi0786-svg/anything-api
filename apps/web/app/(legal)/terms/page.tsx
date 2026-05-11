import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for API for Anything.",
};

export default function TermsPage() {
  return (
    <div className="space-y-6 text-gray-300">
      <div>
        <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
        <p className="mt-2 text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="rounded-xl border border-yellow-900/30 bg-yellow-950/20 p-5">
        <p className="text-sm">
          <strong className="text-yellow-400">TL;DR:</strong> Don&apos;t use this to scrape sites that prohibit it, don&apos;t do anything illegal, and don&apos;t blame us if you get rate-limited.
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-white">1. Acceptable use</h2>
        <p>You agree not to use the platform to:</p>
        <ul className="ml-6 list-disc space-y-1">
          <li>Violate any law, rule, or regulation</li>
          <li>Scrape websites in ways that violate their terms of service or robots.txt</li>
          <li>Harvest personal data without consent</li>
          <li>Attempt to bypass authentication on sites you don&apos;t own</li>
          <li>Send spam, phishing, or harassing content</li>
          <li>Run automated workflows that overload third-party services</li>
          <li>Reverse engineer, decompile, or attack our infrastructure</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">2. Your content</h2>
        <p>
          You own all workflows, data, and outputs you create. We don&apos;t claim any rights to your content. You grant us a limited license to host and process your content solely to provide the service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">3. Open source license</h2>
        <p>
          The API for Anything platform (server, worker, web, SDKs) is licensed under the MIT License. You can self-host, fork, modify, and redistribute it. The hosted version is governed by these Terms.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">4. Payment & billing (hosted version)</h2>
        <ul className="ml-6 list-disc space-y-1">
          <li>Free tier: 100 runs/month, 5 browser hours, 2 concurrent sessions</li>
          <li>Paid plans bill monthly via Stripe</li>
          <li>You can cancel anytime — no refunds for partial months</li>
          <li>Going over your plan limits will throttle further runs until next billing cycle or upgrade</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">5. Service availability</h2>
        <p>
          We aim for 99.9% uptime on paid plans. The free tier and self-hosted version come with no SLA. Scheduled maintenance is announced in advance via email and our status page.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">6. Termination</h2>
        <p>
          You can delete your account at any time. We may suspend accounts that violate these Terms, after written notice when feasible. Egregious violations (CSAM, fraud, attacks) result in immediate suspension.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">7. Limitation of liability</h2>
        <p>
          The platform is provided &quot;as is&quot;. To the maximum extent permitted by law, our total liability for any claim is limited to the amount you paid in the 12 months preceding the claim (or $50 for free-tier users). We&apos;re not liable for lost profits, indirect damages, or consequential damages.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">8. Disputes</h2>
        <p>
          These Terms are governed by the laws of Delaware, USA. Any dispute will be resolved in the courts of Delaware unless we mutually agree to arbitration.
        </p>
      </section>

      <p className="text-sm text-gray-500">
        Questions? Email <a href="mailto:legal@anythingapi.com" className="text-brand-400 hover:underline">legal@anythingapi.com</a>.
      </p>
    </div>
  );
}
