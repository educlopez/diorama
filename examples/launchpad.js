/* launchpad · a card empty state: "No deployments yet", at night.
   A rocket on its pad, a gantry with an arm, a fuel tank, a control bunker
   with lit windows, floodlights. Every twenty seconds the arm swings away,
   the engine lights and the rocket climbs out of the frame, then it is back
   on the pad. Hover the rocket, the gantry or the bunker and it lifts. */
World3D.figure({
  name: 'launchpad',
  size: 'card',
  theme: 'night',
  title: 'No deployments yet',
  means: 'A rocket waits on its pad under floodlights; every so often the arm swings away and it launches.',
  hint: 'Hover the rocket, the gantry or the control room; wait for the launch.',
  camera: { az: 38, el: 33, pad: 1.06 },
  still: 4,
  build: function (o) {
    var D = o.D, pal = o.pal, hot = [];
    D.slab(11, 9, pal.ground, 0, 0, 0, null, { h: .6, r: 1.2, side: pal.base });
    D.box(7.5, .03, 7, pal.asphalt, .4, .04, .2, null, { shadow: false });
    D.cyl(2.2, 2.2, .3, pal.cloud, 1.2, .15, .6, null, 24); D.cyl(1.6, 1.6, .06, pal.ink, 1.2, .3, .6, null, 24);
    [[-3.2, 3.2], [4.4, 3.4], [4.6, -3.0], [-3.4, -3.1]].forEach(function (p) { D.props.lamp(p[0], p[1], null, { h: 2.8 }); });
    /* the rocket */
    var rocket = D.group(1.2, .3, .6); rocket.name = 'rocket'; hot.push(rocket);
    D.cyl(.5, .5, 3.6, pal.paper, 0, 2.3, 0, rocket, 20); D.cyl(.52, .52, .5, pal.coral, 0, 1.1, 0, rocket, 20); D.cyl(.52, .52, .3, pal.coral, 0, 3.6, 0, rocket, 20);
    D.cone(.5, 1.2, pal.coral, 0, 4.7, 0, rocket, 20); D.cyl(.3, .45, .5, pal.steel, 0, .5, 0, rocket, 14);
    [0, 1, 2, 3].forEach(function (k) { var f = D.wedge(.08, .9, .7, pal.coral, 0, .4, 0, rocket); f.position.set(Math.cos(k * Math.PI / 2) * .62, .35, Math.sin(k * Math.PI / 2) * .62); f.rotation.y = -k * Math.PI / 2 + Math.PI / 2; });
    D.box(.5, .4, .06, pal.sky, 0, 3.1, .5, rocket, { shadow: false, mat: { emissive: pal.sky, emissiveIntensity: .4 } });
    var flame = D.group(0, .2, 0, rocket); var f1 = D.cone(.42, 1.6, pal.mustard, 0, -.8, 0, flame, 12); f1.rotation.x = Math.PI; f1.material = D.mat(pal.mustard, { emissive: pal.mustard, emissiveIntensity: 1.6 });
    var f2 = D.cone(.26, 2.4, pal.coral, 0, -1.2, 0, flame, 12); f2.rotation.x = Math.PI; f2.material = D.mat(pal.coral, { emissive: pal.coral, emissiveIntensity: 1.2 });
    var smoke = []; [0, 1, 2, 3, 4].forEach(function (k) { var s = D.ball(.35, pal.cloud, 0, 0, 0, null); s.castShadow = false; smoke.push(s); });
    /* the gantry and its arm */
    var gantry = D.group(-.6, 0, .6); gantry.name = 'gantry'; hot.push(gantry);
    [[-.4, -.4], [.4, -.4], [-.4, .4], [.4, .4]].forEach(function (p) { D.box(.12, 6.2, .12, pal.steel, p[0], 3.1, p[1], gantry); });
    [1.2, 2.4, 3.6, 4.8, 6.0].forEach(function (y) { D.box(.95, .08, .95, pal.steel, 0, y, 0, gantry); });
    var arm = D.group(.4, 4.2, 0, gantry); D.box(1.6, .16, .4, pal.mustard, .8, 0, 0, arm); D.box(.3, .5, .5, pal.mustard, 1.5, .1, 0, arm);
    var beacon = D.box(.16, .16, .05, pal.bad, 0, 6.3, .5, gantry, { mat: { emissive: pal.bad, emissiveIntensity: 1.5 }, shadow: false });
    /* the tank and the bunker */
    var tank = D.group(4.0, 0, 2.6); D.cyl(.8, .8, 2.4, pal.cloud, 0, 1.2, 0, tank, 18); D.dome(.8, pal.cloud, 0, 2.4, 0, tank); D.cyl(.82, .82, .15, pal.steel, 0, 1.0, 0, tank, 18);
    D.cyl(.06, .06, 3.2, pal.steel, 2.4, .2, 1.6, null, 8).rotation.z = Math.PI / 2;
    var bunker = D.group(-3.2, 0, -2.4); bunker.rotation.y = .3; bunker.name = 'control room'; hot.push(bunker);
    D.box(3.2, 1.4, 2.2, pal.paper, 0, .7, 0, bunker); D.box(3.4, .2, 2.4, pal.slate, 0, 1.5, 0, bunker);
    [-.9, 0, .9].forEach(function (x) { D.box(.6, .5, .06, pal.sky, x, .8, 1.12, bunker, { shadow: false, mat: { emissive: pal.sky, emissiveIntensity: .9 } }); });
    D.cyl(.04, .04, 1.6, pal.steel, 1.2, 2.3, -.6, bunker, 6); D.ball(.12, pal.bad, 1.2, 3.1, -.6, bunker).material = D.mat(pal.bad, { emissive: pal.bad, emissiveIntensity: 1.5 });
    D.props.person(-1.2, 1.9, bunker, { shirt: pal.teal, hat: pal.paper, yaw: .4 });
    D.props.rock(-4.2, 3.4, null, { r: .3 }); D.props.bush(4.6, -3.6, null, { r: .35 }); D.props.bush(-4.4, -3.6, null, { r: .28 });
    return { hot: hot, rocket: rocket, flame: flame, smoke: smoke, arm: arm, beacon: beacon, lift: {} };
  },
  tick: function (ctx) {
    var D = ctx.D, p = ctx.parts, t = ctx.t;
    /* 20 s: 0–12 on the pad, 12–13.5 the arm swings away, 13.5–18 the launch, 18–20 back on the pad */
    var T = D.phase(t, 20) * 20, armOut = D.smooth((T - 12) / 1.5) * (1 - D.smooth((T - 18.5) / 1.2));
    p.arm.rotation.y = -1.6 * armOut;
    var burn = T > 13.5 && T < 18, u = D.clamp((T - 13.5) / 4.5, 0, 1), rise = u * u * 16;
    p.rocket.position.y = .3 + rise;
    var back = D.smooth((T - 18) / 1.5); if (T >= 18) p.rocket.position.y = .3 + 16 * (1 - back);
    p.beacon.material.emissiveIntensity = D.phase(t, 1.2) < .5 ? 1.6 : .15;
    p.flame.visible = burn; p.flame.scale.set(1, .8 + .5 * Math.abs(D.wave(t, .15)) + .6 * u, 1);
    p.smoke.forEach(function (s, k) { var on = burn && u < .8; var v = D.phase(t, 1.1, k * .2); s.visible = on; s.position.set(1.2 + Math.cos(k * 1.26) * (.4 + v * 1.6), .5 + v * .6, .6 + Math.sin(k * 1.26) * (.4 + v * 1.6)); s.scale.setScalar(.5 + v * 1.1); });
    p.hot.forEach(function (g) { var s = p.lift[g.id] || (p.lift[g.id] = D.spring(120, 18)); s.t = ctx.hover === g ? .25 : 0; s.step(ctx.dt); if (g !== p.rocket) g.position.y = s.x; else p.rocket.position.y += s.x; });
  }
});
