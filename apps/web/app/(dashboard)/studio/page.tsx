"use client";

import { useState, useRef, useEffect } from "react";
import { StudioChat } from "@/components/studio/chat-panel";
import { WorkflowPreview } from "@/components/studio/workflow-preview";
import { WorkflowCanvas, type WorkflowStep } from "@/components/studio/workflow-canvas";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    workflow?: any;
    testResult?: any;
    screenshots?: string[];
    thinking?: boolean;
  };
}

type StudioTab = "chat" | "visual";

export default function StudioPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to Studio! Describe what you want to automate, and I'll build an API for it.\n\nFor example:\n- \"Get product price and reviews from any Amazon URL\"\n- \"Search LinkedIn for job postings and extract details\"\n- \"Monitor competitor prices on Shopify stores\"",
      timestamp: new Date(),
    },
  ]);
  const [currentWorkflow, setCurrentWorkflow] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<StudioTab>("chat");

  const handleWorkflowUpdate = (workflow: any) => {
    setCurrentWorkflow(workflow);
  };

  const handleStepsChange = (updatedSteps: WorkflowStep[]) => {
    if (!currentWorkflow) return;
    setCurrentWorkflow({ ...currentWorkflow, steps: updatedSteps });
  };

  // Extract steps array from the current workflow for the canvas
  const workflowSteps: WorkflowStep[] = (currentWorkflow?.steps || []).map(
    (s: any, i: number) => ({
      id: s.id || `step-${i}`,
      type: s.type || "navigate",
      config: s.config || s,
      dependsOn: s.dependsOn || (i > 0 ? [currentWorkflow.steps[i - 1]?.id || `step-${i - 1}`] : []),
      timeout: s.timeout,
      retries: s.retries,
    })
  );

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-4">
      {/* Tab bar */}
      <div className="flex items-center gap-1 rounded-lg bg-gray-900 p-1 self-start border border-gray-800">
        <button
          onClick={() => setActiveTab("chat")}
          className={`rounded-md px-4 py-1.5 text-xs font-medium transition ${
            activeTab === "chat"
              ? "bg-gray-800 text-white shadow-sm"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab("visual")}
          className={`rounded-md px-4 py-1.5 text-xs font-medium transition ${
            activeTab === "visual"
              ? "bg-gray-800 text-white shadow-sm"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Visual
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Left panel — Chat or Visual Canvas */}
        <div className="flex flex-1 flex-col min-h-0">
          {activeTab === "chat" ? (
            <StudioChat
              messages={messages}
              setMessages={setMessages}
              onWorkflowUpdate={handleWorkflowUpdate}
            />
          ) : (
            <WorkflowCanvas
              steps={workflowSteps}
              onStepsChange={handleStepsChange}
            />
          )}
        </div>

        {/* Workflow preview (right) */}
        <div className="hidden w-96 flex-shrink-0 lg:block">
          <WorkflowPreview workflow={currentWorkflow} />
        </div>
      </div>
    </div>
  );
}
