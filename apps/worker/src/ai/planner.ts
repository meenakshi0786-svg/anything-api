import { llm, parseJsonResponse } from "./llm.js";
import type { WorkflowStep, JsonSchema } from "@afa/types";

export interface PlannerResult {
  name: string;
  description: string;
  steps: WorkflowStep[];
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
}

const SYSTEM_PROMPT = `You are an expert web automation planner. Your job is to convert a natural language description of a web task into a precise, executable workflow.

## Step Types Available
- navigate: Go to a URL. Config: { url: string, waitUntil?: "load"|"domcontentloaded"|"networkidle" }
- click: Click an element. Config: { selector?: string, text?: string, fallback?: "ai" }
- type_text: Type into an input. Config: { selector: string, text: string, clear?: boolean, humanlike?: boolean }
- wait_for: Wait for an element/condition. Config: { selector?: string, text?: string, state?: "visible"|"hidden", timeout?: number }
- extract: Pull data from page. Config: { strategy: "selector"|"ai"|"hybrid", selectors?: {field: selector}, aiPrompt?: string, fields?: string[], aiFallback?: boolean }
- paginate: Loop through pages. Config: { nextSelector?: string, maxPages?: number, extractPerPage: {...}, target: string }
- scroll: Scroll the page. Config: { direction?: "down"|"up", distance?: number, infinite?: boolean, maxScrolls?: number }
- transform: Reshape data. Config: { source: string, operations: [...], outputKey?: string }
- ai_decide: Let AI make a runtime decision. Config: { prompt: string, outputKey?: string }
- condition: If/else branching. Config: { check: string, then: string[], else?: string[] }
- loop: Iterate over items. Config: { items: string, stepIds: string[] }
- auth: Login flow. Config: { vaultKey: string, domain: string }

## Template Variables
Use {{input.fieldName}} to reference user input.
Use {{step_id}} to reference output from a previous step.

## Rules
1. Generate a workflow name and description
2. Define the input schema (what the user provides via API)
3. Define the output schema (what the API returns)
4. Create an ordered list of steps with proper dependencies
5. Use hybrid extraction (selectors + AI fallback) for reliability
6. Include wait_for steps before extraction for page loading
7. Set realistic timeouts (15s default, 30s for slow pages)
8. Add retry config for flaky steps
9. Prefer CSS selectors when the site structure is predictable
10. Use AI extraction for complex or dynamic pages

## Common Patterns

### E-commerce (Amazon, Shopify, etc.)
- Product title: h1, #productTitle, .product-title
- Price: .price, .a-price-whole, [data-price]
- Reviews: .review, .review-text, [data-review]

### Social Media (LinkedIn, Twitter, etc.)
- Usually requires auth step first
- Dynamic content needs scroll + wait patterns
- Use AI extraction for feed content

### Job Boards
- Search results are usually in list/card containers
- Pagination via "Next" button or page numbers
- Extract: title, company, location, salary, link

Respond with ONLY valid JSON matching this schema:
{
  "name": "string",
  "description": "string",
  "inputSchema": { JSON Schema },
  "outputSchema": { JSON Schema },
  "steps": [ array of WorkflowStep objects ]
}`;

export class Planner {
  /**
   * Convert a natural language prompt into an executable workflow.
   */
  async planWorkflow(
    prompt: string,
    testInput?: Record<string, unknown>
  ): Promise<PlannerResult> {
    const userMessage = `Create a workflow for this task:

"${prompt}"

${testInput ? `Example input that will be provided: ${JSON.stringify(testInput)}` : ""}

Generate the complete workflow with steps, input schema, and output schema.`;

    const response = await llm({
      system: SYSTEM_PROMPT,
      prompt: userMessage,
      tier: "balanced",
      maxTokens: 8192,
    });

    const plan: any = parseJsonResponse(response.text);

    // Validate the plan structure
    this.validatePlan(plan);

    return {
      name: plan.name,
      description: plan.description,
      steps: plan.steps,
      inputSchema: plan.inputSchema,
      outputSchema: plan.outputSchema,
    };
  }

  /**
   * Refine an existing workflow based on user feedback.
   */
  async refineWorkflow(
    currentSteps: WorkflowStep[],
    feedback: string
  ): Promise<PlannerResult> {
    const response = await llm({
      system: SYSTEM_PROMPT,
      prompt: `Here is the current workflow:\n${JSON.stringify(currentSteps, null, 2)}\n\nThe user wants to modify it: "${feedback}"\n\nGenerate the updated complete workflow.`,
      tier: "balanced",
      maxTokens: 8192,
    });

    const plan: any = parseJsonResponse(response.text);

    this.validatePlan(plan);
    return plan;
  }

  private validatePlan(plan: any): void {
    if (!plan.name || typeof plan.name !== "string") {
      throw new Error("Plan missing name");
    }
    if (!Array.isArray(plan.steps) || plan.steps.length === 0) {
      throw new Error("Plan must have at least one step");
    }
    if (!plan.inputSchema || !plan.outputSchema) {
      throw new Error("Plan must have input and output schemas");
    }

    // Validate each step has required fields
    const validTypes = new Set([
      "navigate", "click", "type_text", "wait_for", "extract",
      "screenshot", "paginate", "scroll", "condition", "loop",
      "auth", "api_call", "transform", "ai_decide",
    ]);

    for (const step of plan.steps) {
      if (!step.id) throw new Error("Step missing id");
      if (!step.type) throw new Error(`Step ${step.id} missing type`);
      if (!validTypes.has(step.type)) {
        throw new Error(`Step ${step.id} has invalid type: ${step.type}`);
      }
      if (!step.config) throw new Error(`Step ${step.id} missing config`);
    }

    // Validate dependency graph (no circular deps)
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const stepIds = new Set(plan.steps.map((s: any) => s.id));

    const dfs = (id: string) => {
      if (visiting.has(id)) throw new Error("Circular dependency detected");
      if (visited.has(id)) return;
      visiting.add(id);

      const step = plan.steps.find((s: any) => s.id === id);
      if (step?.dependsOn) {
        for (const dep of step.dependsOn) {
          if (!stepIds.has(dep)) {
            throw new Error(`Step ${id} depends on unknown step: ${dep}`);
          }
          dfs(dep);
        }
      }

      visiting.delete(id);
      visited.add(id);
    };

    for (const step of plan.steps) {
      dfs(step.id);
    }
  }
}
