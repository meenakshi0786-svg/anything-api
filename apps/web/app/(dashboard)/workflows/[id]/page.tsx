"use client";

import { useState, useEffect, use } from "react";
import { api } from "@/lib/api-client";

export default function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [workflow, setWorkflow] = useState<any>(null);
  const [testInput, setTestInput] = useState("{}");
  const [testResult, setTestResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "api" | "runs" | "settings">("overview");

  useEffect(() => {
    api.workflows.get(id).then((res) => {
      setWorkflow(res.data);
      if (res.data.inputSchema?.properties) {
        const example: Record<string, string> = {};
        for (const [key, schema] of Object.entries(res.data.inputSchema.properties) as any) {
          example[key] = schema.format === "uri" ? "https://example.com" : "";
        }
        setTestInput(JSON.stringify(example, null, 2));
      }
    });
  }, [id]);

  const handleTest = async () => {
    if (!workflow) return;
    setRunning(true);
    setTestResult(null);
    try {
      const input = JSON.parse(testInput);
      const result = await api.runs.execute(workflow.slug, input);
      setTestResult(result);
    } catch (err: any) {
      setTestResult({ error: err.message });
    } finally {
      setRunning(false);
    }
  };

  if (!workflow) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">{workflow.name}</h1>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            workflow.isActive ? "bg-green-500/10 text-green-400" : "bg-gray-700 text-gray-400"
          }`}>
            {workflow.isActive ? "Active" : "Inactive"}
          </span>
          <span className="text-xs text-gray-500">v{workflow.version}</span>
        </div>
        {workflow.description && (
          <p className="mt-1 text-sm text-gray-400">{workflow.description}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-gray-800">
        {(["overview", "api", "runs", "settings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-4 py-2 text-sm font-medium capitalize transition ${
              activeTab === tab
                ? "border-brand-500 text-white"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <div className="text-xs text-gray-500">Total Runs</div>
              <div className="mt-1 text-2xl font-bold text-white">
                {workflow.usageCount?.toLocaleString() || 0}
              </div>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <div className="text-xs text-gray-500">Avg Runtime</div>
              <div className="mt-1 text-2xl font-bold text-white">
                {workflow.avgRuntimeMs
                  ? `${(workflow.avgRuntimeMs / 1000).toFixed(1)}s`
                  : "N/A"}
              </div>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <div className="text-xs text-gray-500">Success Rate</div>
              <div className="mt-1 text-2xl font-bold text-green-400">
                {workflow.successRate ? `${workflow.successRate}%` : "N/A"}
              </div>
            </div>
          </div>

          {/* Steps preview */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <h3 className="mb-3 text-sm font-medium text-gray-300">
              Workflow Steps ({workflow.stepsCount})
            </h3>
            <div className="space-y-2">
              {Array.isArray(workflow.steps) &&
                (workflow.steps as any[]).map((step: any, i: number) => (
                  <div
                    key={step.id}
                    className="flex items-center gap-3 rounded-lg bg-gray-950 px-3 py-2"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 text-xs text-gray-400">
                      {i + 1}
                    </span>
                    <span className="rounded bg-brand-600/20 px-1.5 py-0.5 font-mono text-xs text-brand-400">
                      {step.type}
                    </span>
                    <span className="text-xs text-gray-400">{step.id}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "api" && (
        <div className="space-y-6">
          {/* Endpoint */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <h3 className="mb-2 text-sm font-medium text-gray-300">Endpoint</h3>
            <code className="block rounded-lg bg-gray-950 p-3 font-mono text-sm text-green-400">
              POST {process.env.NEXT_PUBLIC_API_URL}/v1/run/{workflow.slug}
            </code>
          </div>

          {/* Schemas */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <h3 className="mb-2 text-sm font-medium text-gray-300">Input Schema</h3>
              <pre className="rounded-lg bg-gray-950 p-3 font-mono text-xs text-gray-300 overflow-auto max-h-60">
                {JSON.stringify(workflow.inputSchema, null, 2)}
              </pre>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <h3 className="mb-2 text-sm font-medium text-gray-300">Output Schema</h3>
              <pre className="rounded-lg bg-gray-950 p-3 font-mono text-xs text-gray-300 overflow-auto max-h-60">
                {JSON.stringify(workflow.outputSchema, null, 2)}
              </pre>
            </div>
          </div>

          {/* API Playground */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <h3 className="mb-3 text-sm font-medium text-gray-300">
              API Playground
            </h3>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-gray-500">
                  Request Body (JSON)
                </label>
                <textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="h-40 w-full rounded-lg border border-gray-700 bg-gray-950 p-3 font-mono text-sm text-gray-300 focus:border-brand-500 focus:outline-none"
                />
                <button
                  onClick={handleTest}
                  disabled={running}
                  className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50"
                >
                  {running ? "Running..." : "Send Request"}
                </button>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">
                  Response
                </label>
                <pre className="h-40 overflow-auto rounded-lg border border-gray-700 bg-gray-950 p-3 font-mono text-xs text-gray-300">
                  {testResult
                    ? JSON.stringify(testResult, null, 2)
                    : "// Response will appear here"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "runs" && (
        <div className="text-center text-sm text-gray-500 py-10">
          Run history will appear here after executing the workflow.
        </div>
      )}

      {activeTab === "settings" && (
        <div className="max-w-lg space-y-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <h3 className="text-sm font-medium text-gray-300">Workflow Settings</h3>
            <pre className="mt-2 rounded-lg bg-gray-950 p-3 font-mono text-xs text-gray-300">
              {JSON.stringify(workflow.settings, null, 2)}
            </pre>
          </div>
          <button className="rounded-lg border border-red-800 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20">
            Delete Workflow
          </button>
        </div>
      )}
    </div>
  );
}
