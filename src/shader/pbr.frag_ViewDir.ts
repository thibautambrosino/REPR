export default `
precision highp float;

// Fragment shader output
out vec4 outFragColor;

in vec3 vViewDirWS;

// Uniforms
struct Material
{
  vec3 albedo;
};
uniform Material uMaterial;

// From three.js
vec4 sRGBToLinear( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}

// From three.js
vec4 LinearTosRGB( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}

void main()
{
  vec3 albedo = sRGBToLinear(vec4(uMaterial.albedo, 1.0)).rgb;
  vec3 viewDir = 0.5 * (normalize(vViewDirWS) + 1.0);

  // viewDir
  vec3 finalColor = viewDir;
  // Convert to sRGB space before output
  outFragColor = LinearTosRGB(vec4(finalColor, 1.0));
}
`;
