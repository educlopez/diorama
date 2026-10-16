/* ============================================================================
   Diorama kernel · one global `Diorama`, on top of three.js r128.

   A diorama is a small world built from blocks (boxes, cylinders, balls,
   cones) on a rounded base, seen through an orthographic isometric camera,
   lit by one warm sun with soft shadows, in a theme. The kernel gives a
   figure everything that is the same from one diorama to the next: the
   stage, the camera, the lights, the shadows, the fit, the loop, the
   pointer, the themes, the primitives and a few props. The figure gives the
   scene and its motion.

   INDEX · what a figure may call. Do not read below the hash line.

   Diorama.figure(spec)       declare a figure; spec is:
     name      lowercase-hyphen, the file and page name
     size      'hero' | 'card' | 'mini'            (frame and detail budget)
     means     one sentence, ≤140 chars, shown under the stage
     hint      one line, ≤90 chars: what the pointer does ("Hover the boat or the lighthouse"), shown with means
     theme     'toy' (default) | 'soft' | 'mono' | 'line' | 'night',
               or { base: 'mono', …overrides } with any of the theme fields:
                 bg          css colour | 'transparent'
                 palette     { …overrides of Diorama.PAL } (also spec.palette)
                 accent      the one colour mono and line keep (default pal.coral). A surface keeps it only when its
                             colour is exactly this hex, so paint accented parts with pal.accent, never a palette
                             name that happens to match; a brand hex goes here and nowhere else
                 accentFill  0..1 how much of the accent fills an accented surface in line (default .1: a tinted
                             fill inside an accent outline); raise it for a solid brand shape
                 lights      { hemi: [sky, ground, i], sun: [colour, i], fill: [colour, i] | null, ambient: [colour, i] }
                 shadows     true | false
                 finish      { roughness, metalness }
                 tone        { paper, ink } → every colour becomes a tint between them (mono), except the accent
                 tint        0..1 how much of the original colour survives the tone (mono: 0, default)
                 edges       true → ink lines on the edges of flat solids (line)
                 outline     true → an ink silhouette on round solids (line)
                 stroke      the line colour; strokeWidth in css px (default 1.1)
                 round       true → every D.box is a D.rbox (rounded, hairline-like)
                 glow        multiplier on emissive (night: 2.4, line: 0)
     camera    { az: 45, el: 35.264, pad: 1.08 }    optional, degrees
     tilt      degrees the camera drifts toward the pointer, default 4 (0: none)
     fog       true | { near, far } | false         default false
     still     seconds into the loop for the reduced-motion frame, default 2
     build({ D, world, pal, ctx })  build the scene once; return parts (any object);
                                    parts.hot = [groups the pointer may pick]; give each a .name ('boat'),
                                    the page shows it as a read-out while the pointer is on it
     tick(ctx)                      per frame; ctx.t, ctx.dt, ctx.parts, ctx.pointer, ctx.hover

   Diorama.mount(fig, { el, THREE, theme, reduced, still })  mount into an element; returns ctx:
     ctx.t ctx.dt         seconds; dt is 0 on the still frame
     ctx.pointer          { x, y (−1..1), inside, world: Vector3|null on the ground plane }
     ctx.hover            the group under the pointer among parts.hot, or null
     ctx.theme ctx.pal    the resolved theme and palette
     ctx.scene ctx.world ctx.cam ctx.sun ctx.renderer
     ctx.fit()            refit the camera to the world (call after adding big things)
     ctx.render()         render one frame
     ctx.step(dt)         advance the clock by hand (the look script does; a figure never needs to)
     ctx.start() ctx.stop() ctx.stillFrame()
     ctx.destroy()        stop everything, dispose

   D (per mount toolkit, parent defaults to world):
     D.pal                           the palette in use
     D.group(x, y, z, parent)        a Group placed at x, y, z
     D.box(w, h, d, c, x, y, z, parent, { shadow, mat, r })
     D.rbox(w, h, d, c, x, y, z, parent, { r })  a box with rounded edges
     D.cyl(rt, rb, h, c, x, y, z, parent, seg)
     D.cone(r, h, c, x, y, z, parent, seg)
     D.ball(r, c, x, y, z, parent)
     D.dome(r, c, x, y, z, parent)   a half sphere, flat side down
     D.wedge(w, h, d, c, x, y, z, parent)  a gable (triangular prism along x)
     D.slab(w, d, c, x, y, z, parent, { h, r, side })  a rounded plate, the diorama base: c on top, side on the walls.
                                     Zones on it (grass, roads) are boxes that stay r inside its corners, or slabs of their own
     D.torus(r, tube, c, x, y, z, parent)
     D.wheel(r, w, c, x, y, z, parent)  a cylinder on its side, axle along z, so it rolls along x
     D.label(text, w, h, { color, bg, size, weight, font, rot })  a plane with text
     D.mat(c, opts)                  a cached material in the theme (opts: emissive, emissiveIntensity, roughness, metalness, transparent, opacity)
     props are built for the solid themes: in line, a bush or a rock is an outline with little inside; use a
     shape with flat faces (a box, a cylinder, a cone) when it has to read in line
     D.props.tree(x, z, parent, { r, kind: 'round' | 'pine' | 'tall', color, dark, light, trunk, yaw })
     D.props.bush(x, z, parent, { r, color, light })  three lobes
     D.props.rock(x, z, parent, { r, h, color, yaw })
     D.props.cloud(x, y, z, parent, { r, color })
     D.props.person(x, z, parent, { shirt, hat, skin, yaw })
     D.props.lamp(x, z, parent, { h })
     D.props.crate(x, y, z, parent, { w, h, d, color })
     D.props.pallet(x, y, z, parent, { h, color })  a wooden pallet with a load of height h (0: empty)
     D.props.cone(x, z, parent)      a traffic cone
     D.props.flag(x, z, parent, { h, color })  a pole and a flag; returns { group, pole, cloth }

   Motion (also on Diorama):
     D.clamp(v, a, b)  D.lerp(a, b, t)  D.smooth(t)  D.out(t)  D.inOut(t)
     D.phase(t, period, offset)      0..1 sawtooth
     D.wave(t, period, offset)       −1..1 sine
     D.pulse(t, period, width)       0..1, a bump once per period lasting width·period
     D.spring(k, c)                  { x, v, t, step(dt), set(x) } a damped follow
     D.path(points, closed, round)   polyline on the ground, points [[x, z], …], corners rounded by `round` (.5; 0 sharp): { length, at(dist) → { x, z, yaw } }
     D.place(group, path, dist)      put a group on a path, its local +x facing along it (build vehicles nose toward +x)
     D.spin(meshes, dist, r)         roll wheels by distance travelled
     D.stagger(i, from, step)        |i − from| · step
   ============================================================================ */
var Diorama = (function () {
  'use strict';
  var TAU = Math.PI * 2;
  var PAL = {
    bg: '#eceef2', base: '#e1e4ea', ground: '#f4f5f7', grass: '#cfe5cd', asphalt: '#cdd3db', line: '#ffffff', water: '#b9dbe9', sand: '#f0dcb4',
    ink: '#1f2430', steel: '#434a58', slate: '#5e6675', mist: '#8b93a3', paper: '#f8f8f6', cloud: '#e6e7ea',
    coral: '#e8714f', terracotta: '#cf6a4c', mustard: '#e9b949', sage: '#8fbf9f', teal: '#4aa3a0', plum: '#8a6fb8', rose: '#ee8fa6',
    cobalt: '#3b63d8', cobaltSoft: '#e4eafb', safety: '#e9b949', ok: '#3f9f6f', warn: '#c98a1c', bad: '#d4544a',
    flame: '#e8714f', mint: '#5fbfb4', lilac: '#9a85d6', sky: '#bcd9ea',
    wood: '#c89a64', cardboard: '#dcb782', skin: '#f1c7a0', leaf: '#6fc38a', leafDark: '#4f9f6b', leafLight: '#9ad9a6', trunk: '#a07c5b',
    tyre: '#2b2f3a', hub: '#cfd4dc', lampGlow: '#ffe3a0'
  };
  var SIZES = { hero: { aspect: 3 / 2, shadow: 2048 }, card: { aspect: 4 / 3, shadow: 1536 }, mini: { aspect: 1, shadow: 1024 } };
  var THEMES = {
    toy: { bg: '#eceef2', shadows: true, finish: { roughness: .8, metalness: 0 }, tint: 1, glow: 1, strokeWidth: 1.1,
      lights: { hemi: ['#fff8ee', '#9fb0cc', .45], sun: ['#fff3dc', .7], fill: ['#c8dbff', .22], ambient: ['#e0e7f5', .08] } },
    soft: { bg: '#f5f1ea', palette: { base: '#e9e3d9', ground: '#f8f4ed', grass: '#d9e8d2', asphalt: '#ddd7cd', paper: '#fcfaf6', cloud: '#ece7df', water: '#cfe3ea', cobalt: '#6b80c9', safety: '#eac36a', mustard: '#eac36a', flame: '#e98a66', coral: '#e98a66', terracotta: '#d98468', ok: '#6fae8a', mint: '#86c6bd', teal: '#6fb3ae', lilac: '#ab9fd9', plum: '#a08fc6', leaf: '#93cf9e', leafDark: '#73b88a', leafLight: '#b4dfb9' },
      shadows: true, finish: { roughness: .95, metalness: 0 }, tint: 1, glow: .8, strokeWidth: 1.1,
      lights: { hemi: ['#fff9f0', '#cfc5b6', .55], sun: ['#ffe8c6', .5], fill: ['#e9e1ff', .18], ambient: ['#f1ece4', .12] } },
    mono: { bg: '#e9ebf1', tone: { paper: '#ffffff', ink: '#1b2638' }, tint: 0, shadows: true, finish: { roughness: .85, metalness: 0 }, glow: .6, strokeWidth: 1.1,
      lights: { hemi: ['#ffffff', '#b9c0cf', .48], sun: ['#ffffff', .7], fill: ['#dde3f0', .22], ambient: ['#e4e8f0', .08] } },
    line: { bg: '#ffffff', tone: { paper: '#ffffff', ink: '#ffffff' }, tint: 0, edges: true, outline: true, shadows: false, stroke: '#1b2638', strokeWidth: 1.1, glow: 0,
      finish: { roughness: 1, metalness: 0 }, lights: { hemi: ['#ffffff', '#ededf0', 1], sun: ['#ffffff', .1], fill: null, ambient: ['#ffffff', .02] } },
    night: { bg: '#131726', palette: { base: '#3b4359', ground: '#4b546c', grass: '#3a6353', asphalt: '#555f78', line: '#aab3c8', water: '#2f4f6e', sand: '#8c7a5a', paper: '#5a6480', cloud: '#6b7590', sky: '#ffd98a', ink: '#0d1018', steel: '#232a38', slate: '#343c4e', cobaltSoft: '#3a4a7a', lampGlow: '#ffe3a0', leaf: '#4fae78', leafDark: '#3b9262', leafLight: '#6cc48f' },
      shadows: true, finish: { roughness: .8, metalness: 0 }, tint: 1, glow: 2.6, strokeWidth: 1.1,
      lights: { hemi: ['#7d8fbf', '#1f2435', .85], sun: ['#ffd6a0', .55], fill: ['#4a6ac8', .5], ambient: ['#3a4566', .8] } }
  };
  var figures = [];

  /* ---------- small maths ---------- */
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var out = function (t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); };
  var inOut = function (t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var phase = function (t, period, offset) { var p = (t / period + (offset || 0)) % 1; return p < 0 ? p + 1 : p; };
  var wave = function (t, period, offset) { return Math.sin(phase(t, period, offset) * TAU); };
  var pulse = function (t, period, width) { var p = phase(t, period); return p < width ? Math.sin(p / width * Math.PI) : 0; };
  var stagger = function (i, from, step) { return Math.abs(i - from) * step; };
  function spring(k, c) {
    var s = { x: 0, v: 0, t: 0, k: k || 90, c: c || 16 };
    s.step = function (dt) { var h = Math.min(dt, 1 / 30); var a = (s.t - s.x) * s.k - s.v * s.c; s.v += a * h; s.x += s.v * h; return s.x; };
    s.set = function (x) { s.x = s.t = x; s.v = 0; return s; };
    return s;
  }
  function path(points, closed, round) {
    /* a polyline on the ground with its corners rounded (arcs of radius `round`, .5 by default, 0 for sharp),
       so a vehicle turns instead of snapping; at(dist) gives the point and the heading there */
    var pts = points.map(function (p) { return { x: p[0], z: p[1] }; }), n = pts.length, R = round == null ? .5 : round;
    var seg = [], len = 0, i;
    function line(a, b) { var l = Math.hypot(b.x - a.x, b.z - a.z); if (l < 1e-6) return; seg.push({ a: a, b: b, l: l, s: len, yaw: Math.atan2(-(b.z - a.z), b.x - a.x) }); len += l; }
    function arc(c, r, a0, da) { var l = Math.abs(da) * r; if (l < 1e-6) return; seg.push({ c: c, r: r, a0: a0, da: da, l: l, s: len }); len += l; }
    var m = closed ? n : n - 2, cut = [];
    for (i = 0; i < n; i++) cut.push(0);
    var corners = [];
    for (i = 0; i < m; i++) {
      var k = closed ? (i + 1) % n : i + 1, P = pts[k], A = pts[(k - 1 + n) % n], B = pts[(k + 1) % n];
      var u1 = { x: P.x - A.x, z: P.z - A.z }, u2 = { x: B.x - P.x, z: B.z - P.z }, l1 = Math.hypot(u1.x, u1.z), l2 = Math.hypot(u2.x, u2.z);
      if (!l1 || !l2) continue;
      u1.x /= l1; u1.z /= l1; u2.x /= l2; u2.z /= l2;
      var cr = u1.x * u2.z - u1.z * u2.x, dot = clamp(u1.x * u2.x + u1.z * u2.z, -1, 1), th = Math.acos(dot);
      if (R <= 0 || th < .02 || th > Math.PI - .02) continue;
      var r = Math.min(R, .5 * Math.min(l1, l2) / Math.tan(th / 2)), t = r * Math.tan(th / 2), sgn = cr > 0 ? 1 : -1;
      var T1 = { x: P.x - u1.x * t, z: P.z - u1.z * t }, T2 = { x: P.x + u2.x * t, z: P.z + u2.z * t };
      var C = { x: T1.x - u1.z * sgn * r, z: T1.z + u1.x * sgn * r };
      corners[k] = { T1: T1, T2: T2, C: C, r: r, a0: Math.atan2(T1.z - C.z, T1.x - C.x), da: th * sgn };
      cut[k] = t;
    }
    var first = closed ? 0 : 0, count = closed ? n : n - 1;
    for (i = 0; i < count; i++) {
      var a = pts[i], b = pts[(i + 1) % n], ca = corners[i], cb = corners[(i + 1) % n];
      if (i === 0 && closed && ca) arc(ca.C, ca.r, ca.a0, ca.da);
      line(ca ? ca.T2 : a, cb ? cb.T1 : b);
      if (cb && !(closed && (i + 1) % n === 0)) arc(cb.C, cb.r, cb.a0, cb.da);
    }
    return {
      length: len, closed: !!closed,
      at: function (d) {
        if (closed) { d = d % len; if (d < 0) d += len; } else d = clamp(d, 0, len);
        for (var i = 0; i < seg.length; i++) {
          var s = seg[i];
          if (d <= s.s + s.l || i === seg.length - 1) {
            var u = s.l ? clamp((d - s.s) / s.l, 0, 1) : 0;
            if (s.c) { var ang = s.a0 + s.da * u, sg = s.da > 0 ? 1 : -1; return { x: s.c.x + s.r * Math.cos(ang), z: s.c.z + s.r * Math.sin(ang), yaw: Math.atan2(-sg * Math.cos(ang), -sg * Math.sin(ang)) }; }
            return { x: lerp(s.a.x, s.b.x, u), z: lerp(s.a.z, s.b.z, u), yaw: s.yaw };
          }
        }
      }
    };
  }
  function place(g, p, d) { var q = p.at(d); g.position.x = q.x; g.position.z = q.z; g.rotation.y = q.yaw; return q; }
  function spin(wheels, dist, r) { var a = dist / (r || .4); for (var i = 0; i < wheels.length; i++) wheels[i].rotation.y = -a; }

  /* ---------- themes and colour ---------- */
  function resolveTheme(spec, fig) {
    var t = spec || fig.theme || 'toy', base = typeof t === 'string' ? t : (t.base || 'toy');
    var src = THEMES[base] || THEMES.toy, out = {};
    Object.keys(src).forEach(function (k) { out[k] = src[k]; });
    if (typeof t === 'object') Object.keys(t).forEach(function (k) { if (k !== 'base') out[k] = t[k]; });
    out.name = base;
    out.palette = Object.assign({}, src.palette || {}, fig.palette || {}, (typeof t === 'object' && t.palette) || {});
    out.lights = Object.assign({}, src.lights, (typeof t === 'object' && t.lights) || {});
    out.finish = Object.assign({}, src.finish, (typeof t === 'object' && t.finish) || {});
    return out;
  }
  function hexOf(c) { return (typeof c === 'string' ? c : '#' + c.getHexString()).toLowerCase(); }
  function luma(col) { return .2126 * col.r + .7152 * col.g + .0722 * col.b; }

  /* ---------- toolkit, one per mount ---------- */
  function toolkit(THREE, world, pal, ctx) {
    var MATS = {}, GEOS = {}, EDGES = {}, LINES = {}, theme = ctx.theme;
    var accent = hexOf(theme.accent || pal.accent || pal.coral), paperC = theme.tone ? new THREE.Color(theme.tone.paper) : null, inkC = theme.tone ? new THREE.Color(theme.tone.ink) : null;
    /* the colour a surface really gets: toned to paper/ink in mono and line, except the accent */
    function toned(c) {
      var col = new THREE.Color(c), isAccent = hexOf(c) === accent;
      if (theme.tone && !isAccent) { var L = luma(col), tint = theme.tint || 0; var t2 = paperC.clone().lerp(inkC, 1 - L); col = t2.lerp(col, tint); }
      if (theme.tone && isAccent && theme.edges) col = paperC.clone().lerp(col, theme.accentFill == null ? .1 : theme.accentFill);
      return col;
    }
    function mat(c, o) {
      if (c && c.isMaterial) return c;
      var k = c + (o ? JSON.stringify(o) : '');
      if (!MATS[k]) {
        var opts = Object.assign({ roughness: theme.finish.roughness, metalness: theme.finish.metalness }, o || {});
        opts.color = toned(c).convertSRGBToLinear();
        if (opts.emissive) { opts.emissive = toned(opts.emissive).convertSRGBToLinear(); opts.emissiveIntensity = (opts.emissiveIntensity == null ? 1 : opts.emissiveIntensity) * (theme.glow == null ? 1 : theme.glow); }
        if (theme.edges || theme.outline) { opts.polygonOffset = true; opts.polygonOffsetFactor = 1; opts.polygonOffsetUnits = 1; }
        var m = new THREE.MeshStandardMaterial(opts); m.userData.glow = theme.glow == null ? 1 : theme.glow; m.userData.src = c;
        MATS[k] = m;
      }
      return MATS[k];
    }
    function lineMat(c) { var k = hexOf(c); return LINES[k] || (LINES[k] = new THREE.LineBasicMaterial({ color: new THREE.Color(c).convertSRGBToLinear() })); }
    function hullMat(c) {
      var k = 'h' + hexOf(c);
      if (!LINES[k]) {
        LINES[k] = new THREE.ShaderMaterial({
          uniforms: { color: { value: new THREE.Color(c).convertSRGBToLinear() }, w: { value: .02 } }, side: THREE.BackSide,
          vertexShader: 'uniform float w; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vec3 n = normalize(normalMatrix * normal); mv.xyz += n * w; gl_Position = projectionMatrix * mv; }',
          fragmentShader: 'uniform vec3 color; void main(){ gl_FragColor = vec4(color, 1.0); }'
        });
        ctx.hulls.push(LINES[k]);
      }
      return LINES[k];
    }
    function geo(k, make) { return GEOS[k] || (GEOS[k] = make()); }
    var SMOOTH = {};
    function smoothed(g) {
      /* the same shape with one vertex per position and averaged normals, so the ink hull
         offsets every surface by the same amount: flat faces, rounded corners and spheres alike */
      if (SMOOTH[g.uuid]) return SMOOTH[g.uuid];
      var pos = g.attributes.position, idx = g.index, n = idx ? idx.count : pos.count, map = {}, out = [], index = [], key, i, j, x, y, z;
      for (i = 0; i < n; i++) {
        j = idx ? idx.getX(i) : i; x = pos.getX(j); y = pos.getY(j); z = pos.getZ(j);
        key = Math.round(x * 1e4) + ',' + Math.round(y * 1e4) + ',' + Math.round(z * 1e4);
        if (map[key] === undefined) { map[key] = out.length / 3; out.push(x, y, z); }
        index.push(map[key]);
      }
      var sg = new THREE.BufferGeometry();
      sg.setAttribute('position', new THREE.Float32BufferAttribute(out, 3)); sg.setIndex(index); sg.computeVertexNormals();
      return (SMOOTH[g.uuid] = sg);
    }
    function mesh(g, c, x, y, z, parent, o, flat, angle) {
      var m = new THREE.Mesh(g, mat(c, o && o.mat));
      m.position.set(x || 0, y || 0, z || 0); m.castShadow = !(o && o.shadow === false); m.receiveShadow = true;
      if (theme.edges || theme.outline) {
        var strokeC = hexOf(c) === accent ? accent : (theme.stroke || pal.ink);
        if (theme.edges && flat !== 'mark') {
          var ang = flat ? 1 : (angle || 25), ek = g.uuid + '|' + ang;
          var eg = EDGES[ek] || (EDGES[ek] = new THREE.EdgesGeometry(g, ang));
          var ls = new THREE.LineSegments(eg, lineMat(strokeC)); ls.userData.stroke = true; m.add(ls);
        }
        if (theme.outline && !flat) { var h = new THREE.Mesh(smoothed(g), hullMat(strokeC)); h.userData.stroke = true; m.add(h); }
      }
      (parent || world).add(m); return m;
    }
    function roundedRect(s, w, d, r) {
      var hw = w / 2, hd = d / 2; r = Math.min(r, hw, hd);
      s.moveTo(-hw + r, -hd); s.lineTo(hw - r, -hd); s.quadraticCurveTo(hw, -hd, hw, -hd + r); s.lineTo(hw, hd - r); s.quadraticCurveTo(hw, hd, hw - r, hd);
      s.lineTo(-hw + r, hd); s.quadraticCurveTo(-hw, hd, -hw, hd - r); s.lineTo(-hw, -hd + r); s.quadraticCurveTo(-hw, -hd, -hw + r, -hd);
      return s;
    }
    var D = {
      pal: pal, THREE: THREE, theme: theme, clamp: clamp, lerp: lerp, smooth: smooth, out: out, inOut: inOut, phase: phase, wave: wave, pulse: pulse,
      spring: spring, path: path, place: place, spin: spin, stagger: stagger, mat: mat,
      group: function (x, y, z, parent) { var g = new THREE.Group(); g.position.set(x || 0, y || 0, z || 0); (parent || world).add(g); return g; },
      box: function (w, h, d, c, x, y, z, parent, o) {
        if ((theme.round || (o && o.r)) && Math.min(w, h, d) > .06) return D.rbox(w, h, d, c, x, y, z, parent, o);
        return mesh(geo('b' + w + '|' + h + '|' + d, function () { return new THREE.BoxGeometry(w, h, d); }), c, x, y, z, parent, o, o && o.shadow === false ? 'mark' : true);
      },
      rbox: function (w, h, d, c, x, y, z, parent, o) {
        o = o || {}; var r = Math.min(o.r || Math.min(w, h, d) * .22, Math.min(w, h, d) / 2 - .001);
        return mesh(geo('rb' + w + '|' + h + '|' + d + '|' + r, function () {
          var s = roundedRect(new THREE.Shape(), w - 2 * r, h - 2 * r, Math.max(.0001, Math.min(w, h) * .18 - r));
          var g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * r, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: r, bevelThickness: r, curveSegments: 4 });
          g.translate(0, 0, -(d - 2 * r) / 2); return g;
        }), c, x, y, z, parent, o, false, 40);
      },
      cyl: function (rt, rb, h, c, x, y, z, parent, seg) { seg = seg || 18; return mesh(geo('c' + rt + '|' + rb + '|' + h + '|' + seg, function () { return new THREE.CylinderGeometry(rt, rb, h, seg); }), c, x, y, z, parent, null, false, Math.min(80, 360 / seg + 8)); },
      cone: function (r, h, c, x, y, z, parent, seg) { seg = seg || 18; return mesh(geo('k' + r + '|' + h + '|' + seg, function () { return new THREE.ConeGeometry(r, h, seg); }), c, x, y, z, parent, null, false, Math.min(80, 360 / seg + 8)); },
      ball: function (r, c, x, y, z, parent) { return mesh(geo('s' + r, function () { return new THREE.SphereGeometry(r, 20, 14); }), c, x, y, z, parent, null, false); },
      dome: function (r, c, x, y, z, parent) { return mesh(geo('d' + r, function () { return new THREE.SphereGeometry(r, 20, 10, 0, TAU, 0, Math.PI / 2); }), c, x, y, z, parent, null, false); },
      torus: function (r, tube, c, x, y, z, parent) { return mesh(geo('t' + r + '|' + tube, function () { return new THREE.TorusGeometry(r, tube, 10, 24); }), c, x, y, z, parent, null, false); },
      wheel: function (r, w, c, x, y, z, parent) { var m = D.cyl(r, r, w, c || pal.tyre, x, y, z, parent, 18); m.rotation.x = Math.PI / 2; return m; },
      wedge: function (w, h, d, c, x, y, z, parent) {
        return mesh(geo('w' + w + '|' + h + '|' + d, function () {
          var s = new THREE.Shape(); s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(0, h); s.closePath();
          var g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false }); g.rotateY(Math.PI / 2); g.translate(-w / 2, 0, 0); return g;
        }), c, x, y, z, parent, null, true);
      },
      slab: function (w, d, c, x, y, z, parent, o) {
        o = o || {}; var h = o.h || .5, r = o.r == null ? Math.min(w, d) * .06 : o.r;
        var m = mesh(geo('p' + w + '|' + d + '|' + h + '|' + r, function () {
          var g = new THREE.ExtrudeGeometry(roundedRect(new THREE.Shape(), w, d, r), { depth: h, bevelEnabled: false, curveSegments: 6 }); g.rotateX(-Math.PI / 2); g.translate(0, -h, 0); return g;
        }), c || pal.base, x, y, z, parent, { shadow: false }, false);
        if (o.side) m.material = [mat(c || pal.base), mat(o.side)];
        return m;
      },
      label: function (text, w, h, o) {
        o = o || {}; var W = 256, H = Math.max(32, Math.round(256 * h / w));
        var cv = document.createElement('canvas'); cv.width = W; cv.height = H; var g = cv.getContext('2d');
        if (o.bg) { g.fillStyle = hexOf(toned(o.bg)); g.fillRect(0, 0, W, H); }
        g.fillStyle = hexOf(toned(o.color || pal.ink)); g.font = (o.weight || 800) + ' ' + (o.size || Math.round(H * .6)) + 'px ' + (o.font || '"Bricolage Grotesque", Figtree, system-ui, sans-serif');
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W / 2, H / 2 + 2);
        var tex = new THREE.CanvasTexture(cv); tex.anisotropy = ctx.renderer ? ctx.renderer.capabilities.getMaxAnisotropy() : 1; tex.encoding = THREE.sRGBEncoding;
        var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: !o.bg, roughness: .8, depthWrite: !!o.bg }));
        m.castShadow = false; if (o.rot) m.rotation.set(o.rot[0] || 0, o.rot[1] || 0, o.rot[2] || 0); return m;
      },
      props: {}
    };
    var P = D.props;
    P.tree = function (x, z, parent, o) {
      o = o || {}; var r = o.r || .7, kind = o.kind || 'round', g = D.group(x, 0, z, parent), c = o.color || pal.leaf, dk = o.dark || pal.leafDark, lt = o.light || pal.leafLight;
      g.rotation.y = o.yaw || 0;
      if (kind === 'pine') {
        D.cyl(.08, .12, r * 1.1, o.trunk || pal.trunk, 0, r * .5, 0, g, 8);
        D.cone(r, r * 1.2, dk, 0, r * 1.3, 0, g, 12); D.cone(r * .8, r * 1.1, c, 0, r * 1.95, 0, g, 12); D.cone(r * .55, r * 1, lt, 0, r * 2.6, 0, g, 12);
      } else if (kind === 'tall') {
        D.cyl(.08, .12, r * 1.3, o.trunk || pal.trunk, 0, r * .6, 0, g, 8);
        var e = D.ball(r * .75, c, 0, r * 2.1, 0, g); e.scale.y = 1.7;
        var e2 = D.ball(r * .45, lt, r * .2, r * 2.9, -r * .15, g); e2.scale.y = 1.3;
      } else {
        D.cyl(.1, .14, r * 1.2, o.trunk || pal.trunk, 0, r * .55, 0, g, 8);
        var m = D.ball(r, c, 0, r * 1.5, 0, g); m.scale.y = .9;
        var side = D.ball(r * .68, dk, -r * .5, r * 1.25, r * .35, g); side.scale.y = .85;
        D.ball(r * .55, lt, r * .3, r * 2.05, -r * .15, g);
      }
      return g;
    };
    P.bush = function (x, z, parent, o) {
      o = o || {}; var r = o.r || .4, g = D.group(x, 0, z, parent), c = o.color || pal.leafDark;
      var a = D.ball(r, c, 0, r * .6, 0, g); a.scale.y = .75;
      var b = D.ball(r * .7, o.light || pal.leaf, r * .6, r * .45, r * .25, g); b.scale.y = .75;
      var d = D.ball(r * .55, c, -r * .5, r * .38, -r * .3, g); d.scale.y = .75;
      return g;
    };
    P.rock = function (x, z, parent, o) { o = o || {}; var r = o.r || .4; var m = D.dome(r, o.color || pal.mist, x, 0, z, parent); m.scale.set(1, o.h || .6, .8); m.rotation.y = o.yaw || .6; return m; };
    P.cloud = function (x, y, z, parent, o) {
      o = o || {}; var r = o.r || .8, g = D.group(x, y, z, parent), c = o.color || pal.paper;
      var a = D.ball(r, c, 0, 0, 0, g); a.scale.y = .7; a.castShadow = false;
      var b = D.ball(r * .7, c, r * .9, -r * .1, r * .1, g); b.scale.y = .7; b.castShadow = false;
      var d = D.ball(r * .6, c, -r * .85, -r * .15, -r * .05, g); d.scale.y = .7; d.castShadow = false;
      return g;
    };
    P.person = function (x, z, parent, o) {
      o = o || {}; var g = D.group(x, 0, z, parent); g.rotation.y = o.yaw || 0;
      D.cyl(.17, .21, .5, o.shirt || pal.teal, 0, .27, 0, g, 12);
      D.cyl(.1, .1, .14, pal.ink, -.08, .07, 0, g, 8); D.cyl(.1, .1, .14, pal.ink, .08, .07, 0, g, 8);
      D.ball(.15, o.skin || pal.skin, 0, .68, 0, g);
      if (o.hat !== false) D.dome(.165, o.hat || pal.safety, 0, .72, 0, g);
      return g;
    };
    P.lamp = function (x, z, parent, o) {
      o = o || {}; var h = o.h || 3.2, g = D.group(x, 0, z, parent);
      D.cyl(.06, .08, h, pal.slate, 0, h / 2, 0, g, 8);
      D.box(.7, .13, .28, pal.paper, .25, h, 0, g);
      D.box(.5, .04, .2, pal.lampGlow, .25, h - .08, 0, g, { mat: { emissive: pal.lampGlow, emissiveIntensity: .5 }, shadow: false });
      return g;
    };
    P.crate = function (x, y, z, parent, o) {
      o = o || {}; var w = o.w || .9, h = o.h || .8, d = o.d || .9, g = D.group(x, y, z, parent);
      D.box(w, h, d, o.color || pal.cardboard, 0, h / 2, 0, g);
      D.box(w * .22, .012, d + .01, pal.paper, 0, h + .006, 0, g, { shadow: false });
      D.box(.012, h * .3, d * .32, pal.paper, w / 2 + .005, h * .55, 0, g, { shadow: false });
      return g;
    };
    P.pallet = function (x, y, z, parent, o) {
      o = o || {}; var h = o.h == null ? .9 : o.h, g = D.group(x, y, z, parent);
      D.box(1.1, .08, 1.1, pal.wood, 0, .11, 0, g);
      [-.42, 0, .42].forEach(function (zz) { D.box(1.1, .07, .14, pal.wood, 0, .035, zz, g); });
      if (h > 0) { D.box(1, h, 1, o.color || pal.cardboard, 0, .15 + h / 2, 0, g); D.box(.22, .012, 1.01, pal.paper, 0, .156 + h, 0, g, { shadow: false }); }
      return g;
    };
    P.cone = function (x, z, parent) { var g = D.group(x, 0, z, parent); D.box(.36, .04, .36, pal.flame, 0, .02, 0, g); D.cone(.16, .5, pal.flame, 0, .29, 0, g, 12); D.cyl(.1, .12, .06, pal.paper, 0, .3, 0, g, 12); return g; };
    P.flag = function (x, z, parent, o) {
      o = o || {}; var h = o.h || 2.4, g = D.group(x, 0, z, parent);
      var pole = D.cyl(.04, .05, h, pal.slate, 0, h / 2, 0, g, 8);
      var cloth = D.box(.8, .5, .03, o.color || pal.coral, .42, h - .3, 0, g);
      return { group: g, pole: pole, cloth: cloth };
    };
    return D;
  }

  /* ---------- mount ---------- */
  function mount(fig, opts) {
    opts = opts || {};
    var THREE = opts.THREE || (typeof window !== 'undefined' && window.THREE);
    if (!THREE) throw new Error('Diorama needs three.js (r128): load it before the kernel or pass { THREE }.');
    var el = opts.el; if (!el) throw new Error('Diorama.mount needs { el }.');
    var size = SIZES[fig.size] || SIZES.card;
    var theme = resolveTheme(opts.theme, fig);
    var pal = Object.assign({}, PAL, theme.palette);
    pal.accent = theme.accent || pal.accent || pal.coral;
    var camSpec = Object.assign({ az: 45, el: 35.264, pad: fig.size === 'mini' ? 1.04 : 1.08 }, fig.camera || {});
    var tilt = fig.tilt == null ? 4 : fig.tilt;
    var themeBg = (typeof opts.theme === 'object' && opts.theme.bg) || (typeof fig.theme === 'object' && fig.theme.bg) || null;
    var bg = fig.background || themeBg || (fig.size === 'mini' ? 'transparent' : theme.bg || pal.bg);
    if (bg === 'auto') bg = fig.size === 'mini' ? 'transparent' : theme.bg || pal.bg;
    var reduced = opts.reduced != null ? !!opts.reduced : (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
    var stillAt = opts.still != null ? opts.still : (fig.still == null ? 2 : fig.still);
    var ctx = { fig: fig, pal: pal, theme: theme, t: 0, dt: 0, pointer: { x: 0, y: 0, inside: false, world: null }, hover: null, reduced: reduced, parts: null, hulls: [] };
    var lin = function (c) { return new THREE.Color(c).convertSRGBToLinear(); };

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: bg === 'transparent' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    var shadows = fig.shadows != null ? fig.shadows : theme.shadows !== false;
    renderer.shadowMap.enabled = shadows; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (bg === 'transparent') renderer.setClearColor(0x000000, 0); else renderer.setClearColor(lin(bg), 1);
    renderer.domElement.style.display = 'block'; renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
    el.appendChild(renderer.domElement);
    ctx.renderer = renderer;

    var scene = new THREE.Scene(), L = theme.lights;
    if (fig.fog) { var f = fig.fog === true ? {} : fig.fog; scene.fog = new THREE.Fog(lin(bg === 'transparent' ? (theme.bg || pal.bg) : bg), f.near || 40, f.far || 90); }
    scene.add(new THREE.HemisphereLight(lin(L.hemi[0]), lin(L.hemi[1]), L.hemi[2]));
    var sun = new THREE.DirectionalLight(lin(L.sun[0]), L.sun[1]);
    sun.castShadow = shadows; sun.shadow.mapSize.set(size.shadow, size.shadow);
    sun.shadow.bias = -0.0005; sun.shadow.normalBias = .03;
    scene.add(sun); scene.add(sun.target);
    var fill = null;
    if (L.fill) { fill = new THREE.DirectionalLight(lin(L.fill[0]), L.fill[1]); scene.add(fill); scene.add(fill.target); }
    scene.add(new THREE.AmbientLight(lin(L.ambient[0]), L.ambient[1]));
    var world = new THREE.Group(); scene.add(world);
    var cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -200, 400);
    ctx.scene = scene; ctx.world = world; ctx.cam = cam; ctx.sun = sun;

    var D = toolkit(THREE, world, pal, ctx);
    ctx.D = D;
    ctx.parts = fig.build({ D: D, world: world, pal: pal, ctx: ctx, THREE: THREE }) || {};

    /* fit: frame the world's bounds in the camera at rest, then keep the frustum */
    var center = new THREE.Vector3(), radius = 1, frustum = { l: -1, r: 1, t: 1, b: -1 };
    var azRest = camSpec.az * Math.PI / 180, elRest = camSpec.el * Math.PI / 180, az = azRest, elv = elRest;
    function placeCam(a, e) {
      var R = 120;
      cam.position.set(center.x + R * Math.cos(e) * Math.sin(a), center.y + R * Math.sin(e), center.z + R * Math.cos(e) * Math.cos(a));
      cam.lookAt(center); cam.updateMatrixWorld(true);
    }
    function strokeWidth() {
      /* the ink hull is as wide as the edge lines: one device pixel, or half the stroke width when that is more */
      var px = (frustum.r - frustum.l) / Math.max(1, el.clientWidth || 300), dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
      var w = px * Math.max((theme.strokeWidth || 1.1) * .5, .7 / dpr);
      for (var i = 0; i < ctx.hulls.length; i++) ctx.hulls[i].uniforms.w.value = w;
    }
    function fit() {
      world.updateMatrixWorld(true);
      var box = new THREE.Box3();
      world.traverse(function (o) { if (o.isMesh && !o.userData.stroke) { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); box.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); } });
      if (box.isEmpty()) box.set(new THREE.Vector3(-1, 0, -1), new THREE.Vector3(1, 1, 1));
      box.getCenter(center); radius = box.getSize(new THREE.Vector3()).length() / 2;
      placeCam(azRest, elRest);
      var inv = cam.matrixWorldInverse, v = new THREE.Vector3(), minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (var i = 0; i < 8; i++) {
        v.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).applyMatrix4(inv);
        minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x); minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
      }
      var w = (maxX - minX) * camSpec.pad, h = (maxY - minY) * camSpec.pad, cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
      if (w / h < size.aspect) w = h * size.aspect; else h = w / size.aspect;
      frustum = { l: cx - w / 2, r: cx + w / 2, t: cy + h / 2, b: cy - h / 2 };
      applyFrustum(); strokeWidth();
      sun.position.set(center.x - radius * .7, center.y + radius * 1.5, center.z + radius * 1.1); sun.target.position.copy(center);
      if (fill) { fill.position.set(center.x + radius * 1.2, center.y + radius * .6, center.z - radius * .9); fill.target.position.copy(center); }
      var s = radius * 1.15; Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: radius * 6 }); sun.shadow.camera.updateProjectionMatrix();
    }
    function applyFrustum() { cam.left = frustum.l; cam.right = frustum.r; cam.top = frustum.t; cam.bottom = frustum.b; cam.updateProjectionMatrix(); }
    ctx.fit = fit;

    function resize() {
      var w = el.clientWidth || 300, h = Math.round(w / size.aspect);
      renderer.setSize(w, h, false);
      renderer.domElement.style.height = h + 'px';
      if (el.style.height === '' || el.dataset.dioramaHeight) { el.style.height = h + 'px'; el.dataset.dioramaHeight = '1'; }
      strokeWidth();
    }
    resize(); fit();

    /* pointer */
    var ray = new THREE.Raycaster(), groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), ndc = new THREE.Vector2(), hit = new THREE.Vector3();
    var pSpringX = spring(60, 12), pSpringY = spring(60, 12);
    function onMove(e) {
      var r = renderer.domElement.getBoundingClientRect();
      ctx.pointer.x = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      ctx.pointer.y = clamp(-(((e.clientY - r.top) / r.height) * 2 - 1), -1, 1);
      ctx.pointer.inside = true; wake();
    }
    function onLeave() { ctx.pointer.inside = false; ctx.pointer.world = null; ctx.hover = null; wake(); }
    el.addEventListener('pointermove', onMove); el.addEventListener('pointerleave', onLeave); el.addEventListener('pointercancel', onLeave);
    function updatePointer() {
      var hot = ctx.parts && ctx.parts.hot;
      if (!ctx.pointer.inside) { ctx.pointer.world = null; ctx.hover = null; return; }
      ndc.set(ctx.pointer.x, ctx.pointer.y); ray.setFromCamera(ndc, cam);
      ctx.pointer.world = ray.ray.intersectPlane(groundPlane, hit) ? hit.clone() : null;
      if (hot && hot.length) {
        var hits = ray.intersectObjects(hot, true); ctx.hover = null;
        if (hits.length) { var o = hits[0].object; while (o && hot.indexOf(o) < 0) o = o.parent; ctx.hover = o || null; }
      }
    }
    function tiltCam(dt) {
      pSpringX.t = ctx.pointer.inside ? ctx.pointer.x : 0; pSpringY.t = ctx.pointer.inside ? ctx.pointer.y : 0;
      pSpringX.step(dt); pSpringY.step(dt);
      az = azRest - pSpringX.x * tilt * Math.PI / 180; elv = elRest + pSpringY.x * tilt * .5 * Math.PI / 180;
      placeCam(az, elv);
    }

    /* loop: sleeps offscreen and when the tab is hidden; one still frame under reduced motion */
    var running = false, visible = true, raf = 0, last = 0;
    function frame(now) {
      raf = 0;
      var dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now;
      ctx.dt = dt; ctx.t += dt;
      updatePointer();
      if (tilt) tiltCam(dt);
      if (fig.tick) fig.tick(ctx);
      renderer.render(scene, cam);
      if (running && visible && !document.hidden) raf = requestAnimationFrame(frame);
      else last = 0;
    }
    function wake() {
      if (reduced) { stillFrame(); return; }
      if (!raf && running && visible && !document.hidden) raf = requestAnimationFrame(frame);
    }
    function stillFrame() {
      ctx.t = stillAt; ctx.dt = 0; updatePointer(); placeCam(azRest, elRest);
      if (fig.tick) fig.tick(ctx);
      renderer.render(scene, cam);
    }
    ctx.render = function () { renderer.render(scene, cam); };
    ctx.step = function (dt) {
      ctx.dt = dt; ctx.t += dt; updatePointer();
      if (tilt) tiltCam(dt);
      if (fig.tick) fig.tick(ctx); return ctx;
    };
    ctx.stillFrame = stillFrame;
    ctx.start = function () { running = true; wake(); return ctx; };
    ctx.stop = function () { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; return ctx; };

    var io = typeof IntersectionObserver === 'function' ? new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) wake(); else { last = 0; } }, { threshold: 0 }) : null;
    if (io) io.observe(el);
    var ro = typeof ResizeObserver === 'function' ? new ResizeObserver(function () { resize(); wake(); if (reduced) stillFrame(); }) : null;
    if (ro) ro.observe(el);
    var onVis = function () { if (!document.hidden) wake(); else last = 0; };
    document.addEventListener('visibilitychange', onVis);

    ctx.destroy = function () {
      ctx.stop(); if (io) io.disconnect(); if (ro) ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave); el.removeEventListener('pointercancel', onLeave);
      renderer.dispose(); if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };

    stillFrame();
    if (!reduced) ctx.start();
    return ctx;
  }

  function figure(spec) {
    if (!spec || !spec.name) throw new Error('Diorama.figure needs a name.');
    if (typeof spec.build !== 'function') throw new Error('Diorama.figure needs build().');
    figures.push(spec); return spec;
  }

  return { PAL: PAL, SIZES: SIZES, THEMES: THEMES, figures: figures, figure: figure, mount: mount, toolkit: toolkit, resolveTheme: resolveTheme,
    clamp: clamp, lerp: lerp, smooth: smooth, out: out, inOut: inOut, phase: phase, wave: wave, pulse: pulse, spring: spring, path: path, place: place, spin: spin, stagger: stagger };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = Diorama;
