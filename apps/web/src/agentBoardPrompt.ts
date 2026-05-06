import type { AgentBoardCard } from "@t3tools/contracts";

function listBlock(label: string, values: ReadonlyArray<string> | undefined): string {
  if (!values || values.length === 0) {
    return `${label}: none`;
  }
  return `${label}:\n${values.map((value) => `- ${value}`).join("\n")}`;
}

export function buildAgentBoardImplementationPrompt(card: AgentBoardCard): string {
  const brief = card.intentBrief;
  const references = [
    "WORKFLOW.md",
    "PROJECT.md",
    "CONTEXT.md",
    ".t3/agent-board.json",
    card.slicePlanPath,
    card.taskRecordPath,
  ].filter((value): value is string => typeof value === "string" && value.length > 0);

  return [
    "PLEASE IMPLEMENT THIS AGENT BOARD CARD.",
    "",
    "You are a fresh implementation agent. Treat the project-local board and task docs as the source of truth, then execute the card end to end.",
    "",
    `Card: ${card.id}`,
    `Title: ${card.title}`,
    `Board state: ${card.state}`,
    `Workspace metadata path: ${card.runtime.workspacePath ?? "none"}`,
    "",
    "Read these references first:",
    ...references.map((reference) => `- ${reference}`),
    "",
    `Intent: ${brief?.intent ?? card.title}`,
    `Desired outcome: ${brief?.desiredOutcome ?? "Not specified"}`,
    listBlock("Acceptance criteria", brief?.acceptanceCriteria),
    listBlock("Constraints", brief?.constraints),
    listBlock("Non-goals", brief?.nonGoals),
    listBlock("Open decisions", brief?.openDecisions),
    "",
    "Execution rules:",
    "- Ask only for true intent or product decisions.",
    "- Self-diagnose and self-test before handing back.",
    "- Keep work inside the active project unless the task docs explicitly say otherwise.",
    "- Update proof in the relevant task record when implementation is complete.",
  ].join("\n");
}

export function buildAgentBoardImplementationThreadTitle(card: AgentBoardCard): string {
  return `Implement ${card.title}`;
}
