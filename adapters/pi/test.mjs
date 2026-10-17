import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {consumer, emit, user, assistant, tool, countSteers} from './fixture.mjs';

const fixture = await consumer('pi');
const {module, sources, files, recipe, api, ctx, root} = fixture;
const manifest = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
assert.deepEqual(manifest.pi.extensions, ['./dist/pi/index.js']);
const installed = await import(pathToFileURL(path.resolve(root, manifest.pi.extensions[0])));
const packageApi = api();
installed.default(packageApi);
assert.deepEqual([...packageApi.handlers.keys()], ['context_with_system', 'before_provider_request']);
assert.ok(packageApi.commands.has('taste'));
const fromPackage = await emit(packageApi, 'context_with_system', {messages: [
  {role: 'system', content: '', sections: {host: 'HOST'}}, user,
]}, ctx);
assert.ok(fromPackage.messages[0].sections.gpt_with_taste.includes(sources.main));
assert.ok(fromPackage.messages[2].content.includes(sources.userSteer));
const pi = api();
module.default(pi);
assert.deepEqual([...pi.handlers.keys()], ['context_with_system', 'before_provider_request']);
assert.equal(pi.commands.size, 1);
assert.throws(() => module.default(pi), /only one/);
assert.equal(pi.handlers.get('context_with_system').length, 1);
for (const [key, name] of Object.entries(recipe.meta.texts)) assert.ok(files.get(name).endsWith(recipe.texts[key]));
const system = {role: 'system', content: '', sections: {host: 'HOST TOOLS AND PERMISSIONS'}, timestamp: 0};
const input = [system, user];
const original = structuredClone(input);
const project = async (messages, runtime = pi, context = ctx) =>
  (await emit(runtime, 'context_with_system', {messages}, context)).messages;
const projected = await project(input);
assert.deepEqual(input, original);
assert.equal(projected[0].sections.host, system.sections.host);
assert.ok(projected[0].sections.gpt_with_taste.includes(sources.main));
assert.equal(countSteers(projected), 1);
assert.ok(projected[2].content.includes(sources.userSteer));
assert.deepEqual(await project(projected), projected);
assert.equal(countSteers(await project([system, user, assistant, tool])), 0);
assert.equal(countSteers(await project([system, user, assistant, tool, {...user, timestamp: 4}])), 1);
const excluded = await project(input, pi, {...ctx, model: {provider: 'anthropic', id: 'gpt-fixture'}});
assert.equal(excluded[0].sections.gpt_with_taste, undefined);
assert.equal(countSteers(excluded), 0);

const sub = api();
module.createTasteExtension({role: 'sub'})(sub);
const subMessages = await project(input, sub);
assert.ok(subMessages[0].sections.gpt_with_taste.includes(sources.sub));
assert.ok(subMessages[2].content.includes(sources.subSteer));
assert.ok(!subMessages[2].content.includes(sources.userSteer));
const independent = api();
module.createTasteExtension({role: 'independent'})(independent);
const independentMessages = await project(input, independent);
assert.ok(independentMessages[0].sections.gpt_with_taste.includes(sources.independent));
assert.equal(countSteers(independentMessages), 0);

const parent = api();
module.createTasteExtension({completedResultTypes: ['fixture:completed']})(parent);
const result = {role: 'custom', customType: 'fixture:completed', content: 'Untouched result', display: true, timestamp: 4};
const completed = await project([system, assistant, result], parent);
assert.equal(completed[2], result);
assert.ok(completed[3].content.includes(sources.agentSteer));
for (const type of ['fixture:progress', 'fixture:timeout', 'fixture:error', 'fixture:background-handle'])
  assert.equal(countSteers(await project([system, assistant, {...result, customType: type}], parent)), 0);
assert.equal(pi.handlers.has('tool_result'), false);

for (const payload of [
  {model: 'gpt-fixture', instructions: 'HOST PERMISSIONS', input: [{role: 'user', content: 'input'}], tools: [{name: 'read'}]},
  {model: 'gpt-fixture', messages: [{role: 'developer', content: 'HOST PERMISSIONS', keep: 1}, {role: 'user', content: 'input'}], tools: [{name: 'read'}]},
  {model: 'gpt-fixture', messages: [{role: 'system', content: [{type: 'text', text: 'HOST PERMISSIONS'}]}]},
]) {
  const snapshot = structuredClone(payload);
  const guarded = await emit(pi, 'before_provider_request', {payload}, ctx);
  assert.ok(JSON.stringify(guarded).includes('HOST PERMISSIONS'));
  assert.ok(JSON.stringify(guarded).includes('gpt-with-taste'));
  assert.deepEqual(guarded.tools, payload.tools);
  assert.deepEqual(payload, snapshot);
  assert.equal(await emit(pi, 'before_provider_request', {payload: guarded}, ctx), undefined);
}
assert.equal(await emit(pi, 'before_provider_request', {payload: {model: 'gpt-fixture', unknown: []}}, ctx), undefined);
await pi.commands.get('taste').handler('off', ctx);
const off = await project(projected);
assert.equal(off[0].sections.gpt_with_taste, undefined);
assert.equal(countSteers(off), 0);
assert.equal(await emit(pi, 'before_provider_request', {payload: {model: 'x', input: []}}, ctx), undefined);
await pi.commands.get('taste').handler('reset', ctx);
assert.equal(countSteers(await project(input)), 1);
console.log('Pi consumer fixture passed: generated source, Main/Sub/Independent, input/completion isolation, payload preservation, duplicate/off/reset.');
