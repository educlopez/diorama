/* A timber tea house with two shoji walls, a plank floor and a roof that
   overhangs. Carp stay in the near water, clear of the bridge. Tap the host
   and the paper shifts from day to dusk. No halo. */
Pixel.scene({
  name: 'tea-house',
  title: 'The tea house',
  means: 'A timber tea house by a koi pond. Carp circle in the near water, and a tap shifts the hour from day to dusk.',
  hint: 'Hover the host or a lantern; tap the host to change the hour.',
  width: 360, height: 280, duration: 8, still: 2, fps: 12,
  bayer: 4, shadow: 'hard', rim: true, wind: 8, contact: .4,
  camera: { az: 45, el: 30, height: .22, scale: 62 },
  sun: Dither.sun(45, 40, 14),
  ground: {
    rx: 3.7, rz: 2.8, wobble: .34, fade: .3,
    zone: function (x, z) {
      var dx = (x - .05) / 1.3, dz = (z - .05) / 1.05;
      if (dx * dx + dz * dz < 1) return 'pond';
      if (x > .9 && z > .85) return 'sand';
      return 'moss';
    }
  },
  materials: {
    moss: Dither.mat('moss', { ground: true }), pond: Dither.mat('pond'), sand: Dither.mat('sand'),
    timber: Dither.mat('timber'), ink: Dither.mat('ink'), paper: Dither.mat('paper'),
    lantern: Dither.mat('lantern'), tile: Dither.mat('tile'), leaf: Dither.mat('leaf'),
    beam: Dither.mat('beam'), stone: Dither.mat('stone'), ember: Dither.mat('ember'),
    koi: Dither.mat('koi'),
    dusk: Dither.mat('#e7b56a', { tex: 'cloth', rough: .3 })
  },
  build: function (P) {
    var parts = { plants: [] };
    /* Near corner toward the camera: a plank floor, a front shoji, a side
       shoji, and a roof that overhangs both. */
    var house = P.group(-1.2, 0, -.3);
    house.rotation.y = .48;
    var pi;
    for (pi = 0; pi < 8; pi++) P.box(1.95, .08, .11, pi % 2 ? 'timber' : 'beam', .05, .1, -.72 + pi * .18, house);
    [[-.72, -.42], [.72, -.42], [-.72, .42], [.72, .42]].forEach(function (p) {
      P.box(.08, .9, .08, 'ink', p[0], .55, p[1], house);
    });
    function sheet(parent, x, z, w, yaw, mat) {
      var g = P.group(x, 0, z, parent);
      g.rotation.y = yaw;
      P.box(w, .7, .03, mat, 0, .58, 0, g);
    }
    function lattice(x, z, w, yaw) {
      var g = P.group(x, 0, z, house);
      g.rotation.y = yaw;
      P.box(w, .04, .045, 'ink', 0, .4, .04, g);
      P.box(w, .04, .045, 'ink', 0, .64, .04, g);
      P.box(w, .04, .045, 'ink', 0, .88, .04, g);
      P.box(.04, .74, .045, 'ink', -w * .25, .58, .04, g);
      P.box(.04, .74, .045, 'ink', w * .25, .58, .04, g);
      P.box(w + .06, .05, .06, 'ink', 0, .26, .03, g);
      P.box(w + .06, .05, .06, 'ink', 0, .94, .03, g);
    }
    parts.day = P.group(0, 0, 0, house);
    parts.dusk = P.group(0, 0, 0, house);
    sheet(parts.day, -.38, .46, .58, 0, 'paper');
    sheet(parts.day, .38, .46, .58, 0, 'paper');
    sheet(parts.day, .76, 0, .78, Math.PI / 2, 'paper');
    sheet(parts.dusk, -.38, .48, .58, 0, 'dusk');
    sheet(parts.dusk, .38, .48, .58, 0, 'dusk');
    sheet(parts.dusk, .78, 0, .78, Math.PI / 2, 'dusk');
    lattice(-.38, .5, .58, 0);
    lattice(.38, .5, .58, 0);
    lattice(.8, 0, .78, Math.PI / 2);
    P.box(2.2, .06, 1.7, 'ink', 0, 1.02, 0, house);
    P.wedge(2.05, .42, 1.52, 'tile', 0, 1.04, 0, house);

    var bridge = P.group(.15, 0, .15);
    bridge.rotation.y = .15;
    P.box(1.7, .06, .46, 'timber', 0, .28, 0, bridge);
    [-.2, .2].forEach(function (z) {
      P.box(1.7, .05, .05, 'ink', 0, .42, z, bridge);
      [-.7, .7].forEach(function (x) { P.box(.05, .16, .05, 'ink', x, .34, z, bridge); });
    });

    [[-1.9, .85], [.95, -1.15], [-.2, 1.55]].forEach(function (p) { Dither.lamp(P, p[0], p[1], { h: .7, post: 'ink', shade: 'lantern' }); });
    parts.cores = P.group(0, 0, 0);
    [[-1.9, .85], [.95, -1.15], [-.2, 1.55]].forEach(function (p) {
      P.box(.1, .12, .1, 'ember', p[0], .86, p[1], parts.cores);
    });
    parts.sun = P.cyl(.16, .16, .05, 'ember', -1.85, 1.85, -.15, null, 8);

    function fish(scale, name) {
      var g = P.group(0, .07, 0); g.name = name;
      P.box(.28 * scale, .08, .1, 'koi', 0, 0, 0, g);
      P.box(.1, .07, .04, 'paper', .02, .02, 0, g);
      P.box(.1, .07, .02, 'koi', -.18 * scale, 0, 0, g).rotation.y = .5;
      return g;
    }
    parts.koi = [fish(1.3, ''), fish(1.1, '')];
    /* Two ovals in the near water, one each side of the bridge, clear of the deck. */
    parts.koi[0].spot = [.62, .78, .2, .1, .3];
    parts.koi[1].spot = [-.58, .82, .18, .1, 2.1];

    var host = Dither.folk(P, 1.85, .55, {
      h: .38, yaw: 2.15, name: 'host',
      shirt: '#24344a', pants: '#24344a', sleeve: '#8d2e32', hair: '#1a140f', shoes: '#1a140f'
    });
    parts.host = host;
    parts.plants.push(Dither.tree(P, 1.85, -1.2, { r: .55, h: .7, clusters: 5, seed: 2 }));
    parts.plants = parts.plants.concat(Dither.fringe(P, [[2.2, .4], [-2.3, 1.2], [2.0, 1.5]]));
    [[-.6, 1.3, .2], [1.6, .2, .16]].forEach(function (b) { parts.plants.push(Dither.bush(P, b[0], b[1], b[2])); });
    P.box(.22, .16, .16, 'stone', -.4, .08, 1.35);

    var lantern = Dither.lamp(P, 1.55, 1.55, { h: .58, post: 'ink', shade: 'lantern' });
    lantern.name = 'lantern';
    parts.lantern = lantern;
    parts.hot = [host.root, lantern];
    return parts;
  },
  tick: function (c) {
    var t = c.t, q = c.q, p = c.parts, P = c.P, dusk = c.active === p.host.root;
    p.day.visible = !dusk;
    p.dusk.visible = dusk;
    p.cores.visible = dusk;
    p.sun.visible = dusk;
    p.koi.forEach(function (g, i) {
      var s = g.spot, a = q * P.TAU + s[4];
      g.position.set(s[0] + Math.cos(a) * s[2], .07, s[1] + Math.sin(a) * s[3]);
      g.rotation.y = a + Math.PI / 2;
    });
    p.plants.forEach(function (g, i) { Dither.sway(P, g, g.base, t, 1.6, i * .2); });
    c.read = dusk ? 'host · dusk' : 'host · day';
  }
});
