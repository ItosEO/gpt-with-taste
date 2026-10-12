#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { keyLine, setInstructions, restoreInstructions } from '../src/toml-overlay.mjs';
import { parseHooks, installHook, assertHook, restoreHook } from '../src/hooks-overlay.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RECEIPT = '.gpt-with-taste/install-receipt.json';
const PROMPTS = new Map([
  ['prompts/gpt-with-taste/main.md', 'prompts/main.md'],
  ['prompts/gpt-with-taste/sub.md', 'prompts/sub.md'],
]);
const HOOK_FILES = new Map([
  ['gpt-with-taste/hooks/steer.mjs', 'hooks/steer.mjs'],
  ['gpt-with-taste/prompts/user-steer.md', 'prompts/user-steer.md'],
]);
const HELP = `GPT with Taste — Node.js 22+
  node scripts/install.mjs [--home ABSOLUTE_CODEX_HOME] [--hooks] [--dry-run]
  node scripts/install.mjs --check [--home ABSOLUTE_CODEX_HOME]
  node scripts/install.mjs --restore [--home ABSOLUTE_CODEX_HOME] [--dry-run]
  --replace-managed  Explicitly replace conflicting managed files.
Default home: CODEX_HOME, otherwise ~/.codex. Default install: prompts only.
--hooks adds one UserPromptSubmit command; approve its trust in Codex.
Recovery receipt: ${RECEIPT} in this clone. Keep it until you restore.
`;
function fail(message) { throw new Error(message); }
function equal(a, b) { return a === null ? b === null : b !== null && a.equals(b); }
function decode(bytes) { return bytes === null ? '' : new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes); }
function encode(bytes) { return bytes === null ? null : bytes.toString('base64'); }
function unpack(value) { return value === null ? null : Buffer.from(value, 'base64'); }
function json(value) { return Buffer.from(JSON.stringify(value, null, 2) + '\n'); }
function command(home) {
  const quote = value => process.platform === 'win32' ? `"${value.replaceAll('\\', '/')}"` : `'${value.replaceAll("'", "'\\''")}'`;
  return `${quote(process.execPath)} ${quote(path.join(home, 'gpt-with-taste/hooks/steer.mjs'))}`;
}
async function read(file) {
  try {
    const stat = await fs.lstat(file);
    if (!stat.isFile() || stat.isSymbolicLink()) fail(`Not a regular file: ${file}`);
    return await fs.readFile(file);
  } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
async function write(file, bytes) {
  if (bytes === null) { await fs.unlink(file).catch(error => { if (error.code !== 'ENOENT') throw error; }); return; }
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.gpt-with-taste-${process.pid}.tmp`;
  try { await fs.writeFile(temp, bytes, { flag: 'wx', mode: 0o600 }); await fs.rename(temp, file); }
  finally { await fs.unlink(temp).catch(error => { if (error.code !== 'ENOENT') throw error; }); }
}
async function cas(file, before, after) {
  if (!equal(await read(file), before)) fail(`Changed during operation; no overwrite: ${file}`);
  if (!equal(before, after)) await write(file, after);
}
function parse(args) {
  const options = { mode: 'install', home: process.env.CODEX_HOME || path.join(os.homedir(), '.codex') };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--home') { if (!args[i + 1] || args[i + 1].startsWith('--')) fail('--home requires an absolute directory'); options.home = args[++i]; }
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--check' || arg === '--restore') { if (options.mode !== 'install') fail('Choose only one of --check and --restore'); options.mode = arg.slice(2); }
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--replace-managed') options.replace = true;
    else if (arg === '--hooks') options.hooks = true;
    else fail(`Unknown argument: ${arg}`);
  }
  if (!path.isAbsolute(options.home)) fail('--home / CODEX_HOME must be an absolute directory');
  options.home = path.resolve(options.home);
  if (options.mode !== 'install' && (options.replace || options.hooks)) fail('--hooks and --replace-managed are install options');
  return options;
}
async function loadReceipt(file, home) {
  const bytes = await read(file);
  if (bytes === null) return { bytes, receipt: null };
  let receipt;
  try { receipt = JSON.parse(decode(bytes)); } catch { fail('Unreadable recovery receipt; keep it for manual recovery'); }
  const allowed = new Set([...PROMPTS.keys(), ...HOOK_FILES.keys()]);
  if (receipt.version !== 1 || receipt.home !== home || !['applying', 'applied', 'restoring', 'restored'].includes(receipt.status) ||
      !Array.isArray(receipt.files) || receipt.files.some(entry => !allowed.has(entry.path)) ||
      new Set(receipt.files.map(entry => entry.path)).size !== receipt.files.length ||
      !receipt.config || typeof receipt.config.after !== 'string' ||
      !(receipt.config.before === null || typeof receipt.config.before === 'string')) {
    fail('Receipt belongs to another home or has an unsupported format; use its original clone and home');
  }
  return { bytes, receipt };
}
async function inspect(home, receipt, recovery = false) {
  const configPath = path.join(home, 'config.toml');
  const configBytes = await read(configPath);
  const configText = decode(configBytes);
  const line = keyLine(configText);
  if (line !== receipt.config.after && !(recovery && (line === receipt.config.before || line === receipt.config.previous))) {
    fail('Managed config key has drifted: model_instructions_file. Keep the receipt and reconcile this key before retrying.');
  }
  const files = [];
  for (const entry of receipt.files) {
    const file = path.join(home, entry.path);
    const bytes = await read(file);
    if (!equal(bytes, unpack(entry.after)) && !(recovery && (equal(bytes, unpack(entry.before)) ||
        (Object.hasOwn(entry, 'previous') && equal(bytes, unpack(entry.previous)))))) {
      fail(`Managed file has drifted; no overwrite: ${file}`);
    }
    files.push({ file, bytes, entry });
  }
  let hooks;
  if (receipt.hook) {
    const file = path.join(home, 'hooks.json');
    const bytes = await read(file);
    const value = parseHooks(bytes === null ? null : decode(bytes));
    assertHook(value, receipt.hook, recovery);
    hooks = { file, bytes, value };
  }
  return { configPath, configBytes, configText, line, files, hooks };
}
export async function run(args = process.argv.slice(2), root = ROOT) {
  if (Number(process.versions.node.split('.')[0]) < 22) fail('Node.js 22 or newer is required');
  const options = parse(args);
  if (options.help) { console.log(HELP); return; }
  const receiptPath = path.join(root, RECEIPT);
  const saved = await loadReceipt(receiptPath, options.home);
  const active = saved.receipt && saved.receipt.status !== 'restored' ? saved.receipt : null;
  if (options.mode === 'check') {
    if (!active) fail('No active installation receipt in this clone');
    if (active.status !== 'applied') fail('Installation was interrupted; run --restore');
    await inspect(options.home, active);
    console.log(`Checked ${active.hook ? 'prompt + hook' : 'prompt-only'} installation: ${options.home}`);
    return;
  }
  if (options.mode === 'restore') {
    if (!active) fail('No active installation receipt in this clone');
    const current = await inspect(options.home, active, active.status !== 'applied');
    const restored = current.line === active.config.before ? current.configText : restoreInstructions(current.configText, active.config.before);
    const restoredBytes = active.config.fileWasAbsent && restored === '' ? null : Buffer.from(restored);
    let hooksAfter;
    if (current.hooks) {
      restoreHook(current.hooks.value, active.hook);
      hooksAfter = active.hook.fileWasAbsent && Object.keys(current.hooks.value).length === 0 ? null : json(current.hooks.value);
    }
    if (options.dryRun) { console.log(`Would restore managed files, model_instructions_file${active.hook ? ' and one hook group' : ''}: ${options.home}`); return; }
    const pending = json({ ...active, status: 'restoring' });
    await cas(receiptPath, saved.bytes, pending);
    for (const item of current.files) await cas(item.file, item.bytes, unpack(item.entry.before));
    await cas(current.configPath, current.configBytes, restoredBytes);
    if (current.hooks) await cas(current.hooks.file, current.hooks.bytes, hooksAfter);
    await cas(receiptPath, pending, json({ ...active, status: 'restored' }));
    console.log(`Restored managed installation: ${options.home}`);
    return;
  }
  if (active && active.status !== 'applied') fail('Previous operation was interrupted; run --restore before installing again');
  if (active) await inspect(options.home, options.hooks ? active : { ...active, files: active.files.filter(entry => PROMPTS.has(entry.path)), hook: undefined });
  const configPath = path.join(options.home, 'config.toml');
  const configBefore = await read(configPath);
  const configText = decode(configBefore);
  if (active && keyLine(configText) !== active.config.after) fail('Managed config key changed during planning; no overwrite');
  const configAfter = Buffer.from(setInstructions(configText, path.join(options.home, [...PROMPTS.keys()][0])));
  const files = [];
  const withHooks = Boolean(options.hooks);
  const targets = new Map([...PROMPTS, ...(withHooks ? HOOK_FILES : [])]);
  for (const [target, source] of targets) {
    const after = await read(path.join(root, source));
    if (after === null || after.length === 0) fail(`Missing or empty bundled source: ${source}`);
    const file = path.join(options.home, target);
    const before = await read(file);
    const prior = active?.files.find(entry => entry.path === target);
    if (prior && !equal(before, unpack(prior.after))) fail(`Managed file changed during planning; no overwrite: ${file}`);
    if (!prior && before !== null && !equal(before, after) && !options.replace) {
      fail(`Unknown managed target already exists: ${file}. Review it, then use --replace-managed to preserve and replace it.`);
    }
    files.push({ path: target, file, before, after });
  }
  let hooks;
  if (withHooks) {
    const file = path.join(options.home, 'hooks.json');
    const before = await read(file);
    const value = parseHooks(before === null ? null : decode(before));
    if (active?.hook) assertHook(value, active.hook);
    const record = active?.hook ?? { ...installHook(value, command(options.home)), fileWasAbsent: before === null };
    hooks = { file, before, after: active?.hook ? before : json(value), record };
  }
  if (options.dryRun) { console.log(`Would install ${withHooks ? 'prompt + hook' : 'prompt-only'}: ${options.home}\nManaged config key: model_instructions_file\nManaged files: ${[...targets.keys()].join(', ')}`); return; }
  if (active && [...targets.keys()].every(target => active.files.some(entry => entry.path === target)) && (!withHooks || active.hook) &&
      equal(configBefore, configAfter) && files.every(item => equal(item.before, item.after)) && (!hooks || equal(hooks.before, hooks.after))) {
    console.log(`Already installed; original recovery receipt retained: ${options.home}`); return;
  }
  const receipt = {
    version: 1, status: 'applying', home: options.home,
    config: { before: active ? active.config.before : keyLine(configText), after: keyLine(decode(configAfter)), previous: keyLine(configText), fileWasAbsent: active ? active.config.fileWasAbsent : configBefore === null },
    files: [
      ...(active?.files.filter(entry => !targets.has(entry.path)) ?? []),
      ...files.map(item => {
        const original = active?.files.find(entry => entry.path === item.path);
        return { path: item.path, before: original ? original.before : encode(item.before), after: encode(item.after), previous: encode(item.before) };
      }),
    ],
    ...(hooks || active?.hook ? { hook: hooks ? hooks.record : active.hook } : {}),
  };
  const pending = json(receipt);
  await cas(receiptPath, saved.bytes, pending);
  try {
    for (const item of files) await cas(item.file, item.before, item.after);
    await cas(configPath, configBefore, configAfter);
    if (hooks) await cas(hooks.file, hooks.before, hooks.after);
    const applied = { ...receipt, status: 'applied', config: { ...receipt.config }, files: receipt.files.map(item => ({ ...item })) };
    delete applied.config.previous;
    for (const item of applied.files) delete item.previous;
    await cas(receiptPath, pending, json(applied));
  } catch (error) {
    throw new Error(`${error.message}\nRecovery receipt retained. Run --restore with the same --home.`);
  }
  console.log(`Installed ${withHooks ? 'prompt + hook' : 'prompt-only'}: ${options.home}\nOpen a new Codex session.${withHooks ? ' Approve only the installed hook command in Codex.' : ''}\nRecovery: node scripts/install.mjs --restore --home ${JSON.stringify(options.home)}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  run().catch(error => { console.error(`GPT with Taste: ${error.message}`); process.exitCode = 1; });
}
