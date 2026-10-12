#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function handleHook(raw, steeringFile = path.join(root, 'prompts/user-steer.md')) {
  const event = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!event || typeof event !== 'object' || Array.isArray(event)) throw new Error('Expected a Codex hook event object');
  if (event.hook_event_name !== 'UserPromptSubmit') return {continue: true};
  const text = fs.readFileSync(steeringFile, 'utf8').trim();
  if (!text) throw new Error('The user Steer file is empty');
  return {continue: true, hookSpecificOutput: {
    hookEventName: 'UserPromptSubmit',
    additionalContext: `<gpt-with-taste-steer>\n${text}\n</gpt-with-taste-steer>`
  }};
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    let input = '';
    for await (const chunk of process.stdin) input += chunk;
    const event = JSON.parse(input);
    const response = handleHook(event);
    if (process.env.GPT_WITH_TASTE_HOOK_AUDIT) {
      const record = {event: event.hook_event_name, sessionId: event.session_id ?? null,
        turnId: event.turn_id ?? null, injected: Boolean(response.hookSpecificOutput)};
      fs.appendFileSync(process.env.GPT_WITH_TASTE_HOOK_AUDIT, JSON.stringify(record) + '\n');
    }
    process.stdout.write(JSON.stringify(response) + '\n');
  } catch (error) {
    process.stderr.write(`GPT with Taste Hook: ${error.message}\n`);
    process.exitCode = 1;
  }
}
