# DecorStore Agent Prompt Library

This folder contains reusable prompts for DecorStore AI agents. These prompts are not AgentPM itself. They are operating instructions that agents use alongside AgentPM task contracts.

AgentPM stores the work ledger: projects, specs, tasks, dependencies, agent runs, reviews, decisions, artifacts, and file touches. The prompt library defines how each agent role should behave while executing or reviewing that work.

## How Prompts Relate To AgentPM

AgentPM answers:

- What task is being worked?
- Which agent role owns it?
- Which files must be read?
- Which paths are allowed or forbidden?
- What exit criteria define success?
- Which files were touched?
- What was reviewed or decided?

The prompt files answer:

- How should this role think?
- What rules must it follow?
- What workflow should it use?
- What output format should it return?
- When must it stop?

Use both together. The prompt gives the role behavior; the AgentPM task contract gives the exact assignment.

## Manual Agent Run In Claude Or Cursor

1. Choose the role prompt from `ai/prompts/`.
2. Load or paste the AgentPM task contract.
3. Tell the agent to follow both the role prompt and the task contract.
4. Confirm the agent has read all `must_read` files.
5. Ensure the agent only works inside `allowed_paths`.
6. Ask the agent to return the required output format and list every file changed.

Example:

```txt
Use ai/prompts/frontend_agent.md.
Use this AgentPM task contract: <paste contract JSON>.
Follow allowed_paths, forbidden_paths, must_read, and exit_criteria exactly.
Stop if required context is missing.
```

## Combining Prompt And Task Contract

The recommended input order is:

1. Agent role prompt.
2. AgentPM task contract.
3. Any required spec or context files.
4. The exact instruction for this run.

The task contract should win when it is more specific than the prompt. The prompt should win when the contract is silent about role behavior, output format, or stop conditions.

## Why Prompts Are Not Stored In AgentPM V1

AgentPM V1 is a local SQLite work ledger, not an orchestration platform. Keeping prompts as Markdown files has practical benefits:

- Prompts are easy to read and edit in the repo.
- Prompt changes can be reviewed like normal files.
- Agents can load prompts without database tooling.
- The database stays focused on task state and audit records.
- Prompt iteration does not require schema changes.

## When This Should Become Orchestration

This should become orchestration later only when DecorStore needs repeatable automated agent runs, prompt version pinning, task-contract generation, run queues, or automatic review handoffs.

Until then, keep this lightweight:

- AgentPM stores the ledger.
- Prompt files define role behavior.
- The human selects the prompt and contract for each run.
