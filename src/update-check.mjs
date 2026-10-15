import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';

export const OFFICIAL = 'NB-Corp/gpt-with-taste';
const API = `https://api.github.com/repos/${OFFICIAL}`;
const SHA = /^[0-9a-f]{40}$/i;
function git(root, args) {
  return new Promise((resolve, reject) => execFile('git', ['-C', root, ...args],
    {encoding:'utf8', timeout:2000, maxBuffer:1024*1024, windowsHide:true},
    (error, stdout) => error ? reject(error) : resolve(stdout.trim())));
}
function officialRemote(value) {
  return /^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)NB-Corp\/gpt-with-taste(?:\.git)?\/?$/i.test(value);
}
export async function sourceIdentity(root) {
  let version;
  try { version = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8')).version; } catch {}
  const display = typeof version === 'string' ? {version} : {};
  try {
    // Do not inherit a parent repository when installing a downloaded source archive.
    const top = await git(root, ['rev-parse', '--show-toplevel']);
    if (path.resolve(top) !== path.resolve(root)) return {kind:'archive', ...display};
    const commit = await git(root, ['rev-parse', 'HEAD']);
    if (!SHA.test(commit)) return {kind:'unknown', ...display};
    const remotes = (await git(root, ['remote'])).split(/\r?\n/).filter(Boolean);
    const urls = await Promise.all(remotes.map(name => git(root, ['remote', 'get-url', name])));
    // origin defines the selected source; an added upstream does not turn a fork into an official clone.
    const selected = remotes.includes('origin') ? urls[remotes.indexOf('origin')] : urls.length === 1 ? urls[0] : '';
    const dirty = Boolean(await git(root, ['status', '--porcelain', '--untracked-files=normal']));
    return {kind:selected ? officialRemote(selected) ? 'official' : 'fork' : 'unknown', commit, dirty, ...display};
  } catch { return {kind:'archive', ...display}; }
}

// One total deadline covers discovery and every comparison. Only public official GitHub metadata is read.
export async function checkUpdates(sources, {fetch:request=globalThis.fetch, timeoutMs=5000}={}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  async function get(route, missing=false) {
    const response = await request(API + route, {signal:controller.signal, redirect:'error',
      headers:{Accept:'application/vnd.github+json', 'User-Agent':'gpt-with-taste-update-check'}});
    if (missing && response.status === 404) return null;
    if (!response.ok) throw new Error(response.status === 403 || response.status === 429 ? 'GitHub rate limited or denied the check' : `GitHub HTTP ${response.status}`);
    return response.json();
  }
  try {
    const release = await get('/releases/latest', true);
    let target;
    if (release) {
      if (typeof release.tag_name !== 'string' || release.draft || release.prerelease) throw new Error('Invalid stable release metadata');
      const commit = await get(`/commits/${encodeURIComponent(release.tag_name)}`);
      target = {kind:'release', name:release.tag_name, commit:commit.sha};
    } else {
      const repo = await get('');
      if (typeof repo.default_branch !== 'string' || !repo.default_branch) throw new Error('Missing official default branch');
      const commit = await get(`/commits/${encodeURIComponent(repo.default_branch)}`);
      target = {kind:'branch', name:repo.default_branch, commit:commit.sha};
    }
    if (!SHA.test(target.commit)) throw new Error('Invalid official commit metadata');
    const comparisons = new Map();
    const results = [];
    for (const [label, source] of Object.entries(sources)) {
      let state;
      if (!source) state='unknown';
      else if (source.dirty) state='modified';
      else if (source.kind !== 'official' || !SHA.test(source.commit ?? '')) state=source.kind === 'fork' ? 'fork' : 'unknown';
      else if (source.commit === target.commit) state='current';
      else {
        if (!comparisons.has(source.commit)) comparisons.set(source.commit, await get(`/compare/${source.commit}...${target.commit}`, true));
        const comparison = comparisons.get(source.commit);
        state = comparison?.status === 'ahead' ? 'behind' : comparison?.status === 'identical' ? 'current' : 'custom';
      }
      results.push({label, source, state});
    }
    return {status:'checked', target, results};
  } catch (error) {
    return {status:'unavailable', reason:controller.signal.aborted ? `timed out after ${timeoutMs} ms` :
      /^(GitHub |Invalid |Missing official)/.test(error.message) ? error.message : 'network request failed'};
  } finally { clearTimeout(timer); }
}

function identityText(source) {
  if (!source) return 'source not recorded';
  return `${source.kind}${source.commit ? ` ${source.commit.slice(0,12)}` : ''}${source.dirty ? ', locally modified' : ''}${source.version ? ` (package version ${JSON.stringify(source.version)})` : ''}`;
}
export function formatUpdateReport(report, {sources, home, hooks=false, installation='none', integrity}={}) {
  const lines = ['Update check — official NB-Corp/gpt-with-taste'];
  if (report.status === 'unavailable') lines.push(`Unavailable: ${report.reason}. No update conclusion; local installation can continue.`);
  else lines.push(report.target.kind === 'release' ? `Stable release: ${report.target.name} (${report.target.commit.slice(0,12)})` :
    `Official default branch: ${report.target.name} (${report.target.commit.slice(0,12)}); not a stable release.`);
  const descriptions = {current:'matches the official target', behind:'an official update is available', modified:'local modifications; review and merge manually',
    fork:'fork source; choose your fork update or merge official changes manually', custom:'custom, newer, divergent, or unrecognized revision; review history and merge manually',
    unknown:'cannot compare provenance; choose and review a source manually'};
  for (const [label, source] of Object.entries(sources ?? {})) {
    const state = report.results?.find(item => item.label === label)?.state;
    lines.push(`${label}: ${identityText(source)}${state ? ` — ${descriptions[state]}` : ''}`);
  }
  lines.push(`Selected Codex home: ${home}`, `Installation: ${installation}${hooks ? '; Hooks installed (retain --hooks when refreshing them)' : ''}.`);
  if (integrity) lines.push(`Installed content: ${integrity}`);
  lines.push(`After reviewing/selecting local source, install with: node scripts/install.mjs --home ${JSON.stringify(home)}${hooks ? ' --hooks' : ''}`);
  return lines.join('\n');
}
