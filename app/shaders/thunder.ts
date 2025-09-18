export const thunderVertexShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uNoiseScale;
  uniform float uNoiseStrength;
  uniform float uWobbleStrength;
  uniform float uFlowSpeed;
  uniform float uRippleMix;
  uniform vec2 uJitterFreq;
  uniform vec2 uJitterPhase;
  uniform vec2 uJitterScale;

  varying float vDisplacement;
  varying float vRipple;
  varying float vJitter;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x) {
    return mod289(((x * 34.0) + 1.0) * x);
  }

  vec4 taylorInvSqrt(vec4 r){
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  float snoise(vec3 v){
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(
      permute(
        permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0)
      )
      + i.x + vec4(0.0, i1.x, i2.x, 1.0)
    );

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p * frequency);
      frequency *= 2.05;
      amplitude *= 0.55;
    }
    return value;
  }

  void main() {
    vec3 transformedNormal = normalize(normalMatrix * normal);
    float time = uTime * uFlowSpeed;
    vec2 jitter = vec2(
      sin(uTime * uJitterFreq.x + uJitterPhase.x) * uJitterScale.x,
      cos(uTime * uJitterFreq.y + uJitterPhase.y) * uJitterScale.y
    );

    vec3 noisePosition = position * 0.4 * uNoiseScale + transformedNormal * (0.6 + uNoiseScale * 0.4);
    noisePosition += vec3(time * 0.16, time * 0.36, time * 0.22);
    noisePosition.xy += jitter;

    float base = fbm(noisePosition);
    float detail = snoise(noisePosition * 2.6 + time * 0.6);
    float wobble = snoise(vec3(position.xy * 0.6, time * 0.9));

    float displacement = base * uNoiseStrength + detail * (uNoiseStrength * 0.4) + wobble * uWobbleStrength;
    vDisplacement = displacement;
    vNormal = transformedNormal;

    float ripple = sin(position.y * 6.0 + time * 7.5) * 0.2;
    vRipple = ripple * uRippleMix;
    vJitter = length(jitter);

    vec3 displaced = position + transformedNormal * (displacement + vRipple) + vec3(jitter, 0.0);
    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const thunderFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uOpacity;
  uniform float uHighlightGain;
  uniform float uShadowStrength;
  uniform float uFlashIntensity;
  uniform vec3 uBaseColor;
  uniform vec3 uHighlightColor;

  varying float vDisplacement;
  varying float vRipple;
  varying float vJitter;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.0);

    float puff = smoothstep(-0.05, 0.5, vDisplacement * uHighlightGain + fresnel * 0.5);
    float rippleShade = clamp(vRipple * 2.5, -0.5, 0.5);
    float shadow = (1.0 - puff) * (0.2 + rippleShade * 0.3);

    vec3 color = mix(uBaseColor, uHighlightColor, puff);
    color -= shadow * vec3(0.12, 0.16, 0.22);

    float flash = vJitter * uFlashIntensity;
    color += vec3(1.0, 0.95, 0.75) * flash;
    color = clamp(color, 0.0, 1.2);

    float alpha = clamp(uOpacity * mix(0.85, 1.1, puff + flash), 0.0, 1.0);
    gl_FragColor = vec4(color, alpha);
  }
`;
