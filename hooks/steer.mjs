#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RETURN_TOOLS = new Set(['wait_agent']);
function completedReceipt(response) {
  let value = response;
  if (typeof value === 'string') {
    try { value = JSON.parse(value); } catch { return false; }
  }
  return value && typeof value.status === 'object' && value.status !== null &&
    Object.values(value.status).some(status => status && typeof status.completed === 'string');
}
export function selectRoute(event) {
  if (event.hook_event_name === 'UserPromptSubmit') return event.agent_id ? 'sub' : 'user';
  if (event.hook_event_name === 'SubagentStart') return 'sub';
  if (event.hook_event_name === 'PostToolUse' && !event.agent_id && RETURN_TOOLS.has(event.tool_name) && completedReceipt(event.tool_response)) return 'agent';
  return null;
}
export function handleHook(raw, prompts = path.join(root, 'prompts')) {
  const event = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!event || typeof event !== 'object' || Array.isArray(event)) throw new Error('Expected a Codex hook event object');
  const route = selectRoute(event);
  if (!route) return {continue: true};
  const file = typeof prompts === 'object' ? prompts[route] : path.join(prompts, `${route}-steer.md`);
  const text = fs.readFileSync(file, 'utf8').trim();
  if (!text) throw new Error(`The ${route} Steer file is empty`);
  return {continue: true, hookSpecificOutput: {
    hookEventName: event.hook_event_name,
    additionalContext: `<gpt-with-taste-${route}-steer>\n${text}\n</gpt-with-taste-${route}-steer>`
  }};
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    let input = '';
    for await (const chunk of process.stdin) input += chunk;
    const event = JSON.parse(input);
    const response = handleHook(event);
    if (process.env.GPT_WITH_TASTE_HOOK_AUDIT) {
      const record = {event: event.hook_event_name, sessionId: event.session_id ?? null,
        turnId: event.turn_id ?? null, agentId: event.agent_id ?? null, agentType: event.agent_type ?? null,
        tool: event.tool_name ?? null, toolUseId: event.tool_use_id ?? null,
        route: selectRoute(event), injected: Boolean(response.hookSpecificOutput)};
      fs.appendFileSync(process.env.GPT_WITH_TASTE_HOOK_AUDIT, JSON.stringify(record) + '\n');
    }
    process.stdout.write(JSON.stringify(response) + '\n');
  } catch (error) {
    process.stderr.write(`GPT with Taste Hook: ${error.message}\n`);
    process.exitCode = 1;
  }
}
