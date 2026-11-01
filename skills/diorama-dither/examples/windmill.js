/* A walled grass yard. The mill is a wide stone tower under a tile roof;
   the sails are shorter framed canvas on the cap. The miller lifts a sack
   and the carter leans into the cart. Tap the miller and the sails hold still. */
Pixel.scene({
  name: 'windmill',
  title: 'The windmill',
  means: 'A wide stone mill under a tile roof, with shorter canvas sails. The miller lifts a sack and the carter pushes the cart.',
  hint: 'Hover the miller or the carter; tap the miller to brake the sails.',
  width: 360, height: 280, duration: 8, still: 2, fps: 12,
  bayer: 4, shadow: 'hard', rim: true, wind: 8, contact: .42,
  camera: { az: 45, el: 30, height: 2.55, scale: 48 },
  sun: Dither.sun(45, 58, 18),
  ground: {
    rx: 3.5, rz: 2.65, wobble: .36, fade: .32, rect: true,
    zone: function (x, z) {
      if (x > .15 && x < 1.25 && z > .35 && z < 2.35) return 'earth';
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
    var ix = 2.75, iz = 2.05;
    wall(0, 0, -iz, ix * 2, .34, .26, 0);
    wall(-ix, 0, 0, iz * 2, .34, .26, Math.PI / 2);
    wall(ix, 0, 0, iz * 2, .34, .26, Math.PI / 2);
    wall(-1.35, 0, iz, 2.8, .34, .26, 0);
    wall(1.92, 0, iz, 1.65, .34, .26, 0);
    var gate = P.group(.55, 0, iz);
    P.box(.1, .66, .1, 'timber', -.48, .33, 0, gate);
    P.box(.1, .66, .1, 'timber', .48, .33, 0, gate);
    P.box(1.06, .07, .08, 'timber', 0, .62, 0, gate);

    /* Tower, eave and cone share one axis. The hub sits on the cap's front
       face, shifted along the view so the roof stays centred on the sails. */
    var mill = P.group(-.5, 0, .15);
    mill.rotation.y = -.2;
    P.box(1.9, .2, 1.9, 'stone', 0, .1, 0, mill);
    P.cyl(.74, .88, 2.15, 'stone', 0, 1.275, 0, mill, 8);
    P.box(.32, .52, .1, 'beam', .7, .48, .5, mill);
    P.box(.18, .3, .06, 'iron', .7, .46, .56, mill);
    P.box(.14, .16, .08, 'iron', .58, 1.35, .46, mill);
    P.box(.14, .18, .08, 'iron', .62, 1.72, .44, mill);
    P.cyl(1.08, .82, .18, 'tile', 0, 2.44, 0, mill, 8);
    P.cone(.94, .66, 'tile', 0, 2.86, 0, mill, 8);
    P.cyl(.07, .08, .2, 'beam', 0, 3.26, 0, mill, 6);
    var sails = P.group(.85, 2.44, .56, mill);
    parts.sails = sails;
    P.box(.22, .22, .16, 'iron', 0, 0, .04, sails);
    for (i = 0; i < 4; i++) {
      var spar = P.group(0, 0, 0, sails);
      spar.rotation.z = i * Math.PI / 2;
      P.box(1.28, .08, .06, 'beam', .7, 0, .02, spar);
      P.box(.07, .46, .06, 'beam', .28, .2, .03, spar);
      P.box(.07, .48, .06, 'beam', 1.22, .22, .03, spar);
      P.box(.94, .07, .05, 'beam', .75, .42, .035, spar);
      P.box(.86, .38, .04, 'sail', .75, .2, .05, spar);
    }

    var cart = P.group(-2.15, 0, .55);
    cart.rotation.y = .35;
    cart.name = 'cart';
    parts.cart = cart;
    P.box(1.15, .1, .62, 'cart', 0, .48, 0, cart);
    P.box(1.15, .28, .06, 'cart', 0, .64, .3, cart);
    P.box(1.15, .28, .06, 'cart', 0, .64, -.3, cart);
    P.box(.06, .28, .62, 'cart', -.55, .64, 0, cart);
    P.box(.07, .4, .07, 'timber', .68, .4, .18, cart);
    P.box(.07, .4, .07, 'timber', .68, .4, -.18, cart);
    P.box(.48, .06, .07, 'timber', .9, .26, .18, cart);
    P.box(.48, .06, .07, 'timber', .9, .26, -.18, cart);
    [-.32, .28].forEach(function (x) {
      [-.34, .34].forEach(function (z) {
        var w = P.cyl(.18, .18, .07, 'iron', x, .18, z, cart, 7);
        w.rotation.x = Math.PI / 2;
      });
    });
    P.box(.28, .2, .2, 'sack', -.12, .62, .04, cart);

    var miller = Dither.folk(P, -1.2, .95, {
      h: .44, yaw: -.7, name: 'miller',
      shirt: '#f6e6c0', pants: '#152038', sleeve: '#c9a15a', hat: '#6e3b28', hair: '#2a2018'
    });
    var carter = Dither.folk(P, -1.65, 1.4, {
      h: .46, yaw: -1.15, name: 'carter',
      shirt: '#f04a38', pants: '#1c1612', sleeve: '#b43328', hair: '#1a1410', shoes: '#14110e'
    });
    parts.miller = miller;
    parts.carter = carter;

    parts.sack = P.group(0, 0, 0);
    P.box(.4, .3, .28, 'sack', 0, .15, 0, parts.sack);
    P.box(.12, .08, .1, 'beam', 0, .32, 0, parts.sack);
    P.box(.3, .22, .22, 'sack', -.85, .11, 1.05);
    P.box(.26, .18, .2, 'sack', -1.95, .09, 1.7);

    function tuft(x, z, h) {
      var g = P.group(x, 0, z); g.base = [x, 0, z];
      for (var k = 0; k < 3; k++) {
        var a = k * 2.2 + x;
        P.box(.08, h, .08, 'moss', Math.cos(a) * .08, h / 2, Math.sin(a) * .08, g);
      }
      parts.plants.push(g);
    }
    [[2.2, 1.35], [-2.35, -1.35], [1.85, -1.4], [2.35, -.2]].forEach(function (p, n) { tuft(p[0], p[1], .2 + (n % 3) * .04); });

    var tree = P.tree(1.7, -1.25, null, { r: .48, h: .85, clusters: 6, mat: 'leaf', trunk: 'beam', seed: 5 });
    tree.base = [1.7, 0, -1.25];
    parts.plants.push(tree);
    [[2.15, .85, .24], [2.25, -1.55, .22], [-2.4, .35, .2]].forEach(function (b) {
      var bush = P.bush(b[0], b[1], null, { r: b[2], clusters: 4, mat: 'leaf' });
      bush.base = [b[0], 0, b[1]];
      parts.plants.push(bush);
    });

    [[.85, 1.7], [.4, .7], [1.55, -.55]].forEach(function (s, n) {
      P.box(.22 + (n % 2) * .05, .12, .16, 'stone', s[0], .06, s[1]);
    });

    var fence = P.group(1.85, 0, -.15);
    fence.rotation.y = .4;
    for (i = 0; i < 4; i++) P.box(.06, .42, .06, 'timber', -.55 + i * .36, .21, 0, fence);
    P.box(1.15, .05, .05, 'beam', 0, .32, 0, fence);
    P.box(1.15, .05, .05, 'beam', 0, .16, 0, fence);

    var lamp = P.group(1.15, 0, 1.7);
    P.box(.07, .64, .07, 'beam', 0, .32, 0, lamp);
    P.box(.18, .22, .18, 'lantern', 0, .72, 0, lamp);
    P.box(.24, .05, .24, 'beam', 0, .86, 0, lamp);

    parts.hot = [miller.root, carter.root, cart];
    parts.sackA = [-1.25, .28, 1.05];
    parts.sackB = [-1.95, .68, .7];
    return parts;
  },
  tick: function (c) {
    var t = c.t, q = c.q, p = c.parts, P = c.P, u = Dither.carry(q);
    var brake = c.active === p.miller.root;
    p.sails.rotation.z = brake ? P.phase(c.pressedAt < 0 ? 0 : c.pressedAt, 8) * P.TAU : q * P.TAU;
    var a = p.sackA, b = p.sackB, arc = Math.sin(u * Math.PI) * .55;
    p.sack.position.set(P.lerp(a[0], b[0], u), P.lerp(a[1], b[1], u) + arc, P.lerp(a[2], b[2], u));
    P.pose(p.miller, u > .55 ? 'hold' : 'work');
    var k = p.miller.k, lean = Math.sin(q * P.TAU);
    p.miller.hips.position.y = (.34 - .07 * (1 - u)) * k;
    p.miller.body.rotation.x = P.lerp(1.15, .18, u);
    p.miller.head.rotation.x = P.lerp(.6, .12, u);
    p.miller.armL.rotation.x = P.lerp(-1.85, -.35, u);
    p.miller.armR.rotation.x = P.lerp(-1.8, -.45, u);
    p.miller.elbowL.rotation.x = P.lerp(-.25, -1.2, u);
    p.miller.elbowR.rotation.x = P.lerp(-.2, -1.1, u);
    p.miller.armL.rotation.z = -.35;
    p.miller.armR.rotation.z = .38;
    P.pose(p.carter, 'work');
    p.carter.body.rotation.x = 1.05 + lean * .03;
    p.carter.head.rotation.x = .45;
    p.carter.armL.rotation.x = -1.55;
    p.carter.armR.rotation.x = -1.4 + lean * .04;
    p.carter.elbowL.rotation.x = -.3;
    p.carter.elbowR.rotation.x = -.35;
    p.carter.armL.rotation.z = -.15;
    p.carter.armR.rotation.z = .18;
    p.plants.forEach(function (g, i) { Dither.sway(P, g, g.base, t, i > 4 ? 1.4 : 2.2, i * .17); });
    c.read = brake ? 'miller · brake on' : '';
  }
});
