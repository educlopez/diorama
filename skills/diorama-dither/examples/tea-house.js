/* A timber tea house, a koi pond and a plank bridge. Paper screens and
   lanterns shift from day to dusk as flat colour, with no halo. Tap the host. */
Pixel.scene({
  name: 'tea-house',
  title: 'The tea house',
  means: 'A timber tea house by a koi pond. Carp circle under a plank bridge, and a tap shifts the hour from day to dusk.',
  hint: 'Hover the host or a lantern; tap the host to change the hour.',
  width: 360, height: 280, duration: 8, still: 2, fps: 12,
  bayer: 4, shadow: 'hard', rim: true, wind: 8, contact: .4,
  camera: { az: 45, el: 30, height: 2.35, scale: 54 },
  sun: Dither.sun(45, 40, 14),
  ground: {
    rx: 3.7, rz: 2.8, wobble: .34, fade: .3,
    zone: function (x, z) {
      var dx = (x - .15) / 1.15, dz = (z - .15) / .72;
      if (dx * dx + dz * dz < 1) return 'pond';
      if (x > .8 && z > .7) return 'sand';
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
    var house = P.group(-1.25, 0, -.55);
    house.rotation.y = .25;
    P.box(1.7, .16, 1.25, 'timber', 0, .16, 0, house);
    [[-.7, -.5], [.7, -.5], [-.7, .5], [.7, .5]].forEach(function (p) {
      P.box(.08, .85, .08, 'ink', p[0], .58, p[1], house);
    });
    P.box(1.45, .62, .04, 'paper', 0, .62, -.52, house);
    P.box(1.45, .05, .06, 'ink', 0, .32, -.54, house);
    P.box(1.45, .05, .06, 'ink', 0, .92, -.54, house);
    P.box(.05, .66, .06, 'ink', -.5, .62, -.54, house);
    P.box(.05, .66, .06, 'ink', .5, .62, -.54, house);
    parts.day = P.group(0, 0, 0, house);
    parts.dusk = P.group(0, 0, 0, house);
    P.box(.7, .55, .03, 'paper', .72, .6, .05, parts.day);
    P.box(.7, .55, .03, 'dusk', .72, .6, .08, parts.dusk);
    P.wedge(1.95, .48, 1.55, 'tile', 0, 1.02, 0, house);
    P.box(2.05, .06, 1.65, 'ink', 0, 1.0, 0, house);

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
    parts.sun = P.cyl(.18, .18, .05, 'ember', -2.35, 1.55, -.85, null, 8);

    function fish(scale, name) {
      var g = P.group(0, .07, 0); g.name = name;
      P.box(.28 * scale, .08, .1, 'koi', 0, 0, 0, g);
      P.box(.1, .07, .04, 'paper', .02, .02, 0, g);
      P.box(.1, .07, .02, 'koi', -.18 * scale, 0, 0, g).rotation.y = .5;
      return g;
    }
    parts.koi = [fish(1, ''), fish(.8, '')];
    parts.koi[0].spot = [.15, .15, .62, .38, 0];
    parts.koi[1].spot = [.15, .15, .48, .42, Math.PI];

    var host = Dither.folk(P, 1.95, .4, {
      h: .48, yaw: 2.15, name: 'host',
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
