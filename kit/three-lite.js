/* three-lite · the part of three.js the Diorama kernel uses, with no dependency.
   It exposes the same names (THREE.Mesh, THREE.BoxGeometry, THREE.WebGLRenderer, …) so the kernel and every
   figure run unchanged. It is not a general renderer: one orthographic camera, Lambert shading with a
   hemisphere, a sun with a soft shadow map, a fill and an ambient light, emissive, linear fog, sRGB output,
   ink edges and the backface hull of the line theme, canvas-texture labels and a raycaster for meshes and
   line segments (with three's Line threshold, so the line theme answers the pointer the same way). */
(function (root) {
  'use strict';
  var uid = 0;
  function uuid() { return 'l' + (++uid); }

  /* ---------- maths ---------- */
  function Vector2(x, y) { this.x = x || 0; this.y = y || 0; }
  Vector2.prototype.set = function (x, y) { this.x = x; this.y = y; return this; };

  function Vector3(x, y, z) { this.x = x || 0; this.y = y || 0; this.z = z || 0; }
  var V = Vector3.prototype;
  V.isVector3 = true;
  V.set = function (x, y, z) { this.x = x; this.y = y; this.z = z; return this; };
  V.setScalar = function (s) { this.x = this.y = this.z = s; return this; };
  V.copy = function (v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; };
  V.clone = function () { return new Vector3(this.x, this.y, this.z); };
  V.add = function (v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; };
  V.sub = function (v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; };
  V.subVectors = function (a, b) { this.x = a.x - b.x; this.y = a.y - b.y; this.z = a.z - b.z; return this; };
  V.addScaledVector = function (v, s) { this.x += v.x * s; this.y += v.y * s; this.z += v.z * s; return this; };
  V.multiplyScalar = function (s) { this.x *= s; this.y *= s; this.z *= s; return this; };
  V.dot = function (v) { return this.x * v.x + this.y * v.y + this.z * v.z; };
  V.crossVectors = function (a, b) { var x = a.y * b.z - a.z * b.y, y = a.z * b.x - a.x * b.z, z = a.x * b.y - a.y * b.x; return this.set(x, y, z); };
  V.length = function () { return Math.sqrt(this.dot(this)); };
  V.lengthSq = function () { return this.dot(this); };
  V.normalize = function () { var l = this.length() || 1; return this.multiplyScalar(1 / l); };
  V.distanceToSquared = function (v) { var dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z; return dx * dx + dy * dy + dz * dz; };
  V.distanceTo = function (v) { return Math.sqrt(this.distanceToSquared(v)); };
  V.lerp = function (v, t) { this.x += (v.x - this.x) * t; this.y += (v.y - this.y) * t; this.z += (v.z - this.z) * t; return this; };
  V.applyMatrix4 = function (m) {
    var e = m.elements, x = this.x, y = this.y, z = this.z, w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
    this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w; this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w; this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
    return this;
  };
  V.transformDirection = function (m) {
    var e = m.elements, x = this.x, y = this.y, z = this.z;
    this.x = e[0] * x + e[4] * y + e[8] * z; this.y = e[1] * x + e[5] * y + e[9] * z; this.z = e[2] * x + e[6] * y + e[10] * z;
    return this.normalize();
  };
  V.setFromMatrixPosition = function (m) { var e = m.elements; return this.set(e[12], e[13], e[14]); };

  function Euler(x, y, z) { this._x = x || 0; this._y = y || 0; this._z = z || 0; }
  Object.defineProperties(Euler.prototype, {
    x: { get: function () { return this._x; }, set: function (v) { this._x = v; } },
    y: { get: function () { return this._y; }, set: function (v) { this._y = v; } },
    z: { get: function () { return this._z; }, set: function (v) { this._z = v; } }
  });
  Euler.prototype.set = function (x, y, z) { this._x = x; this._y = y; this._z = z; return this; };
  Euler.prototype.copy = function (e) { return this.set(e.x, e.y, e.z); };

  function Matrix4() { this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; }
  var M = Matrix4.prototype;
  M.identity = function () { this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; return this; };
  M.copy = function (m) { this.elements = m.elements.slice(); return this; };
  M.clone = function () { return new Matrix4().copy(this); };
  M.multiplyMatrices = function (a, b) {
    var ae = a.elements, be = b.elements, te = new Array(16);
    for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) {
      te[j * 4 + i] = ae[i] * be[j * 4] + ae[4 + i] * be[j * 4 + 1] + ae[8 + i] * be[j * 4 + 2] + ae[12 + i] * be[j * 4 + 3];
    }
    this.elements = te; return this;
  };
  M.compose = function (p, r, s) {
    /* rotation order XYZ, as three's default Euler */
    var a = Math.cos(r.x), b = Math.sin(r.x), c = Math.cos(r.y), d = Math.sin(r.y), e = Math.cos(r.z), f = Math.sin(r.z);
    var ae = a * e, af = a * f, be = b * e, bf = b * f, t = this.elements;
    t[0] = c * e * s.x; t[4] = -c * f * s.y; t[8] = d * s.z;
    t[1] = (af + be * d) * s.x; t[5] = (ae - bf * d) * s.y; t[9] = -b * c * s.z;
    t[2] = (bf - ae * d) * s.x; t[6] = (be + af * d) * s.y; t[10] = a * c * s.z;
    t[3] = 0; t[7] = 0; t[11] = 0; t[12] = p.x; t[13] = p.y; t[14] = p.z; t[15] = 1;
    return this;
  };
  M.invert = function () {
    var m = this.elements, inv = new Array(16), det;
    inv[0] = m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15] + m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
    inv[4] = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15] - m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
    inv[8] = m[4] * m[9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15] + m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
    inv[12] = -m[4] * m[9] * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14] - m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];
    inv[1] = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15] - m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
    inv[5] = m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15] + m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
    inv[9] = -m[0] * m[9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15] - m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
    inv[13] = m[0] * m[9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14] + m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];
    inv[2] = m[1] * m[6] * m[15] - m[1] * m[7] * m[14] - m[5] * m[2] * m[15] + m[5] * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];
    inv[6] = -m[0] * m[6] * m[15] + m[0] * m[7] * m[14] + m[4] * m[2] * m[15] - m[4] * m[3] * m[14] - m[12] * m[2] * m[7] + m[12] * m[3] * m[6];
    inv[10] = m[0] * m[5] * m[15] - m[0] * m[7] * m[13] - m[4] * m[1] * m[15] + m[4] * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];
    inv[14] = -m[0] * m[5] * m[14] + m[0] * m[6] * m[13] + m[4] * m[1] * m[14] - m[4] * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];
    inv[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11] - m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];
    inv[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11] + m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];
    inv[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11] - m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];
    inv[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10] + m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];
    det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
    if (!det) return this.identity();
    for (var i = 0; i < 16; i++) inv[i] /= det;
    this.elements = inv; return this;
  };
  M.lookAt = function (eye, target, up) {
    var z = new Vector3().subVectors(eye, target); if (z.lengthSq() === 0) z.z = 1; z.normalize();
    var x = new Vector3().crossVectors(up, z); if (x.lengthSq() === 0) { z.z += 1e-4; z.normalize(); x.crossVectors(up, z); } x.normalize();
    var y = new Vector3().crossVectors(z, x), t = this.elements;
    t[0] = x.x; t[4] = y.x; t[8] = z.x; t[1] = x.y; t[5] = y.y; t[9] = z.y; t[2] = x.z; t[6] = y.z; t[10] = z.z;
    return this;
  };
  M.makeOrtho = function (l, r, t, b, n, f) {
    var w = 1 / (r - l), h = 1 / (t - b), p = 1 / (f - n);
    this.elements = [2 * w, 0, 0, 0, 0, 2 * h, 0, 0, 0, 0, -2 * p, 0, -(r + l) * w, -(t + b) * h, -(f + n) * p, 1];
    return this;
  };
  function normalMatrix(m) {
    /* inverse transpose of the upper 3x3, as a 9-array in column order */
    var e = m.elements, a = e[0], b = e[1], c = e[2], d = e[4], f = e[5], g = e[6], h = e[8], i = e[9], j = e[10];
    var A = f * j - g * i, B = -(d * j - g * h), C = d * i - f * h, det = a * A + b * B + c * C || 1;
    return [A / det, B / det, C / det, -(b * j - c * i) / det, (a * j - c * h) / det, -(a * i - b * h) / det, (b * g - c * f) / det, -(a * g - c * d) / det, (a * f - b * d) / det];
  }

  function Color(r, g, b) { this.r = 1; this.g = 1; this.b = 1; if (r !== undefined) this.set(r, g, b); }
  var C = Color.prototype;
  C.isColor = true;
  C.set = function (v, g, b) {
    if (v && v.isColor) return this.copy(v);
    if (typeof v === 'number' && g === undefined) { this.r = (v >> 16 & 255) / 255; this.g = (v >> 8 & 255) / 255; this.b = (v & 255) / 255; return this; }
    if (typeof v === 'number') { this.r = v; this.g = g; this.b = b; return this; }
    if (typeof v === 'string') {
      var s = v.trim().toLowerCase();
      if (s[0] === '#') { if (s.length === 4) s = '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3]; return this.set(parseInt(s.slice(1, 7), 16)); }
      var m = /rgba?\(([^)]+)\)/.exec(s);
      if (m) { var p = m[1].split(',').map(parseFloat); this.r = p[0] / 255; this.g = p[1] / 255; this.b = p[2] / 255; return this; }
      if (s === 'white') return this.set(0xffffff);
      if (s === 'black') return this.set(0);
    }
    return this;
  };
  C.copy = function (c) { this.r = c.r; this.g = c.g; this.b = c.b; return this; };
  C.clone = function () { return new Color().copy(this); };
  C.lerp = function (c, t) { this.r += (c.r - this.r) * t; this.g += (c.g - this.g) * t; this.b += (c.b - this.b) * t; return this; };
  C.multiplyScalar = function (s) { this.r *= s; this.g *= s; this.b *= s; return this; };
  function s2l(c) { return c < .04045 ? c * .0773993808 : Math.pow(c * .9478672986 + .0521327014, 2.4); }
  function l2s(c) { return c < .0031308 ? c * 12.92 : 1.055 * Math.pow(c, .41666) - .055; }
  C.convertSRGBToLinear = function () { this.r = s2l(this.r); this.g = s2l(this.g); this.b = s2l(this.b); return this; };
  C.convertLinearToSRGB = function () { this.r = l2s(this.r); this.g = l2s(this.g); this.b = l2s(this.b); return this; };
  C.getHex = function () { return (Math.round(Math.min(1, Math.max(0, this.r)) * 255) << 16) ^ (Math.round(Math.min(1, Math.max(0, this.g)) * 255) << 8) ^ Math.round(Math.min(1, Math.max(0, this.b)) * 255); };
  C.getHexString = function () { return ('000000' + this.getHex().toString(16)).slice(-6); };

  function Box3(min, max) { this.min = min || new Vector3(Infinity, Infinity, Infinity); this.max = max || new Vector3(-Infinity, -Infinity, -Infinity); }
  var B = Box3.prototype;
  B.set = function (a, b) { this.min.copy(a); this.max.copy(b); return this; };
  B.clone = function () { return new Box3(this.min.clone(), this.max.clone()); };
  B.isEmpty = function () { return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z; };
  B.expandByPoint = function (p) {
    this.min.set(Math.min(this.min.x, p.x), Math.min(this.min.y, p.y), Math.min(this.min.z, p.z));
    this.max.set(Math.max(this.max.x, p.x), Math.max(this.max.y, p.y), Math.max(this.max.z, p.z)); return this;
  };
  B.union = function (b) { if (!b.isEmpty()) { this.expandByPoint(b.min); this.expandByPoint(b.max); } return this; };
  B.applyMatrix4 = function (m) {
    if (this.isEmpty()) return this;
    var pts = [], i;
    for (i = 0; i < 8; i++) pts.push(new Vector3(i & 1 ? this.max.x : this.min.x, i & 2 ? this.max.y : this.min.y, i & 4 ? this.max.z : this.min.z).applyMatrix4(m));
    this.min.set(Infinity, Infinity, Infinity); this.max.set(-Infinity, -Infinity, -Infinity);
    for (i = 0; i < 8; i++) this.expandByPoint(pts[i]);
    return this;
  };
  B.getCenter = function (t) { return t.set((this.min.x + this.max.x) / 2, (this.min.y + this.max.y) / 2, (this.min.z + this.max.z) / 2); };
  B.getSize = function (t) { return t.set(this.max.x - this.min.x, this.max.y - this.min.y, this.max.z - this.min.z); };

  function Plane(normal, constant) { this.normal = normal || new Vector3(0, 1, 0); this.constant = constant || 0; }
  function Ray() { this.origin = new Vector3(); this.direction = new Vector3(0, 0, -1); }
  var R = Ray.prototype;
  R.copy = function (r) { this.origin.copy(r.origin); this.direction.copy(r.direction); return this; };
  R.applyMatrix4 = function (m) { this.origin.applyMatrix4(m); this.direction.transformDirection(m); return this; };
  R.intersectPlane = function (plane, target) {
    var den = plane.normal.dot(this.direction);
    if (Math.abs(den) < 1e-9) return null;
    var t = -(this.origin.dot(plane.normal) + plane.constant) / den;
    if (t < 0) return null;
    return target.copy(this.origin).addScaledVector(this.direction, t);
  };
  R.distanceSqToPoint = function (p) {
    var along = _rv.subVectors(p, this.origin).dot(this.direction);
    if (along < 0) return this.origin.distanceToSquared(p);
    return _rv.copy(this.direction).multiplyScalar(along).add(this.origin).distanceToSquared(p);
  };
  R.intersectsSphere = function (center, radius) { return this.distanceSqToPoint(center) <= radius * radius; };
  /* the squared distance between the ray and a segment, as three computes it: s0 along the ray (clamped at the origin),
     s1 along the segment from its centre (clamped at the ends); the regions are the cases of that clamping */
  R.distanceSqToSegment = function (v0, v1, onRay, onSegment) {
    var mid = _rc.copy(v0).add(v1).multiplyScalar(.5), dir = _rd.copy(v1).sub(v0).normalize(), diff = _rv.copy(this.origin).sub(mid);
    var ext = v0.distanceTo(v1) * .5, a01 = -this.direction.dot(dir), b0 = diff.dot(this.direction), b1 = -diff.dot(dir), c = diff.lengthSq();
    var det = Math.abs(1 - a01 * a01), s0, s1, sq, extDet;
    if (det > 0) {
      s0 = a01 * b1 - b0; s1 = a01 * b0 - b1; extDet = ext * det;
      if (s0 >= 0) {
        if (s1 >= -extDet) {
          if (s1 <= extDet) { var inv = 1 / det; s0 *= inv; s1 *= inv; sq = s0 * (s0 + a01 * s1 + 2 * b0) + s1 * (a01 * s0 + s1 + 2 * b1) + c; }
          else { s1 = ext; s0 = Math.max(0, -(a01 * s1 + b0)); sq = -s0 * s0 + s1 * (s1 + 2 * b1) + c; }
        } else { s1 = -ext; s0 = Math.max(0, -(a01 * s1 + b0)); sq = -s0 * s0 + s1 * (s1 + 2 * b1) + c; }
      } else if (s1 <= -extDet) {
        s0 = Math.max(0, -(-a01 * ext + b0)); s1 = s0 > 0 ? -ext : Math.min(Math.max(-ext, -b1), ext); sq = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
      } else if (s1 <= extDet) {
        s0 = 0; s1 = Math.min(Math.max(-ext, -b1), ext); sq = s1 * (s1 + 2 * b1) + c;
      } else {
        s0 = Math.max(0, -(a01 * ext + b0)); s1 = s0 > 0 ? ext : Math.min(Math.max(-ext, -b1), ext); sq = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
      }
    } else { s1 = a01 > 0 ? -ext : ext; s0 = Math.max(0, -(a01 * s1 + b0)); sq = -s0 * s0 + s1 * (s1 + 2 * b1) + c; }
    if (onRay) onRay.copy(this.direction).multiplyScalar(s0).add(this.origin);
    if (onSegment) onSegment.copy(dir).multiplyScalar(s1).add(mid);
    return sq;
  };
  var _rv = new Vector3(), _rc = new Vector3(), _rd = new Vector3();

  /* ---------- scene graph ---------- */
  function Object3D() {
    this.uuid = uuid(); this.type = 'Object3D'; this.parent = null; this.children = [];
    this.position = new Vector3(); this.rotation = new Euler(); this.scale = new Vector3(1, 1, 1);
    this.matrix = new Matrix4(); this.matrixWorld = new Matrix4(); this.visible = true; this.userData = {};
    this.castShadow = false; this.receiveShadow = false; this.renderOrder = 0; this.frustumCulled = true;
  }
  var O = Object3D.prototype;
  O.isObject3D = true;
  O.add = function () {
    for (var i = 0; i < arguments.length; i++) {
      var o = arguments[i]; if (o === this) continue;
      if (o.parent) o.parent.remove(o);
      o.parent = this; this.children.push(o);
    }
    return this;
  };
  O.remove = function (o) { var i = this.children.indexOf(o); if (i >= 0) { this.children.splice(i, 1); o.parent = null; } return this; };
  O.traverse = function (fn) { fn(this); for (var i = 0; i < this.children.length; i++) this.children[i].traverse(fn); };
  O.updateMatrix = function () { this.matrix.compose(this.position, this.rotation, this.scale); };
  O.updateMatrixWorld = function () {
    this.updateMatrix();
    if (this.parent) this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix); else this.matrixWorld.copy(this.matrix);
    for (var i = 0; i < this.children.length; i++) this.children[i].updateMatrixWorld(true);
  };
  O.updateWorldMatrix = function (parents) {
    if (parents && this.parent) this.parent.updateWorldMatrix(true);
    this.updateMatrix();
    if (this.parent) this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix); else this.matrixWorld.copy(this.matrix);
  };
  O.localToWorld = function (v) { this.updateWorldMatrix(true); return v.applyMatrix4(this.matrixWorld); };
  O.getWorldPosition = function (t) { this.updateWorldMatrix(true); return t.setFromMatrixPosition(this.matrixWorld); };
  O.lookAt = function (x, y, z) {
    var target = x && x.isVector3 ? x : new Vector3(x, y, z);
    this.updateWorldMatrix(true);
    var pos = new Vector3().setFromMatrixPosition(this.matrixWorld), m = new Matrix4();
    if (this.isCamera || this.isLight) m.lookAt(pos, target, new Vector3(0, 1, 0)); else m.lookAt(target, pos, new Vector3(0, 1, 0));
    this.rotation.set.apply(this.rotation, eulerFromMatrix(m));
  };
  function eulerFromMatrix(m) {
    var e = m.elements, m11 = e[0], m12 = e[4], m13 = e[8], m22 = e[5], m23 = e[9], m32 = e[6], m33 = e[10], y = Math.asin(Math.max(-1, Math.min(1, m13)));
    if (Math.abs(m13) < .9999999) return [Math.atan2(-m23, m33), y, Math.atan2(-m12, m11)];
    return [Math.atan2(m32, m22), y, 0];
  }
  O.copyFrom = function (src) {
    this.position.copy(src.position); this.rotation.copy(src.rotation); this.scale.copy(src.scale);
    this.visible = src.visible; this.castShadow = src.castShadow; this.receiveShadow = src.receiveShadow;
    this.userData = JSON.parse(JSON.stringify(src.userData)); this.renderOrder = src.renderOrder;
    for (var i = 0; i < src.children.length; i++) this.add(src.children[i].clone());
    return this;
  };
  O.clone = function () { return new this.constructor().copyFrom(this); };
  function inherit(Child, Parent, props) { Child.prototype = Object.create(Parent.prototype); Child.prototype.constructor = Child; Object.assign(Child.prototype, props || {}); }

  function Group() { Object3D.call(this); this.type = 'Group'; }
  inherit(Group, Object3D, { isGroup: true });
  function Scene() { Object3D.call(this); this.type = 'Scene'; this.fog = null; this.background = null; }
  inherit(Scene, Object3D, { isScene: true });
  function Fog(color, near, far) { this.color = new Color(color); this.near = near; this.far = far; }

  function Mesh(geometry, material) { Object3D.call(this); this.type = 'Mesh'; this.geometry = geometry || new BufferGeometry(); this.material = material || new MeshStandardMaterial(); }
  inherit(Mesh, Object3D, {
    isMesh: true,
    clone: function () { return new Mesh(this.geometry, this.material).copyFrom(this); }
  });
  function LineSegments(geometry, material) { Object3D.call(this); this.type = 'LineSegments'; this.geometry = geometry; this.material = material; }
  inherit(LineSegments, Object3D, {
    isLine: true, isLineSegments: true,
    clone: function () { return new LineSegments(this.geometry, this.material).copyFrom(this); }
  });

  function OrthographicCamera(l, r, t, b, n, f) {
    Object3D.call(this); this.type = 'OrthographicCamera';
    this.left = l; this.right = r; this.top = t; this.bottom = b; this.near = n; this.far = f;
    this.projectionMatrix = new Matrix4(); this.matrixWorldInverse = new Matrix4(); this.updateProjectionMatrix();
  }
  inherit(OrthographicCamera, Object3D, {
    isCamera: true, isOrthographicCamera: true,
    updateProjectionMatrix: function () { this.projectionMatrix.makeOrtho(this.left, this.right, this.top, this.bottom, this.near, this.far); },
    updateMatrixWorld: function (force) { Object3D.prototype.updateMatrixWorld.call(this, force); this.matrixWorldInverse.copy(this.matrixWorld).invert(); }
  });

  function Light(color, intensity) { Object3D.call(this); this.color = new Color(color); this.intensity = intensity === undefined ? 1 : intensity; }
  inherit(Light, Object3D, { isLight: true });
  function DirectionalLight(color, intensity) {
    Light.call(this, color, intensity); this.type = 'DirectionalLight'; this.position.set(0, 1, 0); this.target = new Object3D();
    this.shadow = { mapSize: new Vector2(512, 512), bias: 0, normalBias: 0, camera: new OrthographicCamera(-5, 5, 5, -5, .5, 500), map: null };
  }
  inherit(DirectionalLight, Light, { isDirectionalLight: true });
  function HemisphereLight(sky, ground, intensity) { Light.call(this, sky, intensity); this.type = 'HemisphereLight'; this.groundColor = new Color(ground); }
  inherit(HemisphereLight, Light, { isHemisphereLight: true });
  function AmbientLight(color, intensity) { Light.call(this, color, intensity); this.type = 'AmbientLight'; }
  inherit(AmbientLight, Light, { isAmbientLight: true });

  /* ---------- geometry ---------- */
  function BufferAttribute(array, itemSize) { this.array = array; this.itemSize = itemSize; this.count = array.length / itemSize; this.version = 0; }
  BufferAttribute.prototype.getX = function (i) { return this.array[i * this.itemSize]; };
  BufferAttribute.prototype.getY = function (i) { return this.array[i * this.itemSize + 1]; };
  BufferAttribute.prototype.getZ = function (i) { return this.array[i * this.itemSize + 2]; };
  function Float32BufferAttribute(array, itemSize) { BufferAttribute.call(this, new Float32Array(array), itemSize); }
  Float32BufferAttribute.prototype = Object.create(BufferAttribute.prototype);

  function BufferGeometry() { this.uuid = uuid(); this.attributes = {}; this.index = null; this.groups = []; this.boundingBox = null; this.boundingSphere = null; this.version = 0; }
  var G = BufferGeometry.prototype;
  G.isBufferGeometry = true;
  G.setAttribute = function (name, attr) { this.attributes[name] = attr; this.version++; return this; };
  G.setIndex = function (index) { this.index = index ? (index.array ? index : new BufferAttribute(new Uint32Array(index), 1)) : null; this.version++; return this; };
  G.addGroup = function (start, count, materialIndex) { this.groups.push({ start: start, count: count, materialIndex: materialIndex || 0 }); };
  G.computeBoundingBox = function () {
    var p = this.attributes.position, b = new Box3(), v = new Vector3();
    for (var i = 0; i < p.count; i++) b.expandByPoint(v.set(p.getX(i), p.getY(i), p.getZ(i)));
    this.boundingBox = b; return this;
  };
  G.computeBoundingSphere = function () {
    if (!this.boundingBox) this.computeBoundingBox();
    var p = this.attributes.position, c = this.boundingBox.getCenter(new Vector3()), v = new Vector3(), r2 = 0;
    for (var i = 0; i < p.count; i++) r2 = Math.max(r2, c.distanceToSquared(v.set(p.getX(i), p.getY(i), p.getZ(i))));
    this.boundingSphere = { center: c, radius: Math.sqrt(r2) }; return this;
  };
  G.computeVertexNormals = function () {
    var p = this.attributes.position.array, n = new Float32Array(p.length), idx = this.index ? this.index.array : null, count = idx ? idx.length : p.length / 3;
    var a = new Vector3(), b = new Vector3(), c = new Vector3(), cb = new Vector3(), ab = new Vector3();
    for (var i = 0; i < count; i += 3) {
      var i0 = idx ? idx[i] : i, i1 = idx ? idx[i + 1] : i + 1, i2 = idx ? idx[i + 2] : i + 2;
      a.set(p[i0 * 3], p[i0 * 3 + 1], p[i0 * 3 + 2]); b.set(p[i1 * 3], p[i1 * 3 + 1], p[i1 * 3 + 2]); c.set(p[i2 * 3], p[i2 * 3 + 1], p[i2 * 3 + 2]);
      cb.subVectors(c, b); ab.subVectors(a, b); cb.crossVectors(cb, ab);
      [i0, i1, i2].forEach(function (k) { n[k * 3] += cb.x; n[k * 3 + 1] += cb.y; n[k * 3 + 2] += cb.z; });
    }
    for (var j = 0; j < n.length; j += 3) { var l = Math.hypot(n[j], n[j + 1], n[j + 2]) || 1; n[j] /= l; n[j + 1] /= l; n[j + 2] /= l; }
    this.setAttribute('normal', new BufferAttribute(n, 3)); return this;
  };
  G.applyMatrix4 = function (m) {
    var p = this.attributes.position, v = new Vector3(), i;
    for (i = 0; i < p.count; i++) { v.set(p.getX(i), p.getY(i), p.getZ(i)).applyMatrix4(m); p.array[i * 3] = v.x; p.array[i * 3 + 1] = v.y; p.array[i * 3 + 2] = v.z; }
    var n = this.attributes.normal;
    if (n) {
      var nm = normalMatrix(m), nn = new Vector3();
      for (i = 0; i < n.count; i++) {
        var x = n.getX(i), y = n.getY(i), z = n.getZ(i);
        nn.set(nm[0] * x + nm[3] * y + nm[6] * z, nm[1] * x + nm[4] * y + nm[7] * z, nm[2] * x + nm[5] * y + nm[8] * z).normalize();
        n.array[i * 3] = nn.x; n.array[i * 3 + 1] = nn.y; n.array[i * 3 + 2] = nn.z;
      }
    }
    if (this.boundingBox) this.computeBoundingBox();
    if (this.boundingSphere) this.computeBoundingSphere();
    this.version++; return this;
  };
  G.translate = function (x, y, z) { var m = new Matrix4(); m.elements[12] = x; m.elements[13] = y; m.elements[14] = z; return this.applyMatrix4(m); };
  G.rotateX = function (a) { return this.applyMatrix4(new Matrix4().compose(new Vector3(), new Euler(a, 0, 0), new Vector3(1, 1, 1))); };
  G.rotateY = function (a) { return this.applyMatrix4(new Matrix4().compose(new Vector3(), new Euler(0, a, 0), new Vector3(1, 1, 1))); };
  G.dispose = function () {};
  function build(g, pos, nor, uv, index) {
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    if (nor) g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
    if (uv) g.setAttribute('uv', new Float32BufferAttribute(uv, 2));
    if (index) g.setIndex(index);
    return g;
  }

  function BoxGeometry(w, h, d) {
    BufferGeometry.call(this);
    var pos = [], nor = [], uv = [], idx = [], self = this, start = 0;
    /* faces in three's order and material groups: +x, -x, +y, -y, +z, -z; corners counter-clockwise from outside */
    function face(n, u, v) {
      var n0 = pos.length / 3, c = [n[0] * w / 2, n[1] * h / 2, n[2] * d / 2], U = [u[0] * w / 2, u[1] * h / 2, u[2] * d / 2], Vv = [v[0] * w / 2, v[1] * h / 2, v[2] * d / 2];
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (k, i) {
        pos.push(c[0] + U[0] * k[0] + Vv[0] * k[1], c[1] + U[1] * k[0] + Vv[1] * k[1], c[2] + U[2] * k[0] + Vv[2] * k[1]);
        nor.push(n[0], n[1], n[2]); uv.push(k[0] > 0 ? 1 : 0, k[1] > 0 ? 1 : 0);
      });
      idx.push(n0, n0 + 1, n0 + 2, n0, n0 + 2, n0 + 3);
      self.addGroup(start, 6, start / 6); start += 6;
    }
    face([1, 0, 0], [0, 0, -1], [0, 1, 0]); face([-1, 0, 0], [0, 0, 1], [0, 1, 0]);
    face([0, 1, 0], [1, 0, 0], [0, 0, -1]); face([0, -1, 0], [1, 0, 0], [0, 0, 1]);
    face([0, 0, 1], [1, 0, 0], [0, 1, 0]); face([0, 0, -1], [-1, 0, 0], [0, 1, 0]);
    build(this, pos, nor, uv, idx);
  }
  inherit(BoxGeometry, BufferGeometry);

  function CylinderGeometry(rt, rb, h, seg, hseg, open, th0, thl) {
    BufferGeometry.call(this);
    seg = Math.floor(seg || 8); th0 = th0 || 0; thl = thl === undefined ? Math.PI * 2 : thl;
    var pos = [], nor = [], uv = [], idx = [], self = this, start = 0, hh = h / 2, slope = (rb - rt) / h, grid = [], x, y;
    for (y = 0; y <= 1; y++) {
      var row = [], r = y ? rb : rt;
      for (x = 0; x <= seg; x++) {
        var u = x / seg, th = u * thl + th0, s = Math.sin(th), c = Math.cos(th);
        pos.push(r * s, -y * h + hh, r * c);
        var n = new Vector3(s, slope, c).normalize(); nor.push(n.x, n.y, n.z); uv.push(u, 1 - y);
        row.push(pos.length / 3 - 1);
      }
      grid.push(row);
    }
    for (x = 0; x < seg; x++) {
      var a = grid[0][x], b = grid[1][x], cc = grid[1][x + 1], d = grid[0][x + 1];
      idx.push(a, b, d, b, cc, d);
    }
    self.addGroup(start, idx.length, 0); start = idx.length;
    function cap(top) {
      var r = top ? rt : rb, sign = top ? 1 : -1, c0 = pos.length / 3, i;
      if (r <= 0) return;
      for (x = 1; x <= seg; x++) { pos.push(0, hh * sign, 0); nor.push(0, sign, 0); uv.push(.5, .5); }
      var e0 = pos.length / 3;
      for (x = 0; x <= seg; x++) { var th = x / seg * thl + th0, s = Math.sin(th), c = Math.cos(th); pos.push(r * s, hh * sign, r * c); nor.push(0, sign, 0); uv.push(c * .5 + .5, s * .5 * sign + .5); }
      for (i = 0; i < seg; i++) { var cI = c0 + i, iI = e0 + i; if (top) idx.push(iI, iI + 1, cI); else idx.push(iI + 1, iI, cI); }
      self.addGroup(start, idx.length - start, top ? 1 : 2); start = idx.length;
    }
    if (!open) { cap(true); cap(false); }
    build(this, pos, nor, uv, idx);
  }
  inherit(CylinderGeometry, BufferGeometry);
  function ConeGeometry(r, h, seg) { CylinderGeometry.call(this, 0, r, h, seg); }
  inherit(ConeGeometry, BufferGeometry);

  function SphereGeometry(r, ws, hs, p0, pl, t0, tl) {
    BufferGeometry.call(this);
    ws = Math.max(3, Math.floor(ws || 8)); hs = Math.max(2, Math.floor(hs || 6));
    p0 = p0 || 0; pl = pl === undefined ? Math.PI * 2 : pl; t0 = t0 || 0; tl = tl === undefined ? Math.PI : tl;
    var pos = [], nor = [], uv = [], idx = [], grid = [], te = Math.min(t0 + tl, Math.PI), ix, iy, index = 0;
    for (iy = 0; iy <= hs; iy++) {
      var row = [], v = iy / hs;
      for (ix = 0; ix <= ws; ix++) {
        var u = ix / ws, x = -r * Math.cos(p0 + u * pl) * Math.sin(t0 + v * tl), y = r * Math.cos(t0 + v * tl), z = r * Math.sin(p0 + u * pl) * Math.sin(t0 + v * tl);
        pos.push(x, y, z); var n = new Vector3(x, y, z).normalize(); nor.push(n.x, n.y, n.z); uv.push(u, 1 - v); row.push(index++);
      }
      grid.push(row);
    }
    for (iy = 0; iy < hs; iy++) for (ix = 0; ix < ws; ix++) {
      var a = grid[iy][ix + 1], b = grid[iy][ix], c = grid[iy + 1][ix], d = grid[iy + 1][ix + 1];
      if (iy !== 0 || t0 > 0) idx.push(a, b, d);
      if (iy !== hs - 1 || te < Math.PI) idx.push(b, c, d);
    }
    build(this, pos, nor, uv, idx);
  }
  inherit(SphereGeometry, BufferGeometry);

  function TorusGeometry(R, tube, rs, ts) {
    BufferGeometry.call(this);
    rs = Math.floor(rs || 8); ts = Math.floor(ts || 6);
    var pos = [], nor = [], uv = [], idx = [], i, j, arc = Math.PI * 2;
    for (j = 0; j <= rs; j++) for (i = 0; i <= ts; i++) {
      var u = i / ts * arc, v = j / rs * Math.PI * 2;
      var x = (R + tube * Math.cos(v)) * Math.cos(u), y = (R + tube * Math.cos(v)) * Math.sin(u), z = tube * Math.sin(v);
      pos.push(x, y, z);
      var n = new Vector3(x - R * Math.cos(u), y - R * Math.sin(u), z).normalize(); nor.push(n.x, n.y, n.z); uv.push(i / ts, j / rs);
    }
    for (j = 1; j <= rs; j++) for (i = 1; i <= ts; i++) {
      var a = (ts + 1) * j + i - 1, b = (ts + 1) * (j - 1) + i - 1, c = (ts + 1) * (j - 1) + i, d = (ts + 1) * j + i;
      idx.push(a, b, d, b, c, d);
    }
    build(this, pos, nor, uv, idx);
  }
  inherit(TorusGeometry, BufferGeometry);

  function PlaneGeometry(w, h) {
    BufferGeometry.call(this);
    build(this, [-w / 2, h / 2, 0, w / 2, h / 2, 0, -w / 2, -h / 2, 0, w / 2, -h / 2, 0], [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], [0, 1, 1, 1, 0, 0, 1, 0], [0, 2, 1, 2, 3, 1]);
  }
  inherit(PlaneGeometry, BufferGeometry);

  /* shapes: lines and quadratic curves, which is all the kernel draws */
  function Shape() { this.cmds = []; this.cur = new Vector2(); }
  Shape.prototype.moveTo = function (x, y) { this.cmds.push(['M', x, y]); this.cur.set(x, y); return this; };
  Shape.prototype.lineTo = function (x, y) { this.cmds.push(['L', x, y]); this.cur.set(x, y); return this; };
  Shape.prototype.quadraticCurveTo = function (cx, cy, x, y) { this.cmds.push(['Q', cx, cy, x, y, this.cur.x, this.cur.y]); this.cur.set(x, y); return this; };
  Shape.prototype.closePath = function () { return this; };
  Shape.prototype.getPoints = function (div) {
    var pts = [];
    this.cmds.forEach(function (c) {
      if (c[0] === 'M' || c[0] === 'L') pts.push(new Vector2(c[1], c[2]));
      else for (var i = 1; i <= div; i++) {
        var t = i / div, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, d = t * t;
        pts.push(new Vector2(a * c[5] + b * c[1] + d * c[3], a * c[6] + b * c[2] + d * c[4]));
      }
    });
    var out = [];
    pts.forEach(function (p) { var q = out[out.length - 1]; if (!q || Math.abs(q.x - p.x) > 1e-10 || Math.abs(q.y - p.y) > 1e-10) out.push(p); });
    if (out.length > 1 && Math.abs(out[0].x - out[out.length - 1].x) < 1e-10 && Math.abs(out[0].y - out[out.length - 1].y) < 1e-10) out.pop();
    return out;
  };

  function ExtrudeGeometry(shape, o) {
    BufferGeometry.call(this);
    o = o || {};
    var depth = o.depth === undefined ? 1 : o.depth, steps = o.steps || 1, bevel = o.bevelEnabled !== false, bs = bevel ? (o.bevelSegments === undefined ? 3 : o.bevelSegments) : 0;
    var bSize = bevel ? (o.bevelSize === undefined ? .1 : o.bevelSize) : 0, bThick = bevel ? (o.bevelThickness === undefined ? .2 : o.bevelThickness) : 0;
    var pts = shape.getPoints(o.curveSegments || 12), n = pts.length, i, s, b;
    var area = 0; for (i = 0; i < n; i++) { var p = pts[i], q = pts[(i + 1) % n]; area += p.x * q.y - q.x * p.y; }
    if (area < 0) pts.reverse();
    /* miter direction per vertex that moves both adjacent edges outward by one unit */
    var vec = pts.map(function (p, k) {
      var a = pts[(k - 1 + n) % n], c = pts[(k + 1) % n];
      var e1x = p.x - a.x, e1y = p.y - a.y, l1 = Math.hypot(e1x, e1y) || 1, e2x = c.x - p.x, e2y = c.y - p.y, l2 = Math.hypot(e2x, e2y) || 1;
      var n1x = e1y / l1, n1y = -e1x / l1, n2x = e2y / l2, n2y = -e2x / l2, d = 1 + n1x * n2x + n1y * n2y;
      if (d < 1e-6) return new Vector2(n1x, n1y);
      return new Vector2((n1x + n2x) / d, (n1y + n2y) / d);
    });
    var layers = [];
    function layer(off, z) { layers.push(pts.map(function (p, k) { return [p.x + vec[k].x * off, p.y + vec[k].y * off, z]; })); }
    for (b = 0; b < bs; b++) { var t = b / bs; layer(bSize * Math.sin(t * Math.PI / 2), -bThick * Math.cos(t * Math.PI / 2)); }
    for (s = 0; s <= steps; s++) layer(bSize, depth / steps * s);
    for (b = bs - 1; b >= 0; b--) { var t2 = b / bs; layer(bSize * Math.sin(t2 * Math.PI / 2), depth + bThick * Math.cos(t2 * Math.PI / 2)); }
    var pos = [];
    function tri(a, b2, c) { pos.push(a[0], a[1], a[2], b2[0], b2[1], b2[2], c[0], c[1], c[2]); }
    var first = layers[0], last = layers[layers.length - 1];
    for (i = 1; i < n - 1; i++) tri(first[0], first[i + 1], first[i]);
    for (i = 1; i < n - 1; i++) tri(last[0], last[i], last[i + 1]);
    this.addGroup(0, pos.length / 3, 0);
    var sideStart = pos.length / 3;
    for (var L = 0; L < layers.length - 1; L++) for (i = 0; i < n; i++) {
      var j = (i + 1) % n, a1 = layers[L][i], b1 = layers[L][j], c1 = layers[L + 1][j], d1 = layers[L + 1][i];
      tri(a1, b1, d1); tri(b1, c1, d1);
    }
    this.addGroup(sideStart, pos.length / 3 - sideStart, 1);
    build(this, pos); this.computeVertexNormals();
  }
  inherit(ExtrudeGeometry, BufferGeometry);

  function EdgesGeometry(g, angle) {
    BufferGeometry.call(this);
    var thr = Math.cos((angle === undefined ? 1 : angle) * Math.PI / 180), p = g.attributes.position, idx = g.index, count = idx ? idx.count : p.count;
    var key = function (i) { return Math.round(p.getX(i) * 1e4) + ',' + Math.round(p.getY(i) * 1e4) + ',' + Math.round(p.getZ(i) * 1e4); };
    var edges = {}, out = [], a = new Vector3(), b = new Vector3(), c = new Vector3(), nrm = new Vector3(), t1 = new Vector3(), t2 = new Vector3();
    for (var f = 0; f < count; f += 3) {
      var ids = [0, 1, 2].map(function (k) { return idx ? idx.getX(f + k) : f + k; });
      a.set(p.getX(ids[0]), p.getY(ids[0]), p.getZ(ids[0])); b.set(p.getX(ids[1]), p.getY(ids[1]), p.getZ(ids[1])); c.set(p.getX(ids[2]), p.getY(ids[2]), p.getZ(ids[2]));
      nrm.crossVectors(t1.subVectors(c, b), t2.subVectors(a, b));
      if (nrm.lengthSq() < 1e-20) continue;
      nrm.normalize();
      var keys = ids.map(key);
      if (keys[0] === keys[1] || keys[1] === keys[2] || keys[2] === keys[0]) continue;
      for (var e = 0; e < 3; e++) {
        var i0 = ids[e], i1 = ids[(e + 1) % 3], k0 = keys[e], k1 = keys[(e + 1) % 3], hash = k0 + '_' + k1, rev = k1 + '_' + k0;
        if (edges[rev]) {
          if (nrm.dot(edges[rev].n) <= thr) out.push(p.getX(i0), p.getY(i0), p.getZ(i0), p.getX(i1), p.getY(i1), p.getZ(i1));
          edges[rev] = null;
        } else if (!(hash in edges)) edges[hash] = { a: i0, b: i1, n: nrm.clone() };
      }
    }
    Object.keys(edges).forEach(function (k) { var e = edges[k]; if (e) out.push(p.getX(e.a), p.getY(e.a), p.getZ(e.a), p.getX(e.b), p.getY(e.b), p.getZ(e.b)); });
    build(this, out);
  }
  inherit(EdgesGeometry, BufferGeometry);

  /* ---------- materials ---------- */
  var FrontSide = 0, BackSide = 1, DoubleSide = 2;
  function Material() { this.uuid = uuid(); this.userData = {}; this.transparent = false; this.opacity = 1; this.side = FrontSide; this.depthWrite = true; this.polygonOffset = false; this.polygonOffsetFactor = 0; this.polygonOffsetUnits = 0; this.visible = true; }
  Material.prototype.isMaterial = true;
  Material.prototype.setValues = function (o) {
    var self = this;
    Object.keys(o || {}).forEach(function (k) {
      var v = o[k];
      if (self[k] && self[k].isColor && v !== undefined) self[k].set(v); else self[k] = v;
    });
  };
  Material.prototype.dispose = function () {};
  Material.prototype.clone = function () {
    var m = new this.constructor(), self = this;
    Object.keys(this).forEach(function (k) {
      if (k === 'uuid') return;
      var v = self[k];
      m[k] = v && v.isColor ? v.clone() : k === 'userData' ? JSON.parse(JSON.stringify(v)) : v;
    });
    return m;
  };
  function MeshStandardMaterial(o) {
    Material.call(this); this.type = 'MeshStandardMaterial';
    this.color = new Color(0xffffff); this.emissive = new Color(0); this.emissiveIntensity = 1; this.roughness = 1; this.metalness = 0; this.map = null;
    this.setValues(o);
  }
  inherit(MeshStandardMaterial, Material, { isMeshStandardMaterial: true });
  function LineBasicMaterial(o) { Material.call(this); this.type = 'LineBasicMaterial'; this.color = new Color(0xffffff); this.setValues(o); }
  inherit(LineBasicMaterial, Material, { isLineBasicMaterial: true });
  function ShaderMaterial(o) { Material.call(this); this.type = 'ShaderMaterial'; this.uniforms = {}; this.vertexShader = ''; this.fragmentShader = ''; this.setValues(o); }
  inherit(ShaderMaterial, Material, { isShaderMaterial: true });

  function CanvasTexture(canvas) { this.uuid = uuid(); this.image = canvas; this.anisotropy = 1; this.encoding = 3000; this.needsUpdate = true; this.version = 1; }
  CanvasTexture.prototype.dispose = function () {};

  /* ---------- raycaster: mesh faces facing the ray (unless double-sided), and line segments within params.Line.threshold ---------- */
  function Raycaster() { this.ray = new Ray(); this.near = 0; this.far = Infinity; this.params = { Line: { threshold: 1 } }; }
  Raycaster.prototype.setFromCamera = function (ndc, cam) {
    this.ray.origin.set(ndc.x, ndc.y, (cam.near + cam.far) / (cam.near - cam.far));
    var inv = new Matrix4().multiplyMatrices(cam.matrixWorld, new Matrix4().copy(cam.projectionMatrix).invert());
    this.ray.origin.applyMatrix4(inv);
    this.ray.direction.set(0, 0, -1).transformDirection(cam.matrixWorld);
  };
  Raycaster.prototype.intersectObjects = function (objects, recursive) {
    var hits = [], ray = this.ray, self = this;
    function test(o) {
      if (o.isMesh) intersectMesh(o, ray, hits);
      else if (o.isLine) intersectLine(o, self, hits);
      if (recursive) for (var i = 0; i < o.children.length; i++) test(o.children[i]);
    }
    for (var i = 0; i < objects.length; i++) test(objects[i]);
    hits.sort(function (a, b) { return a.distance - b.distance; });
    return hits;
  };
  function intersectMesh(mesh, ray, hits) {
    /* like three: the world matrix of the last render, not recomputed here */
    var inv = new Matrix4().copy(mesh.matrixWorld).invert(), o = ray.origin.clone().applyMatrix4(inv);
    var d = ray.origin.clone().add(ray.direction).applyMatrix4(inv).sub(o);
    var g = mesh.geometry, p = g.attributes.position, idx = g.index, count = idx ? idx.count : p.count, mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    var side = mats[0].side, a = new Vector3(), b = new Vector3(), c = new Vector3(), e1 = new Vector3(), e2 = new Vector3(), h = new Vector3(), s = new Vector3(), q = new Vector3(), best = Infinity;
    for (var f = 0; f < count; f += 3) {
      var i0 = idx ? idx.getX(f) : f, i1 = idx ? idx.getX(f + 1) : f + 1, i2 = idx ? idx.getX(f + 2) : f + 2;
      a.set(p.getX(i0), p.getY(i0), p.getZ(i0)); b.set(p.getX(i1), p.getY(i1), p.getZ(i1)); c.set(p.getX(i2), p.getY(i2), p.getZ(i2));
      e1.subVectors(b, a); e2.subVectors(c, a); h.crossVectors(d, e2);
      var det = e1.dot(h);
      if (side === FrontSide && det < 1e-12) continue;
      if (side === BackSide && det > -1e-12) continue;
      if (Math.abs(det) < 1e-12) continue;
      var inv2 = 1 / det; s.subVectors(o, a);
      var u = s.dot(h) * inv2; if (u < 0 || u > 1) continue;
      q.crossVectors(s, e1); var v = d.dot(q) * inv2; if (v < 0 || u + v > 1) continue;
      var t = e2.dot(q) * inv2; if (t > 0 && t < best) best = t;
    }
    if (best < Infinity) {
      var point = o.clone().addScaledVector(d, best).applyMatrix4(mesh.matrixWorld);
      hits.push({ object: mesh, distance: point.distanceTo(ray.origin), point: point });
    }
  }
  /* like three's Line.raycast: every segment within the threshold (world units, divided by the object's mean scale) is a hit,
     at the distance from the ray's origin to the point on the ray nearest the segment */
  var _lRay = new Ray(), _lStart = new Vector3(), _lEnd = new Vector3(), _lOnRay = new Vector3(), _lOnSeg = new Vector3(), _lCenter = new Vector3();
  function intersectLine(line, caster, hits) {
    var g = line.geometry, mw = line.matrixWorld, e = mw.elements, threshold = caster.params.Line.threshold;
    if (!g.boundingSphere) g.computeBoundingSphere();
    var scaleMax = Math.sqrt(Math.max(e[0] * e[0] + e[1] * e[1] + e[2] * e[2], e[4] * e[4] + e[5] * e[5] + e[6] * e[6], e[8] * e[8] + e[9] * e[9] + e[10] * e[10]));
    _lCenter.copy(g.boundingSphere.center).applyMatrix4(mw);
    if (!caster.ray.intersectsSphere(_lCenter, g.boundingSphere.radius * scaleMax + threshold)) return;
    _lRay.copy(caster.ray).applyMatrix4(new Matrix4().copy(mw).invert());
    var local = threshold / ((line.scale.x + line.scale.y + line.scale.z) / 3), localSq = local * local;
    var p = g.attributes.position, idx = g.index, count = idx ? idx.count : p.count, step = line.isLineSegments ? 2 : 1;
    for (var i = 0; i < count - 1; i += step) {
      var a = idx ? idx.getX(i) : i, b = idx ? idx.getX(i + 1) : i + 1;
      _lStart.set(p.getX(a), p.getY(a), p.getZ(a)); _lEnd.set(p.getX(b), p.getY(b), p.getZ(b));
      if (_lRay.distanceSqToSegment(_lStart, _lEnd, _lOnRay, _lOnSeg) > localSq) continue;
      var distance = caster.ray.origin.distanceTo(_lOnRay.applyMatrix4(mw));
      if (distance < caster.near || distance > caster.far) continue;
      hits.push({ object: line, distance: distance, point: _lOnSeg.clone().applyMatrix4(mw), index: i });
    }
  }

  /* ---------- renderer ---------- */
  var COMMON = 'precision highp float;\n';
  var MESH_VS = COMMON + [
    'attribute vec3 position; attribute vec3 normal; attribute vec2 uv;',
    'uniform mat4 modelMatrix; uniform mat4 viewProj; uniform mat3 normalWorld; uniform mat4 shadowMatrix; uniform float normalBias;',
    'varying vec3 vNormal; varying vec3 vWorld; varying vec4 vShadow; varying vec2 vUv;',
    'void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vNormal = normalize(normalWorld * normal); vWorld = w.xyz; vUv = uv;',
    '  vShadow = shadowMatrix * vec4(w.xyz + vNormal * normalBias, 1.0); gl_Position = viewProj * w; }'
  ].join('\n');
  var MESH_FS = COMMON + [
    'uniform vec3 color; uniform vec3 emissive; uniform float opacity; uniform float useMap; uniform sampler2D map;',
    'uniform vec3 hemiSky; uniform vec3 hemiGround; uniform vec3 ambient;',
    'uniform vec3 sunDir; uniform vec3 sunColor; uniform vec3 fillDir; uniform vec3 fillColor;',
    'uniform float useShadow; uniform sampler2D shadowMap; uniform vec2 shadowTexel; uniform float shadowBias;',
    'uniform float useFog; uniform vec3 fogColor; uniform vec2 fogRange; uniform vec3 eye; uniform vec3 viewDir; uniform float flipNormal;',
    'varying vec3 vNormal; varying vec3 vWorld; varying vec4 vShadow; varying vec2 vUv;',
    'float unpack(vec4 v){ return dot(v, vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/16581375.0)); }',
    'float sampleShadow(vec2 uv, float z){ return step(z, unpack(texture2D(shadowMap, uv))); }',
    'float lerpShadow(vec2 uv, float z){',
    '  vec2 c = uv / shadowTexel - 0.5; vec2 f = fract(c); vec2 base = (floor(c) + 0.5) * shadowTexel;',
    '  float a = sampleShadow(base, z), b = sampleShadow(base + vec2(shadowTexel.x, 0.0), z), d = sampleShadow(base + vec2(0.0, shadowTexel.y), z), e = sampleShadow(base + shadowTexel, z);',
    '  return mix(mix(a, b, f.x), mix(d, e, f.x), f.y); }',
    'float shadowAt(){',
    '  vec3 s = vShadow.xyz / vShadow.w; s = s * 0.5 + 0.5; float z = s.z + shadowBias;',
    '  if (s.x < 0.0 || s.x > 1.0 || s.y < 0.0 || s.y > 1.0 || s.z > 1.0) return 1.0;',
    '  float sum = 0.0; for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) sum += lerpShadow(s.xy + vec2(float(i), float(j)) * shadowTexel, z);',
    '  return sum / 9.0; }',
    'vec3 toLinear(vec3 c){ return mix(c * 0.0773993808, pow(c * 0.9478672986 + 0.0521327014, vec3(2.4)), step(vec3(0.04045), c)); }',
    'vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(0.41666)) - 0.055, step(vec3(0.0031308), c)); }',
    'void main(){',
    '  vec3 n = normalize(vNormal); if (flipNormal < 0.0) n = -n; if (flipNormal > 1.5 && dot(n, viewDir) > 0.0) n = -n;',
    '  vec4 base = vec4(color, opacity);',
    '  if (useMap > 0.5) { vec4 t = texture2D(map, vUv); base *= vec4(toLinear(t.rgb), t.a); }',
    '  float sh = useShadow > 0.5 ? shadowAt() : 1.0;',
    '  vec3 irr = ambient + mix(hemiGround, hemiSky, 0.5 * n.y + 0.5);',
    '  irr += max(dot(n, sunDir), 0.0) * sunColor * sh + max(dot(n, fillDir), 0.0) * fillColor;',
    '  vec3 h = normalize(sunDir - viewDir); float spec = pow(max(dot(n, h), 0.0), 8.0) * 0.04 * max(dot(n, sunDir), 0.0) * sh;',
    '  vec3 c = base.rgb * irr + sunColor * spec + emissive;',
    '  if (useFog > 0.5) { float d = dot(vWorld - eye, viewDir); c = mix(c, fogColor, smoothstep(fogRange.x, fogRange.y, d)); }',
    '  gl_FragColor = vec4(toSRGB(c), base.a); }'
  ].join('\n');
  var LINE_VS = COMMON + 'attribute vec3 position; uniform mat4 modelMatrix; uniform mat4 viewProj; void main(){ gl_Position = viewProj * modelMatrix * vec4(position, 1.0); }';
  var LINE_FS = COMMON + 'uniform vec3 color; vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(0.41666)) - 0.055, step(vec3(0.0031308), c)); } void main(){ gl_FragColor = vec4(toSRGB(color), 1.0); }';
  var DEPTH_VS = COMMON + 'attribute vec3 position; uniform mat4 modelMatrix; uniform mat4 lightViewProj; varying float vz; void main(){ vec4 p = lightViewProj * modelMatrix * vec4(position, 1.0); vz = p.z / p.w * 0.5 + 0.5; gl_Position = p; }';
  var DEPTH_FS = COMMON + 'varying float vz; vec4 pack(float v){ vec4 e = vec4(1.0, 255.0, 65025.0, 16581375.0) * v; e = fract(e); e -= e.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0); return e; } void main(){ gl_FragColor = pack(clamp(vz, 0.0, 0.99999)); }';
  var SHADER_PRE_VS = COMMON + 'attribute vec3 position; attribute vec3 normal; uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; uniform mat3 normalMatrix;\n';
  var SHADER_PRE_FS = COMMON;

  function WebGLRenderer(o) {
    o = o || {};
    var canvas = o.canvas || document.createElement('canvas'), self = this;
    var gl = canvas.getContext('webgl', { antialias: o.antialias !== false, alpha: !!o.alpha, premultipliedAlpha: true, preserveDrawingBuffer: !!o.preserveDrawingBuffer }) ||
      canvas.getContext('experimental-webgl');
    if (!gl) throw new Error('three-lite: WebGL is not available.');
    gl.getExtension('OES_element_index_uint');
    var aniso = gl.getExtension('EXT_texture_filter_anisotropic');
    this.domElement = canvas; this.shadowMap = { enabled: false, type: 2 }; this.outputEncoding = 3001; this.capabilities = { getMaxAnisotropy: function () { return aniso ? gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1; } };
    var pixelRatio = 1, clear = [0, 0, 0, 0], programs = {}, buffers = {}, textures = {}, shadowTarget = null;
    this.setPixelRatio = function (r) { pixelRatio = r || 1; };
    this.getContext = function () { return gl; };
    this.getPixelRatio = function () { return pixelRatio; };
    this.setClearColor = function (c, a) { var col = new Color(c); clear = [col.r, col.g, col.b, a === undefined ? 1 : a]; };
    this.setSize = function (w, h, style) {
      canvas.width = Math.floor(w * pixelRatio); canvas.height = Math.floor(h * pixelRatio);
      if (style !== false) { canvas.style.width = w + 'px'; canvas.style.height = h + 'px'; }
    };
    this.dispose = function () {
      Object.keys(buffers).forEach(function (k) { var b = buffers[k]; Object.keys(b.attrs).forEach(function (a) { gl.deleteBuffer(b.attrs[a]); }); if (b.index) gl.deleteBuffer(b.index); });
      Object.keys(textures).forEach(function (k) { gl.deleteTexture(textures[k].tex); });
      var ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext();
    };

    function compile(vs, fs) {
      function sh(type, src) {
        var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('three-lite shader: ' + gl.getShaderInfoLog(s));
        return s;
      }
      var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('three-lite link: ' + gl.getProgramInfoLog(p));
      var info = { p: p, u: {}, a: {} }, i, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (i = 0; i < n; i++) { var u = gl.getActiveUniform(p, i); info.u[u.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, u.name); }
      n = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
      for (i = 0; i < n; i++) { var a = gl.getActiveAttrib(p, i); info.a[a.name] = gl.getAttribLocation(p, a.name); }
      return info;
    }
    function program(key, vs, fs) { return programs[key] || (programs[key] = compile(vs, fs)); }
    function geometryBuffers(g) {
      var b = buffers[g.uuid];
      if (b && b.version === g.version) return b;
      b = b || { attrs: {} }; b.version = g.version;
      Object.keys(g.attributes).forEach(function (name) {
        var buf = b.attrs[name] || gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, g.attributes[name].array instanceof Float32Array ? g.attributes[name].array : new Float32Array(g.attributes[name].array), gl.STATIC_DRAW);
        b.attrs[name] = buf;
      });
      if (g.index) {
        b.index = b.index || gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.index);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(g.index.array), gl.STATIC_DRAW);
      }
      b.count = g.index ? g.index.count : g.attributes.position.count;
      buffers[g.uuid] = b; return b;
    }
    function bindAttrs(info, b) {
      for (var name in info.a) {
        var loc = info.a[name];
        if (b.attrs[name]) { gl.bindBuffer(gl.ARRAY_BUFFER, b.attrs[name]); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, name === 'uv' ? 2 : 3, gl.FLOAT, false, 0, 0); }
        else { gl.disableVertexAttribArray(loc); if (name === 'uv') gl.vertexAttrib2f(loc, 0, 0); else gl.vertexAttrib3f(loc, 0, 1, 0); }
      }
      if (b.index) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.index);
    }
    function drawRange(b, mode, start, count) {
      if (b.index) gl.drawElements(mode, count, gl.UNSIGNED_INT, start * 4); else gl.drawArrays(mode, start, count);
    }
    function texture(t) {
      var e = textures[t.uuid];
      if (e && e.version === t.version && !t.needsUpdate) return e.tex;
      e = e || { tex: gl.createTexture() }; e.version = t.version; t.needsUpdate = false;
      gl.bindTexture(gl.TEXTURE_2D, e.tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t.image);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      var pot = (t.image.width & (t.image.width - 1)) === 0 && (t.image.height & (t.image.height - 1)) === 0;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, pot ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (pot) gl.generateMipmap(gl.TEXTURE_2D);
      if (aniso && t.anisotropy > 1) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, t.anisotropy);
      textures[t.uuid] = e; return e.tex;
    }
    function shadowFramebuffer(size) {
      if (shadowTarget && shadowTarget.size === size) return shadowTarget;
      var fb = gl.createFramebuffer(), tex = gl.createTexture(), rb = gl.createRenderbuffer();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindRenderbuffer(gl.RENDERBUFFER, rb); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size, size);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      shadowTarget = { fb: fb, tex: tex, size: size }; return shadowTarget;
    }
    function cull(side) {
      if (side === DoubleSide) gl.disable(gl.CULL_FACE);
      else { gl.enable(gl.CULL_FACE); gl.cullFace(side === BackSide ? gl.FRONT : gl.BACK); }
    }
    function isVisible(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }

    this.render = function (scene, cam) {
      scene.updateMatrixWorld(true);
      if (!cam.parent) cam.updateMatrixWorld(true);
      var meshes = [], lines = [], hemi = null, ambientL = new Color(0), sun = null, fill = null, dirs = [];
      scene.traverse(function (o) {
        if (!isVisible(o)) return;
        if (o.isMesh) meshes.push(o); else if (o.isLineSegments) lines.push(o);
        else if (o.isHemisphereLight) hemi = o; else if (o.isAmbientLight) ambientL.set(o.color).multiplyScalar(o.intensity);
        else if (o.isDirectionalLight) dirs.push(o);
      });
      sun = dirs.filter(function (d) { return d.castShadow; })[0] || dirs[0] || null;
      fill = dirs.filter(function (d) { return d !== sun; })[0] || null;
      function dirOf(l) { if (!l) return new Vector3(0, 1, 0); l.target.updateWorldMatrix(true); var p = new Vector3().setFromMatrixPosition(l.matrixWorld), t = new Vector3().setFromMatrixPosition(l.target.matrixWorld); return p.sub(t).normalize(); }
      var sunDir = dirOf(sun), fillDir = dirOf(fill), shadowOn = self.shadowMap.enabled && sun && sun.castShadow, lightVP = new Matrix4();

      /* shadow pass: depth from the sun into an RGBA texture */
      if (shadowOn) {
        var sc = sun.shadow.camera, sp = new Vector3().setFromMatrixPosition(sun.matrixWorld), st = new Vector3().setFromMatrixPosition(sun.target.matrixWorld);
        var view = new Matrix4().lookAt(sp, st, new Vector3(0, 1, 0)); view.elements[12] = sp.x; view.elements[13] = sp.y; view.elements[14] = sp.z; view.invert();
        lightVP.multiplyMatrices(new Matrix4().makeOrtho(sc.left, sc.right, sc.top, sc.bottom, sc.near, sc.far), view);
        var target = shadowFramebuffer(sun.shadow.mapSize.x);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb); gl.viewport(0, 0, target.size, target.size);
        gl.clearColor(1, 1, 1, 1); gl.clearDepth(1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.depthMask(true); gl.disable(gl.BLEND); gl.disable(gl.POLYGON_OFFSET_FILL);
        var dp = program('depth', DEPTH_VS, DEPTH_FS); gl.useProgram(dp.p);
        gl.uniformMatrix4fv(dp.u.lightViewProj, false, lightVP.elements);
        meshes.forEach(function (m) {
          if (!m.castShadow) return;
          var mats = Array.isArray(m.material) ? m.material : [m.material];
          if (mats[0].isShaderMaterial || mats[0].transparent) return;
          var b = geometryBuffers(m.geometry); bindAttrs(dp, b);
          gl.uniformMatrix4fv(dp.u.modelMatrix, false, m.matrixWorld.elements);
          cull(DoubleSide); drawRange(b, gl.TRIANGLES, 0, b.count);
        });
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(clear[0] * clear[3], clear[1] * clear[3], clear[2] * clear[3], clear[3]);
      gl.clearDepth(1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
      var viewProj = new Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
      var eye = new Vector3().setFromMatrixPosition(cam.matrixWorld), viewDir = new Vector3(0, 0, -1).transformDirection(cam.matrixWorld);
      var fog = scene.fog;

      var mp = program('mesh', MESH_VS, MESH_FS);
      function setMeshUniforms() {
        gl.useProgram(mp.p);
        gl.uniformMatrix4fv(mp.u.viewProj, false, viewProj.elements);
        gl.uniformMatrix4fv(mp.u.shadowMatrix, false, lightVP.elements);
        var hs = hemi ? hemi.color.clone().multiplyScalar(hemi.intensity) : new Color(0), hg = hemi ? hemi.groundColor.clone().multiplyScalar(hemi.intensity) : new Color(0);
        gl.uniform3f(mp.u.hemiSky, hs.r, hs.g, hs.b); gl.uniform3f(mp.u.hemiGround, hg.r, hg.g, hg.b);
        gl.uniform3f(mp.u.ambient, ambientL.r, ambientL.g, ambientL.b);
        var sc2 = sun ? sun.color.clone().multiplyScalar(sun.intensity) : new Color(0), fc = fill ? fill.color.clone().multiplyScalar(fill.intensity) : new Color(0);
        gl.uniform3f(mp.u.sunDir, sunDir.x, sunDir.y, sunDir.z); gl.uniform3f(mp.u.sunColor, sc2.r, sc2.g, sc2.b);
        gl.uniform3f(mp.u.fillDir, fillDir.x, fillDir.y, fillDir.z); gl.uniform3f(mp.u.fillColor, fc.r, fc.g, fc.b);
        gl.uniform1f(mp.u.useShadow, shadowOn ? 1 : 0);
        gl.uniform1f(mp.u.normalBias, shadowOn ? sun.shadow.normalBias : 0);
        gl.uniform1f(mp.u.shadowBias, shadowOn ? sun.shadow.bias : 0);
        if (shadowOn) { gl.uniform2f(mp.u.shadowTexel, 1 / shadowTarget.size, 1 / shadowTarget.size); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, shadowTarget.tex); gl.uniform1i(mp.u.shadowMap, 1); }
        gl.uniform1f(mp.u.useFog, fog ? 1 : 0);
        if (fog) { gl.uniform3f(mp.u.fogColor, fog.color.r, fog.color.g, fog.color.b); gl.uniform2f(mp.u.fogRange, fog.near, fog.far); }
        gl.uniform3f(mp.u.eye, eye.x, eye.y, eye.z); gl.uniform3f(mp.u.viewDir, viewDir.x, viewDir.y, viewDir.z);
        gl.uniform1i(mp.u.map, 0);
      }
      var opaque = [], transparent = [];
      meshes.forEach(function (m) {
        var mats = Array.isArray(m.material) ? m.material : [m.material];
        (mats[0].transparent ? transparent : opaque).push(m);
      });
      transparent.sort(function (a, b) { return new Vector3().setFromMatrixPosition(b.matrixWorld).dot(viewDir) - new Vector3().setFromMatrixPosition(a.matrixWorld).dot(viewDir); });

      function drawMesh(m) {
        var mats = Array.isArray(m.material) ? m.material : [m.material], b = geometryBuffers(m.geometry);
        if (mats[0].isShaderMaterial) return drawShader(m, mats[0], b);
        gl.useProgram(mp.p); bindAttrs(mp, b);
        gl.uniformMatrix4fv(mp.u.modelMatrix, false, m.matrixWorld.elements);
        gl.uniformMatrix3fv(mp.u.normalWorld, false, normalMatrix(m.matrixWorld));
        var groups = m.geometry.groups.length && mats.length > 1 ? m.geometry.groups : [{ start: 0, count: b.count, materialIndex: 0 }];
        groups.forEach(function (gr) {
          var mt = mats[Math.min(gr.materialIndex, mats.length - 1)] || mats[0];
          if (!mt || mt.visible === false) return;
          gl.uniform3f(mp.u.color, mt.color.r, mt.color.g, mt.color.b);
          var ei = mt.emissiveIntensity === undefined ? 1 : mt.emissiveIntensity;
          gl.uniform3f(mp.u.emissive, mt.emissive.r * ei, mt.emissive.g * ei, mt.emissive.b * ei);
          gl.uniform1f(mp.u.opacity, mt.transparent ? mt.opacity : 1);
          gl.uniform1f(mp.u.flipNormal, mt.side === DoubleSide ? 2 : mt.side === BackSide ? -1 : 1);
          if (mt.map) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture(mt.map)); gl.uniform1f(mp.u.useMap, 1); } else gl.uniform1f(mp.u.useMap, 0);
          if (mt.transparent) { gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA); } else gl.disable(gl.BLEND);
          gl.depthMask(mt.depthWrite !== false);
          if (mt.polygonOffset) { gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(mt.polygonOffsetFactor, mt.polygonOffsetUnits); } else gl.disable(gl.POLYGON_OFFSET_FILL);
          cull(mt.side); drawRange(b, gl.TRIANGLES, gr.start, gr.count);
        });
      }
      function drawShader(m, mt, b) {
        var info = program('s' + mt.uuid, SHADER_PRE_VS + mt.vertexShader, SHADER_PRE_FS + mt.fragmentShader);
        gl.useProgram(info.p); bindAttrs(info, b);
        var mv = new Matrix4().multiplyMatrices(cam.matrixWorldInverse, m.matrixWorld);
        gl.uniformMatrix4fv(info.u.modelViewMatrix, false, mv.elements);
        gl.uniformMatrix4fv(info.u.projectionMatrix, false, cam.projectionMatrix.elements);
        gl.uniformMatrix3fv(info.u.normalMatrix, false, normalMatrix(mv));
        Object.keys(mt.uniforms).forEach(function (k) {
          var v = mt.uniforms[k].value, loc = info.u[k];
          if (loc == null) return;
          if (typeof v === 'number') gl.uniform1f(loc, v); else if (v && v.isColor) gl.uniform3f(loc, v.r, v.g, v.b); else if (v && v.isVector3) gl.uniform3f(loc, v.x, v.y, v.z);
        });
        gl.disable(gl.BLEND); gl.depthMask(true); gl.disable(gl.POLYGON_OFFSET_FILL); cull(mt.side);
        drawRange(b, gl.TRIANGLES, 0, b.count);
      }
      setMeshUniforms();
      opaque.forEach(drawMesh);
      if (lines.length) {
        var lp = program('line', LINE_VS, LINE_FS); gl.useProgram(lp.p); gl.disable(gl.BLEND); gl.depthMask(true); gl.disable(gl.POLYGON_OFFSET_FILL);
        gl.uniformMatrix4fv(lp.u.viewProj, false, viewProj.elements);
        lines.forEach(function (l) {
          var b = geometryBuffers(l.geometry); bindAttrs(lp, b);
          gl.uniformMatrix4fv(lp.u.modelMatrix, false, l.matrixWorld.elements);
          gl.uniform3f(lp.u.color, l.material.color.r, l.material.color.g, l.material.color.b);
          drawRange(b, gl.LINES, 0, b.count);
        });
      }
      if (transparent.length) { setMeshUniforms(); transparent.forEach(drawMesh); }
      gl.depthMask(true); gl.disable(gl.BLEND);
    };
  }

  var THREE = {
    REVISION: '128-lite', Vector2: Vector2, Vector3: Vector3, Euler: Euler, Matrix4: Matrix4, Color: Color, Box3: Box3, Plane: Plane, Ray: Ray, Raycaster: Raycaster,
    Object3D: Object3D, Group: Group, Scene: Scene, Fog: Fog, Mesh: Mesh, LineSegments: LineSegments, OrthographicCamera: OrthographicCamera,
    DirectionalLight: DirectionalLight, HemisphereLight: HemisphereLight, AmbientLight: AmbientLight,
    BufferGeometry: BufferGeometry, BufferAttribute: BufferAttribute, Float32BufferAttribute: Float32BufferAttribute,
    BoxGeometry: BoxGeometry, CylinderGeometry: CylinderGeometry, ConeGeometry: ConeGeometry, SphereGeometry: SphereGeometry, TorusGeometry: TorusGeometry,
    PlaneGeometry: PlaneGeometry, Shape: Shape, ExtrudeGeometry: ExtrudeGeometry, EdgesGeometry: EdgesGeometry,
    MeshStandardMaterial: MeshStandardMaterial, LineBasicMaterial: LineBasicMaterial, ShaderMaterial: ShaderMaterial, CanvasTexture: CanvasTexture,
    WebGLRenderer: WebGLRenderer, FrontSide: FrontSide, BackSide: BackSide, DoubleSide: DoubleSide, sRGBEncoding: 3001, LinearEncoding: 3000, PCFSoftShadowMap: 2
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = THREE;
  else root.THREE = THREE;
})(typeof window !== 'undefined' ? window : this);
