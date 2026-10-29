Wash.scene({
  name: "landscape",
  title: "Late field",
  means: "Sky, hills and a field stacked as glazes. A cloud drifts, trees stand, and a click drops a wet stain.",
  hint: "Click the sheet to drop a wet stain.",
  duration: 12,
  still: 4,
  width: 880,
  height: 880,
  paper: [0.95, 0.9, 0.79],
  paint: function (ctx) {
    var t = ctx.t;
    var a = (t / 12) * Math.PI * 2;
    var cloud = -0.35 + Math.sin(a) * 0.22;
    function bend(y0, amp, phase) {
      var pts = [];
      var i;
      for (i = 0; i < 8; i++) {
        var u = i / 7;
        pts.push([-0.75 + u * 1.5, y0 + Math.sin(u * 6.283 + phase) * amp]);
      }
      return pts;
    }
    ctx.read = "a cloud crosses the hill";
    return { marks: [
      Wash.disc({ color: [0.58, 0.72, 0.82], load: 0.4, at: [0, 0.42], radius: [0.95, 0.48], bleed: 0.08, wet: 1, gran: 0.15, hold: 0.06, seed: 1, layer: 0 }),
      Wash.disc({ color: [0.72, 0.78, 0.7], load: 0.18, at: [0.35, 0.62], radius: [0.28, 0.08], bleed: 0.04, hold: 0.4, seed: 1.4, layer: 1 }),
      Wash.lift({ at: [cloud, 0.58], radius: [0.26, 0.09], load: 0.72, bleed: 0.04, seed: 2, layer: 4 }),
      Wash.lift({ at: [cloud + 0.22, 0.64], radius: [0.16, 0.06], load: 0.55, bleed: 0.03, seed: 2.3, layer: 4 }),
      Wash.disc({ color: [0.5, 0.58, 0.66], load: 0.38, at: [-0.05, 0.12], radius: [0.85, 0.22], bleed: 0.07, wet: 0.9, gran: 0.35, seed: 3, layer: 1 }),
      Wash.disc({ color: [0.42, 0.5, 0.46], load: 0.42, at: [0.2, -0.02], radius: [0.7, 0.2], bleed: 0.06, gran: 0.45, seed: 3.6, layer: 2 }),
      Wash.disc({ color: [0.55, 0.58, 0.28], load: 0.48, at: [0, -0.42], radius: [0.92, 0.38], bleed: 0.065, wet: 0.85, gran: 0.55, hold: 0.12, seed: 4, layer: 2 }),
      Wash.disc({ color: [0.32, 0.4, 0.2], load: 0.35, at: [-0.2, -0.22], radius: [0.4, 0.08], bleed: 0.04, gran: 0.5, seed: 4.5, layer: 3 }),
      Wash.stroke({ color: [0.62, 0.5, 0.32], load: 0.38, width: 0.04, points: bend(-0.55, 0.05, 0.4), bleed: 0.028, seed: 5, layer: 3 }),
      Wash.stroke({ color: [0.28, 0.42, 0.55], load: 0.42, width: 0.034, points: bend(-0.28, 0.04, 1.2), bleed: 0.022, hold: 0.08, seed: 5.5, layer: 3 }),
      Wash.lift({ at: [0.15, -0.3], radius: [0.12, 0.02], turn: -0.4, load: 0.45, seed: 5.8, layer: 4 }),
      Wash.disc({ color: [0.18, 0.32, 0.18], load: 0.62, at: [-0.48, -0.08], radius: [0.1, 0.14], bleed: 0.04, gran: 0.7, seed: 6, layer: 4 }),
      Wash.disc({ color: [0.15, 0.28, 0.16], load: 0.55, at: [-0.36, -0.02], radius: [0.07, 0.1], bleed: 0.03, gran: 0.6, seed: 6.4, layer: 4 }),
      Wash.disc({ color: [0.16, 0.3, 0.18], load: 0.58, at: [0.5, -0.12], radius: [0.11, 0.15], bleed: 0.04, gran: 0.65, seed: 6.8, layer: 4 }),
      Wash.stroke({ color: [0.28, 0.2, 0.12], load: 0.7, width: 0.012, points: [[-0.48, -0.22], [-0.48, -0.08]], seed: 7, layer: 5 }),
      Wash.stroke({ color: [0.28, 0.2, 0.12], load: 0.7, width: 0.012, points: [[0.5, -0.28], [0.5, -0.12]], seed: 7.2, layer: 5 }),
      Wash.ink({ color: [0.16, 0.14, 0.12], width: 0.004, points: [[-0.55, 0.02], [-0.4, 0.08], [-0.22, 0.01], [0.05, 0.06], [0.28, -0.02]], seed: 8, layer: 6 }),
      Wash.ink({ color: [0.18, 0.16, 0.14], width: 0.004, points: [[0.5 + Math.sin(a) * 0.12, 0.5], [0.56 + Math.sin(a) * 0.12, 0.54], [0.62 + Math.sin(a) * 0.12, 0.5]], seed: 9, layer: 6 })
    ] };
  }
});
