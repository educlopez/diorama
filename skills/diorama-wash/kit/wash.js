var Wash = (function () {
  var scenes = [];
  var MAX = 40;
  var STRIDE = 8;

  function num(v, d) { return v == null ? d : v; }

  function mark(kind, o) {
    o = o || {};
    return {
      kind: kind,
      color: o.color || [0.35, 0.32, 0.28],
      load: num(o.load, kind === 4 ? 0.82 : kind === 5 ? 0.62 : 0.5),
      bleed: num(o.bleed, kind === 4 ? 0.012 : kind === 5 ? 0.03 : 0.052),
      wet: num(o.wet, kind === 4 ? 0.22 : 0.9),
      gran: num(o.gran, kind === 4 ? 0.28 : 0.62),
      hold: num(o.hold, kind === 5 ? 0 : 0.18),
      seed: num(o.seed, 1),
      layer: num(o.layer, kind === 4 ? 6 : kind === 5 ? 4 : 1),
      at: o.at || [0, 0],
      radius: o.radius || [0.2, 0.15],
      turn: num(o.turn, 0),
      width: num(o.width, kind === 4 ? 0.0065 : 0.032),
      points: o.points || null
    };
  }

  function scene(spec) {
    scenes.push(spec);
    return spec;
  }

  function encDist(sd) {
    var t = (sd + 0.22) / 0.64;
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    return Math.round(t * 255);
  }

  function chamfer(mask, n) {
    var g = new Float32Array(n * n);
    var i, x, y, best;
    for (i = 0; i < g.length; i++) g[i] = mask[i] ? 1e4 : 0;
    for (y = 0; y < n; y++) {
      for (x = 0; x < n; x++) {
        i = y * n + x;
        best = g[i];
        if (x > 0) best = Math.min(best, g[i - 1] + 1);
        if (y > 0) best = Math.min(best, g[i - n] + 1);
        if (x > 0 && y > 0) best = Math.min(best, g[i - n - 1] + 1.414);
        if (x + 1 < n && y > 0) best = Math.min(best, g[i - n + 1] + 1.414);
        g[i] = best;
      }
    }
    for (y = n - 1; y >= 0; y--) {
      for (x = n - 1; x >= 0; x--) {
        i = y * n + x;
        best = g[i];
        if (x + 1 < n) best = Math.min(best, g[i + 1] + 1);
        if (y + 1 < n) best = Math.min(best, g[i + n] + 1);
        if (x + 1 < n && y + 1 < n) best = Math.min(best, g[i + n + 1] + 1.414);
        if (x > 0 && y + 1 < n) best = Math.min(best, g[i + n - 1] + 1.414);
        g[i] = best;
      }
    }
    return g;
  }

  function plate(rgba, w, h, opts) {
    opts = opts || {};
    var n = opts.size || 96;
    var want = Math.max(1, Math.min(8, opts.colors || 6));
    var pix = new Float32Array(n * n * 3);
    var paper = new Uint8Array(n * n);
    var y, x, sy, sx, acc, cnt, si, sr, sg, sb, lum, k, i;
    for (y = 0; y < n; y++) {
      var y0 = Math.floor(y * h / n);
      var y1 = Math.max(y0 + 1, Math.floor((y + 1) * h / n));
      for (x = 0; x < n; x++) {
        var x0 = Math.floor(x * w / n);
        var x1 = Math.max(x0 + 1, Math.floor((x + 1) * w / n));
        acc = [0, 0, 0];
        cnt = 0;
        for (sy = y0; sy < y1 && sy < h; sy++) {
          for (sx = x0; sx < x1 && sx < w; sx++) {
            si = (sy * w + sx) * 4;
            if (rgba[si + 3] < 128) continue;
            acc[0] += rgba[si];
            acc[1] += rgba[si + 1];
            acc[2] += rgba[si + 2];
            cnt++;
          }
        }
        i = y * n + x;
        if (!cnt) { paper[i] = 1; continue; }
        sr = acc[0] / cnt / 255;
        sg = acc[1] / cnt / 255;
        sb = acc[2] / cnt / 255;
        lum = sr * 0.3 + sg * 0.5 + sb * 0.2;
        if (lum > 0.94 && Math.max(sr, sg, sb) - Math.min(sr, sg, sb) < 0.06) {
          paper[i] = 1;
          continue;
        }
        pix[i * 3] = sr;
        pix[i * 3 + 1] = sg;
        pix[i * 3 + 2] = sb;
      }
    }
    var ids = [];
    for (i = 0; i < n * n; i++) if (!paper[i]) ids.push(i);
    var empty = { size: n, count: 0, pigment: new Float32Array(24), load: new Float32Array(8), gran: new Float32Array(8), field: new Uint8Array(n * n * 4), fieldB: new Uint8Array(n * n * 4) };
    if (!ids.length) return empty;
    ids.sort(function (a, b) {
      var la = pix[a * 3] * 0.3 + pix[a * 3 + 1] * 0.5 + pix[a * 3 + 2] * 0.2;
      var lb = pix[b * 3] * 0.3 + pix[b * 3 + 1] * 0.5 + pix[b * 3 + 2] * 0.2;
      return la - lb;
    });
    var kUse = Math.min(want, ids.length);
    var cent = [];
    for (k = 0; k < kUse; k++) {
      var id = ids[Math.floor((k + 0.5) * ids.length / kUse)];
      cent.push([pix[id * 3], pix[id * 3 + 1], pix[id * 3 + 2]]);
    }
    var assign = new Int16Array(n * n);
    var iter, sum, seen, best, bd, dr, dg, db, d2;
    for (iter = 0; iter < 8; iter++) {
      for (i = 0; i < n * n; i++) {
        if (paper[i]) { assign[i] = -1; continue; }
        best = 0;
        bd = 1e9;
        for (k = 0; k < kUse; k++) {
          dr = pix[i * 3] - cent[k][0];
          dg = pix[i * 3 + 1] - cent[k][1];
          db = pix[i * 3 + 2] - cent[k][2];
          d2 = dr * dr + dg * dg + db * db;
          if (d2 < bd) { bd = d2; best = k; }
        }
        assign[i] = best;
      }
      sum = [];
      seen = [];
      for (k = 0; k < kUse; k++) { sum.push([0, 0, 0]); seen.push(0); }
      for (i = 0; i < n * n; i++) {
        if (assign[i] < 0) continue;
        k = assign[i];
        sum[k][0] += pix[i * 3];
        sum[k][1] += pix[i * 3 + 1];
        sum[k][2] += pix[i * 3 + 2];
        seen[k]++;
      }
      for (k = 0; k < kUse; k++) {
        if (!seen[k]) continue;
        cent[k][0] = sum[k][0] / seen[k];
        cent[k][1] = sum[k][1] / seen[k];
        cent[k][2] = sum[k][2] / seen[k];
      }
    }
    var order = [];
    for (k = 0; k < kUse; k++) {
      var live = 0;
      for (i = 0; i < assign.length; i++) if (assign[i] === k) live++;
      if (live < n * n * 0.004) continue;
      lum = cent[k][0] * 0.3 + cent[k][1] * 0.5 + cent[k][2] * 0.2;
      order.push({ k: k, lum: lum });
    }
    order.sort(function (a, b) { return b.lum - a.lum; });
    var count = Math.min(8, order.length);
    var pigment = new Float32Array(24);
    var load = new Float32Array(8);
    var gran = new Float32Array(8);
    var map = new Int16Array(n * n);
    map.fill(-1);
    for (k = 0; k < count; k++) {
      var srcK = order[k];
      pigment[k * 3] = cent[srcK.k][0];
      pigment[k * 3 + 1] = cent[srcK.k][1];
      pigment[k * 3 + 2] = cent[srcK.k][2];
      load[k] = 0.36 + (1 - srcK.lum) * 0.52;
      gran[k] = 0.2 + (1 - srcK.lum) * 0.65;
      for (i = 0; i < assign.length; i++) if (assign[i] === srcK.k) map[i] = k;
    }
    var field = new Uint8Array(n * n * 4);
    var fieldB = new Uint8Array(n * n * 4);
    var scale = 2 / n;
    for (k = 0; k < count; k++) {
      var inside = new Uint8Array(n * n);
      for (i = 0; i < n * n; i++) inside[i] = map[i] === k ? 1 : 0;
      var outside = new Uint8Array(n * n);
      for (i = 0; i < n * n; i++) outside[i] = inside[i] ? 0 : 1;
      var distIn = chamfer(inside, n);
      var distOut = chamfer(outside, n);
      var channel = k % 4;
      var dest = k < 4 ? field : fieldB;
      for (i = 0; i < n * n; i++) {
        var sd = (map[i] === k ? distIn[i] : -distOut[i]) * scale;
        var sx = i % n;
        var sy = Math.floor(i / n);
        var dy = n - 1 - sy;
        var di = dy * n + sx;
        dest[di * 4 + channel] = encDist(sd);
      }
    }
    return { size: n, count: count, pigment: pigment, load: load, gran: gran, field: field, fieldB: fieldB };
  }

  function pack(marks) {
    var data = new Float32Array(MAX * STRIDE * 4);
    var list = (marks || []).slice().sort(function (a, b) { return a.layer - b.layer || a.kind - b.kind; });
    var n = Math.min(list.length, MAX);
    var i, p, m, o, pts, at, rad, q;
    for (i = 0; i < n; i++) {
      m = list[i];
      o = i * STRIDE * 4;
      pts = m.points || [];
      data[o] = m.kind;
      data[o + 1] = pts.length;
      data[o + 2] = m.seed;
      data[o + 3] = m.turn || 0;
      data[o + 4] = m.color[0];
      data[o + 5] = m.color[1];
      data[o + 6] = m.color[2];
      data[o + 7] = m.load;
      data[o + 8] = m.bleed;
      data[o + 9] = m.wet;
      data[o + 10] = m.gran;
      data[o + 11] = m.hold;
      at = m.at || [0, 0];
      rad = m.radius || [0.2, 0.2];
      data[o + 12] = at[0];
      data[o + 13] = at[1];
      data[o + 14] = (m.kind === 1 || m.kind === 5) ? rad[0] : m.width;
      data[o + 15] = (m.kind === 1 || m.kind === 5) ? rad[1] : 0;
      for (p = 0; p < 8; p++) {
        q = pts[p] || [0, 0];
        data[o + 16 + p * 2] = q[0];
        data[o + 17 + p * 2] = q[1];
      }
    }
    return { data: data, count: n, dropped: Math.max(0, list.length - MAX) };
  }

  var vert = [
    "#version 300 es",
    "void main() {",
    "  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));",
    "  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);",
    "}"
  ].join("\n");

  var frag = [
    "#version 300 es",
    "precision highp float;",
    "uniform vec2 uRes;",
    "uniform vec3 uPaper;",
    "uniform vec4 uBloom;",
    "uniform vec3 uStain;",
    "uniform float uTime;",
    "uniform float uDuration;",
    "uniform int uCount;",
    "uniform sampler2D uMarks;",
    "uniform int uPlateCount;",
    "uniform sampler2D uFieldA;",
    "uniform sampler2D uFieldB;",
    "uniform vec3 uPigment[8];",
    "uniform float uLoad[8];",
    "uniform float uGran[8];",
    "out vec4 oColor;",
    "float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }",
    "float noise(vec2 p) {",
    "  vec2 i = floor(p);",
    "  vec2 f = fract(p);",
    "  f = f * f * (3.0 - 2.0 * f);",
    "  float a = hash(i);",
    "  float b = hash(i + vec2(1.0, 0.0));",
    "  float c = hash(i + vec2(0.0, 1.0));",
    "  float d = hash(i + vec2(1.0, 1.0));",
    "  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);",
    "}",
    "float fbm(vec2 p) {",
    "  float v = 0.0; float a = 0.5;",
    "  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }",
    "  return v;",
    "}",
    "vec2 spin(vec2 p, float a) { float c = cos(a), s = sin(a); return vec2(c * p.x - s * p.y, s * p.x + c * p.y); }",
    "vec4 tap(int index) { return texelFetch(uMarks, ivec2(index, 0), 0); }",
    "vec2 ppt(int mark, int i) { vec4 v = tap(mark * 8 + 4 + (i >> 1)); return ((i & 1) == 0) ? v.xy : v.zw; }",
    "float sdDisc(vec2 p, vec2 c, vec2 r, float turn) {",
    "  vec2 q = spin(p - c, -turn);",
    "  q.x /= max(r.x, 1e-4); q.y /= max(r.y, 1e-4);",
    "  return (length(q) - 1.0) * min(r.x, r.y);",
    "}",
    "float sdPoly(vec2 p, int mark, int n) {",
    "  vec2 a = ppt(mark, 0);",
    "  float d = 1e9; float s = 1.0;",
    "  for (int i = 0; i < 8; i++) {",
    "    if (i >= n) break;",
    "    int j = (i + 1 >= n) ? 0 : i + 1;",
    "    vec2 b = ppt(mark, j);",
    "    vec2 e = b - a; vec2 wv = p - a;",
    "    vec2 g = wv - e * clamp(dot(wv, e) / max(dot(e, e), 1e-6), 0.0, 1.0);",
    "    d = min(d, dot(g, g));",
    "    if ((p.y >= a.y && p.y < b.y && e.x * wv.y > e.y * wv.x) || (p.y < a.y && p.y >= b.y && e.x * wv.y <= e.y * wv.x)) s = -s;",
    "    a = b;",
    "  }",
    "  return s * sqrt(d);",
    "}",
    "float sdStroke(vec2 p, int mark, int n, float width) {",
    "  float d = 1e9;",
    "  for (int i = 0; i < 7; i++) {",
    "    if (i + 1 >= n) break;",
    "    vec2 a = ppt(mark, i); vec2 b = ppt(mark, i + 1); vec2 e = b - a;",
    "    float t = clamp(dot(p - a, e) / max(dot(e, e), 1e-6), 0.0, 1.0);",
    "    d = min(d, length(p - (a + e * t)));",
    "  }",
    "  return d - width;",
    "}",
    "vec3 glaze(vec3 col, vec3 base, vec3 pigment, float sd, float load, float bleed, float wet, float gran, float hold, float seed, float kind, float bristle, float n1, float n2, float n3, float grit, float fine) {",
    "  if (load < 0.001) return col;",
    "  float local = fract(n1 * 0.62 + n2 * 0.28 + seed * 0.173);",
    "  float s = sd + (local - 0.5) * bleed * 2.4 + (n3 - 0.5) * bleed * 1.1 + (fine - 0.5) * bleed * 0.35;",
    "  if (kind > 4.5 && kind < 5.5) {",
    "    float lift = (1.0 - smoothstep(-0.002, bleed, s)) * load * (0.72 + 0.28 * n2);",
    "    return mix(col, base, clamp(lift, 0.0, 0.9));",
    "  }",
    "  float cov = 1.0 - smoothstep(-bleed * 0.35, bleed * 1.15, s);",
    "  if (cov < 0.004) return col;",
    "  float rim = exp(-pow(s / max(bleed * 0.38, 0.0032), 2.0));",
    "  rim *= smoothstep(bleed * 1.2, -bleed * 0.05, s);",
    "  float body = 0.38 + 0.62 * (n2 * 0.5 + n3 * 0.5);",
    "  float pool = smoothstep(0.6, 0.9, n3 + fract(seed) * 0.12);",
    "  float pits = smoothstep(0.74, 0.96, grit);",
    "  float fleck = smoothstep(0.93, 0.995, n1 * 0.25 + fine * 0.75);",
    "  float opt = cov * load * body;",
    "  opt += rim * load * wet * 1.15;",
    "  opt += pool * cov * load * 0.36;",
    "  opt *= 1.0 + pits * gran * smoothstep(0.25, 0.7, opt) * 0.7;",
    "  opt *= 1.0 - fleck * hold * 0.55;",
    "  if (kind > 2.5 && kind < 3.5) opt *= mix(0.78, 1.0, bristle);",
    "  if (kind > 3.5 && kind < 4.5) {",
    "    float gap = smoothstep(0.05, 0.2, fract(n2 * 1.8 + fine * 1.4 + seed * 0.23));",
    "    opt *= mix(0.08, 1.0, gap);",
    "    opt = pow(max(opt, 0.0), 0.65);",
    "  }",
    "  opt = clamp(opt, 0.0, 2.8);",
    "  vec3 sigma = (vec3(1.0) - clamp(pigment, 0.0, 1.0)) * opt * 2.15;",
    "  sigma += vec3(pits * gran * load * 0.28);",
    "  return col * exp(-sigma);",
    "}",
    "void main() {",
    "  vec2 w = (gl_FragCoord.xy / uRes) * 2.0 - 1.0;",
    "  float ang = fract(uTime / max(uDuration, 0.001)) * 6.28318530718;",
    "  vec2 drift = vec2(sin(ang), cos(ang)) * 0.012;",
    "  vec2 pw = w + drift;",
    "  float n1 = fbm(pw * 2.3);",
    "  float n2 = fbm(pw * vec2(5.2, 4.4) + 4.1);",
    "  float n3 = fbm(pw * 1.55 + 8.4);",
    "  float grit = fbm(w * vec2(62.0, 74.0));",
    "  float fine = noise(w * 280.0);",
    "  float fiber = fbm(w * vec2(220.0, 36.0));",
    "  float tooth = fbm(w * vec2(90.0, 110.0) + 2.2);",
    "  float wx = fbm(pw * 1.2 + 2.2);",
    "  float wy = fbm(pw * 1.2 + 7.4);",
    "  vec2 p = w + (vec2(wx, wy) - 0.5) * 0.065;",
    "  vec3 base = uPaper;",
    "  base *= 0.93 + 0.08 * fiber;",
    "  base *= 0.95 + 0.06 * tooth;",
    "  base += (fine - 0.5) * 0.018 * vec3(1.0, 0.94, 0.82);",
    "  base = clamp(base, 0.0, 1.0);",
    "  vec3 col = base;",
    "  if (uPlateCount > 0) {",
    "    vec2 tuv = clamp(w * 0.5 + 0.5 + (vec2(n1, n2) - 0.5) * 0.02, 0.0, 1.0);",
    "    vec4 da = texture(uFieldA, tuv);",
    "    vec4 db = texture(uFieldB, tuv);",
    "    float ds0 = da.r, ds1 = da.g, ds2 = da.b, ds3 = da.a;",
    "    float ds4 = db.r, ds5 = db.g, ds6 = db.b, ds7 = db.a;",
    "    for (int i = 0; i < 8; i++) {",
    "      if (i >= uPlateCount) break;",
    "      float enc = i == 0 ? ds0 : i == 1 ? ds1 : i == 2 ? ds2 : i == 3 ? ds3 : i == 4 ? ds4 : i == 5 ? ds5 : i == 6 ? ds6 : ds7;",
      "      float sd = -(enc * 0.64 - 0.22);",
    "      col = glaze(col, base, uPigment[i], sd, uLoad[i], 0.046, 0.95, uGran[i], 0.14, float(i) * 1.7 + 0.6, 2.0, 1.0, n1, n2, n3, grit, fine);",
    "    }",
    "  }",
    "  for (int m = 0; m < 40; m++) {",
    "    if (m >= uCount) break;",
    "    vec4 a = tap(m * 8);",
    "    vec4 b = tap(m * 8 + 1);",
    "    vec4 c = tap(m * 8 + 2);",
    "    vec4 d = tap(m * 8 + 3);",
    "    float kind = a.x;",
    "    int npts = int(a.y + 0.5);",
    "    float seed = a.z;",
    "    float turn = a.w;",
    "    float sd = 4.0;",
    "    float bristle = 1.0;",
    "    if (kind > 0.5 && kind < 1.5) sd = sdDisc(p, d.xy, d.zw, turn);",
    "    else if (kind > 4.5 && kind < 5.5) sd = sdDisc(p, d.xy, max(d.zw, vec2(1e-3)), turn);",
    "    else if (kind > 1.5 && kind < 2.5 && npts >= 3) sd = sdPoly(p, m, npts);",
    "    else if (kind > 2.5 && kind < 4.5 && npts >= 2) {",
    "      float width = d.x * (0.82 + 0.28 * fract(n1 * 1.3 + seed * 0.31));",
    "      sd = sdStroke(p, m, npts, width);",
    "      vec2 e = ppt(m, 1) - ppt(m, 0);",
    "      float el = length(e);",
    "      vec2 tn = el > 1e-4 ? e / el : vec2(1.0, 0.0);",
    "      bristle = 0.55 + 0.45 * noise(vec2(dot(p, tn) * 14.0, seed));",
    "    } else continue;",
    "    col = glaze(col, base, b.xyz, sd, b.w, c.x, c.y, c.z, c.w, seed, kind, bristle, n1, n2, n3, grit, fine);",
    "  }",
    "  if (uBloom.w > 0.001 && uBloom.z > 0.0) {",
    "    float sd = length(w - uBloom.xy) - uBloom.z;",
    "    col = glaze(col, base, uStain, sd, uBloom.w, 0.075, 1.05, 0.4, 0.05, 4.2, 1.0, 1.0, n1, n2, n3, grit, fine);",
    "  }",
    "  col *= 0.97 + 0.04 * tooth;",
    "  col += (fiber - 0.5) * 0.012;",
    "  oColor = vec4(clamp(col, 0.0, 1.0), 1.0);",
    "}"
  ].join("\n");

  function mount(spec, canvas, opts) {
    opts = opts || {};
    if (!spec.paint) throw new Error("scene has no paint()");
    var gl = canvas.getContext("webgl2", { alpha: false, antialias: false, preserveDrawingBuffer: true });
    if (!gl) throw new Error("WebGL 2 is required");
    var W = spec.width || 900;
    var H = spec.height || 900;
    canvas.width = W;
    canvas.height = H;
    function compile(type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || "shader");
      return sh;
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "link");
    gl.useProgram(prog);
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    function loc(name) { return gl.getUniformLocation(prog, name); }
    function bindNearest(unit, width, height, internal, type, src) {
      var tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, type === gl.FLOAT ? gl.NEAREST : gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, type === gl.FLOAT ? gl.NEAREST : gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, width, height, 0, gl.RGBA, type, src);
      return tex;
    }
    var markTex = bindNearest(0, MAX * STRIDE, 1, gl.RGBA32F, gl.FLOAT, null);
    bindNearest(1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    bindNearest(2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    gl.uniform1i(loc("uMarks"), 0);
    gl.uniform1i(loc("uFieldA"), 1);
    gl.uniform1i(loc("uFieldB"), 2);
    gl.uniform2f(loc("uRes"), W, H);
    gl.uniform1f(loc("uDuration"), spec.duration || 1);
    var paper = spec.paper || [0.945, 0.9, 0.8];
    gl.uniform3fv(loc("uPaper"), new Float32Array(paper));
    gl.uniform3fv(loc("uStain"), new Float32Array(spec.stain || [0.33, 0.4, 0.5]));
    var prepared = spec.prepare ? spec.prepare() : null;
    var plated = prepared && prepared.plate;
    if (plated && plated.count) {
      gl.activeTexture(gl.TEXTURE1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, plated.size, plated.size, 0, gl.RGBA, gl.UNSIGNED_BYTE, plated.field);
      gl.activeTexture(gl.TEXTURE2);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, plated.size, plated.size, 0, gl.RGBA, gl.UNSIGNED_BYTE, plated.fieldB);
      gl.uniform1i(loc("uPlateCount"), plated.count);
      gl.uniform3fv(loc("uPigment"), plated.pigment);
      gl.uniform1fv(loc("uLoad"), plated.load);
      gl.uniform1fv(loc("uGran"), plated.gran);
    } else {
      gl.uniform1i(loc("uPlateCount"), 0);
      gl.uniform3fv(loc("uPigment"), new Float32Array(24));
      gl.uniform1fv(loc("uLoad"), new Float32Array(8));
      gl.uniform1fv(loc("uGran"), new Float32Array(8));
    }
    var pokes = [];
    var lastT = opts.t != null ? opts.t : (spec.still || 0);
    var hold = !!(opts.still || opts.t != null);
    var reduced = opts.reduced;
    if (reduced == null && window.matchMedia) reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function bloomFor(t) {
      var best = null;
      var i, age;
      for (i = 0; i < pokes.length; i++) {
        age = t - pokes[i].t0;
        if (age < 0 || age > 2.5) continue;
        best = { p: pokes[i], age: age };
      }
      if (!best) return [0, 0, 0, 0];
      var k = best.age / 2.5;
      return [best.p.x, best.p.y, 0.02 + k * 0.18, 0.9 * (1 - k)];
    }
    function draw(t) {
      var ctx = { t: t, q: spec.duration ? t / spec.duration : 0, read: "" };
      var painted = spec.paint(ctx) || {};
      var packed = pack(painted.marks || []);
      if (packed.dropped) throw new Error("too many marks");
      gl.useProgram(prog);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, markTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, MAX * STRIDE, 1, 0, gl.RGBA, gl.FLOAT, packed.data);
      gl.uniform1i(loc("uCount"), packed.count);
      gl.uniform1f(loc("uTime"), t);
      var bloom = bloomFor(t);
      gl.uniform4f(loc("uBloom"), bloom[0], bloom[1], bloom[2], bloom[3]);
      gl.viewport(0, 0, W, H);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      lastT = t;
      if (opts.onRead) opts.onRead(painted.read || ctx.read || "");
    }
    function pixels() {
      var buf = new Uint8Array(W * H * 4);
      gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, buf);
      return buf;
    }
    function hashOf(buf) {
      var h = 2166136261;
      var i;
      for (i = 0; i < buf.length; i += 4) {
        h ^= buf[i];
        h = Math.imul(h, 16777619);
        h ^= buf[i + 1];
        h = Math.imul(h, 16777619);
        h ^= buf[i + 2];
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    }
    function same(t) {
      draw(t);
      var a = pixels();
      draw(t);
      var b = pixels();
      var n = 0;
      var i;
      for (i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) n++;
      return { identical: n === 0, mismatches: n, hash: hashOf(a), bytes: a.length };
    }
    function poke(x, y, t) {
      if (x < -1.05 || x > 1.05 || y < -1.05 || y > 1.05) return false;
      pokes.push({ x: x, y: y, t0: t });
      return true;
    }
    var running = true;
    var origin = null;
    function loop(now) {
      if (!running) return;
      if (origin == null) origin = now;
      var t = ((now - origin) / 1000) % (spec.duration || 1);
      draw(t);
      if (running) requestAnimationFrame(loop);
    }
    document.addEventListener("visibilitychange", function () {
      if (hold || reduced) return;
      if (document.hidden) running = false;
      else { running = true; origin = null; requestAnimationFrame(loop); }
    });
    canvas.addEventListener("pointerdown", function (e) {
      var r = canvas.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width) * 2 - 1;
      var y = (1 - (e.clientY - r.top) / r.height) * 2 - 1;
      if (poke(x, y, lastT)) draw(lastT);
    });
    if (hold || reduced) draw(opts.t != null ? opts.t : (spec.still || 0));
    else requestAnimationFrame(loop);
    return {
      renderAt: function (t) { draw(t); },
      same: same,
      poke: poke,
      clearPokes: function () { pokes.length = 0; },
      pixels: function () { return pixels(); },
      glInfo: function () { return { webgl: true, renderer: gl.getParameter(gl.RENDERER) || "" }; }
    };
  }

  return {
    scenes: scenes,
    scene: scene,
    disc: function (o) { return mark(1, o); },
    poly: function (o) { return mark(2, o); },
    stroke: function (o) { return mark(3, o); },
    ink: function (o) { return mark(4, o); },
    lift: function (o) { return mark(5, o); },
    plate: plate,
    mount: mount
  };
})();
