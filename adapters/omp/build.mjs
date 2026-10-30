import fs from 'node:fs/promises';
import path from 'node:path';
import {markdown, TEXT_KEYS} from '../../src/build.mjs';

export async function render({root, meta, texts}) {
  const files = new Map(TEXT_KEYS.map(key => [meta.texts[key], markdown(meta, texts, 'omp', key)]));
  files.set('runtime.mjs', await fs.readFile(path.join(root, 'adapters/omp/runtime/runtime.mjs')));
  // Share the source implementation, not a hand-maintained second payload guard.
  for (const file of ['payload.mjs', 'THIRD_PARTY_LICENSE'])
    files.set(file, await fs.readFile(path.join(root, 'adapters/pi/runtime', file)));
  files.set('texts.json', JSON.stringify(meta.texts, null, 2) + '\n');
  files.set('index.js', "// Generated entry; edit adapters/omp/, then rebuild.\nexport {default, createTasteExtension} from './runtime.mjs';\n");
  files.set('independent.js', "// Generated explicit-role entry.\nimport {createTasteExtension} from './runtime.mjs';\nexport default createTasteExtension({role: 'independent'});\n");
  files.set('package.json', JSON.stringify({name: 'gpt-with-taste-omp', version: meta.version,
    private: true, type: 'module', license: 'MIT', omp: {extensions: ['./index.js']},
    exports: {'.': './index.js', './integration': './runtime.mjs'}}, null, 2) + '\n');
  files.set('PROVENANCE.md', `# Adapter provenance\n\nBehavior is generated from recipe/ (${meta.id} ${meta.version}). Runtime reads texts.json and its six generated Markdown files.\n\nThe OpenAI payload guard and request-local unanswered-input approach adapt [SpadeLushen/pi-gpt-with-taste](https://github.com/SpadeLushen/pi-gpt-with-taste/tree/07013409c19fe307d0a951ef5f2b3f72f4c837b3), MIT. THIRD_PARTY_LICENSE preserves its full license. The guard is compiled from the same source as the Pi adapter.\n\nOMP-specific code uses 18.11.0 native ctx.agent.kind, before_agent_start system-block augmentation, task SingleResult exitCode/error/aborted, async-result jobs type/status, and tool_result.additionalContext. It does not replace the bundled instruction template or copy OMP's system prompt.\n`);
  return files;
}
