Pixel.scene({
  name: 'mountain-station',
  title: 'Mountain station',
  means: 'A snow yard and a cable-car station: the cabin rides the cable and back, and a tap drops the shutter.',
  hint: 'Hover the operator, the hiker or the cabin. Tap the cabin to drop the shutter.',
  width: 360, height: 280, fps: 12, duration: 8, still: 2,
  bayer: 4, shadow: 'hard', rim: true, wind: 8,
  camera: { az: 45, el: 30, height: 1.02, scale: 58 },
  sun: Dither.sun(45, 40, 16),
  ground: {
    rx: 3.45, rz: 2.62, wobble: .34, fade: .32, rect: true,
    zone: function (x, z) {
      if (z < -1.35 && x < -.2) return 'rock';
      if (z > 1.05 && Math.abs(x - .15) < .42) return 'earth';
      return 'snow';
    }
  },
  materials: {
    snow: Dither.mat('#7f97a8', { tex: 'sand', ground: true, rough: .45 }),
    rock: Dither.mat('rock', { ground: true }),
    earth: Dither.mat('earth'), stone: Dither.mat('stone'), tile: Dither.mat('tile'),
    timber: Dither.mat('timber'), beam: Dither.mat('beam'), plaster: Dither.mat('plaster'),
    paper: Dither.mat('paper'), ink: Dither.mat('ink'), iron: Dither.mat('iron'),
    cart: Dither.mat('cart'), sail: Dither.mat('sail'), sack: Dither.mat('sack'),
    coal: Dither.mat('coal'), moss: Dither.mat('moss')
  },
  build: function (P) {
    var rock = { stone: 'rock', cap: 'rock', h: .16, d: .2 }, ix = 2.55, iz = 1.92;
    Dither.wall(P, 0, -iz, ix * 2, 0, rock);
    Dither.wall(P, -ix, 0, iz * 2, Math.PI / 2, rock);
    Dither.wall(P, ix, 0, iz * 2, Math.PI / 2, rock);
    Dither.wall(P, -.7, iz, 3.5, 0, rock);
    Dither.wall(P, 2.05, iz, 1.05, 0, rock);
    Dither.gate(P, 1.45, iz, 0);
    Dither.fringe(P, [[2.15, 1.35, .16], [-2.2, 1.15, .18], [-1.9, -1.6, .17]], 'moss');

    var house = P.group(-1.12, 0, -.12);
    var plinth = P.box(1.58, .1, 1.18, 'stone', 0, .02, .04, house);
    P.box(.12, .62, 1.02, 'plaster', -.7, .31, -.06, house);
    P.box(.12, .62, 1.02, 'timber', .7, .31, -.06, house);
    var back = P.box(1.4, .62, .12, 'plaster', 0, .31, -.48, house);
    P.box(.42, .62, .12, 'plaster', -.5, .31, .48, house);
    P.box(.42, .62, .12, 'timber', .5, .31, .48, house);
    P.box(.52, .12, .14, 'beam', 0, .54, .48, house);
    P.box(.56, .46, .1, 'coal', 0, .28, .4, house);
    var roof = P.wedge(1.74, .5, 1.12, 'tile', 0, .62, -.08, house);
    P.box(.16, .36, .16, 'stone', -.38, 1.08, -.12, house);
    var shutter = P.box(.72, .54, .1, 'timber', 0, .32, .56, house);
    Dither.seat(house, 'station');

    var x0 = -.05, y0 = 1.28, z0 = -.98, x1 = 1.22, y1 = 1.64, z1 = -1.52;
    var dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    var mast = P.group(x0, 0, z0);
    var post = P.box(.16, y0, .16, 'beam', 0, y0 / 2, 0, mast);
    P.box(.14, .12, .14, 'iron', 0, y0 - .02, 0, mast);
    Dither.seat(mast, 'mast');
    var pylon = P.group(x1, 0, z1);
    var shaft = P.box(.22, y1, .22, 'rock', 0, y1 / 2, 0, pylon);
    P.box(.36, .14, .36, 'rock', 0, y1 + .02, 0, pylon);
    Dither.seat(pylon, 'pylon');
    var cable = P.group(x0, y0, z0);
    cable.rotation.y = Math.atan2(dx, dz);
    cable.rotation.x = -Math.asin(dy / len);
    Dither.seat(P.box(.05, .05, len + .24, 'iron', 0, 0, len / 2 - .02, cable), 'cable', post);

    var cabin = P.group(x0, y0, z0);
    cabin.name = 'cabin';
    cabin.rotation.y = .5;
    Dither.afloat(cabin, 'cabin', 'rides the cable');
    P.box(.07, .22, .07, 'iron', 0, -.02, 0, cabin);
    P.box(.4, .28, .3, 'timber', 0, -.3, 0, cabin);
    P.wedge(.48, .14, .38, 'tile', 0, -.16, 0, cabin);
    P.box(.16, .1, .03, 'paper', .02, -.3, .16, cabin);
    var door = P.box(.28, .24, .04, 'cart', .02, -.3, .18, cabin);

    var sign = P.group(1.05, 0, .22);
    var spost = P.box(.06, .58, .06, 'beam', 0, .29, 0, sign);
    var board = P.box(.4, .26, .04, 'paper', 0, .52, 0, sign);
    P.box(.26, .035, .02, 'ink', 0, .56, .03, sign);
    P.box(.18, .035, .02, 'ink', 0, .48, .03, sign);
    Dither.seat(sign, 'sign');

    var sled = P.group(.15, 0, 1.18);
    P.box(.52, .05, .06, 'beam', 0, .025, -.09, sled);
    P.box(.52, .05, .06, 'beam', 0, .025, .09, sled);
    P.box(.38, .05, .22, 'timber', -.02, .055, 0, sled);
    Dither.seat(sled, 'sled');

    var crates = P.group(-1.82, 0, 1.22);
    P.box(.3, .24, .26, 'cart', 0, .12, 0, crates);
    P.box(.22, .18, .2, 'timber', .03, .3, .02, crates);
    Dither.seat(crates, 'crates');

    var pile = P.group(1.62, 0, -.15);
    P.box(.48, .2, .36, 'rock', 0, .08, 0, pile);
    P.box(.28, .14, .22, 'rock', .05, .22, .02, pile);
    Dither.seat(pile, 'outcrop');

    var op = Dither.folk(P, -1.28, .96, {
      h: .4, yaw: .85, name: 'operator',
      shirt: '#3e5a78', pants: '#6a4632', sleeve: '#2a3344', hat: '#6a4632'
    });
    Dither.afloat(P.box(.16, .11, .02, 'sail', .02, 0, .05, op.handR), 'flag', 'carried');
    var hiker = Dither.folk(P, .28, .62, {
      h: .4, yaw: 2.2, name: 'hiker',
      shirt: '#c4473a', pants: '#2c3348', sleeve: '#d4894a', hat: '#c4473a'
    });
    Dither.afloat(P.box(.03, .4, .03, 'iron', .08, -.14, .02, hiker.handR), 'pole', 'carried');
    Dither.afloat(P.box(.03, .34, .03, 'iron', -.1, -.08, .05, hiker.handL), 'pole', 'carried');
    Dither.afloat(P.box(.11, .12, .07, 'sack', 0, .1, -.09, hiker.body), 'pack', 'carried');

    return {
      hot: [op.root, hiker.root, cabin],
      operator: op, hiker: hiker, cabin: cabin, shutter: shutter, door: door,
      span: { x0: x0, y0: y0, z0: z0, dx: dx, dy: dy, dz: dz }
    };
  },
  tick: function (c) {
    var q = c.q, w = Math.sin(q * c.P.TAU), s = c.parts.span;
    var u = .22 + .56 * Dither.carry(q), on = c.active === c.parts.cabin;
    c.parts.cabin.position.set(s.x0 + s.dx * u, s.y0 + s.dy * u, s.z0 + s.dz * u);
    c.parts.shutter.visible = on;
    c.parts.door.visible = on;
    c.P.pose(c.parts.operator, 'work');
    c.parts.operator.body.rotation.x = .48;
    c.parts.operator.head.rotation.x = .28;
    c.parts.operator.armL.rotation.z = -.55;
    c.parts.operator.armR.rotation.z = .62;
    c.parts.operator.elbowL.rotation.x = -1.1;
    c.parts.operator.elbowR.rotation.x = -1.25 + w * .22;
    c.P.pose(c.parts.hiker, 'hold');
    c.parts.hiker.body.rotation.x = .32;
    c.parts.hiker.head.rotation.x = .2;
    c.parts.hiker.armL.rotation.z = -.7;
    c.parts.hiker.armR.rotation.z = .72;
    c.parts.hiker.elbowL.rotation.x = -1.15;
    c.parts.hiker.elbowR.rotation.x = -1.05 + w * .16;
    c.read = on ? 'shutter down' : 'cabin on the cable';
  }
});
