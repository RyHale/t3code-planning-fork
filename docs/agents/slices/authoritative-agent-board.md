# Authoritative Agent Board Slice Plan

Status: Active

## Intent

Build a project-local work board that can become the source of truth for
autonomous agent work in T3 Code.

## Product Direction

The board starts as a right-side panel and later expands into full-board,
table, and execution-path views. It is backed by durable task records and a
project-local board file.

The initial implementation should favor a stable contract over a broad UI.
Runner and UI work should build on a shared board schema so later changes do
not fragment the model.

## Guardrails

- Keep `Ready` as the only agent pickup state.
- Do not launch title-only cards.
- Keep runtime state in `.t3/agent-board.json`.
- Keep owner intent, scope, verification, and proof in task records.
- Default concurrency to one card per project.
- Add parallelism only when task metadata says it is safe.
- Treat Kanban as the primary control view.
- Keep execution-path visualization as a later view over the same data.

## Success Criteria

- Project-local docs can orient a fresh agent without prior chat history.
- Board files have a shared validated schema.
- Cards can reference task records and slice plans.
- Future UI and runner slices can consume the same contract.
