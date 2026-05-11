#!/usr/bin/env node
/**
 * MCP server for "API for Anything" — exposes user workflows as MCP tools.
 *
 * Usage in Claude Desktop / Cursor settings:
 * {
 *   "mcpServers": {
 *     "anything-api": {
 *       "command": "npx",
 *       "args": ["-y", "@afa/mcp-server"],
 *       "env": {
 *         "AFA_API_KEY": "afa_sk_live_xxx",
 *         "AFA_API_URL": "http://localhost:3001"
 *       }
 *     }
 *   }
 * }
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_KEY = process.env.AFA_API_KEY;
const API_URL = process.env.AFA_API_URL || "https://api.anythingapi.com";

if (!API_KEY) {
  console.error(
    "[afa-mcp] ERROR: AFA_API_KEY is required. Get one at " + API_URL + "/settings"
  );
  process.exit(1);
}

const server = new Server(
  {
    name: "anything-api",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

interface AfaWorkflow {
  id: string;
  slug: string;
  name: string;
  description?: string;
  inputSchema: any;
  outputSchema: any;
  isActive: boolean;
}

async function fetchWorkflows(): Promise<AfaWorkflow[]> {
  const res = await fetch(`${API_URL}/v1/workflows?perPage=100`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch workflows: ${res.status}`);
  }
  const json = await res.json();
  return (json.data || []).filter((w: AfaWorkflow) => w.isActive);
}

async function fetchWorkflowDetails(id: string): Promise<AfaWorkflow> {
  const res = await fetch(`${API_URL}/v1/workflows/${id}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch workflow ${id}`);
  const json = await res.json();
  return json.data;
}

async function runWorkflow(
  slug: string,
  input: Record<string, unknown>
): Promise<unknown> {
  const res = await fetch(`${API_URL}/v1/run/${slug}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Run failed: ${res.status}`);
  }
  return res.json();
}

// Cache workflows for 60s to avoid hammering the API
let cachedWorkflows: AfaWorkflow[] | null = null;
let cacheExpiresAt = 0;

async function getWorkflows(): Promise<AfaWorkflow[]> {
  const now = Date.now();
  if (cachedWorkflows && now < cacheExpiresAt) {
    return cachedWorkflows;
  }
  const workflows = await fetchWorkflows();
  // Fetch full details for each (the list endpoint doesn't include input schema)
  const detailed = await Promise.all(
    workflows.map(async (w) => {
      try {
        return await fetchWorkflowDetails(w.id);
      } catch {
        return w;
      }
    })
  );
  cachedWorkflows = detailed;
  cacheExpiresAt = now + 60_000;
  return detailed;
}

// ─── List tools (one tool per workflow) ──────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const workflows = await getWorkflows();

  const tools = workflows.map((w) => ({
    // Tool name is the slug, lowercased and underscored for MCP compat
    name: w.slug.replace(/-/g, "_"),
    description:
      w.description || w.name || `Run the "${w.slug}" workflow`,
    inputSchema: w.inputSchema || {
      type: "object",
      properties: {},
    },
  }));

  // Always include a meta-tool to list available workflows
  tools.unshift({
    name: "list_workflows",
    description:
      "List all available API for Anything workflows you can call as tools",
    inputSchema: { type: "object", properties: {} },
  });

  return { tools };
});

// ─── Call tool (run a workflow) ──────────────────────────
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "list_workflows") {
    const workflows = await getWorkflows();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            workflows.map((w) => ({
              slug: w.slug.replace(/-/g, "_"),
              name: w.name,
              description: w.description,
              inputSchema: w.inputSchema,
            })),
            null,
            2
          ),
        },
      ],
    };
  }

  // Find workflow by tool name (slug with underscores)
  const workflows = await getWorkflows();
  const workflow = workflows.find(
    (w) => w.slug.replace(/-/g, "_") === name
  );

  if (!workflow) {
    return {
      content: [
        { type: "text", text: `Unknown workflow: ${name}` },
      ],
      isError: true,
    };
  }

  try {
    const result = await runWorkflow(workflow.slug, args || {});
    return {
      content: [
        { type: "text", text: JSON.stringify(result, null, 2) },
      ],
    };
  } catch (err: any) {
    return {
      content: [
        { type: "text", text: `Workflow execution failed: ${err.message}` },
      ],
      isError: true,
    };
  }
});

// ─── Boot ────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[afa-mcp] connected to Claude/Cursor via stdio");
}

main().catch((err) => {
  console.error("[afa-mcp] fatal error:", err);
  process.exit(1);
});
