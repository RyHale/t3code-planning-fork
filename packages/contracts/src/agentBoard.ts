import { Effect, Schema } from "effect";
import { IsoDateTime, NonNegativeInt, PositiveInt, TrimmedNonEmptyString } from "./baseSchemas.ts";
import { RuntimeSessionId } from "./baseSchemas.ts";

export const AgentBoardSchemaVersion = Schema.Literal(1);
export type AgentBoardSchemaVersion = typeof AgentBoardSchemaVersion.Type;

export const AgentBoardCardId = TrimmedNonEmptyString.pipe(Schema.brand("AgentBoardCardId"));
export type AgentBoardCardId = typeof AgentBoardCardId.Type;

export const AgentBoardState = Schema.Literals([
  "Backlog",
  "Draft",
  "Ready",
  "Running",
  "Diagnosing",
  "Reviewing",
  "Review",
  "Done",
  "Blocked",
  "Needs Decision",
  "Canceled",
]);
export type AgentBoardState = typeof AgentBoardState.Type;

export const AgentBoardNonReadyState = Schema.Literals([
  "Backlog",
  "Draft",
  "Running",
  "Diagnosing",
  "Reviewing",
  "Review",
  "Done",
  "Blocked",
  "Needs Decision",
  "Canceled",
]);
export type AgentBoardNonReadyState = typeof AgentBoardNonReadyState.Type;

export const AgentBoardView = Schema.Literals(["kanban", "table", "execution-path"]);
export type AgentBoardView = typeof AgentBoardView.Type;

export const AgentBoardParallelismSafety = Schema.Literals(["false", "true", "conditional"]);
export type AgentBoardParallelismSafety = typeof AgentBoardParallelismSafety.Type;

export const AgentBoardIntentBrief = Schema.Struct({
  intent: TrimmedNonEmptyString,
  desiredOutcome: Schema.optionalKey(TrimmedNonEmptyString),
  acceptanceCriteria: Schema.Array(TrimmedNonEmptyString).pipe(
    Schema.withDecodingDefault(Effect.succeed([])),
  ),
  constraints: Schema.Array(TrimmedNonEmptyString).pipe(
    Schema.withDecodingDefault(Effect.succeed([])),
  ),
  nonGoals: Schema.Array(TrimmedNonEmptyString).pipe(
    Schema.withDecodingDefault(Effect.succeed([])),
  ),
  openDecisions: Schema.Array(TrimmedNonEmptyString).pipe(
    Schema.withDecodingDefault(Effect.succeed([])),
  ),
});
export type AgentBoardIntentBrief = typeof AgentBoardIntentBrief.Type;

export const AgentBoardParallelismPlan = Schema.Struct({
  safe: AgentBoardParallelismSafety.pipe(
    Schema.withDecodingDefault(Effect.succeed("false" as const)),
  ),
  reason: Schema.optionalKey(TrimmedNonEmptyString),
  conflictsWith: Schema.Array(AgentBoardCardId).pipe(
    Schema.withDecodingDefault(Effect.succeed([])),
  ),
  allowedWriteScopes: Schema.Array(TrimmedNonEmptyString).pipe(
    Schema.withDecodingDefault(Effect.succeed([])),
  ),
});
export type AgentBoardParallelismPlan = typeof AgentBoardParallelismPlan.Type;

export const AgentBoardRuntime = Schema.Struct({
  workspacePath: Schema.optionalKey(TrimmedNonEmptyString),
  branchName: Schema.optionalKey(TrimmedNonEmptyString),
  implementationRunId: Schema.optionalKey(RuntimeSessionId),
  reviewRunId: Schema.optionalKey(RuntimeSessionId),
  attemptCount: NonNegativeInt.pipe(Schema.withDecodingDefault(Effect.succeed(0))),
  lastHeartbeatAt: Schema.optionalKey(IsoDateTime),
  currentError: Schema.optionalKey(TrimmedNonEmptyString),
  currentDecisionQuestion: Schema.optionalKey(TrimmedNonEmptyString),
});
export type AgentBoardRuntime = typeof AgentBoardRuntime.Type;

export const AgentBoardGraphPosition = Schema.Struct({
  x: NonNegativeInt,
  y: NonNegativeInt,
});
export type AgentBoardGraphPosition = typeof AgentBoardGraphPosition.Type;

export const AgentBoardGraphLinkKind = Schema.Literals(["depends-on", "connects-to"]);
export type AgentBoardGraphLinkKind = typeof AgentBoardGraphLinkKind.Type;

export const AgentBoardGraphLink = Schema.Struct({
  from: TrimmedNonEmptyString,
  to: TrimmedNonEmptyString,
  kind: AgentBoardGraphLinkKind.pipe(
    Schema.withDecodingDefault(Effect.succeed("depends-on" as const)),
  ),
});
export type AgentBoardGraphLink = typeof AgentBoardGraphLink.Type;

const AgentBoardCardBaseFields = {
  id: AgentBoardCardId,
  title: TrimmedNonEmptyString,
  priority: PositiveInt.pipe(Schema.withDecodingDefault(Effect.succeed(3))),
  area: Schema.optionalKey(TrimmedNonEmptyString),
  slice: Schema.optionalKey(TrimmedNonEmptyString),
  taskRecordPath: Schema.optionalKey(TrimmedNonEmptyString),
  slicePlanPath: Schema.optionalKey(TrimmedNonEmptyString),
  graphPosition: Schema.optionalKey(AgentBoardGraphPosition),
  dependencies: Schema.Array(AgentBoardCardId).pipe(Schema.withDecodingDefault(Effect.succeed([]))),
  parallelism: AgentBoardParallelismPlan.pipe(
    Schema.withDecodingDefault(
      Effect.succeed({
        safe: "false" as const,
        conflictsWith: [],
        allowedWriteScopes: [],
      }),
    ),
  ),
  runtime: AgentBoardRuntime.pipe(
    Schema.withDecodingDefault(
      Effect.succeed({
        attemptCount: 0,
      }),
    ),
  ),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
} as const;

export const AgentBoardReadyCard = Schema.Struct({
  ...AgentBoardCardBaseFields,
  state: Schema.Literal("Ready"),
  intentBrief: AgentBoardIntentBrief,
});
export type AgentBoardReadyCard = typeof AgentBoardReadyCard.Type;

export const AgentBoardNonReadyCard = Schema.Struct({
  ...AgentBoardCardBaseFields,
  state: AgentBoardNonReadyState,
  intentBrief: Schema.optionalKey(AgentBoardIntentBrief),
});
export type AgentBoardNonReadyCard = typeof AgentBoardNonReadyCard.Type;

export const AgentBoardCard = Schema.Union([AgentBoardReadyCard, AgentBoardNonReadyCard]);
export type AgentBoardCard = typeof AgentBoardCard.Type;

export const AgentBoardRunnerSettings = Schema.Struct({
  maxConcurrentCards: PositiveInt.pipe(Schema.withDecodingDefault(Effect.succeed(1))),
  repairCycles: PositiveInt.pipe(Schema.withDecodingDefault(Effect.succeed(3))),
});
export type AgentBoardRunnerSettings = typeof AgentBoardRunnerSettings.Type;

export const AgentBoardFile = Schema.Struct({
  schemaVersion: AgentBoardSchemaVersion.pipe(
    Schema.withDecodingDefault(Effect.succeed(1 as const)),
  ),
  projectRoot: TrimmedNonEmptyString,
  defaultView: AgentBoardView.pipe(Schema.withDecodingDefault(Effect.succeed("kanban" as const))),
  runner: AgentBoardRunnerSettings.pipe(
    Schema.withDecodingDefault(
      Effect.succeed({
        maxConcurrentCards: 1,
        repairCycles: 3,
      }),
    ),
  ),
  cards: Schema.Array(AgentBoardCard).pipe(Schema.withDecodingDefault(Effect.succeed([]))),
  graphLinks: Schema.Array(AgentBoardGraphLink).pipe(
    Schema.withDecodingDefault(Effect.succeed([])),
  ),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});
export type AgentBoardFile = typeof AgentBoardFile.Type;

export const AgentBoardLoadInput = Schema.Struct({
  cwd: TrimmedNonEmptyString,
  createIfMissing: Schema.Boolean.pipe(Schema.withDecodingDefault(Effect.succeed(false))),
});
export type AgentBoardLoadInput = typeof AgentBoardLoadInput.Type;

export const AgentBoardLoadResult = Schema.Struct({
  board: AgentBoardFile,
  relativePath: Schema.Literal(".t3/agent-board.json"),
  created: Schema.Boolean,
});
export type AgentBoardLoadResult = typeof AgentBoardLoadResult.Type;

export const AgentBoardSaveInput = Schema.Struct({
  cwd: TrimmedNonEmptyString,
  board: AgentBoardFile,
});
export type AgentBoardSaveInput = typeof AgentBoardSaveInput.Type;

export const AgentBoardSaveResult = Schema.Struct({
  board: AgentBoardFile,
  relativePath: Schema.Literal(".t3/agent-board.json"),
});
export type AgentBoardSaveResult = typeof AgentBoardSaveResult.Type;

export const AgentBoardClaimInput = Schema.Struct({
  cwd: TrimmedNonEmptyString,
  cardId: AgentBoardCardId,
});
export type AgentBoardClaimInput = typeof AgentBoardClaimInput.Type;

export const AgentBoardClaimResult = Schema.Struct({
  board: AgentBoardFile,
  card: AgentBoardCard,
  relativePath: Schema.Literal(".t3/agent-board.json"),
  workspacePath: TrimmedNonEmptyString,
});
export type AgentBoardClaimResult = typeof AgentBoardClaimResult.Type;

export class AgentBoardFileError extends Schema.TaggedErrorClass<AgentBoardFileError>()(
  "AgentBoardFileError",
  {
    message: TrimmedNonEmptyString,
    cause: Schema.optional(Schema.Defect),
  },
) {}
