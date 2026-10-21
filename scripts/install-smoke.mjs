#!/usr/bin/env node
// Test only the committed distributable; never touch a maintainer's global skills.
import { spawnSync } from 'node:child_process';
import { mkdirSync,mkdtempSync,existsSync,readFileSync } from 'node:fs';
import { resolve,join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('..',import.meta.url));
const output=resolve(process.argv[2]??join(root,'work/install-smoke'));mkdirSync(output,{recursive:true});
const scratch=mkdtempSync(join(output,'candidate-')),source=join(scratch,'source');mkdirSync(source);
const run=(cmd,args,cwd=root)=>{const r=spawnSync(cmd,args,{cwd,env:{...process.env,DISABLE_TELEMETRY:'1'},stdio:'inherit'});assert.equal(r.status,0,`${cmd} ${args.join(' ')} failed`);};
run('git',['archive','--format=tar','HEAD','-o',join(scratch,'source.tar')]);run('tar',['-xf',join(scratch,'source.tar'),'-C',source]);
for(const name of ['diorama','diorama-worlds']){
  const project=join(scratch,name);mkdirSync(project);
  const path=name==='diorama'?source:join(source,'skills/diorama-worlds');
  run('npx',['--yes','skills@1.7.4','add',path,'--skill',name,'-a','claude-code','-y','--copy'],project);
  const installed=join(project,'.claude/skills',name);assert.ok(existsSync(join(installed,'SKILL.md')));
  if(name==='diorama'){
    run('node',[join(installed,'scripts/build.mjs'),join(installed,'examples/mailbox.js'),join(project,'mailbox.html')]);
    run('node',[join(installed,'scripts/validate.mjs'),join(project,'mailbox.html')]);
  }else{
    assert.ok(!existsSync(join(installed,'node_modules')),'clean distribution must not bundle local dependencies');
    assert.ok(existsSync(join(installed,'LICENSE')));assert.ok(existsSync(join(installed,'THIRD_PARTY_NOTICES.txt')));
    run('npm',['ci','--ignore-scripts','--prefix',installed]);
    run('node',[join(installed,'scripts/build-world.mjs'),join(installed,'examples/bakery.js'),join(project,'bakery.html')]);
    const html=readFileSync(join(project,'bakery.html'),'utf8');assert.ok(html.includes('Permission is hereby granted'),'bundled MIT notice');
    assert.ok(!html.includes('visual prototype'),'public standalone identity');
  }
}
console.log(`PASS clean committed installation: both skills build from copied resources (${scratch})`);
