export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// 2D value noise + 5-octave fbm
export const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uTemp; // 0..1（低温→高温）
  varying vec2 vUv;

  // Hash: 2D -> 1D [0,1)
  float hash(vec2 p) {
    // 高速・簡易なハッシュ
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // Value noise (2D)
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    // 4隅の疑似乱数
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    // Hermite 補間
    vec2 u = f * f * (3.0 - 2.0 * f);

    // 双一次補間
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // Fractal Brownian Motion (5 octaves)
  float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    // 軽い回転で格子の方向性を抑える
    mat2 rot = mat2(cos(0.5), -sin(0.5), sin(0.5), cos(0.5));
    for (int i = 0; i < 5; i++) {
      v += a * noise(x);
      x = rot * x * 2.0;
      a *= 0.5;
    }
    return v; // だいたい 0..1 付近
  }

  void main() {
    // 温度で色相を補間（寒色→暖色）
    vec3 cold = vec3(0.2, 0.5, 1.0);
    vec3 warm = vec3(1.0, 0.35, 0.1);
    vec3 base = mix(cold, warm, clamp(uTemp, 0.0, 1.0));

    // 温度で速度・明瞭度を調整
    float speed = mix(0.2, 1.3, uTemp);
    float scale = mix(3.0, 9.0, uTemp);

    vec2 p = vUv * scale + vec2(uTime * 0.2 * speed, uTime * 0.15 * speed);
    float n = fbm(p);

    // コントラストを少し高める
    n = smoothstep(0.2, 0.9, n);
    float glow = mix(0.6, 1.2, uTemp);
    vec3 col = base * mix(0.7, 1.3, n * glow);
    gl_FragColor = vec4(col, 1.0);
  }
`;

