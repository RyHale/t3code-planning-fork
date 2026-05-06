# T3 Code Context

T3 Code is a local agent workbench for creating projects, managing agent conversations, and tracking agent-driven implementation work.

## Glossary

### Local appearance preference

A browser or desktop-client preference that changes how T3 Code looks on the current machine only. It is not synced through server settings, project state, or provider configuration.

### Authoritative work board

A user-managed board whose cards are the source of truth for autonomous agent work.
_Avoid_: Passive dashboard, status-only board

### Work card

A board item that describes one runnable unit of agent work.
_Avoid_: Visual-only task, note

### Intent brief

A structured description of a work card's desired outcome, acceptance criteria, constraints, and open decisions.
_Avoid_: Implementation spec, title-only card

### Clarification flow

A guided interview that turns a rough work card into a ready intent brief.
_Avoid_: Freeform chat only, unstructured planning

### Project workflow

The project-local instructions that govern how agents pick up, execute, verify, review, and integrate work cards.
_Avoid_: Card brief, project vision

### Project context

The project-local domain and direction reference that helps fresh agents preserve intent across context resets.
_Avoid_: Workflow, task list, transient chat history

### Slice plan

A durable project document that explains the direction, guardrails, and success criteria for a branch of related work.
_Avoid_: Work card, chat plan, implementation log

### Project planning stack

A project-local set of workflow, context, master plan, slice plan, and task-record documents used to orient fresh agents.
_Avoid_: Chat history, one giant prompt

### Task record

A durable project document that stores the owner intent, completion bar, scope guard, verification, and proof for one work card.
_Avoid_: Board card, issue title, chat summary

### Task draft

A proposed task record and work card generated from a project plan before the user accepts it.
_Avoid_: Ready work, agent-eligible task

### Board panel

The right-side T3 Code surface for viewing and controlling a project's authoritative work board.
_Avoid_: Separate-only dashboard

### Parallelism plan

The task-planning metadata that identifies which work cards can run concurrently and why.
_Avoid_: Global parallelism guess, always-parallel execution

### Execution path view

An optional board visualization that shows work-card dependencies and vertical-slice progression as a connected path or timeline.
_Avoid_: Primary control board, separate workflow

### Project board file

A project-local tracking file that stores the authoritative work board for that project.
_Avoid_: Global board file, shared board file

### Ready

The board state for work cards that are eligible for autonomous agent pickup.
_Avoid_: Todo

### Running

The board state for work cards currently claimed by an agent run.
_Avoid_: In progress

### Review

The board state for work cards completed by an agent and waiting for human acceptance.
_Avoid_: Complete, pending

### Board runner

The T3 Code service that watches project board files and launches agent runs for ready work cards.
_Avoid_: External daemon, separate scheduler

### Card workspace

An isolated filesystem workspace assigned to one work card for agent execution.
_Avoid_: Main project folder, shared workspace

### Fresh review agent

A new agent session with no implementation-thread context that reviews and integrates completed card work.
_Avoid_: Original implementation agent, continuation agent

### Autonomous delivery loop

The board runner workflow that plans, implements, diagnoses, tests, reviews, integrates, and advances work cards without routine user intervention.
_Avoid_: Manual review loop, supervised coding session

### Needs Decision

The board state for work cards blocked by user intent, unrecoverable constraints, or a choice the agent should not make alone.
_Avoid_: Failed, error

## Relationships

- An **Authoritative work board** contains zero or more **Work cards**.
- An **Authoritative work board** belongs to exactly one project through its **Project board file**.
- A **Work card** may become an agent run when it enters **Ready**.
- A **Work card** must include an **Intent brief** before it can enter **Ready**.
- The **Clarification flow** prepares a **Work card** for **Ready** by filling its **Intent brief**.
- A **Project board file** only controls work for the project folder that contains it.
- A new **Work card** starts outside **Ready** so card creation does not launch an agent by itself.
- **Running** follows **Ready** when T3 Code claims a work card for an agent run.
- **Review** follows **Running** when the agent reports completion and the user has not accepted the work yet.
- The **Board runner** is part of T3 Code and is responsible for claiming **Ready** work cards.
- A runnable **Work card** gets its own **Card workspace** instead of running directly in the project folder.
- A **Work card** completed by an implementation agent is reviewed by a **Fresh review agent** before acceptance.
- The **Autonomous delivery loop** is the default path after a **Work card** enters **Ready**.
- **Needs Decision** is used for intent or decision boundaries, not routine implementation failures.
- A **Work card** receives three autonomous repair cycles before repeated routine failures become **Needs Decision**.
- The **Project workflow** defines reusable agent operating rules, while each **Intent brief** defines one unit of work.
- The **Project context** guides product and architecture direction without replacing the **Project workflow**.
- A **Slice plan** can guide many related **Work cards**, but does not replace the card's specific **Intent brief**.
- The **Project planning stack** keeps large-project direction durable without bloating every agent prompt.
- A **Task record** is the durable source for a **Work card**'s intent and completion bar.
- A **Work card** is the board-level control handle for a **Task record**.
- A **Task draft** can be generated from a **Slice plan**, but cannot enter **Ready** until accepted.
- Human planning fields can sync between a **Work card** and its **Task record**.
- Runtime state belongs to the **Project board file**, not the **Task record**.
- The **Board panel** is the default UI for the **Authoritative work board** and may expand into a full-board view.
- A **Parallelism plan** is decided during planning and controls when the **Board runner** may run multiple work cards at once.
- The **Execution path view** visualizes the same **Work cards** as dependency lines, nodes, or timeline segments without replacing the **Board panel**.

## Example dialogue

> **Dev:** "If I add a **Work card** and move it to Ready, is that just for tracking?"
> **Domain expert:** "No. The **Authoritative work board** is the source of truth; moving the card to Ready should make it eligible for an agent run."

> **Dev:** "Can a title-only card enter **Ready**?"
> **Domain expert:** "No. A **Work card** needs an **Intent brief** so the agent can understand the outcome and completion bar."

> **Dev:** "Should the user write a complete spec before creating a card?"
> **Domain expert:** "No. The **Clarification flow** can interview the user and build the **Intent brief** incrementally."

> **Dev:** "Does `WORKFLOW.md` explain the product vision?"
> **Domain expert:** "Not primarily. The **Project workflow** explains how agents work; the **Project context** preserves the direction and assumptions fresh agents need."

> **Dev:** "If a feature branch has a durable plan document, does every card need to restate all of it?"
> **Domain expert:** "No. A **Work card** can reference a **Slice plan** for broader direction, while its **Intent brief** controls the exact runnable scope."

> **Dev:** "Should a fresh agent infer the bigger picture from prior chat?"
> **Domain expert:** "No. The **Project planning stack** gives fresh agents direct references to the workflow, context, slice, and task records they need."

> **Dev:** "Does the visual board replace task files?"
> **Domain expert:** "No. A **Task record** preserves the detailed intent, while the **Work card** shows state and controls execution."

> **Dev:** "Can T3 Code turn a slice plan into runnable work automatically?"
> **Domain expert:** "It can propose **Task drafts**, but the user accepts or edits them before they become **Work cards** eligible for **Ready**."

> **Dev:** "Should agent heartbeat and workspace paths be written into task markdown?"
> **Domain expert:** "No. Runtime state stays in the **Project board file**; the **Task record** preserves durable planning and proof."

> **Dev:** "Does the board need to be a separate app screen?"
> **Domain expert:** "No. The **Board panel** lives on the right side by default, with an expanded view available for larger planning sessions."

> **Dev:** "Should T3 Code parallelize every ready card?"
> **Domain expert:** "No. Parallel work depends on the **Parallelism plan**, dependency chain, and overlap risk."

> **Dev:** "Does a node or timeline view create a separate planning system?"
> **Domain expert:** "No. The **Execution path view** is another visualization of the same **Work cards**, dependencies, and vertical slices."

> **Dev:** "Can one board launch work across every project in T3 Code?"
> **Domain expert:** "No. Each **Project board file** belongs to one project folder and only uses that project's workflow configuration."

> **Dev:** "Should Todo cards launch agents?"
> **Domain expert:** "No. A **Work card** only becomes runnable when it enters **Ready**."

> **Dev:** "If I create a card, should T3 Code start work immediately?"
> **Domain expert:** "No. New **Work cards** are captured first; moving one to **Ready** is the deliberate start-work signal."

> **Dev:** "Do users need to start a separate Symphony daemon?"
> **Domain expert:** "No. The **Board runner** is self-contained in T3 Code and picks up **Ready** work cards for the open project."

> **Dev:** "Can two **Work cards** edit the main project folder at the same time?"
> **Domain expert:** "No. Each runnable **Work card** gets a separate **Card workspace** so its changes can be reviewed independently."

> **Dev:** "Can the same agent that implemented a **Work card** approve its own work?"
> **Domain expert:** "No. Completed work goes to a **Fresh review agent** that starts blind and evaluates the result independently."

> **Dev:** "Should the user manually inspect every diff before work can continue?"
> **Domain expert:** "No. The **Autonomous delivery loop** should self-diagnose, self-test, integrate clean work, and continue to the next **Ready** work card."

> **Dev:** "Should a test failure stop the board and ask the user what to do?"
> **Domain expert:** "No. Routine implementation failures stay inside the **Autonomous delivery loop**; only intent or decision boundaries move a card to **Needs Decision**."

> **Dev:** "Can the **Autonomous delivery loop** keep retrying forever?"
> **Domain expert:** "No. A **Work card** gets three repair cycles before T3 Code asks for a decision with a failure summary."

## Flagged ambiguities

- "Todo" can mean either tracked future work or runnable work; resolved by using **Ready** as the only agent pickup state.
