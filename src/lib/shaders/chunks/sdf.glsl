// ═══════════════════════════════════════════════════════
// ARKHEVARA — SDF Primitives Chunk
// Standard SDF library + boolean ops
// ═══════════════════════════════════════════════════════

// Sphere
float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

// Box
float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// Rounded box
float sdRoundBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

// Torus
float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

// Capsule
float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

// Octahedron (exact)
float sdOctahedron(vec3 p, float s) {
  p = abs(p);
  float m = p.x + p.y + p.z - s;
  vec3 q;
  if (3.0 * p.x < m) q = p.xyz;
  else if (3.0 * p.y < m) q = p.yzx;
  else if (3.0 * p.z < m) q = p.zxy;
  else return m * 0.57735027;
  float k = clamp(0.5 * (q.z - q.y + s), 0.0, s);
  return length(vec3(q.x, q.y - s + k, q.z - k));
}

// Boolean operations
float opUnion(float a, float b) { return min(a, b); }
float opSubtract(float a, float b) { return max(-b, a); }
float opIntersect(float a, float b) { return max(a, b); }

// Smooth union (k controls blend radius)
float opSmoothUnion(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Normal estimation via tetrahedron sampling (4 samples vs 6)
vec3 calcNormalTet(vec3 p, float sdf_d, float h) {
  // Caller must define: float sdfScene(vec3 p)
  // Using macro-like pattern — inline at call site
  const vec2 k = vec2(1.0, -1.0);
  return vec3(0.0); // stub — override at call site
}

// SDF normal via finite differences (generic, 6-tap)
// Usage: pass your SDF function pointer pattern via macro in the shader
