export const snowVertexShader = /* glsl */ `
  precision highp float;

  varying float vWave;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  void main() {
    vWave = 0.0;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const snowFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uFogStrength;
  uniform float uHighlightMix;
  uniform float uOpacity;
  uniform vec3 uBaseColor;
  uniform vec3 uHighlightColor;

  varying float vWave;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 toCamera = normalize(-vWorldPosition);
    float fresnel = pow(1.0 - max(dot(normal, toCamera), 0.0), 2.0);

    vec2 tileUV = fract(vWorldPosition.xy * vec2(0.4, 0.12) + vec2(uTime * 0.05, 0.0));
    float streak = smoothstep(0.0, 0.4, tileUV.x) * smoothstep(1.0, 0.6, tileUV.x);
    streak *= smoothstep(0.1, 0.6, tileUV.y) * smoothstep(1.0, 0.5, 1.0 - tileUV.y);

    float puff = smoothstep(-0.25, 0.25, vWave + fresnel * 0.4);
    vec3 color = mix(uBaseColor, uHighlightColor, min(1.0, puff + streak * uHighlightMix));

    float fog = clamp(length(vWorldPosition) * 0.1 * uFogStrength, 0.0, 1.0);
    color = mix(color, vec3(0.92, 0.96, 1.0), fog);

    float alpha = clamp(uOpacity * (0.6 + puff * 0.4 + streak * 0.5), 0.0, 1.0);
    gl_FragColor = vec4(color, alpha);
  }
`;
