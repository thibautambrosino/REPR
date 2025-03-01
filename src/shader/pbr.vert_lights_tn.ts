export default `

precision highp float;

// Attributes (vertex shader inputs)
in vec3 in_position;
in vec3 in_normal;
#ifdef USE_UV
  in vec2 in_uv;
#endif

// Varyings (vertex shader outputs)
out vec3 vNormalWS;
out vec3 vFragPos;
flat out int vMaterialID;
#ifdef USE_UV
  out vec2 vUv;
#endif

// Uniforms
struct Camera
{
  mat4 WS_to_CS; // World-Space to Clip-Space (view * proj)
};
uniform Camera uCamera;

struct Model
{
  mat4 LS_to_WS; // Local-Space to World-Space
};
uniform Model uModel;

uniform int uMaterialID;

void main()
{
  vec4 positionLocal = vec4(in_position, 1.0);
  vec4 worldPos = uModel.LS_to_WS * positionLocal;
  gl_Position = uCamera.WS_to_CS * uModel.LS_to_WS * positionLocal;
  vMaterialID = uMaterialID;

  vNormalWS = in_normal;
  vFragPos = worldPos.xyz;
}
`;
