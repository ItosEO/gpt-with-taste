import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const pluginRoot = new URL('../', import.meta.url);

/** Return only additive context. The original event and tool result stay intact. */
export async function route(event, { mode = 'steer', load = loadText } = {}) {
  if (!event || typeof event !== 'object' || Array.isArray(event)) {
    throw new TypeError('Expected a Claude hook event object');
  }
  if (mode !== 'steer' && mode !== 'prompts') {
    throw new Error(`Unknown hook mode: ${mode}`);
  }

  let names = [];
  if (event.hook_event_name === 'SubagentStart') {
    // This native agent already carries the complete Sub body in its Markdown.
    if (event.agent_type !== 'gpt-with-taste:taste-worker') names.push('sub');
    if (mode === 'steer') names.push('sub-steer');
  } else if (mode === 'steer' && event.hook_event_name === 'UserPromptSubmit') {
    // agent_type alone can name the top-level --agent session, not a child.
    names = [event.agent_id || event.caller_session_id ? 'sub-steer' : 'user-steer'];
  } else if (mode === 'steer' && event.hook_event_name === 'PostToolUse'
      && event.tool_name === 'Agent' && event.tool_response?.status === 'completed') {
    names = [event.agent_id || event.caller_session_id ? 'sub-steer' : 'agent-steer'];
  }

  if (names.length === 0) return {};
  const additionalContext = (await Promise.all(names.map(load))).join('\n\n');
  return {
    hookSpecificOutput: { hookEventName: event.hook_event_name, additionalContext },
  };
}

function loadText(name) {
  return readFile(new URL(`texts/${name}.md`, pluginRoot), 'utf8');
}

async function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) input += chunk;
  if (!input.trim()) return;
  const output = await route(JSON.parse(input), { mode: process.argv[2] });
  process.stdout.write(`${JSON.stringify(output)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    // Exit 1 is a visible non-blocking hook error; do not block the user's action.
    process.stderr.write(`GPT with Taste hook: ${error.message}\n`);
    process.exitCode = 1;
  });
}
