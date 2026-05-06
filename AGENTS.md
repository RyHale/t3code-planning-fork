# AGENTS.md

## Task Completion Requirements

- All of `bun fmt`, `bun lint`, and `bun typecheck` must pass before considering tasks completed.
- NEVER run `bun test`. Always use `bun run test` (runs Vitest).

## Project Snapshot

T3 Code is a minimal web GUI for using coding agents like Codex and Claude.

This repository is a VERY EARLY WIP. Proposing sweeping changes that improve long-term maintainability is encouraged.

## Core Priorities

1. Performance first.
2. Reliability first.
3. Keep behavior predictable under load and during failures (session restarts, reconnects, partial streams).

If a tradeoff is required, choose correctness and robustness over short-term convenience.

## Maintainability

Long term maintainability is a core priority. If you add new functionality, first check if there is shared logic that can be extracted to a separate module. Duplicate logic across multiple files is a code smell and should be avoided. Don't be afraid to change existing code. Don't take shortcuts by just adding local logic to solve a problem.

## Supervisor-First Agent Workflow

For non-trivial implementation work, the default agent acts as a
Supervisor/Architect rather than a direct coding worker.

The supervisor must:

- Read `WORKFLOW.md`, relevant project docs, linked slice plans, linked task
  records, and `.t3/agent-board.json` before shaping work.
- Run an architectural pass before implementation starts.
- Create or update board cards, task records, dependencies, allowed write
  scopes, and proof-of-done expectations.
- Delegate production code changes to fresh worker agents when orchestration is
  available and the user has authorized delegation.
- Require worker reports that include changed files, verification run, docs
  updated, blockers, risks, and remaining gaps.
- Use review/audit passes for meaningful implementation before marking work
  `Done`.
- Keep the board and task records synchronized as the visible proof ledger.

Trivial edits, docs-only changes, formatting, and explicitly requested tiny
fixes may be handled directly. If a small change affects project direction,
dependencies, workflow state, or public patch maintenance, update the relevant
planning docs before closing.

## Public Patch Maintenance

This repository is a fork/modification of upstream T3 Code. Keep `PATCH.md`
current whenever a change adds, moves, or materially changes fork-specific
behavior.

`PATCH.md` must explain:

- which files are part of the local planning/agent-board patch
- why the patch exists
- how it attaches to upstream T3 Code
- what is likely to break when upstream changes
- how to reinstall or repair the patch after pulling upstream updates

Prefer isolated modules, contracts, docs, and installable planning assets over
scattering fork-specific behavior through unrelated code paths. When touching
core T3 Code files, keep the attachment points small and document them in
`PATCH.md`.

## Package Roles

- `apps/server`: Node.js WebSocket server. Wraps Codex app-server (JSON-RPC over stdio), serves the React web app, and manages provider sessions.
- `apps/web`: React/Vite UI. Owns session UX, conversation/event rendering, and client-side state. Connects to the server via WebSocket.
- `packages/contracts`: Shared effect/Schema schemas and TypeScript contracts for provider events, WebSocket protocol, and model/session types. Keep this package schema-only — no runtime logic.
- `packages/shared`: Shared runtime utilities consumed by both server and web. Uses explicit subpath exports (e.g. `@t3tools/shared/git`) — no barrel index.

## Codex App Server (Important)

T3 Code is currently Codex-first. The server starts `codex app-server` (JSON-RPC over stdio) per provider session, then streams structured events to the browser through WebSocket push messages.

How we use it in this codebase:

- Session startup/resume and turn lifecycle are brokered in `apps/server/src/codexAppServerManager.ts`.
- Provider dispatch and thread event logging are coordinated in `apps/server/src/providerManager.ts`.
- WebSocket server routes NativeApi methods in `apps/server/src/wsServer.ts`.
- Web app consumes orchestration domain events via WebSocket push on channel `orchestration.domainEvent` (provider runtime activity is projected into orchestration events server-side).

Docs:

- Codex App Server docs: https://developers.openai.com/codex/sdk/#app-server

## Reference Repos

- Open-source Codex repo: https://github.com/openai/codex
- Codex-Monitor (Tauri, feature-complete, strong reference implementation): https://github.com/Dimillian/CodexMonitor

Use these as implementation references when designing protocol handling, UX flows, and operational safeguards.

## Agent Board Planning Graph

The project Planning graph is generated from `.t3/agent-board.json`; it is not a
manual diagram. When adding or updating board work, keep these fields current:

- `area`: the larger sub-project bucket, such as Frontend, Backend, or Admin.
- `slice`: the smaller vertical chunk within an area.
- `dependencies`: card IDs that must complete before this card is unblocked.
- `taskRecordPath`: the linked runnable task record under `docs/agents/tasks/`.
- `slicePlanPath`: the linked slice plan under `docs/agents/slices/`.

Use `dependencies` only for hard execution blockers. Do not use it for loose
coordination, shared domain concepts, or frontend/backend features that merely
need to agree on an interface.

Preferred relationship language:

- `depends on`: this card cannot be completed or verified until the referenced
  card is done.
- `connects to`: this card must coordinate with another card, but both can move
  in parallel if the contract is clear.
- `shares contract with`: cards meet at an API, schema, event, route, data
  shape, permission rule, or UI state.
- `conflicts with`: cards are unsafe to run in parallel because they touch the
  same files, migrations, state model, or user workflow.
- `enables`: the referenced card is not required for implementation, but it
  makes the feature usable or demonstrable.

Example: a frontend login screen and backend auth endpoint usually `share
contract with` each other. The backend endpoint does not depend on the frontend
to exist. A full login UX card may `depend on` both if its proof-of-done is an
end-to-end user login flow.

When editing task records or slice plans, mirror important dependency changes
back into `.t3/agent-board.json` so Kanban, Planning table, and Dependency graph
stay consistent. Do not encode dependency truth only in prose. Use prose for
explanation, but keep the board fields authoritative for visualization.
