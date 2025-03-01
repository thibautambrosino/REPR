export default `
precision highp float;

// Fragment shader output
out vec4 outFragColor;

// Fragement shader input
in vec3 vNormalWS;
in vec3 vFragPos;
flat in int vMaterialID;

// Uniforms
struct Material
{
  float roughness;
  float metalness;
  vec3 albedo;
};
uniform Material uMaterial[25];

struct Light {
  vec3 position;
  vec3 color;
  float intensity;
};
uniform Light uLights[10];

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
  // **DO NOT** forget to do all your computation in linear space.
  vec3 albedo = sRGBToLinear(vec4(uMaterial[vMaterialID].albedo, 1.0)).rgb;

  vec3 color = vec3(0.0);
  vec3 normal = normalize(vNormalWS);

  for(int i=0; i<10; i++) {
    // Calcul Light Direction with a distance and an attenuation
    vec3 lightDir = normalize(uLights[i].position - vFragPos);
    float dist = length(uLights[i].position - vFragPos);
    float attenuation = 1.0 / (dist * dist);

    // Calcul the diffuse
    //float diff = max(dot(vNormalWS, lightDir), 0.0);

    // Calcul the radiance
    color += uLights[i].color * uLights[i].intensity * attenuation;
  }

  // Tone Mapping HDR to LDR
  vec3 hdrColor = color;
  vec3 ldrColor = hdrColor / (1.0 + hdrColor);

  // Convert to sRGB space before output
  outFragColor = LinearTosRGB(vec4(ldrColor, 1.0));
}
`;
