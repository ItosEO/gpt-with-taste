import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';
import {handleHook} from './steer.mjs';

test('user input receives one complete Steer and unrelated events receive none', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gpt-with-taste-hook-'));
  try {
    const file = path.join(root, 'user-steer.md');
    fs.writeFileSync(file, 'Make the ordinary choice and keep going.\n');
    const output = handleHook({hook_event_name: 'UserPromptSubmit'}, file);
    assert.deepEqual(output, {continue: true, hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: '<gpt-with-taste-steer>\nMake the ordinary choice and keep going.\n</gpt-with-taste-steer>'
    }});
    assert.deepEqual(handleHook({hook_event_name: 'PreToolUse'}, file), {continue: true});
    assert.deepEqual(handleHook({hook_event_name: 'SubagentStart'}, file), {continue: true});
  } finally { fs.rmSync(root, {recursive: true}); }
});

test('malformed input and missing Steer are visible failures', () => {
  assert.throws(() => handleHook('{'), SyntaxError);
  assert.throws(() => handleHook(null), /event object/);
  assert.throws(() => handleHook({hook_event_name: 'UserPromptSubmit'}, 'missing-user-steer.md'), /ENOENT/);
});
