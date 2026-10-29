Wash.scene({
  name: "lake",
  title: "Boats on the lake",
  means: "Three boats cross a wider lake and leave wakes. Where their paths meet they slide apart, and a click sends a ring.",
  hint: "Click the water to send a ring.",
  duration: 12,
  still: 2.4,
  width: 960,
  height: 960,
  collide: true,
  pond: { rx: 0.58, ry: 0.5, seed: 5.1, veg: 0.85, lilies: 0.15, reeds: 0.7 },
  build: function () {
    return {
      actors: [
        { kind: "boat", r: 0.1, tint: [0.46, 0.28, 0.16] },
        { kind: "boat", r: 0.1, tint: [0.34, 0.28, 0.22] },
        { kind: "boat", r: 0.095, tint: [0.55, 0.38, 0.2] }
      ]
    };
  },
  tick: function (ctx) {
    var laps = [
      { period: 12, phase: 0, rx: 0.28, ry: 0.16, strokes: 8 },
      { period: 6, phase: 1.4, rx: 0.12, ry: 0.26, strokes: 5 },
      { period: 12, phase: Math.PI, rx: 0.22, ry: 0.08, strokes: 6 }
    ];
    var i;
    for (i = 0; i < laps.length; i++) {
      var lap = laps[i];
      var a = (ctx.t / lap.period) * Math.PI * 2 + lap.phase;
      var w = Math.PI * 2 / lap.period;
      var dx = -Math.sin(a) * lap.rx * w;
      var dy = Math.cos(a) * lap.ry * w;
      var boat = ctx.actors[i];
      boat.x = Math.cos(a) * lap.rx;
      boat.y = Math.sin(a) * lap.ry;
      boat.heading = Math.atan2(dy, dx);
      boat.speed = Math.hypot(dx, dy);
      boat.phase = (ctx.t / 12) * Math.PI * 2 * lap.strokes;
      boat.sub = 0;
      boat.splash = 0;
    }
    ctx.read = "three boats, with wakes";
  }
});
