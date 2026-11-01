/* A windmill on a meadow. The sails turn once and their shadow sweeps the grass;
   the miller lifts a sack onto the cart and sets it down again so the loop
   closes. Tap the miller and the sails hold still until the next tap. */
Pixel.scene({
  name: 'windmill',
  title: 'The windmill',
  means: 'A miller lifts a sack onto a cart while the sails turn and their long shadow crosses the meadow.',
  hint: 'Hover the miller or the cart; tap the miller to brake the sails.',
  width: 360, height: 280, duration: 8, still: 2, fps: 12,
  bayer: 4, shadow: 'hard', rim: true, wind: 8, contact: .45,
  camera: { az: 45, el: 30, height: 5.2 },
  sun: Dither.sun(45, 34, 8),
  ground: {
    rx: 7.2, rz: 6.0, wobble: .5, fade: .45,
    zone: function (x, z) {
      if (Math.abs(x + 2.3) < 1.15 && z > 1.7 && z < 3.5) return 'track';
      return 'meadow';
    }
  },
  materials: {
    meadow: Dither.mat('meadow'), track: Dither.mat('track'), stone: Dither.mat('stone'),
    timber: Dither.mat('timber'), beam: Dither.mat('beam'), sail: Dither.mat('sail'),
    sack: Dither.mat('sack'), iron: Dither.mat('iron'), leaf: Dither.mat('leaf'),
    cart: Dither.mat('cart'), moss: Dither.mat('moss')
  },
  build: function (P) {
    var parts = { plants: [] }, i;
    var mill = P.group(-1.7, 0, 1.35);
    mill.rotation.y = -.15;
    P.box(.95, .22, .95, 'stone', 0, .11, 0, mill);
    P.cyl(.4, .52, 2.15, 'stone', 0, 1.22, 0, mill, 8);
    P.box(.26, .48, .1, 'beam', .04, .46, .62, mill);
    P.box(.14, .16, .1, 'iron', -.08, 1.35, .52, mill);
    P.cyl(.58, .42, .36, 'beam', 0, 2.42, 0, mill, 8);
    P.cone(.2, .36, 'beam', 0, 2.76, 0, mill, 7);
    var sails = P.group(0, 2.72, .62, mill);
    parts.sails = sails;
    P.box(.22, .22, .18, 'iron', 0, 0, .06, sails);
    for (i = 0; i < 4; i++) {
      var spar = P.group(0, 0, 0, sails);
      spar.rotation.z = i * Math.PI / 2;
      P.box(2.55, .12, .07, 'beam', 1.38, 0, .03, spar);
      P.box(1.9, .3, .06, 'sail', 1.05, .18, .05, spar);
    }
    var cart = P.group(-2.15, 0, 2.85);
    cart.rotation.y = -.4;
    cart.name = 'cart';
    parts.cart = cart;
    P.box(1.25, .1, .66, 'cart', 0, .48, 0, cart);
    P.box(1.25, .28, .07, 'cart', 0, .64, .32, cart);
    P.box(1.25, .28, .07, 'cart', 0, .64, -.32, cart);
    P.box(.07, .28, .66, 'cart', -.6, .64, 0, cart);
    [-.4, .4].forEach(function (x) {
      [-.38, .38].forEach(function (z) {
        var w = P.cyl(.2, .2, .08, 'iron', x, .2, z, cart, 7);
        w.rotation.x = Math.PI / 2;
      });
    });
    var who = P.person(-2.55, 2.35, null, {
      h: 1.7, yaw: 2.15, figure: true,
      shirt: Dither.wear('#b84332'), pants: Dither.wear('#3a4860'), skin: Dither.wear('#e0b08a'),
      hair: Dither.wear('#3a2a22'), shoes: Dither.wear('#2a2422'), sleeve: Dither.wear('#8e3428'),
      hat: Dither.wear('#6a4a30')
    });
    who.root.name = 'miller';
    parts.who = who;
    parts.sack = P.group(0, 0, 0);
    P.box(.34, .26, .26, 'sack', 0, .13, 0, parts.sack);
    P.box(.12, .08, .12, 'beam', 0, .28, 0, parts.sack);
    function tuft(x, z, h) {
      var g = P.group(x, 0, z);
      g.base = [x, 0, z];
      for (var k = 0; k < 3; k++) {
        var a = k * 2.2 + x;
        P.box(.09, h, .09, 'moss', Math.cos(a) * .1, h / 2, Math.sin(a) * .1, g);
      }
      parts.plants.push(g);
    }
    [[-4.2, 2.4], [3.2, 2.6], [-3.6, -1.2], [1.4, 3.4], [3.8, -.4], [-.6, -2.6]].forEach(function (p, n) {
      tuft(p[0], p[1], .26 + (n % 3) * .06);
    });
    var tree = P.tree(-4.6, -.2, null, { r: .55, h: .9, mat: 'leaf', trunk: 'beam', seed: 4 });
    tree.base = [-4.6, 0, -.2];
    parts.plants.push(tree);
    var bush = P.bush(2.8, 3.2, null, { r: .3, mat: 'leaf' });
    bush.base = [2.8, 0, 3.2];
    parts.plants.push(bush);
    var bush2 = P.bush(-1.2, -2.8, null, { r: .26, mat: 'leaf' });
    bush2.base = [-1.2, 0, -2.8];
    parts.plants.push(bush2);
    parts.hot = [who.root, cart];
    parts.sackA = [-2.35, .18, 2.15];
    parts.sackB = [-2.05, .72, 2.95];
    return parts;
  },
  tick: function (c) {
    var t = c.t, q = c.q, p = c.parts, P = c.P, u = Dither.carry(q);
    var brake = c.active === p.who.root;
    p.sails.rotation.z = brake ? P.phase(c.pressedAt < 0 ? 0 : c.pressedAt, 8) * P.TAU : q * P.TAU;
    var a = p.sackA, b = p.sackB, arc = Math.sin(u * Math.PI) * .45;
    p.sack.position.set(P.lerp(a[0], b[0], u), P.lerp(a[1], b[1], u) + arc, P.lerp(a[2], b[2], u));
    P.pose(p.who, u > .55 ? 'hold' : 'work');
    var k = p.who.k;
    p.who.hips.position.y = (.36 - .08 * (1 - u)) * k;
    p.who.body.rotation.x = P.lerp(.42, .08, u);
    p.who.head.rotation.x = P.lerp(.45, .12, u);
    p.who.armL.rotation.x = P.lerp(-1.2, -.5, u);
    p.who.armR.rotation.x = P.lerp(-1.25, -.65, u);
    p.who.elbowL.rotation.x = P.lerp(-.4, -1.2, u);
    p.who.elbowR.rotation.x = P.lerp(-.35, -1.05, u);
    p.who.armL.rotation.z = -.16;
    p.who.armR.rotation.z = .2;
    p.plants.forEach(function (g, i) { Dither.sway(P, g, g.base, t, i > 5 ? 1.5 : 2.5, i * .17); });
    c.read = brake ? 'miller · brake on' : '';
  }
});
