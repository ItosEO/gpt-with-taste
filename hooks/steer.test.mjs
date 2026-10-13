import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {test} from 'node:test';
import {fallbackHook, handleHook} from './steer.mjs';
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpt-with-taste-hook-'));
  for (const source of ['user', 'sub', 'agent']) fs.writeFileSync(path.join(dir, `${source}-steer.md`), `${source.toUpperCase()} WHOLE SOURCE\n`);
  t.after(() => fs.rmSync(dir, {recursive: true}));
  return dir;
}
function context(event, route, dir) {
  const input = structuredClone(event);
  const output = handleHook(event, dir);
  assert.deepEqual(event, input, 'Original request/result object must not change');
  assert.deepEqual(output, {continue: true, hookSpecificOutput: {
    hookEventName: event.hook_event_name,
    additionalContext: `<gpt-with-taste-${route}-steer>\n${route.toUpperCase()} WHOLE SOURCE\n</gpt-with-taste-${route}-steer>`
  }});
}
test('each input source targets only its own consumer', t => {
  const dir = fixture(t);
  context({hook_event_name: 'UserPromptSubmit', session_id: 'main', prompt: 'ordinary human request'}, 'user', dir);
  context({hook_event_name: 'SubagentStart', session_id: 'parent', agent_id: 'child', agent_type: 'explore'}, 'sub', dir);
  context({hook_event_name: 'UserPromptSubmit', session_id: 'child', agent_id: 'child', prompt: 'parent follow-up'}, 'sub', dir);
  context({hook_event_name: 'PostToolUse', tool_name: 'wait_agent', tool_response: JSON.stringify({status: {child: {completed: 'Full unmodified receipt'}}, timed_out: false})}, 'agent', dir);
});
test('shell, MCP, subagent stop, spawn ids, timeouts and child tool results receive no main agent steer', t => {
  const dir = fixture(t);
  for (const event of [
    {hook_event_name: 'SubagentStop', last_assistant_message: 'receipt'},
    {hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_response: {status: {child: {completed: 'receipt'}}}},
    {hook_event_name: 'PostToolUse', tool_name: 'mcp__server__wait_agent', tool_response: {status: {child: {completed: 'receipt'}}}},
    {hook_event_name: 'PostToolUse', tool_name: 'spawn_agent', tool_response: {agent_id: 'child'}},
    {hook_event_name: 'PostToolUse', tool_name: 'wait_agent', tool_response: {status: {}, timed_out: true}},
    {hook_event_name: 'PostToolUse', tool_name: 'wait_agent', tool_response: {status: {child: {running: true}}}},
    {hook_event_name: 'PostToolUse', tool_name: 'wait_agent', tool_response: 'Error: unavailable'},
    {hook_event_name: 'PostToolUse', tool_name: 'wait_agent', agent_id: 'child', tool_response: {status: {other: {completed: 'receipt'}}}},
    {hook_event_name: 'PreToolUse', tool_name: 'send_input', tool_input: {id: 'child', message: 'Parent brief stays intact'}},
  ]) assert.deepEqual(handleHook(event, dir), {continue: true});
});
test('malformed event and missing source fail visibly', t => {
  assert.throws(() => handleHook('{'), SyntaxError);
  assert.throws(() => handleHook(null), /event object/);
  assert.throws(() => fallbackHook('unknown'), /Invalid --route fallback/);
  const dir = fixture(t);
  fs.unlinkSync(path.join(dir, 'sub-steer.md'));
  assert.throws(() => handleHook({hook_event_name: 'SubagentStart'}, dir), /ENOENT/);
});

function runCli(args, input, audit) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(import.meta.dirname, 'steer.mjs'), ...args], {
      env: {...process.env, ...(audit ? {GPT_WITH_TASTE_HOOK_AUDIT: audit} : {})},
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => stdout += chunk);
    child.stderr.on('data', chunk => stderr += chunk);
    child.on('error', reject);
    child.on('close', code => resolve({code, stdout, stderr}));
    child.stdin.end(input);
  });
}

test('empty stdin uses only an explicit route fallback and audits it', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpt-with-taste-cli-'));
  t.after(() => fs.rmSync(dir, {recursive: true}));
  for (const route of ['user', 'sub', 'agent']) {
    const audit = path.join(dir, `${route}.jsonl`);
    const result = await runCli(['--route', route], '', audit);
    assert.equal(result.code, 0);
    const output = JSON.parse(result.stdout);
    assert.match(output.hookSpecificOutput.additionalContext, new RegExp(`<gpt-with-taste-${route}-steer>`));
    assert.deepEqual(JSON.parse(fs.readFileSync(audit, 'utf8')), {
      event: {user: 'UserPromptSubmit', sub: 'SubagentStart', agent: 'PostToolUse'}[route],
      sessionId: null, turnId: null, agentId: null, agentType: null, tool: null, toolUseId: null,
      route, fallback: true, injected: true,
    });
  }
});

test('empty stdin without an explicit route remains a visible failure', async () => {
  const result = await runCli([], '', null);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /Expected a Codex hook event JSON object/);
});

test('valid JSON keeps the original route selection and does not use fallback', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gpt-with-taste-valid-'));
  t.after(() => fs.rmSync(dir, {recursive: true}));
  const audit = path.join(dir, 'event.jsonl');
  const result = await runCli(['--route', 'agent'], JSON.stringify({hook_event_name: 'UserPromptSubmit', prompt: 'request'}) + '\n', audit);
  assert.equal(result.code, 0);
  const output = JSON.parse(result.stdout);
  assert.match(output.hookSpecificOutput.additionalContext, /<gpt-with-taste-user-steer>/);
  const record = JSON.parse(fs.readFileSync(audit, 'utf8'));
  assert.equal(record.route, 'user');
  assert.equal(record.fallback, false);
});
