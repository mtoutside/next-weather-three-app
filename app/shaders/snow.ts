export const snowVertexShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  varying vec2 vUv;

vec3 rotateVec3(vec3 p, float angle, vec3 axis){
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
    vUv = uv;
    vec3 pos = position;

    pos = rotateVec3(pos, pos.x * 0.5 * log(exp(sin(uTime * 0.5))), vec3(1.0, 0.0, 0.0));
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const snowFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uBlizzardFactor;
  uniform float uSnowflakeAmount;
  uniform vec3 uBaseColor;
  uniform vec3 uHighlightColor;

  varying vec2 vUv;

  float rnd(float x) {
    return fract(sin(dot(vec2(x + 47.49, 38.2467 / (x + 2.3)), vec2(12.9898, 78.233))) * 43758.5453);
  }

  float drawCircle(vec2 center, float radius) {
    return 1.0 - smoothstep(0.0, radius, length(vUv - center));
  }

  void main() {
    vec3 color = uBaseColor;
    float amount = clamp(uSnowflakeAmount, 0.0, 200.0);

    for (int i = 0; i < 200; i++) {
      float j = float(i);
      if (j >= amount) {
        break;
      }

      float divisor = max(amount * 0.25, 1.0);
      float speed = 0.6 + rnd(cos(j)) * (0.7 + 0.5 * cos(j / divisor));
      vec2 center = vec2(
        (0.25 - vUv.y) * uBlizzardFactor + rnd(j) + 0.1 * cos(uTime + sin(j)),
        mod(sin(j) - speed * (uTime * 1.5 * (0.1 + uBlizzardFactor)), 0.7)
      );
      float flake = drawCircle(center, 0.01 + speed * 0.022);
      color += uHighlightColor * (0.29 * flake);
    }

    color = clamp(color, 0.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
  }
`;
