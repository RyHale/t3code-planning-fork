# T3 Code Authoritative Agent Board Master Plan

Last updated: 2026-05-05

This is the canonical implementation plan for the authoritative agent board.
It breaks the product direction from `PROJECT.md` into slices that can become
task records and board cards.

## North Star

T3 Code should let users manage autonomous agent work through project-local
planning docs and a right-side board panel. The board is the source of truth for
which cards are ready, running, blocked, reviewing, or done.

## Symphony-Ready Board

### Ready For Agent

| Slice | Target | Task | Scope guard |
| ----- | ------ | ---- | ----------- |
| None  | -      | -    | -           |

### Backlog

| Slice                   | Reason                                               |
| ----------------------- | ---------------------------------------------------- |
| Board runner MVP        | Needs board persistence and workspace creation path. |
| Fresh review agent loop | Needs runner MVP and proof update path.              |
| Advanced board views    | Needs stable dependency and slice metadata.          |

### Needs Decision

| Topic                     | Required decision                                                       |
| ------------------------- | ----------------------------------------------------------------------- |
| Board persistence backend | Start with JSON, or use SQLite with JSON export from the beginning.     |
| Workspace integration     | Merge worktree branches, apply patches, or create review threads first. |

## Slices

### Slice 1: Durable Planning Stack And Board Contract

Status: `done`

Purpose:

- Establish the project-local file structure and typed board file contract that
  later UI and runner slices can build on.

Proof:

- `WORKFLOW.md`, `PROJECT.md`, context docs, slice docs, task records, and
  `.t3/agent-board.json` exist.
- `packages/contracts` exports an `AgentBoardFile` schema.
- Focused contract tests decode expected board files and reject title-only ready
  cards.
- `bun run test --filter @t3tools/contracts -- agentBoard`, `bun fmt`,
  `bun lint`, and `bun typecheck` passed.

### Slice 2: Board File Service

Status: `done`

Purpose:

- Add server-side read/write operations for `.t3/agent-board.json` scoped to a
  project root.

Proof:

- Server can load, validate, create, and update a project board file without
  touching unrelated project folders.
- `packages/contracts` exports board load/save RPC contracts.
- Web environment APIs expose typed `projects.loadAgentBoard` and
  `projects.saveAgentBoard` calls.
- Focused service tests cover create, missing file, save, and invalid Ready card
  paths.
- `bun run test --filter t3 -- AgentBoardFileSystem`, `bun fmt`, `bun lint`,
  and `bun typecheck` passed.

### Slice 3: Right-Side Board Panel

Status: `done`

Purpose:

- Add a collapsible board panel that renders the project board and card detail.

Proof:

- Users can view columns, create cards, edit planning fields, and move eligible
  cards to `Ready`.
- Added `AgentBoardPanel` using existing right-side panel affordances.
- The panel loads or creates `.t3/agent-board.json`, shows cards by state, adds
  draft cards, refreshes, and persists state moves through the board RPC API.
- `bun fmt`, `bun lint`, and `bun typecheck` passed.

### Slice 4: Task Records And Clarification

Status: `done`

Purpose:

- Connect cards to durable task records and provide a guided clarification flow
  for rough work.

Proof:

- A rough card can become a task record plus eligible board card without manual
  markdown editing.
- Selecting a card in the board panel exposes intent brief fields.
- Users can save intent brief fields back to `.t3/agent-board.json`.
- Users can create a durable task record under `docs/agents/tasks/` and move the
  card to `Ready`.
- `bun fmt`, `bun lint`, and `bun typecheck` passed.

### Slice 5: Board Runner MVP

Status: `in-progress`

Purpose:

- Claim one ready card, create an isolated workspace, and launch an agent run.

Proof:

- A ready card moves through running status with workspace and run metadata in
  the board file.
- 5A complete: Ready cards expose a manual `Run` control.
- 5A complete: `Run` moves a card to `Running`, increments
  `runtime.attemptCount`, records `runtime.lastHeartbeatAt`, and clears stale
  runtime error/decision fields.
- 5B complete: `Run` now claims through a server RPC, creates a project-local
  `.t3/workspaces/<card-id>` folder, persists `runtime.workspacePath`, and
  rejects non-Ready cards.
- 5C complete: a claimed board card now starts a fresh orchestration
  implementation thread and persists `runtime.implementationRunId`; launch
  failures mark the card `Blocked` with `runtime.currentError`.
- Remaining: stream run status back into the board.

### Slice 6: Autonomous Review And Repair

Status: `not-started`

Purpose:

- Add repair cycles and fresh review-agent handoff before cards become done.

Proof:

- Routine failures are retried up to the configured repair-cycle limit, while
  intent decisions stop at `Needs Decision`.

### Slice 7: Expanded Views

Status: `not-started`

Purpose:

- Add full-board, table, and execution path views over the same card data.

Proof:

- Users can switch views without creating a second planning system.
