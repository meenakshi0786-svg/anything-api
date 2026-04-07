"use client";

import { useState } from "react";

type DocSection = "quickstart" | "api" | "sdk-python" | "sdk-typescript" | "workflows" | "runs" | "schedules" | "auth";

const sections: { id: DocSection; title: string }[] = [
  { id: "quickstart", title: "Quickstart" },
  { id: "auth", title: "Authentication" },
  { id: "workflows", title: "Workflows" },
  { id: "runs", title: "Runs" },
  { id: "schedules", title: "Schedules" },
  { id: "api", title: "API Reference" },
  { id: "sdk-python", title: "Python SDK" },
  { id: "sdk-typescript", title: "TypeScript SDK" },
];

export default function DocsPage() {
  const [active, setActive] = useState<DocSection>("quickstart");

  return (
    <div className="flex gap-8">
      {/* Sidebar nav */}
      <nav className="hidden w-48 flex-shrink-0 md:block">
        <div className="sticky top-6 space-y-1">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Documentation
          </div>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${
                active === s.id
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {active === "quickstart" && <Quickstart />}
        {active === "auth" && <Auth />}
        {active === "workflows" && <Workflows />}
        {active === "runs" && <Runs />}
        {active === "schedules" && <Schedules />}
        {active === "api" && <ApiReference />}
        {active === "sdk-python" && <PythonSDK />}
        {active === "sdk-typescript" && <TypeScriptSDK />}
      </div>
    </div>
  );
}

function CodeBlock({ title, code }: { title?: string; code: string }) {
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
      {title && (
        <div className="border-b border-gray-800 px-4 py-2 text-xs text-gray-500">
          {title}
        </div>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-gray-300">
        {code}
      </pre>
    </div>
  );
}

function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="mb-2 text-2xl font-bold text-white">{children}</h1>;
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2 mt-8 text-lg font-semibold text-white">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-sm leading-relaxed text-gray-400">{children}</p>;
}

function Quickstart() {
  return (
    <div>
      <H1>Quickstart</H1>
      <P>Go from zero to a working API in under 60 seconds.</P>

      <H2>1. Get your API key</H2>
      <P>Sign up and create an API key from the Settings page, or via the API:</P>
      <CodeBlock
        title="Create account + API key"
        code={`# Sign up
curl -X POST http://localhost:3001/v1/auth/signup \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Your Name","email":"you@email.com","password":"your-password"}'

# Create API key (use the token from signup response)
curl -X POST http://localhost:3001/v1/auth/api-keys \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"My Key"}'`}
      />

      <H2>2. Create a workflow</H2>
      <P>Describe what you want in plain English. The AI builds the automation.</P>
      <CodeBlock
        title="Create workflow from natural language"
        code={`curl -X POST http://localhost:3001/v1/workflows \\
  -H "Authorization: Bearer afa_sk_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "mode": "ai",
    "prompt": "Get product price and title from any Amazon URL"
  }'`}
      />

      <H2>3. Call your API</H2>
      <P>Your workflow is now a REST endpoint. Call it with any input.</P>
      <CodeBlock
        title="Run the workflow"
        code={`curl -X POST http://localhost:3001/v1/run/YOUR_WORKFLOW_SLUG \\
  -H "Authorization: Bearer afa_sk_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://amazon.com/dp/B09V3KXJPB"}'

# Response:
# {
#   "title": "Apple AirPods Pro",
#   "price": 189.99,
#   "_meta": { "run_id": "...", "runtime_ms": 3200 }
# }`}
      />
    </div>
  );
}

function Auth() {
  return (
    <div>
      <H1>Authentication</H1>
      <P>All API requests require authentication via JWT token or API key.</P>

      <H2>JWT Tokens</H2>
      <P>Obtained via signup/login. Used for dashboard sessions. Expire after 7 days.</P>
      <CodeBlock code={`Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`} />

      <H2>API Keys</H2>
      <P>Created via the dashboard or API. Used for programmatic access. Format: afa_sk_live_*</P>
      <CodeBlock code={`Authorization: Bearer afa_sk_live_dbe937e65cf96b1c...`} />

      <H2>Endpoints</H2>
      <div className="overflow-hidden rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900 text-left text-xs text-gray-500">
              <th className="px-4 py-2">Method</th>
              <th className="px-4 py-2">Endpoint</th>
              <th className="px-4 py-2">Description</th>
            </tr>
          </thead>
          <tbody className="text-gray-400">
            <tr className="border-b border-gray-800/50"><td className="px-4 py-2 font-mono text-green-400">POST</td><td className="px-4 py-2 font-mono">/v1/auth/signup</td><td className="px-4 py-2">Create account</td></tr>
            <tr className="border-b border-gray-800/50"><td className="px-4 py-2 font-mono text-green-400">POST</td><td className="px-4 py-2 font-mono">/v1/auth/login</td><td className="px-4 py-2">Login</td></tr>
            <tr className="border-b border-gray-800/50"><td className="px-4 py-2 font-mono text-blue-400">GET</td><td className="px-4 py-2 font-mono">/v1/auth/me</td><td className="px-4 py-2">Current user</td></tr>
            <tr className="border-b border-gray-800/50"><td className="px-4 py-2 font-mono text-green-400">POST</td><td className="px-4 py-2 font-mono">/v1/auth/api-keys</td><td className="px-4 py-2">Create API key</td></tr>
            <tr className="border-b border-gray-800/50"><td className="px-4 py-2 font-mono text-blue-400">GET</td><td className="px-4 py-2 font-mono">/v1/auth/api-keys</td><td className="px-4 py-2">List API keys</td></tr>
            <tr><td className="px-4 py-2 font-mono text-red-400">DELETE</td><td className="px-4 py-2 font-mono">/v1/auth/api-keys/:id</td><td className="px-4 py-2">Revoke key</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Workflows() {
  return (
    <div>
      <H1>Workflows</H1>
      <P>Workflows are reusable automations exposed as API endpoints. Create them from natural language or define steps manually.</P>

      <H2>Create (AI mode)</H2>
      <CodeBlock
        code={`POST /v1/workflows
{
  "mode": "ai",
  "prompt": "Get product price and reviews from any Amazon URL",
  "testInput": { "url": "https://amazon.com/dp/B09V3KXJPB" }
}`}
      />

      <H2>Create (Manual mode)</H2>
      <CodeBlock
        code={`POST /v1/workflows
{
  "mode": "manual",
  "name": "My Scraper",
  "steps": [
    { "id": "s1", "type": "navigate", "config": { "url": "{{input.url}}" } },
    { "id": "s2", "type": "extract", "config": { "strategy": "ai", "aiPrompt": "Get the price" }, "dependsOn": ["s1"] }
  ]
}`}
      />

      <H2>Step Types</H2>
      <div className="overflow-hidden rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900 text-left text-xs text-gray-500">
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Description</th>
            </tr>
          </thead>
          <tbody className="text-gray-400">
            {[
              ["navigate", "Go to a URL"],
              ["click", "Click an element"],
              ["type_text", "Type into an input field"],
              ["wait_for", "Wait for element or condition"],
              ["extract", "Pull data from page (selector/AI/hybrid)"],
              ["paginate", "Loop through pages"],
              ["scroll", "Scroll to load content"],
              ["transform", "Reshape extracted data"],
              ["ai_decide", "Let AI make a runtime decision"],
            ].map(([type, desc]) => (
              <tr key={type} className="border-b border-gray-800/50">
                <td className="px-4 py-2 font-mono text-brand-400">{type}</td>
                <td className="px-4 py-2">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Runs() {
  return (
    <div>
      <H1>Runs</H1>
      <P>Execute workflows and get structured JSON results.</P>

      <H2>Sync Run (simplest)</H2>
      <CodeBlock
        code={`POST /v1/run/:workflow_slug
{ "url": "https://amazon.com/dp/B09V3KXJPB" }

# Response — direct JSON output:
{
  "title": "Apple AirPods Pro",
  "price": 189.99,
  "_meta": { "run_id": "run_xyz", "runtime_ms": 3200 }
}`}
      />

      <H2>Async Run</H2>
      <CodeBlock
        code={`POST /v1/runs
{
  "workflowSlug": "amazon-scraper",
  "input": { "url": "..." },
  "mode": "async",
  "webhookUrl": "https://yourapp.com/webhook"
}

# Response:
{ "runId": "run_xyz", "status": "queued", "pollUrl": "/v1/runs/run_xyz" }`}
      />

      <H2>Batch Run</H2>
      <CodeBlock
        code={`POST /v1/runs/batch
{
  "workflowId": "wf_abc",
  "inputs": [
    { "url": "https://amazon.com/dp/A" },
    { "url": "https://amazon.com/dp/B" },
    { "url": "https://amazon.com/dp/C" }
  ],
  "concurrency": 3
}`}
      />
    </div>
  );
}

function Schedules() {
  return (
    <div>
      <H1>Schedules</H1>
      <P>Run workflows on a cron schedule with automatic webhook delivery.</P>

      <CodeBlock
        code={`POST /v1/schedules
{
  "workflowId": "wf_abc123",
  "cron": "0 */6 * * *",
  "timezone": "America/New_York",
  "input": { "url": "https://amazon.com/dp/B09V3KXJPB" },
  "webhookUrl": "https://yourapp.com/webhook/price-update"
}`}
      />

      <H2>Common Cron Patterns</H2>
      <div className="overflow-hidden rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900 text-left text-xs text-gray-500">
              <th className="px-4 py-2">Expression</th>
              <th className="px-4 py-2">Schedule</th>
            </tr>
          </thead>
          <tbody className="text-gray-400 font-mono">
            <tr className="border-b border-gray-800/50"><td className="px-4 py-2">0 */6 * * *</td><td className="px-4 py-2 font-sans">Every 6 hours</td></tr>
            <tr className="border-b border-gray-800/50"><td className="px-4 py-2">0 8 * * 1-5</td><td className="px-4 py-2 font-sans">Weekdays at 8 AM</td></tr>
            <tr className="border-b border-gray-800/50"><td className="px-4 py-2">0 0 * * *</td><td className="px-4 py-2 font-sans">Daily at midnight</td></tr>
            <tr><td className="px-4 py-2">0 0 * * 0</td><td className="px-4 py-2 font-sans">Weekly on Sunday</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApiReference() {
  return (
    <div>
      <H1>API Reference</H1>
      <P>Base URL: <code className="rounded bg-gray-800 px-2 py-0.5 text-brand-400">http://localhost:3001/v1</code></P>

      <H2>All Endpoints</H2>
      <div className="overflow-hidden rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900 text-left text-xs text-gray-500">
              <th className="px-4 py-2">Method</th>
              <th className="px-4 py-2">Endpoint</th>
              <th className="px-4 py-2">Description</th>
            </tr>
          </thead>
          <tbody className="text-gray-400">
            {[
              ["POST", "/auth/signup", "Create account"],
              ["POST", "/auth/login", "Login"],
              ["GET", "/auth/me", "Current user"],
              ["POST", "/auth/api-keys", "Create API key"],
              ["GET", "/auth/api-keys", "List API keys"],
              ["DELETE", "/auth/api-keys/:id", "Revoke key"],
              ["POST", "/workflows", "Create workflow"],
              ["GET", "/workflows", "List workflows"],
              ["GET", "/workflows/:id", "Get workflow"],
              ["PUT", "/workflows/:id", "Update workflow"],
              ["DELETE", "/workflows/:id", "Delete workflow"],
              ["POST", "/run/:slug", "Sync run"],
              ["POST", "/runs", "Async run"],
              ["GET", "/runs/:id", "Get run status"],
              ["GET", "/runs/:id/steps", "Get run steps"],
              ["GET", "/runs/:id/logs", "Get run logs"],
              ["POST", "/runs/batch", "Batch run"],
              ["POST", "/runs/:id/cancel", "Cancel run"],
              ["POST", "/schedules", "Create schedule"],
              ["GET", "/schedules", "List schedules"],
              ["DELETE", "/schedules/:id", "Delete schedule"],
            ].map(([method, path, desc]) => (
              <tr key={path + method} className="border-b border-gray-800/50">
                <td className={`px-4 py-2 font-mono ${method === "GET" ? "text-blue-400" : method === "DELETE" ? "text-red-400" : method === "PUT" ? "text-yellow-400" : "text-green-400"}`}>{method}</td>
                <td className="px-4 py-2 font-mono">/v1{path}</td>
                <td className="px-4 py-2">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PythonSDK() {
  return (
    <div>
      <H1>Python SDK</H1>
      <P>Install: <code className="rounded bg-gray-800 px-2 py-0.5 text-green-400">pip install anythingapi</code></P>

      <CodeBlock
        title="python"
        code={`from anythingapi import AnythingAPI

client = AnythingAPI(api_key="afa_sk_live_xxx")

# Create workflow from natural language
workflow = client.workflows.create(
    prompt="Get product price from any Amazon URL",
    test_input={"url": "https://amazon.com/dp/B09V3KXJPB"}
)

# Run workflow
result = client.run("amazon-product-scraper", url="https://amazon.com/dp/B09V3KXJPB")
print(result.title)   # "Apple AirPods Pro"
print(result.price)   # 189.99

# Async run
run = client.runs.create(workflow="amazon-scraper", input={"url": "..."}, mode="async")
run = client.runs.wait(run.run_id)
print(run.output)

# Schedule
client.schedules.create(
    workflow_id="wf_abc",
    cron="0 */6 * * *",
    input={"url": "..."},
    webhook_url="https://yourapp.com/hook"
)`}
      />
    </div>
  );
}

function TypeScriptSDK() {
  return (
    <div>
      <H1>TypeScript SDK</H1>
      <P>Install: <code className="rounded bg-gray-800 px-2 py-0.5 text-green-400">npm install @anythingapi/sdk</code></P>

      <CodeBlock
        title="typescript"
        code={`import { AnythingAPI } from '@anythingapi/sdk';

const client = new AnythingAPI({ apiKey: 'afa_sk_live_xxx' });

// Create workflow
const workflow = await client.workflows.create({
  prompt: 'Get product price from any Amazon URL',
  testInput: { url: 'https://amazon.com/dp/B09V3KXJPB' },
});

// Sync run
const result = await client.run('amazon-product-scraper', {
  url: 'https://amazon.com/dp/B09V3KXJPB',
});
console.log(result.title);  // "Apple AirPods Pro"
console.log(result.price);  // 189.99

// Async run with polling
const run = await client.runs.create({
  workflowSlug: 'amazon-scraper',
  input: { url: '...' },
  mode: 'async',
});
const completed = await client.runs.wait(run.runId!);
console.log(completed.output);

// Batch
const batch = await client.runs.batch({
  workflowId: 'wf_abc',
  inputs: [{ url: '...' }, { url: '...' }],
  concurrency: 3,
});`}
      />
    </div>
  );
}
