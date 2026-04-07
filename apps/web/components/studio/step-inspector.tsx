"use client";

import { useState, useEffect } from "react";
import type { StepNodeData } from "./step-node";

interface StepInspectorProps {
  step: StepNodeData | null;
  onUpdate: (stepId: string, updates: Partial<StepNodeData>) => void;
  onDelete: (stepId: string) => void;
  onClose: () => void;
}

const STEP_COLORS: Record<string, { bg: string; text: string }> = {
  navigate:   { bg: "bg-blue-500/20",   text: "text-blue-400" },
  click:      { bg: "bg-green-500/20",  text: "text-green-400" },
  extract:    { bg: "bg-purple-500/20", text: "text-purple-400" },
  type_text:  { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  wait_for:   { bg: "bg-gray-500/20",   text: "text-gray-400" },
  paginate:   { bg: "bg-orange-500/20", text: "text-orange-400" },
  scroll:     { bg: "bg-cyan-500/20",   text: "text-cyan-400" },
  transform:  { bg: "bg-pink-500/20",   text: "text-pink-400" },
  ai_decide:  { bg: "bg-indigo-500/20", text: "text-indigo-400" },
};

const CONFIG_FIELDS: Record<string, { key: string; label: string; type: "text" | "textarea" | "number" }[]> = {
  navigate:  [{ key: "url", label: "URL", type: "text" }],
  click:     [{ key: "selector", label: "CSS Selector", type: "text" }],
  extract:   [{ key: "selector", label: "Container Selector", type: "text" }, { key: "fields", label: "Fields (JSON)", type: "textarea" }],
  type_text: [{ key: "selector", label: "CSS Selector", type: "text" }, { key: "value", label: "Value", type: "text" }],
  wait_for:  [{ key: "selector", label: "CSS Selector", type: "text" }, { key: "timeout", label: "Timeout (ms)", type: "number" }],
  paginate:  [{ key: "selector", label: "Next Button Selector", type: "text" }, { key: "maxPages", label: "Max Pages", type: "number" }],
  scroll:    [{ key: "direction", label: "Direction", type: "text" }, { key: "pixels", label: "Pixels", type: "number" }],
  transform: [{ key: "expression", label: "Expression", type: "textarea" }],
  ai_decide: [{ key: "prompt", label: "Prompt", type: "textarea" }, { key: "options", label: "Options (JSON)", type: "textarea" }],
};

export function StepInspector({ step, onUpdate, onDelete, onClose }: StepInspectorProps) {
  const [localConfig, setLocalConfig] = useState<Record<string, any>>({});
  const [timeout, setTimeout_] = useState(30000);
  const [maxRetries, setMaxRetries] = useState(0);
  const [backoff, setBackoff] = useState("fixed");

  useEffect(() => {
    if (step) {
      setLocalConfig(step.config || {});
      setTimeout_(step.timeout || 30000);
      setMaxRetries(step.retries?.max || 0);
      setBackoff(step.retries?.backoff || "fixed");
    }
  }, [step]);

  if (!step) return null;

  const colors = STEP_COLORS[step.type] || STEP_COLORS.wait_for;
  const fields = CONFIG_FIELDS[step.type] || [];

  const handleConfigChange = (key: string, value: string | number) => {
    const updated = { ...localConfig, [key]: value };
    setLocalConfig(updated);
    onUpdate(step.stepId, { config: updated });
  };

  const handleTimeoutChange = (val: number) => {
    setTimeout_(val);
    onUpdate(step.stepId, { timeout: val });
  };

  const handleRetriesChange = (max: number) => {
    setMaxRetries(max);
    onUpdate(step.stepId, { retries: { max, backoff } });
  };

  const handleBackoffChange = (b: string) => {
    setBackoff(b);
    onUpdate(step.stepId, { retries: { max: maxRetries, backoff: b } });
  };

  return (
    <div className="flex h-full w-80 flex-col border-l border-gray-800 bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Step Inspector</h3>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Type badge */}
        <div>
          <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Type
          </label>
          <div className="mt-1">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}
            >
              {step.type}
            </span>
          </div>
        </div>

        {/* Step ID */}
        <div>
          <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Step ID
          </label>
          <div className="mt-1 rounded-lg bg-gray-950 px-3 py-2 font-mono text-xs text-gray-300">
            {step.stepId}
          </div>
        </div>

        {/* Config fields */}
        {fields.length > 0 && (
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
              Configuration
            </label>
            <div className="mt-2 space-y-3">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-[11px] text-gray-400">
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={
                        typeof localConfig[field.key] === "object"
                          ? JSON.stringify(localConfig[field.key], null, 2)
                          : localConfig[field.key] || ""
                      }
                      onChange={(e) => handleConfigChange(field.key, e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 font-mono text-xs text-gray-200 placeholder-gray-600 focus:border-brand-500 focus:outline-none"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={localConfig[field.key] ?? ""}
                      onChange={(e) =>
                        handleConfigChange(
                          field.key,
                          field.type === "number" ? Number(e.target.value) : e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 font-mono text-xs text-gray-200 placeholder-gray-600 focus:border-brand-500 focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeout */}
        <div>
          <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Timeout
          </label>
          <div className="mt-2">
            <input
              type="range"
              min={1000}
              max={120000}
              step={1000}
              value={timeout}
              onChange={(e) => handleTimeoutChange(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
            <div className="mt-1 text-right font-mono text-[11px] text-gray-400">
              {(timeout / 1000).toFixed(0)}s
            </div>
          </div>
        </div>

        {/* Retries */}
        <div>
          <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Retry Config
          </label>
          <div className="mt-2 space-y-3">
            <div>
              <label className="mb-1 block text-[11px] text-gray-400">Max Retries</label>
              <input
                type="number"
                min={0}
                max={10}
                value={maxRetries}
                onChange={(e) => handleRetriesChange(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 font-mono text-xs text-gray-200 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-gray-400">Backoff</label>
              <select
                value={backoff}
                onChange={(e) => handleBackoffChange(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-gray-200 focus:border-brand-500 focus:outline-none"
              >
                <option value="fixed">Fixed</option>
                <option value="linear">Linear</option>
                <option value="exponential">Exponential</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Delete button */}
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={() => onDelete(step.stepId)}
          className="w-full rounded-lg border border-red-500/30 bg-red-500/10 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
        >
          Delete Step
        </button>
      </div>
    </div>
  );
}
