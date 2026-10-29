import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { phase, smooth, seeded, defineWorld, clockTime, toolkit, act, blend, settle, sample } from '../kit/world.js';
import { inspectWorld } from './look-world.mjs';
import { build } from 'esbuild';
import * as THREE from 'three';

const valid = () => ({name:'test-world',title:'Test world',description:'A test world.',duration:8,still:2,build(){return{};},tick(){}});
test('clock wraps at either end and does not depend on frame count',()=>{
  assert.equal(phase(0,8),0);assert.equal(phase(8,8),0);assert.equal(phase(-2,8),.75);assert.equal(phase(10,8),.25);
  assert.equal(smooth(-1),0);assert.equal(smooth(2),1);assert.equal(smooth(.5),.5);
});
test('skipped frames and low FPS do not slow the clock',()=>{
  assert.equal(clockTime(0,1000,8),1);
  assert.ok(Math.abs(clockTime(0,1200,8)-1.2)<1e-12);
  assert.equal(clockTime(7.5,1000,8),.5);
  assert.equal(clockTime(0,1000,8,1.5),1.5);
});
test('procedural detail is deterministic',()=>{
  const a=seeded(7),b=seeded(7),c=seeded(8);
  const aa=Array.from({length:100},()=>a()),bb=Array.from({length:100},()=>b());
  assert.deepEqual(aa,bb);assert.notEqual(aa[0],c());assert.ok(aa.every(n=>n>=0&&n<1));
});
test('definition rejects broken animation and framing contracts',()=>{
  for(const overrides of [{duration:0},{duration:Infinity},{still:8},{still:-1},{name:'Wrong Name'},{tick:null},{description:null},{contactTimes:[NaN]},{contactTimes:[1]},{bounds:[[0,0,0],[0,1,1]]},{bounds:[[0,0,0],[2,NaN,2]]},{acts:{routine:1,interruption:1,consequence:1}},{acts:{routine:0,interruption:1,consequence:1}},{pixelInk:'yes'}]) assert.throws(()=>defineWorld({...valid(),...overrides}));
  assert.equal(defineWorld(valid()).name,'test-world');
  assert.equal(defineWorld({...valid(),duration:3,still:1,acts:{routine:1,interruption:1,consequence:1},pixelInk:true}).pixelInk,true);
});
test('acted time is a pure function of t',()=>{
  const acts={routine:2,interruption:1,consequence:1};
  assert.equal(act(0,acts).name,'routine');
  assert.equal(act(1.999,acts).name,'routine');
  assert.equal(act(2,acts).name,'interruption');
  assert.equal(act(3,acts).name,'consequence');
  assert.equal(act(4,acts).name,'routine');
  assert.equal(act(-1,acts).name,'consequence');
  assert.ok(Math.abs(act(2.5,acts).u-.5)<1e-12);
  assert.deepEqual(act(1,acts),act(1,acts));
  assert.equal(settle(0),0);assert.equal(settle(.7),0);assert.equal(settle(1),1);
  assert.deepEqual(blend([0,2],[10,4],.5),[5,3]);
  assert.throws(()=>blend([0],[0,1],.2));
  const frames=[{t:0,value:[0,0]},{t:1,value:[0,2]},{t:2,value:[0,0]}];
  assert.deepEqual(sample(0,frames),[0,0]);
  assert.deepEqual(sample(2,frames),[0,0]);
  assert.deepEqual(sample(-1,frames),[0,0]);
  assert.ok(sample(1,frames)[1]>1.9);
  assert.notEqual(sample(0,frames),frames[0].value);
  assert.throws(()=>sample(0,[{t:1,value:0},{t:1,value:1}]));
  assert.throws(()=>act(NaN,acts));
});
test('ground defaults to a flat broken cutout; raised slab requires explicit opt-in',()=>{
  const previous=globalThis.document;
  globalThis.document={createElement(){return {width:0,height:0,getContext(){return {fillStyle:'',fillRect(){}};}};}};
  try{
    for(const base of ['none','slab']){
      const stage=new THREE.Group(),W=toolkit(stage);
      if(base==='none')W.terrain(5,4,'#82935b',17);else W.terrain(5,4,'#82935b',17,{base});
      stage.updateMatrixWorld(true);
      const bounds=new THREE.Box3().setFromObject(stage);
      assert.ok(base==='none'?bounds.min.y>=.004:bounds.min.y<-.3,`base ${base}: ground minY ${bounds.min.y}`);
      const extrusions=stage.children.filter(o=>o.geometry?.type==='ExtrudeGeometry');
      assert.equal(extrusions.length,base==='none'?0:1);
      assert.ok(base==='none'?stage.children.length>100:stage.children.length===2);
      assert.throws(()=>W.terrain(5,4,'#82935b',17,{base:'automatic-plinth'}));
      W.dispose();
    }
  }finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
});
test('adult proportion and planted-foot rig work through bends and turns',()=>{
  const stage=new THREE.Group(),W=toolkit(stage),person=W.person(0,0);
  stage.updateMatrixWorld(true);
  const height=new THREE.Box3().setFromObject(person.root).getSize(new THREE.Vector3()).y;
  const headHeight=new THREE.Box3().setFromObject(person.face).getSize(new THREE.Vector3()).y;
  assert.ok(height/headHeight>6.6&&height/headHeight<7.6,`head ratio ${height/headHeight}`);
  for(const [crouch,lean,twist] of [[0,0,0],[.04,.1,.1],[.08,.16,-.15],[.02,.06,.2]]){
    W.plant(person,{crouch,lean,twist});stage.updateMatrixWorld(true);
    for(const side of [-1,1]){
      const foot=side<0?person.leftFoot:person.rightFoot;
      const ankle=foot.getWorldPosition(new THREE.Vector3());assert.ok(ankle.distanceTo(new THREE.Vector3(side*.13,.09,0))<.00002);
      const up=new THREE.Vector3(0,1,0).applyQuaternion(foot.getWorldQuaternion(new THREE.Quaternion()));assert.ok(up.distanceTo(new THREE.Vector3(0,1,0))<1e-8);
      const target=[side*.085,1.1,.26],actual=W.reach(person,side,target);assert.ok(Math.hypot(...actual.map((v,i)=>v-target[i]))<.025);
    }
  }
  W.dispose();
});
test('toy pins keep the planted rig solvable at a smaller scale',()=>{
  const stage=new THREE.Group(),W=toolkit(stage),actor=W.toy(.2,0,'#456185','#2c2824',.9);
  assert.throws(()=>W.aim(actor,{head:[0,1]}));
  W.aim(actor,{head:[.2,-.1,0]});
  assert.equal(actor.head.rotation.x,.2);
  for(const [crouch,lean,twist] of [[0,0,0],[.04,.1,.1]]){
    W.plant(actor,{crouch,lean,twist});stage.updateMatrixWorld(true);
    for(const side of [-1,1]){
      const foot=side<0?actor.leftFoot:actor.rightFoot;
      const ankle=foot.getWorldPosition(new THREE.Vector3());
      const support=actor.root.localToWorld(new THREE.Vector3(side*.13,.09,0));
      assert.ok(ankle.distanceTo(support)<.00002);
      const target=[.2+side*.08,1.05,.24];
      const first=W.reach(actor,side,target),second=W.reach(actor,side,target);
      assert.deepEqual(first,second);
      assert.ok(first.every(Number.isFinite));
    }
  }
  W.dispose();
});
const examples=fileURLToPath(new URL('../examples/',import.meta.url));
for(const name of ['latch-shop','orange-stall','signal-platform']) test(`${name}: acted poses depend only on t`,async()=>{
  const previous=globalThis.document;
  globalThis.document={createElement(){return {width:0,height:0,getContext(){return {fillStyle:'',fillRect(){}};}};}};
  try{
    const result=await build({entryPoints:[join(examples,`${name}.js`)],bundle:true,write:false,format:'esm',platform:'node',alias:{'@diorama/worlds':fileURLToPath(new URL('../kit/world.js',import.meta.url))}});
    const {default:def}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
    const stage=new THREE.Group(),W=toolkit(stage),parts=def.build(W);
    const pose=()=>{stage.updateMatrixWorld(true);const values=[];stage.traverse(o=>values.push(...o.matrixWorld.elements));return values;};
    const delta=(a,b)=>Math.max(...a.map((n,i)=>Math.abs(n-b[i])));
    def.tick({t:0,parts,W});const open=pose();
    def.tick({t:0,parts,W});assert.equal(delta(open,pose()),0);
    def.tick({t:def.duration-1e-6,parts,W});assert.ok(delta(open,pose())<1e-6);
    def.tick({t:def.still,parts,W});assert.ok(delta(open,pose())>.03);
    for(const t of def.contactTimes){
      def.tick({t,parts,W});
      const contacts=def.contacts({t,parts,W});
      assert.ok(contacts.length>0);
      for(const pair of contacts) assert.ok(Math.hypot(...pair.a.map((v,i)=>v-pair.b[i]))<.025,`${name} ${pair.label} at ${t}`);
    }
    let previousHand=null;
    for(let i=0;i<=200;i++){
      const t=def.duration*i/200;
      def.tick({t,parts,W});stage.updateMatrixWorld(true);
      const actor=parts.maker??parts.vendor??parts.clerk;
      const hand=actor.rightHand.getWorldPosition(new THREE.Vector3()).toArray();
      if(previousHand) assert.ok(Math.hypot(...hand.map((v,index)=>v-previousHand[index]))<.08,`${name} hand jump at ${t}`);
      previousHand=hand;
    }
    W.dispose();
  }finally{if(previous===undefined)delete globalThis.document;else globalThis.document=previous;}
});
test('fresh subject: juggling balls meet each catching/releasing palm',async()=>{
  const result=await build({entryPoints:[join(examples,'street-juggler.js')],bundle:true,write:false,format:'esm',platform:'node',alias:{'@diorama/worlds':fileURLToPath(new URL('../kit/world.js',import.meta.url))}});
  const {hand,ballPose}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
  const near=(a,b)=>Math.max(...a.map((n,i)=>Math.abs(n-b[i])))<1e-8;
  for(let i=0;i<3;i++)for(let k=0;k<2;k++){
    const start=k*1.5,side=k===0?-1:1;
    for(const [label,q,handSide] of [['release',start,side],['catch',start+1.15,-side]]){
      const t=((q-i)%3+3)%3;
      assert.ok(near(ballPose(t+i),hand(handSide,t)),`${label}: ball ${i} meets palm at ${t}`);
    }
  }
  for(let i=0;i<3;i++)assert.ok(near(ballPose(i),ballPose(i+3)));
});
for(const name of ['cricket','basketball','street-juggler','florist','pottery-studio','bakery','observatory','latch-shop','orange-stall','signal-platform']) test(`${name}: actual offline browser output`,{timeout:120000},async()=>{
  const output=resolve(process.env.WORLDS_TEST_OUTPUT??'work/worlds-tests',name);
  const report=await inspectWorld(join(examples,`${name}.js`),output);
  assert.ok(report.passed,JSON.stringify(report.checks.filter(c=>!c.pass),null,2));
});
