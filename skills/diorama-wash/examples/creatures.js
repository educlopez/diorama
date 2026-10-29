Wash.scene({
  name: "creatures",
  title: "Under the wash",
  means: "Fish and a frog swim under the wash and break the surface. A moored boat waits, and a click sends a ring.",
  hint: "Click the water to send a ring.",
  duration: 12,
  still: 1.6,
  width: 960,
  height: 960,
  pond: { rx: 0.5, ry: 0.44, seed: 8.4, veg: 1, lilies: 0.35, reeds: 0.9 },
  build: function () {
    return {
      actors: [
        { kind: "fish", r: 0.06, tint: [0.36, 0.4, 0.26] },
        { kind: "fish", r: 0.055, tint: [0.32, 0.3, 0.24] },
        { kind: "frog", r: 0.055, tint: [0.3, 0.4, 0.18] },
        { kind: "boat", r: 0.08, tint: [0.42, 0.3, 0.2] }
      ]
    };
  },
  tick: function (ctx) {
    var swimmers = [
      { period: 12, phase: 0.4, rx: 0.24, ry: 0.12, wobble: 2 },
      { period: 6, phase: 2.1, rx: 0.16, ry: 0.2, wobble: 2 },
      { period: 12, phase: 3.4, rx: 0.18, ry: 0.16, wobble: 1 }
    ];
    var i;
    for (i = 0; i < swimmers.length; i++) {
      var s = swimmers[i];
      var a = (ctx.t / s.period) * Math.PI * 2 + s.phase;
      var w = Math.PI * 2 / s.period;
      var dx = -Math.sin(a) * s.rx * w;
      var dy = Math.cos(a) * s.ry * w;
      var emerge = Math.sin(a * s.wobble);
      var actor = ctx.actors[i];
      actor.x = Math.cos(a) * s.rx;
      actor.y = Math.sin(a) * s.ry;
      actor.heading = Math.atan2(dy, dx);
      actor.speed = 0;
      actor.phase = (ctx.t / s.period) * Math.PI * 2 * 8;
      actor.sub = 1 / (1 + Math.exp(7 * emerge));
      actor.splash = Math.exp(-Math.pow((emerge - 0.2) / 0.12, 2));
    }
    var boat = ctx.actors[3];
    boat.x = 0.22;
    boat.y = -0.16;
    boat.heading = 2.4;
    boat.speed = 0;
    boat.phase = Math.sin((ctx.t / 12) * Math.PI * 2 * 2) * 0.35;
    boat.sub = 0;
    boat.splash = 0;
    ctx.read = "creatures rising through the wash";
  }
});
