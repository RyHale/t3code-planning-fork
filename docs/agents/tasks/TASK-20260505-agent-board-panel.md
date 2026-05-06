# TASK-20260505-agent-board-panel

Status: `done`
Agent eligible: no
Slice: `docs/agents/slices/authoritative-agent-board.md`

## Owner Intent

Add the first usable right-side board panel so the project-local
`.t3/agent-board.json` is visible and lightly editable from T3 Code.

## Target Status

`Tested`

## Scope Guard

Do not implement runner dispatch, workspace claiming, drag and drop, task-record
generation, or a full card editor in this slice.

## Acceptance Criteria

- The composer can open a Board panel for the active project.
- The panel loads or creates `.t3/agent-board.json` through the environment API.
- Cards render in Kanban-style state groups.
- Users can add Draft cards.
- Users can move cards between supported states and persist those moves.
- Existing Plan/Tasks sidebar behavior remains available when an active plan is
  present.

## Verification

- `bun fmt`
- `bun lint`
- `bun typecheck`

## Parallelism Plan

Safe: `conditional`

Reason:

This can run beside backend runner planning, but not beside edits to the chat
composer right-panel controls or the board RPC contract.

Allowed write scopes:

- `apps/web/src/components/AgentBoardPanel.tsx`
- `apps/web/src/components/ChatView.tsx`
- `.t3/agent-board.json`
- `docs/agents/**`

Conflicts with:

- `TASK-20260505-agent-board-file-service`
- future right-panel layout refactors

## Proof Of Done

- Added `AgentBoardPanel`.
- Wired the chat shell to show Board when no active plan panel takes priority.
- Board panel can load/create the project board, show grouped cards, add Draft
  cards, refresh, and save state moves.
- `bun fmt` passed.
- `bun lint` passed with 13 existing warnings.
- `bun typecheck` passed.
