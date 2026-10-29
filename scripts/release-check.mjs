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
for(const prefix of ['apps/site','skills/diorama-worlds','skills/diorama-pixel','skills/diorama-wash']){
  const pkg=JSON.parse(read(prefix+'/package.json')),lock=JSON.parse(read(prefix+'/package-lock.json'));
  assert.equal(pkg.version,version,`${prefix}: package version`);
  assert.equal(lock.version,version,`${prefix}: lock version`);
  assert.equal(lock.packages[''].version,version,`${prefix}: locked root version`);
}
assert.ok(read('CHANGELOG.md').includes(`## [${version}]`),'current release notes');
for(const path of ['skills/diorama/SKILL.md','skills/diorama/LICENSE','skills/diorama/agents/openai.yaml','skills/diorama/scripts/build.mjs','skills/diorama/kit/diorama.js','skills/diorama-worlds/LICENSE','skills/diorama-worlds/THIRD_PARTY_NOTICES.txt','skills/diorama-worlds/agents/openai.yaml','skills/diorama-worlds/scripts/build-world.mjs','skills/diorama-worlds/kit/world.js','skills/diorama-pixel/SKILL.md','skills/diorama-pixel/LICENSE','skills/diorama-pixel/agents/openai.yaml','skills/diorama-pixel/scripts/build.mjs','skills/diorama-pixel/scripts/validate.mjs','skills/diorama-pixel/scripts/look.mjs','skills/diorama-pixel/kit/pixel.js','skills/diorama-pixel/kit/page.html','skills/diorama-pixel/references/scene-api.md','skills/diorama-pixel/references/art-direction.md','skills/diorama-wash/SKILL.md','skills/diorama-wash/LICENSE','skills/diorama-wash/THIRD_PARTY_NOTICES.txt','skills/diorama-wash/agents/openai.yaml','skills/diorama-wash/scripts/build.mjs','skills/diorama-wash/scripts/validate.mjs','skills/diorama-wash/scripts/look.mjs','skills/diorama-wash/scripts/render.mjs','skills/diorama-wash/kit/wash.js','skills/diorama-wash/kit/page.html','skills/diorama-wash/references/scene-api.md','skills/diorama-wash/references/art-direction.md'])assert.ok(existsSync(join(root,path)),path);
assert.ok(!existsSync(join(root,'SKILL.md')),'no SKILL.md at the root: it would hide skills/ from the skills CLI');
for(const path of ['apps/site/lib/site.ts','README.md']){
  assert.ok(read(path).includes('npx skills add educlopez/diorama --skill diorama -g'),`${path}: targeted SVG install`);
  assert.ok(read(path).includes('npx skills add educlopez/diorama --skill diorama-worlds -g'),`${path}: targeted Worlds install`);
  assert.ok(read(path).includes('npx skills add educlopez/diorama --skill diorama-pixel -g'),`${path}: targeted Pixel install`);
  assert.ok(read(path).includes('npx skills add educlopez/diorama --skill diorama-wash -g'),`${path}: targeted Wash install`);
}
for(const path of ['apps/site/app/worlds/page.tsx','apps/site/app/pixel/page.tsx','apps/site/app/llms.txt/route.ts'])assert.ok(!/local and unpublished|in development|after publication|Try the local skill/.test(read(path)),`${path}: no stale prototype copy`);
console.log(`PASS release ${version}: versions, notes, package resources, commands and public copy`);
