#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const agentpmDir = resolve(root, '.agentpm');
const schemaPath = resolve(agentpmDir, 'schema.sql');
const dbPath = resolve(agentpmDir, 'agentpm.db');
const sep = '\u001f';

const PROMPT_BY_ROLE = {
  pm_agent: 'ai/prompts/pm_agent.md',
  architect_agent: 'ai/prompts/architect_agent.md',
  schema_agent: 'ai/prompts/schema_agent.md',
  backend_agent: 'ai/prompts/backend_agent.md',
  frontend_agent: 'ai/prompts/frontend_agent.md',
  qa_agent: 'ai/prompts/qa_agent.md',
};

const PRIORITY_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 };

const EXCLUDED_FROM_NEXT = new Set(['DONE', 'APPROVED', 'CANCELLED', 'BLOCKED']);

const transitions = {
  BACKLOG: ['READY', 'ASSIGNED', 'BLOCKED', 'CANCELLED'],
  READY: ['ASSIGNED', 'RUNNING', 'BLOCKED', 'CANCELLED'],
  ASSIGNED: ['RUNNING', 'REVIEW_REQUIRED', 'BLOCKED', 'CANCELLED'],
  RUNNING: ['REVIEW_REQUIRED', 'BLOCKED', 'CANCELLED'],
  REVIEW_REQUIRED: ['APPROVED', 'RUNNING', 'BLOCKED', 'CANCELLED'],
  APPROVED: ['DONE'],
  DONE: [],
  BLOCKED: ['READY', 'ASSIGNED', 'CANCELLED'],
  CANCELLED: []
};

function main() {
  const [area, action, ...args] = process.argv.slice(2);

  try {
    if (!area || area === '--help' || area === 'help') return help();
    if (area === 'init') return init();
    if (area === 'demo') return demo();
    if (area === 'project' && action === 'create') return projectCreate(args);
    if (area === 'spec' && action === 'create') return specCreate(args);
    if (area === 'task') return task(action, args);
    if (area === 'decision' && action === 'create') return decisionCreate(args);
    if (area === 'run') return run(action, args);
    if (area === 'touch' && action === 'add') return touchAdd(args);
    if (area === 'next') return cmdNext();
    if (area === 'blocked') return cmdBlocked();
    if (area === 'phase' && action === 'status') return cmdPhaseStatus();
    if (area === 'phase') throw new Error('Unknown command: phase. Did you mean: agentpm phase status?');
    if (area === 'prompts') return cmdPrompts();
    throw new Error(`Unknown command: ${[area, action].filter(Boolean).join(' ')}`);
  } catch (error) {
    console.error(`AgentPM error: ${error.message}`);
    process.exit(1);
  }
}

function help() {
  console.log(`AgentPM - local SQLite work ledger

Usage:
  agentpm init
  agentpm demo
  agentpm next
  agentpm blocked
  agentpm phase status
  agentpm prompts
  agentpm project create "DecorStore"
  agentpm spec create --title "Product Catalogue V1" --path "Docs/DecorStore_AgenticBuildSpec_v1.2.docx"
  agentpm task create --title "Build product card component" --type FEATURE --priority P1 --agent frontend_agent
  agentpm task list
  agentpm task show TASK-ID
  agentpm task contract TASK-ID
  agentpm task ready
  agentpm task assign TASK-ID frontend_agent
  agentpm task start TASK-ID
  agentpm task review TASK-ID
  agentpm task approve TASK-ID
  agentpm task done TASK-ID
  agentpm decision create --title "Use Medusa service layer" --body "Decision text here"
  agentpm run start TASK-ID --agent frontend_agent
  agentpm run complete RUN-ID
  agentpm touch add TASK-ID --path "apps/web/src/components/ProductCard.tsx" --reason "Implemented product card"
`);
}

function init() {
  requireSqlite();
  mkdirSync(agentpmDir, { recursive: true });
  if (!existsSync(schemaPath)) throw new Error(`Missing schema: ${rel(schemaPath)}`);
  exec(readFileSync(schemaPath, 'utf8'), { allowMissingDb: true });
  console.log(`Initialized AgentPM database at ${rel(dbPath)}`);
}

function demo() {
  init();
  const projectId = ensureProject('DecorStore', 'Local AI-agent work ledger for DecorStore.');
  const specId = ensureSpec(projectId, {
    title: 'DecorStore Agentic Build Spec v1.2',
    path: 'Docs/DecorStore_AgenticBuildSpec_v1.2.docx',
    status: 'APPROVED'
  });

  const taskOne = ensureTask(projectId, {
    specId,
    title: 'Build product card component',
    status: 'RUNNING',
    type: 'FEATURE',
    priority: 'P1',
    agentRole: 'frontend_agent',
    allowedPaths: ['/apps/web/**'],
    forbiddenPaths: ['/backend/**', '/database/**'],
    mustRead: ['/ai/context.md', '/ai/agent_rules.md', '/docs/design_tokens.md', '/Docs/DecorStore_AgenticBuildSpec_v1.2.docx'],
    exitCriteria: ['Product card renders catalogue data.', 'Component follows DecorStore design tokens.'],
    sourceSpecReference: 'Docs/DecorStore_AgenticBuildSpec_v1.2.docx'
  });

  const taskTwo = ensureTask(projectId, {
    specId,
    title: 'Define catalogue API contract',
    status: 'READY',
    type: 'TASK',
    priority: 'P1',
    agentRole: 'backend_agent',
    allowedPaths: ['/backend/**', '/database/**'],
    forbiddenPaths: ['/apps/web/**'],
    mustRead: ['/ai/context.md', '/Docs/DecorStore_AgenticBuildSpec_v1.2.docx'],
    exitCriteria: ['API contract is documented.', 'Data ownership is clear.'],
    sourceSpecReference: 'Docs/DecorStore_AgenticBuildSpec_v1.2.docx'
  });

  ensureDecision(projectId, 'Use Medusa service layer', 'Use the Medusa service layer for catalogue domain behavior before adding bespoke persistence logic.');
  ensureRun(taskOne, 'frontend_agent', 'Demo run for the product card task.');

  console.log('Demo AgentPM ledger is ready.');
  console.log(`Project: ${projectId}`);
  console.log(`Spec: ${specId}`);
  console.log(`Tasks: ${taskOne}, ${taskTwo}`);
}

function projectCreate(args) {
  ready();
  const name = args.join(' ').trim();
  required(name, 'Project name is required.');
  const id = ensureProject(name);
  console.log(`Project ready: ${id} ${name}`);
}

function specCreate(args) {
  ready();
  const opts = parse(args);
  required(opts.title, '--title is required.');
  required(opts.path, '--path is required.');
  const project = defaultProject();
  const id = nextId('SPEC', 'specs');
  const now = iso();

  exec(`
    INSERT INTO specs (id, project_id, title, path, status, source_reference, created_at, updated_at)
    VALUES (${q(id)}, ${q(project.id)}, ${q(opts.title)}, ${q(opts.path)}, 'DRAFT', ${q(opts.source ?? opts.path)}, ${q(now)}, ${q(now)});
  `);
  console.log(`Created spec ${id}: ${opts.title}`);
}

function task(action, args) {
  ready();
  if (action === 'create') return taskCreate(args);
  if (action === 'list') return taskList();
  if (action === 'show') return taskShow(args[0]);
  if (action === 'assign') return taskAssign(args);
  if (action === 'start') return changeTask(args[0], 'RUNNING');
  if (action === 'review') return changeTask(args[0], 'REVIEW_REQUIRED');
  if (action === 'approve') return taskApprove(args[0]);
  if (action === 'done') return changeTask(args[0], 'DONE');
  if (action === 'contract') return taskContract(args[0]);
  if (action === 'ready') return taskReady();
  throw new Error(`Unknown task command: ${action ?? ''}`);
}

function taskCreate(args) {
  const opts = parse(args);
  required(opts.title, '--title is required.');
  const project = defaultProject();
  const spec = opts.spec ? getSpec(opts.spec) : latestApprovedSpec();
  const id = nextId('TASK', 'tasks');
  const now = iso();
  const status = opts.agent ? 'ASSIGNED' : 'READY';

  exec(`
    INSERT INTO tasks (
      id, project_id, spec_id, title, body, status, type, priority, agent_role,
      allowed_paths, forbidden_paths, must_read, exit_criteria, source_spec_reference,
      created_at, updated_at
    ) VALUES (
      ${q(id)}, ${q(project.id)}, ${q(spec?.id ?? null)}, ${q(opts.title)}, ${q(opts.body ?? null)},
      ${q(status)}, ${q(opts.type ?? 'TASK')}, ${q(opts.priority ?? 'P3')}, ${q(opts.agent ?? null)},
      ${q(listJson(opts.allowed))}, ${q(listJson(opts.forbidden))}, ${q(listJson(opts.mustRead ?? opts['must-read']))},
      ${q(listJson(opts.exitCriteria ?? opts['exit-criteria']))}, ${q(spec?.path ?? null)},
      ${q(now)}, ${q(now)}
    );
  `);
  console.log(`Created task ${id}: ${opts.title}`);
  console.log(`Status: ${status}`);
}

function taskList() {
  const rows = rowsOf(`
    SELECT id, status, priority, type, COALESCE(agent_role, '') AS agent, title
    FROM tasks
    ORDER BY id;
  `);
  if (!rows.length) return console.log('No tasks found.');
  table(rows, ['id', 'status', 'priority', 'type', 'agent', 'title']);
}

function taskShow(taskId) {
  required(taskId, 'Task ID is required.');
  const t = getTask(taskId);
  const runs = rowsOf(`SELECT id, agent_role, status, started_at, COALESCE(completed_at, '') AS completed_at FROM agent_runs WHERE task_id = ${q(taskId)} ORDER BY id;`);
  const reviews = rowsOf(`SELECT id, verdict, reviewer, created_at FROM reviews WHERE task_id = ${q(taskId)} ORDER BY id;`);
  const touches = rowsOf(`SELECT path, reason, created_at FROM file_touches WHERE task_id = ${q(taskId)} ORDER BY id;`);

  console.log(`${t.id}: ${t.title}`);
  console.log(`Status: ${t.status}`);
  console.log(`Type/Priority: ${t.type}/${t.priority}`);
  console.log(`Agent: ${t.agent_role || '(unassigned)'}`);
  console.log(`Source spec: ${t.source_spec_reference || t.spec_id || '(none)'}`);
  console.log(`Allowed paths: ${t.allowed_paths}`);
  console.log(`Forbidden paths: ${t.forbidden_paths}`);
  console.log(`Must read: ${t.must_read}`);
  console.log(`Exit criteria: ${t.exit_criteria}`);
  section('Runs', runs, ['id', 'agent_role', 'status', 'started_at', 'completed_at']);
  section('Reviews', reviews, ['id', 'verdict', 'reviewer', 'created_at']);
  section('File touches', touches, ['path', 'reason', 'created_at']);
}

function taskAssign(args) {
  const [taskId, agentRole] = args;
  required(taskId, 'Task ID is required.');
  required(agentRole, 'Agent role is required.');
  const current = getTask(taskId);
  validate(current.status, 'ASSIGNED');
  exec(`UPDATE tasks SET status = 'ASSIGNED', agent_role = ${q(agentRole)}, updated_at = ${q(iso())} WHERE id = ${q(taskId)};`);
  console.log(`Assigned ${taskId} to ${agentRole}.`);
}

function taskApprove(taskId) {
  required(taskId, 'Task ID is required.');
  const current = getTask(taskId);
  validate(current.status, 'APPROVED');
  const reviewId = nextId('REV', 'reviews');
  const latestRun = rowsOf(`SELECT id FROM agent_runs WHERE task_id = ${q(taskId)} ORDER BY started_at DESC LIMIT 1;`)[0];
  const now = iso();

  exec(`
    UPDATE tasks SET status = 'APPROVED', updated_at = ${q(now)} WHERE id = ${q(taskId)};
    INSERT INTO reviews (id, task_id, run_id, verdict, reviewer, body, created_at, updated_at)
    VALUES (${q(reviewId)}, ${q(taskId)}, ${q(latestRun?.id ?? null)}, 'PASS', 'human', 'Approved through AgentPM CLI.', ${q(now)}, ${q(now)});
  `);
  console.log(`Approved ${taskId}. Review recorded as ${reviewId}.`);
}

function changeTask(taskId, nextStatus) {
  required(taskId, 'Task ID is required.');
  const current = getTask(taskId);
  validate(current.status, nextStatus);
  exec(`UPDATE tasks SET status = ${q(nextStatus)}, updated_at = ${q(iso())} WHERE id = ${q(taskId)};`);
  console.log(`Task ${taskId} is now ${nextStatus}.`);
}

function decisionCreate(args) {
  ready();
  const opts = parse(args);
  required(opts.title, '--title is required.');
  required(opts.body, '--body is required.');
  const project = defaultProject();
  const id = ensureDecision(project.id, opts.title, opts.body);
  console.log(`Decision ready: ${id} ${opts.title}`);
}

function run(action, args) {
  ready();
  if (action === 'start') return runStart(args);
  if (action === 'complete') return runEnd(args[0], 'COMPLETED');
  if (action === 'fail') return runEnd(args[0], 'FAILED');
  if (action === 'interrupt') return runEnd(args[0], 'INTERRUPTED');
  throw new Error(`Unknown run command: ${action ?? ''}`);
}

function runStart(args) {
  const [taskId, ...rest] = args;
  required(taskId, 'Task ID is required.');
  const opts = parse(rest);
  const t = getTask(taskId);
  const agent = opts.agent ?? t.agent_role;
  required(agent, '--agent is required when the task has no assigned agent.');
  if (t.status !== 'RUNNING') validate(t.status, 'RUNNING');

  const id = nextId('RUN', 'agent_runs');
  const now = iso();
  exec(`
    INSERT INTO agent_runs (id, task_id, agent_role, status, started_at, created_at, updated_at)
    VALUES (${q(id)}, ${q(taskId)}, ${q(agent)}, 'STARTED', ${q(now)}, ${q(now)}, ${q(now)});
    UPDATE tasks SET status = 'RUNNING', agent_role = COALESCE(agent_role, ${q(agent)}), updated_at = ${q(now)}
    WHERE id = ${q(taskId)};
  `);
  console.log(`Started run ${id} for ${taskId} as ${agent}.`);
}

function runEnd(runId, status) {
  required(runId, 'Run ID is required.');
  const run = getRun(runId);
  if (run.status !== 'STARTED') throw new Error(`Run ${runId} is ${run.status}; only STARTED runs can change state.`);
  const now = iso();
  exec(`UPDATE agent_runs SET status = ${q(status)}, completed_at = ${q(now)}, updated_at = ${q(now)} WHERE id = ${q(runId)};`);
  console.log(`Run ${runId} is now ${status}.`);
}

function touchAdd(args) {
  ready();
  const [taskId, ...rest] = args;
  required(taskId, 'Task ID is required.');
  const opts = parse(rest);
  required(opts.path, '--path is required.');
  required(opts.reason, '--reason is required.');
  getTask(taskId);
  const activeRun = rowsOf(`SELECT id FROM agent_runs WHERE task_id = ${q(taskId)} AND status = 'STARTED' ORDER BY started_at DESC LIMIT 1;`)[0];
  const id = nextId('TOUCH', 'file_touches');
  const now = iso();
  exec(`
    INSERT INTO file_touches (id, task_id, run_id, path, reason, created_at, updated_at)
    VALUES (${q(id)}, ${q(taskId)}, ${q(activeRun?.id ?? null)}, ${q(opts.path)}, ${q(opts.reason)}, ${q(now)}, ${q(now)});
  `);
  console.log(`Recorded file touch ${id}: ${opts.path}`);
}

function loadTasksWithSpec() {
  return rowsOf(`
    SELECT
      t.id, t.title, t.status, t.type, t.priority, t.agent_role, t.body,
      t.allowed_paths, t.forbidden_paths, t.must_read, t.exit_criteria,
      t.source_spec_reference, t.metadata, t.spec_id, t.created_at, t.updated_at,
      s.title AS spec_title, s.path AS spec_path
    FROM tasks t
    LEFT JOIN specs s ON s.id = t.spec_id
    ORDER BY t.created_at;
  `);
}

function loadTaskDependencies() {
  return rowsOf(`SELECT id, task_id, depends_on_task_id, created_at FROM task_dependencies ORDER BY created_at;`);
}

function safeJsonParse(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function taskPhaseLabel(t) {
  const meta = safeJsonParse(t.metadata, {});
  const fromMeta =
    meta.phase_id ??
    meta.epic_id ??
    meta.epicId ??
    meta.phaseId ??
    meta.phase ??
    meta.epic ??
    meta.epic_name ??
    null;
  if (fromMeta != null && String(fromMeta).trim() !== '') return String(fromMeta).trim();

  const fromTitle = t.title && String(t.title).match(/\[(P\d+[^\]]*)\]/i);
  if (fromTitle) return fromTitle[1].toUpperCase();

  const fromId = String(t.id).match(/TASK-((?:P\d+)(?:-S\d+[A-Z]?)?)/i);
  if (fromId) return fromId[1].toUpperCase();

  if (t.spec_title) {
    return `Spec: ${t.spec_title}`.length > 80
      ? `Spec ${t.spec_id || 'unknown'}`
      : `Spec: ${t.spec_title}`;
  }
  if (t.spec_id) return `Spec ${t.spec_id}`;

  return 'unphased';
}

function phaseSortNumber(label) {
  const m = String(label).match(/P(\d+)/i);
  if (m) return Number.parseInt(m[1], 10) * 1000;
  const s = String(label).match(/S(\d+)/i);
  if (s) return Number.parseInt(s[1], 10);
  return 50000;
}

function buildTaskIndex(tasks) {
  return Object.fromEntries(tasks.map((row) => [row.id, row]));
}

function dependencyBlockers(tasks, byId) {
  const depRows = loadTaskDependencies();
  const out = { satisfied: (taskId) => true, blockers: () => [] };

  out.satisfied = (taskId) => {
    const blockers = depRows
      .filter((d) => d.task_id === taskId)
      .map((d) => byId[d.depends_on_task_id])
      .filter(Boolean);
    return blockers.every((dep) => dep.status === 'DONE');
  };

  out.blockers = (taskId) =>
    depRows
      .filter((d) => d.task_id === taskId)
      .map((d) => {
        const dep = byId[d.depends_on_task_id];
        if (!dep) return { id: d.depends_on_task_id, title: '(missing task)', status: 'UNKNOWN' };
        return { id: dep.id, title: dep.title, status: dep.status };
      })
      .filter((dep) => dep.status !== 'DONE');

  return out;
}

const STATUS_NEXT_ORDER = {
  READY: 0,
  ASSIGNED: 1,
  RUNNING: 2,
  BACKLOG: 3,
  REVIEW_REQUIRED: 4,
};

function sortCandidateNext(a, b, byId) {
  const depRows = loadTaskDependencies();
  const minDepCreated = (t) => {
    const need = depRows.filter((d) => d.task_id === t.id).map((d) => d.depends_on_task_id);
    if (need.length === 0) return t.created_at;
    const times = need.map((id) => (byId[id] ? byId[id].created_at : '9999'));
    return times.sort()[0] || t.created_at;
  };

  const ra = STATUS_NEXT_ORDER[a.status] ?? 6;
  const rb = STATUS_NEXT_ORDER[b.status] ?? 6;
  if (ra !== rb) return ra - rb;

  const pa = phaseSortNumber(taskPhaseLabel(a));
  const pb = phaseSortNumber(taskPhaseLabel(b));
  if (pa !== pb) return pa - pb;

  const da = new Date(minDepCreated(a));
  const db = new Date(minDepCreated(b));
  if (da - db !== 0) return da - db;

  const pria = PRIORITY_ORDER[a.priority] ?? 5;
  const prib = PRIORITY_ORDER[b.priority] ?? 5;
  if (pria !== prib) return pria - prib;

  if (a.created_at !== b.created_at) return String(a.created_at).localeCompare(String(b.created_at));
  return String(a.id).localeCompare(String(b.id));
}

function cmdNext() {
  ready();
  const tasks = loadTasksWithSpec();
  if (!tasks.length) {
    console.log('No tasks in the database.');
    return;
  }
  const byId = buildTaskIndex(tasks);
  const { satisfied } = dependencyBlockers(tasks, byId);

  const candidates = tasks.filter(
    (t) => !EXCLUDED_FROM_NEXT.has(t.status) && satisfied(t.id),
  );
  if (!candidates.length) {
    console.log('No unblocked, runnable next task found.');
    const byStatus = {};
    for (const t of tasks) byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    const depBlocked = tasks.filter(
      (t) => t.status !== 'DONE' && t.status !== 'CANCELLED' && !satisfied(t.id),
    );
    const statusBlocked = (byStatus.BLOCKED || 0) + 0;
    const inReview = byStatus.REVIEW_REQUIRED || 0;
    const remaining = tasks.filter(
      (t) => t.status !== 'DONE' && t.status !== 'CANCELLED' && t.status !== 'APPROVED',
    ).length;
    console.log(
      `Counts: blocked_status=${statusBlocked} dependency_wait=${depBlocked.length} review_required=${inReview} remaining_not_done_not_cancelled=${remaining}`,
    );
    console.log('Tasks by status:');
    Object.keys(byStatus)
      .sort()
      .forEach((k) => console.log(`  ${k}: ${byStatus[k]}`));
    return;
  }
  const sorted = [...candidates].sort((a, b) => sortCandidateNext(a, b, byId));
  const next = sorted[0];
  const promptRel = next.agent_role
    ? PROMPT_BY_ROLE[next.agent_role] || null
    : null;
  const samePhase = (t) => taskPhaseLabel(t) === taskPhaseLabel(next);
  const readyInPhase = candidates.filter((t) => t.status === 'READY' && samePhase(t)).length;
  const promptLine = (() => {
    if (promptRel) {
      const p = rel(resolve(root, promptRel));
      if (existsSync(resolve(root, promptRel))) return p;
      return `${p} (file missing on disk)`;
    }
    return '(no agent_role — set on task, or add mapping in scripts/agentpm.mjs)';
  })();

  console.log('Next task:');
  console.log(`  id:          ${next.id}`);
  console.log(`  title:       ${next.title}`);
  console.log(`  phase/epic:  ${taskPhaseLabel(next)}`);
  console.log(`  status:      ${next.status}`);
  console.log(`  priority:    ${next.priority}`);
  console.log(`  agent_role:  ${next.agent_role || '(none)'}`);
  console.log(`  prompt:      ${promptLine}`);

  console.log('');
  console.log('Why this task:');
  console.log('  Unblocked: every depends_on task is DONE. Sorted by:');
  console.log('  status (READY, ASSIGNED, RUNNING, BACKLOG, REVIEW_REQUIRED), then phase,');
  console.log('  then earliest depends_on line (dependency order), then priority, then created_at.');
  if (next.status === 'READY' && readyInPhase > 1) {
    console.log(`  Note: ${readyInPhase} other READY, unblocked task(s) share this phase.`);
  }
  console.log('');
  console.log('Commands:');
  console.log(`  node scripts/agentpm.mjs task show ${next.id}`);
  if (['READY', 'ASSIGNED', 'BACKLOG'].includes(next.status)) {
    console.log(`  node scripts/agentpm.mjs task start ${next.id}`);
  }
  if (['READY', 'ASSIGNED', 'RUNNING', 'BACKLOG'].includes(next.status)) {
    const ag = next.agent_role || 'frontend_agent';
    console.log(`  node scripts/agentpm.mjs run start ${next.id} --agent ${ag}`);
  }
  if (next.status === 'REVIEW_REQUIRED') {
    console.log(`  node scripts/agentpm.mjs task approve ${next.id}  # or iterate work first`);
  }
  console.log(`  node scripts/agentpm.mjs task contract ${next.id}`);
}

function cmdBlocked() {
  ready();
  const tasks = loadTasksWithSpec();
  const byId = buildTaskIndex(tasks);
  const { blockers } = dependencyBlockers(tasks, byId);
  if (!tasks.length) {
    console.log('No tasks in the database.');
    return;
  }

  const rows = [];

  for (const t of tasks) {
    if (t.status === 'BLOCKED') {
      const bs = blockers(t.id);
      rows.push({
        kind: 'status-blocked',
        id: t.id,
        title: t.title,
        status: t.status,
        dep_block: bs.map((b) => `${b.id} (${b.status}) ${b.title}`).join(' | '),
        detail: 'Task status is BLOCKED.',
      });
    } else {
      const bs = blockers(t.id);
      if (bs.length > 0) {
        const detail = bs
          .map((b) => `needs ${b.id} = ${b.status} (${b.title})`)
          .join('; ');
        rows.push({
          kind: 'dependency-blocked',
          id: t.id,
          title: t.title,
          status: t.status,
          dep_block: bs
            .map(
              (b) =>
                `${b.id} "${b.title}" [${b.status}]`,
            )
            .join(' | '),
          detail,
        });
      }
    }
  }

  if (!rows.length) {
    console.log('No blocked tasks (no status BLOCKED, no unmet task_dependencies).');
    return;
  }
  table(rows, ['id', 'status', 'title', 'dep_block']);
  console.log('');
  for (const r of rows) {
    console.log(`- ${r.id}: ${r.detail}`);
  }
}

function cmdPhaseStatus() {
  ready();
  const tasks = loadTasksWithSpec();
  if (!tasks.length) {
    console.log('No tasks in the database.');
    return;
  }
  const groups = new Map();
  for (const t of tasks) {
    const ph = taskPhaseLabel(t);
    if (!groups.has(ph)) {
      groups.set(ph, { total: 0, byStatus: {} });
    }
    const g = groups.get(ph);
    g.total += 1;
    g.byStatus[t.status] = (g.byStatus[t.status] || 0) + 1;
  }
  const rows = [];
  for (const [phase, g] of groups) {
    const b = g.byStatus;
    const done = b.DONE || 0;
    const readyC = b.READY || 0;
    const running = b.RUNNING || 0;
    const review = b.REVIEW_REQUIRED || 0;
    const block = b.BLOCKED || 0;
    const pct = g.total ? Math.round((done / g.total) * 100) : 0;
    rows.push({
      phase,
      total: String(g.total),
      done: String(done),
      ready: String(readyC),
      running: String(running),
      review: String(review),
      blocked: String(block),
      pct: `${pct}%`,
    });
  }
  rows.sort((a, b) => a.phase.localeCompare(b.phase, undefined, { numeric: true }));
  table(rows, ['phase', 'total', 'done', 'ready', 'running', 'review', 'blocked', 'pct']);
  console.log(
    'Percent = DONE / (all statuses in that phase). Other statuses (ASSIGNED, etc.) are not in these columns.',
  );
}

function cmdPrompts() {
  const tableRows = Object.entries(PROMPT_BY_ROLE).map(([role, relPath]) => {
    const full = resolve(root, relPath);
    return {
      agent_role: role,
      path: rel(full),
      exists: existsSync(full) ? 'yes' : 'no',
    };
  });
  table(tableRows, ['agent_role', 'path', 'exists']);
}

function taskContract(taskId) {
  required(taskId, 'Task ID is required.');
  ready();
  const t = getTask(taskId);
  const specRow = t.spec_id
    ? rowsOf(
        `SELECT id, title, path FROM specs WHERE id = ${q(t.spec_id)} LIMIT 1;`,
      )[0]
    : null;
  const deps = rowsOf(`
    SELECT d.depends_on_task_id AS id, t2.title, t2.status
    FROM task_dependencies d
    JOIN tasks t2 ON t2.id = d.depends_on_task_id
    WHERE d.task_id = ${q(taskId)}
    ORDER BY d.depends_on_task_id;
  `);
  const meta = safeJsonParse(t.metadata, {});

  let source_spec = null;
  if (specRow) {
    source_spec = { id: specRow.id, title: specRow.title, path: specRow.path };
  } else if (t.source_spec_reference) {
    source_spec = { id: t.spec_id || null, title: null, path: t.source_spec_reference };
  }
  const out = {
    task_id: t.id,
    title: t.title,
    type: t.type,
    priority: t.priority,
    status: t.status,
    phase_id: meta.phase_id ?? null,
    epic_id: meta.epic_id ?? meta.epicId ?? null,
    agent_role: t.agent_role || null,
    source_spec,
    must_read: safeJsonParse(t.must_read, []),
    allowed_paths: safeJsonParse(t.allowed_paths, []),
    forbidden_paths: safeJsonParse(t.forbidden_paths, []),
    exit_criteria: safeJsonParse(t.exit_criteria, []),
    dependencies: deps.map((d) => ({ task_id: d.id, title: d.title, status: d.status })),
    metadata: meta,
  };
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
}

function taskReady() {
  ready();
  const tasks = loadTasksWithSpec();
  if (!tasks.length) {
    console.log('No tasks in the database.');
    return;
  }
  const byId = buildTaskIndex(tasks);
  const { satisfied } = dependencyBlockers(tasks, byId);
  const rows = tasks
    .filter((t) => t.status === 'READY' && satisfied(t.id))
    .map((t) => ({
      id: t.id,
      title: t.title,
      phase: taskPhaseLabel(t),
      priority: t.priority,
      agent_role: t.agent_role || '',
      prompt: (() => {
        const p = t.agent_role && PROMPT_BY_ROLE[t.agent_role] ? rel(resolve(root, PROMPT_BY_ROLE[t.agent_role])) : '';
        return p;
      })(),
    }));
  if (!rows.length) {
    console.log('No unblocked READY tasks.');
    return;
  }
  table(rows, ['id', 'title', 'phase', 'priority', 'agent_role', 'prompt']);
}

function ensureProject(name, description = null) {
  const existing = rowsOf(`SELECT id FROM projects WHERE name = ${q(name)} LIMIT 1;`)[0];
  if (existing) return existing.id;
  const id = nextId('PROJ', 'projects');
  const now = iso();
  exec(`INSERT INTO projects (id, name, description, created_at, updated_at) VALUES (${q(id)}, ${q(name)}, ${q(description)}, ${q(now)}, ${q(now)});`);
  return id;
}

function ensureSpec(projectId, spec) {
  const existing = rowsOf(`SELECT id FROM specs WHERE project_id = ${q(projectId)} AND path = ${q(spec.path)} LIMIT 1;`)[0];
  if (existing) {
    exec(`UPDATE specs SET status = ${q(spec.status ?? 'DRAFT')}, updated_at = ${q(iso())} WHERE id = ${q(existing.id)};`);
    return existing.id;
  }
  const id = nextId('SPEC', 'specs');
  const now = iso();
  exec(`
    INSERT INTO specs (id, project_id, title, path, status, source_reference, created_at, updated_at)
    VALUES (${q(id)}, ${q(projectId)}, ${q(spec.title)}, ${q(spec.path)}, ${q(spec.status ?? 'DRAFT')}, ${q(spec.path)}, ${q(now)}, ${q(now)});
  `);
  return id;
}

function ensureTask(projectId, task) {
  const existing = rowsOf(`SELECT id FROM tasks WHERE title = ${q(task.title)} LIMIT 1;`)[0];
  if (existing) return existing.id;
  const id = nextId('TASK', 'tasks');
  const now = iso();
  exec(`
    INSERT INTO tasks (
      id, project_id, spec_id, title, status, type, priority, agent_role,
      allowed_paths, forbidden_paths, must_read, exit_criteria, source_spec_reference,
      created_at, updated_at
    ) VALUES (
      ${q(id)}, ${q(projectId)}, ${q(task.specId ?? null)}, ${q(task.title)}, ${q(task.status ?? 'READY')},
      ${q(task.type ?? 'TASK')}, ${q(task.priority ?? 'P3')}, ${q(task.agentRole ?? null)},
      ${q(JSON.stringify(task.allowedPaths ?? []))}, ${q(JSON.stringify(task.forbiddenPaths ?? []))},
      ${q(JSON.stringify(task.mustRead ?? []))}, ${q(JSON.stringify(task.exitCriteria ?? []))},
      ${q(task.sourceSpecReference ?? null)}, ${q(now)}, ${q(now)}
    );
  `);
  return id;
}

function ensureDecision(projectId, title, body) {
  const existing = rowsOf(`SELECT id FROM decisions WHERE project_id = ${q(projectId)} AND title = ${q(title)} LIMIT 1;`)[0];
  if (existing) return existing.id;
  const id = nextId('DEC', 'decisions');
  const now = iso();
  exec(`INSERT INTO decisions (id, project_id, title, body, created_at, updated_at) VALUES (${q(id)}, ${q(projectId)}, ${q(title)}, ${q(body)}, ${q(now)}, ${q(now)});`);
  return id;
}

function ensureRun(taskId, agentRole, summary) {
  const existing = rowsOf(`SELECT id FROM agent_runs WHERE task_id = ${q(taskId)} AND agent_role = ${q(agentRole)} LIMIT 1;`)[0];
  if (existing) return existing.id;
  const id = nextId('RUN', 'agent_runs');
  const now = iso();
  exec(`
    INSERT INTO agent_runs (id, task_id, agent_role, status, started_at, summary, created_at, updated_at)
    VALUES (${q(id)}, ${q(taskId)}, ${q(agentRole)}, 'STARTED', ${q(now)}, ${q(summary)}, ${q(now)}, ${q(now)});
  `);
  return id;
}

function defaultProject() {
  const project = rowsOf(`SELECT id, name FROM projects WHERE status = 'ACTIVE' ORDER BY created_at LIMIT 1;`)[0];
  if (!project) throw new Error('No active project found. Run: agentpm project create "DecorStore"');
  return project;
}

function latestApprovedSpec() {
  return rowsOf(`SELECT id, path FROM specs WHERE status = 'APPROVED' ORDER BY created_at DESC LIMIT 1;`)[0] ?? null;
}

function getSpec(id) {
  const spec = rowsOf(`SELECT id, path FROM specs WHERE id = ${q(id)} LIMIT 1;`)[0];
  if (!spec) throw new Error(`Spec not found: ${id}`);
  return spec;
}

function getTask(id) {
  const task = rowsOf(`SELECT * FROM tasks WHERE id = ${q(id)} LIMIT 1;`)[0];
  if (!task) throw new Error(`Task not found: ${id}`);
  return task;
}

function getRun(id) {
  const run = rowsOf(`SELECT * FROM agent_runs WHERE id = ${q(id)} LIMIT 1;`)[0];
  if (!run) throw new Error(`Run not found: ${id}`);
  return run;
}

function validate(current, next) {
  if (!transitions[current]?.includes(next)) {
    throw new Error(`Invalid task status transition: ${current} -> ${next}`);
  }
}

function nextId(prefix, table) {
  const row = rowsOf(`SELECT id FROM ${table} WHERE id LIKE ${q(`${prefix}-%`)} ORDER BY id DESC LIMIT 1;`)[0];
  const next = row ? Number.parseInt(row.id.split('-')[1], 10) + 1 : 1;
  return `${prefix}-${String(next).padStart(4, '0')}`;
}

function ready() {
  requireSqlite();
  if (!existsSync(dbPath)) throw new Error('AgentPM database is missing. Run: agentpm init');
}

function requireSqlite() {
  const result = spawnSync('sqlite3', ['--version'], { encoding: 'utf8' });
  if (result.error) throw new Error('sqlite3 is required. Install SQLite or add a Node SQLite dependency before running AgentPM.');
}

function exec(sql, options = {}) {
  if (!options.allowMissingDb && !existsSync(dbPath)) throw new Error('AgentPM database is missing. Run: agentpm init');
  const result = spawnSync('sqlite3', ['-batch', dbPath], {
    input: `PRAGMA foreign_keys = ON;\n${sql}\n`,
    encoding: 'utf8'
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || 'SQLite command failed.').trim());
}

function rowsOf(sql) {
  if (!existsSync(dbPath)) return [];
  const result = spawnSync('sqlite3', ['-batch', '-header', '-separator', sep, dbPath], {
    input: `PRAGMA foreign_keys = ON;\n${sql}\n`,
    encoding: 'utf8'
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error((result.stderr || result.stdout || 'SQLite query failed.').trim());
  const output = result.stdout.trim();
  if (!output) return [];
  const [header, ...lines] = output.split('\n');
  const cols = header.split(sep);
  return lines.map((line) => Object.fromEntries(cols.map((col, index) => [col, line.split(sep)[index] ?? ''])));
}

function parse(args) {
  const out = {};
  for (let i = 0; i < args.length; i += 1) {
    const key = args[i];
    if (!key.startsWith('--')) throw new Error(`Unexpected argument: ${key}`);
    const value = args[i + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${key}`);
    out[key.slice(2)] = value;
    i += 1;
  }
  return out;
}

function listJson(value) {
  if (!value) return '[]';
  return JSON.stringify(String(value).split(',').map((item) => item.trim()).filter(Boolean));
}

function section(title, rows, cols) {
  console.log('');
  console.log(`${title}:`);
  if (!rows.length) return console.log('  (none)');
  table(rows, cols);
}

function table(rows, cols) {
  const widths = cols.map((col) => Math.max(col.length, ...rows.map((row) => String(row[col] ?? '').length)));
  console.log(cols.map((col, i) => col.padEnd(widths[i])).join('  '));
  console.log(widths.map((w) => '-'.repeat(w)).join('  '));
  for (const row of rows) {
    console.log(cols.map((col, i) => String(row[col] ?? '').padEnd(widths[i])).join('  '));
  }
}

function q(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replaceAll("'", "''")}'`;
}

function required(value, message) {
  if (!value) throw new Error(message);
}

function iso() {
  return new Date().toISOString();
}

function rel(path) {
  return path.replace(`${root}/`, '');
}

main();
