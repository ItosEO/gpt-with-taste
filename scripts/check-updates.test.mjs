import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {sourceIdentity, checkUpdates, formatUpdateReport} from '../src/update-check.mjs';
const exec=promisify(execFile),A='a'.repeat(40),B='b'.repeat(40),C='c'.repeat(40);
const official=commit=>({kind:'official',commit,dirty:false,version:'999-custom'});
function github(routes) {
  const calls=[];
  return {calls,fetch:async(url,options)=>{
    assert.ok(url.startsWith('https://api.github.com/repos/NB-Corp/gpt-with-taste'));
    assert.equal(options.redirect,'error');assert.equal(options.headers.Authorization,undefined);
    const route=url.slice('https://api.github.com/repos/NB-Corp/gpt-with-taste'.length);calls.push(route);
    assert.ok(Object.hasOwn(routes,route),`Unexpected request: ${route}`);
    const value=routes[route];return {status:value===null?404:200,ok:value!==null,json:async()=>value};
  }};
}
const branch={'/releases/latest':null,'':{default_branch:'master'},'/commits/master':{sha:B}};
test('default branch comparisons use commit ancestry, not custom package version; fork/dirty never need official overwrite',async()=>{
  const http=github({...branch,[`/compare/${A}...${B}`]:{status:'ahead'},[`/compare/${C}...${B}`]:{status:'diverged'}});
  const sources={current:official(B),old:official(A),fork:{...official(A),kind:'fork'},dirty:{...official(A),dirty:true},custom:official(C),archive:{kind:'archive',version:'0.0.1'},legacy:undefined};
  const result=await checkUpdates(sources,http);
  assert.equal(result.status,'checked');assert.equal(result.target.kind,'branch');
  assert.deepEqual(result.results.map(x=>x.state),['current','behind','fork','modified','custom','unknown','unknown']);
  const text=formatUpdateReport(result,{sources,home:'/fixture/home',hooks:true,installation:'applied'});
  assert.match(text,/not a stable release/);assert.match(text,/--home "\/fixture\/home" --hooks/);
  assert.equal(http.calls.filter(x=>x.startsWith('/compare/')).length,2);
});
test('stable release resolves its tag to a commit rather than comparing release and package numbers',async()=>{
  const http=github({'/releases/latest':{tag_name:'v1.0.0'},'/commits/v1.0.0':{sha:A}});
  const result=await checkUpdates({checkout:official(A)},http);assert.equal(result.target.kind,'release');assert.equal(result.results[0].state,'current');
  assert.deepEqual(http.calls,['/releases/latest','/commits/v1.0.0']);
});
test('local ahead, unrelated history and unavailable compare are not called outdated',async()=>{
  for(const status of ['behind','diverged',null]){
    const http=github({...branch,[`/compare/${A}...${B}`]:status?{status}:null});
    assert.equal((await checkUpdates({checkout:official(A)},http)).results[0].state,'custom');
  }
});
test('offline, rate limit and total request timeout report unavailable without claiming current',async()=>{
  const rate=await checkUpdates({checkout:official(B)},{fetch:async()=>({status:429,ok:false})});assert.match(rate.reason,/rate limited/);
  const offline=await checkUpdates({checkout:official(B)},{fetch:async()=>{throw new Error('https://private-token@host');}});assert.equal(offline.reason,'network request failed');
  const start=Date.now();
  const timeout=await checkUpdates({checkout:official(B)},{timeoutMs:25,fetch:async(url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}))});
  assert.equal(timeout.status,'unavailable');assert.match(timeout.reason,/timed out/);assert.ok(Date.now()-start<1000);
  for(const result of [rate,offline,timeout])assert.equal(result.results,undefined);
});
test('Git identity stays at source root; fork origin wins over official upstream and no remote credentials escape',async t=>{
  const scratch=path.resolve('.tmp/update-test');await fs.mkdir(scratch,{recursive:true});const root=await fs.mkdtemp(path.join(scratch,'git-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const git=(...args)=>exec('git',['-C',root,...args]);
  await git('init');await fs.writeFile(path.join(root,'package.json'),'{"version":"999.0.0-fork"}\n');
  await git('add','package.json');await git('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','fixture');
  await git('remote','add','origin','https://github.com/NB-Corp/gpt-with-taste.git');
  let source=await sourceIdentity(root);assert.equal(source.kind,'official');assert.equal(source.dirty,false);assert.equal(source.version,'999.0.0-fork');
  await fs.appendFile(path.join(root,'package.json'),' ');source=await sourceIdentity(root);assert.equal(source.dirty,true);
  await git('remote','set-url','origin','https://fixture-secret@github.com/a-fork/gpt-with-taste.git');await git('remote','add','upstream','https://github.com/NB-Corp/gpt-with-taste.git');
  source=await sourceIdentity(root);assert.equal(source.kind,'fork');assert.equal(JSON.stringify(source).includes('fixture-secret'),false);
  const nested=path.join(root,'zip-source');await fs.mkdir(nested);await fs.writeFile(path.join(nested,'package.json'),'{"version":"zip"}');
  assert.deepEqual(await sourceIdentity(nested),{kind:'archive',version:'zip'});
});
