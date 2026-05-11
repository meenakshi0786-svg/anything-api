"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";

interface Run {
  id: string;
  workflowId: string;
  workflowName: string;
  workflowSlug: string | null;
  status: "queued" | "starting" | "running" | "completed" | "failed" | "cancelled";
  mode: string;
  runtimeMs: number | null;
  stepCount: number | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  error: { code: string; message: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  queued: "bg-yellow-500/10 text-yellow-400",
  starting: "bg-yellow-500/10 text-yellow-400",
  running: "bg-blue-500/10 text-blue-400",
  completed: "bg-green-500/10 text-green-400",
  failed: "bg-red-500/10 text-red-400",
  cancelled: "bg-gray-500/10 text-gray-400",
};

export default function RunsPage() {
  const [filter, setFilter] = useState<"all" | "completed" | "failed" | "running">("all");
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadRuns = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params: any = { perPage: 50 };
      if (filter !== "all") params.status = filter;
      const res = await api.runs.list(params);
      setRuns(res.data || []);
      setError("");
    } catch (err: any) {
      if (!silent) setError(err.message || "Failed to load runs");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();

    // Poll every 3s for updates (only if there are active runs)
    pollRef.current = setInterval(() => {
      const hasActive = runs.some(
        (r) => r.status === "running" || r.status === "queued" || r.status === "starting"
      );
      if (hasActive) loadRuns(true);
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Always poll if there are active runs
  useEffect(() => {
    const hasActive = runs.some(
      (r) => r.status === "running" || r.status === "queued" || r.status === "starting"
    );
    if (hasActive && !pollRef.current) {
      pollRef.current = setInterval(() => loadRuns(true), 2000);
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runs]);

  const activeCount = runs.filter(
    (r) => r.status === "running" || r.status === "queued" || r.status === "starting"
  ).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Run History</h1>
          <p className="mt-1 text-sm text-gray-400">
            Track all workflow executions
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <div className="flex items-center gap-2 rounded-full border border-blue-800/50 bg-blue-950/30 px-3 py-1 text-xs">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
              <span className="text-blue-300">
                {activeCount} active run{activeCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
          <button
            onClick={() => loadRuns()}
            className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 hover:border-gray-600 hover:text-white"
          >
            Refresh
          </button>
        </div>
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

      {error && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Runs table */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        {loading ? (
          <div className="space-y-1 p-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-gray-800/50" />
            ))}
          </div>
        ) : runs.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-gray-400">No runs yet</p>
            <p className="mt-1 text-xs text-gray-500">
              Execute a workflow from{" "}
              <Link href="/studio" className="text-brand-400 hover:underline">
                Studio
              </Link>{" "}
              or{" "}
              <Link href="/workflows" className="text-brand-400 hover:underline">
                Workflows
              </Link>
            </p>
          </div>
        ) : (
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
              {runs.map((run) => {
                const RowEl = run.workflowSlug ? Link : "div";
                const rowProps = run.workflowSlug
                  ? { href: `/workflows/${run.workflowId}` as any }
                  : {};
                return (
                  <tr
                    key={run.id}
                    className="border-b border-gray-800/50 transition hover:bg-gray-800/30"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      {run.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">
                      <RowEl {...(rowProps as any)} className="hover:text-brand-400">
                        {run.workflowName}
                      </RowEl>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[run.status] || STATUS_COLORS.cancelled
                        }`}
                      >
                        {run.status === "running" && (
                          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                        )}
                        {run.status === "queued" && (
                          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
                        )}
                        {run.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{run.mode}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {run.runtimeMs
                        ? `${(run.runtimeMs / 1000).toFixed(1)}s`
                        : run.status === "running"
                          ? "..."
                          : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {run.startedAt
                        ? new Date(run.startedAt).toLocaleString()
                        : new Date(run.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Updates automatically every 2s while runs are active
      </p>
    </div>
  );
}
