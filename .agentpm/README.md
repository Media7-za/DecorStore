# AgentPM

AgentPM is a repo-local project management ledger for DecorStore. It stores projects, specs, tasks, agent runs, reviews, decisions, artifacts, and file touches in a local SQLite database at `.agentpm/agentpm.db`.

AgentPM is not a Jira clone. It does not model teams, boards, sprints, notifications, permissions, or cross-company process. It is a small work ledger for one human coordinating AI agents inside this DecorStore workspace.

## Why It Exists

AI agents need clear task boundaries. Humans need a durable record of what was asked, what an agent touched, what was reviewed, and why decisions were made. AgentPM gives DecorStore a local source of truth for that work without introducing a web app, external PM tool, or SaaS dependency.

The intended use is practical:

- Keep specs and tasks close to the project files.
- Give agents explicit contracts before they edit files.
- Record agent runs and touched files for review.
- Capture important decisions while they are still fresh.
- Keep external issue trackers out of this local solo workflow.

## What It Tracks

- `projects`: top-level local work areas, usually just `DecorStore`.
- `specs`: approved or draft product and technical specifications.
- `tasks`: concrete units of work with type, priority, status, agent role, path constraints, required reading, and exit criteria.
- `task_dependencies`: ordering constraints between tasks.
- `agent_runs`: each attempt by an AI agent to execute a task.
- `reviews`: human review results for task or run output.
- `decisions`: durable architecture, product, or implementation decisions.
- `artifacts`: generated or relevant files, reports, logs, screenshots, or other outputs.
- `file_touches`: files changed or intentionally inspected during a task, with a reason.

## Recommended Workflow

1. Write or reference a spec.
2. Create focused tasks from the spec.
3. Assign a task to an agent role such as `frontend_agent`, `backend_agent`, or `review_agent`.
4. Start an agent run when the agent begins work.
5. Record file touches as the agent changes or investigates files.
6. Move the task to review when work is ready.
7. Record a review verdict.
8. Approve and close the task when the human is satisfied.

## Visibility (no web UI)

These commands improve day-to-day use without a dashboard. They read the same local SQLite database as the rest of AgentPM.

- `node scripts/agentpm.mjs next` — pick a suggested “next” task: unblocked (all `task_dependencies` point to `DONE` tasks), not `DONE`/`APPROVED`/`CANCELLED`/`BLOCKED`. Sorted by status (READY, ASSIGNED, RUNNING, BACKLOG, `REVIEW_REQUIRED`), inferred phase, dependency order, priority, and `created_at`. Prints prompt path, `task show` / `task start` / `run start` (for agent work) or an approve hint when the task is in review. Phase/epic is inferred from `metadata` (for example `phase_id`, `epic_id`) or, if absent, from the spec title, or the literal `unphased`.
- `node scripts/agentpm.mjs blocked` — tasks with `BLOCKED` status, and tasks with incomplete dependencies (with blocking task IDs, titles, and statuses).
- `node scripts/agentpm.mjs phase status` — per-phase task counts: total, `DONE`, `READY`, `RUNNING`, `REVIEW_REQUIRED`, `BLOCKED`, and percent complete (DONE / total in that phase). Other statuses are counted in the total but not shown in the columns.
- `node scripts/agentpm.mjs prompts` — known agent roles and the matching file under `ai/prompts/`, and whether the file exists.
- `node scripts/agentpm.mjs task contract TASK-0001` — print a single JSON object to stdout (suitable to paste with an agent prompt). No other terminal decoration.
- `node scripts/agentpm.mjs task ready` — all `READY` tasks whose dependencies are satisfied, with recommended prompt path.

**Typical day:** run `next`, then `task contract` for that id, then paste the JSON under the prompt from `prompts` for the assigned role.

## Status Transitions

Task statuses are intentionally simple:

- `BACKLOG`: captured but not ready.
- `READY`: clear enough to assign or start.
- `ASSIGNED`: assigned to an agent role.
- `RUNNING`: an agent is actively working.
- `REVIEW_REQUIRED`: work is complete enough for human review.
- `APPROVED`: reviewed and accepted.
- `DONE`: closed.
- `BLOCKED`: cannot proceed without outside input.
- `CANCELLED`: intentionally abandoned.

The CLI validates the common path:

`BACKLOG -> READY -> ASSIGNED -> RUNNING -> REVIEW_REQUIRED -> APPROVED -> DONE`

It also allows cancelling from active states and marking active work as blocked. Invalid transitions fail loudly.

Spec statuses are:

- `DRAFT`: still being shaped.
- `APPROVED`: ready to create implementation tasks from.
- `SUPERSEDED`: replaced by a newer spec.
- `ARCHIVED`: retained for history only.

Agent run statuses are:

- `STARTED`
- `COMPLETED`
- `FAILED`
- `INTERRUPTED`

Review verdicts are:

- `PASS`
- `FAIL`
- `NEEDS_CHANGES`

## Agent Task Contract

A task contract is the handoff between the human and an AI agent. It tells the agent:

- which task it owns;
- which role it is acting as;
- which spec it came from;
- which files or docs it must read;
- which paths it may edit;
- which paths are forbidden;
- what exit criteria define success;
- which outputs are expected.

The contract should be narrow enough that an agent can complete it without wandering through unrelated application code. See `.agentpm/examples/task-contract.json` for a DecorStore example.

## Human and Agent Responsibilities

Humans should use AgentPM to define intent, approve specs, break work into small tasks, review results, and record decisions. A task should not be marked `DONE` just because an agent finished a run; it should be done because the human accepted the result.

Agents should read the task contract before editing, stay inside `allowed_paths`, avoid `forbidden_paths`, record meaningful file touches, and move tasks to `REVIEW_REQUIRED` when ready for human review.

## Example Lifecycle

Initialize the local database:

```sh
node scripts/agentpm.mjs init
```

Create the DecorStore project:

```sh
node scripts/agentpm.mjs project create "DecorStore"
```

Create a spec:

```sh
node scripts/agentpm.mjs spec create --title "Product Catalogue V1" --path "Docs/DecorStore_AgenticBuildSpec_v1.2.docx"
```

Create and assign a task:

```sh
node scripts/agentpm.mjs task create --title "Build product card component" --type FEATURE --priority P1 --agent frontend_agent
node scripts/agentpm.mjs task assign TASK-0001 frontend_agent
```

Start the task and an agent run:

```sh
node scripts/agentpm.mjs task start TASK-0001
node scripts/agentpm.mjs run start TASK-0001 --agent frontend_agent
```

Record a touched file:

```sh
node scripts/agentpm.mjs touch add TASK-0001 --path "apps/web/src/components/ProductCard.tsx" --reason "Implemented product card"
```

Move to review, approve, and close:

```sh
node scripts/agentpm.mjs task review TASK-0001
node scripts/agentpm.mjs task approve TASK-0001
node scripts/agentpm.mjs task done TASK-0001
```

For a quick seeded ledger, run:

```sh
node scripts/agentpm.mjs demo
```
