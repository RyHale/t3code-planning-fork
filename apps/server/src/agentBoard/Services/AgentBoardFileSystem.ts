import { Context, Schema } from "effect";
import type { Effect } from "effect";
import type {
  AgentBoardClaimInput,
  AgentBoardClaimResult,
  AgentBoardLoadInput,
  AgentBoardLoadResult,
  AgentBoardSaveInput,
  AgentBoardSaveResult,
} from "@t3tools/contracts";
import {
  WorkspacePathOutsideRootError,
  WorkspaceRootCreateFailedError,
  WorkspaceRootNotDirectoryError,
  WorkspaceRootNotExistsError,
} from "../../workspace/Services/WorkspacePaths.ts";

export class AgentBoardFileSystemError extends Schema.TaggedErrorClass<AgentBoardFileSystemError>()(
  "AgentBoardFileSystemError",
  {
    cwd: Schema.String,
    operation: Schema.String,
    detail: Schema.String,
    cause: Schema.optional(Schema.Defect),
  },
) {}

export interface AgentBoardFileSystemShape {
  readonly load: (
    input: AgentBoardLoadInput,
  ) => Effect.Effect<
    AgentBoardLoadResult,
    | AgentBoardFileSystemError
    | WorkspaceRootNotExistsError
    | WorkspaceRootCreateFailedError
    | WorkspaceRootNotDirectoryError
    | WorkspacePathOutsideRootError
  >;
  readonly save: (
    input: AgentBoardSaveInput,
  ) => Effect.Effect<
    AgentBoardSaveResult,
    | AgentBoardFileSystemError
    | WorkspaceRootNotExistsError
    | WorkspaceRootCreateFailedError
    | WorkspaceRootNotDirectoryError
    | WorkspacePathOutsideRootError
  >;
  readonly claim: (
    input: AgentBoardClaimInput,
  ) => Effect.Effect<
    AgentBoardClaimResult,
    | AgentBoardFileSystemError
    | WorkspaceRootNotExistsError
    | WorkspaceRootCreateFailedError
    | WorkspaceRootNotDirectoryError
    | WorkspacePathOutsideRootError
  >;
}

export class AgentBoardFileSystem extends Context.Service<
  AgentBoardFileSystem,
  AgentBoardFileSystemShape
>()("t3/agentBoard/Services/AgentBoardFileSystem") {}
