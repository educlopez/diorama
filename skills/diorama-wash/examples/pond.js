Wash.scene({
  name: "pond",
  title: "A quiet pond",
  means: "A single rowboat crosses a small pond. The wash drifts, and a click on the water sends a ring.",
  hint: "Click the water to send a ring.",
  duration: 16,
  still: 3.5,
  width: 960,
  height: 960,
  pond: { rx: 0.44, ry: 0.38, seed: 2.2, veg: 1, lilies: 1, reeds: 1 },
  build: function () {
    return { actors: [{ kind: "boat", r: 0.09, tint: [0.50, 0.31, 0.18] }] };
  },
  tick: function (ctx) {
    var t = ctx.t;
    var period = 16;
    var a = (t / period) * Math.PI * 2;
    var rx = 0.2;
    var ry = 0.11;
    var w = Math.PI * 2 / period;
    var x = Math.sin(a) * rx;
    var y = Math.sin(a * 2) * ry;
    var dx = Math.cos(a) * rx * w;
    var dy = Math.cos(a * 2) * ry * 2 * w;
    var boat = ctx.actors[0];
    boat.x = x;
    boat.y = y;
    boat.heading = Math.atan2(dy, dx);
    boat.speed = Math.hypot(dx, dy);
    boat.phase = (t / period) * Math.PI * 2 * 7;
    boat.sub = 0;
    boat.splash = 0;
    ctx.read = "one boat, crossing";
  }
});
