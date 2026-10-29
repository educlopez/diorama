import { defineWorld } from '@diorama/worlds';
const acts = { routine: 2.2, interruption: 1, consequence: 1.8 };
const duration = acts.routine + acts.interruption + acts.consequence;
const still = acts.routine + acts.interruption + acts.consequence * .5;
const cord = [.3, 1.12, .28];

export default defineWorld({
  name: 'latch-shop', title: 'The bell above the bench', duration, still, acts, pixelInk: true,
  description: 'A toy-scale maker files a latch at a low bench. A bell rings, both hands leave the file, one hand meets the cord, and the filing pose returns.',
  bounds: [[-2.8, -.5, -2.2], [2.8, 2.35, 2.2]],
  contactTimes: [0, .55, 1.1, 1.65, 2.05, still],
  build(W) {
    const { box, cylinder, ball, line, group } = W;
    W.terrain(5.2, 4.2, '#6d8a45', 19); W.grass(5.2, 4.2, 420, 23);
    for (let x = 0; x < 8; x++) for (let z = 0; z < 6; z++) box(.48, .04, .46, (x + z) % 2 ? '#bda86b' : '#a56b3e', -1.7 + x * .48, .03, -1.2 + z * .46);
    box(2.6, .55, .1, '#f5eddb', 0, .32, -1.35);
    box(.1, .7, 1.6, '#f5eddb', -1.55, .4, -.4);
    const table = group(0, 0, .36);
    for (const x of [-.72, .72]) for (const z of [-.26, .26]) box(.06, .86, .06, '#8c5c38', x, .43, z, table);
    box(1.62, .08, .64, '#a56b3e', 0, .88, 0, table);
    box(.28, .045, .16, '#8c5c38', -.28, .94, .02, table);
    box(.1, .07, .045, '#bda86b', -.16, .99, .02, table);
    const file = group(.02, 1.0, .28);
    box(.46, .03, .07, '#bda86b', 0, .02, 0, file);
    box(.06, .05, .08, '#8c5c38', -.2, .045, 0, file);
    box(.06, .05, .08, '#8c5c38', .2, .045, 0, file);
    const leftGrip = group(-.16, .05, 0, file), rightGrip = group(.16, .05, 0, file);
    cylinder(.04, 1.55, '#8c5c38', .72, .78, .42);
    line([[.72, 1.52, .42], [.5, 1.52, .36]], '#8c5c38', .02);
    const bell = group(.5, 1.52, .36);
    cylinder(.16, .2, '#bda86b', 0, -.1, 0, bell, 10);
    ball(.045, '#1f1c19', 0, -.22, 0, bell);
    line([[.5, 1.4, .36], cord], '#8c5c38', .012);
    ball(.04, '#9e4d3d', ...cord);
    const maker = W.toy(0, .02, '#456185', '#2c2824', .9, '#c78f66');
    box(.3, .38, .02, '#9e4d3d', 0, .28, .14, maker.chest);
    for (const x of [-.11, .11]) box(.025, .22, .02, '#9e4d3d', x, .48, .14, maker.chest);
    const v = new W.THREE.Vector3();
    return { maker, file, bell, leftGrip, rightGrip, v, palms: [[0, 0, 0], [0, 0, 0]] };
  },
  tick({ t, parts: p, W }) {
    const beat = W.act(t, acts);
    const slide = beat.name === 'routine' ? Math.sin(beat.u * Math.PI * 2) * .1 : 0;
    p.file.position.x = .02 + slide;
    const attention = beat.name === 'interruption' ? W.smooth(beat.u) : beat.name === 'consequence' ? 1 - W.settle(beat.u) : 0;
    const bob = beat.name === 'routine' ? Math.sin(beat.u * Math.PI * 2) : 0;
    W.plant(p.maker, { crouch: .035 + .012 * bob * bob, lean: .1 + .03 * slide / .1 - .07 * attention, twist: .05 * attention });
    W.aim(p.maker, { head: [.2 - .34 * attention, .1 * attention, 0] });
    p.file.updateMatrixWorld(true);
    p.leftGrip.getWorldPosition(p.v); const leftHome = p.v.toArray();
    p.rightGrip.getWorldPosition(p.v); const rightHome = p.v.toArray();
    const raisedL = [leftHome[0] - .02, leftHome[1] + .34, leftHome[2] - .1];
    const raisedR = [rightHome[0], rightHome[1] + .32, rightHome[2] - .08];
    let left = leftHome, right = rightHome;
    if (beat.name === 'interruption') {
      const k = W.smooth(beat.u);
      left = W.blend(leftHome, raisedL, k); right = W.blend(rightHome, raisedR, k);
    } else if (beat.name === 'consequence') {
      const back = W.settle(beat.u), up = Math.sin(beat.u * Math.PI);
      left = W.blend(raisedL, leftHome, back);
      right = W.blend(W.blend(raisedR, cord, up), rightHome, back);
    }
    p.palms[0] = W.reach(p.maker, -1, left);
    p.palms[1] = W.reach(p.maker, 1, right);
    const ring = beat.name === 'interruption' ? Math.sin(beat.u * Math.PI * 3) * W.smooth(Math.min(1, beat.u * 3)) : beat.name === 'consequence' ? Math.sin(beat.u * Math.PI * 2) * (1 - W.smooth(Math.min(1, beat.u / .35))) * .25 : 0;
    p.bell.rotation.z = ring;
  },
  contacts({ t, parts: p, W }) {
    const beat = W.act(t, acts), checks = [];
    if (beat.name === 'routine') {
      p.leftGrip.getWorldPosition(p.v); checks.push({ label: 'left palm on the file', a: p.palms[0], b: p.v.toArray() });
      p.rightGrip.getWorldPosition(p.v); checks.push({ label: 'right palm on the file', a: p.palms[1], b: p.v.toArray() });
    } else if (beat.name === 'consequence' && beat.u > .35 && beat.u < .7) checks.push({ label: 'right palm on the bell cord', a: p.palms[1], b: cord });
    for (const side of [-1, 1]) {
      const foot = side < 0 ? p.maker.leftFoot : p.maker.rightFoot;
      foot.getWorldPosition(p.v); const a = p.v.toArray();
      p.v.set(side * .13, .09, 0); p.maker.root.localToWorld(p.v);
      checks.push({ label: 'maker ankle stays planted', a, b: p.v.toArray() });
    }
    return checks;
  }
});
