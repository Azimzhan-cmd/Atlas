#version 300 es
precision highp float;

in vec3 v_worldPos;
in vec3 v_normal;
in vec3 v_viewDir;
in vec2 v_uv;
in float v_disruption;

uniform float u_time;
uniform vec2  u_cursorField;
uniform vec3  u_cameraPos;
uniform vec3  u_emissionColor;
uniform float u_emissionIntensity;
uniform float u_bloomWarmup;      // 0→1 over 900ms

out vec4 fragColor;

// ─── Noise primitives ───────────────────────────────────────────────────────
vec3 hash33(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7,  74.7)),
           dot(p, vec3(269.5, 183.3, 246.1)),
           dot(p, vec3(113.5, 271.9, 124.6)));
  return fract(sin(p) * 43758.5453123) * 2.0 - 1.0;
}

float gnoise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(dot(hash33(i+vec3(0,0,0)), f-vec3(0,0,0)),
            dot(hash33(i+vec3(1,0,0)), f-vec3(1,0,0)), u.x),
        mix(dot(hash33(i+vec3(0,1,0)), f-vec3(0,1,0)),
            dot(hash33(i+vec3(1,1,0)), f-vec3(1,1,0)), u.x), u.y),
    mix(mix(dot(hash33(i+vec3(0,0,1)), f-vec3(0,0,1)),
            dot(hash33(i+vec3(1,0,1)), f-vec3(1,0,1)), u.x),
        mix(dot(hash33(i+vec3(0,1,1)), f-vec3(0,1,1)),
            dot(hash33(i+vec3(1,1,1)), f-vec3(1,1,1)), u.x), u.y),
    u.z);
}

float fbm(vec3 p) {
  float v = 0.0, a = 0.5;
  mat3 rot = mat3(0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64);
  for (int i = 0; i < 5; ++i) {
    v += a * gnoise(p);
    p = rot * p * 2.02;
    a *= 0.5;
  }
  return v;
}

// ─── SDF ────────────────────────────────────────────────────────────────────
float sdArkhe(vec3 p) {
  float baseRadius = 0.425;
  float breath     = 0.018 * sin(u_time * 0.6);
  vec3  cursorWarp = vec3(u_cursorField, 0.0) * 0.14;
  float disp  = fbm(p * 2.4 + u_time * 0.08 + cursorWarp) * 0.06;
        disp += fbm(p * 7.1 + u_time * 0.12)               * 0.018;
        disp += v_disruption * fbm(p * 18.0 + u_time * 1.4) * 0.09;
  return length(p) - (baseRadius + breath + disp);
}

vec3 calcNormal(vec3 p) {
  const float h = 0.0008;
  const vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * sdArkhe(p + k.xyy*h) +
    k.yyx * sdArkhe(p + k.yyx*h) +
    k.yxy * sdArkhe(p + k.yxy*h) +
    k.xxx * sdArkhe(p + k.xxx*h));
}

float fresnelSchlick(float cosTheta, float F0) {
  return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

// ─── ACES tone mapping ───────────────────────────────────────────────────────
vec3 acesFilmic(vec3 x) {
  return (x*(2.51*x+0.03)) / (x*(2.43*x+0.59)+0.14);
}

void main() {
  // Raymarch from camera through rasterised surface position
  vec3 ro = u_cameraPos;
  vec3 rd = normalize(v_worldPos - ro);
  float t = 0.0;
  float d = 0.0;
  vec3 p;
  for (int i = 0; i < 64; ++i) {
    p = ro + rd * t;
    d = sdArkhe(p);
    if (d < 0.0008 || t > 6.0) break;
    t += d * 0.92;
  }

  if (t > 6.0) discard;

  vec3 n       = calcNormal(p);
  vec3 viewDir = normalize(u_cameraPos - p);

  // Surface temperature gradient
  float interior = fbm(p * 5.0 + u_time * 0.05);
  interior = smoothstep(-0.4, 0.6, interior);
  vec3 coldBronze = vec3(0.42, 0.27, 0.15);
  vec3 hotAmber   = u_emissionColor * 2.2;
  vec3 surface    = mix(coldBronze, hotAmber, interior);

  // Fresnel rim glow
  float NdV     = max(dot(n, viewDir), 0.0);
  float rim     = fresnelSchlick(NdV, 0.04);
  float warmup  = u_bloomWarmup * u_emissionIntensity;
  vec3 emission = u_emissionColor * rim * warmup * (1.2 + v_disruption * 3.0);

  // Subsurface bleed at thin SDF regions
  float thinness = 1.0 - smoothstep(0.0, 0.08, abs(d));
  emission += u_emissionColor * thinness * 0.45 * warmup;

  vec3 color = acesFilmic(surface + emission);
  fragColor  = vec4(color, 1.0);
}
