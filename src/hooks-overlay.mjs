// Only this exact command is managed; other hook groups are never selected by name or substring.
export function hookGroup(command) {
  return { hooks: [{ type: 'command', command, timeout: 15 }] };
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export function parseHooks(text) {
  let value;
  try { value = text === null ? {} : JSON.parse(text); } catch { throw new Error('hooks.json is not valid JSON'); }
  if (!value || Array.isArray(value) || typeof value !== 'object' ||
      (value.hooks !== undefined && (!value.hooks || Array.isArray(value.hooks) || typeof value.hooks !== 'object')) ||
      (value.hooks?.UserPromptSubmit !== undefined && !Array.isArray(value.hooks.UserPromptSubmit))) {
    throw new Error('Unsupported hooks.json structure; no changes made');
  }
  return value;
}
export function selectedGroup(value, command) {
  const matches = (value.hooks?.UserPromptSubmit ?? []).filter(group =>
    group.hooks?.some(hook => hook.command === command));
  if (matches.length > 1) throw new Error('Duplicate managed hook command; no changes made');
  return matches[0] ?? null;
}
export function assertHook(value, record, allowBefore = false) {
  const actual = selectedGroup(value, record.command);
  if (!same(actual, record.after) && !(allowBefore && same(actual, record.before))) {
    throw new Error('Managed UserPromptSubmit hook has drifted; keep the receipt and reconcile this group before retrying');
  }
}
export function installHook(value, command) {
  const before = selectedGroup(value, command);
  const after = hookGroup(command);
  if (before !== null && !same(before, after)) throw new Error('An existing group uses this command with different settings; no changes made');
  const record = { command, before, after, hadHooks: value.hooks !== undefined, hadEvent: value.hooks?.UserPromptSubmit !== undefined };
  if (before === null) {
    value.hooks ??= {};
    value.hooks.UserPromptSubmit ??= [];
    value.hooks.UserPromptSubmit.push(after);
  }
  return record;
}
export function restoreHook(value, record) {
  const actual = selectedGroup(value, record.command);
  if (same(actual, record.before)) return;
  const groups = value.hooks.UserPromptSubmit;
  const index = groups.indexOf(actual);
  if (record.before === null) groups.splice(index, 1);
  else groups[index] = record.before;
  if (!record.hadEvent && groups.length === 0) delete value.hooks.UserPromptSubmit;
  if (!record.hadHooks && Object.keys(value.hooks).length === 0) delete value.hooks;
}
