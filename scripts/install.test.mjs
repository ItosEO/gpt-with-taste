import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { run } from './install.mjs';
import { setInstructions } from '../src/toml-overlay.mjs';
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scratch = path.join(repo, '.tmp/install-test');
const receipt = root => path.join(root, '.gpt-with-taste/install-receipt.json');
async function put(file, text) { await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, text); }
async function exists(file) { return fs.access(file).then(() => true, () => false); }
async function fixture(t) {
  await fs.mkdir(scratch, { recursive: true });
  const dir = await fs.mkdtemp(path.join(scratch, 'case-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const root = path.join(dir, 'clone');
  const home = path.join(dir, 'Codex Home');
  await fs.mkdir(home, { recursive: true });
  await put(path.join(root, 'prompts/main.md'), 'FIXTURE MAIN — no behavioral claim\n');
  await put(path.join(root, 'prompts/sub.md'), 'FIXTURE SUB\n');
  await put(path.join(root, 'prompts/user-steer.md'), 'FIXTURE USER STEER\n');
  await fs.mkdir(path.join(root, 'hooks'), { recursive: true });
  await fs.copyFile(path.join(repo, 'hooks/steer.mjs'), path.join(root, 'hooks/steer.mjs'));
  const call = (...args) => run(['--home', home, ...args], root);
  return { root, home, call };
}
const original = '\uFEFF# local config\r\nmodel = "existing-gpt"\r\nmodel_reasoning_effort = "high"\r\nmodel_instructions_file = \'old/main.md\' # preserve\r\n[model_providers.private]\r\nexperimental_bearer_token = "fixture-secret-not-real"\r\n[agents]\r\nmax_concurrent_threads_per_session = 8\r\n[agents.worker]\r\nconfig_file = "roles/worker.toml"\r\n[features]\r\nmulti_agent = true\r\n[mcp_servers.local]\r\ncommand = "fixture"\r\n';
test('prompt-only preserves all other bytes and hooks; repeated installs retain baseline; restore preserves later unrelated edits', async t => {
  const { root, home, call } = await fixture(t);
  await put(path.join(home, 'config.toml'), original);
  const hookText = '{"hooks":{"UserPromptSubmit":[{"hooks":[{"type":"command","command":"other"}]}]},"local":true}\n';
  await put(path.join(home, 'hooks.json'), hookText);
  await put(path.join(home, 'prompts/nia.md'), 'Nia stays');
  await call('--dry-run');
  assert.equal(await exists(receipt(root)), false);
  await call();
  assert.equal(await fs.readFile(path.join(home, 'config.toml'), 'utf8'), setInstructions(original, path.join(home, 'prompts/gpt-with-taste/main.md')));
  assert.equal(await fs.readFile(path.join(home, 'hooks.json'), 'utf8'), hookText);
  assert.equal(await exists(path.join(home, 'gpt-with-taste/hooks/steer.mjs')), false);
  const baseline = await fs.readFile(receipt(root), 'utf8');
  assert.equal(baseline.includes('fixture-secret-not-real'), false);
  await call();
  assert.equal(await fs.readFile(receipt(root), 'utf8'), baseline);
  await put(path.join(root, 'prompts/main.md'), 'UPDATED FIXTURE\n');
  await call();
  assert.equal(JSON.parse(await fs.readFile(receipt(root))).config.before, JSON.parse(baseline).config.before);
  await fs.appendFile(path.join(home, 'config.toml'), '[analytics]\r\nenabled = false\r\n');
  await call('--check');
  await call('--restore');
  assert.equal(await fs.readFile(path.join(home, 'config.toml'), 'utf8'), original + '[analytics]\r\nenabled = false\r\n');
  assert.equal(await exists(path.join(home, 'prompts/gpt-with-taste/main.md')), false);
  assert.equal(await fs.readFile(path.join(home, 'hooks.json'), 'utf8'), hookText);
  assert.equal(await fs.readFile(path.join(home, 'prompts/nia.md'), 'utf8'), 'Nia stays');
});
test('unknown managed bytes require explicit replacement and are restored exactly', async t => {
  const { home, root, call } = await fixture(t);
  const file = path.join(home, 'prompts/gpt-with-taste/main.md');
  const old = Buffer.from([0, 1, 255, 13, 10]);
  await put(file, old);
  await assert.rejects(call(), /Unknown managed target/);
  assert.equal(await exists(receipt(root)), false);
  await call('--replace-managed');
  await call();
  await call('--restore');
  assert.deepEqual(await fs.readFile(file), old);
  assert.equal(await exists(path.join(home, 'config.toml')), false);
});
test('config key and prompt drift refuse install and restore without writes', async t => {
  const { home, root, call } = await fixture(t);
  await call();
  const file = path.join(home, 'prompts/gpt-with-taste/main.md');
  const installed = await fs.readFile(file);
  await put(file, 'USER EDIT');
  const before = await fs.readFile(receipt(root));
  await assert.rejects(call('--replace-managed'), /drifted/);
  await assert.rejects(call('--restore'), /drifted/);
  assert.deepEqual(await fs.readFile(receipt(root)), before);
  await put(file, installed);
  await put(path.join(home, 'config.toml'), 'model_instructions_file = "other.md"\n');
  await assert.rejects(call('--restore'), /config key has drifted/);
  assert.equal(await fs.readFile(file, 'utf8'), installed.toString());
});
test('explicit hooks add one exact command, run deployed source, preserve peer groups on restore', async t => {
  const { home, root, call } = await fixture(t);
  const peer = { hooks: [{ type: 'command', command: 'node other-sol-recipe-steer.mjs' }] };
  await put(path.join(home, 'hooks.json'), JSON.stringify({ hooks: { UserPromptSubmit: [peer], Stop: [peer] }, custom: 3 }));
  await call();
  await call('--hooks');
  let hooks = JSON.parse(await fs.readFile(path.join(home, 'hooks.json')));
  assert.equal(hooks.hooks.UserPromptSubmit.length, 2);
  const owned = hooks.hooks.UserPromptSubmit[1];
  assert.equal(owned.hooks[0].timeout, 15);
  assert.equal(owned.hooks[0].command.includes(process.execPath.replaceAll('\\', '/')), true);
  const result = spawnSync(process.execPath, [path.join(home, 'gpt-with-taste/hooks/steer.mjs')], {
    input: JSON.stringify({ hook_event_name: 'UserPromptSubmit', session_id: 'fixture-session', turn_id: 'fixture-turn', prompt: 'fixture' }), encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).hookSpecificOutput.additionalContext.includes('FIXTURE USER STEER'), true);
  const before = await fs.readFile(receipt(root));
  await call('--hooks');
  assert.deepEqual(await fs.readFile(receipt(root)), before);
  const peer2 = { hooks: [{ type: 'command', command: 'new-peer' }] };
  hooks.hooks.UserPromptSubmit.push(peer2);
  await put(path.join(home, 'hooks.json'), JSON.stringify(hooks));
  // Prompt-only upgrades never read or rewrite hook JSON or runtime files.
  await put(path.join(root, 'prompts/main.md'), 'PROMPT ONLY UPGRADE');
  await call();
  assert.equal(JSON.parse(await fs.readFile(path.join(home, 'hooks.json'))).hooks.UserPromptSubmit.length, 3);
  await call('--restore');
  hooks = JSON.parse(await fs.readFile(path.join(home, 'hooks.json')));
  assert.deepEqual(hooks.hooks.UserPromptSubmit, [peer, peer2]);
  assert.deepEqual(hooks.hooks.Stop, [peer]);
  assert.equal(hooks.custom, 3);
  assert.equal(await exists(path.join(home, 'gpt-with-taste/hooks/steer.mjs')), false);
});
test('hook drift and malformed hooks refuse without replacing prompts; default ignores malformed hooks', async t => {
  const { home, root, call } = await fixture(t);
  await put(path.join(home, 'hooks.json'), 'INVALID');
  await call();
  const before = await fs.readFile(receipt(root));
  await assert.rejects(call('--hooks'), /valid JSON/);
  assert.deepEqual(await fs.readFile(receipt(root)), before);
  await put(path.join(home, 'hooks.json'), '{}');
  await call('--hooks');
  const hooks = JSON.parse(await fs.readFile(path.join(home, 'hooks.json')));
  hooks.hooks.UserPromptSubmit[0].hooks[0].timeout = 999;
  await put(path.join(home, 'hooks.json'), JSON.stringify(hooks));
  await assert.rejects(call('--restore'), /hook has drifted/);
  assert.equal(await exists(path.join(home, 'prompts/gpt-with-taste/main.md')), true);
});
test('safe TOML insertion keeps multiline unrelated content, dotted/quoted sections, BOM and no-final-newline', async () => {
  const text = '\uFEFFnote = """\nmodel_instructions_file = "not-a-key"\n"""\nitems = [\n  "a",\n]\n["model_providers"."mine"]\nexperimental_bearer_token = "fixture-only"';
  assert.equal(setInstructions(text, '/home/main.md'), '\uFEFFmodel_instructions_file = "/home/main.md"\n' + text.slice(1));
  assert.throws(() => setInstructions('model_instructions_file = "a"\nmodel_instructions_file = "b"\n', '/a'), /duplicate/);
  assert.throws(() => setInstructions('model_instructions_file = """multi\nline"""', '/a'), /single-line/);
});
test('an interrupted restore resumes using the same receipt', async t => {
  const { home, root, call } = await fixture(t);
  await call();
  const data = JSON.parse(await fs.readFile(receipt(root)));
  data.status = 'restoring';
  await put(receipt(root), JSON.stringify(data));
  await fs.unlink(path.join(home, data.files[0].path));
  await call('--restore');
  assert.equal(await exists(path.join(home, 'config.toml')), false);
  assert.equal(JSON.parse(await fs.readFile(receipt(root))).status, 'restored');
});
test('interrupted source update restores original bytes rather than replacing its baseline', async t => {
  const { home, root, call } = await fixture(t);
  await call();
  const data = JSON.parse(await fs.readFile(receipt(root)));
  data.status = 'applying';
  for (const entry of data.files) {
    entry.previous = entry.after;
    entry.after = Buffer.from('NEW SOURCE').toString('base64');
  }
  data.config.previous = data.config.after;
  await put(receipt(root), JSON.stringify(data));
  await put(path.join(home, data.files[0].path), 'NEW SOURCE');
  await call('--restore');
  assert.equal(await exists(path.join(home, data.files[0].path)), false);
  assert.equal(await exists(path.join(home, data.files[1].path)), false);
});
test('prompt-only remains independent of drift in previously opted-in hooks', async t => {
  const { home, root, call } = await fixture(t);
  await call('--hooks');
  await put(path.join(home, 'hooks.json'), 'USER CHANGED HOOK FILE');
  await put(path.join(root, 'prompts/main.md'), 'NEW MAIN');
  await call();
  assert.equal(await fs.readFile(path.join(home, 'hooks.json'), 'utf8'), 'USER CHANGED HOOK FILE');
  assert.equal(await fs.readFile(path.join(home, 'prompts/gpt-with-taste/main.md'), 'utf8'), 'NEW MAIN');
  await assert.rejects(call('--restore'), /valid JSON/);
});
test('invalid managed scalar fails before writes', async t => {
  const { home, root, call } = await fixture(t);
  await put(path.join(home, 'config.toml'), 'model_instructions_file = ["not-a-path"]\n');
  await assert.rejects(call(), /single-line string/);
  assert.equal(await exists(receipt(root)), false);
  assert.throws(() => setInstructions('  model_instructions_file = """x"""\n', '/a'), /single-line/);
});
test('opting in adopts matching preexisting hook files without dropping recovery state', async t => {
  const { home, root, call } = await fixture(t);
  await call('--hooks');
  const hookText = await fs.readFile(path.join(home, 'hooks.json'));
  const runtimeFiles = ['gpt-with-taste/hooks/steer.mjs', 'gpt-with-taste/prompts/user-steer.md'];
  const runtime = await Promise.all(runtimeFiles.map(file => fs.readFile(path.join(home, file))));
  await call('--restore');
  await call();
  for (let i = 0; i < runtimeFiles.length; i++) await put(path.join(home, runtimeFiles[i]), runtime[i]);
  await put(path.join(home, 'hooks.json'), hookText);
  await call('--hooks');
  const data = JSON.parse(await fs.readFile(receipt(root)));
  assert.equal(data.files.length, 4);
  assert.ok(data.hook);
  await call('--restore');
  assert.equal(await exists(path.join(home, runtimeFiles[0])), true);
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(home, 'hooks.json'))), JSON.parse(hookText));
});
