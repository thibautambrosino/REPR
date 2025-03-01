export default `
precision highp float;

// Fragment shader output
out vec4 outFragColor;

in vec3 vNormalWS;
in vec3 vFragPos;
in vec3 vViewDirWS;

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

vec3 fresnelSchlick(float HdotV, vec3 F0) {
  return F0 + (1.0 - F0) * pow(1.0 - HdotV, 5.0);
}

float distributionGGX(float NdotH, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float NdotH2 = NdotH * NdotH;
  float den = (NdotH2 * (a2 - 1.0) + 1.0);
  return a2 / (3.14159265359 * den * den);
}

// Geometry Smith function (Schlick-GGX)
float geometrySchlickGGX(float NdotV, float NdotL, float roughness) {
  float r = (roughness + 1.0);
  float k = (r * r) / 8.0;
  float GSnv = NdotV / (NdotV * (1.0 - k) + k);
  float GSnl = NdotL / (NdotL * (1.0 - k) + k);
  return GSnl * GSnv;
}

void main()
{
  // **DO NOT** forget to do all your computation in linear space.
  vec3 albedo = sRGBToLinear(vec4(uMaterial[0].albedo, 1.0)).rgb;

  vec3 color = vec3(0.0);
  vec3 normal = normalize(vNormalWS);
  vec3 viewDir = normalize(vViewDirWS);
  float pi = 3.14159265359;

  // F0 calcul depend on metalness, 0.04 if not
  vec3 F0 = mix(vec3(0.04), albedo, uMaterial[0].metalness);

  for(int i=0; i<10; i++) {
    vec3 lightDir = normalize(uLights[i].position - vFragPos);
    float dist = length(uLights[i].position - vFragPos);
    float attenuation = 1.0 / (dist * dist + 0.01);

    vec3 h = normalize(lightDir + viewDir);
    float NdotL = max(dot(normal, lightDir), 0.0);
    float NdotV = max(dot(normal, viewDir), 0.0);
    float NdotH = max(dot(normal, h), 0.0);
    float HdotV = max(dot(h, viewDir), 0.0);

    float D = distributionGGX(NdotH, uMaterial[0].roughness);
    float G = geometrySchlickGGX(NdotV, NdotL, uMaterial[0].roughness);
    vec3 F = fresnelSchlick(HdotV, F0);

    vec3 specular = (D * G * F) / max(4.0 * NdotV * NdotL, 0.001);

    float metalnessCoef = 1.0 - uMaterial[0].metalness;
    vec3 kd = (1.0 - F) * metalnessCoef;

    vec3 diffuse = NdotL * kd * (albedo / pi);
    // diffuseLobe  = mix(metalnessCoef, diffuseLobe, NdotL);

    vec3 radiance = uLights[i].color * uLights[i].intensity * attenuation;
    color += (diffuse + specular) * radiance;
  }

  vec3 hdrColor = color;
  vec3 ldrColor = hdrColor / (1.0 + hdrColor);

  // Convert to sRGB space before output
  outFragColor = LinearTosRGB(vec4(ldrColor, 1.0));
}
`;
