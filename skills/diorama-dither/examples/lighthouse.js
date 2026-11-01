/* A rocky islet in a dithered sea. The lamp throws one hard ray, a few
   pixels thick, with no halo. Tap the keeper and the ray goes out. */
Pixel.scene({
  name: 'lighthouse',
  title: 'The lighthouse',
  means: 'A plaster tower on a rocky islet. A hard ray crosses the water, and a small boat rocks beside the rocks.',
  hint: 'Hover the keeper or the boat; tap the keeper to toggle the beam.',
  width: 360, height: 280, duration: 8, still: 2, fps: 12,
  bayer: 4, shadow: 'hard', rim: true, wind: 8, contact: .36,
  camera: { az: 45, el: 30, height: 3.05, scale: 50 },
  sun: Dither.sun(45, 42, 16),
  ground: {
    rx: 4.15, rz: 3.15, wobble: .42, fade: .34,
    zone: function (x, z) {
      var dx = (x + .3) / 1.15, dz = (z - .05) / .9, d = dx * dx + dz * dz;
      if (d < .85) return 'rock';
      if (d < 1.25) return 'sand';
      return 'water';
    }
  },
  materials: {
    water: Dither.mat('water'), sand: Dither.mat('sand'), rock: Dither.mat('rock'),
    plaster: Dither.mat('plaster'), tile: Dither.mat('tile'), beam: Dither.mat('beam'),
    iron: Dither.mat('iron'), ray: Dither.mat('ray'), timber: Dither.mat('timber'),
    lantern: Dither.mat('lantern'),
    foam: Dither.mat('#d7e6ec', { tex: 'plain', rough: .15, dither: .35 })
  },
  build: function (P) {
    var parts = { plants: [] }, tower = P.group(-.15, 0, -.1);
    tower.rotation.y = .4;
    P.cyl(.72, .86, .34, 'rock', 0, .17, 0, tower, 8);
    P.cyl(.4, .48, 1.85, 'plaster', 0, 1.22, 0, tower, 8);
    P.cyl(.5, .5, .1, 'tile', 0, 1.55, 0, tower, 8);
    P.box(.28, .42, .08, 'beam', .44, .46, .06, tower);
    P.box(.12, .18, .06, 'iron', .48, .44, .1, tower);
    P.box(.12, .14, .06, 'iron', .22, 1.15, .32, tower);
    P.cyl(.58, .58, .08, 'rock', 0, 2.18, 0, tower, 8);
    P.box(1.15, .06, .06, 'iron', 0, 2.2, .28, tower);
    P.box(.06, .06, .55, 'iron', .28, 2.2, 0, tower);
    P.cyl(.26, .3, .42, 'plaster', 0, 2.42, 0, tower, 8);
    P.box(.2, .22, .2, 'lantern', 0, 2.4, 0, tower);
    P.cone(.36, .32, 'tile', 0, 2.78, 0, tower, 8);
    P.cyl(.035, .04, .18, 'iron', 0, 3.02, 0, tower, 5);
    parts.beam = P.group(0, 2.42, .28, tower);
    P.box(.11, .1, 3.1, 'ray', 0, -.04, 1.6, parts.beam);
    P.box(.05, .05, 3.1, 'ray', 0, .02, 1.6, parts.beam);

    [[.55, .7, .42, .22], [-.95, .15, .5, .28], [-.75, -.7, .36, .16], [.35, -.65, .4, .2], [-.2, .85, .3, .14]].forEach(function (r) {
      P.box(r[2], r[3], r[2] * .8, 'rock', r[0], r[3] / 2, r[1]);
    });
    Dither.wall(P, .15, .95, 1.15, .3, { h: .22, stone: 'rock', cap: 'rock' });
    Dither.wall(P, -.85, -.35, .9, 1.2, { h: .2, stone: 'rock', cap: 'rock' });

    var keeper = Dither.folk(P, 1.05, 1.45, {
      h: .48, yaw: -2.4, name: 'keeper',
      shirt: '#1e3a5c', pants: '#1a1c22', sleeve: '#16304c', hat: '#2a241c', hair: '#1a140f'
    });
    parts.keeper = keeper;

    var boat = P.group(1.85, 0, 1.15);
    boat.name = 'boat';
    boat.rotation.y = -.6;
    parts.boat = boat;
    P.box(1.05, .16, .42, 'timber', 0, .1, 0, boat);
    P.box(.32, .16, .32, 'timber', .52, .1, 0, boat).rotation.y = Math.PI / 4;
    P.box(.32, .16, .32, 'timber', -.52, .1, 0, boat).rotation.y = Math.PI / 4;
    P.box(.7, .04, .28, 'beam', 0, .2, 0, boat);
    parts.waves = [[-1.6, 1.4], [1.2, -1.35], [2.3, -.2], [-2.2, -.9]].map(function (w, i) {
      var g = P.group(w[0], .04, w[1]);
      P.box(.5, .035, .08, 'foam', 0, 0, 0, g);
      P.box(.26, .03, .06, 'foam', .18, .01, .1, g);
      g.base = [w[0], .04, w[1]];
      g.phase = i * .23;
      return g;
    });
    parts.hot = [keeper.root, boat];
    return parts;
  },
  tick: function (c) {
    var q = c.q, p = c.parts, P = c.P, on = c.active !== p.keeper.root;
    p.beam.visible = on;
    p.beam.rotation.y = .05 + q * P.TAU;
    var bob = Math.sin(q * P.TAU);
    p.boat.position.y = bob * .025;
    p.boat.rotation.z = bob * .05;
    p.waves.forEach(function (g) {
      var w = Math.sin((q + g.phase) * P.TAU);
      g.position.x = g.base[0] + w * .12;
      g.position.z = g.base[2] + Math.cos((q + g.phase) * P.TAU) * .05;
    });
    c.read = on ? 'keeper · beam lit' : 'keeper · beam out';
  }
});
