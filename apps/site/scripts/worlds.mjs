#!/usr/bin/env node
// Build with site-owned dependencies: a clean site install is enough.
import * as bundler from 'esbuild';
import { fileURLToPath } from 'node:url';
import { buildWorld } from '../../../skills/diorama-worlds/scripts/build-world.mjs';
const here = p => fileURLToPath(new URL(p,import.meta.url));
for (const name of ['florist','pottery-studio','bakery','observatory']) {
  await buildWorld(here(`../../../skills/diorama-worlds/examples/${name}.js`),here(`../public/worlds/${name}.html`),{bundler,nodePaths:[here('../node_modules')]});
}
console.log('4 original Worlds → public/worlds (self-contained HTML)');
