import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {compile, loadRecipe, TARGETS, TEXT_KEYS} from '../src/build.mjs';
import {run} from './build.mjs';
import {run as install} from './install.mjs';
import {pluginBundle, MARKET_ROOT} from '../src/codex-plugin.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
async function fixture(t) {
  const scratch = path.join(repo, '.tmp/build-test');
  await fs.mkdir(scratch, {recursive: true});
  const root = await fs.mkdtemp(path.join(scratch, 'case-'));
  t.after(() => fs.rm(root, {recursive: true, force: true}));
  for (const dir of ['recipe', 'adapters', 'src'])
    await fs.cp(path.join(repo, dir), path.join(root, dir), {recursive: true});
  await fs.copyFile(path.join(repo, 'LICENSE'), path.join(root, 'LICENSE'));
  return root;
}
const content = (map, file) => map.get(file).toString();

test('author package is complete, host-neutral and position-specific', async () => {
  const {meta, texts} = await loadRecipe(repo);
  assert.equal(meta.version, '0.1.0');
  assert.equal(meta.compatibility.kiki.version, '1.0.7');
  assert.deepEqual(Object.keys(texts), TEXT_KEYS);
  for (const text of Object.values(texts)) {
    assert.doesNotMatch(text, /current Codex|@variant/);
    assert.match(text, /user's (?:latest language|chosen persona|explicit persona)/);
  }
  assert.match(texts.main, /Own the result the user is trying to achieve/);
  assert.match(texts.main, /Even after a review or tests pass/);
  assert.match(texts.main, /documentation, metrics, or behavior were redefined/);
  assert.match(texts.sub, /parent owns cross-task coordination/);
  assert.match(texts.sub, /leaf status/);
  assert.doesNotMatch(texts.independent, /parent|assigned to you|delegated agent|you are a subagent/i);
  assert.match(texts.independent, /actual controller/);
  for (const key of ['main', 'sub']) {
    assert.match(texts[key], /falsifiable/);
    assert.match(texts[key], /ISO 24495-1:2023/);
    assert.match(texts[key], /entry points, data meaning, and conditions/);
    assert.match(texts[key], /Nonessential hash verification is prohibited/);
  }
});

test('compile is deterministic and each generated file has a source manifest', async () => {
  const first = await compile(repo), second = await compile(repo, [...TARGETS].reverse());
  assert.deepEqual(first, second);
  assert.deepEqual([...first.keys()], [...first.keys()].sort());
  for (const target of TARGETS) {
    const manifestPath = `dist/${target}/build-manifest.json`;
    const manifest = JSON.parse(content(first, manifestPath));
    assert.equal(manifest.recipe.manifest, 'recipe/manifest.json');
    assert.deepEqual(Object.keys(manifest.sources), TEXT_KEYS);
    assert.deepEqual(manifest.files, [...first.keys()].filter(file => file.startsWith(`dist/${target}/`) ||
      (target === 'codex' && file.startsWith('prompts/'))));
    for (const file of manifest.files) assert.ok(first.has(file), file);
  }
  for (const name of ['main', 'sub', 'user-steer', 'sub-steer', 'agent-steer'])
    assert.equal(first.get(`prompts/${name}.md`), first.get(`dist/codex/${name}.md`));
});

test('check detects manual and source drift, remains read-only and respects selected targets', async t => {
  const root = await fixture(t);
  await run([], root);
  await run(['--check'], root);
  const source = path.join(root, 'recipe/main.md'), before = await fs.readFile(source);
  const output = path.join(root, 'dist/kiki/main.md');
  await fs.appendFile(output, '\nMANUAL DRIFT\n');
  await assert.rejects(run(['--check', '--target', 'kiki'], root), /dist\/kiki\/main.md/);
  await run(['--check', '--target', 'codex'], root);
  assert.deepEqual(await fs.readFile(source), before);
  assert.match(await fs.readFile(output, 'utf8'), /MANUAL DRIFT/);
  await run(['--target', 'kiki'], root);
  await fs.appendFile(source, '\nSOURCE CHANGE\n');
  await assert.rejects(run(['--check'], root), /prompts\/main.md/);
  await run(['--target', 'codex'], root);
  await run(['--check', '--target', 'codex'], root);
  await assert.rejects(run(['--check', '--target', 'kiki'], root), /dist\/kiki\/main.md/);
  await run(['--target', 'kiki'], root);
  if (TARGETS.some(target => !['codex', 'kiki'].includes(target)))
    await assert.rejects(run(['--check'], root), /Generated files have drifted/);
  await run([], root);
  await run(['--check'], root);
});

test('one source edit reaches every implemented target and only its corresponding Markdown projections', async t => {
  const root = await fixture(t);
  const before = await compile(root);
  await fs.appendFile(path.join(root, 'recipe/main.md'), '\nONE SOURCE CHANGE\n');
  const after = await compile(root);
  for (const target of TARGETS) {
    const changed = [...after.keys()].filter(file => file.startsWith(`dist/${target}/`) &&
      !Buffer.from(before.get(file)).equals(Buffer.from(after.get(file))));
    assert.ok(changed.length, target);
    for (const file of changed) assert.match(content(after, file), /ONE SOURCE CHANGE/);
    if (target === 'codex' || target === 'kiki')
      assert.ok(changed.every(file => file.endsWith('main.md')), changed.join(', '));
  }
  assert.match(content(after, 'prompts/main.md'), /ONE SOURCE CHANGE/);
  assert.equal(after.get('prompts/sub.md'), before.get('prompts/sub.md'));
});

test('Kiki schema v1 keeps whole-branch isolation, all Steers and the four legacy aliases', async () => {
  const files = await compile(repo, ['kiki']);
  const packages = [...files.keys()].filter(file => file.endsWith('.toml'));
  // Assert the declared branch contracts without adding a parser dependency to Node-only tests.
  const section = (text, name) => {
    const start = text.indexOf(`[${name}]\n`);
    assert.notEqual(start, -1, name);
    return text.slice(start + name.length + 3).split('\n[')[0];
  };
  for (const file of packages) {
    const text = content(files, file), base = path.posix.dirname(file);
    assert.match(text, /schema_version = 1\n/);
    assert.ok(text.includes(`version = "${file.includes('/sol-astra/') ? '1.0.7' : '0.1.0'}"`));
    const common = section(text, 'prompts'), main = section(text, 'prompts.main');
    const independent = section(text, 'prompts.independent');
    const readSlot = (body, key) => {
      const match = body.match(new RegExp(`^${key} = \\{ file = "([^"]+)" \\}`, 'm'));
      assert.ok(match, `${file}: ${key}`);
      return content(files, `${base}/${match[1]}`);
    };
    assert.match(readSlot(common, 'system'), /Own the complete result assigned to you/);
    assert.match(readSlot(main, 'system'), /Own the result the user is trying to achieve/);
    assert.match(readSlot(independent, 'system'), /Turn the user's intent/);
    assert.match(readSlot(common, 'steering'), /parent's goal/);
    assert.match(readSlot(main, 'steering'), /user's purpose/);
    assert.match(section(text, 'prompts.steering_sources.agent'), /^mode = "inherit"/);
    for (const source of ['agent', 'task']) {
      const steer = section(text, `prompts.main.steering_sources.${source}`);
      assert.match(steer, /^mode = "custom"/);
      const match = steer.match(/custom = \{ steering = \{ file = "([^"]+)" \}/);
      assert.ok(match);
      assert.match(content(files, `${base}/${match[1]}`), /Reconcile this message or task result/);
      assert.match(steer, /steering_on_turn = true, steering_on_input = true, steering_interval_steps = 0/);
      assert.match(section(text, `prompts.independent.steering_sources.${source}`), /^mode = "off"/);
    }
    assert.match(independent, /steering = "off"/);
    assert.match(independent, /steering_on_turn = false/);
    assert.match(independent, /steering_on_input = false/);
    for (const [, reference] of text.matchAll(/file = "([^"]+)"/g)) assert.ok(files.has(`${base}/${reference}`), reference);
  }
  assert.deepEqual(JSON.parse(content(files, 'dist/kiki/sol-astra/mapping.json')), {schema: 1, models: {
    'axon/gpt-6.1-sol': 'sol.toml',
    'axon/gpt-6-astra': 'astra.toml',
    'axon-for-test/gpt-6-astra': 'astra.toml',
    'axon/gpt-6-astra-text-recovery': 'astra.toml',
  }});
  assert.match(content(files, 'dist/kiki/sol-astra/sol.toml'), /id = "gpt-6.1-sol-behavior"\nname = "GPT-6.1 Sol — 工作方式"/);
  assert.match(content(files, 'dist/kiki/sol-astra/astra.toml'), /id = "gpt-6-astra-behavior"\nname = "GPT-6 Astra — 工作方式"/);
});

test('selected target does not import another adapter; invalid targets and unsafe paths fail', async t => {
  const root = await fixture(t);
  await fs.rm(path.join(root, 'adapters/kiki'), {recursive: true});
  await compile(root, ['codex']);
  await assert.rejects(compile(root, ['unknown']), /Unknown build target/);
  await assert.rejects(run(['--target'], root), /requires an id/);
  await assert.rejects(run(['--typo'], root), /Unknown argument/);
  const unsafe = await fixture(t);
  await fs.writeFile(path.join(unsafe, 'adapters/codex/build.mjs'), 'export async function render() { return new Map([["../escape.md", "escape"]]); }');
  await assert.rejects(compile(unsafe, ['codex']), /invalid or reserved output path/);
});

test('generated compatibility prompts install, check and restore through the existing installer and plugin bundle', async t => {
  const root = await fixture(t);
  await run(['--target', 'codex'], root);
  for (const dir of ['hooks', 'plugin']) await fs.cp(path.join(repo, dir), path.join(root, dir), {recursive: true});
  const bundle = await pluginBundle(root);
  for (const name of ['user', 'sub', 'agent']) assert.deepEqual(
    bundle.get(`${MARKET_ROOT}/plugins/gpt-with-taste/prompts/${name}-steer.md`),
    await fs.readFile(path.join(root, `prompts/${name}-steer.md`)));
  const home = path.join(root, 'isolated-home');
  const services = {sourceIdentity: async () => ({kind: 'unknown'})};
  const call = args => install(['--home', home, ...args], root, services);
  await call(['--skip-update-check']);
  assert.deepEqual(await fs.readFile(path.join(home, 'prompts/gpt-with-taste/main.md')),
    await fs.readFile(path.join(root, 'prompts/main.md')));
  await call(['--check']);
  await call(['--restore']);
  await assert.rejects(fs.access(path.join(home, 'config.toml')), {code: 'ENOENT'});
});
