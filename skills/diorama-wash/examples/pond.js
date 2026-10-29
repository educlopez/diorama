Wash.scene({
  name: "pond",
  title: "A quiet pond",
  means: "Layered blue washes make a pond. A boat crosses, the shore blooms green, and a click drops a wet stain.",
  hint: "Click the sheet to drop a wet stain.",
  duration: 12,
  still: 3.2,
  width: 880,
  height: 880,
  paper: [0.95, 0.9, 0.8],
  paint: function (ctx) {
    var t = ctx.t;
    var a = (t / 12) * Math.PI * 2;
    var x = Math.sin(a) * 0.18;
    var y = Math.cos(a * 2) * 0.07;
    var dx = Math.cos(a) * 0.18;
    var dy = -Math.sin(a * 2) * 0.14;
    var ang = Math.atan2(dy, dx);
    var c = Math.cos(ang);
    var s = Math.sin(ang);
    var oar = Math.sin(a * 6);
    function p(px, py) { return [x + px * c - py * s, y + px * s + py * c]; }
    ctx.read = "one boat, crossing";
    return { marks: [
      Wash.disc({ color: [0.4, 0.62, 0.72], load: 0.42, at: [0.0, 0.02], radius: [0.42, 0.34], bleed: 0.08, wet: 1.1, gran: 0.3, hold: 0.12, seed: 2.2, layer: 1 }),
      Wash.disc({ color: [0.16, 0.32, 0.55], load: 0.4, at: [0.06, -0.04], radius: [0.2, 0.15], bleed: 0.05, wet: 0.9, gran: 0.85, hold: 0.05, seed: 3.4, layer: 2 }),
      Wash.disc({ color: [0.22, 0.36, 0.5], load: 0.28, at: [x * 0.2 - 0.06, y * 0.2], radius: [0.1, 0.04], turn: ang, bleed: 0.03, gran: 0.2, seed: 8, layer: 2 }),
      Wash.disc({ color: [0.34, 0.46, 0.22], load: 0.42, at: [0.02, -0.3], radius: [0.46, 0.14], bleed: 0.05, gran: 0.55, seed: 4, layer: 3 }),
      Wash.disc({ color: [0.28, 0.4, 0.2], load: 0.4, at: [-0.3, 0.16], radius: [0.1, 0.07], bleed: 0.04, gran: 0.5, seed: 4.6, layer: 3 }),
      Wash.disc({ color: [0.24, 0.42, 0.28], load: 0.36, at: [0.16, 0.06], radius: [0.055, 0.035], bleed: 0.02, hold: 0.15, seed: 6, layer: 3 }),
      Wash.disc({ color: [0.22, 0.4, 0.26], load: 0.4, at: [0.18, 0.02], radius: [0.06, 0.04], bleed: 0.025, hold: 0.3, seed: 7, layer: 3 }),
      Wash.ink({ color: [0.14, 0.18, 0.12], width: 0.004, points: [[-0.5, -0.02], [-0.48, 0.16], [-0.52, 0.22]], seed: 11, layer: 6 }),
      Wash.ink({ color: [0.14, 0.18, 0.12], width: 0.0035, points: [[-0.4, -0.06], [-0.38, 0.1]], seed: 11.3, layer: 6 }),
      Wash.ink({ color: [0.16, 0.18, 0.12], width: 0.0035, points: [[0.42, -0.18], [0.46, 0.02], [0.4, 0.12]], seed: 11.6, layer: 6 }),
      Wash.poly({ color: [0.42, 0.24, 0.14], load: 0.78, bleed: 0.014, wet: 0.6, gran: 0.3, hold: 0.05, seed: 12, layer: 5, points: [p(0.14, 0), p(0.04, 0.04), p(-0.12, 0.028), p(-0.14, -0.012), p(-0.1, -0.03), p(0.04, -0.04)] }),
      Wash.disc({ color: [0.62, 0.36, 0.3], load: 0.5, at: p(-0.02, 0), radius: [0.026, 0.016], bleed: 0.008, gran: 0.05, hold: 0, seed: 13, layer: 5 }),
      Wash.stroke({ color: [0.32, 0.2, 0.12], load: 0.65, width: 0.012, points: [p(0.0, 0.012), p(0.04, 0.09 + oar * 0.035)], bleed: 0.006, seed: 14, layer: 5 }),
      Wash.stroke({ color: [0.32, 0.2, 0.12], load: 0.65, width: 0.012, points: [p(0.0, -0.012), p(0.04, -0.09 - oar * 0.035)], bleed: 0.006, seed: 14.4, layer: 5 }),
      Wash.lift({ at: [x - dx * 0.9, y - dy * 0.9], radius: [0.09, 0.025], turn: ang, load: 0.5, bleed: 0.018, seed: 15, layer: 4 })
    ] };
  }
});
