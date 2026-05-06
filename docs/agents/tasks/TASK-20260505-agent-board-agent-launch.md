# TASK-20260505-agent-board-agent-launch

Status: Done
Slice: `docs/agents/slices/authoritative-agent-board.md`

## Intent Brief

Intent: Connect the board Run flow to T3 Code orchestration so a claimed card
starts a fresh implementation thread automatically.

Desired outcome: Clicking `Run` on a Ready board card claims the card, starts an
implementation agent thread, and records the implementation run id back into the
authoritative board file.

Acceptance criteria:

- The board panel supports an injected launch callback after server-side claim
  succeeds.
- `ChatView` launches a new orchestration thread for the claimed card.
- The first turn prompt includes the card intent, acceptance criteria,
  constraints, non-goals, open decisions, and project-local references.
- The board stores `runtime.implementationRunId` after launch succeeds.
- If launch fails after claim, the card is marked `Blocked` with
  `runtime.currentError`.

Constraints:

- Do not bypass `claimAgentBoardCard`.
- Do not use `sourceProposedPlan` for board cards.
- Keep the board file authoritative.
- Do not implement live status streaming in this slice.

Non-goals:

- Autonomous queue polling.
- Review-agent repair loop.
- Live run status projection.
- Worktree branch creation.

## Proof

- Added `apps/web/src/agentBoardPrompt.ts` to build the fresh implementation
  prompt and thread title from a board card.
- Updated `AgentBoardPanel` so a successful claim can hand the returned board
  result to an injected launcher.
- Updated `ChatView` to create an orchestration thread, start the first turn,
  and save `runtime.implementationRunId` back to `.t3/agent-board.json`.
- Added launch failure handling that attempts to delete the new thread and mark
  the claimed card `Blocked`.

## Verification

- `bun fmt`
- `bun lint`
- `bun typecheck`
