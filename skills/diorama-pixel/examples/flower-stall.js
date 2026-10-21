/* A flower stall on a paved corner: the florist ties a bouquet under a striped
   awning while a customer waits, the awning's valance and a pennant sway. */
Pixel.scene({
  name: 'flower-stall',
  title: 'The flower stall',
  means: 'A florist ties a bouquet at a corner stall while a customer waits; the awning and the pennant move in the wind.',
  width: 320, height: 240, duration: 4.8, still: 1.1, fps: 24,
  camera: { az: 45, el: 30, height: 2.6 },
  sun: { az: -55, el: 46, ambient: .34 },
  ground: {
    rx: 4.3, rz: 3.6, wobble: .45, fade: .5,
    zone: function (x, z, P) {
      var d = Math.sqrt(x * x / 9.5 + z * z / 6.2) + (P.fbm(x * .7, z * .7) - .5) * .5;
      if (d < 1) return 'paving';
      if (Math.abs(x + z * .35 - 2.3) < .32 + (P.noise(x * 2, z * 2) - .5) * .2 && z > 0) return 'dirt';
      return 'grass';
    }
  },
  materials: {
    awning: { ramp: ['#7e3a35', '#9c4a40', '#b85e4c', '#cf7a5f', '#e2997b'], tex: 'cloth', stripe: .2, grain: 'x', alt: ['#8f8a78', '#b1ac97', '#d0cbb4', '#e6e2cf', '#f5f2e4'] },
    bucket: { ramp: ['#4a5258', '#626b70', '#7d868a', '#9aa2a4', '#bcc2c2'], tex: 'plain' },
    counter: { ramp: 'wood', tex: 'wood', grain: 'y', plank: .16 },
    top: { ramp: 'wood', tex: 'wood', grain: 'x', plank: .12 }
  },
  build: function (P) {
    var parts = {};
    var stall = P.group(-.2, 0, -.6);
    /* counter: vertical boards, a top, a shelf of buckets in front */
    P.box(2.2, .6, .7, 'counter', 0, .3, 0, stall);
    P.box(2.36, .06, .84, 'top', 0, .63, 0, stall);
    [-1.08, 1.08].forEach(function (x) { [-.38, .38].forEach(function (z) { P.box(.07, 2.3, .07, 'darkwood', x, 1.15, z, stall); }); });
    /* awning: two sloped striped planes and a valance of flaps that sway */
    var aw = P.group(0, 2.3, 0, stall);
    var roof = P.box(2.5, .04, 1.05, 'awning', 0, 0, -.05, aw); roof.rotation.x = .22;
    parts.flaps = [];
    for (var i = 0; i < 10; i++) {
      var f = P.group(-1.125 + i * .25, -.1, .47, aw);
      P.box(.24, .2, .03, 'awning', 0, -.1, 0, f);
      parts.flaps.push(f);
    }
    /* flowers on the counter: buckets of tight heads, three colours */
    var heads = ['#d7756f', '#e9c65a', '#f1e6d2', '#b07fb3', '#e48e5a'];
    function bucket(x, y, z, col, parent, n) {
      var g = P.group(x, y, z, parent);
      P.cyl(.13, .11, .24, 'bucket', 0, .12, 0, g, 8);
      for (var k = 0; k < (n || 6); k++) {
        var a = k / (n || 6) * P.TAU, r = k ? .07 : 0;
        P.box(.012, .2, .012, '#4f6b3a', Math.cos(a) * r, .3, Math.sin(a) * r, g);
        P.ball(.06, col, Math.cos(a) * r, .42 + (k % 2) * .04, Math.sin(a) * r, g, 6);
      }
      P.ball(.09, 'leaf', 0, .3, 0, g, 6);
      return g;
    }
    bucket(-.8, .66, -.05, heads[0], stall); bucket(-.5, .66, .12, heads[1], stall); bucket(.8, .66, .05, heads[3], stall);
    /* tiered crates in front of the counter */
    P.box(2.1, .22, .4, 'wood', 0, .11, .62, stall);
    for (var j = 0; j < 5; j++) bucket(-.84 + j * .42, .22, .62, heads[(j + 2) % 5], stall, 5);
    /* a wrapping paper roll and a twine spool on the counter */
    P.cyl(.05, .05, .7, '#e6dcc2', .3, .69, -.25, stall, 8).rotation.z = Math.PI / 2;
    P.cyl(.05, .05, .06, '#c2a46a', .55, .69, .15, stall, 8);
    /* the florist behind the counter, the bouquet in her hands */
    var fl = P.person(-.05, -1.25, null, { h: 1.3, shirt: '#6f8a7a', pants: '#3a3f4a', hair: '#5a3a26', skin: '#e2b08c' });
    P.box(.25, .36, .02, '#d9cfb6', 0, .12, .085, fl.body);
    parts.fl = fl;
    var bq = P.group(0, 0, 0); parts.bq = bq;
    P.cone(.09, .26, '#e8dfc8', 0, .02, 0, bq, 6).rotation.x = Math.PI;
    for (var b = 0; b < 6; b++) { var ang = b / 6 * P.TAU; P.ball(.055, heads[b % 3 ? 0 : 4], Math.cos(ang) * .06, .17, Math.sin(ang) * .06, bq, 6); }
    P.ball(.06, heads[1], 0, .2, 0, bq, 6);
    /* the customer, a tote bag, facing the stall */
    var cu = P.person(1.75, .2, null, { h: 1.3, shirt: '#c99a4f', pants: '#4b5568', hair: '#2b211c', skin: '#b98260', yaw: -1.75 });
    P.box(.04, .22, .18, '#d6c7a0', -.04, -.14, 0, cu.handR);
    parts.cu = cu;
    /* pennant on a pole at the corner: four linked segments */
    var pole = P.group(1.95, 0, -1.45);
    P.cyl(.035, .045, 2.6, 'darkwood', 0, 1.3, 0, pole, 6);
    parts.pen = []; var prev = P.group(0, 2.45, 0, pole);
    for (var s = 0; s < 5; s++) { var seg = P.group(s ? .16 : .02, 0, 0, prev); P.box(.16, .3 - s * .05, .02, s % 2 ? '#e2c15a' : '#d9a441', .08, -.15 + s * .025, 0, seg); parts.pen.push(seg); prev = seg; }
    /* corner life: a bench, a tree, pots, a crate, a bicycle-free street */
    var bench = P.group(-2.6, 0, .9); bench.rotation.y = .5;
    P.box(1.2, .06, .38, 'top', 0, .42, 0, bench); P.box(1.2, .3, .05, 'top', 0, .66, -.18, bench);
    [-.5, .5].forEach(function (x) { P.box(.06, .42, .34, '#3c4148', x, .21, 0, bench); });
    var tree = P.group(-2.8, 0, -1.6);
    P.cyl(.09, .13, 1.3, 'darkwood', 0, .65, 0, tree, 7);
    P.ball(.75, 'leaf', 0, 1.65, 0, tree, 9).scale.set(1, .85, 1); P.ball(.5, 'leaf', .45, 1.35, .3, tree, 8); P.ball(.45, 'leaf', -.4, 1.95, -.2, tree, 8);
    [[2.3, -.2, '#d7756f'], [2.65, .3, '#f1e6d2'], [-1.7, 1.9, '#e9c65a']].forEach(function (p) {
      var g = P.group(p[0], 0, p[1]); P.cyl(.2, .15, .32, '#a8603f', 0, .16, 0, g, 8); P.ball(.26, 'leaf', 0, .45, 0, g, 7);
      for (var k = 0; k < 4; k++) P.ball(.06, p[2], Math.cos(k * 1.6) * .17, .55 + (k % 2) * .08, Math.sin(k * 1.6) * .17, g, 5);
    });
    P.box(.5, .36, .4, 'wood', 1.45, .18, -.95); P.box(.42, .3, .34, 'wood', 1.5, .51, -.98).rotation.y = .3;
    /* stones and grass tufts at the edge */
    [[3.2, -1.1], [-3.4, .6], [.4, 2.9], [-1.2, -2.8]].forEach(function (p, k) { P.ball(.18 + k * .03, 'stone', p[0], .05, p[1], null, 6).scale.y = .55; });
    return parts;
  },
  tick: function (c) {
    var t = c.t, q = c.q, p = c.parts, P = c.P, TAU = P.TAU;
    var tie = Math.sin(q * TAU * 2), turn = Math.sin(q * TAU);
    /* florist: arms bring the bouquet up and turn it, the head follows */
    p.fl.body.rotation.y = .18 * turn; p.fl.body.rotation.x = .08 + .04 * tie;
    p.fl.armL.rotation.x = -1.05 - .18 * tie; p.fl.armR.rotation.x = -1.0 + .22 * tie; p.fl.armL.rotation.z = -.25; p.fl.armR.rotation.z = .3 + .1 * tie;
    p.fl.head.rotation.x = .3 + .08 * tie; p.fl.head.rotation.y = .1 * turn;
    p.bq.position.set(-.05 + .1 * turn, .9 + .05 * tie, -.92); p.bq.rotation.y = q * TAU; p.bq.rotation.z = .12 * turn;
    /* customer: weight shifts, head tilts toward the work */
    p.cu.body.rotation.z = .04 * Math.sin(q * TAU); p.cu.head.rotation.y = .2 * Math.sin(q * TAU + 1); p.cu.armL.rotation.x = .1 * Math.sin(q * TAU);
    /* wind: valance flaps and the pennant */
    p.flaps.forEach(function (f, i) { f.rotation.x = -.25 * (.5 + .5 * Math.sin(q * TAU * 2 - i * .55)); });
    p.pen.forEach(function (s, i) { s.rotation.y = .2 * Math.sin(q * TAU * 2 - i * .9) * (i ? 1 : .4); });
  }
});
