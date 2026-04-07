"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { StepNode, type StepNodeData } from "./step-node";
import { StepInspector } from "./step-inspector";

export interface WorkflowStep {
  id: string;
  type: string;
  config: Record<string, any>;
  dependsOn?: string[];
  timeout?: number;
  retries?: { max: number; backoff: string };
}

interface WorkflowCanvasProps {
  steps: WorkflowStep[];
  onStepsChange?: (steps: WorkflowStep[]) => void;
}

const nodeTypes = { step: StepNode };

/**
 * Lay out nodes top-to-bottom based on dependency levels.
 * Steps with no dependencies sit at level 0 (top).
 * Each subsequent dependency level shifts y += 200.
 * Nodes at the same level are spread horizontally (x spacing 300) and centered.
 */
function layoutNodes(steps: WorkflowStep[]): Node<StepNodeData>[] {
  if (steps.length === 0) return [];

  // Build a map of step id -> step
  const stepMap = new Map<string, WorkflowStep>();
  for (const s of steps) stepMap.set(s.id, s);

  // Compute levels via BFS / topological depth
  const levels = new Map<string, number>();

  function getLevel(id: string, visited: Set<string>): number {
    if (levels.has(id)) return levels.get(id)!;
    if (visited.has(id)) return 0; // circular guard
    visited.add(id);

    const step = stepMap.get(id);
    if (!step || !step.dependsOn || step.dependsOn.length === 0) {
      levels.set(id, 0);
      return 0;
    }
    const parentLevel = Math.max(
      ...step.dependsOn.map((dep) => getLevel(dep, visited))
    );
    const lvl = parentLevel + 1;
    levels.set(id, lvl);
    return lvl;
  }

  for (const s of steps) getLevel(s.id, new Set());

  // Group by level
  const byLevel = new Map<number, WorkflowStep[]>();
  for (const s of steps) {
    const lvl = levels.get(s.id) ?? 0;
    if (!byLevel.has(lvl)) byLevel.set(lvl, []);
    byLevel.get(lvl)!.push(s);
  }

  const nodes: Node<StepNodeData>[] = [];
  const xSpacing = 300;
  const ySpacing = 200;

  for (const [level, levelSteps] of byLevel) {
    const totalWidth = (levelSteps.length - 1) * xSpacing;
    const startX = -totalWidth / 2;

    levelSteps.forEach((step, i) => {
      nodes.push({
        id: step.id,
        type: "step",
        position: { x: startX + i * xSpacing, y: level * ySpacing },
        data: {
          stepId: step.id,
          type: step.type,
          config: step.config || {},
          timeout: step.timeout,
          retries: step.retries,
        },
      });
    });
  }

  return nodes;
}

function buildEdges(steps: WorkflowStep[]): Edge[] {
  const edges: Edge[] = [];
  for (const step of steps) {
    if (step.dependsOn) {
      for (const dep of step.dependsOn) {
        edges.push({
          id: `${dep}->${step.id}`,
          source: dep,
          target: step.id,
          animated: true,
          style: { stroke: "#4b5563", strokeDasharray: "6 3" },
        });
      }
    }
  }
  return edges;
}

export function WorkflowCanvas({ steps, onStepsChange }: WorkflowCanvasProps) {
  const [nodes, setNodes] = useState<Node<StepNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedStep, setSelectedStep] = useState<StepNodeData | null>(null);

  // Re-layout when steps prop changes
  useEffect(() => {
    setNodes(layoutNodes(steps));
    setEdges(buildEdges(steps));
  }, [steps]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<StepNodeData>) => {
      setSelectedStep(node.data);
    },
    []
  );

  const handlePaneClick = useCallback(() => {
    setSelectedStep(null);
  }, []);

  const handleStepUpdate = useCallback(
    (stepId: string, updates: Partial<StepNodeData>) => {
      if (!onStepsChange) return;
      const updated = steps.map((s) =>
        s.id === stepId
          ? {
              ...s,
              config: updates.config ?? s.config,
              timeout: updates.timeout ?? s.timeout,
              retries: updates.retries ?? s.retries,
            }
          : s
      );
      onStepsChange(updated);

      // Also update selected step view
      setSelectedStep((prev) => (prev && prev.stepId === stepId ? { ...prev, ...updates } : prev));
    },
    [steps, onStepsChange]
  );

  const handleStepDelete = useCallback(
    (stepId: string) => {
      if (!onStepsChange) return;
      onStepsChange(steps.filter((s) => s.id !== stepId));
      setSelectedStep(null);
    },
    [steps, onStepsChange]
  );

  const handleInspectorClose = useCallback(() => {
    setSelectedStep(null);
  }, []);

  return (
    <div className="flex h-full rounded-xl border border-gray-800 bg-gray-950 overflow-hidden">
      {/* Canvas */}
      <div className="relative flex-1">
        {steps.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
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
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              Generate a workflow in the Chat tab to visualize it here
            </p>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.2}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#1f2937"
            />
            <Controls
              position="bottom-left"
              className="!rounded-lg !border-gray-700 !bg-gray-800 [&>button]:!border-gray-700 [&>button]:!bg-gray-800 [&>button]:!fill-gray-400 [&>button:hover]:!bg-gray-700"
            />
            <MiniMap
              position="bottom-right"
              nodeColor="#374151"
              maskColor="rgba(0,0,0,0.7)"
              className="!rounded-lg !border-gray-700 !bg-gray-900"
            />
          </ReactFlow>
        )}
      </div>

      {/* Inspector panel — slides in from the right */}
      {selectedStep && (
        <StepInspector
          step={selectedStep}
          onUpdate={handleStepUpdate}
          onDelete={handleStepDelete}
          onClose={handleInspectorClose}
        />
      )}
    </div>
  );
}
