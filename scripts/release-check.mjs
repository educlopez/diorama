#!/usr/bin/env node
// Release invariants: source package, installed resources and product identity.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root=fileURLToPath(new URL('..',import.meta.url));
const read=p=>readFileSync(join(root,p),'utf8');
const version=read('version.txt').trim();
assert.equal(JSON.parse(read('.release-please-manifest.json'))['.'],version);
for(const prefix of ['apps/site','skills/diorama-worlds']){
  const pkg=JSON.parse(read(prefix+'/package.json')),lock=JSON.parse(read(prefix+'/package-lock.json'));
  assert.equal(pkg.version,version,`${prefix}: package version`);
  assert.equal(lock.version,version,`${prefix}: lock version`);
  assert.equal(lock.packages[''].version,version,`${prefix}: locked root version`);
}
assert.ok(read('CHANGELOG.md').includes(`## [${version}]`),'current release notes');
for(const path of ['skills/diorama/SKILL.md','skills/diorama/LICENSE','skills/diorama/agents/openai.yaml','skills/diorama/scripts/build.mjs','skills/diorama/kit/diorama.js','skills/diorama-worlds/LICENSE','skills/diorama-worlds/THIRD_PARTY_NOTICES.txt','skills/diorama-worlds/agents/openai.yaml','skills/diorama-worlds/scripts/build-world.mjs','skills/diorama-worlds/kit/world.js'])assert.ok(existsSync(join(root,path)),path);
assert.ok(!existsSync(join(root,'SKILL.md')),'no SKILL.md at the root: it would hide skills/ from the skills CLI');
for(const path of ['apps/site/lib/site.ts','README.md']){
  assert.ok(read(path).includes('npx skills add educlopez/diorama --skill diorama -g'),`${path}: targeted SVG install`);
  assert.ok(read(path).includes('npx skills add educlopez/diorama --skill diorama-worlds -g'),`${path}: targeted Worlds install`);
}
for(const path of ['apps/site/app/worlds/page.tsx','apps/site/app/llms.txt/route.ts'])assert.ok(!/local and unpublished|in development|after publication|Try the local skill/.test(read(path)),`${path}: no stale prototype copy`);
console.log(`PASS release ${version}: versions, notes, package resources, commands and public copy`);
