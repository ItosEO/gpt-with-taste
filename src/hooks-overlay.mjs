import {isDeepStrictEqual as same} from 'node:util';
import {WAIT_TOOL_MATCHER} from '../hooks/local-tools.mjs';
// Event + exact command identify our groups. No substring or brand-name matching.
export const ROUTES = [
  {event: 'UserPromptSubmit'},
  {event: 'SubagentStart'},
  {event: 'PostToolUse', matcher: WAIT_TOOL_MATCHER},
];
export function hookGroup(command, matcher) {
  return {...(matcher ? {matcher} : {}), hooks: [{type: 'command', command, timeout: 15}]};
}
export function parseHooks(text) {
  let value;
  try { value = text === null ? {} : JSON.parse(text); } catch { throw new Error('hooks.json is not valid JSON'); }
  if (!value || Array.isArray(value) || typeof value !== 'object' ||
      (value.hooks !== undefined && (!value.hooks || Array.isArray(value.hooks) || typeof value.hooks !== 'object'))) {
    throw new Error('Unsupported hooks.json structure; no changes made');
  }
  return value;
}
export function selectedGroup(value, command, event = 'UserPromptSubmit') {
  const groups = value.hooks?.[event] ?? [];
  if (!Array.isArray(groups)) throw new Error(`Unsupported ${event} groups; no changes made`);
  const matches = groups.filter(group =>
    Array.isArray(group.hooks) && group.hooks.some(hook => hook.command === command));
  if (matches.length > 1) throw new Error(`Duplicate managed ${event} hook command; no changes made`);
  return matches[0] ?? null;
}
export function assertHook(value, record, recovery = false) {
  const event = record.event ?? 'UserPromptSubmit';
  const actual = selectedGroup(value, record.command, event);
  if (!same(actual, record.after) && !(recovery && (same(actual, record.before) || same(actual, record.previous)))) {
    throw new Error(`Managed ${event} hook has drifted; keep the receipt and reconcile this group before retrying`);
  }
}
export function installHook(value, command, route = ROUTES[0], original) {
  const before = selectedGroup(value, command, route.event);
  const after = hookGroup(command, route.matcher);
  if (original) assertHook(value, original);
  else if (before !== null && !same(before, after)) throw new Error(`An existing ${route.event} group uses this command with different settings; no changes made`);
  const record = {event: route.event, command, before: original ? original.before : before, after,
    previous: before, hadHooks: original ? original.hadHooks : value.hooks !== undefined,
    hadEvent: original ? original.hadEvent : value.hooks?.[route.event] !== undefined};
  if (!same(before, after)) {
    value.hooks ??= {};
    value.hooks[route.event] ??= [];
    if (before === null) value.hooks[route.event].push(after);
    else value.hooks[route.event][value.hooks[route.event].indexOf(before)] = after;
  }
  return record;
}
export function restoreHook(value, record) {
  const event = record.event ?? 'UserPromptSubmit';
  const actual = selectedGroup(value, record.command, event);
  if (same(actual, record.before)) return;
  value.hooks ??= {};
  const groups = value.hooks[event] ??= [];
  const index = groups.indexOf(actual);
  if (actual === null) groups.push(record.before);
  else if (record.before === null) groups.splice(index, 1);
  else groups[index] = record.before;
  if (!record.hadEvent && groups.length === 0) delete value.hooks[event];
  if (!record.hadHooks && Object.keys(value.hooks).length === 0) delete value.hooks;
}
export function receiptHooks(receipt) {
  return receipt?.hookGroups ?? (receipt?.hook ? [{...receipt.hook, event: 'UserPromptSubmit'}] : []);
}

// Migration disables only the old groups recorded by this installation.
// Their original pre-install value remains the recovery baseline.
export function retireHook(value, record) {
  assertHook(value, record);
  const event = record.event ?? 'UserPromptSubmit';
  const actual = selectedGroup(value, record.command, event);
  if (actual !== null) {
    value.hooks[event].splice(value.hooks[event].indexOf(actual), 1);
    if (!record.hadEvent && value.hooks[event].length === 0) delete value.hooks[event];
    if (!record.hadHooks && Object.keys(value.hooks).length === 0) delete value.hooks;
  }
  return {...record, event, previous: actual, after: null};
}
