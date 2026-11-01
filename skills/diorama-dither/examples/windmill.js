/* A walled grass yard. The sails sit on the cap face. Tap the miller to brake. */
Pixel.scene({
  name: 'windmill',
  title: 'The windmill',
  means: 'A wide stone mill under a tile roof. The sails turn on the front of the cap while the miller lifts a sack.',
  hint: 'Hover the miller or the carter; tap the miller to brake the sails.',
  width: 360, height: 280, duration: 8, still: 2, fps: 12,
  bayer: 4, shadow: 'hard', rim: true, wind: 8, contact: .42,
  camera: { az: 45, el: 30, height: 1.62, scale: 56 },
  sun: Dither.sun(45, 38, 16),
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
    var parts = { plants: [] };
    var ix = 2.75, iz = 2.05;
    Dither.wall(P, 0, -iz, ix * 2, 0);
    Dither.wall(P, -ix, 0, iz * 2, Math.PI / 2);
    Dither.wall(P, ix, 0, iz * 2, Math.PI / 2);
    Dither.wall(P, -1.35, iz, 2.8, 0);
    Dither.wall(P, 1.92, iz, 1.65, 0);
    Dither.gate(P, .55, iz, 0);

    var mill = P.group(-1.2, 0, .48);
    mill.rotation.y = .74;
    var plinth = P.box(1.75, .18, 1.75, 'stone', 0, .09, 0, mill);
    Dither.seat(plinth, 'plinth');
    var tower = P.cyl(.68, .82, 1.72, 'stone', 0, 1.02, 0, mill, 8);
    Dither.seat(tower, 'tower', plinth);
    P.box(.26, .48, .08, 'beam', .72, .42, .02, mill);
    P.box(.14, .22, .05, 'iron', .76, .4, .08, mill);
    P.box(.12, .14, .05, 'iron', .3, 1.1, .38, mill);
    var cap = P.cyl(.88, .88, .12, 'tile', 0, 2.02, .74, mill, 8);
    cap.rotation.x = Math.PI / 2;
    Dither.seat(cap, 'cap', tower);
    var rim = P.cyl(.96, .96, .08, 'beam', 0, 2.02, .74, mill, 8);
    rim.rotation.x = Math.PI / 2;
    Dither.seat(rim, 'rim', cap);
    Dither.seat(P.cone(.48, .28, 'tile', 0, 2.02, -.1, mill, 8), 'cone', tower);
    parts.sails = Dither.rotor(P, mill, { y: 2.02, z: .84, face: .8, len: .68 });
    Dither.seat(parts.sails, 'sails', cap);

    var cart = P.group(-2.25, 0, .15);
    cart.rotation.y = .35;
    cart.name = 'cart';
    parts.cart = cart;
    var r = .16, axle = null;
    [-.32, .3].forEach(function (x) {
      axle = P.box(.08, .06, .84, 'timber', x, r, 0, cart);
      axle.name = 'axle';
      [-.34, .34].forEach(function (z) {
        var w = P.cyl(r, r, .08, 'iron', x, r, z, cart, 10);
        w.rotation.x = Math.PI / 2;
        Dither.seat(w, 'cart-wheel', 'ground', axle);
      });
    });
    var floor = P.box(1.02, .08, .52, 'cart', 0, r + .07, 0, cart);
    Dither.seat(floor, 'cart-bed', axle);
    Dither.seat(P.box(1.02, .24, .06, 'cart', 0, r + .22, .26, cart), 'cart-side', floor);
    Dither.seat(P.box(1.02, .24, .06, 'cart', 0, r + .22, -.26, cart), 'cart-side', floor);
    Dither.seat(P.box(.06, .24, .52, 'cart', -.48, r + .22, 0, cart), 'cart-end', floor);
    Dither.seat(P.box(.4, .06, .06, 'timber', .7, r + .02, 0, cart), 'cart-tongue', floor);
    Dither.seat(P.box(.26, .18, .18, 'sack', -.08, r + .2, 0, cart), 'cart-sack', floor);

    var miller = Dither.folk(P, 1.15, .55, {
      h: .4, yaw: -2.4, name: 'miller',
      shirt: '#f6e6c0', pants: '#152038', sleeve: '#c9a15a', hat: '#6e3b28', hair: '#2a2018'
    });
    var carter = Dither.folk(P, -2.05, 1.2, {
      h: .4, yaw: -2.45, name: 'carter',
      shirt: '#f04a38', pants: '#1c1612', sleeve: '#b43328', hair: '#1a1410', shoes: '#14110e'
    });
    parts.miller = miller;
    parts.carter = carter;

    parts.sack = P.group(0, 0, 0);
    P.box(.4, .3, .28, 'sack', 0, .15, 0, parts.sack);
    P.box(.12, .08, .1, 'beam', 0, .32, 0, parts.sack);
    Dither.afloat(parts.sack, 'sack', 'carried');
    Dither.seat(P.box(.3, .22, .22, 'sack', -.85, .11, 1.05), 'sack');
    Dither.seat(P.box(.26, .18, .2, 'sack', -1.95, .09, 1.7), 'sack');

    parts.plants = Dither.fringe(P, [[2.2, 1.35], [-2.35, -1.35], [1.85, -1.4], [2.35, -.2]]);
    parts.plants.push(Dither.tree(P, 1.7, -1.25, { r: .48, h: .85, clusters: 6, seed: 5 }));
    [[2.15, .85, .24], [2.25, -1.55, .22], [-2.4, .35, .2]].forEach(function (b) {
      parts.plants.push(Dither.bush(P, b[0], b[1], b[2]));
    });

    [[.85, 1.7], [.4, .7], [1.55, -.55]].forEach(function (s, n) {
      Dither.seat(P.box(.22 + (n % 2) * .05, .12, .16, 'stone', s[0], .06, s[1]), 'stone');
    });
    Dither.fence(P, 1.85, -.15, .4, 4);
    Dither.lamp(P, 2.05, -.55);

    parts.hot = [miller.root, carter.root, cart];
    parts.sackA = [.85, .28, .5];
    parts.sackB = [-1.5, .62, .35];
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
