export const cloudyVertexShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uWaveFreq;
  uniform float uWaveAmp;
  uniform float uSecondaryAmp;
  uniform float uSwirlStrength;

  varying float vWave;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  vec3 rotateAxis(vec3 p, float angle, vec3 axis) {
    vec3 a = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float r = 1.0 - c;
    mat3 m = mat3(
      a.x * a.x * r + c,
      a.y * a.x * r + a.z * s,
      a.z * a.x * r - a.y * s,
      a.x * a.y * r - a.z * s,
      a.y * a.y * r + c,
      a.z * a.y * r + a.x * s,
      a.x * a.z * r + a.y * s,
      a.y * a.z * r - a.x * s,
      a.z * a.z * r + c
    );
    return m * p;
  }

  void main() {
    vec3 transformedNormal = normalize(normalMatrix * normal);
    float angle = uSwirlStrength * uTime * 0.15;
    vec3 rotated = rotateAxis(position, angle, vec3(0.0, 1.0, 0.0));

    float wave = sin((rotated.x + rotated.y) * uWaveFreq - uTime * 0.6) * uWaveAmp;
    float secondary = sin(rotated.y * (uWaveFreq * 0.5) + uTime * 0.9) * uSecondaryAmp;

    vec3 displaced = rotated + transformedNormal * (wave + secondary);
    vWave = wave + secondary;
    vNormal = normalize(normalMatrix * transformedNormal);

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const cloudyFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uOpacity;
  uniform float uHueShift;
  uniform vec3 uBaseColor;
  uniform vec3 uHighlightColor;

  varying float vWave;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.0);

    float puff = smoothstep(-0.15, 0.35, vWave + fresnel * 0.3);
    vec3 baseCol = uBaseColor;
    baseCol = vec3(
      clamp(baseCol.r - uHueShift * 0.3, 0.0, 1.0),
      clamp(baseCol.g - uHueShift * 0.1, 0.0, 1.0),
      clamp(baseCol.b + uHueShift, 0.0, 1.0)
    );

    vec3 color = mix(baseCol, uHighlightColor, puff);
    color = mix(color, vec3(dot(color, vec3(0.299, 0.587, 0.114))), 0.25);
    color = clamp(color, 0.0, 1.0);

    float alpha = clamp(uOpacity * mix(0.85, 1.05, puff), 0.0, 1.0);
    gl_FragColor = vec4(color, alpha);
  }
`;
