export default `

precision highp float;

in vec3 in_position;
in vec3 in_normal;
#ifdef USE_UV
  in vec2 in_uv;
#endif // USE_UV

/**
 * Varyings.
 */

out vec3 vNormalWS;
#ifdef USE_UV
  out vec2 vUv;
#endif // USE_UV

/**
 * Uniforms List
 */

struct Camera
{
  mat4 view;
  mat4 projection;
};

uniform Camera uCamera;

void
main()
{
  vec4 positionLocal = vec4(in_position, 1.0);
  gl_Position = uCamera.projection * uCamera.view * positionLocal;
}
`;
