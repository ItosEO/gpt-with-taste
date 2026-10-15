import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const json = value => `${JSON.stringify(value, null, 2)}\n`;

/** Render paths relative to dist/claude. Behavior text comes only from the recipe. */
export async function render({ root, meta, texts }) {
  const files = new Map([
    ['main.md', texts.main],
    ['independent.md', texts.independent],
  ]);
  const runtime = await readFile(join(root, 'adapters/claude/hook.mjs'), 'utf8');
  const agent = [
    '---',
    'name: taste-worker',
    'description: Own a bounded task with judgment, craft, and verification.',
    'disallowedTools: [Agent]',
    '---',
    '',
    texts.sub,
  ].join('\n');

  for (const [directory, mode] of [['plugin', 'steer'], ['prompt-only', 'prompts']]) {
    const command = {
      type: 'command',
      command: 'node',
      args: ['${CLAUDE_PLUGIN_ROOT}/scripts/hook.mjs', mode],
      timeout: 10,
    };
    const hooks = { SubagentStart: [{ hooks: [command] }] };
    if (mode === 'steer') {
      hooks.UserPromptSubmit = [{ hooks: [command] }];
      hooks.PostToolUse = [{ matcher: 'Agent', hooks: [command] }];
    }
    const manifest = {
      name: meta.id,
      version: meta.version,
      description: meta.description,
      author: { name: 'NB Corp' },
      license: 'MIT',
    };
    files.set(`${directory}/.claude-plugin/plugin.json`, json(manifest));
    files.set(`${directory}/hooks/hooks.json`, json({ hooks }));
    files.set(`${directory}/agents/taste-worker.md`, agent);
    files.set(`${directory}/scripts/hook.mjs`, runtime);
    files.set(`${directory}/texts/sub.md`, texts.sub);
    if (mode === 'steer') {
      files.set(`${directory}/texts/user-steer.md`, texts.userSteer);
      files.set(`${directory}/texts/sub-steer.md`, texts.subSteer);
      files.set(`${directory}/texts/agent-steer.md`, texts.agentSteer);
    }
  }
  return files;
}
