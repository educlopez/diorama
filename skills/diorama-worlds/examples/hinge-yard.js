import { defineWorld } from '@diorama/worlds';

const acts = { routine: 2.4, interruption: 1.3, consequence: 2.3 };
const duration = acts.routine + acts.interruption + acts.consequence;
const still = acts.routine + acts.interruption + acts.consequence * .42;
const cord = [-.02, .84, .16];
const carrierPath = [[.35, 1.05], [1.55, .72], [1.45, -.35], [.15, -.7], [-.15, .35]];
const sweeperPath = [[-1.75, 1.32], [1.45, 1.48], [.85, 1.02], [-1.55, .98]];
const runnerPath = [[-1.65, -1.02], [1.45, -.9], [1.15, -1.28], [-1.45, -1.32]];
const timber = '#8a4e2c', plank = '#d48945', plaster = '#f3e3c4', clay = '#b8432f', copper = '#d2642e';
const brass = '#e2b14a', ink = '#243044', vine = '#3d7a34', leaf = '#86b23d', slate = '#5d6b74';
const cream = '#f7f0e2', moss = '#6e8f3c', stone = '#c4b6a2', rose = '#c4473a', teal = '#2a7a62';

function follow(W, actor, points, t, cycles, rush = 0) {
  const spot = W.trail(t / duration, points, { curve: true });
  actor.root.position.set(spot.x, 0, spot.z);
  actor.root.rotation.set(0, spot.heading, 0);
  W.stride(actor, { phase: cycles * t / duration, reach: rush ? .24 : .22, lift: rush ? .12 : .1, rush });
}
function cap(W, actor, color) {
  W.cylinder(.1, .07, color, 0, .13, 0, actor.head);
  W.cylinder(.155, .018, ink, 0, .09, 0, actor.head);
}

export default defineWorld({
  name: 'hinge-yard', title: 'The hinge on the bench', duration, still, acts,
  description: 'A hinge yard at full stretch: a filer works a copper hinge, a carrier walks a crate around the yard, a sweeper keeps the front lane, and a runner cuts the back. A bell breaks the stroke, one hand finds the cord, and the yard returns to the first pose.',
  marks: { opening: 0, routine: acts.routine * .25, interruption: acts.routine + acts.interruption * .45, consequence: still },
  bounds: [[-3.5, -.7, -2.7], [3.5, 2.45, 2.7]],
  contactTimes: [.2, .6, 1.2, 1.8, 2.2, still, 4.9],
  build(W) {
    const { box, cylinder, ball, group, line } = W;
    W.plinth(6.5, 5.15, .52, '#6b422c', '#e4c48a');
    W.terrain(5.45, 4.25, moss, 19);
    W.grass(5.45, 4.25, 520, 23);
    for (let x = 0; x < 8; x++) for (let z = 0; z < 6; z++) box(.46, .035, .42, (x + z) % 2 ? stone : '#a89880', -1.55 + x * .46, .03, -.85 + z * .42);
    box(3.5, 1.42, .16, plaster, -.05, .74, -1.58);
    box(3.7, .12, .7, clay, -.05, 1.5, -1.48);
    box(.16, .55, .16, slate, 1.15, 1.72, -1.62);
    box(.55, .95, .08, '#7e4630', -1.15, .52, -1.48);
    box(.42, .34, .06, '#8ec8cf', -.15, .95, -1.48);
    box(.42, .34, .06, '#8ec8cf', .7, .95, -1.48);
    box(.5, .08, .08, timber, -.15, .78, -1.44);
    box(.5, .08, .08, timber, .7, .78, -1.44);
    for (const x of [-1.55, 1.45]) box(.1, 1.35, .22, timber, x, .7, -1.5);
    box(1.15, 1.05, .9, '#efe0c8', 1.85, .55, -.55);
    box(1.25, .1, 1.05, clay, 1.85, 1.1, -.55);
    box(.28, .4, .06, '#7eb8c4', 1.85, .7, -.12);
    for (let i = 0; i < 4; i++) ball(.1, i % 2 ? vine : leaf, -1.2 + i * .55, .35 + (i % 2) * .2, -1.42);
    cylinder(.05, 1.15, timber, -1.85, .58, -.2);
    for (let i = 0; i < 5; i++) box(.42, .06, .12, i % 2 ? timber : plank, -1.72, .2 + i * .18, -.05);
    box(.7, .55, .08, cream, -1.95, .85, .55);
    box(.5, .12, .08, rose, -1.95, .95, .59);
    box(.5, .08, .08, brass, -1.95, .78, .59);
    for (const z of [-.2, .15, .5]) { cylinder(.045, .7, slate, 1.15, .4, z); box(.28, .05, .08, brass, 1.28, .55 + (z + .2) * .15, z); }
    const table = group(-.35, 0, .4);
    for (const x of [-.48, .48]) for (const z of [-.2, .2]) box(.06, .58, .06, timber, x, .29, z, table);
    box(1.15, .07, .5, plank, 0, .6, 0, table);
    box(.2, .08, .16, ink, .28, .66, -.02, table);
    const vise = group(.28, .74, .38);
    cylinder(.06, .16, slate, 0, 0, 0, vise);
    box(.16, .04, .04, brass, .1, .02, 0, vise);
    const file = group(-.35, .7, .28);
    box(.4, .025, .06, brass, 0, .02, 0, file);
    box(.05, .04, .07, timber, -.16, .04, 0, file);
    box(.05, .04, .07, timber, .16, .04, 0, file);
    const leftGrip = group(-.12, .05, 0, file), rightGrip = group(.12, .05, 0, file);
    const drawer = group(-.35, .48, .48);
    box(.32, .1, .2, timber, 0, 0, 0, drawer);
    box(.08, .04, .04, brass, 0, .02, .1, drawer);
    cylinder(.045, 1.05, timber, .18, .52, .2);
    line([[.18, 1.02, .2], [-.02, 1.02, .16]], timber, .018);
    const bell = group(-.02, 1.02, .16);
    cylinder(.14, .16, brass, 0, -.08, 0, bell, 10);
    ball(.035, ink, 0, -.18, 0, bell);
    line([[-.02, .92, .16], cord], timber, .012);
    ball(.035, rose, ...cord);
    for (const [x, z] of [[-1.55, .35], [-1.25, .5], [-1.6, .7]]) box(.28, .22, .24, x < -1.4 ? timber : plank, x, .14, z);
    cylinder(.18, .32, '#7a4630', 1.55, .18, .85);
    cylinder(.2, .28, slate, 1.25, .16, .55);
    box(.34, .16, .2, ink, .95, .12, .62);
    box(.08, .1, .16, brass, 1.05, .24, .62);
    for (let i = 0; i < 4; i++) cylinder(.05, .55, i % 2 ? timber : plank, -1.35 + i * .1, .2, -1.05);
    cylinder(.1, .16, slate, -.9, .1, 1.15);
    ball(.08, vine, -1.7, .12, 1.2);
    ball(.1, leaf, -1.45, .14, 1.35);
    ball(.07, rose, 1.6, .1, 1.25);
    box(.22, .16, .22, cream, 1.35, .1, 1.3);
    W.tree(-2.15, -1.35, .42, 4);
    W.tree(2.2, 1.35, .36, 9);
    const maker = W.toy(-.35, .02, '#2f5d86', '#3a2a24', .64, '#e0a078', '#2a2420', 1.08);
    box(.28, .32, .03, cream, 0, .12, .13, maker.chest);
    cap(W, maker, ink);
    const carrier = W.toy(0, 0, rose, '#243044', .56, '#c4845c', '#1c1a17', 1.22);
    box(.2, .14, .18, plank, 0, .2, .16, carrier.chest);
    cap(W, carrier, clay);
    const sweeper = W.toy(0, 0, teal, '#6d4a2c', .7, '#a86b48', '#3e342c', .86);
    box(.035, .62, .035, timber, 0, -.34, 0, sweeper.rightHand);
    box(.16, .08, .1, moss, 0, -.64, 0, sweeper.rightHand);
    cap(W, sweeper, cream);
    const runner = W.toy(0, 0, brass, '#2c3140', .5, '#f0c2a0', '#6a3030', 1.05);
    cap(W, runner, rose);
    box(.16, .08, .04, teal, 0, .42, .08, runner.chest);
    const v = new W.THREE.Vector3();
    return { maker, carrier, sweeper, runner, file, vise, drawer, bell, leftGrip, rightGrip, v, palms: [[0, 0, 0], [0, 0, 0]] };
  },
  tick({ t: raw, parts: p, W }) {
    const t = raw >= duration - 1e-5 ? 0 : raw;
    const beat = W.act(t, acts);
    const stroke = beat.name === 'routine' ? Math.sin(beat.u * Math.PI * 2) : 0;
    p.file.position.x = -.35 + stroke * .1;
    p.vise.rotation.z = stroke * 1.15;
    p.drawer.position.z = .48 + Math.abs(stroke) * .14;
    const attention = beat.name === 'interruption' ? W.smooth(beat.u) : beat.name === 'consequence' ? 1 - W.settle(beat.u) : 0;
    W.plant(p.maker, { crouch: .045 + .035 * Math.abs(stroke), lean: .1 + .14 * stroke - .18 * attention, twist: .4 * attention });
    W.aim(p.maker, { head: [.22 - .55 * attention, .2 * attention, 0] });
    p.file.updateMatrixWorld(true);
    p.leftGrip.getWorldPosition(p.v); const leftHome = p.v.toArray();
    p.rightGrip.getWorldPosition(p.v); const rightHome = p.v.toArray();
    const raisedL = [leftHome[0] - .02, leftHome[1] + .2, leftHome[2] - .06];
    const raisedR = [rightHome[0] + .02, rightHome[1] + .18, rightHome[2] - .05];
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
    follow(W, p.carrier, carrierPath, t, 5);
    W.cue(p.carrier, 'carry', 0);
    follow(W, p.sweeper, sweeperPath, t, 4);
    W.cue(p.sweeper, 'sweep', 4 * t / duration);
    follow(W, p.runner, runnerPath, t, 9, .7);
    const ring = beat.name === 'interruption' ? Math.sin(beat.u * Math.PI * 4) * W.smooth(Math.min(1, beat.u * 3)) * .4 : 0;
    p.bell.rotation.z = ring;
  },
  contacts({ t, parts: p, W }) {
    const beat = W.act(t, acts), checks = [];
    if (beat.name === 'routine') {
      p.leftGrip.getWorldPosition(p.v); checks.push({ label: 'left palm on the hinge', a: p.palms[0], b: p.v.toArray() });
      p.rightGrip.getWorldPosition(p.v); checks.push({ label: 'right palm on the hinge', a: p.palms[1], b: p.v.toArray() });
    } else if (beat.name === 'consequence' && beat.u > .28 && beat.u < .7) checks.push({ label: 'right palm on the cord', a: p.palms[1], b: cord });
    for (const side of [-1, 1]) {
      const foot = side < 0 ? p.maker.leftFoot : p.maker.rightFoot;
      foot.getWorldPosition(p.v); const a = p.v.toArray();
      p.v.set(side * .13, .09, 0); p.maker.root.localToWorld(p.v);
      checks.push({ label: 'filer ankle stays planted', a, b: p.v.toArray() });
    }
    return checks;
  }
});
