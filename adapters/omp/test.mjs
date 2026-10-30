import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {consumer, emit, user, assistant, tool, countSteers} from '../pi/fixture.mjs';

const {module, sources, files, recipe, api, ctx, output} = await consumer('omp');
const omp = api();
module.default(omp);
const taste = omp.commands.get('taste');
const complete = taste.getArgumentCompletions;
const completionValues = prefix => complete(prefix)?.map(item => item.value) ?? null;
assert.deepEqual(completionValues(''), ['status', 'on', 'off', 'steer on', 'steer off', 'reset']);
assert.deepEqual(completionValues('st'), ['status', 'steer on', 'steer off']);
assert.deepEqual(completionValues('steer '), ['steer on', 'steer off']);
assert.deepEqual(completionValues('steer of'), ['steer off']);
assert.equal(complete('unknown'), null);
assert.ok(complete('').every(item => item.label === item.value && item.description));
assert.deepEqual([...omp.handlers.keys()], ['before_agent_start', 'context', 'tool_result', 'before_provider_request']);
assert.throws(() => module.default(omp), /only one/);
assert.equal(omp.handlers.get('context').length, 1);
for (const [key, name] of Object.entries(recipe.meta.texts)) assert.ok(files.get(name).endsWith(recipe.texts[key]));
const host = ['HOST BUILTIN TOOLS', '<project-context>HOST ENVIRONMENT</project-context>', 'HOST CHILD ASSIGNMENT'];
const prepare = (systemPrompt = host, runtime = omp, context = ctx) => emit(runtime, 'before_agent_start', {systemPrompt, prompt: 'task'}, context);
const prepared = await prepare();
assert.deepEqual(prepared.systemPrompt.slice(0, 3), host);
assert.equal(prepared.systemPrompt.length, 4);
assert.ok(prepared.systemPrompt[3].includes(sources.main));
assert.deepEqual((await prepare(prepared.systemPrompt)).systemPrompt, prepared.systemPrompt);
assert.equal(host.length, 3);
const project = async (messages, runtime = omp, context = ctx) => (await emit(runtime, 'context', {messages}, context)).messages;
const input = [user];
const projected = await project(input);
assert.equal(input.length, 1);
assert.equal(countSteers(projected), 1);
assert.ok(projected[1].content.includes(sources.userSteer));
assert.deepEqual(await project(projected), projected);
assert.equal(countSteers(await project([user, assistant, tool])), 0);
assert.equal(countSteers(await project([user, assistant, tool, {...user, timestamp: 4}])), 1);

const childCtx = {...ctx, agent: {kind: 'sub', id: 'Child', name: 'task', depth: 0, parentId: 'Main'}};
const child = api();
module.default(child);
const childPrompt = await prepare(host, child, childCtx);
assert.deepEqual(childPrompt.systemPrompt.slice(0, 3), host);
assert.ok(childPrompt.systemPrompt[3].includes(sources.sub));
const childMessages = await project([user], child, childCtx);
assert.ok(childMessages[1].content.includes(sources.subSteer));
assert.ok(!childMessages[1].content.includes(sources.userSteer));
await assert.rejects(prepare(host, child, {...ctx, agent: undefined}), /agent identity/);
const independentEntry = await import(pathToFileURL(path.join(output, 'independent.js')));
const independent = api();
independentEntry.default(independent);
const independentPrompt = (await prepare(host, independent)).systemPrompt;
assert.ok(independentPrompt[3].includes(sources.independent));
assert.ok(!independentPrompt[3].includes(sources.sub));
assert.equal(countSteers(await project([user], independent)), 0);

// R1: OMP rebinds the root's factory for native Task and depth-zero /tan
// sessions. Native child identity wins even over an explicit root role.
for (const factory of [independentEntry.default,
  module.createTasteExtension({role: 'main'}), module.createTasteExtension({role: 'sub'})]) {
  for (const agent of [
    {kind: 'sub', id: 'TaskChild', name: 'task', depth: 1, parentId: 'Main'},
    {kind: 'sub', id: 'TanChild', name: 'sub', depth: 0, parentId: 'Main'},
  ]) {
    const rebound = api();
    factory(rebound);
    const nativeChild = {...ctx, agent};
    const prompt = (await prepare(independentPrompt, rebound, nativeChild)).systemPrompt;
    assert.deepEqual(prompt.slice(0, 3), host);
    assert.equal(prompt.length, 4);
    assert.ok(prompt[3].includes(sources.sub));
    assert.ok(!prompt[3].includes(sources.main));
    assert.ok(!prompt[3].includes(sources.independent));
    const messages = await project([user], rebound, nativeChild);
    assert.equal(countSteers(messages), 1);
    assert.ok(messages[1].content.includes(sources.subSteer));
    assert.ok(!messages[1].content.includes(sources.userSteer));
  }
}

const result = {toolName: 'task', toolCallId: 'task-1', content: [{type: 'text', text: 'original child output'}],
  details: {results: [{exitCode: 0, output: 'finished'}], totalDurationMs: 10}, isError: false};
const original = structuredClone(result);
assert.deepEqual(await emit(omp, 'tool_result', result, ctx), {additionalContext: sources.agentSteer});
assert.deepEqual(result, original);
assert.equal(await emit(child, 'tool_result', result, childCtx), undefined);
for (const event of [
  {...result, toolName: 'bash'}, {...result, isError: true},
  {...result, details: {results: []}},
  {...result, details: {results: [{exitCode: 1}]}},
  {...result, details: {results: [{exitCode: 0, aborted: true}]}},
  {...result, details: {results: [{exitCode: 0, error: 'timeout'}]}},
  {...result, details: {results: [{exitCode: 0}], async: {state: 'running', jobId: 'job', type: 'task'}}},
  {...result, details: {status: 'completed'}},
]) assert.equal(await emit(omp, 'tool_result', event, ctx), undefined);

const delivery = {role: 'custom', customType: 'async-result', attribution: 'agent', display: true,
  content: 'original async result', details: {jobs: [{jobId: 'job-1', type: 'task', status: 'completed'}]}, timestamp: 4};
const delivered = await project([assistant, delivery]);
assert.equal(delivered[1], delivery);
assert.ok(delivered[2].content.includes(sources.agentSteer));
assert.equal(countSteers(await project([assistant, delivery], child, childCtx)), 0);
for (const message of [
  {...delivery, details: {jobs: [{type: 'bash', status: 'completed'}]}},
  {...delivery, details: {jobs: [{type: 'task', status: 'failed'}]}},
  {...delivery, details: {jobs: [{type: 'task', status: 'running'}]}},
  {...delivery, attribution: 'user'}, {...delivery, details: {jobs: []}},
]) assert.equal(countSteers(await project([assistant, message])), 0);
const payload = {model: 'gpt-fixture', instructions: 'HOST SYSTEM', input: [], tools: [{name: 'task'}]};
const guarded = await emit(child, 'before_provider_request', {payload}, childCtx);
assert.ok(guarded.instructions.startsWith('HOST SYSTEM'));
assert.ok(guarded.instructions.includes(sources.sub));
assert.deepEqual(guarded.tools, payload.tools);
assert.equal(payload.instructions, 'HOST SYSTEM');
assert.equal(await emit(child, 'before_provider_request', {payload: guarded}, childCtx), undefined);
await omp.commands.get('taste').handler('off', ctx);
assert.deepEqual((await prepare(prepared.systemPrompt)).systemPrompt, host);
assert.equal(countSteers(await project(projected)), 0);
assert.equal(await emit(omp, 'tool_result', result, ctx), undefined);
await omp.commands.get('taste').handler('reset', ctx);
assert.equal(countSteers(await project([user])), 1);
console.log('OMP consumer fixture passed: generated source, native Main/Sub at depth 0, host blocks, settled Task/async routing, original results, duplicate/off/reset.');
