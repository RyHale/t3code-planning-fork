# TASK-20260505-agent-board-contract

Status: `done`
Agent eligible: no
Slice: `docs/agents/slices/authoritative-agent-board.md`

## Owner Intent

Create the first durable planning stack and board-file contract for the T3 Code
authoritative agent board.

## Target Status

`Tested`

## Scope Guard

This task establishes documentation, the board JSON seed, and shared contract
schemas only. It must not implement the right-side board UI, board file server
service, workspace creation, or autonomous runner.

## Acceptance Criteria

- `WORKFLOW.md` defines the project-local board runner contract.
- `PROJECT.md` captures the product direction and phased delivery plan.
- `docs/agents/` contains a master plan, slice plan, task README, task
  template, and this task record.
- `.t3/agent-board.json` exists and validates against a shared contract schema.
- `packages/contracts` exports an agent board schema.
- Focused tests cover minimal board decoding, ready-card decoding, and
  rejection of title-only ready cards.

## Verification

- `bun run test --filter @t3tools/contracts -- agentBoard`
- `bun run typecheck --filter @t3tools/contracts`

## Parallelism Plan

Safe: `conditional`

Reason: schema and documentation work can run beside unrelated UI exploration,
but should not overlap another edit to the board contract or planning docs.

Allowed write scopes:

- `WORKFLOW.md`
- `PROJECT.md`
- `CONTEXT.md`
- `docs/agents/**`
- `.t3/agent-board.json`
- `packages/contracts/src/agentBoard.ts`
- `packages/contracts/src/agentBoard.test.ts`
- `packages/contracts/src/index.ts`

Conflicts with:

- any task changing the agent board schema
- any task changing the initial board state machine

## Proof Of Done

Completed on 2026-05-05.

Files created or updated:

- `WORKFLOW.md`
- `PROJECT.md`
- `CONTEXT.md`
- `docs/agents/project-master-plan.md`
- `docs/agents/slices/README.md`
- `docs/agents/slices/authoritative-agent-board.md`
- `docs/agents/tasks/README.md`
- `docs/agents/tasks/TEMPLATE.md`
- `docs/agents/tasks/TASK-20260505-agent-board-contract.md`
- `.t3/agent-board.json`
- `packages/contracts/src/agentBoard.ts`
- `packages/contracts/src/agentBoard.test.ts`
- `packages/contracts/src/index.ts`

Verification:

- `bun run test --filter @t3tools/contracts -- agentBoard` passed.
- `bun fmt` passed.
- `bun lint` passed with existing warnings.
- `bun typecheck` passed.

Definition of Done status:

- Met. The planning stack exists, the seed board file exists, the shared
  contract exports `AgentBoardFile`, and focused tests cover minimal board
  decoding, ready-card decoding, and rejection of title-only ready cards.
