# T3 Code Planning Patch

Status: Draft

Purpose: document the fork-specific Planning, agent-board, and
supervisor-workflow modifications so this public patch can be repaired after
upstream T3 Code changes.

## Patch Goals

- Add a project-local planning board backed by `.t3/agent-board.json`.
- Keep planning state visible through Kanban, Planning table, and Dependency
  tree views.
- Make markdown planning docs the durable reasoning layer.
- Make the board the visible proof ledger.
- Support a supervisor-first agent workflow where implementation is delegated
  to bounded worker agents and reviewed before `Done`.
- Keep the planning stack portable and installable instead of spreading hidden
  behavior throughout the repo.

## Source Of Truth Files

These files define the planning workflow and should move together when the
patch is installed elsewhere:

- `AGENTS.md`
- `WORKFLOW.md`
- `PROJECT.md` when present
- `CONTEXT.md` or `CONTEXT-MAP.md` when present
- `docs/agents/project-master-plan.md`
- `docs/agents/symphony-conformance.md`
- `docs/agents/slices/`
- `docs/agents/tasks/`
- `docs/agents/templates/` when present
- `.t3/agent-board.json`

Public repo note: upstream/internal `.docs/`, `.plans/`, `.cursor/`, and
`.vscode/` folders are intentionally omitted from this fork's published branch.
They are not required for the Planning patch and make the public repository
harder to inspect.

## Core Integration Points

The current patch attaches to upstream T3 Code through these areas:

- `packages/contracts/src/agentBoard.ts`
  - Shared board schema, card states, runtime metadata, graph links, and claim
    contract types.
- `packages/contracts/src/agentBoard.test.ts`
  - Contract coverage for the board file shape.
- `apps/server/src/agentBoard/`
  - Project-local board file load/save/claim behavior.
- `apps/server/src/ws.ts` and related RPC wiring
  - Board operations exposed to the web client.
- `apps/web/src/environmentApi.ts` and RPC client wiring
  - Client access to board operations.
- `apps/web/src/components/AgentBoardPanel.tsx`
  - Kanban, Planning table, card detail editor, and Dependency tree UI.
- `apps/web/src/components/ChatView.tsx`
  - Planning tab entry point, board panel integration, and the persisted
    `Break` safety control that disables Planning features at runtime.
- `apps/web/src/agentBoardPrompt.ts`
  - Board-card handoff prompt construction when present.

If upstream T3 Code changes navigation, project routing, RPC transport,
provider orchestration, or chat layout, start repair from these files.

## Upstream Tracking

This local repository tracks upstream T3 Code for awareness only:

```text
upstream fetch: https://github.com/pingdotgg/t3code.git
upstream push: DISABLED
```

Use `git fetch upstream --prune` to see upstream changes. Do not push planning
fork changes to upstream unless the maintainer workflow explicitly changes.

To inspect upstream drift without merging:

```powershell
git fetch upstream --prune
git log --oneline --decorate main..upstream/main
git diff --stat main..upstream/main
```

Merge or rebase only after reviewing `PATCH.md` attachment points.

## Symphony Alignment

The planning workflow is intended to mimic Symphony's long-running project
shape while using a local board file instead of Linear.

Core mapping:

- Symphony issue tracker -> T3 local `.t3/agent-board.json`.
- Symphony issue -> T3 work card.
- Symphony issue identifier -> stable board card ID.
- Symphony workpad comment -> linked task record under `docs/agents/tasks/`.
- Symphony per-issue workspace -> T3 card workspace.
- Symphony status surface -> Planning Kanban/table/dependency views.

Keep `WORKFLOW.md` front matter close to Symphony's canonical top-level keys:
`tracker`, `polling`, `workspace`, `hooks`, `agent`, and `codex`. T3-specific
fields should be documented as extensions in `WORKFLOW.md` and summarized in
`docs/agents/symphony-conformance.md`.

## Data Model

Board data is stored in `.t3/agent-board.json`.

Important card fields:

- `id`
- `title`
- `state`
- `priority`
- `area`
- `slice`
- `taskRecordPath`
- `slicePlanPath`
- `dependencies`
- `parallelism`
- `runtime`
- `intentBrief`

Important board fields:

- `schemaVersion`
- `projectRoot`
- `defaultView`
- `runner`
- `cards`
- `graphLinks`
- `createdAt`
- `updatedAt`

Dependency truth belongs in `dependencies`. Use prose in task and slice docs to
explain relationships, but keep the board fields authoritative for
visualization.

## Supervisor-First Workflow

Default behavior for non-trivial implementation:

1. Supervisor reads the project planning stack.
2. Supervisor runs an architectural pass.
3. Supervisor creates or updates the board card and task record.
4. Supervisor generates a bounded worker handoff packet.
5. Worker agent implements within allowed write scopes.
6. Worker reports changed files, verification, docs, risks, and gaps.
7. Reviewer or supervisor audits the result.
8. Supervisor updates board/task docs and decides the next state.

The supervisor may directly perform docs, board maintenance, formatting, and
tiny explicitly requested fixes. Production implementation should be delegated
when orchestration is available and authorized.

## Install/Repair Shape

For another T3 Code checkout, the planning patch should be installable in these
layers:

1. Copy planning docs and templates.
2. Add shared board contracts.
3. Add server board file service and RPC methods.
4. Add web board API client methods.
5. Add Planning tab and `AgentBoardPanel`.
6. Wire Run/claim behavior into orchestration.
7. Run `bun fmt`, `bun lint`, and `bun typecheck`.

Keep future changes aligned with that layering. Avoid placing planning rules in
unrelated UI or provider code unless there is no smaller attachment point.

## Upstream Break Risks

- Chat route or tab structure changes may break the Planning entry point.
- Header/action layout changes may break the `Break` safety control.
- WebSocket/RPC contract changes may break board load/save/claim methods.
- Contract package schema conventions may change.
- Project root/environment selection may change how `.t3/agent-board.json` is
  located.
- Provider orchestration changes may affect Run/claim handoff behavior.
- CSS/component library changes may affect `AgentBoardPanel` layout.
- GitHub Actions workflow files are intentionally omitted from this public
  fork's initial push unless the publishing token has GitHub `workflow` scope.

## Maintenance Rule

When a future change touches fork-specific planning behavior, update this file
in the same task. A future repair agent should be able to read `PATCH.md` and
know where the patch attaches, what to verify, and which files should remain
portable.

## Runtime Break Control

The project header includes a `Break` button. It stores
`t3code.planningFeaturesDisabled` in browser local storage, switches the project
view back to Chat, disables the Planning tab, and prevents `AgentBoardPanel`
from rendering.

Use this if the Planning UI, board parser, or dependency view is crashing during
an active run. The same button appears as `Planning disabled` and can re-enable
the extra features after the run is safe.
