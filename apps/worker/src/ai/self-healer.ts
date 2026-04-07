import { llm, parseJsonResponse } from "./llm.js";
import { db } from "@afa/db";
import { agentMemory, workflowVersions, workflows } from "@afa/db";
import { eq, and } from "drizzle-orm";
import type { WorkflowStep } from "@afa/types";

const anthropic = new Anthropic();

/**
 * Self-healing module: detects and auto-repairs broken workflows.
 *
 * When a step fails (selector not found, unexpected page state),
 * the self-healer:
 * 1. Takes a screenshot of the current page
 * 2. Compares with the last successful execution
 * 3. Uses AI to find a new selector or interaction pattern
 * 4. Tests the fix
 * 5. Updates the workflow version if successful
 */
export class SelfHealer {
  /**
   * Attempt to heal a broken step.
   * Returns the fixed step config, or null if healing failed.
   */
  async healStep(params: {
    workflowId: string;
    step: WorkflowStep;
    error: string;
    currentPageDOM: string;
    currentPageUrl: string;
    screenshotBase64?: string;
  }): Promise<WorkflowStep | null> {
    const { step, error, currentPageDOM, currentPageUrl } = params;

    console.log(
      `[self-healer] Attempting to heal step ${step.id} (${step.type}): ${error}`
    );

    // Check agent memory for known selectors on this domain
    const domain = new URL(currentPageUrl).hostname;
    const memories = await db
      .select()
      .from(agentMemory)
      .where(eq(agentMemory.domain, domain));

    const memoryContext = memories.length > 0
      ? `\nKnown selectors for ${domain}:\n${memories.map((m) => `  ${m.key}: ${JSON.stringify(m.value)}`).join("\n")}`
      : "";

    const response = await llm({
      prompt: `A web automation step failed. Help me fix it.

Step: ${JSON.stringify(step, null, 2)}
Error: ${error}
Current URL: ${currentPageUrl}
${memoryContext}

Current page DOM (simplified):
${currentPageDOM.slice(0, 30000)}

Analyze what went wrong and provide an updated step config that should work.
Return ONLY the updated step as valid JSON (same structure as input step).
If you cannot determine a fix, return {"healable": false, "reason": "..."}.`,
      tier: "balanced",
      maxTokens: 4096,
    });

    try {
      const result = parseJsonResponse(response.text);

      if (result.healable === false) {
        console.log(`[self-healer] Cannot heal: ${result.reason}`);
        return null;
      }

      // Save learned selector to agent memory
      if (result.config?.selector || result.config?.selectors) {
        await this.saveToMemory(domain, currentPageUrl, result);
      }

      console.log(`[self-healer] Generated fix for step ${step.id}`);
      return result as WorkflowStep;
    } catch {
      console.log(`[self-healer] Failed to parse healing response`);
      return null;
    }
  }

  /**
   * Apply a healed step to the workflow, creating a new version.
   */
  async applyFix(
    workflowId: string,
    fixedStep: WorkflowStep
  ): Promise<number> {
    // Get current version
    const [workflow] = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, workflowId))
      .limit(1);

    const [currentVersion] = await db
      .select()
      .from(workflowVersions)
      .where(
        and(
          eq(workflowVersions.workflowId, workflowId),
          eq(workflowVersions.version, workflow.currentVersion)
        )
      )
      .limit(1);

    // Replace the broken step in the steps array
    const steps = (currentVersion.steps as WorkflowStep[]).map((s) =>
      s.id === fixedStep.id ? fixedStep : s
    );

    const newVersion = workflow.currentVersion + 1;

    // Create new version
    await db.insert(workflowVersions).values({
      workflowId,
      version: newVersion,
      steps,
      inputSchema: currentVersion.inputSchema,
      outputSchema: currentVersion.outputSchema,
      changelog: `Self-healer: fixed step ${fixedStep.id}`,
      createdBy: "self-healer",
    });

    // Update workflow to use new version
    await db
      .update(workflows)
      .set({ currentVersion: newVersion, updatedAt: new Date() })
      .where(eq(workflows.id, workflowId));

    console.log(
      `[self-healer] Applied fix: workflow ${workflowId} v${newVersion}`
    );
    return newVersion;
  }

  private async saveToMemory(
    domain: string,
    url: string,
    step: any
  ): Promise<void> {
    const pagePattern = new URL(url).pathname.replace(/[a-f0-9-]{20,}/g, "*");

    const selectors = step.config?.selectors || {};
    if (step.config?.selector) {
      selectors._primary = step.config.selector;
    }

    for (const [key, value] of Object.entries(selectors)) {
      await db
        .insert(agentMemory)
        .values({
          domain,
          pagePattern,
          memoryType: "selector",
          key,
          value: { selector: value },
        })
        .onConflictDoUpdate({
          target: [
            agentMemory.domain,
            agentMemory.pagePattern,
            agentMemory.memoryType,
            agentMemory.key,
          ],
          set: {
            value: { selector: value },
            hitCount: 1, // Will be incremented
            lastVerified: new Date(),
          },
        })
        .catch(() => {});
    }
  }
}
