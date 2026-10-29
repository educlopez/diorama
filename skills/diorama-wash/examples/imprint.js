Wash.scene({
  name: "imprint",
  title: "A house, from a picture",
  means: "A small picture drawn in code is split into washes. A cloud passes over it, and a click drops a stain.",
  hint: "Click the sheet to drop a wet stain.",
  duration: 12,
  still: 4,
  width: 880,
  height: 880,
  paper: [0.95, 0.9, 0.8],
  prepare: function () {
    var w = 120;
    var h = 120;
    var d = new Uint8ClampedArray(w * h * 4);
    function put(x, y, c) {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      var i = (y * w + x) * 4;
      d[i] = c[0];
      d[i + 1] = c[1];
      d[i + 2] = c[2];
      d[i + 3] = 255;
    }
    function disc(cx, cy, r, c) {
      var y, x;
      for (y = Math.floor(cy - r); y <= cy + r; y++) {
        for (x = Math.floor(cx - r); x <= cx + r; x++) {
          var dx = x - cx;
          var dy = y - cy;
          if (dx * dx + dy * dy <= r * r) put(x, y, c);
        }
      }
    }
    function box(x0, y0, x1, y1, c) {
      var y, x;
      for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) put(x, y, c);
    }
    function tri(x0, y0, x1, y1, x2, y2, c) {
      var y, x, minx = Math.min(x0, x1, x2), maxx = Math.max(x0, x1, x2);
      var miny = Math.min(y0, y1, y2), maxy = Math.max(y0, y1, y2);
      for (y = miny; y <= maxy; y++) {
        for (x = minx; x <= maxx; x++) {
          var d0 = (x - x1) * (y0 - y1) - (x0 - x1) * (y - y1);
          var d1 = (x - x2) * (y1 - y2) - (x1 - x2) * (y - y2);
          var d2 = (x - x0) * (y2 - y0) - (x2 - x0) * (y - y0);
          var neg = d0 < 0 || d1 < 0 || d2 < 0;
          var pos = d0 > 0 || d1 > 0 || d2 > 0;
          if (!(neg && pos)) put(x, y, c);
        }
      }
    }
    var sky = [168, 196, 214];
    var hill = [126, 146, 96];
    var wall = [232, 214, 184];
    var roof = [150, 64, 52];
    var door = [92, 58, 40];
    var sun = [240, 196, 96];
    box(8, 8, 111, 70, sky);
    disc(92, 22, 10, sun);
    disc(28, 78, 26, hill);
    disc(78, 84, 30, hill);
    box(46, 58, 78, 96, wall);
    tri(40, 60, 84, 60, 62, 36, roof);
    box(58, 74, 68, 96, door);
    box(50, 66, 58, 74, [214, 230, 236]);
    return { plate: Wash.plate(d, w, h, { colors: 6, size: 96 }) };
  },
  paint: function (ctx) {
    var t = ctx.t;
    var a = (t / 12) * Math.PI * 2;
    ctx.read = "a cloud over the picture";
    return { marks: [
      Wash.disc({ color: [0.93, 0.94, 0.93], load: 0.2, at: [-0.15 + Math.sin(a) * 0.35, 0.42], radius: [0.14, 0.05], bleed: 0.028, hold: 0.2, gran: 0.05, seed: 2, layer: 5 })
    ] };
  }
});
