import { readFileSync } from "node:fs";
import { Schema } from "effect";
import { describe, expect, it } from "vitest";

import { AgentBoardFile } from "./agentBoard.ts";

const decodeAgentBoardFile = Schema.decodeUnknownSync(AgentBoardFile);

describe("AgentBoardFile", () => {
  it("decodes a minimal project-local board with defaults", () => {
    const decoded = decodeAgentBoardFile({
      projectRoot: "G:/Software/T3code mods/t3 code source/t3code-main_alpha_0.0.21",
      createdAt: "2026-05-05T12:00:00.000Z",
      updatedAt: "2026-05-05T12:00:00.000Z",
    });

    expect(decoded.schemaVersion).toBe(1);
    expect(decoded.defaultView).toBe("kanban");
    expect(decoded.runner).toEqual({
      maxConcurrentCards: 1,
      repairCycles: 3,
    });
    expect(decoded.cards).toEqual([]);
  });

  it("decodes a ready card with an intent brief and task references", () => {
    const decoded = decodeAgentBoardFile({
      projectRoot: "G:/Software/T3code mods/t3 code source/t3code-main_alpha_0.0.21",
      createdAt: "2026-05-05T12:00:00.000Z",
      updatedAt: "2026-05-05T12:00:00.000Z",
      graphLinks: [
        {
          from: "area:Backend",
          to: "area:Frontend",
          kind: "depends-on",
        },
      ],
      cards: [
        {
          id: "TASK-20260505-agent-board-contract",
          title: "Define board file contract",
          state: "Ready",
          taskRecordPath: "docs/agents/tasks/TASK-20260505-agent-board-contract.md",
          slicePlanPath: "docs/agents/slices/authoritative-agent-board.md",
          graphPosition: {
            x: 640,
            y: 120,
          },
          intentBrief: {
            intent: "Create the first durable schema for the project-local agent board file.",
            acceptanceCriteria: ["Board files decode through the shared contracts package."],
          },
          parallelism: {
            safe: "conditional",
            reason:
              "Schema-only work can run beside UI planning, but not another board schema edit.",
            allowedWriteScopes: ["packages/contracts/src/agentBoard.ts"],
          },
          createdAt: "2026-05-05T12:00:00.000Z",
          updatedAt: "2026-05-05T12:00:00.000Z",
        },
      ],
    });

    expect(decoded.cards[0]?.state).toBe("Ready");
    expect(decoded.cards[0]?.runtime.attemptCount).toBe(0);
    expect(decoded.cards[0]?.parallelism.allowedWriteScopes).toEqual([
      "packages/contracts/src/agentBoard.ts",
    ]);
    expect(decoded.cards[0]?.graphPosition).toEqual({ x: 640, y: 120 });
    expect(decoded.graphLinks).toEqual([
      {
        from: "area:Backend",
        to: "area:Frontend",
        kind: "depends-on",
      },
    ]);
  });

  it("rejects a title-only ready card because the intent brief is missing", () => {
    expect(() =>
      decodeAgentBoardFile({
        projectRoot: "G:/Software/T3code mods/t3 code source/t3code-main_alpha_0.0.21",
        createdAt: "2026-05-05T12:00:00.000Z",
        updatedAt: "2026-05-05T12:00:00.000Z",
        cards: [
          {
            id: "TASK-20260505-title-only",
            title: "Title only",
            state: "Ready",
            createdAt: "2026-05-05T12:00:00.000Z",
            updatedAt: "2026-05-05T12:00:00.000Z",
          },
        ],
      }),
    ).toThrow();
  });

  it("decodes the seeded project board file", () => {
    const seedBoardUrl = new URL("../../../.t3/agent-board.json", import.meta.url);
    const decoded = decodeAgentBoardFile(JSON.parse(readFileSync(seedBoardUrl, "utf8")));

    expect(decoded.cards[0]?.id).toBe("TASK-20260505-agent-board-contract");
    expect(decoded.cards[0]?.state).toBe("Done");
  });
});
