/* A night food stall. Steam rises from the pot, and a tap drops the cloth. */
Pixel.scene({
  name: 'night-stall',
  title: 'The night stall',
  means: 'A night food stall under a striped awning. Steam leaves the pot, and a tap drops the cloth.',
  hint: 'Hover the cook or the customer; tap the cook to close the stall.',
  width: 360, height: 280, duration: 8, still: 2, fps: 12,
  bayer: 4, shadow: 'hard', rim: true, wind: 8, contact: .4,
  camera: { az: 45, el: 30, height: .58, scale: 60 },
  sun: Dither.sun(45, 44, 16),
  ground: {
    rx: 3.55, rz: 2.7, wobble: .34, fade: .32, rect: true,
    zone: function (x, z) {
      var ex = x / 2.55, ez = z / 1.9;
      return ex * ex + ez * ez > 1 ? 'meadow' : 'earth';
    }
  },
  materials: {
    meadow: Dither.mat('meadow'), earth: Dither.mat('earth'), moss: Dither.mat('moss'),
    stone: Dither.mat('stone'), timber: Dither.mat('timber'), beam: Dither.mat('beam'),
    cart: Dither.mat('cart'), iron: Dither.mat('iron'), lantern: Dither.mat('lantern'),
    ember: Dither.mat('ember'), sail: Dither.mat('sail'),
    sack: Dither.mat('sack'), leaf: Dither.mat('leaf'),
    cloth: Dither.mat('#a33b32', { tex: 'cloth', rough: .4 }),
    awning: Dither.mat('sail', { stripe: .18, alt: '#a33b32' })
  },
  build: function (P) {
    var parts = { plants: [] }, S = Dither.seat, A = Dither.afloat, ix = 2.75, iz = 2.02;
    Dither.wall(P, 0, -iz, ix * 2, 0);
    Dither.wall(P, -ix, 0, iz * 2, Math.PI / 2);
    Dither.wall(P, ix, 0, iz * 2, Math.PI / 2);
    Dither.wall(P, -1.4, iz, 2.7, 0);
    Dither.wall(P, 1.85, iz, 1.7, 0);
    Dither.gate(P, .42, iz, 0);
    var stall = P.group(-.95, 0, -.15);
    stall.rotation.y = .68;
    var posts = [[-.74, -.42], [.74, -.42], [-.74, .42], [.74, .42]].map(function (p) {
      return S(P.box(.09, .86, .09, 'timber', p[0], .43, p[1], stall), 'post');
    });
    var front = S(P.box(1.64, .07, .08, 'beam', 0, .895, .42, stall), 'beam', posts[2]);
    S(P.box(1.64, .07, .08, 'beam', 0, .895, -.42, stall), 'beam', posts[0]);
    S(P.box(.08, .07, .92, 'beam', -.74, .895, 0, stall), 'beam', posts[0]);
    var roof = S(P.box(1.78, .05, 1.08, 'awning', 0, .955, .02, stall), 'awning', front);
    [-.5, 0, .5].forEach(function (x, i) {
      S(P.box(.28, .14, .04, i % 2 ? 'cloth' : 'sail', x, .86, .56, stall), 'valance', roof);
    });
    var legs = [[-.46, 0], [.46, 0], [-.46, .22], [.46, .22]].map(function (p) {
      return S(P.box(.07, .32, .07, 'timber', p[0], .16, p[1], stall), 'leg');
    });
    var top = S(P.box(1.16, .08, .46, 'timber', 0, .36, .08, stall), 'counter', legs[0]);
    var pot = S(P.cyl(.14, .12, .16, 'iron', .1, .48, .16, stall, 8), 'pot', top);
    var rim = S(P.cyl(.16, .16, .035, 'iron', .1, .577, .16, stall, 8), 'rim', pot);
    parts.lid = S(P.cyl(.13, .13, .03, 'iron', .1, .61, .16, stall, 8), 'lid', rim);
    S(P.cyl(.055, .04, .045, 'sack', .4, .422, .02, stall, 6), 'bowl', top);
    parts.shutter = S(P.box(1.12, .52, .04, 'cloth', 0, .4, .33, stall), 'cloth', top);
    parts.cores = [-.72, .72].map(function (x) {
      var lamp = S(P.box(.18, .18, .14, 'lantern', x, .77, .42, stall), 'lantern', front);
      return S(P.box(.09, .1, .03, 'ember', x, .77, .5, stall), 'core', lamp);
    });
    parts.smoke = [0, 1, 2].map(function (i) {
      var g = P.group(.1, .6, .2, stall);
      P.box(.28 - i * .04, .14, .22 - i * .03, 'sail', 0, 0, 0, g);
      g.phase = i / 3;
      return A(g, 'smoke', 'steam');
    });
    var cook = Dither.folk(P, -.42, .66, {
      h: .42, yaw: 2.55, name: 'cook', parent: stall,
      shirt: '#2f4a3c', pants: '#2a241c', sleeve: '#d7c4a2', hat: '#f3ead4', hair: '#1c1612', shoes: '#1a140f'
    });
    cook.root.name = 'cook';
    parts.cook = cook;
    parts.ladle = P.group(0, -.01, .02, cook.handR);
    P.box(.025, .09, .025, 'beam', 0, .03, 0, parts.ladle);
    P.box(.05, .03, .045, 'iron', 0, .08, 0, parts.ladle);
    S(parts.ladle, 'ladle', cook.handR);
    var customer = Dither.folk(P, .48, .98, {
      h: .4, yaw: 2.15, name: 'customer', parent: stall,
      shirt: '#8d3a2a', pants: '#243044', sleeve: '#c4a574', hair: '#1a140f', shoes: '#1a140f'
    });
    customer.root.name = 'customer';
    parts.customer = customer;
    S(P.cyl(.05, .038, .035, 'sack', 0, .01, .02, customer.handR, 6), 'bowl', customer.handR);
    var cart = P.group(1.25, 0, .55), cr = .14, axle = null;
    cart.rotation.y = .85;
    cart.name = 'cart';
    S(cart, 'cart');
    [-.26, .24].forEach(function (x) {
      axle = P.box(.06, .06, .58, 'timber', x, cr, 0, cart);
      [-.22, .22].forEach(function (z) {
        var w = P.cyl(cr, cr, .06, 'iron', x, cr, z, cart, 10);
        w.rotation.x = Math.PI / 2;
        S(w, 'cart-wheel', 'ground', axle);
      });
    });
    var bed = P.box(.78, .06, .36, 'cart', -.02, cr + .06, 0, cart);
    S(bed, 'cart-bed', axle);
    [-.15, .15].forEach(function (z) {
      S(P.box(.78, .1, .04, 'cart', -.02, cr + .14, z, cart), 'cart-side', bed);
    });
    S(P.box(.22, .12, .16, 'sack', -.08, cr + .15, 0, cart), 'crate', bed);
    parts.plants.push(Dither.tree(P, 1.9, -1.3, { r: .36, h: .5, clusters: 4, seed: 6 }));
    parts.plants = parts.plants.concat(Dither.fringe(P, [[-2.25, 1.2], [2.2, 1.3], [2.25, -.4]]));
    parts.hot = [cook.root, customer.root];
    return parts;
  },
  tick: function (c) {
    var q = c.q, p = c.parts, P = c.P, open = c.active !== p.cook.root, stir = Math.sin(q * P.TAU);
    p.shutter.visible = !open;
    p.lid.visible = !open;
    p.cores.forEach(function (core) { core.visible = open; });
    p.smoke.forEach(function (g) {
      var u = (q + g.phase) % 1;
      g.visible = open;
      g.position.set(.1 + Math.sin((q + g.phase) * P.TAU) * .03, .58 + u * .12, .2 + u * .08);
    });
    P.pose(p.cook, open ? 'work' : 'stand');
    p.cook.body.rotation.x = open ? .45 : .06;
    p.cook.head.rotation.x = open ? .3 : .06;
    p.cook.armR.rotation.x = open ? -1.05 + stir * .22 : -.18;
    p.cook.elbowR.rotation.x = open ? -.9 : -.14;
    p.cook.armL.rotation.x = open ? -.75 : -.14;
    p.cook.elbowL.rotation.x = open ? -.65 : -.1;
    p.cook.armR.rotation.z = .16;
    p.cook.armL.rotation.z = -.18;
    P.pose(p.customer, 'hold');
    p.customer.head.rotation.y = stir * .15;
    p.customer.elbowR.rotation.x = -1.2;
    p.customer.elbowL.rotation.x = -1.15;
    p.plants.forEach(function (g, i) { Dither.sway(P, g, g.base, c.t, 1.4, i); });
    c.read = open ? 'cook · serving' : 'cook · stall shut';
  }
});
