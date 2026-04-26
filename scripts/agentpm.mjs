#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const agentpmDir = resolve(repoRoot, '.agentpm');
const schemaPath = resolve(agentpmDir, 'schema.sql');
const dbPath = resolve(agentpmDir, 'agentpm.db');
const separator = '\u001f';

const taskTransitions = {
  BACKLOG: new Set(['READY', 'ASSIGNED', 'BLOCKED', 'CANCELLED']),
  READY: new Set(['ASSIGNED', 'RUNNING', 'BLOCKED', 'CANCELLED']),
  ASSIGNED: new Set(['RUNNING', 'REVIEW_REQUIRED', 'BLOCKED', 'CANCELLED']),
  RUNNING: new Set(['REVIEW_REQUIRED', 'BLOCKED', 'CANCELLED']),
  REVIEW_REQUIRED: new Set(['APPROVED', 'RUNNING', 'BLOCKED', 'CANCELLED']),
  APPROVED: new Set(['DONE']),
  DONE: new Set([]),
  BLOCKED: new Set(['READY', 'ASSIGNED', 'CANCELLED']),
  CANCELLED: new Set([])
};

function main() {
  const [area, action, ...rest] = process.argv.slice(2);

  try {
    if (!area || area === 'help' || area === '--help') {
      printHelp();
      return;
    }

    if (area === 'init') return initDatabase();
    if (area === 'demo') return seedDemo();
    if (area === 'project' && action === 'create') return createProject(rest);
    if (area === 'spec' && action === 'create') return createSpec(rest);
    if (area === 'task') return handleTask(action, rest);
    if (area === 'decision' && action === 'create') return createDecision(rest);
    if (area === 'run') return handleRun(action, rest);
    if (area === 'touch' && action === 'add') return addTouch(rest);

    fail(`Unknown command: ${[area, action].filter(Boolean).join(' ')}`);
  } catch (error) {
    fail(error.message);
  }
}

function printHelp() {
  console.log(`AgentPM - local AI work ledger

Usage:
  agentpm init
  agentpm demo
  agentpm project create "DecorStore"
  agentpm spec create --title "Product Catalogue V1" --path "docs/specs/product-catalogue.md"
  agentpm task create --title "Build product card component" --type FEATURE --priority P1 --agent frontend_agent
  agentpm task list
  agentpm task show TASK-0001
  agentpm task assign TASK-0001 frontend_agent
  agentpm task start TASK-0001
  agentpm task review TASK-0001
  agentpm task approve TASK-0001
  agentpm task done TASK-0001
  agentpm decision create --title "Use Medusa service layer" --body "Decision text here"
  agentpm run start TASK-0001 --agent frontend_agent
  agentpm run complete RUN-0001
  agentpm touch add TASK-0001 --path "apps/web/src/components/ProductCard.tsx" --reason "Implemented product card"
`);
}

function initDatabase() {
  ensureSqlite();
  mkdirSync(agentpmDir, { recursive: true });

  if (!existsSync(schemaPath)) {
    throw new Error(`Missing schema at ${relative(schemaPath)}`);
  }

  const schema = readFileSync(schemaPath, 'utf8');
  runSql(schema, { allowMissingDb: true });
  console.log(`Initialized AgentPM database at ${relative(dbPath)}`);
}

function seedDemo() {
  initDatabase();
  const projectId = ensureProject('DecorStore', 'Demo project for the DecorStore local AI work ledger.');
  const specId = ensureSpec(projectId, {
    title: 'Product Catalogue V1',
    path: 'docs/specs/product-catalogue.md',
    status: 'APPROVED'
  });

  const taskOneId = ensureTask(projectId, {
    specId,
    title: 'Build product card component',
    type: 'FEATURE',
    priority: 'P1',
    agentRole: 'frontend_agent',
    status: 'RUNNING',
    allowedPaths: ['/apps/web/**'],
    forbiddenPaths: ['/backend/**', '/database/**'],
    mustRead: ['/ai/context.md', '/ai/agent_rules.md', '/docs/design_tokens.md'],
    exitCriteria: ['Product card renders catalogue data.', 'Component follows DecorStore design tokens.'],
    sourceSpecReference: 'docs/specs/product-catalogue.md'
  });

  ensureTask(projectId, {
    specId,
    title: 'Define catalogue API contract',
    type: 'TASK',
    priority: 'P1',
    agentRole: 'backend_agent',
    status: 'READY',
    allowedPaths: ['/backend/**', '/database/**'],
    forbiddenPaths: ['/apps/web/**'],
    mustRead: ['/ai/context.md', '/docs/specs/product-catalogue.md'],
    exitCriteria: ['API contract is documented.', 'Data ownership is clear.'],
    sourceSpecReference: 'docs/specs/product-catalogue.md'
  });

  ensureDecision(projectId, 'Use Medusa service layer', 'Use the Medusa service layer for catalogue domain behavior before adding bespoke persistence logic.');

  const runId = nextId('RUN', 'agent_runs');
  const now = isoNow();
  runSql(`
    INSERT INTO agent_runs (id, task_id, agent_role, status, started_at, summary, created_at, updated_at)
    SELECT ${sql(runId)}, ${sql(taskOneId)}, 'frontend_agent', 'STARTED', ${sql(now)}, 'Demo run for the product card task.', ${sql(now)}, ${sql(now)}
    WHERE NOT EXISTS (
      SELECT 1 FROM agent_runs WHERE task_id = ${sql(taskOneId)} AND agent_role = 'frontend_agent'
    );
  `);

  console.log('Demo AgentPM ledger is ready.');
  console.log(`Project: ${projectId}`);
  console.log(`Spec: ${specId}`);
  console.log(`Tasks: ${taskOneId}, ${findTaskByTitle('Define catalogue API contract')?.id ?? 'TASK-0002'}`);
}

function createProject(args) {
  ensureInitialized();
  const name = args.join(' ').trim();
  if (!name) throw new Error('Project name is required.');

  const id = ensureProject(name);
  console.log(`Project ready: ${id} ${name}`);
}

function createSpec(args) {
  ensureInitialized();
  const options = parseOptions(args);
  required(options.title, '--title is required.');
  required(options.path, '--path is required.');

  const project = getDefaultProject();
  const id = nextId('SPEC', 'specs');
  const now = isoNow();

  runSql(`
    INSERT INTO specs (id, project_id, title, path, status, source_reference, created_at, updated_at)
    VALUES (${sql(id)}, ${sql(project.id)}, ${sql(options.title)}, ${sql(options.path)}, 'DRAFT', ${sql(options.source ?? options.path)}, ${sql(now)}, ${sql(now)});
  `);

  console.log(`Created spec ${id}: ${options.title}`);
}

function handleTask(action, args) {
  ensureInitialized();

  if (action === 'create') return createTask(args);
  if (action === 'list') return listTasks();
  if (action === 'show') return showTask(args[0]);
  if (action === 'assign') return assignTask(args);
  if (action === 'start') return transitionTaskCommand(args[0], 'RUNNING');
  if (action === 'review') return transitionTaskCommand(args[0], 'REVIEW_REQUIRED');
  if (action === 'approve') return approveTask(args[0]);
  if (action === 'done') return transitionTaskCommand(args[0], 'DONE');

  fail(`Unknown task command: ${action ?? ''}`);
}

function createTask(args) {
  const options = parseOptions(args);
  required(options.title, '--title is required.');

  const project = getDefaultProject();
  const spec = options.spec ? getSpec(options.spec) : getLatestApprovedSpec();
  const id = nextId('TASK', 'tasks');
  const now = isoNow();
  const status = options.agent ? 'ASSIGNED' : 'READY';

  runSql(`
    INSERT INTO tasks (
      id, project_id, spec_id, title, body, status, type, priority, agent_role,
      allowed_paths, forbidden_paths, must_read, exit_criteria, source_spec_reference,
      created_at, updated_at
    ) VALUES (
      ${sql(id)}, ${sql(project.id)}, ${sql(spec?.id ?? null)}, ${sql(options.title)}, ${sql(options.body ?? null)},
      ${sql(status)}, ${sql(options.type ?? 'TASK')}, ${sql(options.priority ?? 'P3')}, ${sql(options.agent ?? null)},
      ${sql(jsonList(options.allowed))}, ${sql(jsonList(options.forbidden))}, ${sql(jsonList(options.mustRead ?? options['must-read']))},
      ${sql(jsonList(options.exitCriteria ?? options['exit-criteria']))}, ${sql(spec?.path ?? null)}, ${sql(now)}, ${sql(now)}
    );
  `);

  console.log(`Created task ${id}: ${options.title}`);
  console.log(`Status: ${status}`);
}

function listTasks() {
  const rows = queryRows(`
    SELECT id, status, priority, type, COALESCE(agent_role, '') AS agent, title
    FROM tasks
    ORDER BY id;
  `);

  if (rows.length === 0) {
    console.log('No tasks found.');
    return;
  }

  printTable(rows, ['id', 'status', 'priority', 'type', 'agent', 'title']);
}

function showTask(taskId) {
  required(taskId, 'Task ID is required.');
  const task = getTask(taskId);
  const runs = queryRows(`SELECT id, agent_role, status, started_at, COALESCE(completed_at, '') AS completed_at FROM agent_runs WHERE task_id = ${sql(taskId)} ORDER BY id;`);
  const touches = queryRows(`SELECT path, reason, created_at FROM file_touches WHERE task_id = ${sql(taskId)} ORDER BY created_at;`);
  const reviews = queryRows(`SELECT id, verdict, reviewer, created_at FROM reviews WHERE task_id = ${sql(taskId)} ORDER BY created_at;`);

  console.log(`${task.id}: ${task.title}`);
  console.log(`Status: ${task.status}`);
  console.log(`Type/Priority: ${task.type}/${task.priority}`);
  console.log(`Agent: ${task.agent_role || '(unassigned)'}`);
  console.log(`Source spec: ${task.source_spec_reference || task.spec_id || '(none)'}`);
  console.log(`Allowed paths: ${task.allowed_paths}`);
  console.log(`Forbidden paths: ${task.forbidden_paths}`);
  console.log(`Must read: ${task.must_read}`);
  console.log(`Exit criteria: ${task.exit_criteria}`);

  printSection('Runs', runs, ['id', 'agent_role', 'status', 'started_at', 'completed_at']);
  printSection('Reviews', reviews, ['id', 'verdict', 'reviewer', 'created_at']);
  printSection('File touches', touches, ['path', 'reason', 'created_at']);
}

function assignTask(args) {
  const [taskId, agentRole] = args;
  required(taskId, 'Task ID is required.');
  required(agentRole, 'Agent role is required.');

  const task = getTask(taskId);
  validateTransition(task.status, 'ASSIGNED');

  runSql(`
    UPDATE tasks
    SET status = 'ASSIGNED', agent_role = ${sql(agentRole)}, updated_at = ${sql(isoNow())}
    WHERE id = ${sql(taskId)};
  `);

  console.log(`Assigned ${taskId} to ${agentRole}.`);
}

function transitionTaskCommand(taskId, nextStatus) {
  required(taskId, 'Task ID is required.');
  transitionTask(taskId, nextStatus);
  console.log(`Task ${taskId} is now ${nextStatus}.`);
}

function approveTask(taskId) {
  required(taskId, 'Task ID is required.');
  const task = getTask(taskId);
  validateTransition(task.status, 'APPROVED');
  const reviewId = nextId('REV', 'reviews');
  const now = isoNow();
  const latestRun = queryRows(`SELECT id FROM agent_runs WHERE task_id = ${sql(taskId)} ORDER BY started_at DESC LIMIT 1;`)[0];

  runSql(`
    UPDATE tasks SET status = 'APPROVED', updated_at = ${sql(now)} WHERE id = ${sql(taskId)};
    INSERT INTO reviews (id, task_id, run_id, verdict, reviewer, body, created_at, updated_at)
    VALUES (${sql(reviewId)}, ${sql(taskId)}, ${sql(latestRun?.id ?? null)}, 'PASS', 'human', 'Approved through AgentPM CLI.', ${sql(now)}, ${sql(now)});
  `);

  console.log(`Approved ${taskId}. Review recorded as ${reviewId}.`);
}

function createDecision(args) {
  ensureInitialized();
  const options = parseOptions(args);
  required(options.title, '--title is required.');
  required(options.body, '--body is required.');

  const project = getDefaultProject();
  const id = ensureDecision(project.id, options.title, options.body);
  console.log(`Decision ready: ${id} ${options.title}`);
}

function handleRun(action, args) {
  ensureInitialized();

  if (action === 'start') return startRun(args);
  if (action === 'complete') return completeRun(args[0], 'COMPLETED');
  if (action === 'fail') return completeRun(args[0], 'FAILED');
  if (action === 'interrupt') return completeRun(args[0], 'INTERRUPTED');

  fail(`Unknown run command: ${action ?? ''}`);
}

function startRun(args) {
  const [taskId, ...rest] = args;
  required(taskId, 'Task ID is required.');
  const options = parseOptions(rest);
  const task = getTask(taskId);
  const agentRole = options.agent ?? task.agent_role;
  required(agentRole, '--agent is required when the task has no assigned agent.');

  if (task.status !== 'RUNNING') {
    validateTransition(task.status, 'RUNNING');
  }

  const id = nextId('RUN', 'agent_runs');
  const now = isoNow();
  runSql(`
    INSERT INTO agent_runs (id, task_id, agent_role, status, started_at, created_at, updated_at)
    VALUES (${sql(id)}, ${sql(taskId)}, ${sql(agentRole)}, 'STARTED', ${sql(now)}, ${sql(now)}, ${sql(now)});
    UPDATE tasks
    SET status = 'RUNNING', agent_role = COALESCE(agent_role, ${sql(agentRole)}), updated_at = ${sql(now)}
    WHERE id = ${sql(taskId)};
  `);

  console.log(`Started run ${id} for ${taskId} as ${agentRole}.`);
}

function completeRun(runId, status) {
  required(runId, 'Run ID is required.');
  const run = getRun(runId);
  if (run.status !== 'STARTED') {
    throw new Error(`Run ${runId} is ${run.status}; only STARTED runs can be completed, failed, or interrupted.`);
  }

  const now = isoNow();
  runSql(`
    UPDATE agent_runs
    SET status = ${sql(status)}, completed_at = ${sql(now)}, updated_at = ${sql(now)}
    WHERE id = ${sql(runId)};
  `);

  console.log(`Run ${runId} is now ${status}.`);
}

function addTouch(args) {
  ensureInitialized();
  const [taskId, ...rest] = args;
  required(taskId, 'Task ID is required.');
  const options = parseOptions(rest);
  required(options.path, '--path is required.');
  required(options.reason, '--reason is required.');
  getTask(taskId);

  const latestRun = queryRows(`SELECT id FROM agent_runs WHERE task_id = ${sql(taskId)} AND status = 'STARTED' ORDER BY started_at DESC LIMIT 1;`)[0];
  const id = nextId('TOUCH', 'file_touches');
  const now = isoNow();
  runSql(`
    INSERT INTO file_touches (id, task_id, run_id, path, reason, created_at, updated_at)
    VALUES (${sql(id)}, ${sql(taskId)}, ${sql(latestRun?.id ?? null)}, ${sql(options.path)}, ${sql(options.reason)}, ${sql(now)}, ${sql(now)});
  `);

  console.log(`Recorded file touch ${id}: ${options.path}`);
}

function ensureProject(name, description = null) {
  const existing = queryRows(`SELECT id FROM projects WHERE name = ${sql(name)} LIMIT 1;`)[0];
  if (existing) return existing.id;

  const id = nextId('PROJ', 'projects');
  const now = isoNow();
  runSql(`
    INSERT INTO projects (id, name, description, created_at, updated_at)
    VALUES (${sql(id)}, ${sql(name)}, ${sql(description)}, ${sql(now)}, ${sql(now)});
  `);
  return id;
}

function ensureSpec(projectId, spec) {
  const existing = queryRows(`SELECT id FROM specs WHERE project_id = ${sql(projectId)} AND path = ${sql(spec.path)} LIMIT 1;`)[0];
  if (existing) {
    runSql(`UPDATE specs SET status = ${sql(spec.status ?? 'DRAFT')}, updated_at = ${sql(isoNow())} WHERE id = ${sql(existing.id)};`);
    return existing.id;
  }

  const id = nextId('SPEC', 'specs');
  const now = isoNow();
  runSql(`
    INSERT INTO specs (id, project_id, title, path, status, source_reference, created_at, updated_at)
    VALUES (${sql(id)}, ${sql(projectId)}, ${sql(spec.title)}, ${sql(spec.path)}, ${sql(spec.status ?? 'DRAFT')}, ${sql(spec.path)}, ${sql(now)}, ${sql(now)});
  `);
  return id;
}

function ensureTask(projectId, task) {
  const existing = findTaskByTitle(task.title);
  if (existing) return existing.id;

  const id = nextId('TASK', 'tasks');
  const now = isoNow();
  runSql(`
    INSERT INTO tasks (
      id, project_id, spec_id, title, status, type, priority, agent_role,
      allowed_paths, forbidden_paths, must_read, exit_criteria, source_spec_reference,
      created_at, updated_at
    ) VALUES (
      ${sql(id)}, ${sql(projectId)}, ${sql(task.specId ?? null)}, ${sql(task.title)}, ${sql(task.status ?? 'READY')},
      ${sql(task.type ?? 'TASK')}, ${sql(task.priority ?? 'P3')}, ${sql(task.agentRole ?? null)},
      ${sql(JSON.stringify(task.allowedPaths ?? []))}, ${sql(JSON.stringify(task.forbiddenPaths ?? []))},
      ${sql(JSON.stringify(task.mustRead ?? []))}, ${sql(JSON.stringify(task.exitCriteria ?? []))},
      ${sql(task.sourceSpecReference ?? null)}, ${sql(now)}, ${sql(now)}
    );
  `);
  return id;
}

function ensureDecision(projectId, title, body) {
  const existing = queryRows(`SELECT id FROM decisions WHERE project_id = ${sql(projectId)} AND title = ${sql(title)} LIMIT 1;`)[0];
  if (existing) return existing.id;

  const id = nextId('DEC', 'decisions');
  const now = isoNow();
  runSql(`
    INSERT INTO decisions (id, project_id, title, body, created_at, updated_at)
    VALUES (${sql(id)}, ${sql(projectId)}, ${sql(title)}, ${sql(body)}, ${sql(now)}, ${sql(now)});
  `);
  return id;
}

function transitionTask(taskId, nextStatus) {
  const task = getTask(taskId);
  validateTransition(task.status, nextStatus);
  runSql(`UPDATE tasks SET status = ${sql(nextStatus)}, updated_at = ${sql(isoNow())} WHERE id = ${sql(taskId)};`);
}

function validateTransition(currentStatus, nextStatus) {
  const allowed = taskTransitions[currentStatus];
  if (!allowed || !allowed.has(nextStatus)) {
    throw new Error(`Invalid task status transition: ${currentStatus} -> ${nextStatus}`);
  }
}

function getDefaultProject() {
  const project = queryRows(`SELECT id, name FROM projects WHERE status = 'ACTIVE' ORDER BY created_at LIMIT 1;`)[0];
  if (!project) throw new Error('No active project found. Run: agentpm project create "DecorStore"');
  return project;
}

function getLatestApprovedSpec() {
  return queryRows(`SELECT id, path FROM specs WHERE status = 'APPROVED' ORDER BY created_at DESC LIMIT 1;`)[0] ?? null;
}

function getSpec(specId) {
  const spec = queryRows(`SELECT id, path FROM specs WHERE id = ${sql(specId)} LIMIT 1;`)[0];
  if (!spec) throw new Error(`Spec not found: ${specId}`);
  return spec;
}

function getTask(taskId) {
  const task = queryRows(`SELECT * FROM tasks WHERE id = ${sql(taskId)} LIMIT 1;`)[0];
  if (!task) throw new Error(`Task not found: ${taskId}`);
  return task;
}

function getRun(runId) {
  const run = queryRows(`SELECT * FROM agent_runs WHERE id = ${sql(runId)} LIMIT 1;`)[0];
  if (!run) throw new Error(`Run not found: ${runId}`);
  return run;
}

function findTaskByTitle(title) {
  return queryRows(`SELECT id FROM tasks WHERE title = ${sql(title)} LIMIT 1;`)[0] ?? null;
}

function nextId(prefix, table) {
  const row = queryRows(`SELECT id FROM ${table} WHERE id LIKE ${sql(`${prefix}-%`)} ORDER BY id DESC LIMIT 1;`)[0];
  const next = row ? Number.parseInt(row.id.split('-')[1], 10) + 1 : 1;
  return `${prefix}-${String(next).padStart(4, '0')}`;
}

function ensureInitialized() {
  ensureSqlite();
  if (!existsSync(dbPath)) {
    throw new Error('AgentPM database is missing. Run: agentpm init');
  }
}

function ensureSqlite() {
  const result = spawnSync('sqlite3', ['--version'], { encoding: 'utf8' });
  if (result.error) {
    throw new Error('sqlite3 is required. Install SQLite or add a Node SQLite dependency before running AgentPM.');
  }
}

function runSql(statement, options = {}) {
  if (!options.allowMissingDb && !existsSync(dbPath)) {
    throw new Error('AgentPM database is missing. Run: agentpm init');
  }

  const result = spawnSync('sqlite3', ['-batch', dbPath], {
    input: `PRAGMA foreign_keys = ON;\n${statement}\n`,
    encoding: 'utf8'
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'SQLite command failed.').trim());
  }
}

function queryRows(statement) {
  if (!existsSync(dbPath)) return [];

  const result = spawnSync('sqlite3', ['-batch', '-header', '-separator', separator, dbPath], {
    input: `PRAGMA foreign_keys = ON;\n${statement}\n`,
    encoding: 'utf8'
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'SQLite query failed.').trim());
  }

  const output = result.stdout.trim();
  if (!output) return [];

  const [header, ...lines] = output.split('\n');
  const columns = header.split(separator);
  return lines.map((line) => {
    const values = line.split(separator);
    return Object.fromEntries(columns.map((column, index) => [column, values[index] ?? '']));
  });
}

function parseOptions(args) {
  const options = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    const key = arg.slice(2);
    const value = args[i + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${arg}`);
    }

    options[key] = value;
    i += 1;
  }

  return options;
}

function jsonList(value) {
  if (!value) return '[]';
  return JSON.stringify(String(value).split(',').map((item) => item.trim()).filter(Boolean));
}

function printSection(title, rows, columns) {
  console.log('');
  console.log(`${title}:`);
  if (rows.length === 0) {
    console.log('  (none)');
    return;
  }
  printTable(rows, columns);
}

function printTable(rows, columns) {
  const widths = columns.map((column) => Math.max(column.length, ...rows.map((row) => String(row[column] ?? '').length)));
  console.log(columns.map((column, index) => column.padEnd(widths[index])).join('  '));
  console.log(widths.map((width) => '-'.repeat(width)).join('  '));
  for (const row of rows) {
    console.log(columns.map((column, index) => String(row[column] ?? '').padEnd(widths[index])).join('  '));
  }
}

function sql(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replaceAll("'", "''")}'`;
}

function required(value, message) {
  if (!value) throw new Error(message);
}

function isoNow() {
  return new Date().toISOString();
}

function relative(path) {
  return path.replace(`${repoRoot}/`, '');
}

function fail(message) {
  console.error(`AgentPM error: ${message}`);
  process.exit(1);
}

main();
