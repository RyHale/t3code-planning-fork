# TASK-20260505-agent-board-workspace-claim

Status: Done
Slice: `docs/agents/slices/authoritative-agent-board.md`

## Intent Brief

Intent: Make the Ready card Run action authoritative by claiming it through the
server board service and creating a project-local workspace folder.

Desired outcome: Running cards have persisted workspace metadata from a
validated server-side transition instead of a UI-only state mutation.

Acceptance criteria:

- The shared contracts expose a `claimAgentBoardCard` RPC input and result.
- The server claim operation only accepts Ready cards.
- Claiming a card creates a `.t3/workspaces/<card-id>` folder inside the active
  project.
- Claiming a card moves it to `Running`, increments `attemptCount`, records
  `lastHeartbeatAt`, clears stale runtime error/decision fields, and stores
  `runtime.workspacePath`.
- The board panel `Run` button calls the server claim RPC and refreshes from the
  returned board.

Constraints:

- Keep workspace metadata in `.t3/agent-board.json`.
- Keep workspace folders project-local under `.t3/workspaces`.
- Do not launch an implementation agent in this slice.

Non-goals:

- Agent dispatch.
- Worktree branch creation.
- Run status streaming.
- Automatic queue polling.

## Proof

- Added `AgentBoardClaimInput` and `AgentBoardClaimResult` to
  `packages/contracts/src/agentBoard.ts`.
- Added `projects.claimAgentBoardCard` to shared RPC contracts, IPC types, the
  web RPC client, and environment API.
- Added server-side claim behavior to `AgentBoardFileSystem`.
- Updated the board panel `Run` action to call the server claim RPC.
- Added service tests for successful claim/workspace creation and non-Ready
  rejection.

## Verification

- `bun run test --filter @t3tools/contracts -- agentBoard`
- `bun run test --filter t3 -- AgentBoardFileSystem`
