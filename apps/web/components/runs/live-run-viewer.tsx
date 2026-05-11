"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api-client";

interface LiveRunViewerProps {
  workflowSlug: string;
  workflowId: string;
  input: Record<string, unknown>;
  onComplete?: (output: Record<string, unknown>) => void;
  onError?: (error: string) => void;
}

interface RunStep {
  id: string;
  stepId: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  startedAt?: string;
  completedAt?: string;
  runtimeMs?: number;
  output?: unknown;
  error?: { code: string; message: string };
}

interface Run {
  id: string;
  status: "queued" | "starting" | "running" | "completed" | "failed" | "cancelled";
  output?: Record<string, unknown>;
  error?: { code: string; message: string };
  runtimeMs?: number;
  startedAt?: string;
  completedAt?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-700 text-gray-400",
  running: "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/40",
  completed: "bg-green-500/15 text-green-400",
  failed: "bg-red-500/15 text-red-400",
  skipped: "bg-gray-600 text-gray-500",
};

const RUN_STATUS_COLORS: Record<string, string> = {
  queued: "text-yellow-400",
  starting: "text-yellow-400",
  running: "text-blue-400",
  completed: "text-green-400",
  failed: "text-red-400",
  cancelled: "text-gray-400",
};

export function LiveRunViewer({
  workflowSlug,
  workflowId: _workflowId,
  input,
  onComplete,
  onError,
}: LiveRunViewerProps) {
  const [run, setRun] = useState<Run | null>(null);
  const [steps, setSteps] = useState<RunStep[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAtRef = useRef<number>(Date.now());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    startedAtRef.current = Date.now();

    // 1. Kick off async run
    (async () => {
      try {
        const res = await api.runs.create({
          workflowSlug,
          input,
          mode: "async",
        });
        const runId = res.data.runId;
        if (!runId) {
          onError?.("Failed to start run");
          return;
        }

        if (cancelled) return;
        setRun({ id: runId, status: "queued" });

        // 2. Poll for status + steps
        pollRef.current = setInterval(async () => {
          try {
            const [runRes, stepsRes] = await Promise.all([
              api.runs.get(runId),
              api.runs.steps(runId),
            ]);
            if (cancelled) return;

            setRun(runRes.data);
            setSteps(stepsRes.data || []);

            const status = runRes.data.status;
            if (
              status === "completed" ||
              status === "failed" ||
              status === "cancelled"
            ) {
              if (pollRef.current) clearInterval(pollRef.current);
              pollRef.current = null;
              if (status === "completed" && runRes.data.output) {
                onComplete?.(runRes.data.output);
              } else if (status === "failed") {
                onError?.(runRes.data.error?.message || "Run failed");
              }
            }
          } catch {
            // ignore transient errors
          }
        }, 800);
      } catch (err: any) {
        onError?.(err.message || "Failed to start run");
      }
    })();

    // Elapsed-time ticker
    const ticker = setInterval(() => {
      setElapsedMs(Date.now() - startedAtRef.current);
    }, 100);

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
      clearInterval(ticker);
    };
  }, [workflowSlug, input, onComplete, onError]);

  const isFinished = run?.status === "completed" || run?.status === "failed" || run?.status === "cancelled";
  const totalRuntime = run?.runtimeMs || elapsedMs;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isFinished && (
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
          )}
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              run ? RUN_STATUS_COLORS[run.status] : "text-gray-500"
            }`}
          >
            {run?.status || "starting..."}
          </span>
        </div>
        <span className="font-mono text-xs text-gray-500">
          {(totalRuntime / 1000).toFixed(1)}s
        </span>
      </div>

      {/* Steps list */}
      <div className="space-y-1.5">
        {steps.length === 0 && !isFinished && (
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-700 border-t-gray-400" />
            Waiting for worker to pick up the job...
          </div>
        )}

        {steps.map((step) => (
          <StepRow key={step.stepId} step={step} />
        ))}
      </div>

      {/* Final output */}
      {run?.status === "completed" && run.output && (
        <div className="mt-4">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Output
          </div>
          <pre className="max-h-60 overflow-auto rounded-lg border border-gray-800 bg-gray-900 p-3 font-mono text-[11px] text-gray-300">
            {JSON.stringify(run.output, null, 2)}
          </pre>
        </div>
      )}

      {/* Error */}
      {run?.status === "failed" && run.error && (
        <div className="mt-4 rounded-lg border border-red-900/50 bg-red-950/30 p-3">
          <div className="text-xs font-semibold text-red-400">
            {run.error.code || "Run failed"}
          </div>
          <div className="mt-1 text-xs text-red-300">{run.error.message}</div>
        </div>
      )}
    </div>
  );
}

function StepRow({ step }: { step: RunStep }) {
  const [expanded, setExpanded] = useState(false);
  const colorClass = STATUS_COLORS[step.status] || STATUS_COLORS.pending;
  const hasOutput = step.output !== undefined && step.output !== null;

  return (
    <div
      className={`rounded-lg border px-3 py-2 transition ${
        step.status === "running"
          ? "border-blue-500/30 bg-blue-500/5"
          : step.status === "failed"
            ? "border-red-500/30 bg-red-500/5"
            : "border-gray-800 bg-gray-900/50"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        disabled={!hasOutput && !step.error}
        className="flex w-full items-center gap-3 text-left disabled:cursor-default"
      >
        {/* Status icon */}
        <div className="flex-shrink-0">
          {step.status === "running" ? (
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-400/30 border-t-blue-400" />
          ) : step.status === "completed" ? (
            <svg className="h-3.5 w-3.5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : step.status === "failed" ? (
            <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-700" />
          )}
        </div>

        {/* Step ID */}
        <span className="flex-1 truncate font-mono text-xs text-gray-300">
          {step.stepId}
        </span>

        {/* Status badge */}
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${colorClass}`}
        >
          {step.status}
        </span>

        {/* Runtime */}
        {step.runtimeMs !== undefined && step.runtimeMs !== null && (
          <span className="font-mono text-[10px] text-gray-500">
            {step.runtimeMs}ms
          </span>
        )}

        {(hasOutput || step.error) && (
          <svg
            className={`h-3 w-3 text-gray-500 transition ${expanded ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        )}
      </button>

      {expanded && (
        <div className="mt-2 border-t border-gray-800 pt-2">
          {step.error ? (
            <div className="text-[11px] text-red-300">
              <span className="font-semibold">{step.error.code}:</span>{" "}
              {step.error.message}
            </div>
          ) : (
            <pre className="max-h-32 overflow-auto font-mono text-[10px] text-gray-400">
              {JSON.stringify(step.output, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
