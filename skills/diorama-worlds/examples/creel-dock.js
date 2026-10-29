import { defineWorld } from '@diorama/worlds';

const acts = { routine: 2.4, interruption: 1.3, consequence: 2.3 };
const duration = acts.routine + acts.interruption + acts.consequence;
const still = acts.routine + acts.interruption + acts.consequence * .4;
const quayPath = [[-1.55, .15], [-.4, .55], [.85, .25], [.55, -.45], [-1.2, -.35]];
const dashPath = [[-1.7, 1.15], [1.2, 1.35], [.7, .95], [-1.45, .9]];
const swimPath = [[1.15, -.15], [1.85, -.7], [1.35, -1.25], [.55, -.85]];
const tide = '#2f8f96', hull = '#8c4e32', kelp = '#6a7a3e', coral = '#d25a48', cream = '#f4ead8';
const navy = '#24344e', sand = '#e4c48a', brass = '#e2b14a', ink = '#1d2428', moss = '#7f9a48', rope = '#c4a06a';

function follow(W, actor, points, t, cycles, rush = 0) {
  const spot = W.trail(t / duration, points, { curve: true });
  actor.root.position.set(spot.x, 0, spot.z);
  actor.root.rotation.set(0, spot.heading, 0);
  W.stride(actor, { phase: cycles * t / duration, reach: rush ? .24 : .22, lift: rush ? .12 : .1, rush });
}
function cap(W, actor, color) {
  W.cylinder(.1, .07, color, 0, .13, 0, actor.head);
  W.cylinder(.15, .016, ink, 0, .09, 0, actor.head);
}

export default defineWorld({
  name: 'creel-dock', title: 'The creel tips', duration, still, acts,
  description: 'A creel dock beside flat water. A fisher works a pole through the ordinary cast, a walker and a runner stay on the quay, and a swimmer paddles the basin. A creel tips, the fisher answers it, and the dock returns to the opening pose.',
  marks: { opening: 0, routine: acts.routine * .25, interruption: acts.routine + acts.interruption * .5, consequence: still },
  bounds: [[-3.6, -.75, -2.8], [3.6, 2.6, 2.8]],
  contactTimes: [.15, .6, 1.5, 2.1, still],
  build(W) {
    const { box, cylinder, ball, group, line } = W;
    W.plinth(6.6, 5.25, .54, '#3d4c55', sand);
    W.terrain(5.55, 4.35, moss, 41);
    W.grass(5.55, 4.35, 420, 43);
    box(3.3, .08, 2.15, tide, 1.35, .02, -.35);
    box(2.4, .06, 1.7, '#247a84', 1.45, .07, -.4);
    for (let i = 0; i < 5; i++) box(.08, .015, .9, '#d7f2f2', .7 + i * .45, .09, -.55);
    for (let x = 0; x < 6; x++) box(2.3, .05, .16, x % 2 ? '#d8b07a' : '#b88858', -.55, .06, -.55 + x * .18);
    box(2.5, .12, .12, navy, -.45, .1, .55);
    box(.12, .16, 1.3, navy, .7, .1, -.1);
    const shack = group(-1.7, 0, -1.15);
    box(1.15, 1.05, .9, cream, 0, .55, 0, shack);
    box(1.3, .1, 1.05, coral, 0, 1.12, 0, shack);
    box(.32, .55, .06, hull, -.15, .4, .46, shack);
    box(.28, .24, .05, '#8ec8cf', .28, .7, .46, shack);
    cylinder(.04, 1.7, ink, .2, .9, -.2, shack);
    box(.28, .16, .02, coral, .2, 1.55, -.2, shack);
    for (const [x, z] of [[-.9, .7], [-1.2, .95], [-.55, .85]]) {
      cylinder(.14, .16, kelp, x, .12, z);
      cylinder(.1, .12, '#d8c07a', x, .26, z);
    }
    const creel = group(-.58, 0, .08);
    cylinder(.07, .74, navy, 0, .37, 0, creel);
    const lid = group(.04, .8, .04, creel);
    box(.22, .12, .18, kelp, 0, 0, 0, lid);
    box(.16, .035, .12, sand, 0, .08, 0, lid);
    const creelGrip = group(.08, .86, .05, creel);
    cylinder(.16, .28, hull, .35, .16, .7);
    cylinder(.12, .22, navy, .6, .13, .95);
    for (let i = 0; i < 5; i++) ball(.045, i % 2 ? coral : brass, .25 + (i % 3) * .08, .34, .62 + Math.floor(i / 3) * .08);
    const boat = group(1.55, .08, .55);
    box(.85, .16, .34, hull, 0, .1, 0, boat);
    box(.7, .08, .22, sand, 0, .2, 0, boat);
    box(.06, .28, .28, cream, -.15, .28, 0, boat);
    cylinder(.03, .55, ink, .15, .4, 0, boat);
    box(.16, .1, .02, coral, .15, .62, 0, boat);
    cylinder(.08, .2, navy, 1.9, .16, -1.15);
    cylinder(.1, .14, brass, 1.15, .12, -.95);
    line([[-.2, .4, .9], [.5, .28, 1.05], [1.1, .2, .3]], rope, .02);
    for (let i = 0; i < 4; i++) box(.18, .12, .16, i % 2 ? cream : sand, -1.4 + i * .22, .1, -1.55);
    box(.55, .4, .06, navy, .15, .7, -1.5);
    box(.35, .08, .06, coral, .15, .85, -1.46);
    box(.35, .06, .06, brass, .15, .62, -1.46);
    cylinder(.05, .7, ink, -1.95, .4, .2);
    ball(.07, brass, -1.95, .8, .2);
    W.tree(2.2, 1.4, .38, 8);
    W.tree(-2.2, 1.25, .32, 3);
    const pole = group(-.78, .9, -.02);
    cylinder(.025, .9, '#6a4a30', 0, .05, .42, pole);
    const lowGrip = group(-.05, .02, .04, pole), highGrip = group(.05, .06, .05, pole);
    const fisher = W.toy(-.95, -.15, navy, '#5a3a28', .66, '#e0a078', '#241c18', 1.04);
    box(.26, .3, .03, kelp, 0, .1, .13, fisher.chest);
    cap(W, fisher, coral);
    const walker = W.toy(0, 0, coral, navy, .58, '#c4845c', '#1c1a17', 1.18);
    box(.16, .12, .14, sand, 0, .18, .14, walker.chest);
    cap(W, walker, kelp);
    const runner = W.toy(0, 0, brass, ink, .5, '#f0c2a0', '#6b3030', .9);
    cap(W, runner, tide);
    const swimmer = W.toy(0, 0, '#f2d23a', tide, .56, '#f0c2a0', tide, .92);
    cap(W, swimmer, coral);
    const v = new W.THREE.Vector3();
    return { fisher, walker, runner, swimmer, pole, boat, creel, lid, creelGrip, lowGrip, highGrip, v, palms: [[0, 0, 0], [0, 0, 0]] };
  },
  tick({ t: raw, parts: p, W }) {
    const t = raw >= duration - 1e-5 ? 0 : raw;
    const beat = W.act(t, acts);
    const cast = beat.name === 'routine' ? Math.sin(beat.u * Math.PI * 2) : 0;
    p.pole.rotation.x = .15 + cast * .8;
    p.boat.position.y = .08 + Math.sin(W.phase(t, duration) * Math.PI * 2) * .035;
    p.boat.rotation.z = Math.sin(W.phase(t, duration) * Math.PI * 2) * .04;
    const tip = beat.name === 'interruption' ? Math.sin(beat.u * Math.PI) : beat.name === 'consequence' ? Math.sin(beat.u * Math.PI) * (1 - W.settle(beat.u)) : 0;
    p.lid.rotation.z = tip * .9;
    const attention = beat.name === 'interruption' ? W.smooth(beat.u) : beat.name === 'consequence' ? 1 - W.settle(beat.u) : 0;
    W.plant(p.fisher, { crouch: .04 + .02 * cast, lean: .08 + .16 * cast, twist: .3 * cast });
    W.aim(p.fisher, { head: [.12 - .15 * cast, -.15 * cast + .7 * attention, 0] });
    p.pole.updateMatrixWorld(true);
    p.lowGrip.getWorldPosition(p.v); const low = p.v.toArray();
    p.highGrip.getWorldPosition(p.v); const high = p.v.toArray();
    p.creelGrip.getWorldPosition(p.v); const handle = p.v.toArray();
    const lifted = [high[0] + .02, high[1] + .1, high[2] - .03];
    let left = low, right = high;
    if (beat.name === 'interruption') {
      right = W.blend(high, lifted, W.smooth(beat.u));
    } else if (beat.name === 'consequence') {
      const back = beat.u < .46 ? 0 : W.smooth((beat.u - .46) / .36);
      const grab = beat.u < .16 ? W.smooth(beat.u / .16) : 1;
      right = W.blend(W.blend(lifted, handle, beat.u < .46 ? grab : 1), high, back);
    }
    p.palms[0] = W.reach(p.fisher, -1, left);
    p.palms[1] = W.reach(p.fisher, 1, right);
    follow(W, p.walker, quayPath, t, 4);
    W.cue(p.walker, 'carry', 0);
    follow(W, p.runner, dashPath, t, 9, .7);
    const spot = W.trail(t / duration, swimPath, { curve: true });
    p.swimmer.root.position.set(spot.x, -.28, spot.z);
    p.swimmer.root.rotation.set(0, spot.heading, 0);
    W.paddle(p.swimmer, { phase: 8 * t / duration });
  },
  contacts({ t, parts: p, W }) {
    const beat = W.act(t, acts), checks = [];
    p.pole.updateMatrixWorld(true);
    if (beat.name === 'routine') {
      p.lowGrip.getWorldPosition(p.v); checks.push({ label: 'left palm on the pole', a: p.palms[0], b: p.v.toArray() });
      p.highGrip.getWorldPosition(p.v); checks.push({ label: 'right palm on the pole', a: p.palms[1], b: p.v.toArray() });
    } else if (beat.name === 'consequence' && beat.u > .2 && beat.u < .44) {
      p.creelGrip.getWorldPosition(p.v); checks.push({ label: 'right palm on the creel', a: p.palms[1], b: p.v.toArray() });
    }
    for (const side of [-1, 1]) {
      const foot = side < 0 ? p.fisher.leftFoot : p.fisher.rightFoot;
      foot.getWorldPosition(p.v); const a = p.v.toArray();
      p.v.set(side * .13, .09, 0); p.fisher.root.localToWorld(p.v);
      checks.push({ label: 'fisher ankle stays planted', a, b: p.v.toArray() });
    }
    return checks;
  }
});
