Wash.scene({
  name: "still",
  title: "Bowl and fruit",
  means: "A bowl, an apple and a lemon on a cloth. The cloth's shadow breathes, and a click drops a wet stain.",
  hint: "Click the sheet to drop a wet stain.",
  duration: 12,
  still: 3,
  width: 880,
  height: 880,
  paper: [0.96, 0.91, 0.82],
  paint: function (ctx) {
    var t = ctx.t;
    var a = (t / 12) * Math.PI * 2;
    var sway = Math.sin(a) * 0.02;
    ctx.read = "the cloth shifts";
    return { marks: [
      Wash.disc({ color: [0.78, 0.7, 0.58], load: 0.28, at: [0, -0.15], radius: [0.85, 0.55], bleed: 0.06, wet: 0.55, gran: 0.25, hold: 0.2, seed: 1, layer: 0 }),
      Wash.disc({ color: [0.52, 0.36, 0.4], load: 0.28, at: [-0.2, -0.28], radius: [0.32, 0.14], turn: -0.4, bleed: 0.04, gran: 0.25, seed: 1.6, layer: 1 }),
      Wash.disc({ color: [0.32, 0.4, 0.48], load: 0.4, at: [-0.02, -0.08], radius: [0.28, 0.16], bleed: 0.03, wet: 0.95, gran: 0.35, hold: 0.1, seed: 3, layer: 2 }),
      Wash.disc({ color: [0.2, 0.28, 0.36], load: 0.45, at: [-0.02, -0.02], radius: [0.2, 0.1], bleed: 0.02, gran: 0.5, seed: 3.4, layer: 3 }),
      Wash.lift({ at: [-0.12, 0.04], radius: [0.04, 0.016], turn: 0.4, load: 0.35, seed: 3.6, layer: 5 }),
      Wash.disc({ color: [0.72, 0.22, 0.18], load: 0.62, at: [0.22, 0.12], radius: [0.11, 0.1], bleed: 0.028, wet: 1, gran: 0.55, hold: 0.1, seed: 5, layer: 4 }),
      Wash.disc({ color: [0.5, 0.14, 0.14], load: 0.35, at: [0.18, 0.08], radius: [0.05, 0.04], bleed: 0.016, gran: 0.4, seed: 5.3, layer: 4 }),
      Wash.lift({ at: [0.27, 0.16], radius: [0.025, 0.018], load: 0.7, seed: 5.5, layer: 5 }),
      Wash.stroke({ color: [0.3, 0.42, 0.22], load: 0.55, width: 0.012, points: [[0.22, 0.2], [0.24 + sway, 0.3], [0.2 + sway, 0.34]], seed: 5.8, layer: 5 }),
      Wash.disc({ color: [0.86, 0.74, 0.28], load: 0.55, at: [-0.22, 0.14], radius: [0.09, 0.07], turn: 0.6, bleed: 0.024, wet: 0.9, gran: 0.4, hold: 0.18, seed: 6, layer: 4 }),
      Wash.lift({ at: [-0.18, 0.17], radius: [0.02, 0.014], load: 0.6, seed: 6.3, layer: 5 }),
      Wash.disc({ color: [0.25, 0.2, 0.16], load: 0.28, at: [0.08, -0.22], radius: [0.22, 0.05], bleed: 0.03, gran: 0.2, seed: 7, layer: 2 }),
      Wash.disc({ color: [0.55, 0.32, 0.28], load: 0.35, at: [0.28, -0.02], radius: [0.08, 0.03], bleed: 0.02, seed: 7.4, layer: 3 }),
    ] };
  }
});
