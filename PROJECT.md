# T3 Code Authoritative Agent Board

Status: Product direction draft

## North Star

T3 Code should let a user manage agent work at the project level instead of
supervising every coding turn. The user should be able to break a large project
into durable plans, task records, and board cards; move selected work to
`Ready`; and let T3 Code run an autonomous, self-testing, self-reviewing agent
loop inside isolated workspaces.

The board is not just a dashboard. It is the authoritative source of local
agent work for the active project.

## Product Promise

For each project folder, T3 Code should provide:

- a right-side board panel for project work
- project-local durable planning docs
- task records that preserve owner intent and completion criteria
- cards that launch work only when moved to `Ready`
- isolated card workspaces
- fresh review agents for independent review and integration
- automatic self-diagnosis and self-repair for routine failures
- clear `Needs Decision` stops when user intent is required
- Kanban, list/table, and later execution-path visualizations over the same data

## Target User

The primary user works at a higher product and planning level. They are willing
to invest up front in intent, scope, and sequencing, but they do not want to
inspect every low-level code failure or manually shepherd each agent through
implementation, tests, review, and integration.

## Core Workflow

1. The user creates or opens a project in T3 Code.
2. T3 detects or scaffolds the project planning stack.
3. The user creates a rough card, task record, or slice plan.
4. T3 runs a clarification flow when intent is not ready.
5. T3 creates or updates the linked task record.
6. The visual board shows the card in `Backlog` or `Draft`.
7. The user moves the card to `Ready`.
8. The board runner claims the card and creates an isolated workspace.
9. An implementation agent works through the task.
10. T3 runs verification and self-repair cycles.
11. A fresh review agent evaluates and integrates the work.
12. T3 updates the task record and board proof.
13. The card moves to `Done`, `Review`, or `Needs Decision`.
14. The runner continues to the next eligible `Ready` card.

## Planning Stack

T3 Code should scaffold and understand this generic project structure:

```text
WORKFLOW.md
PROJECT.md
CONTEXT.md or CONTEXT-MAP.md
docs/agents/project-master-plan.md
docs/agents/slices/README.md
docs/agents/slices/<slice-name>.md
docs/agents/tasks/README.md
docs/agents/tasks/TASK-*.md
.t3/agent-board.json
```

This structure is inspired by the GCtotalV6 planning stack:

- `WORKFLOW.md` gives agents and orchestrators the operating contract.
- `PROJECT.md` gives the product and architecture north star.
- `CONTEXT.md` or `CONTEXT-MAP.md` preserves domain language.
- `project-master-plan.md` captures the larger roadmap and compact board.
- slice plans explain branches of related work.
- task records define runnable vertical slices.
- `.t3/agent-board.json` stores the live board and orchestration state.

## Board Data Model

Each card should include:

- stable ID
- title
- state
- priority
- owner intent
- acceptance criteria
- constraints
- non-goals
- dependencies
- linked task record path
- linked slice plan path
- parallelism plan
- allowed write scopes
- workspace path
- branch name
- run IDs
- attempt count
- last heartbeat
- last proof summary
- current decision question when blocked

Planning fields sync with task records. Runtime fields stay in the board file.

## Board States

Initial states:

- `Backlog`
- `Draft`
- `Ready`
- `Running`
- `Diagnosing`
- `Reviewing`
- `Review`
- `Done`
- `Blocked`
- `Needs Decision`
- `Canceled`

`Ready` is the only state that permits autonomous pickup.

## Board UI

Phase one should use a right-side expandable board panel because it stays close
to the existing chat and task-panel workflow.

The panel should support:

- minimized/collapsed state
- compact Kanban columns
- active-card details
- clarify action
- move to Ready
- pause/resume/cancel where safe
- open task record
- open workspace
- see proof and current blocker

Later views should include:

- full board tab or expanded board mode
- list/table view
- execution path view with dependency lines, nodes, or timeline sequencing

Kanban remains the primary control surface.

## Clarification Flow

T3 should help turn rough work into runnable work by asking one focused question
at a time.

The clarification flow should fill:

- owner intent
- desired outcome
- definition of done
- acceptance criteria
- constraints
- non-goals
- dependencies
- relevant docs/files
- scope guard
- verification expectation
- parallelism plan
- open decisions

Cards that lack enough intent cannot enter `Ready`.

## Autonomous Delivery Requirements

The autonomous loop should handle routine engineering failures without asking
the user:

- failing tests
- failing typecheck
- lint/format failures
- missing implementation details
- review-agent bug findings
- repairable conflicts

The loop should ask the user only for:

- unclear intent
- conflicting valid product directions
- destructive or irreversible action
- missing credentials
- cost/rate-limit boundary
- architecture expansion outside the card
- repeated failure after three repair cycles

## Fresh Review Agent

Completed implementation work should be reviewed by a new agent session that
does not inherit the implementation thread.

The fresh review agent should:

- inspect task intent and project docs
- inspect changed files and proof
- run or validate focused checks
- identify bugs, missing tests, or scope drift
- repair issues when safe
- integrate the work when safe
- move the card forward or ask for a decision

## Parallelism

Default concurrency is one card at a time per project.

T3 should support planned parallelism when task records specify:

- safe concurrent execution
- non-overlapping write scopes
- dependencies
- conflicts
- reason parallelism is safe

Parallelism is planned metadata, not a global guess.

## Phased Delivery

### Phase 1: Durable Planning Stack

- Scaffold `WORKFLOW.md`, `PROJECT.md`, context docs, slice docs, task records,
  and `.t3/agent-board.json`.
- Define schemas for cards, task records, states, and syncable fields.
- Add import/sync between task records and board cards.

### Phase 2: Right-Side Board Panel

- Add a collapsible right-side board panel.
- Render Kanban columns from the project board file.
- Allow card creation, editing, and state changes.
- Add task-record links and detail drawer.

### Phase 3: Clarification And Draft Generation

- Add guided clarification for rough cards.
- Generate task drafts from project-master-plan and slice plans.
- Require accepted task records before `Ready`.

### Phase 4: Board Runner MVP

- Watch the board file for `Ready` cards.
- Claim one card at a time.
- Create isolated workspaces.
- Launch agent sessions using the project workflow and task record.
- Stream status back to the card.

### Phase 5: Autonomous Review And Repair

- Add self-diagnosis and repair cycles.
- Add fresh review agent sessions.
- Add proof updates to task records.
- Move cards to `Done`, `Review`, or `Needs Decision`.

### Phase 6: Advanced Views

- Add full-board mode or tab.
- Add list/table view.
- Add execution path view for dependencies, vertical slices, and timeline-style
  planning.

## Non-Goals For The First Build

- Replacing external trackers such as Linear or GitHub Issues.
- Building a cloud orchestration service.
- Auto-running title-only tasks.
- Running every ready card in parallel.
- Treating the execution path view as the primary board.
- Requiring every project to use the full planning stack before simple cards work.

## Open Decisions

- Exact board file schema and migration strategy.
- Whether `.t3/agent-board.json` should be JSON or SQLite-backed with export.
- How T3 should merge or apply changes from card workspaces.
- Whether task record markdown should include YAML front matter.
- How much of the board runner should reuse existing provider/session
  infrastructure versus a separate orchestration service.
- Which UI route owns the future full-board view.
