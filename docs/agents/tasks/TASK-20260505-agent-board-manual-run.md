# TASK-20260505-agent-board-manual-run

Status: `done`
Agent eligible: no
Slice: `docs/agents/slices/authoritative-agent-board.md`

## Owner Intent

Add a manual `Run` control for Ready cards so the board has a deliberate claim
step before workspace creation and agent dispatch are implemented.

## Target Status

`Tested`

## Scope Guard

Do not create worktrees, launch agents, poll for eligible cards, or stream run
status in this task.

## Acceptance Criteria

- Ready cards show a `Run` button.
- Clicking `Run` moves the card to `Running`.
- Clicking `Run` increments `runtime.attemptCount`.
- Clicking `Run` records `runtime.lastHeartbeatAt`.
- Clicking `Run` clears stale `runtime.currentError` and
  `runtime.currentDecisionQuestion` fields.

## Verification

- `bun fmt`
- `bun lint`
- `bun typecheck`
- `bun run test --filter @t3tools/contracts -- agentBoard`

## Parallelism Plan

Safe: `conditional`

Reason:

This can run beside backend workspace planning, but conflicts with board panel
state-control edits.

Allowed write scopes:

- `apps/web/src/components/AgentBoardPanel.tsx`
- `.t3/agent-board.json`
- `docs/agents/**`

Conflicts with:

- `TASK-20260505-agent-board-clarification`
- future board panel state-control edits

## Proof Of Done

- Added `Run` button for `Ready` cards.
- Added manual claim transition from `Ready` to `Running`.
- Runtime attempt count and heartbeat metadata update on claim.
- Stale runtime error and decision fields are omitted on claim.
- `bun fmt` passed.
- `bun lint` passed with 13 existing warnings.
- `bun typecheck` passed.
