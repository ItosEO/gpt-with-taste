import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

// Add a target only after its adapter is ready; unselected adapters are not loaded.
export const TARGETS = ['codex', 'kiki', 'claude', 'pi', 'omp', 'dsh'];
export const TEXT_KEYS = ['main', 'sub', 'independent', 'userSteer', 'subSteer', 'agentSteer'];
const json = value => JSON.stringify(value, null, 2) + '\n';

function relativePath(value) {
  return typeof value === 'string' && value.length > 0 &&
    !value.includes('\\') && !value.includes(':') &&
    !value.split('/').some(part => part === '' || part === '.' || part === '..');
}

export async function loadRecipe(root) {
  const meta = JSON.parse(await fs.readFile(path.join(root, 'recipe/manifest.json'), 'utf8'));
  if (meta.schemaVersion !== 1 || !meta.id || !meta.name || !meta.version)
    throw new Error('recipe/manifest.json requires schemaVersion 1, id, name and version');
  if (!meta.texts || Object.keys(meta.texts).length !== TEXT_KEYS.length ||
      TEXT_KEYS.some(key => !relativePath(meta.texts[key]) || !meta.texts[key].endsWith('.md')))
    throw new Error(`recipe/manifest.json texts must name Markdown files for ${TEXT_KEYS.join(', ')}`);
  const texts = {};
  for (const key of TEXT_KEYS) {
    const source = `recipe/${meta.texts[key]}`;
    const text = await fs.readFile(path.join(root, source), 'utf8');
    if (!text.trim()) throw new Error(`Empty author source: ${source}`);
    texts[key] = text;
  }
  return {meta, texts};
}

export function markdown(meta, texts, target, key) {
  // Keep the adapter interface stable; provenance belongs in build-manifest.json.
  return texts[key];
}

export async function compile(root, targets = TARGETS) {
  if (!Array.isArray(targets) || !targets.length) throw new Error('Select at least one build target');
  for (const target of targets) if (!TARGETS.includes(target)) throw new Error(`Unknown build target: ${target}`);
  const recipe = await loadRecipe(root);
  const outputs = new Map();
  for (const target of [...new Set(targets)].sort()) {
    const adapter = `adapters/${target}/build.mjs`;
    const {render} = await import(pathToFileURL(path.join(root, adapter)).href);
    const files = await render({root, ...recipe});
    if (!(files instanceof Map)) throw new Error(`${adapter} must return a Map`);
    for (const [relative, bytes] of files) {
      if (!relativePath(relative) || relative === 'build-manifest.json')
        throw new Error(`${adapter} returned an invalid or reserved output path: ${relative}`);
      if (typeof bytes !== 'string' && !Buffer.isBuffer(bytes))
        throw new Error(`${adapter} output must be string or Buffer: ${relative}`);
      outputs.set(`dist/${target}/${relative}`, bytes);
    }
    // Keep the existing installer, plugin sources and recovery receipt format unchanged.
    if (target === 'codex') for (const name of ['main', 'sub', 'user-steer', 'sub-steer', 'agent-steer']) {
      const source = `dist/codex/${name}.md`;
      if (!outputs.has(source)) throw new Error(`${adapter} is missing the compatibility source ${name}.md`);
      outputs.set(`prompts/${name}.md`, outputs.get(source));
    }
    const manifestPath = `dist/${target}/build-manifest.json`;
    const filesForTarget = [...outputs.keys()].filter(file => file.startsWith(`dist/${target}/`) ||
      (target === 'codex' && file.startsWith('prompts/')));
    outputs.set(manifestPath, json({
      schemaVersion: 1,
      recipe: {id: recipe.meta.id, version: recipe.meta.version, manifest: 'recipe/manifest.json'},
      target,
      adapter,
      sources: Object.fromEntries(TEXT_KEYS.map(key => [key, `recipe/${recipe.meta.texts[key]}`])),
      files: [...filesForTarget, manifestPath].sort(),
    }));
  }
  return new Map([...outputs].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
}
