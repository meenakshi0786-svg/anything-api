"use client";

import { useState } from "react";

export default function RunsPage() {
  const [filter, setFilter] = useState<"all" | "completed" | "failed" | "running">("all");

  // Placeholder data for UI — will be replaced with API calls
  const runs = [
    {
      id: "run_001",
      workflow: "Amazon Product Scraper",
      slug: "amazon-product-scraper",
      status: "completed",
      runtimeMs: 3200,
      startedAt: "2026-04-07T10:30:00Z",
      mode: "sync",
    },
    {
      id: "run_002",
      workflow: "LinkedIn Job Search",
      slug: "linkedin-job-search",
      status: "running",
      runtimeMs: null,
      startedAt: "2026-04-07T10:35:00Z",
      mode: "async",
    },
    {
      id: "run_003",
      workflow: "Amazon Product Scraper",
      slug: "amazon-product-scraper",
      status: "failed",
      runtimeMs: 8500,
      startedAt: "2026-04-07T09:15:00Z",
      mode: "sync",
    },
  ];

  const statusColors: Record<string, string> = {
    completed: "bg-green-500/10 text-green-400",
    running: "bg-blue-500/10 text-blue-400",
    failed: "bg-red-500/10 text-red-400",
    queued: "bg-yellow-500/10 text-yellow-400",
    cancelled: "bg-gray-500/10 text-gray-400",
  };

  const filtered = filter === "all" ? runs : runs.filter((r) => r.status === filter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Run History</h1>
        <p className="mt-1 text-sm text-gray-400">
          Track all workflow executions
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-2">
        {(["all", "completed", "running", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
              filter === f
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Runs table */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-left text-xs font-medium text-gray-500">
              <th className="px-4 py-3">Run ID</th>
              <th className="px-4 py-3">Workflow</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Mode</th>
              <th className="px-4 py-3">Runtime</th>
              <th className="px-4 py-3">Started</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((run) => (
              <tr
                key={run.id}
                className="border-b border-gray-800/50 transition hover:bg-gray-800/30 cursor-pointer"
              >
                <td className="px-4 py-3 font-mono text-xs text-gray-400">
                  {run.id}
                </td>
                <td className="px-4 py-3 text-sm text-white">{run.workflow}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[run.status]}`}
                  >
                    {run.status === "running" && (
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                    )}
                    {run.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{run.mode}</td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {run.runtimeMs ? `${(run.runtimeMs / 1000).toFixed(1)}s` : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(run.startedAt).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
