# AgentPM manual workflow (no UI)

This is the operating procedure for working **80% in CLIs and agent chats** on DecorStore. You do not need a web dashboard. You need a **repeatable prompt playbook** backed by a **local ledger** (AgentPM in SQLite).

## Mental model

| Layer                              | Role                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------ |
| **AgentPM CLI**                    | Stores and queries facts: projects, specs, tasks, runs, touches, status. |
| **Prompt library** (`ai/prompts/`) | Tells each _role_ how to think, what to check, and when to stop.         |
| **Claude / Cursor**                | Where humans paste prompts, attach the task contract, and run agents.    |

- **Use the CLI for truth** — `task show`, `task contract`, `next`, `run start`, `touch add`, `task done`.
- **Use prompts for decisions and procedure** — what is next, who owns it, did it pass, what to log.

## Quick reference commands

```bash
cd /path/to/DecorStore
node scripts/agentpm.mjs next
node scripts/agentpm.mjs task contract TASK-0001
node scripts/agentpm.mjs task show TASK-0001
node scripts/agentpm.mjs run start TASK-0001 --agent frontend_agent
node scripts/agentpm.mjs task review TASK-0001
node scripts/agentpm.mjs task approve TASK-0001
node scripts/agentpm.mjs task done TASK-0001
```

Use `node scripts/agentpm.mjs help` for the full list.

---

## 1. PM prompt (backlog and structure)

**Prompt file:** `ai/prompts/pm_agent.md`

**You ask the PM agent to:**

- Read the relevant DecorStore spec (for example under `Docs/`).
- Propose or refine AgentPM tasks: scope, `agent_role`, `allowed_paths` / `forbidden_paths` / `must_read`, `exit_criteria`, dependencies.
- **Not** implement product code — only the plan and, when you choose, the exact `agentpm` commands to create or update work items.

**Optional:** have it recommend **the next task** to schedule (you will still align with the CLI in step 2).

---

## 2. Next-task (align with the ledger)

**Two options:**

**A — Let the CLI decide (preferred when the DB is up to date):**

```bash
node scripts/agentpm.mjs next
node scripts/agentpm.mjs task ready
node scripts/agentpm.mjs blocked
```

**B — Same thing in a prompt (if you are not at a shell):**

- Paste a **“Next-task prompt”** and ask the agent to reason over **current** tasks and dependencies _as you paste them_ (for example from `task list` / `task show`), or to tell you to run `agentpm next` and interpret the output.

**You want back:**

- Task ID
- Agent role
- Prompt file (for example `ai/prompts/frontend_agent.md`)
- Why it is next (unblocked, priority, order)
- **Exact** command to inspect:  
  `node scripts/agentpm.mjs task show TASK-…`
- Command to export the contract:  
  `node scripts/agentpm.mjs task contract TASK-…`

---

## 3. Execution prompt (one task, one contract)

**Example prompt file:** `ai/prompts/frontend_agent.md` (or `backend_agent`, `schema_agent`, etc., depending on `agent_role`).

**Procedure:**

1. Export JSON once — no decorative output:

```bash
 node scripts/agentpm.mjs task contract TASK-0001
```

1. In Claude/Cursor, use the **role prompt** + **paste the JSON** as the task contract.
2. Instruct clearly:

- Execute **only** this task.
- Obey `allowed_paths`, `forbidden_paths`, and `must_read`.
- Return **files changed** and an **exit criteria checklist** (and stop if required context is missing — per the prompt’s rules).

1. **Start a run** when the agent actually begins work (so the ledger matches reality):

```bash
 node scripts/agentpm.mjs run start TASK-0001 --agent frontend_agent
```

1. As files are touched, log them (human or agent, depending on your discipline):

```bash
 node scripts/agentpm.mjs touch add TASK-0001 --path "path/to/file" --reason "short reason"
```

---

## 4. QA prompt (review only)

**Prompt file:** `ai/prompts/qa_agent.md`

**You provide:**

- The same **task contract** JSON (or `task show` + changed file list).
- What the execution agent said it changed.
- Any diffs or file list you can share.

**You want back:** `PASS` / `FAIL` / `NEEDS_CHANGES` with reasons (scope, exit criteria, spec alignment, design tokens, etc.). The QA role does not fix code unless the contract explicitly assigns that.

---

## 5. Closeout prompt (sync the ledger to reality)

**Use the CLI to record outcomes**; you can use a short **closeout prompt** to decide the sequence, but the **writes** are factual commands.

Typical sequence:

1. **Complete the run** (when work stopped):

```bash
 node scripts/agentpm.mjs run complete RUN-0001
```

1. **Mark review** if the work is ready for a human (or the QA result):

```bash
 node scripts/agentpm.mjs task review TASK-0001
```

1. **If QA passed (and you accept):**

```bash
 node scripts/agentpm.mjs task approve TASK-0001
 node scripts/agentpm.mjs task done TASK-0001
```

1. **If QA failed:** open a follow-up task (PM prompt + `agentpm task create` / assign) with a clear title and new exit criteria; link it in chat and optionally in `metadata` if you use that.
2. **Log decisions** in AgentPM when something was ambiguous and you resolved it:

```bash
 node scripts/agentpm.mjs decision create --title "…" --body "…"
```

A **closeout prompt** in chat can say: “Given this QA result, list the exact `agentpm` commands to run in order; do not invent status transitions.”

---

## Why this works without a UI

- The **database** is the system of record.
- The **prompts** are the standard operating procedure.
- The **agent** is the variable worker; the **human** approves, closes tasks, and records decisions.

You get a **prompt-first, CLI-backed** loop: few commands, many disciplined conversations.

## Related files

- AgentPM usage: `.agentpm/README.md`
- Role prompts: `ai/prompts/README.md` and `ai/prompts/*.md`
- Example contract shape: `.agentpm/examples/task-contract.json`
