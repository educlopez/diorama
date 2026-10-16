/* seedling · a mini empty state: "Nothing planted yet".
   A terracotta pot full of soil and nothing growing, a watering can beside
   it. Now and then the can tips and a few drops fall on the soil. Drawn in
   the line theme, with the pot as the accent. */
Diorama.figure({
  name: 'seedling',
  size: 'mini',
  theme: { base: 'line', accent: '#cf6a4c' },
  means: 'A pot of soil with nothing growing and a watering can that tips now and then.',
  hint: 'Wait for the can to tip.',
  empty: { title: 'Nothing planted yet', body: 'Add your first project and watch it grow here.', action: 'Plant a project' },
  still: 1.6,
  build: function (o) {
    var D = o.D, pal = o.pal;
    D.slab(2.6, 2.6, pal.grass, 0, 0, 0, null, { h: .45, r: .45, side: pal.base });
    var pot = D.group(.3, 0, .15);
    D.cyl(.6, .46, .95, pal.terracotta, 0, .475, 0, pot, 20);
    D.cyl(.67, .65, .16, pal.terracotta, 0, .95, 0, pot, 20);
    D.cyl(.58, .58, .06, pal.ink, 0, 1.0, 0, pot, 20);
    var can = D.group(-.75, 0, -.55); can.rotation.y = .5;
    var body = D.group(0, 0, 0, can);
    D.cyl(.34, .3, .7, pal.steel, 0, .35, 0, body, 16);
    D.cyl(.3, .3, .06, pal.steel, 0, .72, 0, body, 16);
    var spout = D.cyl(.04, .06, .9, pal.steel, .55, .55, 0, body, 8); spout.rotation.z = -1.0;
    D.cyl(.1, .07, .1, pal.steel, .95, .83, 0, body, 10).rotation.z = -1.0;
    var handle = D.torus(.26, .035, pal.steel, 0, .85, 0, body); handle.rotation.y = Math.PI / 2;
    var drops = []; [0, 1, 2].forEach(function (k) { drops.push(D.ball(.035, pal.sky, 0, 0, 0, null)); });
    D.props.rock(.95, -.8, null, { r: .16 }); D.props.rock(-.85, .8, null, { r: .12, yaw: 2 });
    return { body: body, drops: drops };
  },
  tick: function (ctx) {
    var D = ctx.D, p = ctx.parts, t = ctx.t;
    var tip = D.smooth(D.pulse(t, 8, .4));
    p.body.rotation.z = -.9 * tip; p.body.position.y = .35 * tip; p.body.position.x = .25 * tip;
    p.drops.forEach(function (d, k) {
      var u = D.phase(t, .6, k * .33), on = tip > .7;
      d.visible = on; d.position.set(.05 + u * .35, 1.45 - u * .6, -.3 + u * .35);
    });
  }
});
