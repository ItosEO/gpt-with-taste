import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { render } from './build.mjs';
import { route } from './hook.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const meta = JSON.parse(await readFile(join(root, 'recipe/manifest.json'), 'utf8'));
const texts = Object.fromEntries(await Promise.all(Object.entries(meta.texts).map(async ([key, file]) =>
  [key, await readFile(join(root, 'recipe', file), 'utf8')])));
const files = await render({ root, meta, texts });
// Keep all fixture writes inside the adapter lease, including paths with spaces.
const fixture = await mkdtemp(join(root, 'adapters/claude/.fixture space-'));
after(() => rm(fixture, { recursive: true, force: true }));
for (const [path, text] of files) {
  const target = join(fixture, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, text);
}

function invoke(event, { directory = 'plugin', raw, mode } = {}) {
  const config = JSON.parse(files.get(`${directory}/hooks/hooks.json`));
  const eventName = event?.hook_event_name ?? 'SubagentStart';
  const handler = (config.hooks[eventName] ?? config.hooks.SubagentStart)[0].hooks[0];
  const pluginPath = join(fixture, directory).replaceAll('\\', '/');
  const args = handler.args.map(arg => arg.replaceAll('${CLAUDE_PLUGIN_ROOT}', pluginPath));
  if (mode) args[1] = mode;
  return spawnSync(handler.command, args, {
    input: raw ?? JSON.stringify(event), encoding: 'utf8', shell: false,
  });
}
function context(result, eventName, expected) {
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  assert.deepEqual(JSON.parse(result.stdout), {
    hookSpecificOutput: { hookEventName: eventName, additionalContext: expected },
  });
}
function quiet(result) {
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {});
}

const common = {
  session_id: 'main-session', prompt_id: 'prompt-1', permission_mode: 'plan',
  transcript_path: 'C:\\A project\\transcript.jsonl', cwd: 'C:\\A project',
};

test('renderer preserves complete recipe texts and uses native extension paths', () => {
  assert.equal(files.get('main.md'), texts.main);
  assert.equal(files.get('independent.md'), texts.independent);
  for (const directory of ['plugin', 'prompt-only']) {
    const manifest = JSON.parse(files.get(`${directory}/.claude-plugin/plugin.json`));
    assert.equal(manifest.name, meta.id);
    assert.equal(manifest.version, meta.version);
    assert.equal(manifest.hooks, undefined); // hooks/hooks.json is auto-discovered once.
    const agent = files.get(`${directory}/agents/taste-worker.md`);
    assert.equal(agent.slice(agent.indexOf('\n---\n') + 6), texts.sub);
    assert.match(agent, /disallowedTools: \[Agent\]/);
    assert.doesNotMatch(agent.split('\n---\n')[0], /model:|permissionMode:|tools:/);
    const config = JSON.parse(files.get(`${directory}/hooks/hooks.json`));
    for (const entries of Object.values(config.hooks)) {
      const handler = entries[0].hooks[0];
      assert.equal(handler.command, 'node');
      assert.equal(handler.args[0], '${CLAUDE_PLUGIN_ROOT}/scripts/hook.mjs');
      assert.equal(handler.shell, undefined); // exec form: paths stay one argument.
    }
  }
  const full = JSON.parse(files.get('plugin/hooks/hooks.json'));
  assert.equal(full.hooks.PostToolUse[0].matcher, 'Agent');
  assert.deepEqual(Object.keys(JSON.parse(files.get('prompt-only/hooks/hooks.json')).hooks), ['SubagentStart']);
});

test('UserPromptSubmit sends only User Steer to main, including a top-level --agent', () => {
  for (const agent_type of [undefined, 'custom-main', 'gpt-with-taste:taste-worker']) {
    context(invoke({ ...common, hook_event_name: 'UserPromptSubmit', agent_type, prompt: 'Continue' }),
      'UserPromptSubmit', texts.userSteer);
  }
});

test('child UserPromptSubmit uses child identity, never the parent User Steer', () => {
  for (const identity of [{ agent_id: 'child-1', agent_type: 'Explore' }, { caller_session_id: 'parent-1' }]) {
    context(invoke({ ...common, ...identity, hook_event_name: 'UserPromptSubmit', prompt: 'Continue' }),
      'UserPromptSubmit', texts.subSteer);
  }
});

test('SubagentStart keeps existing roles and delivers full Sub plus Sub Steer to the child', () => {
  context(invoke({ ...common, hook_event_name: 'SubagentStart', agent_id: 'child-1', agent_type: 'Explore' }),
    'SubagentStart', `${texts.sub}\n\n${texts.subSteer}`);
});

test('native taste-worker already has Sub: start context adds only Sub Steer', () => {
  context(invoke({ ...common, hook_event_name: 'SubagentStart', agent_id: 'child-1',
    agent_type: 'gpt-with-taste:taste-worker' }), 'SubagentStart', texts.subSteer);
});

test('prompt-only delivers Sub without Steer and never duplicates the native worker body', () => {
  context(invoke({ hook_event_name: 'SubagentStart', agent_type: 'Plan' }, { directory: 'prompt-only' }),
    'SubagentStart', texts.sub);
  quiet(invoke({ hook_event_name: 'SubagentStart', agent_type: 'gpt-with-taste:taste-worker' },
    { directory: 'prompt-only' }));
  quiet(invoke({ hook_event_name: 'UserPromptSubmit' }, { directory: 'prompt-only' }));
});

test('documented Independent startup keeps root Steer off and delivers complete Sub to children', async () => {
  const docs = await readFile(join(root, 'docs/harnesses/claude.md'), 'utf8');
  const command = docs.split('\n').find(line => line.startsWith('claude ') && line.includes('/independent.md'));
  assert.ok(command, 'Independent needs an explicit startup command');
  assert.match(command, /--append-system-prompt-file "[^"]*\/independent\.md"/);
  assert.match(command, /--plugin-dir "[^"]*\/prompt-only"/);
  assert.doesNotMatch(command, /\/main\.md|\/plugin"/);
  assert.equal(files.get('independent.md'), texts.independent);
  const directory = 'prompt-only';
  const hooks = JSON.parse(files.get(`${directory}/hooks/hooks.json`)).hooks;
  assert.equal(hooks.UserPromptSubmit, undefined);
  assert.equal(hooks.PostToolUse, undefined);
  quiet(invoke({ ...common, hook_event_name: 'UserPromptSubmit', prompt: 'Continue' }, { directory }));
  quiet(invoke({ ...common, hook_event_name: 'PostToolUse', tool_name: 'Agent',
    tool_response: { status: 'completed', agentId: 'child-1', content: [{ type: 'text', text: 'Result' }] } },
  { directory }));
  context(invoke({ ...common, hook_event_name: 'SubagentStart', agent_id: 'child-1', agent_type: 'Plan' },
    { directory }), 'SubagentStart', texts.sub);
});

test('completed Agent response routes Main and child callers without rewriting the same result', async () => {
  const tool_response = { status: 'completed', agentId: 'child-1',
    content: [{ type: 'text', text: 'Found 12 endpoints' }], totalToolUseCount: 7 };
  for (const [identity, expectedName, expectedText] of [
    [{}, 'agent-steer', texts.agentSteer],
    [{ agent_type: 'custom-main' }, 'agent-steer', texts.agentSteer],
    [{ agent_id: 'calling-child' }, 'sub-steer', texts.subSteer],
    [{ caller_session_id: 'parent' }, 'sub-steer', texts.subSteer],
    [{ agent_id: 'calling-child', caller_session_id: 'parent' }, 'sub-steer', texts.subSteer],
  ]) {
    const event = { ...common, ...identity, hook_event_name: 'PostToolUse', tool_name: 'Agent',
      tool_input: { subagent_type: 'Explore', prompt: 'Inspect', run_in_background: false },
      tool_response };
    const original = structuredClone(event);
    context(invoke(event), 'PostToolUse', expectedText);
    const output = await route(event, { load: async name => name });
    assert.deepEqual(event, original);
    assert.strictEqual(event.tool_response, tool_response);
    assert.deepEqual(output, {
      hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: expectedName },
    });
  }
});

test('normal tools, errors, launches, handles and unknown result shapes get no completed reminder', () => {
  const cases = [
    { tool_name: 'Bash', tool_response: { status: 'completed', stdout: 'ok' } },
    { tool_name: 'Agent', tool_response: { status: 'async_launched', agentId: 'child', outputFile: 'out' } },
    { tool_name: 'Agent', tool_response: { status: 'remote_launched', taskId: 'remote', sessionUrl: 'https://example.com' } },
    { tool_name: 'Agent', tool_response: { agentId: 'child', outputFile: 'out' } },
    { tool_name: 'Agent', tool_response: { status: 'error', error: 'Failed' } },
    { tool_name: 'Agent', tool_response: 'Async agent launched successfully' },
    { tool_name: 'Agent', tool_response: null },
    { tool_name: 'Agent' },
  ];
  for (const fields of cases) quiet(invoke({ ...common, hook_event_name: 'PostToolUse', ...fields }));
  quiet(invoke({ hook_event_name: 'PostToolUseFailure', tool_name: 'Agent', error: 'Failed' }));
  quiet(invoke({ hook_event_name: 'SubagentStop', agent_id: 'child', last_assistant_message: 'done' }));
});

test('stdin handles empty input, malformed JSON, invalid objects and missing generated files', async () => {
  const empty = invoke(null, { raw: ' \n' });
  assert.equal(empty.status, 0);
  assert.equal(empty.stdout, '');
  for (const raw of ['{', 'null', '[]']) {
    const result = invoke(null, { raw });
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /^GPT with Taste hook:/);
  }
  const missingRoot = join(fixture, 'missing texts');
  await mkdir(join(missingRoot, 'scripts'), { recursive: true });
  await writeFile(join(missingRoot, 'scripts/hook.mjs'), files.get('plugin/scripts/hook.mjs'));
  const missing = spawnSync(process.execPath, [join(missingRoot, 'scripts/hook.mjs'), 'steer'], {
    input: JSON.stringify({ hook_event_name: 'UserPromptSubmit' }), encoding: 'utf8',
  });
  assert.equal(missing.status, 1);
  assert.equal(missing.stdout, '');
  assert.match(missing.stderr, /ENOENT/);
});
