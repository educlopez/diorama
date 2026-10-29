import { defineWorld } from '@diorama/worlds';
const acts = { routine: 2.2, interruption: 1, consequence: 1.8 };
const duration = acts.routine + acts.interruption + acts.consequence;
const still = acts.routine + acts.interruption + acts.consequence * .4;
const pile = -.1, edge = .34;
const orangeBase = [.04, 1.0, .26], gripLocal = [0, .02, -.08];
const crateHold = [-.1, .98, .18];

const orangeTrack = [
  { t: 0, value: pile },
  { t: acts.routine, value: pile },
  { t: acts.routine + acts.interruption, value: edge },
  { t: acts.routine + acts.interruption + acts.consequence * .32, value: edge },
  { t: acts.routine + acts.interruption + acts.consequence * .68, value: pile },
  { t: duration, value: pile }
];
function shiftOf(t, W) { return W.sample(t, orangeTrack); }
function gripAt(shift) {
  return [orangeBase[0] + shift + gripLocal[0], orangeBase[1] + gripLocal[1], orangeBase[2] + gripLocal[2]];
}

export default defineWorld({
  name: 'orange-stall', title: 'The loose orange', duration, still, acts, pixelInk: true,
  description: 'A toy-scale vendor keeps one hand on a crate while the other follows a loose orange. A second figure leans in, the orange travels to the edge, and the vendor brings it back.',
  bounds: [[-2.9, -.5, -2.3], [2.9, 2.4, 2.3]],
  contactTimes: [0, .8, 1.6, 2.05, still, 4.15, 4.55],
  build(W) {
    const { box, cylinder, ball, group } = W;
    W.terrain(5.4, 4.4, '#6d8a45', 31); W.grass(5.4, 4.4, 460, 37);
    for (let x = 0; x < 9; x++) for (let z = 0; z < 7; z++) box(.42, .045, .4, ['#bda86b', '#a89878', '#c4b59a'][(x + z) % 3], -1.7 + x * .42, .03, -1.25 + z * .4);
    for (const x of [-1.15, 1.15]) cylinder(.04, 1.55, '#8c5c38', x, .78, -.85);
    for (let i = 0; i < 8; i++) box(.28, .08, .02, i % 2 ? '#9e4d3d' : '#f5eddb', -1 + i * .28, 1.5, -.85);
    const stall = group(0, 0, .28);
    for (const x of [-.55, .55]) for (const z of [-.22, .22]) box(.05, .78, .05, '#8c5c38', x, .39, z, stall);
    box(1.24, .07, .56, '#a56b3e', 0, .8, 0, stall);
    box(.46, .16, .34, '#8c5c38', -.02, .9, -.02, stall);
    for (let i = 0; i < 5; i++) ball(.065, i % 2 ? '#9e4d3d' : '#c46a28', -.16 + (i % 3) * .14, .99, -.1 + Math.floor(i / 3) * .12, stall);
    const loose = group(...orangeBase);
    const fruit = ball(.09, '#9e4d3d', 0, 0, 0, loose);
    const grip = group(...gripLocal, loose);
    const vendor = W.toy(.06, .04, '#456185', '#2c2824', .9, '#c78f66');
    box(.28, .36, .02, '#f5eddb', 0, .28, .14, vendor.chest);
    const caller = W.toy(.92, .28, '#9e4d3d', '#2c2824', .86, '#c78f66');
    caller.root.rotation.y = -Math.PI / 2;
    const v = new W.THREE.Vector3();
    return { vendor, caller, loose, fruit, grip, v, palms: [[0, 0, 0], [0, 0, 0]] };
  },
  tick({ t, parts: p, W }) {
    const beat = W.act(t, acts);
    const shift = shiftOf(t, W);
    p.loose.position.x = orangeBase[0] + shift;
    p.fruit.rotation.z = -(shift - pile) * 5;
    const live = gripAt(shift), home = gripAt(pile);
    const caught = beat.name === 'consequence' && beat.u >= .32;
    let right = home;
    if (beat.name === 'routine' || caught) right = live;
    else if (beat.name === 'consequence') right = W.blend(home, gripAt(edge), W.smooth(Math.min(1, beat.u / .32)));
    const bob = beat.name === 'routine' ? Math.sin(beat.u * Math.PI * 2) : 0;
    const look = (shift - pile) / (edge - pile);
    W.plant(p.vendor, { crouch: .03 + .01 * bob * bob, lean: .08 + .04 * look, twist: .08 * look });
    W.aim(p.vendor, { head: [.14, .35 * look, 0] });
    p.palms[0] = W.reach(p.vendor, -1, crateHold);
    p.palms[1] = W.reach(p.vendor, 1, right);
    const shove = beat.name === 'interruption' ? Math.sin(beat.u * Math.PI) : 0;
    W.plant(p.caller, { crouch: .02 + .04 * shove, lean: .03 + .14 * shove, twist: 0 });
    W.aim(p.caller, { head: [.05 - .1 * shove, .2 * shove, 0] });
    W.reach(p.caller, 1, W.blend([.84, .86, .46], [.48, .98, .3], shove));
    W.reach(p.caller, -1, [.84, .84, .12]);
  },
  contacts({ t, parts: p, W }) {
    const beat = W.act(t, acts), checks = [];
    checks.push({ label: 'left palm on the crate', a: p.palms[0], b: crateHold });
    if (beat.name === 'routine' || (beat.name === 'consequence' && beat.u >= .32)) {
      const shift = shiftOf(t, W);
      checks.push({ label: 'right palm on the loose orange', a: p.palms[1], b: gripAt(shift) });
    }
    for (const actor of [p.vendor, p.caller]) for (const side of [-1, 1]) {
      const foot = side < 0 ? actor.leftFoot : actor.rightFoot;
      foot.getWorldPosition(p.v); const a = p.v.toArray();
      p.v.set(side * .13, .09, 0); actor.root.localToWorld(p.v);
      checks.push({ label: 'ankle stays planted', a, b: p.v.toArray() });
    }
    return checks;
  }
});
