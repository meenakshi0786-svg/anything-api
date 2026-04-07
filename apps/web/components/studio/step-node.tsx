"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";

export interface StepNodeData {
  stepId: string;
  type: string;
  config: Record<string, any>;
  timeout?: number;
  retries?: { max: number; backoff: string };
  selected?: boolean;
}

const STEP_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  navigate:   { bg: "bg-blue-500/20",   text: "text-blue-400",   border: "border-blue-500/40" },
  click:      { bg: "bg-green-500/20",  text: "text-green-400",  border: "border-green-500/40" },
  extract:    { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/40" },
  type_text:  { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/40" },
  wait_for:   { bg: "bg-gray-500/20",   text: "text-gray-400",   border: "border-gray-500/40" },
  paginate:   { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/40" },
  scroll:     { bg: "bg-cyan-500/20",   text: "text-cyan-400",   border: "border-cyan-500/40" },
  transform:  { bg: "bg-pink-500/20",   text: "text-pink-400",   border: "border-pink-500/40" },
  ai_decide:  { bg: "bg-indigo-500/20", text: "text-indigo-400", border: "border-indigo-500/40" },
};

const STEP_ICONS: Record<string, string> = {
  navigate:  "\u21D7",
  click:     "\u25CB",
  extract:   "\u2698",
  type_text: "\u2328",
  wait_for:  "\u231B",
  paginate:  "\u2630",
  scroll:    "\u2195",
  transform: "\u2699",
  ai_decide: "\u2726",
};

function getConfigSummary(type: string, config: Record<string, any>): string {
  if (!config || Object.keys(config).length === 0) return "No config";

  switch (type) {
    case "navigate":
      return config.url ? `url: ${truncate(config.url, 40)}` : summarizeKeys(config);
    case "click":
      return config.selector ? `selector: ${truncate(config.selector, 36)}` : summarizeKeys(config);
    case "extract":
      if (config.fields) {
        const fieldNames = Array.isArray(config.fields)
          ? config.fields.map((f: any) => f.name || f).join(", ")
          : Object.keys(config.fields).join(", ");
        return `fields: ${truncate(fieldNames, 40)}`;
      }
      return summarizeKeys(config);
    case "type_text":
      return config.selector
        ? `${truncate(config.selector, 20)} \u2192 ${truncate(config.value || config.text || "...", 16)}`
        : summarizeKeys(config);
    case "wait_for":
      return config.selector
        ? `selector: ${truncate(config.selector, 36)}`
        : config.timeout
          ? `${config.timeout}ms`
          : summarizeKeys(config);
    case "paginate":
      return config.selector ? `next: ${truncate(config.selector, 36)}` : summarizeKeys(config);
    case "scroll":
      return config.direction || config.pixels ? `${config.direction || "down"} ${config.pixels || ""}` : summarizeKeys(config);
    case "transform":
      return config.expression ? truncate(config.expression, 40) : summarizeKeys(config);
    case "ai_decide":
      return config.prompt ? truncate(config.prompt, 40) : summarizeKeys(config);
    default:
      return summarizeKeys(config);
  }
}

function summarizeKeys(config: Record<string, any>): string {
  const keys = Object.keys(config);
  if (keys.length === 0) return "No config";
  const parts = keys.slice(0, 3).map((k) => `${k}: ${truncate(String(config[k]), 16)}`);
  return parts.join(", ") + (keys.length > 3 ? " ..." : "");
}

function truncate(s: string, max: number): string {
  if (!s) return "";
  return s.length > max ? s.slice(0, max - 1) + "\u2026" : s;
}

function StepNodeComponent({ data, selected }: NodeProps<StepNodeData>) {
  const colors = STEP_COLORS[data.type] || STEP_COLORS.wait_for;
  const icon = STEP_ICONS[data.type] || "\u25A0";

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-2 !border-gray-700 !bg-gray-500"
      />

      <div
        className={`group min-w-[220px] max-w-[280px] rounded-xl border bg-gray-800 px-4 py-3 shadow-lg transition-colors ${
          selected ? `${colors.border} border-2` : "border-gray-700 hover:border-gray-600"
        }`}
      >
        {/* Type badge */}
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${colors.bg} ${colors.text}`}
          >
            <span className="text-xs">{icon}</span>
            {data.type}
          </span>
        </div>

        {/* Step ID */}
        <div className="mb-1 text-xs font-medium text-gray-200 truncate">
          {data.stepId}
        </div>

        {/* Config summary */}
        <div className="font-mono text-[10px] text-gray-500 truncate">
          {getConfigSummary(data.type, data.config)}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-2 !border-gray-700 !bg-gray-500"
      />
    </>
  );
}

export const StepNode = memo(StepNodeComponent);
