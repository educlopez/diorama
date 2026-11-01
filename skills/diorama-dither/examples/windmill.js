/* A walled grass yard. The mill is stone under a tile roof; the sails are
   framed canvas. The miller lifts a sack onto the cart and the carter leans
   in to take it. Tap the miller and the sails hold still. */
Pixel.scene({
  name: 'windmill',
  title: 'The windmill',
  means: 'A stone mill and canvas sails on a walled yard. The miller lifts a sack while the carter takes it, and a long shadow crosses the grass.',
  hint: 'Hover the miller or the carter; tap the miller to brake the sails.',
  width: 360, height: 280, duration: 8, still: 2, fps: 12,
  bayer: 4, shadow: 'hard', rim: true, wind: 8, contact: .42,
  camera: { az: 45, el: 30, height: 4.7 },
  sun: Dither.sun(45, 32, 8),
  ground: {
    rx: 5.15, rz: 3.85, wobble: .48, fade: .42, rect: true,
    zone: function (x, z) {
      if (z > 1.05 && z < 3.15 && x > -.4 && x < 1.7) return 'earth';
      if (Math.abs(x + 2.15) < .72 && z > .45 && z < 2.35) return 'earth';
      return 'meadow';
    }
  },
  materials: {
    meadow: Dither.mat('meadow'), earth: Dither.mat('earth'), stone: Dither.mat('stone'),
    tile: Dither.mat('tile'), timber: Dither.mat('timber'), beam: Dither.mat('beam'),
    sail: Dither.mat('sail'), sack: Dither.mat('sack'), iron: Dither.mat('iron'),
    leaf: Dither.mat('leaf'), cart: Dither.mat('cart'), lantern: Dither.mat('lantern'),
    moss: Dither.mat('moss')
  },
  build: function (P) {
    var parts = { plants: [] }, i;
    function wall(x, y, z, w, h, d, yaw) {
      var g = P.group(x, 0, z); g.rotation.y = yaw || 0;
      P.box(w, h, d, 'stone', 0, h / 2, 0, g);
      P.box(w + .06, .07, d + .06, 'timber', 0, h + .035, 0, g);
    }
    var ix = 4.55, iz = 3.28;
    wall(0, 0, -iz, ix * 2, .3, .26, 0);
    wall(-ix, 0, 0, iz * 2, .3, .26, Math.PI / 2);
    wall(ix, 0, 0, iz * 2, .3, .26, Math.PI / 2);
    wall(-1.55, 0, iz, 1.7, .3, .26, 0);
    wall(2.15, 0, iz, 2.15, .3, .26, 0);
    var gate = P.group(.15, 0, iz);
    P.box(.1, .62, .1, 'timber', -.48, .31, 0, gate);
    P.box(.1, .62, .1, 'timber', .48, .31, 0, gate);
    P.box(.96, .07, .08, 'timber', 0, .58, 0, gate);

    var mill = P.group(-1.45, 0, .15);
    mill.rotation.y = -.2;
    P.box(1.15, .22, 1.15, 'stone', 0, .11, 0, mill);
    P.cyl(.44, .56, 2.05, 'stone', 0, 1.18, 0, mill, 8);
    P.box(.28, .5, .1, 'beam', 0, .42, .6, mill);
    P.box(.16, .28, .06, 'iron', 0, .4, .66, mill);
    P.box(.12, .14, .08, 'iron', -.2, 1.28, .5, mill);
    P.box(.12, .16, .08, 'iron', .16, 1.62, .48, mill);
    P.cyl(.64, .5, .18, 'tile', 0, 2.28, 0, mill, 8);
    P.cone(.52, .72, 'tile', 0, 2.72, 0, mill, 8);
    P.cyl(.06, .07, .22, 'beam', 0, 3.16, 0, mill, 6);
    var sails = P.group(0, 2.42, .62, mill);
    parts.sails = sails;
    P.box(.24, .24, .18, 'iron', 0, 0, .05, sails);
    for (i = 0; i < 4; i++) {
      var spar = P.group(0, 0, 0, sails);
      spar.rotation.z = i * Math.PI / 2;
      P.box(2.35, .08, .06, 'beam', 1.26, 0, .02, spar);
      P.box(.07, .58, .06, 'beam', .38, .28, .03, spar);
      P.box(.07, .62, .06, 'beam', 2.2, .3, .03, spar);
      P.box(1.74, .07, .05, 'beam', 1.28, .56, .035, spar);
      P.box(1.68, .48, .04, 'sail', 1.28, .28, .05, spar);
    }

    var cart = P.group(-2.55, 0, 1.85);
    cart.rotation.y = -.55;
    cart.name = 'cart';
    parts.cart = cart;
    P.box(1.35, .1, .72, 'cart', 0, .5, 0, cart);
    P.box(1.35, .32, .07, 'cart', 0, .68, .34, cart);
    P.box(1.35, .32, .07, 'cart', 0, .68, -.34, cart);
    P.box(.07, .32, .72, 'cart', -.64, .68, 0, cart);
    P.box(.08, .42, .08, 'timber', .78, .42, .22, cart);
    P.box(.08, .42, .08, 'timber', .78, .42, -.22, cart);
    P.box(.55, .06, .08, 'timber', 1.02, .28, .22, cart);
    P.box(.55, .06, .08, 'timber', 1.02, .28, -.22, cart);
    [-.42, .38].forEach(function (x) {
      [-.4, .4].forEach(function (z) {
        var w = P.cyl(.2, .2, .08, 'iron', x, .2, z, cart, 7);
        w.rotation.x = Math.PI / 2;
      });
    });
    P.box(.32, .24, .24, 'sack', -.2, .66, .05, cart);

    var miller = Dither.folk(P, -1.95, 1.28, {
      h: .54, yaw: 2.15, name: 'miller',
      shirt: '#b5523a', pants: '#3e4c66', sleeve: '#8c3d2e', hat: '#6b4a2c', hair: '#3a2a22'
    });
    var carter = Dither.folk(P, -3.72, 2.15, {
      h: .64, yaw: .55, name: 'carter',
      shirt: '#d7b15a', pants: '#4a5c38', sleeve: '#a6843c', hair: '#2c241c', shoes: '#3a2e24'
    });
    parts.miller = miller;
    parts.carter = carter;

    parts.sack = P.group(0, 0, 0);
    P.box(.32, .24, .24, 'sack', 0, .12, 0, parts.sack);
    P.box(.1, .07, .1, 'beam', 0, .26, 0, parts.sack);
    P.box(.28, .2, .22, 'sack', -1.55, .1, 2.15);
    P.box(.26, .18, .2, 'sack', -2.95, .09, 1.15);

    function tuft(x, z, h) {
      var g = P.group(x, 0, z); g.base = [x, 0, z];
      for (var k = 0; k < 3; k++) {
        var a = k * 2.2 + x;
        P.box(.08, h, .08, 'moss', Math.cos(a) * .08, h / 2, Math.sin(a) * .08, g);
      }
      parts.plants.push(g);
    }
    [[-3.7, 2.55], [3.55, 2.45], [-4.05, -1.7], [-3.3, -2.35]].forEach(function (p, n) { tuft(p[0], p[1], .22 + (n % 3) * .05); });

    var tree = P.tree(-3.7, -1.85, null, { r: .62, h: 1.05, clusters: 6, mat: 'leaf', trunk: 'beam', seed: 5 });
    tree.base = [-3.7, 0, -1.85];
    parts.plants.push(tree);
    [[3.35, 2.15, .32], [-4.05, .15, .28], [3.55, -.4, .26]].forEach(function (b) {
      var bush = P.bush(b[0], b[1], null, { r: b[2], clusters: 4, mat: 'leaf' });
      bush.base = [b[0], 0, b[1]];
      parts.plants.push(bush);
    });

    [[1.55, 2.55], [.35, 2.85], [-3.9, .85]].forEach(function (s, n) {
      P.box(.26 + (n % 2) * .06, .14, .2, 'stone', s[0], .07, s[1]);
    });

    var fence = P.group(1.85, 0, 1.15);
    fence.rotation.y = .35;
    for (i = 0; i < 4; i++) P.box(.07, .48, .07, 'timber', -0.7 + i * .46, .24, 0, fence);
    P.box(1.45, .05, .05, 'beam', 0, .36, 0, fence);
    P.box(1.45, .05, .05, 'beam', 0, .18, 0, fence);

    var lamp = P.group(1.15, 0, 2.95);
    P.box(.08, .72, .08, 'beam', 0, .36, 0, lamp);
    P.box(.22, .26, .22, 'lantern', 0, .82, 0, lamp);
    P.box(.28, .06, .28, 'beam', 0, .98, 0, lamp);

    parts.hot = [miller.root, carter.root, cart];
    parts.sackA = [-1.85, .16, 1.55];
    parts.sackB = [-2.35, .78, 1.95];
    return parts;
  },
  tick: function (c) {
    var t = c.t, q = c.q, p = c.parts, P = c.P, u = Dither.carry(q);
    var brake = c.active === p.miller.root;
    p.sails.rotation.z = brake ? P.phase(c.pressedAt < 0 ? 0 : c.pressedAt, 8) * P.TAU : q * P.TAU;
    var a = p.sackA, b = p.sackB, arc = Math.sin(u * Math.PI) * .42;
    p.sack.position.set(P.lerp(a[0], b[0], u), P.lerp(a[1], b[1], u) + arc, P.lerp(a[2], b[2], u));
    P.pose(p.miller, u > .55 ? 'hold' : 'work');
    var k = p.miller.k, lean = Math.sin(q * P.TAU);
    p.miller.hips.position.y = (.36 - .06 * (1 - u)) * k;
    p.miller.body.rotation.x = P.lerp(.48, .1, u);
    p.miller.head.rotation.x = P.lerp(.4, .1, u);
    p.miller.armL.rotation.x = P.lerp(-1.15, -.55, u);
    p.miller.armR.rotation.x = P.lerp(-1.2, -.7, u);
    p.miller.elbowL.rotation.x = P.lerp(-.35, -1.15, u);
    p.miller.elbowR.rotation.x = P.lerp(-.3, -1.05, u);
    p.miller.armL.rotation.z = -.18;
    p.miller.armR.rotation.z = .22;
    P.pose(p.carter, 'work');
    p.carter.body.rotation.x = .5 + lean * .04;
    p.carter.head.rotation.x = .22;
    p.carter.armL.rotation.x = -1.15;
    p.carter.armR.rotation.x = -.95 + lean * .05;
    p.carter.elbowL.rotation.x = -.55;
    p.carter.elbowR.rotation.x = -.7;
    p.carter.armL.rotation.z = -.22;
    p.carter.armR.rotation.z = .26;
    p.plants.forEach(function (g, i) { Dither.sway(P, g, g.base, t, i > 4 ? 1.4 : 2.2, i * .17); });
    c.read = brake ? 'miller · brake on' : '';
  }
});
