# TASK-20260505-agent-board-file-service

Status: `done`
Agent eligible: no
Slice: `docs/agents/slices/authoritative-agent-board.md`

## Owner Intent

Add project-local server persistence for the authoritative board so future UI and
runner work uses typed load/save operations instead of direct file mutation.

## Target Status

`Tested`

## Scope Guard

Do not build the right-side board UI, agent runner, workspace claiming, or
automatic card dispatch in this task.

## Acceptance Criteria

- The shared contracts package defines load/save request and result schemas.
- The websocket RPC contract includes `projects.loadAgentBoard` and
  `projects.saveAgentBoard`.
- The web environment API exposes typed pass-through methods for board load/save.
- The server can create, load, validate, and save `.t3/agent-board.json` inside
  the selected project root.
- Invalid board payloads, including title-only `Ready` cards, fail validation.

## Verification

- `bun run test --filter @t3tools/contracts -- agentBoard`
- `bun run test --filter t3 -- AgentBoardFileSystem`
- `bun fmt`
- `bun lint`
- `bun typecheck`

## Parallelism Plan

Safe: `conditional`

Reason:

This can run beside independent UI exploration, but not beside edits to the
board schema, RPC method list, or workspace file services.

Allowed write scopes:

- `packages/contracts/src/agentBoard.ts`
- `packages/contracts/src/rpc.ts`
- `packages/contracts/src/ipc.ts`
- `apps/web/src/rpc/wsRpcClient.ts`
- `apps/web/src/environmentApi.ts`
- `apps/server/src/agentBoard/**`
- `apps/server/src/ws.ts`
- `apps/server/src/server.ts`
- `apps/server/src/server.test.ts`
- `.t3/agent-board.json`
- `docs/agents/**`

Conflicts with:

- `TASK-20260505-agent-board-contract`
- future board panel work while RPC contracts are changing

## Proof Of Done

- Added shared load/save contracts and exported them through IPC/RPC types.
- Added server `AgentBoardFileSystem` service and live layer.
- Wired websocket handlers for load/save board methods.
- Added web RPC and environment API pass-through methods.
- Added focused server tests for create, missing file, save, and invalid Ready
  card validation.
- `bun run test --filter @t3tools/contracts -- agentBoard` passed.
- `bun run test --filter t3 -- AgentBoardFileSystem` passed.
- `bun fmt` passed.
- `bun lint` passed with 13 existing warnings.
- `bun typecheck` passed.
