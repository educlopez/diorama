import { defineWorld } from '@diorama/worlds';
const acts = { routine: 2.2, interruption: 1, consequence: 1.8 };
const duration = acts.routine + acts.interruption + acts.consequence;
const still = acts.routine + acts.interruption + acts.consequence * .48;
const leftRest = [.02, 1.0, .22], leftUp = [-.06, 1.28, .16];

export default defineWorld({
  name: 'signal-platform', title: 'The arm drops', duration, still, acts, pixelInk: true,
  description: 'A toy-scale clerk stamps papers while a signal arm stays raised. The arm drops, the free hand lifts a small flag, and both settle back into the stamp.',
  bounds: [[-3.1, -.5, -2.4], [3.1, 2.55, 2.4]],
  contactTimes: [0, .7, 1.5, 2.1, 2.7, still, 4.4],
  build(W) {
    const { box, cylinder, group } = W;
    W.terrain(5.6, 4.4, '#6d8a45', 27); W.grass(5.6, 4.4, 400, 33);
    for (let i = 0; i < 7; i++) box(2.8, .06, .28, i % 2 ? '#a56b3e' : '#8c5c38', 0, .05, -1.15 + i * .32);
    box(.08, .16, 2.3, '#bda86b', -1.45, .12, -.1);
    const desk = group(.12, 0, .3);
    for (const x of [-.42, .42]) for (const z of [-.2, .2]) box(.05, .8, .05, '#8c5c38', x, .4, z, desk);
    box(1.02, .07, .52, '#a56b3e', 0, .82, 0, desk);
    for (let i = 0; i < 3; i++) box(.18, .012, .14, '#f5eddb', -.22 + i * .02, .87 + i * .014, .02, desk);
    const stamp = group(.16, 0, .28);
    const handle = group(0, 1, 0, stamp);
    cylinder(.035, .14, '#8c5c38', 0, .07, 0, handle, 8);
    box(.09, .035, .09, '#9e4d3d', 0, .15, 0, handle);
    const knob = group(0, .16, 0, handle);
    const mast = group(-1.05, 0, -.2);
    cylinder(.05, 1.45, '#2c2824', 0, .72, 0, mast);
    const arm = group(0, 1.42, 0, mast);
    box(.62, .045, .045, '#9e4d3d', .34, 0, 0, arm);
    box(.08, .08, .08, '#bda86b', .64, 0, 0, arm);
    const clerk = W.toy(.02, .06, '#456185', '#2c2824', .9, '#c78f66');
    const flag = group(0, -.04, .03, clerk.leftHand);
    cylinder(.012, .2, '#8c5c38', 0, .08, 0, flag, 6);
    box(.16, .1, .012, '#9e4d3d', .08, .16, 0, flag);
    const v = new W.THREE.Vector3();
    return { clerk, stamp, handle, knob, arm, flag, v, palms: [[0, 0, 0], [0, 0, 0]] };
  },
  tick({ t, parts: p, W }) {
    const beat = W.act(t, acts);
    const press = beat.name === 'routine' ? Math.sin(beat.u * Math.PI * 2) : 0;
    p.handle.position.y = 1 - press * press * .05;
    const drop = beat.name === 'interruption' ? W.smooth(beat.u) : beat.name === 'consequence' ? 1 - W.settle(beat.u) : 0;
    p.arm.rotation.z = -drop * 1.05;
    const flagAmount = beat.name === 'consequence' ? Math.sin(beat.u * Math.PI) * (1 - W.settle(beat.u)) : 0;
    p.flag.rotation.z = -.35 + flagAmount * .9;
    const bob = beat.name === 'routine' ? press : 0;
    W.plant(p.clerk, { crouch: .032 + .012 * bob * bob, lean: .09, twist: -.08 * Math.max(drop, flagAmount) });
    W.aim(p.clerk, { head: [.16 - .22 * flagAmount, -.45 * drop, 0] });
    p.knob.updateMatrixWorld(true); p.knob.getWorldPosition(p.v);
    p.palms[1] = W.reach(p.clerk, 1, p.v.toArray());
    p.palms[0] = W.reach(p.clerk, -1, W.blend(leftRest, leftUp, flagAmount));
  },
  contacts({ parts: p }) {
    const checks = [];
    p.knob.getWorldPosition(p.v);
    checks.push({ label: 'right palm on the stamp', a: p.palms[1], b: p.v.toArray() });
    for (const side of [-1, 1]) {
      const foot = side < 0 ? p.clerk.leftFoot : p.clerk.rightFoot;
      foot.getWorldPosition(p.v); const a = p.v.toArray();
      p.v.set(side * .13, .09, 0); p.clerk.root.localToWorld(p.v);
      checks.push({ label: 'clerk ankle stays planted', a, b: p.v.toArray() });
    }
    return checks;
  }
});
