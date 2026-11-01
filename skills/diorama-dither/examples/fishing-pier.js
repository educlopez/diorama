Pixel.scene({
  name: 'fishing-pier',
  title: 'Fishing pier',
  means: 'A fishing pier runs from the sand into the water, with a net hut, a moored boat, a fisher on the deck and a mender at the nets.',
  hint: 'Hover the fisher or the mender, and tap the hut to drop the net.',
  width: 360, height: 280, fps: 12, duration: 8, still: 2,
  bayer: 4, shadow: 'hard', rim: true, wind: 8,
  camera: { az: 45, el: 30, height: .62, scale: 58 },
  sun: Dither.sun(45, 36, 20),
  ground: {
    rx: 3.9, rz: 2.95, wobble: .34, fade: .33,
    zone: function (x, z, P) {
      return x + z < .08 + (P.noise(x * 1.6, z * 1.6) - .5) * .4 ? 'water' : 'sand';
    }
  },
  materials: {
    sand: Dither.mat('sand'), water: Dither.mat('water'), timber: Dither.mat('timber'),
    deck: Dither.mat('timber', { grain: 'z' }), beam: Dither.mat('beam'), tile: Dither.mat('tile'),
    sail: Dither.mat('sail'), sack: Dither.mat('sack'), paper: Dither.mat('paper'),
    rock: Dither.mat('rock'), iron: Dither.mat('iron'), moss: Dither.mat('moss'), leaf: Dither.mat('leaf')
  },
  build: function (P) {
    var Y = Math.PI * .75, i, pier = P.group(-.22, 0, -.52);
    pier.rotation.y = Y;
    var deck = P.box(2.2, .1, 1.12, 'deck', 0, .13, 0, pier);
    for (i = 0; i < 4; i++) {
      P.box(.08, .18, .08, 'beam', -.84 + i * .56, .09, -.46, pier);
      P.box(.08, .18, .08, 'beam', -.84 + i * .56, .09, .46, pier);
    }
    var cleat = P.box(.12, .05, .08, 'iron', .2, .2, .42, pier);
    Dither.seat(cleat, 'cleat', deck);
    Dither.seat(pier, 'pier');
    function onPier(lx, lz) {
      var cy = Math.cos(Y), sy = Math.sin(Y);
      return [pier.position.x + lx * cy + lz * sy, pier.position.z - lx * sy + lz * cy];
    }

    var hut = P.group(-.05, 0, 1.32);
    hut.name = 'hut';
    var back = P.box(.96, .64, .08, 'timber', 0, .32, -.34, hut);
    P.box(.08, .64, .7, 'timber', -.44, .32, 0, hut);
    var post = P.box(.09, .7, .09, 'beam', .42, .35, .36, hut);
    P.box(.09, .7, .09, 'beam', -.44, .35, .36, hut);
    P.wedge(1.12, .26, .92, 'tile', 0, .58, 0, hut);
    var eave = P.box(.84, .06, .08, 'beam', 0, .62, .4, hut);
    Dither.seat(eave, 'eave', post);
    for (i = 0; i < 5; i++) Dither.seat(P.box(.04, .44, .04, 'sail', -.28 + i * .14, .4, .42, hut), 'hanging-net', eave);
    var screen = P.box(.88, .56, .08, 'sail', 0, .36, .44, hut);
    Dither.seat(screen, 'drying-net', eave);
    screen.visible = false;
    Dither.seat(hut, 'hut');

    var spot = onPier(.22, .95), boat = P.group(spot[0], 0, spot[1]);
    boat.rotation.y = -.4;
    var hull = P.box(1.15, .32, .55, 'timber', 0, -.01, 0, boat);
    var gun = P.box(1.02, .06, .62, 'beam', -.04, .17, 0, boat);
    Dither.seat(gun, 'gunwale', hull);
    Dither.seat(P.box(.36, .05, .3, 'timber', -.08, .08, 0, boat), 'thwart', hull);
    var bow = P.box(.18, .18, .24, 'beam', .64, .06, 0, boat);
    Dither.seat(bow, 'bow', hull);
    Dither.seat(boat, 'boat', 'water');
    var line = P.line([[0, .1, 0], [.2, .1, .2]], 'beam');

    var foot = onPier(-.15, .08);
    var fisher = Dither.folk(P, foot[0], foot[1], {
      h: .42, yaw: .35, name: 'fisher', shirt: '#3d6e8a', pants: '#5c4632', sleeve: '#2c5168', hat: '#d7c39a'
    });
    fisher.root.position.y = .18;
    Dither.seat(fisher.root, 'fisher', deck);
    Dither.afloat(P.box(.025, .62, .025, 'beam', 0, -.28, .02, fisher.handR), 'rod', 'held over the water');

    var mender = Dither.folk(P, 1.2, 1.38, {
      h: .42, yaw: .62, name: 'mender', shirt: '#8f4e3a', pants: '#3e4a3a', sleeve: '#6d3b2e'
    });
    Dither.afloat(P.box(.11, .08, .1, 'sack', 0, -.02, .05, mender.handR), 'coil', 'a coil of net in the hand');
    Dither.seat(P.box(.58, .03, .38, 'sail', 1.42, .016, 1.58), 'mending-net');

    Dither.seat(P.box(.22, .15, .18, 'sack', 1.62, .075, 1.15), 'basket');
    Dither.seat(P.box(.16, .12, .16, 'sack', .92, .06, 1.58), 'creel');
    var barrel = P.group(.62, 0, 1.58);
    var drum = P.cyl(.15, .16, .3, 'timber', 0, .15, 0, barrel, 8);
    Dither.seat(P.cyl(.175, .175, .035, 'iron', 0, .1, 0, barrel, 8), 'hoop', drum);
    Dither.seat(P.cyl(.175, .175, .035, 'iron', 0, .22, 0, barrel, 8), 'hoop', drum);
    Dither.seat(barrel, 'barrel');
    Dither.lamp(P, 1.72, .55, { h: .62, shade: 'paper' });
    Dither.bush(P, -.95, 1.28, .18);
    var grass = Dither.fringe(P, [[1.85, 1.35, .16], [.2, 1.78, .18], [-.7, 1.62, .15]], 'moss');
    var crest = [[.35, -1.2], [-.15, -.95], [.7, -.85]];
    for (i = 0; i < 3; i++) Dither.seat(P.box(.2, .02, .06, 'paper', crest[i][0], .004, crest[i][1]), 'crest', 'surface');
    Dither.seat(P.box(.22, .08, .16, 'rock', .95, .03, -.15), 'rock');

    return {
      hot: [fisher.root, mender.root, hut], fisher: fisher, mender: mender,
      boat: boat, screen: screen, grass: grass, line: line, cleat: cleat, bow: bow
    };
  },
  tick: function (c) {
    var q = c.q, P = c.P, w = Math.sin(q * P.TAU), f = c.parts.fisher, m = c.parts.mender;
    c.parts.boat.position.y = w * .024;
    P.pose(f, 'stand');
    f.body.rotation.x = .08;
    f.head.rotation.x = .15;
    f.armR.rotation.set(-.4, 0, 1.2);
    f.elbowR.rotation.x = -.2;
    f.armL.rotation.set(-.1, 0, -.35);
    f.armR.rotation.z += w * .06;
    P.pose(m, 'work');
    m.body.rotation.x = .5;
    m.head.rotation.x = .35;
    m.armL.rotation.set(-.9, 0, -.95);
    m.armR.rotation.set(-.85, 0, .95);
    m.elbowL.rotation.x = -.55 - w * .35;
    m.elbowR.rotation.x = -.5 + w * .4;
    c.parts.screen.visible = c.active === c.parts.hot[2];
    c.parts.grass.forEach(function (g, n) { Dither.sway(P, g, g.base, c.t, 1.4, n * .4); });
    P.update();
    c.parts.line.line = [c.parts.cleat.worldPoint(0, .04, 0), c.parts.bow.worldPoint(0, .08, 0)];
    c.read = c.parts.screen.visible ? 'the net drops over the hut' : 'the hut stays open';
  }
});
