import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {loadRecipe} from '../../src/build.mjs';

export async function consumer(target) {
  const root = path.resolve(import.meta.dirname, '../..');
  const recipe = await loadRecipe(root);
  const {render} = await import(pathToFileURL(path.join(root, `adapters/${target}/build.mjs`)));
  const files = await render({root, ...recipe});
  const scratch = path.join(root, '.tmp');
  await fs.mkdir(scratch, {recursive: true});
  const output = await fs.mkdtemp(path.join(scratch, `${target}-consumer-`));
  for (const [name, bytes] of files) {
    const file = path.join(output, name);
    await fs.mkdir(path.dirname(file), {recursive: true});
    await fs.writeFile(file, bytes);
  }
  const module = await import(pathToFileURL(path.join(output, 'index.js')));
  const sources = Object.fromEntries(await Promise.all(Object.entries(recipe.meta.texts).map(async ([key, name]) =>
    [key, (await fs.readFile(path.join(output, name), 'utf8')).trim()])));
  const ctx = {model: {provider: 'openai', id: 'gpt-fixture'}, hasUI: true,
    ui: {notify() {}}, sessionManager: {getBranch: () => entries},
    agent: {kind: 'main', id: 'Main', name: 'main', depth: 0}};
  const entries = [];
  function api() {
    const handlers = new Map();
    const commands = new Map();
    return {handlers, commands,
      on(event, fn) {
        const list = handlers.get(event) ?? [];
        list.push(fn);
        handlers.set(event, list);
      },
      registerCommand(name, command) { commands.set(name, command); },
      appendEntry(customType, data) { entries.push({type: 'custom', customType, data}); },
    };
  }
  return {root, recipe, files, output, module, sources, ctx, api, entries};
}
export async function emit(pi, name, event, ctx) {
  let result;
  for (const fn of pi.handlers.get(name) ?? []) result = await fn(event, ctx);
  return result;
}
export const user = {role: 'user', content: 'Implement the task', timestamp: 1};
export const assistant = {role: 'assistant', content: [], timestamp: 2};
export const tool = {role: 'toolResult', toolCallId: 'tool-1', toolName: 'read', content: [{type: 'text', text: 'original'}], isError: false, timestamp: 3};
export const countSteers = messages => messages.filter(message => message.customType === 'gpt-with-taste:steer').length;
