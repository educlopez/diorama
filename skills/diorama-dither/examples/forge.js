/* A mountain smithy. The smith's hammer comes down, a short burst of
   bright sparks leaves the anvil, and smoke leaves the stack. The mule
   stands in profile. Tap the smith to rest. */
Pixel.scene({
  name: 'forge',
  title: 'The mountain forge',
  means: 'A smith strikes the anvil by a stone forge. Smoke leaves the chimney, and a mule waits with the cart.',
  hint: 'Hover the smith or the mule; tap the smith to rest.',
  width: 360, height: 280, duration: 8, still: 2, fps: 12,
  bayer: 4, shadow: 'hard', rim: true, wind: 8, contact: .4,
  camera: { az: 45, el: 30, height: 1.62, scale: 56 },
  sun: Dither.sun(45, 46, 16),
  ground: {
    rx: 3.6, rz: 2.75, wobble: .32, fade: .3, rect: true,
    zone: function (x, z) {
      if (z < -1.15 || x < -2.15) return 'rock';
      if (x > -.4 && x < 1.3 && z > -.15 && z < 1.35) return 'earth';
      return 'meadow';
    }
  },
  materials: {
    meadow: Dither.mat('meadow'), earth: Dither.mat('earth'), rock: Dither.mat('rock'),
    stone: Dither.mat('stone'), timber: Dither.mat('timber'), tile: Dither.mat('tile'),
    beam: Dither.mat('beam'), iron: Dither.mat('iron'), ember: Dither.mat('ember'),
    coal: Dither.mat('coal'), smoke: Dither.mat('smoke'), hide: Dither.mat('hide'),
    cart: Dither.mat('cart'), leaf: Dither.mat('leaf'), moss: Dither.mat('moss'),
    spark: Dither.mat('#f3e2a4', { tex: 'plain', rough: 0, dither: 0 })
  },
  build: function (P) {
    var parts = { plants: [] };
    P.wedge(2.4, 1.5, 1.6, 'rock', -2.3, 0, -1.55);
    P.wedge(1.7, 1.15, 1.3, 'rock', -.4, 0, -1.85).rotation.y = .4;
    Dither.wall(P, 1.7, -1.5, 2.2, .15, { h: .4, stone: 'rock', cap: 'stone' });

    var shed = P.group(-.55, 0, -.45);
    shed.rotation.y = .45;
    P.box(1.7, 1.05, 1.25, 'stone', 0, .52, 0, shed);
    P.box(.34, .5, .08, 'coal', .35, .38, .64, shed);
    parts.mouth = P.box(.28, .32, .06, 'ember', .35, .4, .7, shed);
    P.wedge(2.0, .5, 1.55, 'tile', 0, 1.05, 0, shed);
    P.box(.26, .72, .26, 'rock', -.5, 1.4, -.15, shed);
    P.box(.34, .06, .34, 'stone', -.5, 1.78, -.15, shed);

    P.box(.16, .38, .14, 'iron', .15, .19, .85);
    P.box(.42, .1, .18, 'iron', .15, .42, .85);
    P.box(.16, .08, .08, 'iron', -.08, .5, .85);

    var smith = Dither.folk(P, .95, 1.55, {
      h: .44, yaw: 2.2, name: 'smith',
      shirt: '#8d3a2a', pants: '#2a241c', sleeve: '#6e2e22', hair: '#1a140f', shoes: '#14110e'
    });
    parts.smith = smith;
    parts.hammer = P.group(0, -.02, .02, smith.handR);
    P.box(.05, .24, .05, 'beam', 0, .12, 0, parts.hammer);
    P.box(.1, .06, .08, 'iron', 0, .26, 0, parts.hammer);
    parts.sparks = [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) {
      var big = i % 2 === 0, a = i / 8 * Math.PI * 2;
      var s = P.box(big ? .11 : .07, big ? .1 : .12, big ? .06 : .05, i % 2 === 0 ? 'spark' : 'ember', .15, .52, .85);
      s.home = [.15, .52, .85];
      s.dir = [Math.cos(a), Math.sin(a)];
      return s;
    });

    parts.smoke = [0, 1, 2, 3].map(function (i) {
      var g = P.group(-.5, 1.82, -.15, shed);
      P.box(.18 - i * .02, .12, .16 - i * .02, 'smoke', 0, 0, 0, g);
      g.base = [-.5, 1.82, -.15];
      g.phase = i / 4;
      return g;
    });

    var mule = P.group(1.7, 0, .35);
    mule.rotation.y = .42;
    mule.name = 'mule';
    parts.mule = mule;
    P.box(.84, .3, .22, 'hide', -.02, .68, 0, mule);
    var neck = P.box(.14, .32, .14, 'hide', .36, .82, 0, mule);
    neck.rotation.z = -.55;
    P.box(.28, .16, .16, 'hide', .58, .96, 0, mule);
    P.box(.14, .08, .1, 'hide', .76, .92, 0, mule);
    P.box(.05, .16, .04, 'coal', .5, 1.1, .05, mule);
    P.box(.05, .16, .04, 'coal', .5, 1.1, -.05, mule);
    P.box(.08, .18, .06, 'coal', .28, .96, 0, mule);
    P.box(.05, .24, .04, 'coal', -.46, .56, 0, mule);
    [[-.26, .18], [-.26, -.18], [.16, .17], [.16, -.17]].forEach(function (p) {
      P.box(.07, .5, .07, 'hide', p[0], .28, p[1], mule);
      P.box(.09, .07, .09, 'coal', p[0], .04, p[1], mule);
    });

    var cart = P.group(2.25, 0, 1.4);
    cart.rotation.y = -.4;
    P.box(.9, .08, .5, 'cart', 0, .42, 0, cart);
    P.box(.9, .22, .05, 'cart', 0, .56, .24, cart);
    P.box(.9, .22, .05, 'cart', 0, .56, -.24, cart);
    P.box(.22, .16, .16, 'coal', -.1, .54, 0, cart);
    [-.25, .25].forEach(function (x) {
      var w = P.cyl(.14, .14, .06, 'iron', x, .16, .28, cart, 6);
      w.rotation.x = Math.PI / 2;
    });

    Dither.fence(P, -1.7, 1.15, .7, 4);
    parts.plants.push(Dither.tree(P, 2.15, -1.35, { r: .42, h: .6, clusters: 4, seed: 4 }));
    parts.plants = parts.plants.concat(Dither.fringe(P, [[-2.2, .8], [1.2, 1.7], [-1.5, 1.5]]));
    parts.hot = [smith.root, mule];
    return parts;
  },
  tick: function (c) {
    var t = c.t, q = c.q, p = c.parts, P = c.P;
    var work = c.active !== p.smith.root;
    /* Two short bursts a loop. At the still (q = 0.25) the burst is mid-flight. */
    var u = ((q + .29) * 2) % 1;
    var live = u < .18;
    var down = !work ? 0 : live ? u / .18 : u < .4 ? 1 - (u - .18) / .22 : 0;
    P.pose(p.smith, work ? 'work' : 'stand');
    p.smith.body.rotation.x = work ? .35 : .05;
    p.smith.armR.rotation.x = work ? P.lerp(-2.05, -.32, down) : -.25;
    p.smith.elbowR.rotation.x = work ? P.lerp(-.15, -1.05, down) : -.2;
    p.smith.armL.rotation.x = work ? -1.35 : -.15;
    p.smith.elbowL.rotation.x = work ? -.4 : -.15;
    p.sparks.forEach(function (s) {
      s.visible = work && live;
      var k = u / .18;
      s.position.set(s.home[0] + s.dir[0] * k * .42, s.home[1] + k * .55 * (1 - k * .35), s.home[2] + s.dir[1] * k * .28);
    });
    p.mouth.visible = work;
    p.smoke.forEach(function (g) {
      var u = (q + g.phase) % 1;
      g.visible = work || u < .35;
      g.position.set(g.base[0] + Math.sin((q + g.phase) * P.TAU) * .06, g.base[1] + u * 1.05, g.base[2]);
    });
    p.plants.forEach(function (g, i) { Dither.sway(P, g, g.base, t, 1.5, i * .21); });
    c.read = work ? 'smith · at the anvil' : 'smith · resting';
  }
});
