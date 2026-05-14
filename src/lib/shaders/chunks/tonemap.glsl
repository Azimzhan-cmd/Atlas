// ═══════════════════════════════════════════════════════
// ARKHEVARA — Tone Mapping Chunk
// ACES filmic approximation (Hill/Narkowicz)
// ═══════════════════════════════════════════════════════

// ACES filmic — maps HDR scene-linear to [0,1] display
vec3 acesFilmic(vec3 x) {
  return (x * (2.51 * x + 0.03)) /
         (x * (2.43 * x + 0.59) + 0.14);
}

// Exposure utility
vec3 expose(vec3 color, float ev) {
  return color * pow(2.0, ev);
}

// Gamma correction (linear → sRGB approximation)
vec3 linearToSRGB(vec3 color) {
  return pow(clamp(color, 0.0, 1.0), vec3(1.0 / 2.2));
}

// Full pipeline: exposure → ACES → gamma
vec3 toneMap(vec3 color, float ev) {
  return linearToSRGB(acesFilmic(expose(color, ev)));
}
