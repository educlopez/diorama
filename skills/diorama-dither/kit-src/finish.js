/* Dither finish. Concatenated after the pixel kernel by scripts/sync-dither-kit.mjs.
   A Pixel page never loads this file, so the three Pixel scenes stay on the
   kernel defaults. Here the mount fills a dither scene only where it left a
   field empty: 360 x 280, Bayer 4 x 4, hard shadows, a warm rim, wind at
   8 frames per second, and a darker contact underfoot. */
var Dither = (function () {
  var COOL = [78, 88, 102], WARM = [255, 220, 160];

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rgb(h) {
    h = String(h).replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  function lum(c) { return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function scale(c, k) { return [c[0] * k, c[1] * k, c[2] * k]; }
  function hex(c) {
    return '#' + c.map(function (v) { return ('0' + clamp(Math.round(v), 0, 255).toString(16)).slice(-2); }).join('');
  }

  /* Five close tones around one colour. Index 0 is a touch cooler, index 4 a
     touch warmer. The lit colour stays itself: violet is reserved for the
     shadow veil. Adjacent steps stay between about 3.4 and 7.5 percent
     luminance so the 4 x 4 Bayer pattern does not read as a checker. */
  function targetsFor(L) {
    var t = [-.12, -.06, 0, .05, .1].map(function (d) { return clamp(L + d, .15, .8); }), i, over;
    for (i = 1; i < t.length; i++) {
      if (t[i] - t[i - 1] < .034) t[i] = t[i - 1] + .034;
      if (t[i] - t[i - 1] > .075) t[i] = t[i - 1] + .075;
    }
    over = t[4] - .8;
    if (over > 0) for (i = 0; i < 5; i++) t[i] -= over;
    if (t[0] < .12) { var up = .12 - t[0]; for (i = 0; i < 5; i++) t[i] += up; }
    return t;
  }
  function tone(seed, target, tint, tintAmt) {
    var ls = lum(seed) || .001, scaled = scale(seed, clamp(target / ls, .42, 1.85));
    if (tint) scaled = mix(scaled, tint, tintAmt);
    var ls2 = lum(scaled) || .001;
    return scale(scaled, clamp(target / ls2, .72, 1.4));
  }
  function ramp(color) {
    var c = rgb(color), goal = targetsFor(lum(c));
    var seeds = [mix(c, COOL, .16), mix(c, COOL, .05), c, mix(c, WARM, .22), mix(c, WARM, .4)];
    var tint = [COOL, null, null, WARM, WARM], amt = [.06, 0, 0, .06, .1];
    return seeds.map(function (s, i) { return hex(tone(s, goal[i], tint[i], amt[i])); });
  }

  /* A figure material: the same five tones, no texture, no dither. The kernel
     then paints flat bands and a dark silhouette. */
  function wear(color) { return { ramp: ramp(color), figure: true, tex: 'plain', dither: 0 }; }

  var PRESETS = {
    meadow: { hex: '#6f8f3c', tex: 'grass', ground: true },
    earth: { hex: '#a67c4a', tex: 'dirt', ground: true },
    moss: { hex: '#5d7a3e', tex: 'grass', rough: .6 },
    stone: { hex: '#d9c7a4', tex: 'stone', size: .34, rough: .85 },
    tile: { hex: '#c45c38', tex: 'thatch', grain: 'x', rough: .7 },
    timber: { hex: '#8d5a34', tex: 'wood', plank: .16, grain: 'x', rough: .5 },
    beam: { hex: '#5a3a28', tex: 'wood', plank: .12, grain: 'x', rough: .35 },
    sail: { hex: '#cbb892', tex: 'cloth', rough: .45 },
    sack: { hex: '#c6a15c', tex: 'cloth', rough: .6 },
    iron: { hex: '#5c636c', tex: 'plain', rough: .25 },
    leaf: { hex: '#3f6b34', tex: 'leaf' },
    cart: { hex: '#a56b3c', tex: 'wood', plank: .14, grain: 'x', rough: .45 },
    lantern: { hex: '#e6c56a', tex: 'plain', rough: .15, glow: .92 }
  };
  function mat(name, extra) {
    var p = PRESETS[name] || { hex: name, tex: 'plain', rough: .4 };
    var m = { ramp: ramp(p.hex), tex: p.tex };
    if (p.ground) m.ground = true;
    ['grain', 'rough', 'size', 'plank', 'glow', 'dither'].forEach(function (k) { if (p[k] != null) m[k] = p[k]; });
    if (extra) Object.keys(extra).forEach(function (k) { m[k] = extra[k]; });
    return m;
  }

  /* A small person: hat or hair, two or three cloth colours, a name for the pointer. */
  function folk(P, x, z, opt) {
    opt = opt || {};
    var shirt = opt.shirt || '#b5523a';
    var who = P.person(x, z, opt.parent || null, {
      h: opt.h == null ? .5 : opt.h, yaw: opt.yaw || 0, figure: true,
      shirt: wear(shirt), pants: wear(opt.pants || '#3e4c66'), skin: wear(opt.skin || '#e4b48c'),
      hair: opt.hair === false ? false : wear(opt.hair || '#3a2a22'),
      hat: opt.hat ? wear(opt.hat) : undefined,
      shoes: wear(opt.shoes || '#2a2420'), sleeve: wear(opt.sleeve || shirt)
    });
    who.root.name = opt.name || '';
    return who;
  }

  /* Plants step by whole pixels. spec.wind (8) quantises t; snap() quantises
     the offset. Period 4 closes on an 8 second loop. Reduced motion never
     advances t, so a plant stays on its still-frame pixel. No rotation: a
     turn of a few degrees would slide the edges off the pixel grid. */
  function sway(P, node, base, t, amp, phase) {
    var w = P.wind(t, 4, phase || 0), s = P.wind(t, 4, (phase || 0) + .37);
    var px = amp == null ? 2 : amp;
    node.position.x = base[0] + P.snap(px * P.px * w);
    node.position.y = base[1] || 0;
    node.position.z = base[2] + P.snap(px * P.px * .6 * s);
  }

  /* A sun whose shadows fall toward screen-right for the usual isometric azimuth.
     elevation is in degrees: lower throws a longer shadow. turn, in degrees,
     swings the sun off that axis so a sail that faces the camera still blocks
     a face, and the four blades stay apart on the ground instead of stacking
     into one bar. */
  function sun(cameraAz, elevation, turn) {
    var az = cameraAz == null ? 45 : cameraAz, el = elevation == null ? 24 : elevation;
    var rad = Math.PI / 180;
    var saz = Math.atan2(-Math.cos(az * rad), Math.sin(az * rad)) / rad + (turn || 0);
    return { az: saz, el: el, ambient: .3 };
  }

  /* Sack height through one loop: on the ground at both ends, resting on the
     cart through the middle. The ends match, so the loop seam is exact. */
  function carry(q) {
    var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
    if (q < .12) return 0;
    if (q < .4) return smooth((q - .12) / .28);
    if (q < .58) return 1;
    if (q < .86) return 1 - smooth((q - .58) / .28);
    return 0;
  }

  /* Tones, gaps, how cool the darkest step is (b - r) and how warm the lightest is. */
  function report(color) {
    var row = ramp(color), L = row.map(function (h) { return lum(rgb(h)); }), gaps = [], i;
    for (i = 1; i < L.length; i++) gaps.push(L[i] - L[i - 1]);
    var sh = rgb(row[0]), hi = rgb(row[row.length - 1]);
    return { tones: row.length, maxGap: Math.max.apply(null, gaps), shadowViolet: sh[2] - sh[0], lightYellow: hi[0] + hi[1] - 2 * hi[2] };
  }

  var prev = Pixel.mount;
  Pixel.mount = function (spec, canvas, opts) {
    if (spec.width == null) spec.width = 360;
    if (spec.height == null) spec.height = 280;
    if (spec.bayer == null) spec.bayer = 4;
    if (spec.shadow == null) spec.shadow = 'hard';
    if (spec.rim == null) spec.rim = true;
    if (spec.wind == null) spec.wind = 8;
    if (spec.contact == null) spec.contact = .66;
    return prev(spec, canvas, opts);
  };

  return { ramp: ramp, wear: wear, mat: mat, folk: folk, sway: sway, carry: carry, sun: sun, report: report };
})();
