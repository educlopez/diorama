Wash.scene({
  name: "poppy",
  title: "One poppy",
  means: "A poppy built from overlapping petals, a green stem and a dark centre. It sways, and a click drops a stain.",
  hint: "Click the sheet to drop a wet stain.",
  duration: 12,
  still: 1.5,
  width: 880,
  height: 880,
  paper: [0.96, 0.91, 0.82],
  paint: function (ctx) {
    var t = ctx.t;
    var a = (t / 12) * Math.PI * 2;
    var s = Math.sin(a) * 0.03;
    ctx.read = "the stem sways";
    function petal(dx, dy, rx, ry, turn, seed, load) {
      return Wash.disc({ color: [0.72, 0.16, 0.14], load: load, at: [dx + s * 0.4, dy], radius: [rx, ry], turn: turn + s, bleed: 0.028, wet: 1, gran: 0.4, hold: 0.08, seed: seed, layer: 3 });
    }
    return { marks: [
      Wash.stroke({ color: [0.28, 0.42, 0.22], load: 0.6, width: 0.016, points: [[0.05 + s, -0.72], [0.02 + s * 0.6, -0.3], [0.04 + s * 0.3, 0.05]], bleed: 0.012, seed: 2, layer: 2 }),
      Wash.disc({ color: [0.3, 0.46, 0.24], load: 0.5, at: [-0.12 + s, -0.15], radius: [0.1, 0.045], turn: -0.8, bleed: 0.02, gran: 0.4, seed: 2.4, layer: 2 }),
      Wash.disc({ color: [0.26, 0.4, 0.22], load: 0.48, at: [0.16 + s * 0.5, -0.28], radius: [0.09, 0.04], turn: 0.7, bleed: 0.02, seed: 2.6, layer: 2 }),
      Wash.ink({ color: [0.16, 0.22, 0.12], width: 0.003, points: [[-0.02 + s, -0.12], [-0.14 + s, -0.16], [-0.2 + s, -0.12]], seed: 2.8, layer: 6 }),
      petal(-0.02, 0.22, 0.16, 0.2, -0.4, 3, 0.55),
      petal(0.14, 0.2, 0.15, 0.18, 0.5, 3.4, 0.5),
      petal(0.08, 0.34, 0.14, 0.16, 0.15, 3.8, 0.48),
      petal(-0.12, 0.32, 0.13, 0.17, -0.9, 4.2, 0.52),
      Wash.disc({ color: [0.62, 0.12, 0.14], load: 0.4, at: [0.02 + s * 0.3, 0.24], radius: [0.1, 0.08], bleed: 0.025, gran: 0.35, seed: 5, layer: 4 }),
      Wash.disc({ color: [0.18, 0.12, 0.1], load: 0.75, at: [0.02 + s * 0.3, 0.22], radius: [0.045, 0.04], bleed: 0.016, wet: 0.7, gran: 0.9, hold: 0.05, seed: 5.5, layer: 5 }),
      Wash.disc({ color: [0.72, 0.22, 0.18], load: 0.4, at: [0.42, -0.05], radius: [0.05, 0.07], bleed: 0.02, seed: 6, layer: 3 }),
      Wash.stroke({ color: [0.3, 0.4, 0.22], load: 0.45, width: 0.01, points: [[0.38, -0.2], [0.4, -0.08]], seed: 6.4, layer: 2 }),
      Wash.ink({ color: [0.25, 0.1, 0.08], width: 0.0035, points: [[-0.08 + s * 0.3, 0.18], [0.02 + s * 0.3, 0.22], [0.1 + s * 0.3, 0.16]], seed: 7, layer: 6 })
    ] };
  }
});
