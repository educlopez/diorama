var Wash = (function () {
  var scenes = [];
  var TAU = Math.PI * 2;

  function scene(spec) {
    scenes.push(spec);
    return spec;
  }

  function compile(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(log);
    }
    return shader;
  }

  function program(gl, vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, "aPos");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }

  var quadVs = [
    "#version 300 es",
    "layout(location=0) in vec2 aPos;",
    "out vec2 vUv;",
    "void main() {",
    "  vUv = aPos * 0.5 + 0.5;",
    "  gl_Position = vec4(aPos, 0.0, 1.0);",
    "}"
  ].join("\n");

  var spriteVs = [
    "#version 300 es",
    "layout(location=0) in vec2 aPos;",
    "uniform vec2 uCenter;",
    "uniform vec2 uHalf;",
    "uniform float uRot;",
    "out vec2 vLocal;",
    "void main() {",
    "  vec2 p = aPos * uHalf;",
    "  float c = cos(uRot), s = sin(uRot);",
    "  p = vec2(c * p.x - s * p.y, s * p.x + c * p.y);",
    "  vLocal = aPos;",
    "  gl_Position = vec4(uCenter + p, 0.0, 1.0);",
    "}"
  ].join("\n");

  var noiseGlsl = [
    "float hash(vec2 p) {",
    "  vec3 p3 = fract(vec3(p.xyx) * 0.1031);",
    "  p3 += dot(p3, p3.yzx + 33.33);",
    "  return fract((p3.x + p3.y) * p3.z);",
    "}",
    "float noise(vec2 p) {",
    "  vec2 i = floor(p);",
    "  vec2 f = fract(p);",
    "  float a = hash(i);",
    "  float b = hash(i + vec2(1.0, 0.0));",
    "  float c = hash(i + vec2(0.0, 1.0));",
    "  float d = hash(i + vec2(1.0, 1.0));",
    "  vec2 u = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);",
    "}",
    "float fbm(vec2 p) {",
    "  float v = 0.0;",
    "  float a = 0.5;",
    "  for (int i = 0; i < 5; i++) {",
    "    v += a * noise(p);",
    "    p = p * 2.02 + vec2(1.7, 9.2);",
    "    a *= 0.5;",
    "  }",
    "  return v;",
    "}"
  ].join("\n");

  var waveFs = [
    "#version 300 es",
    "precision highp float;",
    "in vec2 vUv;",
    "out vec4 o;",
    "uniform sampler2D uImp;",
    "uniform float uCount;",
    "uniform float uWakes;",
    "uniform float uTime;",
    "uniform float uDuration;",
    "float ring(vec2 world, int i) {",
    "  vec4 imp = texelFetch(uImp, ivec2(i, 0), 0);",
    "  float amp = imp.w;",
    "  if (amp < 0.004) return 0.0;",
    "  vec2 pos = imp.xy * 2.0 - 1.0;",
    "  float age = imp.z * 3.0;",
    "  float d = length(world - pos);",
    "  float radius = age * 0.52;",
    "  float band = exp(-pow((d - radius) / 0.05, 2.0)) * exp(-age * 0.42);",
    "  float rip = sin(d * 64.0 - age * 8.0) * exp(-pow((d - radius) / 0.09, 2.0)) * exp(-age * 0.55);",
    "  float wake = float(i) < uWakes ? (band * 0.55 + rip * 0.7) : (band * 1.15 + rip * 0.35);",
    "  return wake * amp;",
    "}",
    "float field(vec2 uv) {",
    "  vec2 world = uv * 2.0 - 1.0;",
    "  float phase = fract(uTime / uDuration) * 6.28318530718;",
    "  float h = sin(world.x * 16.0 + phase) * sin(world.y * 14.0 - phase * 0.5) * 0.03;",
    "  h += sin(world.x * 28.0 - phase * 2.0 + world.y * 11.0) * 0.016;",
    "  for (int i = 0; i < 64; i++) {",
    "    if (float(i) + 0.5 > uCount) break;",
    "    h += ring(world, i);",
    "  }",
    "  return clamp(h, -1.0, 1.0);",
    "}",
    "void main() {",
    "  float e = 1.6 / 384.0;",
    "  float h = field(vUv);",
    "  float hx = field(vUv + vec2(e, 0.0));",
    "  float hy = field(vUv + vec2(0.0, e));",
    "  o = vec4(clamp(h * 0.5 + 0.5, 0.0, 1.0), clamp((hx - h) * 6.0 * 0.5 + 0.5, 0.0, 1.0), clamp((hy - h) * 6.0 * 0.5 + 0.5, 0.0, 1.0), 1.0);",
    "}"
  ].join("\n");

  var beautyFs = [
    "#version 300 es",
    "precision highp float;",
    "in vec2 vUv;",
    "out vec4 o;",
    "uniform sampler2D uWave;",
    "uniform vec2 uPond;",
    "uniform float uSeed;",
    "uniform float uVeg;",
    "uniform float uLilies;",
    "uniform float uReeds;",
    "uniform float uTime;",
    "uniform float uDuration;",
    noiseGlsl,
    "float pondD(vec2 world) {",
    "  vec2 p = world / uPond;",
    "  float n = fbm(p * 2.15 + uSeed) - 0.5;",
    "  float n2 = fbm(p * 4.8 + uSeed * 2.7) - 0.5;",
    "  return length(p) - 1.0 + n * 0.36 + n2 * 0.12;",
    "}",
    "float lily(vec2 world, vec2 c, float r, float slitAng) {",
    "  vec2 q = world - c;",
    "  float d = length(q) - r;",
    "  float ang = atan(q.y, q.x);",
    "  float slit = smoothstep(0.18, 0.02, abs(ang - slitAng)) * smoothstep(r, r * 0.15, length(q));",
    "  float pad = smoothstep(0.02, -0.025, d);",
    "  return pad * (1.0 - slit);",
    "}",
    "void main() {",
    "  vec3 wave = texture(uWave, vUv).rgb;",
    "  float h = wave.r * 2.0 - 1.0;",
    "  vec2 g = (wave.gb * 2.0 - 1.0) / 6.0;",
    "  vec2 world = vUv * 2.0 - 1.0;",
    "  float phase = fract(uTime / uDuration) * 6.28318530718;",
    "  vec2 drift = vec2(sin(phase), cos(phase * 2.0));",
    "  vec2 flow = vec2(fbm(world * 2.6 + drift * 0.45), fbm(world * 2.6 + drift.yx * 0.45)) - 0.5;",
    "  float d = pondD(world + g * 0.02);",
    "  vec2 wuv = vUv + g * 0.22 + flow * 0.045;",
    "  float grain = noise(vUv * vec2(540.0, 680.0));",
    "  float grain2 = noise(vUv * vec2(220.0, 260.0) + 4.0);",
    "  float fiber = noise(vec2(vUv.x * 28.0, vUv.y * 920.0));",
    "  vec3 paper = vec3(0.957, 0.922, 0.839);",
    "  paper *= 0.93 + 0.09 * grain + 0.04 * grain2 + 0.035 * fiber;",
    "  paper += (noise(vUv * 90.0) - 0.5) * 0.015;",
    "  float ang = atan(world.y, world.x);",
    "  float gaps = smoothstep(0.28, 0.62, noise(vec2(ang * 1.7 + uSeed, d * 3.0 + uSeed)));",
    "  float shore = exp(-pow((d + 0.01) / 0.18, 2.0));",
    "  float clumps = fbm(world * 5.2 + uSeed * 1.7);",
    "  float vegA = smoothstep(0.38, 0.66, clumps) * shore * (0.42 + 0.58 * gaps);",
    "  vegA += smoothstep(0.55, 0.8, fbm(world * 7.2 + uSeed)) * smoothstep(0.2, -0.02, abs(d)) * (0.35 + 0.65 * gaps);",
    "  vegA *= uVeg;",
    "  float vegN = fbm(world * 14.0 + 3.0);",
    "  vec3 veg = mix(vec3(0.30, 0.35, 0.16), vec3(0.48, 0.46, 0.22), vegN);",
    "  veg = mix(veg, vec3(0.36, 0.32, 0.16), smoothstep(0.62, 0.9, noise(world * 40.0)));",
    "  float waterA = smoothstep(0.09, -0.055, d);",
    "  float depth = smoothstep(0.06, -0.62, d);",
    "  float wash = fbm(wuv * 3.1 + uSeed);",
    "  float wash2 = fbm(wuv * 7.4 + uSeed * 2.0);",
    "  float wash3 = fbm(wuv * 1.4 - uSeed);",
    "  vec3 shallow = vec3(0.49, 0.70, 0.75);",
    "  vec3 cerulean = vec3(0.27, 0.52, 0.66);",
    "  vec3 indigo = vec3(0.13, 0.20, 0.40);",
    "  vec3 water = mix(shallow, cerulean, smoothstep(0.0, 0.55, depth));",
    "  water = mix(water, indigo, smoothstep(0.28, 0.95, depth) * (0.55 + wash3 * 0.25));",
    "  water = mix(water, indigo, (wash - 0.42) * 0.34);",
    "  water = mix(water, shallow, smoothstep(0.58, 0.9, wash2) * (1.0 - depth) * 0.28);",
    "  float ripple = smoothstep(0.03, 0.12, abs(h));",
    "  water = mix(water, vec3(0.58, 0.76, 0.82), ripple * 0.72);",
    "  water = mix(water, indigo, smoothstep(0.12, 0.28, abs(h)) * 0.28);",
    "  float shelf = smoothstep(0.04, -0.16, d) * smoothstep(-0.42, -0.05, d);",
    "  water = mix(water, water * vec3(0.78, 0.86, 0.72) + vec3(0.06, 0.07, 0.03), shelf * 0.55);",
    "  float lilyA = 0.0;",
    "  lilyA += lily(world, vec2(-0.16, 0.12), 0.055, 0.5);",
    "  lilyA += lily(world, vec2(0.18, -0.16), 0.042, -1.2);",
    "  lilyA += lily(world, vec2(-0.02, -0.2), 0.034, 2.1);",
    "  lilyA *= uLilies * waterA;",
    "  vec3 lilyCol = mix(vec3(0.32, 0.42, 0.18), vec3(0.52, 0.56, 0.24), noise(world * 50.0));",
    "  vec3 col = paper;",
    "  col = mix(col, veg, clamp(vegA, 0.0, 1.0) * (1.0 - waterA * 0.12));",
    "  col = mix(col, water, waterA);",
    "  col = mix(col, lilyCol, lilyA * 0.9);",
    "  float rim = exp(-abs(d) * 34.0) * smoothstep(0.12, 0.0, abs(d));",
    "  vec3 wet = vec3(0.07, 0.12, 0.22);",
    "  col = mix(col, wet, rim * 0.82);",
    "  float bleed = smoothstep(0.14, 0.0, d) * smoothstep(-0.08, 0.02, d);",
    "  col = mix(col, mix(cerulean, paper, 0.45), bleed * 0.35);",
    "  float along = ang * 2.4 + fbm(world * 3.0 + uSeed) * 5.0;",
    "  float dash = smoothstep(0.16, 0.0, abs(fract(along) - 0.5) - 0.28);",
    "  float band = exp(-pow((d - 0.012) / 0.028, 2.0));",
    "  float skip = step(0.58, noise(vec2(floor(along * 2.0), uSeed * 6.0)));",
    "  float dry = dash * band * skip * uReeds * (0.35 + 0.65 * (1.0 - waterA));",
    "  col = mix(col, vec3(0.16, 0.20, 0.11), dry * 0.72);",
    "  float dark = clamp(1.0 - dot(col, vec3(0.30, 0.45, 0.25)), 0.0, 1.0);",
    "  float valley = smoothstep(0.42, 0.86, 1.0 - grain);",
    "  float specks = smoothstep(0.72, 0.92, noise(vUv * vec2(860.0, 940.0)));",
    "  col *= 1.0 - valley * dark * 0.42;",
    "  col = mix(col, col * vec3(0.62, 0.70, 0.84), specks * dark * valley);",
    "  col = clamp(col, 0.0, 1.0);",
    "  o = vec4(col, 1.0);",
    "}"
  ].join("\n");

  var spriteFs = [
    "#version 300 es",
    "precision highp float;",
    "in vec2 vLocal;",
    "out vec4 o;",
    "uniform float uKind;",
    "uniform float uPhase;",
    "uniform float uSub;",
    "uniform float uAlpha;",
    "uniform vec3 uTint;",
    "float hash(vec2 p) {",
    "  vec3 p3 = fract(vec3(p.xyx) * 0.1031);",
    "  p3 += dot(p3, p3.yzx + 33.33);",
    "  return fract((p3.x + p3.y) * p3.z);",
    "}",
    "vec2 rot(vec2 p, float a) {",
    "  float c = cos(a), s = sin(a);",
    "  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);",
    "}",
    "float sdCircle(vec2 p, float r) { return length(p) - r; }",
    "float sdEllipse(vec2 p, vec2 r) {",
    "  p /= r;",
    "  return (length(p) - 1.0) * min(r.x, r.y);",
    "}",
    "float capsule(vec2 p, vec2 a, vec2 b, float r) {",
    "  vec2 pa = p - a, ba = b - a;",
    "  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);",
    "  return length(pa - ba * h) - r;",
    "}",
    "vec4 shade(vec2 p) {",
    "  if (uKind < 0.5) {",
    "    float a = exp(-dot(p, p) * 1.7) * 0.34 * uAlpha;",
    "    return vec4(vec3(0.24, 0.17, 0.11) * a, a);",
    "  }",
    "  float fill = 0.0;",
    "  vec3 col = uTint;",
    "  if (uKind < 1.5) {",
    "    float u = clamp(p.x * 0.55 + 0.5, 0.0, 1.0);",
    "    float w = 0.30 * sin(u * 3.14159);",
    "    w *= 1.0 - 0.62 * smoothstep(0.42, 0.96, p.x);",
    "    w = max(w, 0.03);",
    "    float sd = max(abs(p.y) - w, max(p.x - 0.86, -p.x - 0.78));",
    "    sd += (hash(p * 28.0) - 0.5) * 0.02;",
    "    fill = smoothstep(0.035, -0.02, sd);",
    "    float rim = exp(-abs(sd) * 26.0);",
    "    float deck = smoothstep(0.04, -0.06, max(abs(p.y) - w * 0.48, abs(p.x + 0.05) - 0.28));",
    "    col = mix(uTint * 0.78, uTint * vec3(1.28, 1.14, 0.96), deck);",
    "    col = mix(col, uTint * 0.38, rim * fill);",
    "    col *= 1.0 - smoothstep(0.55, 0.95, hash(p * 70.0)) * 0.22;",
    "    float ang = sin(uPhase) * 0.75;",
    "    vec2 lp = rot(p - vec2(-0.05, 0.05), ang);",
    "    float oar = min(capsule(lp, vec2(0.0, 0.02), vec2(0.0, 0.78), 0.035), capsule(lp - vec2(0.0, 0.68), vec2(0.0, 0.0), vec2(0.04, 0.16), 0.07));",
    "    vec2 rp = rot(vec2(p.x + 0.05, -p.y - 0.05), ang);",
    "    float oar2 = min(capsule(rp, vec2(0.0, 0.02), vec2(0.0, 0.78), 0.035), capsule(rp - vec2(0.0, 0.68), vec2(0.0, 0.0), vec2(0.04, 0.16), 0.07));",
    "    float oarA = smoothstep(0.025, -0.01, min(oar, oar2));",
    "    col = mix(col, vec3(0.29, 0.18, 0.11), oarA);",
    "    fill = max(fill, oarA);",
    "    float torso = sdEllipse(p - vec2(-0.02, 0.0), vec2(0.16, 0.11));",
    "    float head = sdCircle(p - vec2(0.16, 0.0), 0.07);",
    "    float bodyA = smoothstep(0.02, -0.012, min(torso, head));",
    "    vec3 body = mix(vec3(0.64, 0.28, 0.22), vec3(0.78, 0.56, 0.40), smoothstep(0.01, -0.02, head));",
    "    col = mix(col, body, bodyA);",
    "    fill = max(fill, bodyA);",
    "  } else if (uKind < 2.5) {",
    "    float wag = sin(uPhase) * 0.55;",
    "    float body = sdEllipse(p - vec2(0.06, 0.0), vec2(0.44, 0.28));",
    "    float tail = sdEllipse(rot(p - vec2(-0.4, 0.0), wag), vec2(0.26, 0.09));",
    "    float fin = sdEllipse(rot(p - vec2(0.02, 0.14), 0.5), vec2(0.14, 0.045));",
    "    float sd = min(body, min(tail, fin));",
    "    sd += (hash(p * 40.0) - 0.5) * 0.015;",
    "    fill = smoothstep(0.03, -0.018, sd);",
    "    col = mix(uTint * 0.75, uTint * 1.15, smoothstep(0.1, -0.2, body));",
    "    col = mix(col, uTint * 0.4, exp(-abs(sd) * 22.0) * fill);",
    "    float eye = sdCircle(p - vec2(0.32, 0.05), 0.03);",
    "    col = mix(col, vec3(0.1, 0.1, 0.1), smoothstep(0.01, -0.01, eye));",
    "  } else {",
    "    float kick = sin(uPhase) * 0.7;",
    "    float body = sdEllipse(p - vec2(-0.02, 0.0), vec2(0.28, 0.22));",
    "    float head = sdEllipse(p - vec2(0.22, 0.0), vec2(0.18, 0.15));",
    "    vec2 leg = rot(p - vec2(-0.08, 0.1), 1.0 + kick);",
    "    float legs = capsule(leg, vec2(0.0, 0.0), vec2(-0.34, 0.16), 0.045);",
    "    vec2 leg2 = rot(vec2(p.x, -p.y) - vec2(-0.08, 0.1), 1.0 + kick);",
    "    float legs2 = capsule(leg2, vec2(0.0, 0.0), vec2(-0.34, 0.16), 0.045);",
    "    float sd = min(min(body, head), min(legs, legs2));",
    "    fill = smoothstep(0.03, -0.016, sd);",
    "    col = mix(uTint * 0.8, uTint * vec3(1.15, 1.2, 0.9), smoothstep(0.05, -0.15, head));",
    "    col = mix(col, uTint * 0.42, exp(-abs(sd) * 20.0) * fill);",
    "    float eye = min(sdCircle(p - vec2(0.28, 0.07), 0.028), sdCircle(p - vec2(0.28, -0.07), 0.028));",
    "    col = mix(col, vec3(0.08, 0.1, 0.08), smoothstep(0.012, -0.008, eye));",
    "  }",
    "  float a = fill * uAlpha;",
    "  return vec4(col * a, a);",
    "}",
    "void main() {",
    "  vec4 c = shade(vLocal);",
    "  if (uKind > 0.5 && uSub > 0.02) {",
    "    vec2 e = vec2(0.045, 0.03) * uSub;",
    "    vec4 b = shade(vLocal + vec2(e.x, 0.0)) + shade(vLocal - vec2(e.x, 0.0));",
    "    b += shade(vLocal + vec2(0.0, e.y)) + shade(vLocal - vec2(0.0, e.y));",
    "    c = (c + b) / 5.0;",
    "    float a = c.a * mix(1.0, 0.78, uSub);",
    "    vec3 rgb = c.rgb / max(c.a, 0.001);",
    "    rgb = mix(rgb, vec3(0.25, 0.42, 0.62), uSub * 0.78);",
    "    c = vec4(rgb * a, a);",
    "  }",
    "  o = c;",
    "}"
  ].join("\n");

  function clone(template) {
    return {
      kind: template.kind || "boat",
      r: template.r == null ? 0.08 : template.r,
      tint: template.tint || [0.48, 0.3, 0.18],
      x: 0,
      y: 0,
      heading: 0,
      speed: 0,
      phase: 0,
      sub: 0,
      splash: 0
    };
  }

  function separate(list) {
    var n, i, j, a, b, dx, dy, d2, min, d, push, nx, ny;
    for (n = 0; n < 6; n++) {
      for (i = 0; i < list.length; i++) {
        for (j = i + 1; j < list.length; j++) {
          a = list[i];
          b = list[j];
          dx = b.x - a.x;
          dy = b.y - a.y;
          d2 = dx * dx + dy * dy;
          min = (a.r || 0) + (b.r || 0);
          if (min <= 0 || d2 >= min * min) continue;
          d = Math.sqrt(d2) || 0.0001;
          push = (min - d) * 0.5;
          nx = dx / d;
          ny = dy / d;
          a.x -= nx * push;
          a.y -= ny * push;
          b.x += nx * push;
          b.y += ny * push;
        }
      }
    }
  }

  function mount(spec, canvas, opts) {
    opts = opts || {};
    var width = spec.width || 960;
    var height = spec.height || 960;
    var duration = spec.duration || 12;
    var pond = {
      rx: 0.48,
      ry: 0.4,
      seed: 1,
      veg: 1,
      lilies: 0,
      reeds: 1
    };
    var key;
    for (key in spec.pond || {}) pond[key] = spec.pond[key];
    canvas.width = width;
    canvas.height = height;
    var gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: true
    });
    if (!gl) throw new Error("WebGL 2 is not available");
    var quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var waveProg = program(gl, quadVs, waveFs);
    var beautyProg = program(gl, quadVs, beautyFs);
    var spriteProg = program(gl, spriteVs, spriteFs);
    var wave = 384;
    var waveTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, waveTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, wave, wave, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, waveTex, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error("wave target is incomplete");
    var impTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, impTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var impData = new Uint8Array(64 * 4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, impData);
    var built = spec.build ? spec.build() : { actors: [] };
    var templates = (built.actors || []).map(function (a) { return clone(a); });
    var pokes = [];
    var scripted = spec.ripples || [];
    var read = "";
    var running = false;
    var raf = 0;
    var origin = 0;
    var sizes = { boat: [0.2, 0.125], fish: [0.16, 0.08], frog: [0.145, 0.13] };
    var kinds = { shadow: 0, boat: 1, fish: 2, frog: 3 };

    function pose(t, publish) {
      var actors = templates.map(clone);
      var ctx = { t: t, q: t / duration, actors: actors, read: "" };
      spec.tick(ctx);
      if (spec.collide) separate(actors);
      if (publish) read = ctx.read || "";
      return actors;
    }

    function impulses(t) {
      var wakes = [];
      var rings = [];
      var steps = 8;
      var dt = 0.16;
      var i, k, age, actors, a, s;
      for (i = 0; i < steps; i++) {
        age = i * dt;
        actors = pose(t - age, false);
        for (k = 0; k < actors.length; k++) {
          a = actors[k];
          if (a.kind === "boat" && a.speed > 0.02) {
            wakes.push({ x: a.x, y: a.y, age: age, amp: Math.max(0.35, Math.min(1, a.speed * 7.0)) });
          }
          if (a.splash > 0.08) {
            rings.push({ x: a.x, y: a.y, age: age, amp: Math.max(0, Math.min(1, a.splash)) });
          }
        }
      }
      function addRing(list) {
        for (s = 0; s < list.length; s++) {
          age = t - list[s].t;
          if (age >= 0 && age < 2.8) rings.push({ x: list[s].x, y: list[s].y, age: age, amp: 1 });
        }
      }
      addRing(scripted);
      addRing(pokes);
      wakes = wakes.slice(0, 40);
      rings = rings.slice(0, 24);
      return { wakes: wakes, rings: rings, all: wakes.concat(rings) };
    }

    function upload(list) {
      impData.fill(0);
      var i, p, o;
      for (i = 0; i < list.length && i < 64; i++) {
        p = list[i];
        o = i * 4;
        impData[o] = Math.max(0, Math.min(255, Math.round((p.x * 0.5 + 0.5) * 255)));
        impData[o + 1] = Math.max(0, Math.min(255, Math.round((p.y * 0.5 + 0.5) * 255)));
        impData[o + 2] = Math.max(0, Math.min(255, Math.round((p.age / 3) * 255)));
        impData[o + 3] = Math.max(0, Math.min(255, Math.round(p.amp * 255)));
      }
      gl.bindTexture(gl.TEXTURE_2D, impTex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 64, 1, gl.RGBA, gl.UNSIGNED_BYTE, impData);
    }

    function drawQuad() {
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function drawSprite(kind, x, y, hx, hy, rot, tint, phase, sub, alpha) {
      gl.useProgram(spriteProg);
      gl.uniform2f(gl.getUniformLocation(spriteProg, "uCenter"), x, y);
      gl.uniform2f(gl.getUniformLocation(spriteProg, "uHalf"), hx, hy);
      gl.uniform1f(gl.getUniformLocation(spriteProg, "uRot"), rot);
      gl.uniform1f(gl.getUniformLocation(spriteProg, "uKind"), kind);
      gl.uniform1f(gl.getUniformLocation(spriteProg, "uPhase"), phase || 0);
      gl.uniform1f(gl.getUniformLocation(spriteProg, "uSub"), sub || 0);
      gl.uniform1f(gl.getUniformLocation(spriteProg, "uAlpha"), alpha);
      gl.uniform3fv(gl.getUniformLocation(spriteProg, "uTint"), tint);
      drawQuad();
    }

    function renderAt(t) {
      var pack = impulses(t);
      var actors = pose(t, true);
      upload(pack.all);
      gl.disable(gl.BLEND);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, wave, wave);
      gl.useProgram(waveProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, impTex);
      gl.uniform1i(gl.getUniformLocation(waveProg, "uImp"), 0);
      gl.uniform1f(gl.getUniformLocation(waveProg, "uCount"), pack.all.length);
      gl.uniform1f(gl.getUniformLocation(waveProg, "uWakes"), pack.wakes.length);
      gl.uniform1f(gl.getUniformLocation(waveProg, "uTime"), t);
      gl.uniform1f(gl.getUniformLocation(waveProg, "uDuration"), duration);
      drawQuad();
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      gl.useProgram(beautyProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, waveTex);
      gl.uniform1i(gl.getUniformLocation(beautyProg, "uWave"), 0);
      gl.uniform2f(gl.getUniformLocation(beautyProg, "uPond"), pond.rx, pond.ry);
      gl.uniform1f(gl.getUniformLocation(beautyProg, "uSeed"), pond.seed);
      gl.uniform1f(gl.getUniformLocation(beautyProg, "uVeg"), pond.veg);
      gl.uniform1f(gl.getUniformLocation(beautyProg, "uLilies"), pond.lilies);
      gl.uniform1f(gl.getUniformLocation(beautyProg, "uReeds"), pond.reeds);
      gl.uniform1f(gl.getUniformLocation(beautyProg, "uTime"), t);
      gl.uniform1f(gl.getUniformLocation(beautyProg, "uDuration"), duration);
      drawQuad();
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      var order = actors.slice().sort(function (a, b) { return (b.sub - a.sub) || (a.y - b.y); });
      var i, a, size, kind, shadowA;
      for (i = 0; i < order.length; i++) {
        a = order[i];
        size = sizes[a.kind] || sizes.boat;
        kind = kinds[a.kind] == null ? 1 : kinds[a.kind];
        shadowA = (1 - Math.max(0, Math.min(1, a.sub))) * 0.85 + 0.05;
        drawSprite(0, a.x + 0.02, a.y - 0.03, size[0] * 1.35, size[1] * 1.2, 0, a.tint, 0, 0, shadowA);
        drawSprite(kind, a.x, a.y, size[0], size[1], a.heading || 0, a.tint, a.phase || 0, a.sub || 0, 1);
      }
      if (opts.onRead) opts.onRead(read);
      return t;
    }

    function pixels() {
      var buf = new Uint8Array(width * height * 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, buf);
      return buf;
    }

    function checksum(buf) {
      var h = 2166136261;
      var i;
      for (i = 0; i < buf.length; i += 16) {
        h ^= buf[i] + buf[i + 1] * 3 + buf[i + 2] * 7;
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    }

    function same(t) {
      renderAt(t);
      var a = pixels();
      renderAt(t);
      var b = pixels();
      var i, n = 0;
      for (i = 0; i < a.length; i++) if (a[i] !== b[i]) n++;
      return { identical: n === 0, mismatches: n, hash: checksum(a), bytes: a.length };
    }

    function inPond(x, y) {
      var nx = x / pond.rx;
      var ny = y / pond.ry;
      return nx * nx + ny * ny < 1.05;
    }

    function poke(x, y, t) {
      if (!inPond(x, y)) return false;
      pokes.push({ x: x, y: y, t: t });
      if (pokes.length > 8) pokes.shift();
      return true;
    }

    function loop(now) {
      if (!running) return;
      if (!origin) origin = now;
      renderAt(((now - origin) / 1000) % duration);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running) return;
      running = true;
      origin = 0;
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    var reduced = opts.reduced != null ? opts.reduced : (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);
    var hold = opts.still || reduced;
    renderAt(opts.t != null ? opts.t : (hold ? (spec.still || 0) : 0));
    if (!hold) start();
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else if (!hold) start();
    });

    canvas.addEventListener("pointerdown", function (ev) {
      var rect = canvas.getBoundingClientRect();
      var x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      var y = 1 - ((ev.clientY - rect.top) / rect.height) * 2;
      var clock = 0;
      if (running && origin) clock = ((performance.now() - origin) / 1000) % duration;
      else clock = opts.t != null ? opts.t : (spec.still || 0);
      if (poke(x, y, clock)) renderAt(clock);
    });

    return {
      renderAt: renderAt,
      pixels: pixels,
      same: same,
      poke: poke,
      clearPokes: function () { pokes.length = 0; },
      inPond: inPond,
      start: start,
      stop: stop,
      pose: function (t) { return pose(t, false); },
      glInfo: function () {
        var dbg = gl.getExtension("WEBGL_debug_renderer_info");
        return {
          webgl: true,
          renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)
        };
      },
      read: function () { return read; }
    };
  }

  return { scene: scene, scenes: scenes, mount: mount };
})();
