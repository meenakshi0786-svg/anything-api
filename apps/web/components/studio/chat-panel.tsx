"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/app/(dashboard)/studio/page";
import { api } from "@/lib/api-client";

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
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500" />
                  </div>
                  <span className="text-sm text-gray-400">
                    Building your workflow...
                  </span>
                </div>
              ) : (
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              )}

              {/* Workflow card */}
              {msg.metadata?.workflow && (
                <div className="mt-3 rounded-lg border border-gray-700 bg-gray-900 p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-xs font-medium text-green-400">
                      Workflow Ready
                    </span>
                  </div>
                  <div className="mt-2 rounded bg-gray-950 px-2 py-1 font-mono text-xs text-gray-400">
                    POST /v1/run/{msg.metadata.workflow.slug}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button className="rounded bg-brand-600 px-3 py-1 text-xs font-medium text-white hover:bg-brand-500">
                      Test Now
                    </button>
                    <button className="rounded border border-gray-700 px-3 py-1 text-xs text-gray-400 hover:text-white">
                      View Details
                    </button>
                  </div>
                </div>
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
