"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/app/(dashboard)/studio/page";
import { api } from "@/lib/api-client";
import { LiveRunViewer } from "@/components/runs/live-run-viewer";

interface StudioChatProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onWorkflowUpdate: (workflow: any) => void;
}

export function StudioChat({ messages, setMessages, onWorkflowUpdate }: StudioChatProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Add thinking indicator
    const thinkingId = `thinking-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: thinkingId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        metadata: { thinking: true },
      },
    ]);

    try {
      // Create workflow from prompt
      const res = await api.workflows.create({
        mode: "ai",
        prompt: userMessage.content,
      });

      const workflow = res.data;
      onWorkflowUpdate(workflow);

      // Replace thinking with actual response
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== thinkingId)
          .concat({
            id: Date.now().toString(),
            role: "assistant",
            content: buildAssistantResponse(workflow),
            timestamp: new Date(),
            metadata: { workflow },
          })
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== thinkingId)
          .concat({
            id: Date.now().toString(),
            role: "assistant",
            content: `Sorry, I encountered an error: ${err.message}\n\nPlease try rephrasing your request.`,
            timestamp: new Date(),
          })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-1 flex-col rounded-xl border border-gray-800 bg-gray-900">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-brand-600 text-white"
                  : "bg-gray-800 text-gray-200"
              }`}
            >
              {msg.metadata?.thinking ? (
                <ThinkingIndicator />
              ) : (
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              )}

              {/* Workflow card */}
              {msg.metadata?.workflow && (
                <WorkflowCard workflow={msg.metadata.workflow} />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-800 p-4">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to automate..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none"
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-500 disabled:opacity-40"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          {["Get Amazon product data", "Scrape job listings", "Monitor prices"].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setInput(suggestion)}
              className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-400 transition hover:border-gray-600 hover:text-white"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}

/**
 * Inline workflow card with working "Test Now" button.
 * Polls the workflow until planner completes, then renders
 * the LiveRunViewer with example input from the schema.
 */
function WorkflowCard({ workflow }: { workflow: any }) {
  const [ready, setReady] = useState(workflow.status !== "planning");
  const [polling, setPolling] = useState(workflow.status === "planning");
  const [plannerError, setPlannerError] = useState<{ code: string; message: string } | null>(null);
  const [activeRun, setActiveRun] = useState<{
    input: Record<string, unknown>;
    key: number;
  } | null>(null);

  // Poll for planner completion
  useEffect(() => {
    if (ready || plannerError) return;
    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const res = await api.workflows.get(workflow.id);
        if (cancelled) return;
        const wf = res.data;
        const stepsCount =
          wf.stepsCount ?? (Array.isArray(wf.steps) ? wf.steps.length : 0);

        // Check for planner failure recorded by the worker
        const settings = wf.settings as any;
        if (settings?.plannerError) {
          setPlannerError(settings.plannerError);
          setPolling(false);
          clearInterval(interval);
          return;
        }

        if (stepsCount > 0) {
          setReady(true);
          setPolling(false);
          clearInterval(interval);
        }
      } catch {
        // ignore transient errors
      }
    }, 2000);

    const timeout = setTimeout(() => {
      setPolling(false);
      clearInterval(interval);
      if (!ready) {
        setPlannerError({
          code: "PLANNER_TIMEOUT",
          message: "AI planner took too long. Check your AI provider key or try again.",
        });
      }
    }, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [workflow.id, ready, plannerError]);

  const handleTest = async () => {
    try {
      const res = await api.workflows.get(workflow.id);
      const inputSchema = res.data.inputSchema;

      const exampleInput: Record<string, unknown> = {};
      if (inputSchema?.properties) {
        for (const [key, schema] of Object.entries(
          inputSchema.properties
        ) as any) {
          if (schema.format === "uri") {
            exampleInput[key] = "https://www.amazon.com/dp/B09V3KXJPB";
          } else if (schema.type === "string") {
            exampleInput[key] = key.includes("query") ? "test query" : "test";
          } else if (schema.type === "number" || schema.type === "integer") {
            exampleInput[key] = 1;
          } else if (schema.type === "boolean") {
            exampleInput[key] = true;
          }
        }
      }

      setActiveRun({ input: exampleInput, key: Date.now() });
    } catch {
      // ignore
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <div className={`rounded-lg border p-3 ${
        plannerError
          ? "border-red-900/50 bg-red-950/20"
          : "border-gray-700 bg-gray-900"
      }`}>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              plannerError
                ? "bg-red-500"
                : ready
                  ? "bg-green-500"
                  : "bg-yellow-500 animate-pulse"
            }`}
          />
          <span
            className={`text-xs font-medium ${
              plannerError
                ? "text-red-400"
                : ready
                  ? "text-green-400"
                  : "text-yellow-400"
            }`}
          >
            {plannerError
              ? "Workflow build failed"
              : ready
                ? "Workflow Ready"
                : "Building workflow..."}
          </span>
        </div>

        {plannerError ? (
          <div className="mt-2 space-y-2">
            <div className="text-xs text-red-300">
              {plannerError.message}
            </div>
            <div className="text-[11px] text-gray-500">
              {plannerError.code === "AI_AUTH_ERROR"
                ? "Your AI provider rejected the request. Check your OPENROUTER_API_KEY / OPENAI_API_KEY in .env."
                : plannerError.code === "PLANNER_TIMEOUT"
                  ? "The AI provider didn't respond within 60s. Try again or check your network."
                  : "Try rephrasing your prompt or check the worker logs."}
            </div>
          </div>
        ) : (
          <>
            <div className="mt-2 rounded bg-gray-950 px-2 py-1 font-mono text-xs text-gray-400">
              POST /v1/run/{workflow.slug}
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleTest}
                disabled={!ready}
                className="rounded bg-brand-600 px-3 py-1 text-xs font-medium text-white hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {polling ? "Waiting..." : "Test Now"}
              </button>
              <a
                href={`/workflows/${workflow.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-gray-700 px-3 py-1 text-xs text-gray-400 hover:text-white"
              >
                View Details
              </a>
            </div>
          </>
        )}
      </div>

      {activeRun && (
        <LiveRunViewer
          key={activeRun.key}
          workflowSlug={workflow.slug}
          workflowId={workflow.id}
          input={activeRun.input}
        />
      )}
    </div>
  );
}

/**
 * Animated thinking indicator that cycles through reassuring status messages
 * so the user knows the planner is still working.
 */
const THINKING_MESSAGES = [
  "Understanding your request...",
  "Planning the automation steps...",
  "Generating input/output schemas...",
  "Validating the workflow...",
  "Almost there...",
];

function ThinkingIndicator() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((prev) => (prev + 1 < THINKING_MESSAGES.length ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.3s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.15s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500" />
      </div>
      <span className="text-sm text-gray-400 transition-opacity duration-300">
        {THINKING_MESSAGES[idx]}
      </span>
    </div>
  );
}

function buildAssistantResponse(workflow: any): string {
  if (workflow.status === "planning") {
    return `I'm building your workflow: **${workflow.name}**

The AI planner is generating the automation steps. This usually takes 5-10 seconds.

Your API endpoint will be:
\`POST /v1/run/${workflow.slug}\`

I'll update you when it's ready to test.`;
  }

  return `Your workflow **${workflow.name}** is ready!

**API Endpoint:**
\`POST /v1/run/${workflow.slug}\`

You can test it now or view the full details in the Workflows tab.`;
}
