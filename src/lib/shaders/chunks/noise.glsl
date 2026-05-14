// ═══════════════════════════════════════════════════════
// ARKHEVARA — Noise Primitives Chunk
// hash33, gradient noise, fBm, simplex approximation
// ═══════════════════════════════════════════════════════

vec3 hash33(vec3 p) {
  p = vec3(
    dot(p, vec3(127.1, 311.7, 74.7)),
    dot(p, vec3(269.5, 183.3, 246.1)),
    dot(p, vec3(113.5, 271.9, 124.6))
  );
  return fract(sin(p) * 43758.5453123) * 2.0 - 1.0;
}

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Quilez-style gradient noise
float gnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(
      mix(dot(hash33(i + vec3(0,0,0)), f - vec3(0,0,0)),
          dot(hash33(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
      mix(dot(hash33(i + vec3(0,1,0)), f - vec3(0,1,0)),
          dot(hash33(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
    mix(
      mix(dot(hash33(i + vec3(0,0,1)), f - vec3(0,0,1)),
          dot(hash33(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
      mix(dot(hash33(i + vec3(0,1,1)), f - vec3(0,1,1)),
          dot(hash33(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y),
    u.z);
}

// fBm: 5 octaves, Hurst exponent ~0.5, rotation matrix to break axis alignment
float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  mat3 rot = mat3(
     0.00,  0.80,  0.60,
    -0.80,  0.36, -0.48,
    -0.60, -0.48,  0.64
  );
  for (int i = 0; i < 5; ++i) {
    v += a * gnoise(p);
    p = rot * p * 2.02;
    a *= 0.5;
  }
  return v;
}

// Curl noise — divergence-free vector field for particle flow
vec3 curlNoise(vec3 p) {
  const float e = 0.01;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);
  float px0 = gnoise(p - dx); float px1 = gnoise(p + dx);
  float py0 = gnoise(p - dy); float py1 = gnoise(p + dy);
  float pz0 = gnoise(p - dz); float pz1 = gnoise(p + dz);
  float x = (py1 - py0) - (pz1 - pz0);
  float y = (pz1 - pz0) - (px1 - px0);
  float z = (px1 - px0) - (py1 - py0);
  return normalize(vec3(x, y, z));
}
