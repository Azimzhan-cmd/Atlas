#version 300 es
precision highp float;

in vec3 a_position;
in vec3 a_normal;
in vec2 a_uv;

uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_modelMatrix;
uniform float u_time;
uniform float u_disruption;
uniform vec2  u_cursorField;

out vec3 v_worldPos;
out vec3 v_normal;
out vec3 v_viewDir;
out vec2 v_uv;
out float v_disruption;

void main() {
  vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
  v_worldPos    = worldPos.xyz;
  v_normal      = normalize(mat3(u_modelMatrix) * a_normal);
  v_viewDir     = normalize(-(u_viewMatrix * worldPos).xyz);
  v_uv          = a_uv;
  v_disruption  = u_disruption;
  gl_Position   = u_projectionMatrix * u_viewMatrix * worldPos;
}
