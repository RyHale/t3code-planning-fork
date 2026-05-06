import { Effect, FileSystem, Layer, Path, Schema } from "effect";
import {
  type AgentBoardCard,
  AgentBoardFile,
  type AgentBoardClaimResult,
  type AgentBoardLoadResult,
  type AgentBoardSaveResult,
} from "@t3tools/contracts";

import {
  AgentBoardFileSystem,
  AgentBoardFileSystemError,
  type AgentBoardFileSystemShape,
} from "../Services/AgentBoardFileSystem.ts";
import { WorkspacePaths } from "../../workspace/Services/WorkspacePaths.ts";

const BOARD_RELATIVE_PATH = ".t3/agent-board.json" as const;

const decodeAgentBoardFile = Schema.decodeUnknownEffect(AgentBoardFile);

function nowIso(): string {
  return new Date().toISOString();
}

function safeWorkspaceSegment(value: string): string {
  const segment = value
    .replaceAll(/[^a-zA-Z0-9._-]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, 80);
  return segment || "card";
}

export const makeAgentBoardFileSystem = Effect.gen(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const workspacePaths = yield* WorkspacePaths;

  const resolveBoardPath = Effect.fn("AgentBoardFileSystem.resolveBoardPath")(function* (
    cwd: string,
  ) {
    const projectRoot = yield* workspacePaths.normalizeWorkspaceRoot(cwd);
    const boardPath = yield* workspacePaths.resolveRelativePathWithinRoot({
      workspaceRoot: projectRoot,
      relativePath: BOARD_RELATIVE_PATH,
    });
    return { projectRoot, boardPath };
  });

  const makeDefaultBoard = (projectRoot: string): typeof AgentBoardFile.Type => {
    const timestamp = nowIso();
    return {
      schemaVersion: 1,
      projectRoot,
      defaultView: "kanban",
      runner: {
        maxConcurrentCards: 1,
        repairCycles: 3,
      },
      cards: [],
      graphLinks: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  };

  const writeBoard = Effect.fn("AgentBoardFileSystem.writeBoard")(function* (
    cwd: string,
    absolutePath: string,
    board: typeof AgentBoardFile.Type,
  ) {
    yield* fileSystem.makeDirectory(path.dirname(absolutePath), { recursive: true }).pipe(
      Effect.mapError(
        (cause) =>
          new AgentBoardFileSystemError({
            cwd,
            operation: "agentBoard.makeDirectory",
            detail: cause.message,
            cause,
          }),
      ),
    );
    yield* fileSystem.writeFileString(absolutePath, `${JSON.stringify(board, null, 2)}\n`).pipe(
      Effect.mapError(
        (cause) =>
          new AgentBoardFileSystemError({
            cwd,
            operation: "agentBoard.write",
            detail: cause.message,
            cause,
          }),
      ),
    );
  });

  const load: AgentBoardFileSystemShape["load"] = (input) =>
    Effect.gen(function* () {
      const { projectRoot, boardPath } = yield* resolveBoardPath(input.cwd);
      let created = false;
      const raw = yield* fileSystem.readFileString(boardPath.absolutePath).pipe(
        Effect.catch((cause) => {
          if (!input.createIfMissing) {
            return Effect.fail(
              new AgentBoardFileSystemError({
                cwd: input.cwd,
                operation: "agentBoard.read",
                detail: cause.message,
                cause,
              }),
            );
          }
          const board = makeDefaultBoard(projectRoot);
          created = true;
          return writeBoard(input.cwd, boardPath.absolutePath, board).pipe(
            Effect.as(JSON.stringify(board)),
          );
        }),
      );

      const parsed = yield* Effect.try({
        try: () => JSON.parse(raw) as unknown,
        catch: (cause) =>
          new AgentBoardFileSystemError({
            cwd: input.cwd,
            operation: "agentBoard.parse",
            detail: cause instanceof Error ? cause.message : "Invalid agent board JSON.",
            cause,
          }),
      });
      const board = yield* decodeAgentBoardFile(parsed).pipe(
        Effect.mapError(
          (cause) =>
            new AgentBoardFileSystemError({
              cwd: input.cwd,
              operation: "agentBoard.decode",
              detail: String(cause),
              cause,
            }),
        ),
      );

      return {
        board,
        relativePath: BOARD_RELATIVE_PATH,
        created,
      } satisfies AgentBoardLoadResult;
    });

  const save: AgentBoardFileSystemShape["save"] = (input) =>
    Effect.gen(function* () {
      const { projectRoot, boardPath } = yield* resolveBoardPath(input.cwd);
      const board = yield* decodeAgentBoardFile({
        ...input.board,
        projectRoot,
      }).pipe(
        Effect.mapError(
          (cause) =>
            new AgentBoardFileSystemError({
              cwd: input.cwd,
              operation: "agentBoard.decode",
              detail: String(cause),
              cause,
            }),
        ),
      );

      yield* writeBoard(input.cwd, boardPath.absolutePath, board);

      return {
        board,
        relativePath: BOARD_RELATIVE_PATH,
      } satisfies AgentBoardSaveResult;
    });

  const claim: AgentBoardFileSystemShape["claim"] = (input) =>
    Effect.gen(function* () {
      const { projectRoot } = yield* resolveBoardPath(input.cwd);
      const loaded = yield* load({ cwd: input.cwd, createIfMissing: false });
      const card = loaded.board.cards.find((candidate) => candidate.id === input.cardId);

      if (!card) {
        return yield* new AgentBoardFileSystemError({
          cwd: input.cwd,
          operation: "agentBoard.claim",
          detail: `Agent board card not found: ${input.cardId}`,
        });
      }

      if (card.state !== "Ready") {
        return yield* new AgentBoardFileSystemError({
          cwd: input.cwd,
          operation: "agentBoard.claim",
          detail: `Only Ready cards can be claimed. ${input.cardId} is ${card.state}.`,
        });
      }

      const workspacePath = `.t3/workspaces/${safeWorkspaceSegment(card.id)}`;
      const resolvedWorkspacePath = yield* workspacePaths.resolveRelativePathWithinRoot({
        workspaceRoot: projectRoot,
        relativePath: workspacePath,
      });
      yield* fileSystem.makeDirectory(resolvedWorkspacePath.absolutePath, { recursive: true }).pipe(
        Effect.mapError(
          (cause) =>
            new AgentBoardFileSystemError({
              cwd: input.cwd,
              operation: "agentBoard.makeWorkspace",
              detail: cause.message,
              cause,
            }),
        ),
      );

      const timestamp = nowIso();
      const nextCards = loaded.board.cards.map((nextCard) => {
        if (nextCard.id !== input.cardId) return nextCard;
        const {
          currentError: _currentError,
          currentDecisionQuestion: _currentDecisionQuestion,
          ...runtime
        } = nextCard.runtime;
        const nextRuntime = {
          ...runtime,
          attemptCount: runtime.attemptCount + 1,
          lastHeartbeatAt: timestamp,
          workspacePath,
        };
        return Object.assign({}, nextCard, {
          state: "Running" as const,
          runtime: nextRuntime,
          updatedAt: timestamp,
        }) satisfies AgentBoardCard;
      });
      const nextBoard = {
        ...loaded.board,
        cards: nextCards,
        updatedAt: timestamp,
      };

      const saved = yield* save({ cwd: input.cwd, board: nextBoard });
      const savedCard = saved.board.cards.find((candidate) => candidate.id === input.cardId);

      if (!savedCard) {
        return yield* new AgentBoardFileSystemError({
          cwd: input.cwd,
          operation: "agentBoard.claim",
          detail: `Claimed card missing after save: ${input.cardId}`,
        });
      }

      return {
        board: saved.board,
        card: savedCard,
        relativePath: saved.relativePath,
        workspacePath,
      } satisfies AgentBoardClaimResult;
    });

  return { load, save, claim } satisfies AgentBoardFileSystemShape;
});

export const AgentBoardFileSystemLive = Layer.effect(
  AgentBoardFileSystem,
  makeAgentBoardFileSystem,
);
