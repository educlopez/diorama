Wash.scene({
  name: "town",
  title: "Three roofs",
  means: "Three houses in wash and broken ink. Smoke rises, a figure passes, and a click drops a wet stain.",
  hint: "Click the sheet to drop a wet stain.",
  duration: 12,
  still: 2.5,
  width: 880,
  height: 880,
  paper: [0.95, 0.9, 0.81],
  paint: function (ctx) {
    var t = ctx.t;
    var a = (t / 12) * Math.PI * 2;
    var walk = Math.sin(a) * 0.32;
    var smoke = 0.5 - 0.5 * Math.cos(a * 2);
    ctx.read = "smoke and a passer-by";
    return { marks: [
      Wash.disc({ color: [0.62, 0.74, 0.8], load: 0.32, at: [0, 0.55], radius: [1.05, 0.45], bleed: 0.06, wet: 0.7, gran: 0.12, hold: 0.18, seed: 1, layer: 0 }),
      Wash.disc({ color: [0.62, 0.58, 0.42], load: 0.4, at: [0, -0.62], radius: [1.1, 0.32], bleed: 0.05, gran: 0.4, seed: 1.5, layer: 1 }),
      Wash.disc({ color: [0.45, 0.48, 0.36], load: 0.28, at: [0.1, -0.35], radius: [0.7, 0.08], bleed: 0.04, seed: 1.8, layer: 1 }),
      Wash.poly({ color: [0.78, 0.7, 0.55], load: 0.42, bleed: 0.03, wet: 0.8, gran: 0.25, hold: 0.16, seed: 2, layer: 2, points: [[-0.62, -0.28], [-0.3, -0.26], [-0.28, 0.08], [-0.64, 0.05]] }),
      Wash.poly({ color: [0.7, 0.38, 0.28], load: 0.55, bleed: 0.028, wet: 0.9, gran: 0.45, seed: 2.4, layer: 3, points: [[-0.7, 0.02], [-0.46, 0.22], [-0.22, 0.04]] }),
      Wash.poly({ color: [0.84, 0.78, 0.68], load: 0.4, bleed: 0.03, wet: 0.75, gran: 0.2, hold: 0.14, seed: 3, layer: 2, points: [[-0.16, -0.32], [0.16, -0.3], [0.14, 0.16], [-0.18, 0.12]] }),
      Wash.poly({ color: [0.35, 0.4, 0.48], load: 0.5, bleed: 0.026, wet: 0.85, gran: 0.55, seed: 3.4, layer: 3, points: [[-0.22, 0.1], [0, 0.32], [0.2, 0.12]] }),
      Wash.poly({ color: [0.72, 0.58, 0.46], load: 0.45, bleed: 0.03, wet: 0.8, gran: 0.35, seed: 4, layer: 2, points: [[0.28, -0.24], [0.62, -0.22], [0.6, 0.02], [0.26, -0.02]] }),
      Wash.poly({ color: [0.62, 0.42, 0.22], load: 0.52, bleed: 0.026, wet: 0.9, gran: 0.5, seed: 4.4, layer: 3, points: [[0.22, -0.02], [0.44, 0.16], [0.66, 0]] }),
      Wash.disc({ color: [0.28, 0.34, 0.4], load: 0.55, at: [-0.5, -0.08], radius: [0.035, 0.045], bleed: 0.012, hold: 0.2, seed: 5, layer: 4 }),
      Wash.disc({ color: [0.28, 0.34, 0.4], load: 0.55, at: [-0.4, -0.06], radius: [0.032, 0.04], bleed: 0.012, hold: 0.2, seed: 5.2, layer: 4 }),
      Wash.lift({ at: [-0.5, -0.06], radius: [0.012, 0.014], load: 0.7, seed: 5.3, layer: 5 }),
      Wash.disc({ color: [0.25, 0.32, 0.38], load: 0.5, at: [-0.02, -0.02], radius: [0.04, 0.05], bleed: 0.012, seed: 5.5, layer: 4 }),
      Wash.disc({ color: [0.25, 0.32, 0.38], load: 0.5, at: [0.08, 0], radius: [0.035, 0.045], bleed: 0.012, seed: 5.6, layer: 4 }),
      Wash.poly({ color: [0.4, 0.24, 0.18], load: 0.6, bleed: 0.012, points: [[-0.04, -0.28], [0.04, -0.28], [0.03, -0.12], [-0.03, -0.12]], seed: 5.8, layer: 4 }),
      Wash.disc({ color: [0.22, 0.36, 0.22], load: 0.55, at: [0.72, -0.08], radius: [0.1, 0.12], bleed: 0.035, gran: 0.6, seed: 6, layer: 3 }),
      Wash.stroke({ color: [0.3, 0.22, 0.14], load: 0.65, width: 0.012, points: [[0.72, -0.22], [0.72, -0.08]], seed: 6.2, layer: 5 }),
      Wash.ink({ color: [0.18, 0.14, 0.12], width: 0.005, points: [[-0.66, -0.27], [-0.66, 0.04], [-0.28, 0.07]], seed: 7, layer: 6 }),
      Wash.ink({ color: [0.18, 0.14, 0.12], width: 0.0045, points: [[-0.68, 0.03], [-0.46, 0.2], [-0.24, 0.05]], seed: 7.2, layer: 6 }),
      Wash.ink({ color: [0.16, 0.14, 0.12], width: 0.005, points: [[-0.18, -0.3], [-0.18, 0.12], [0.15, 0.15]], seed: 7.4, layer: 6 }),
      Wash.ink({ color: [0.16, 0.14, 0.12], width: 0.004, points: [[-0.2, 0.1], [0, 0.3], [0.18, 0.12]], seed: 7.6, layer: 6 }),
      Wash.ink({ color: [0.2, 0.14, 0.1], width: 0.0045, points: [[0.26, -0.22], [0.26, 0], [0.6, 0.02]], seed: 7.8, layer: 6 }),
      Wash.stroke({ color: [0.55, 0.56, 0.58], load: 0.28, width: 0.03, points: [[-0.46, 0.2], [-0.42, 0.2 + smoke * 0.28], [-0.36, 0.22 + smoke * 0.36]], bleed: 0.02, hold: 0.3, seed: 8, layer: 5 }),
      Wash.disc({ color: [0.32, 0.28, 0.36], load: 0.6, at: [walk, -0.4], radius: [0.035, 0.07], bleed: 0.012, seed: 9, layer: 5 }),
      Wash.disc({ color: [0.72, 0.56, 0.44], load: 0.45, at: [walk, -0.3], radius: [0.022, 0.022], bleed: 0.01, seed: 9.2, layer: 5 }),
      Wash.disc({ color: [0.25, 0.22, 0.2], load: 0.4, at: [walk, -0.48], radius: [0.05, 0.012], bleed: 0.01, seed: 9.4, layer: 5 })
    ] };
  }
});
