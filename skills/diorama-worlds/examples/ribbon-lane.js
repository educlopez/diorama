import { defineWorld } from '@diorama/worlds';

const acts = { routine: 2.4, interruption: 1.3, consequence: 2.3 };
const duration = acts.routine + acts.interruption + acts.consequence;
const still = acts.routine + acts.interruption + acts.consequence * .4;
const pile = 0, edge = .16;
const lemonBase = [-.95, .86, .3];
const shopPath = [[-1.7, 1.15], [-.2, 1.35], [1.5, 1.1], [1.35, .35], [-1.4, .45]];
const browsePath = [[1.6, -.15], [.4, -.55], [-1.35, -.2], [-1.1, .55], [1.2, .7]];
const dashPath = [[-1.85, -.95], [1.7, -1.15], [1.4, -1.4], [-1.6, -1.25]];
const plum = '#6d3a78', marigold = '#e2a12e', teal = '#1f7a78', paprika = '#d64532', cream = '#f6edd8';
const indigo = '#2c3f74', leaf = '#6ea333', timber = '#8a552e', ink = '#2a2830', clay = '#c46a3a', moss = '#7d9a40';

const lemonTrack = [
  { t: 0, value: pile },
  { t: acts.routine, value: pile },
  { t: acts.routine + acts.interruption, value: edge },
  { t: acts.routine + acts.interruption + acts.consequence * .5, value: edge },
  { t: acts.routine + acts.interruption + acts.consequence * .82, value: pile },
  { t: duration, value: pile }
];
function shiftOf(t, W) { return W.sample(t, lemonTrack); }
function follow(W, actor, points, t, cycles, rush = 0) {
  const spot = W.trail(t / duration, points, { curve: true });
  actor.root.position.set(spot.x, 0, spot.z);
  actor.root.rotation.set(0, spot.heading, 0);
  W.stride(actor, { phase: cycles * t / duration, reach: rush ? .24 : .22, lift: rush ? .12 : .1, rush });
}
function cap(W, actor, color) {
  W.cylinder(.095, .06, color, 0, .12, 0, actor.head);
  W.cylinder(.15, .016, ink, 0, .085, 0, actor.head);
}

export default defineWorld({
  name: 'ribbon-lane', title: 'The lemon leaves the pile', duration, still, acts,
  description: 'A ribbon lane of stalls, carts and produce. The vendor lifts a basket through the ordinary round, then a lemon rolls to the edge. The vendor brings it back while shoppers keep walking the lane.',
  marks: { opening: 0, routine: acts.routine * .25, interruption: acts.routine + acts.interruption * .55, consequence: still },
  bounds: [[-3.55, -.7, -2.75], [3.55, 2.55, 2.75]],
  contactTimes: [0, .6, 1.2, 2.2, still],
  build(W) {
    const { box, cylinder, ball, group } = W;
    W.plinth(6.55, 5.2, .5, plum, marigold);
    W.terrain(5.5, 4.3, moss, 31);
    W.grass(5.5, 4.3, 480, 37);
    for (let x = 0; x < 10; x++) for (let z = 0; z < 7; z++) box(.4, .04, .38, ['#d8c7a4', '#c4b08a', '#efe2c8'][(x * 2 + z) % 3], -1.85 + x * .4, .03, -1.15 + z * .38);
    const stall = (x, z, awning, cloth) => {
      const g = group(x, 0, z);
      for (const dx of [-.55, .55]) for (const dz of [-.22, .22]) box(.05, .72, .05, timber, dx, .36, dz, g);
      box(1.28, .07, .55, '#c98448', 0, .74, 0, g);
      box(1.4, .05, .7, awning, 0, 1.28, -.05, g);
      box(1.35, .08, .62, cloth, 0, 1.2, -.05, g);
      for (const dx of [-.62, .62]) cylinder(.04, 1.22, timber, dx, .61, -.15, g);
      return g;
    };
    stall(-1.15, -.15, paprika, cream);
    stall(1.2, -.2, indigo, marigold);
    for (let i = 0; i < 9; i++) box(.22, .06, .02, i % 2 ? paprika : cream, -1.55 + i * .38, 1.55, -.9);
    box(1.6, .9, .12, cream, 0, .5, -1.55);
    box(1.7, .1, .4, paprika, 0, 1.0, -1.48);
    box(.4, .55, .06, indigo, -.45, .4, -1.47);
    box(.28, .28, .05, '#8ec8cf', .45, .55, -1.47);
    for (const [x, z, color] of [[-1.7, .2, leaf], [-1.45, -.4, paprika], [1.55, .15, marigold], [1.35, -.55, plum]]) {
      cylinder(.16, .18, timber, x, .12, z);
      ball(.1, color, x, .26, z);
    }
    for (let i = 0; i < 6; i++) ball(.055, [paprika, leaf, marigold, plum, clay, teal][i], -1.4 + (i % 3) * .16, .84, -.28 + Math.floor(i / 3) * .14);
    for (let i = 0; i < 5; i++) ball(.06, i % 2 ? '#f2d23a' : clay, .95 + (i % 3) * .14, .86, -.32 + Math.floor(i / 3) * .12);
    box(.34, .2, .28, timber, -1.45, .86, .02);
    const basket = group(-.82, .78, .28);
    cylinder(.14, .12, marigold, 0, 0, 0, basket);
    ball(.045, leaf, -.03, .07, 0, basket);
    ball(.04, paprika, .04, .07, .02, basket);
    const handle = group(0, .1, 0, basket);
    box(.22, .16, .2, '#a86a3a', -.55, .72, .42);
    box(.16, .12, .16, indigo, 1.45, .82, -.05);
    const cart = group(1.7, 0, .85);
    box(.7, .08, .4, timber, 0, .42, 0, cart);
    cylinder(.12, .06, ink, -.22, .28, .16, cart);
    cylinder(.12, .06, ink, .22, .28, .16, cart);
    box(.08, .4, .08, timber, -.28, .28, 0, cart);
    for (let i = 0; i < 4; i++) ball(.07, i % 2 ? leaf : paprika, -.15 + (i % 2) * .2, .52, -.05 + Math.floor(i / 2) * .12, cart);
    cylinder(.04, .9, ink, -1.9, .5, 1.15);
    ball(.08, marigold, -1.9, .98, 1.15);
    box(.16, .22, .16, cream, -1.55, .16, 1.2);
    box(.18, .2, .16, paprika, 1.55, .14, 1.25);
    W.tree(-2.15, -1.4, .4, 6);
    W.tree(2.15, 1.45, .34, 11);
    const loose = group(...lemonBase);
    ball(.08, '#f2d23a', 0, 0, 0, loose);
    const grip = group(0, .02, 0, loose);
    const leftCrate = group(-1.28, .84, .3);
    const rightCrate = group(-1.02, .84, .3);
    const basketGrip = group(0, .12, 0, basket);
    const vendor = W.toy(-1.15, .42, indigo, '#3a2a24', .66, '#e0a078', '#241c18', 1.02);
    box(.3, .34, .03, cream, 0, .1, .14, vendor.chest);
    box(.18, .1, .03, paprika, 0, .22, .16, vendor.chest);
    cap(W, vendor, plum);
    const shopper = W.toy(0, 0, teal, '#243044', .58, '#c4845c', '#1c1a17', 1.16);
    box(.16, .12, .14, marigold, 0, .18, .15, shopper.chest);
    cap(W, shopper, paprika);
    const browser = W.toy(0, 0, '#f2d23a', plum, .72, '#a86b48', '#3e342c', .84);
    cap(W, browser, teal);
    box(.22, .28, .03, cream, 0, .08, .12, browser.chest);
    const runner = W.toy(0, 0, paprika, ink, .48, '#f0c2a0', '#6a3030', 1.08);
    cap(W, runner, indigo);
    const v = new W.THREE.Vector3();
    return { vendor, shopper, browser, runner, loose, grip, leftCrate, rightCrate, basketGrip, basket, handle, v, palms: [[0, 0, 0], [0, 0, 0]] };
  },
  tick({ t: raw, parts: p, W }) {
    const t = raw >= duration - 1e-5 ? 0 : raw;
    const beat = W.act(t, acts);
    const work = beat.name === 'routine' ? Math.sin(beat.u * Math.PI * 2) : 0;
    const shift = shiftOf(t, W);
    p.loose.position.x = lemonBase[0] + shift;
    p.basket.position.y = .78 + Math.abs(work) * .16;
    const attention = beat.name === 'interruption' ? W.smooth(beat.u) : beat.name === 'consequence' ? 1 - W.settle(beat.u) : 0;
    W.plant(p.vendor, { crouch: .04 + .02 * Math.abs(work), lean: .1 + .06 * Math.abs(work) - .08 * attention, twist: -.45 * work + .25 * attention });
    W.aim(p.vendor, { head: [.2 + .15 * work - .35 * attention, .35 * work + .2 * attention, 0] });
    p.leftCrate.getWorldPosition(p.v); const leftHome = p.v.toArray();
    p.rightCrate.getWorldPosition(p.v); const rightHome = p.v.toArray();
    p.basket.updateMatrixWorld(true);
    p.basketGrip.getWorldPosition(p.v); const bunch = p.v.toArray();
    p.grip.getWorldPosition(p.v); const fruit = p.v.toArray();
    const raised = [leftHome[0], leftHome[1] + .16, leftHome[2] - .05];
    let left = leftHome, right = W.blend(rightHome, bunch, Math.abs(work));
    if (beat.name === 'interruption') {
      const k = W.smooth(beat.u);
      left = W.blend(leftHome, raised, k);
      right = W.blend(rightHome, fruit, k);
    } else if (beat.name === 'consequence') {
      const back = beat.u < .48 ? 0 : W.smooth((beat.u - .48) / .34);
      left = W.blend(raised, leftHome, back);
      right = W.blend(fruit, rightHome, back);
    }
    p.palms[0] = W.reach(p.vendor, -1, left);
    p.palms[1] = W.reach(p.vendor, 1, right);
    follow(W, p.shopper, shopPath, t, 4);
    W.cue(p.shopper, 'carry', 0);
    follow(W, p.browser, browsePath, t, 4);
    W.cue(p.browser, 'wave', 3 * t / duration);
    follow(W, p.runner, dashPath, t, 10, .75);
  },
  contacts({ t, parts: p, W }) {
    const beat = W.act(t, acts), checks = [];
    p.leftCrate.getWorldPosition(p.v); const leftHome = p.v.toArray();
    p.rightCrate.getWorldPosition(p.v); const rightHome = p.v.toArray();
    if (beat.name === 'routine' && Math.abs(Math.sin(beat.u * Math.PI * 2)) < .2) {
      checks.push({ label: 'left palm on the crate', a: p.palms[0], b: leftHome });
      checks.push({ label: 'right palm on the crate', a: p.palms[1], b: rightHome });
    } else if (beat.name === 'routine' && Math.abs(Math.sin(beat.u * Math.PI * 2)) > .85) {
      p.basketGrip.getWorldPosition(p.v);
      checks.push({ label: 'right palm on the basket', a: p.palms[1], b: p.v.toArray() });
    } else if (beat.name === 'consequence' && beat.u > .12 && beat.u < .46) {
      p.grip.getWorldPosition(p.v);
      checks.push({ label: 'right palm on the lemon', a: p.palms[1], b: p.v.toArray() });
    }
    for (const side of [-1, 1]) {
      const foot = side < 0 ? p.vendor.leftFoot : p.vendor.rightFoot;
      foot.getWorldPosition(p.v); const a = p.v.toArray();
      p.v.set(side * .13, .09, 0); p.vendor.root.localToWorld(p.v);
      checks.push({ label: 'vendor ankle stays planted', a, b: p.v.toArray() });
    }
    return checks;
  }
});
