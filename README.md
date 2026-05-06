# T3 Code Planning Fork

This is an experimental public fork of [T3 Code](https://github.com/pingdotgg/t3code) that adds a project-local planning layer for AI-assisted software work.

The goal is to make T3 Code behave more like a supervisor console: the user talks to an architectural/orchestration agent, the agent keeps a concise planning ledger up to date, and implementation work can be handed to bounded worker agents with clearer proof-of-done expectations.

## Planning Views

These screenshots use local demo board data to show the intended feature surface.

### Kanban

![Planning Kanban view](./docs/assets/planning-kanban.png)

### Planning Table

![Planning table view](./docs/assets/planning-table.png)

### Dependency Tree

![Planning dependency tree view](./docs/assets/planning-dependency-tree.png)

## What Is Different

This fork adds:

- A `Planning` project tab next to `Chat`.
- A project-local board file at `.t3/agent-board.json`.
- Kanban, Planning table, and Dependency tree views over the same board data.
- Card detail editing for intent, acceptance criteria, constraints, non-goals, dependencies, area, slice, and slice plan.
- Server-side board load/save/claim APIs.
- Shared board contracts in `packages/contracts`.
- Supervisor-first workflow docs in `AGENTS.md` and `WORKFLOW.md`.
- Worker handoff, worker report, review report, and board example templates under `docs/agents/templates/`.
- A `Break` button that disables the extra Planning features at runtime if the forked UI breaks during an active session.
- `PATCH.md`, which documents the patch surface so this fork can be repaired after upstream T3 Code changes.

This fork does **not** add an official plugin system. T3 Code does not currently support add-ons, so this is a modified fork rather than a drop-in extension.

## Why This Exists

Long AI coding sessions tend to lose context. When the plan and codebase get large, agents can forget dependencies, rush implementation, skip documentation, or mark work done without enough proof.

This fork experiments with a different workflow:

```text
User request
  -> Supervisor / architectural pass
  -> Board card and task record
  -> Worker handoff packet
  -> Fresh implementation agent
  -> Worker report
  -> Review / audit
  -> Supervisor updates proof ledger
```

The board is meant to be the visual proof ledger. The markdown files are the durable reasoning layer.

## Important Files

- `PATCH.md`: repair map for this fork.
- `WORKFLOW.md`: project-local workflow rules.
- `AGENTS.md`: agent operating rules, including supervisor-first behavior.
- `PROJECT.md`: high-level project intent for this planning fork.
- `CONTEXT.md`: domain language and architecture notes.
- `docs/agents/project-master-plan.md`: planning-system master plan.
- `docs/agents/slices/`: slice-level plans.
- `docs/agents/tasks/`: task records.
- `docs/agents/templates/`: portable templates for handoffs, reports, reviews, and example board data.
- `packages/contracts/src/agentBoard.ts`: board schema and shared contract.
- `apps/server/src/agentBoard/`: server board file service.
- `apps/web/src/components/AgentBoardPanel.tsx`: Planning UI.
- `apps/web/src/components/ChatView.tsx`: Planning tab and break-glass integration.

Runtime board files under `.t3/` are intentionally ignored. Use [docs/agents/templates/agent-board.example.json](./docs/agents/templates/agent-board.example.json) as the public example shape.

## Running Locally

Install provider CLIs first:

- Codex: install [Codex CLI](https://developers.openai.com/codex/cli) and run `codex login`
- Claude: install [Claude Code](https://claude.com/product/claude-code) and run `claude auth login`
- OpenCode: install [OpenCode](https://opencode.ai) and run `opencode auth login`

Then run:

```bash
bun install
bun dev
```

This is safest as a separate checkout beside your normal T3 Code install.

```text
T3code-official/
T3code-planning-fork/
```

## Quality Gates

Before considering changes complete:

```bash
bun fmt
bun lint
bun typecheck
```

Do not use `bun test` in this repo. Use `bun run test` or package-local Vitest commands.

## Public Fork Notes

This repository intentionally omits GitHub Actions workflow files from the initial public push because the publishing token used here did not have GitHub `workflow` scope.

The upstream/internal `.docs/`, `.plans/`, `.cursor/`, and `.vscode/` folders were also removed from the public branch to keep the fork easier to inspect. Planning-fork documentation lives in `PATCH.md`, `WORKFLOW.md`, `PROJECT.md`, `CONTEXT.md`, and `docs/agents/`.

## Upstream

Original T3 Code README content, release notes, and provider docs remain in this repository where still relevant. This fork is experimental and should be expected to break when upstream T3 Code changes core routing, RPC, chat layout, or provider orchestration.
