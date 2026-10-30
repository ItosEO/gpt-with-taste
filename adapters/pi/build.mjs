import fs from 'node:fs/promises';
import path from 'node:path';
import {markdown, TEXT_KEYS} from '../../src/build.mjs';

export async function render({root, meta, texts}) {
  const files = new Map(TEXT_KEYS.map(key => [meta.texts[key], markdown(meta, texts, 'pi', key)]));
  for (const file of ['runtime.mjs', 'projection.mjs', 'payload.mjs', 'THIRD_PARTY_LICENSE'])
    files.set(file, await fs.readFile(path.join(root, 'adapters/pi/runtime', file)));
  files.set('texts.json', JSON.stringify(meta.texts, null, 2) + '\n');
  files.set('index.js', "// Generated entry; edit adapters/pi/, then rebuild.\nexport {default, createTasteExtension} from './runtime.mjs';\n");
  for (const role of ['sub', 'independent']) files.set(`${role}.js`,
    `// Generated explicit-role entry.\nimport {createTasteExtension} from './runtime.mjs';\nexport default createTasteExtension({role: '${role}'});\n`);
  files.set('package.json', JSON.stringify({name: 'gpt-with-taste-pi', version: meta.version,
    private: true, type: 'module', license: 'MIT', engines: {node: '>=22.19.0'},
    pi: {extensions: ['./index.js']}, exports: {'.': './index.js', './integration': './runtime.mjs'}}, null, 2) + '\n');
  files.set('PROVENANCE.md', `# Adapter provenance\n\nBehavior is generated from recipe/ (${meta.id} ${meta.version}). Runtime reads texts.json and its six generated Markdown files.\n\nPi transport adapts projection.ts, payload.ts and extension.ts from [SpadeLushen/pi-gpt-with-taste](https://github.com/SpadeLushen/pi-gpt-with-taste/tree/07013409c19fe307d0a951ef5f2b3f72f4c837b3), MIT. THIRD_PARTY_LICENSE preserves its full license.\n\nChanges: dependency-free JavaScript, compiler-owned resources, independent role, factory scope options, compact branch controls and duplicate-registration guard. Request-local section, unanswered-input projection, completion-only custom message routing and OpenAI final-payload recovery retain the reference mechanisms. No behavior Markdown or TOML helper was copied from that repository.\n`);
  return files;
}
