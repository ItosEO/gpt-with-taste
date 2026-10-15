// Adapted from nb-codex-main/src/toml-overlay.mjs (MIT).
// Copyright (c) 2026 X-T-E-R. See ../LICENSE.
// This slice manages only top-level model_instructions_file.
function fail(message) { throw new Error(message); }
function isEscaped(value, index) {
  let slashes = 0;
  for (let cursor = index - 1; cursor >= 0 && value[cursor] === '\\'; cursor -= 1) slashes += 1;
  return slashes % 2 === 1;
}
function lexLine(raw, activeMultiline) {
  if (activeMultiline) {
    const closeAt = raw.indexOf(activeMultiline);
    return { code: '', depthDelta: 0, multiline: closeAt >= 0 ? null : activeMultiline, wasMultiline: true };
  }
  let quote = null;
  let code = '';
  let depthDelta = 0;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    const triple = raw.slice(index, index + 3);
    if (!quote && (triple === '\"\"\"' || triple === "'''")) {
      const closeAt = raw.indexOf(triple, index + 3);
      if (closeAt < 0) return { code, depthDelta, multiline: triple, wasMultiline: false };
      code += raw.slice(index, closeAt + 3);
      index = closeAt + 2;
      continue;
    }
    if (!quote && char === '#') break;
    if (!quote && (char === '"' || char === "'")) quote = char;
    else if (quote === char && (quote === "'" || !isEscaped(raw, index))) quote = null;
    if (!quote) {
      if (char === '[' || char === '{') depthDelta += 1;
      if (char === ']' || char === '}') depthDelta -= 1;
    }
    code += char;
  }
  return { code, depthDelta, multiline: null, wasMultiline: false };
}
function findEquals(value) {
  let quote = null;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (!quote && (char === '"' || char === "'")) quote = char;
    else if (quote === char && (quote === "'" || !isEscaped(value, index))) quote = null;
    else if (!quote && char === '=') return index;
  }
  return -1;
}
function tokenRange(raw, equals) {
  let start = equals + 1;
  while (start < raw.length && /\s/.test(raw[start])) start += 1;
  const quote = raw[start];
  if (quote === '"' || quote === "'") {
    for (let index = start + 1; index < raw.length; index += 1) {
      if (raw[index] === quote && (quote === "'" || !isEscaped(raw, index))) return { start, end: index + 1 };
    }
    return { start, end: raw.length };
  }
  let end = start;
  while (end < raw.length && !/\s|#/.test(raw[end])) end += 1;
  return { start, end };
}
export function scanToml(text) {
  if (text.includes('\0')) fail('config.toml contains a NUL byte');
  const newline = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  const hasBom = Boolean(lines.length && lines[0].startsWith('\uFEFF'));
  if (hasBom) lines[0] = lines[0].slice(1);
  const assignments = [];
  let firstHeader = lines.length;
  let atRoot = true;
  let multiline = null;
  let continuationDepth = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index].replace(/\r?\n$/, '');
    const lexical = lexLine(raw, multiline);
    multiline = lexical.multiline;
    if (lexical.wasMultiline) continue;
    const code = lexical.code.trim();
    if (!code) continue;
    if (continuationDepth > 0) {
      continuationDepth += lexical.depthDelta;
      if (continuationDepth < 0) fail(`unbalanced TOML delimiter at line ${index + 1}`);
      continue;
    }
    if (code.startsWith('[')) {
      firstHeader = Math.min(firstHeader, index);
      atRoot = false;
      continue;
    }
    const equals = findEquals(lexical.code);
    if (equals < 0) fail(`unsupported TOML statement at line ${index + 1}`);
    const keyText = lexical.code.slice(0, equals).trim();
    if (atRoot && /^(?:model_instructions_file|"model_instructions_file"|'model_instructions_file')$/.test(keyText)) {
      if (lexical.multiline || lexical.code.slice(equals + 1).trim().startsWith('"""') || lexical.code.slice(equals + 1).trim().startsWith("'''")) {
        fail('model_instructions_file must be a single-line string');
      }
      const range = tokenRange(raw, equals);
      const token = raw.slice(range.start, range.end);
      const tail = raw.slice(range.end).trim();
      if (!['"', "'"].includes(token[0]) || token.length < 2 || token.at(-1) !== token[0] || (tail && !tail.startsWith('#'))) {
        fail('model_instructions_file must be a single-line string');
      }
      assignments.push({ index, raw, ...range });
    } else if (atRoot && keyText.includes('model_instructions_file')) {
      fail('ambiguous model_instructions_file key');
    }
    continuationDepth = Math.max(0, lexical.depthDelta);
  }
  if (multiline || continuationDepth !== 0) fail('unterminated TOML string, array or inline table');
  if (assignments.length > 1) fail('duplicate model_instructions_file key');
  return { lines, newline, hasBom, firstHeader, assignment: assignments[0] ?? null };
}
export function keyLine(text) {
  const doc = scanToml(text);
  return doc.assignment ? doc.lines[doc.assignment.index] : null;
}
export function sameInstructionLine(line, recorded) {
  // A line separator belongs to the surrounding document, not the managed key.
  return line === recorded || (typeof line === 'string' && typeof recorded === 'string' &&
    line.replace(/\r?\n$/, '') === recorded.replace(/\r?\n$/, ''));
}
export function setInstructions(text, absolutePath) {
  const doc = scanToml(text);
  const value = JSON.stringify(absolutePath.replaceAll('\\', '/'));
  if (doc.assignment) {
    const a = doc.assignment;
    const ending = doc.lines[a.index].slice(a.raw.length);
    doc.lines[a.index] = `${a.raw.slice(0, a.start)}${value}${a.raw.slice(a.end)}${ending}`;
  } else {
    doc.lines.unshift(`model_instructions_file = ${value}${doc.newline}`);
  }
  return (doc.hasBom ? '\uFEFF' : '') + doc.lines.join('');
}
export function restoreInstructions(text, oldLine) {
  const doc = scanToml(text);
  if (!doc.assignment) fail('managed config key is missing; restore refused');
  if (oldLine === null) doc.lines.splice(doc.assignment.index, 1);
  else {
    const index = doc.assignment.index;
    // Preserve an original EOF line exactly unless later content needs a separator.
    const separator = index < doc.lines.length - 1 && !oldLine.endsWith('\n')
      ? doc.lines[index].slice(doc.assignment.raw.length) || doc.newline : '';
    doc.lines[index] = oldLine + separator;
  }
  return (doc.hasBom ? '\uFEFF' : '') + doc.lines.join('');
}
