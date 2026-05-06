import * as NodeServices from "@effect/platform-node/NodeServices";
import { describe, expect, it } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path } from "effect";
import { AgentBoardFile, type AgentBoardCardId } from "@t3tools/contracts";

import { AgentBoardFileSystem } from "../Services/AgentBoardFileSystem.ts";
import { AgentBoardFileSystemLive } from "./AgentBoardFileSystem.ts";
import { WorkspacePathsLive } from "../../workspace/Layers/WorkspacePaths.ts";

const TestLayer = Layer.empty.pipe(
  Layer.provideMerge(AgentBoardFileSystemLive.pipe(Layer.provide(WorkspacePathsLive))),
  Layer.provideMerge(WorkspacePathsLive),
  Layer.provideMerge(NodeServices.layer),
);

const makeTempDir = Effect.gen(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  return yield* fileSystem.makeTempDirectoryScoped({
    prefix: "t3code-agent-board-",
  });
});

it.layer(TestLayer)("AgentBoardFileSystemLive", (it) => {
  describe("load", () => {
    it.effect("creates a default board when requested and missing", () =>
      Effect.gen(function* () {
        const service = yield* AgentBoardFileSystem;
        const cwd = yield* makeTempDir;
        const fileSystem = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;

        const result = yield* service.load({ cwd, createIfMissing: true });

        expect(result.created).toBe(true);
        expect(result.relativePath).toBe(".t3/agent-board.json");
        expect(result.board.projectRoot).toBe(cwd);
        expect(result.board.cards).toEqual([]);
        const saved = yield* fileSystem.readFileString(path.join(cwd, ".t3", "agent-board.json"));
        expect(saved).toContain('"schemaVersion": 1');
      }),
    );

    it.effect("rejects missing boards when creation is not requested", () =>
      Effect.gen(function* () {
        const service = yield* AgentBoardFileSystem;
        const cwd = yield* makeTempDir;

        const error = yield* service.load({ cwd, createIfMissing: false }).pipe(Effect.flip);

        expect(error._tag).toBe("AgentBoardFileSystemError");
        if (error._tag === "AgentBoardFileSystemError") {
          expect(error.operation).toBe("agentBoard.read");
        }
      }),
    );
  });

  describe("save", () => {
    it.effect("writes a validated board into the project-local .t3 folder", () =>
      Effect.gen(function* () {
        const service = yield* AgentBoardFileSystem;
        const cwd = yield* makeTempDir;
        const fileSystem = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const created = yield* service.load({ cwd, createIfMissing: true });
        const nextBoard = {
          ...created.board,
          cards: [
            {
              id: "TASK-20260505-test-card",
              title: "Test card",
              state: "Backlog" as const,
              createdAt: "2026-05-05T12:00:00.000Z",
              updatedAt: "2026-05-05T12:00:00.000Z",
            },
          ],
          updatedAt: "2026-05-05T12:00:00.000Z",
        } as unknown as typeof AgentBoardFile.Type;

        const result = yield* service.save({ cwd, board: nextBoard });

        expect(result.board.cards[0]?.id).toBe("TASK-20260505-test-card");
        const saved = yield* fileSystem.readFileString(path.join(cwd, ".t3", "agent-board.json"));
        expect(saved).toContain("TASK-20260505-test-card");
      }),
    );

    it.effect("rejects title-only ready cards on save", () =>
      Effect.gen(function* () {
        const service = yield* AgentBoardFileSystem;
        const cwd = yield* makeTempDir;
        const created = yield* service.load({ cwd, createIfMissing: true });
        const invalidBoard = {
          ...created.board,
          cards: [
            {
              id: "TASK-20260505-title-only",
              title: "Title only",
              state: "Ready" as const,
              createdAt: "2026-05-05T12:00:00.000Z",
              updatedAt: "2026-05-05T12:00:00.000Z",
            },
          ],
        } as unknown as typeof AgentBoardFile.Type;

        const error = yield* service.save({ cwd, board: invalidBoard }).pipe(Effect.flip);

        expect(error._tag).toBe("AgentBoardFileSystemError");
        if (error._tag === "AgentBoardFileSystemError") {
          expect(error.operation).toBe("agentBoard.decode");
        }
      }),
    );
  });

  describe("claim", () => {
    it.effect("creates a project-local workspace and moves a ready card to running", () =>
      Effect.gen(function* () {
        const service = yield* AgentBoardFileSystem;
        const cwd = yield* makeTempDir;
        const fileSystem = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const cardId = "TASK-20260505-ready-card" as AgentBoardCardId;
        const created = yield* service.load({ cwd, createIfMissing: true });
        const readyBoard = {
          ...created.board,
          cards: [
            {
              id: cardId,
              title: "Ready card",
              state: "Ready" as const,
              runtime: {
                attemptCount: 1,
                currentError: "Previous failure",
                currentDecisionQuestion: "Previous question?",
              },
              intentBrief: {
                intent: "Claim this card.",
                acceptanceCriteria: ["Workspace exists."],
              },
              createdAt: "2026-05-05T12:00:00.000Z",
              updatedAt: "2026-05-05T12:00:00.000Z",
            },
          ],
          updatedAt: "2026-05-05T12:00:00.000Z",
        } as unknown as typeof AgentBoardFile.Type;
        yield* service.save({ cwd, board: readyBoard });

        const result = yield* service.claim({ cwd, cardId });

        expect(result.card.state).toBe("Running");
        expect(result.card.runtime.attemptCount).toBe(2);
        expect(result.card.runtime.workspacePath).toBe(".t3/workspaces/TASK-20260505-ready-card");
        expect(result.card.runtime.currentError).toBeUndefined();
        expect(result.card.runtime.currentDecisionQuestion).toBeUndefined();
        expect(
          yield* fileSystem.exists(path.join(cwd, ".t3", "workspaces", "TASK-20260505-ready-card")),
        ).toBe(true);
      }),
    );

    it.effect("rejects non-ready cards", () =>
      Effect.gen(function* () {
        const service = yield* AgentBoardFileSystem;
        const cwd = yield* makeTempDir;
        const cardId = "TASK-20260505-draft-card" as AgentBoardCardId;
        const created = yield* service.load({ cwd, createIfMissing: true });
        const draftBoard = {
          ...created.board,
          cards: [
            {
              id: cardId,
              title: "Draft card",
              state: "Draft" as const,
              createdAt: "2026-05-05T12:00:00.000Z",
              updatedAt: "2026-05-05T12:00:00.000Z",
            },
          ],
        } as unknown as typeof AgentBoardFile.Type;
        yield* service.save({ cwd, board: draftBoard });

        const error = yield* service.claim({ cwd, cardId }).pipe(Effect.flip);

        expect(error._tag).toBe("AgentBoardFileSystemError");
        if (error._tag === "AgentBoardFileSystemError") {
          expect(error.operation).toBe("agentBoard.claim");
        }
      }),
    );
  });
});
