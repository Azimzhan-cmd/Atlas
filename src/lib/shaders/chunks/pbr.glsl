// ═══════════════════════════════════════════════════════
// ARKHEVARA — PBR Chunk (Cook-Torrance)
// GGX NDF + Smith G + Schlick Fresnel
// ═══════════════════════════════════════════════════════

const float PI = 3.14159265359;

// GGX / Trowbridge-Reitz normal distribution
float D_GGX(float NdH, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float NdH2 = NdH * NdH;
  float denom = NdH2 * (a2 - 1.0) + 1.0;
  return a2 / (PI * denom * denom);
}

// Smith geometry (Schlick-Beckmann approximation)
float G_Smith(float NdV, float NdL, float roughness) {
  float r = roughness + 1.0;
  float k = (r * r) / 8.0;
  float gv = NdV / (NdV * (1.0 - k) + k);
  float gl = NdL / (NdL * (1.0 - k) + k);
  return gv * gl;
}

// Schlick Fresnel approximation
vec3 F_Schlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

float F_SchlickScalar(float cosTheta, float F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// Full PBR BRDF evaluation
vec3 pbrBRDF(
  vec3  N,          // surface normal (normalized)
  vec3  V,          // view direction (normalized, toward camera)
  vec3  L,          // light direction (normalized, toward light)
  vec3  albedo,     // base color (linear)
  float metallic,
  float roughness,
  vec3  lightColor,
  float lightIntensity
) {
  vec3 H = normalize(V + L);
  float NdL = max(dot(N, L), 0.0);
  float NdV = max(dot(N, V), 0.001);
  float NdH = max(dot(N, H), 0.0);
  float HdV = max(dot(H, V), 0.0);

  // F0: dialectric = 0.04, metal = albedo
  vec3 F0 = mix(vec3(0.04), albedo, metallic);

  float D = D_GGX(NdH, roughness);
  float G = G_Smith(NdV, NdL, roughness);
  vec3  F = F_Schlick(HdV, F0);

  // Specular
  vec3 numerator = D * G * F;
  float denominator = 4.0 * NdV * NdL + 0.0001;
  vec3 specular = numerator / denominator;

  // Diffuse (metals have no diffuse)
  vec3 kD = (1.0 - F) * (1.0 - metallic);
  vec3 diffuse = kD * albedo / PI;

  return (diffuse + specular) * lightColor * lightIntensity * NdL;
}
