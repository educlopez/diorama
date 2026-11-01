/* Hilltop observatory. The dome turns; a tap shuts the slit. */
var MATS = {};
['meadow', 'earth', 'moss', 'stone', 'rock', 'timber', 'beam', 'leaf', 'iron', 'plaster', 'lantern', 'paper', 'coal', 'ink'].forEach(function (n) {
  MATS[n] = Dither.mat(n);
});

function zone(x, z) {
  var path = Math.abs(x - (0.2 + (z - 0.4) * 0.22)) < 0.46 && z > 0.05 && z < 2.25;
  return path ? 'earth' : 'meadow';
}

Pixel.scene({
  name: 'observatory',
  title: 'The observatory',
  means: 'On a hilltop, the observatory dome turns across the sky while an astronomer tends the telescope and a visitor writes.',
  hint: 'Hover the astronomer, the visitor or the dome. Tap the dome to shut the slit.',
  width: 360, height: 280, fps: 12, duration: 8, still: 2,
  bayer: 4, shadow: 'hard', rim: true, wind: 8,
  camera: { az: 45, el: 30, scale: 56, height: 0.82 },
  sun: Dither.sun(45, 40, 16),
  ground: { rx: 3.5, rz: 2.65, wobble: 0.36, fade: 0.32, rect: true, zone: zone },
  materials: MATS,
  build: function (P) {
    var ix = 2.75, iz = 2.05, bx = -0.55, bz = -0.45, f = 0.7071;
    Dither.wall(P, 0, -iz, ix * 2, 0);
    Dither.wall(P, -ix, 0, iz * 2, Math.PI / 2);
    Dither.wall(P, ix, 0, iz * 2, Math.PI / 2);
    Dither.wall(P, -1.35, iz, 2.8, 0);
    Dither.wall(P, 1.92, iz, 1.65, 0);
    Dither.gate(P, 0.55, iz, 0);

    var terrace = P.cyl(1.05, 1.12, 0.1, 'rock', bx, 0.05, bz, null, 8);
    Dither.seat(terrace, 'terrace');
    var plinth = P.cyl(0.9, 0.98, 0.2, 'rock', bx, 0.18, bz, null, 8);
    Dither.seat(plinth, 'plinth', terrace);
    var drum = P.cyl(0.58, 0.68, 0.6, 'stone', bx, 0.48, bz, null, 8);
    Dither.seat(drum, 'drum', plinth);
    var lip = P.cyl(0.74, 0.74, 0.06, 'beam', bx, 0.75, bz, null, 8);
    Dither.seat(lip, 'lip', drum);

    var door = P.box(0.22, 0.36, 0.2, 'beam', bx + 0.06, 0.48, bz + 0.5);
    Dither.seat(door, 'door', drum);
    var jamb = P.box(0.3, 0.06, 0.26, 'timber', bx + 0.04, 0.68, bz + 0.46);
    Dither.seat(jamb, 'jamb', door);

    var stepH = P.box(0.72, 0.28, 0.4, 'stone', bx + 0.72 * f, 0.14, bz + 0.72 * f);
    var stepM = P.box(0.6, 0.18, 0.36, 'stone', bx + 1.12 * f, 0.09, bz + 1.12 * f);
    var stepL = P.box(0.5, 0.1, 0.32, 'rock', bx + 1.5 * f, 0.05, bz + 1.5 * f);
    Dither.seat(stepH, 'step-high', plinth);
    Dither.seat(stepM, 'step-mid');
    Dither.seat(stepL, 'step-low');

    var dome = P.group(bx, 0.77, bz);
    dome.name = 'dome';
    var shell = P.ball(0.48, 'plaster', 0, 0.05, 0, dome, 8);
    Dither.seat(shell, 'shell', lip);
    var bay = P.box(0.14, 0.36, 0.16, 'coal', 0, 0.28, 0.3, dome);
    Dither.seat(bay, 'bay', shell);
    var shutterL = P.box(0.16, 0.4, 0.07, 'iron', -0.18, 0.28, 0.36, dome);
    var shutterR = P.box(0.16, 0.4, 0.07, 'iron', 0.18, 0.28, 0.36, dome);
    Dither.seat(shutterL, 'shutter-l', shell);
    Dither.seat(shutterR, 'shutter-r', shell);

    var scope = P.group(0, 0.26, 0.04, dome);
    scope.rotation.x = -0.5;
    var tube = P.box(0.08, 0.08, 0.92, 'iron', 0, 0, 0.36, scope);
    var cell = P.box(0.12, 0.12, 0.1, 'iron', 0, 0, 0.8, scope);
    var ring = P.box(0.13, 0.13, 0.04, 'lantern', 0, 0, 0.74, scope);
    var yoke = P.box(0.05, 0.12, 0.08, 'iron', 0, -0.07, 0.2, scope);
    Dither.seat(tube, 'tube', shell);
    Dither.seat(cell, 'cell', tube);
    Dither.seat(ring, 'ring', tube);
    Dither.seat(yoke, 'yoke', tube);

    var astro = Dither.folk(P, -1.72, 0.48, {
      h: 0.42, yaw: 2.21, name: 'astronomer',
      shirt: '#2a3a52', pants: '#1a1814', sleeve: '#4e647c', hat: '#1a1814'
    });
    Dither.afloat(P.box(0.09, 0.05, 0.07, 'lantern', 0, 0, 0.07, astro.handR), 'lens', 'carried');

    var visitor = Dither.folk(P, 1.18, 0.62, {
      h: 0.42, yaw: -0.7, name: 'visitor',
      shirt: '#c46b3c', pants: '#3a4660', sleeve: '#8a4630'
    });
    Dither.afloat(P.box(0.18, 0.025, 0.12, 'paper', 0, 0.04, 0.06, visitor.handL), 'notebook', 'carried');
    Dither.afloat(P.box(0.02, 0.02, 0.14, 'ink', 0.07, 0.02, 0.04, visitor.handR), 'pencil', 'carried');

    var tree = Dither.tree(P, -2.15, -1.4, { r: 0.4, h: 0.72, clusters: 5, seed: 4 });
    var bushA = Dither.bush(P, -1.55, -1.05, 0.18);
    var bushB = Dither.bush(P, 1.75, -0.7, 0.18);
    Dither.fence(P, 1.55, -1.15, 0.2, 4);
    Dither.lamp(P, -2.2, 1.15, { h: 0.62, shade: 'lantern' });
    Dither.fringe(P, [[-2.35, 1.35], [2.15, 1.45, 0.2], [2.25, -1.55], [-2.3, -1.65, 0.16]], 'moss');

    var chest = P.box(0.34, 0.22, 0.26, 'timber', 1.55, 0.11, 0.22);
    Dither.seat(chest, 'chest');
    var roll = P.cyl(0.05, 0.05, 0.24, 'paper', 1.55, 0.25, 0.22, null, 8);
    roll.rotation.z = Math.PI / 2;
    Dither.seat(roll, 'chart', chest);
    var bottle = P.box(0.06, 0.1, 0.06, 'ink', 1.68, 0.27, 0.14);
    Dither.seat(bottle, 'ink', chest);

    return {
      hot: [dome, astro.root, visitor.root],
      dome: dome, scope: scope, bay: bay, shutterL: shutterL, shutterR: shutterR,
      astro: astro, visitor: visitor, tree: tree, bushA: bushA, bushB: bushB
    };
  },
  tick: function (c) {
    var p = c.parts, q = c.q, P = c.P, w = Math.sin(q * P.TAU), open = c.active !== p.dome;
    p.dome.rotation.y = 2.15 + Math.sin((q - 0.25) * P.TAU) * 0.4;
    p.scope.rotation.x = -0.5 + w * 0.05;
    p.shutterL.position.x = open ? -0.18 : -0.07;
    p.shutterR.position.x = open ? 0.18 : 0.07;
    p.scope.visible = open;
    p.bay.visible = open;
    P.pose(p.astro, 'work');
    p.astro.body.rotation.x = 0.4;
    p.astro.head.rotation.x = -0.85;
    p.astro.armR.rotation.x = -0.7;
    p.astro.armR.rotation.z = 0.45;
    p.astro.elbowR.rotation.x = -1.05 + w * 0.16;
    p.astro.armL.rotation.z = -0.4;
    p.astro.elbowL.rotation.x = -0.65;
    P.pose(p.visitor, 'hold');
    p.visitor.body.rotation.x = 0.7;
    p.visitor.head.rotation.x = 0.35;
    p.visitor.head.rotation.y = 0.7;
    p.visitor.elbowR.rotation.x = -1.35 + w * 0.14;
    p.visitor.elbowL.rotation.x = -1.2;
    Dither.sway(P, p.tree, p.tree.base, c.t, 2, 0.2);
    Dither.sway(P, p.bushA, p.bushA.base, c.t, 1.4, 1.1);
    Dither.sway(P, p.bushB, p.bushB.base, c.t, 1.4, 2.2);
    c.read = open ? 'slit open, tracking' : 'slit shut';
  }
});
