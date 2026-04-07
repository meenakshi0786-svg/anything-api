"use client";

interface WorkflowPreviewProps {
  workflow: any | null;
}

export function WorkflowPreview({ workflow }: WorkflowPreviewProps) {
  if (!workflow) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-900/50 p-6">
        <div className="mb-3 rounded-full bg-gray-800 p-3">
          <svg
            className="h-6 w-6 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z"
            />
          </svg>
        </div>
        <p className="text-center text-sm text-gray-500">
          Describe a task in the chat to see the workflow preview here
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-800 bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">{workflow.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              workflow.status === "ready" || workflow.status === "planning"
                ? "bg-green-500/10 text-green-400"
                : "bg-yellow-500/10 text-yellow-400"
            }`}
          >
            {workflow.status === "planning" ? "Building..." : "Ready"}
          </span>
          {workflow.version && (
            <span className="text-[10px] text-gray-500">v{workflow.version}</span>
          )}
        </div>
      </div>

      {/* Workflow visualization */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Endpoint */}
        <div className="mb-4">
          <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Endpoint
          </div>
          <code className="mt-1 block rounded-lg bg-gray-950 px-3 py-2 font-mono text-xs text-green-400">
            POST /v1/run/{workflow.slug}
          </code>
        </div>

        {/* Input Schema */}
        {workflow.inputSchema && Object.keys(workflow.inputSchema).length > 0 && (
          <div className="mb-4">
            <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
              Input
            </div>
            <div className="mt-1 rounded-lg bg-gray-950 p-3">
              <pre className="font-mono text-[11px] text-gray-400">
                {JSON.stringify(workflow.inputSchema, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Output Schema */}
        {workflow.outputSchema && Object.keys(workflow.outputSchema).length > 0 && (
          <div className="mb-4">
            <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
              Output
            </div>
            <div className="mt-1 rounded-lg bg-gray-950 p-3">
              <pre className="font-mono text-[11px] text-gray-400">
                {JSON.stringify(workflow.outputSchema, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Steps */}
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Steps
          </div>
          <div className="mt-2 space-y-2">
            {workflow.steps ? (
              (workflow.steps as any[]).map((step: any, i: number) => (
                <div
                  key={step.id || i}
                  className="flex items-center gap-2 rounded-lg bg-gray-950 px-3 py-2"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600/30 text-[10px] font-medium text-brand-400">
                    {i + 1}
                  </div>
                  <span className="rounded bg-gray-800 px-1.5 py-0.5 font-mono text-[10px] text-gray-300">
                    {step.type}
                  </span>
                  {i < (workflow.steps as any[]).length - 1 && (
                    <div className="ml-2 h-px flex-1 bg-gray-800" />
                  )}
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 py-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                <span className="text-xs text-gray-400">
                  AI is generating steps...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-800 p-3 flex gap-2">
        <button className="flex-1 rounded-lg bg-brand-600 py-2 text-xs font-medium text-white hover:bg-brand-500">
          Deploy as API
        </button>
        <button className="rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white">
          Edit
        </button>
      </div>
    </div>
  );
}
