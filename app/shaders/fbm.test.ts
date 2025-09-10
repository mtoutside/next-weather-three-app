import { describe, it, expect } from 'vitest';
import { fragmentShader, vertexShader } from './fbm';

describe('fbm shaders', () => {
  it('vertex shader exposes vUv varying', () => {
    expect(vertexShader).toMatch(/varying\s+vec2\s+vUv/);
    expect(vertexShader).toMatch(/gl_Position/);
  });

  it('fragment shader defines uTime/uTemp and fbm + noise', () => {
    expect(fragmentShader).toMatch(/uniform\s+float\s+uTime/);
    expect(fragmentShader).toMatch(/uniform\s+float\s+uTemp/);
    expect(fragmentShader).toMatch(/float\s+noise\s*\(\s*vec2\s+\w+\s*\)/);
    expect(fragmentShader).toMatch(/float\s+fbm\s*\(\s*vec2\s+\w+\s*\)/);
    // 5オクターブのループを用いたfbm（forループ）を含むこと
    expect(fragmentShader).toMatch(/for\s*\(\s*int\s+i\s*=\s*0;\s*i\s*<\s*5;\s*i\+\+\s*\)/);
  });

  it('fragment shader mixes cold/warm colors by uTemp', () => {
    expect(fragmentShader).toMatch(/mix\(\s*cold\s*,\s*warm\s*,\s*.*uTemp/);
  });
});

