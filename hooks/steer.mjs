#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {normalizeLocalTool} from './local-tools.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FALLBACK_ROUTES = new Map([['user', 'UserPromptSubmit'], ['sub', 'SubagentStart'], ['agent', 'PostToolUse']]);
function fail(code, message) { const error = new Error(message); error.code = code; throw error; }
function parseEvent(raw) {
  let event = raw;
  if (typeof raw === 'string') {
    try { event = JSON.parse(raw); } catch (error) { error.code = 'INVALID_INPUT'; throw error; }
  }
  if (!event || typeof event !== 'object' || Array.isArray(event)) fail('INVALID_INPUT', 'Expected a Codex hook event object');
  if (typeof event.hook_event_name !== 'string' || !event.hook_event_name) fail('MISSING_METADATA', 'stdin event is missing hook_event_name');
  return event;
}
function completedReceipt(response) {
  let value = response;
  if (typeof value === 'string') {
    try { value = JSON.parse(value); } catch { return false; }
  }
  return value && value.timed_out === false && typeof value.status === 'object' && value.status !== null &&
    Object.values(value.status).some(status => status && typeof status.completed === 'string');
}
function classify(event) {
  if (event.hook_event_name === 'UserPromptSubmit') return {route: event.agent_id ? 'sub' : 'user', reason: 'INJECTED'};
  if (event.hook_event_name === 'SubagentStart') return {route: 'sub', reason: 'INJECTED'};
  if (event.hook_event_name !== 'PostToolUse') return {route: null, reason: 'UNSUPPORTED_EVENT'};
  if (typeof event.tool_name !== 'string' || !event.tool_name) fail('MISSING_METADATA', 'PostToolUse event is missing tool_name');
  if (!normalizeLocalTool(event.tool_name)) return {route: null, reason: 'UNSUPPORTED_TOOL'};
  if (event.agent_id) return {route: null, reason: 'CHILD_RESULT'};
  if (!Object.hasOwn(event, 'tool_response')) fail('MISSING_METADATA', 'wait_agent PostToolUse event is missing tool_response');
  return completedReceipt(event.tool_response) ? {route: 'agent', reason: 'INJECTED'} : {route: null, reason: 'NOT_COMPLETED'};
}
export function selectRoute(event) { return classify(event).route; }
function routeOutput(route, hookEventName, prompts) {
  const file = typeof prompts === 'object' ? prompts[route] : path.join(prompts, `${route}-steer.md`);
  let text;
  try { text = fs.readFileSync(file, 'utf8').trim(); }
  catch (error) { fail('MISSING_SOURCE', `Cannot read the ${route} Steer at ${file}: ${error.message}`); }
  if (!text) fail('MISSING_SOURCE', `The ${route} Steer file is empty: ${file}`);
  return {continue: true, hookSpecificOutput: {
    hookEventName,
    additionalContext: `<gpt-with-taste-${route}-steer>\n${text}\n</gpt-with-taste-${route}-steer>`
  }};
}
export function evaluateHook(raw, prompts = path.join(root, 'prompts'), dataDirectory = null) {
  const event = parseEvent(raw), result = classify(event);
  if (!result.route) return {...result, response: {continue: true}};
  // Codex sends both events for a child's first turn. A later parent message
  // has a new turn_id and must retain its Sub reminder.
  if (result.route === 'sub' && dataDirectory) {
    if (['session_id', 'agent_id', 'turn_id'].some(key => typeof event[key] !== 'string' || !event[key])) fail('MISSING_METADATA', `${event.hook_event_name} dedup requires string session_id, agent_id and turn_id`);
    const directory = path.join(dataDirectory, 'steer-start');
    const file = path.join(directory, `${encodeURIComponent(event.session_id)}--${encodeURIComponent(event.agent_id)}.json`);
    if (event.hook_event_name === 'SubagentStart') {
      const response = routeOutput(result.route, event.hook_event_name, prompts);
      try { fs.mkdirSync(directory, {recursive: true}); fs.writeFileSync(file, JSON.stringify({turnId: event.turn_id})); }
      catch (error) { fail('STATE_IO_FAILED', `Cannot record initial child turn at ${file}: ${error.message}`); }
      return {...result, response};
    }
    let firstTurn;
    try {
      if (fs.existsSync(file)) {
        firstTurn = JSON.parse(fs.readFileSync(file, 'utf8')).turnId;
        if (typeof firstTurn !== 'string') throw new Error('State is missing turnId');
        fs.unlinkSync(file);
      }
    } catch (error) { fail('STATE_IO_FAILED', `Cannot consume initial child turn at ${file}: ${error.message}`); }
    if (firstTurn === event.turn_id) return {...result, reason: 'DEDUPLICATED', response: {continue: true}};
  }
  return {...result, response: routeOutput(result.route, event.hook_event_name, prompts)};
}
export function handleHook(raw, prompts = path.join(root, 'prompts'), dataDirectory = null) {
  return evaluateHook(raw, prompts, dataDirectory).response;
}
export function fallbackHook(route) {
  if (!FALLBACK_ROUTES.has(route)) fail('MISSING_METADATA', `Invalid --route fallback: ${route || '(missing)'}`);
  fail('MISSING_METADATA', `The ${route} route requires event JSON to identify its consumer, turn and completed result`);
}
function cliRoute(argv) {
  const index = argv.indexOf('--route');
  if (index < 0 || index + 1 >= argv.length || argv.length !== index + 2) return null;
  return FALLBACK_ROUTES.has(argv[index + 1]) ? argv[index + 1] : null;
}
function audit(event, route, fallback, reason, injected) {
  if (!process.env.GPT_WITH_TASTE_HOOK_AUDIT) return;
  const record = {event: event?.hook_event_name ?? null, sessionId: event?.session_id ?? null,
    turnId: event?.turn_id ?? null, agentId: event?.agent_id ?? null, agentType: event?.agent_type ?? null,
    tool: event?.tool_name ?? null, normalizedTool: normalizeLocalTool(event?.tool_name), toolUseId: event?.tool_use_id ?? null,
    route, fallback, reason, injected};
  try { fs.appendFileSync(process.env.GPT_WITH_TASTE_HOOK_AUDIT, JSON.stringify(record) + '\n'); }
  catch (error) { process.stderr.write(`GPT with Taste Hook [AUDIT_WRITE_FAILED]: ${error.message}\n`); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  let event, fallback = false, route = null;
  try {
    let input = '';
    for await (const chunk of process.stdin) input += chunk;
    const fallbackRoute = cliRoute(process.argv.slice(2));
    fallback = input.trim() === '';
    if (fallback && !fallbackRoute) fail('MISSING_METADATA', 'Expected a Codex hook event JSON object on stdin');
    event = fallback ? {hook_event_name: FALLBACK_ROUTES.get(fallbackRoute)} : parseEvent(input);
    const needsState = event.hook_event_name === 'SubagentStart' || (event.hook_event_name === 'UserPromptSubmit' && event.agent_id);
    if (!fallback && needsState && !process.env.PLUGIN_DATA?.trim()) fail('MISSING_METADATA', `${event.hook_event_name} requires nonempty PLUGIN_DATA for initial child-turn dedup`);
    const result = fallback ? {route: fallbackRoute, reason: 'INJECTED', response: fallbackHook(fallbackRoute)} : evaluateHook(event, path.join(root, 'prompts'), process.env.PLUGIN_DATA);
    route = result.route;
    audit(event, route, fallback, result.reason, Boolean(result.response.hookSpecificOutput));
    process.stdout.write(JSON.stringify(result.response) + '\n');
  } catch (error) {
    const code = error.code ?? 'HOOK_FAILED';
    audit(event, route, fallback, code, false);
    process.stderr.write(`GPT with Taste Hook [${code}]: ${error.message}\n`);
    process.exitCode = 1;
  }
}
