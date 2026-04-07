"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";

interface Workflow {
  id: string;
  slug: string;
  name: string;
  description?: string;
  version: number;
  endpoint: string;
  isActive: boolean;
  usageCount: number;
  avgRuntimeMs?: number;
  successRate?: number;
  updatedAt: string;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.workflows
      .list()
      .then((res) => setWorkflows(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workflows</h1>
          <p className="mt-1 text-sm text-gray-400">
            Your API-ready automations
          </p>
        </div>
        <Link
          href="/studio"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
        >
          + Create Workflow
        </Link>
      </div>

      {/* Workflows grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl border border-gray-800 bg-gray-900"
            />
          ))}
        </div>
      ) : workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 py-20">
          <div className="mb-4 rounded-full bg-gray-800 p-4">
            <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white">No workflows yet</h3>
          <p className="mt-1 text-sm text-gray-400">
            Describe what you want to automate and we'll build the API
          </p>
          <Link
            href="/studio"
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
          >
            Open Studio
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workflows.map((wf) => (
            <Link
              key={wf.id}
              href={`/workflows/${wf.id}`}
              className="group rounded-xl border border-gray-800 bg-gray-900 p-5 transition hover:border-gray-700 hover:bg-gray-800/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600/20 text-brand-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
                  </svg>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    wf.isActive
                      ? "bg-green-500/10 text-green-400"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {wf.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <h3 className="mt-3 font-semibold text-white group-hover:text-brand-400">
                {wf.name}
              </h3>
              {wf.description && (
                <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                  {wf.description}
                </p>
              )}

              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                <span>v{wf.version}</span>
                <span>{wf.usageCount.toLocaleString()} runs</span>
                {wf.avgRuntimeMs && (
                  <span>{(wf.avgRuntimeMs / 1000).toFixed(1)}s avg</span>
                )}
                {wf.successRate && (
                  <span className="text-green-400">{wf.successRate}%</span>
                )}
              </div>

              <div className="mt-3 rounded-lg bg-gray-950 px-3 py-1.5 font-mono text-xs text-gray-400">
                POST /v1/run/{wf.slug}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
