# TASK-20260505-agent-board-clarification

Status: `done`
Agent eligible: no
Slice: `docs/agents/slices/authoritative-agent-board.md`

## Owner Intent

Add the first clarification workflow inside the board panel so a rough card can
be shaped into an agent-ready task record without manually editing markdown.

## Target Status

`Tested`

## Scope Guard

Do not implement automated AI questioning, runner dispatch, workspace claiming,
drag and drop, or a full task-record editor.

## Acceptance Criteria

- Selecting a board card shows intent, desired outcome, acceptance criteria,
  constraints, non-goals, and open-decision fields.
- Saving the brief persists `intentBrief` to `.t3/agent-board.json`.
- Creating a task record writes markdown under `docs/agents/tasks/`.
- Creating a task record attaches `taskRecordPath`, fills `slicePlanPath` when
  missing, and moves the card to `Ready`.
- The flow uses existing `projects.writeFile` and board save APIs.

## Verification

- `bun fmt`
- `bun lint`
- `bun typecheck`
- `bun run test --filter @t3tools/contracts -- agentBoard`

## Parallelism Plan

Safe: `conditional`

Reason:

This can run beside backend runner planning, but conflicts with board panel
detail editing and board schema changes.

Allowed write scopes:

- `apps/web/src/components/AgentBoardPanel.tsx`
- `.t3/agent-board.json`
- `docs/agents/**`

Conflicts with:

- `TASK-20260505-agent-board-panel`

## Proof Of Done

- Added selected-card intent fields in the board panel.
- Added save-brief behavior.
- Added task-record markdown generation through `projects.writeFile`.
- Added Ready transition with `taskRecordPath`, default `slicePlanPath`, and
  `intentBrief`.
- `bun fmt` passed.
- `bun lint` passed with 13 existing warnings.
- `bun typecheck` passed.
