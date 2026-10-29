Wash.scene({
  name: "portrait",
  title: "A sitter",
  means: "A head in warm glazes and a broken ink line. Hair shifts, paper stays in the light, a click drops a stain.",
  hint: "Click the sheet to drop a wet stain.",
  duration: 12,
  still: 2,
  width: 880,
  height: 880,
  paper: [0.95, 0.9, 0.8],
  paint: function (ctx) {
    var t = ctx.t;
    var a = (t / 12) * Math.PI * 2;
    var lean = Math.sin(a) * 0.015;
    ctx.read = "the hair moves a little";
    return { marks: [
      Wash.disc({ color: [0.72, 0.74, 0.66], load: 0.22, at: [0.02, 0.02], radius: [0.62, 0.7], bleed: 0.08, wet: 0.6, gran: 0.2, hold: 0.28, seed: 1, layer: 0 }),
      Wash.disc({ color: [0.28, 0.16, 0.12], load: 0.7, at: [0.04 + lean, 0.16], radius: [0.34, 0.4], bleed: 0.05, wet: 0.8, gran: 0.85, hold: 0.08, seed: 2, layer: 2 }),
      Wash.disc({ color: [0.22, 0.12, 0.1], load: 0.55, at: [-0.22 + lean, 0.02], radius: [0.12, 0.22], bleed: 0.04, gran: 0.7, seed: 2.4, layer: 2 }),
      Wash.disc({ color: [0.24, 0.13, 0.1], load: 0.5, at: [0.26 + lean, 0.04], radius: [0.1, 0.18], bleed: 0.035, gran: 0.65, seed: 2.6, layer: 2 }),
      Wash.stroke({ color: [0.2, 0.1, 0.08], load: 0.65, width: 0.04, points: [[-0.18 + lean, 0.28], [-0.05 + lean, 0.42], [0.12 + lean, 0.36], [0.22 + lean, 0.22]], bleed: 0.02, gran: 0.4, seed: 3, layer: 3 }),
      Wash.stroke({ color: [0.18, 0.1, 0.08], load: 0.6, width: 0.028, points: [[-0.28 + lean, 0.12], [-0.32 + lean + Math.sin(a) * 0.02, -0.05], [-0.26 + lean, -0.18]], bleed: 0.016, seed: 3.3, layer: 3 }),
      Wash.disc({ color: [0.86, 0.64, 0.5], load: 0.48, at: [0.02 + lean, -0.02], radius: [0.2, 0.26], bleed: 0.035, wet: 0.7, gran: 0.25, hold: 0.28, seed: 4, layer: 3 }),
      Wash.disc({ color: [0.62, 0.4, 0.34], load: 0.32, at: [-0.06 + lean, -0.04], radius: [0.1, 0.16], bleed: 0.03, gran: 0.35, seed: 4.4, layer: 4 }),
      Wash.disc({ color: [0.78, 0.5, 0.42], load: 0.28, at: [0.04 + lean, -0.2], radius: [0.06, 0.08], bleed: 0.02, seed: 4.6, layer: 4 }),
      Wash.lift({ at: [0.12 + lean, 0.02], radius: [0.035, 0.05], load: 0.28, bleed: 0.016, seed: 5, layer: 5 }),
      Wash.disc({ color: [0.28, 0.18, 0.14], load: 0.7, at: [-0.05 + lean, 0.04], radius: [0.018, 0.012], turn: 0.2, bleed: 0.008, gran: 0.1, hold: 0, seed: 6, layer: 5 }),
      Wash.disc({ color: [0.28, 0.18, 0.14], load: 0.7, at: [0.09 + lean, 0.03], radius: [0.016, 0.011], turn: -0.1, bleed: 0.008, gran: 0.1, hold: 0, seed: 6.2, layer: 5 }),
      Wash.disc({ color: [0.7, 0.32, 0.32], load: 0.4, at: [0.03 + lean, -0.14], radius: [0.035, 0.016], bleed: 0.01, seed: 6.5, layer: 5 }),
      Wash.stroke({ color: [0.72, 0.5, 0.4], load: 0.35, width: 0.012, points: [[0.01 + lean, -0.22], [0.03 + lean, -0.32]], seed: 6.8, layer: 4 }),
      Wash.disc({ color: [0.32, 0.42, 0.55], load: 0.48, at: [0.02, -0.52], radius: [0.28, 0.22], bleed: 0.04, wet: 0.7, gran: 0.35, hold: 0.1, seed: 7, layer: 2 }),
      Wash.ink({ color: [0.16, 0.1, 0.08], width: 0.0045, points: [[-0.12 + lean, 0.18], [-0.16 + lean, 0.02], [-0.12 + lean, -0.16], [-0.02 + lean, -0.24], [0.1 + lean, -0.18], [0.16 + lean, 0]], seed: 8, layer: 6 }),
      Wash.ink({ color: [0.15, 0.1, 0.08], width: 0.0035, points: [[-0.02 + lean, -0.02], [0.02 + lean, -0.08], [0.01 + lean, -0.12]], seed: 8.4, layer: 6 }),
      Wash.ink({ color: [0.14, 0.1, 0.08], width: 0.003, points: [[-0.1 + lean, 0.1], [-0.02 + lean, 0.12]], seed: 8.6, layer: 6 }),
      Wash.ink({ color: [0.14, 0.1, 0.08], width: 0.003, points: [[0.04 + lean, 0.1], [0.12 + lean, 0.08]], seed: 8.8, layer: 6 })
    ] };
  }
});
