"use client";

import { useThree, useFrame } from '@react-three/fiber';
import { useFBO } from '@react-three/drei';
import * as THREE from 'three';
import { useEffect, useMemo } from 'react';
import { vertexShader, fragmentShader } from '../shaders/fbm';

export function createFbmUniforms(temp01 = 0.5) {
  return {
    uTime: { value: 0 },
    uTemp: { value: temp01 },
  } as const;
}

export function smoothFollow(current: number, target: number, alpha = 0.05) {
  return current + (target - current) * alpha;
}

export function getFboSize({ base = 512, max = 1024, dpr = 1 }: { base?: number; max?: number; dpr?: number }) {
  const size = Math.round(base * Math.max(0.1, dpr));
  return Math.min(size, max);
}

export function useShaderFBOTexture({ temp01 = 0.5, base = 512, max = 1024 }: { temp01?: number; base?: number; max?: number }) {
  const gl = useThree((s) => s.gl);
  const dpr = useThree((s) => s.viewport.dpr ?? 1);
  const size = getFboSize({ base, max, dpr });
  const fbo = useFBO(size, size, {
    depthBuffer: false,
    stencilBuffer: false,
    magFilter: THREE.LinearFilter,
    minFilter: THREE.LinearFilter,
  });

  // 別シーンと直交カメラ
  const scene = useMemo(() => new THREE.Scene(), []);
  const cam = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const uniforms = useMemo(() => createFbmUniforms(temp01), [temp01]);

  useEffect(() => {
    fbo.texture.colorSpace = THREE.SRGBColorSpace;
  }, [fbo]);

  useEffect(() => {
    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({ uniforms: uniforms as any, vertexShader, fragmentShader });
    const quad = new THREE.Mesh(geo, mat);
    scene.add(quad);
    return () => {
      scene.remove(quad);
      geo.dispose();
      mat.dispose();
    };
  }, [scene, uniforms]);

  useFrame(({ clock }) => {
    // uniform更新
    (uniforms as any).uTime.value = clock.elapsedTime;
    (uniforms as any).uTemp.value = smoothFollow((uniforms as any).uTemp.value, temp01, 0.05);
    // レンダ
    gl.setRenderTarget(fbo);
    gl.clear();
    gl.render(scene, cam);
    gl.setRenderTarget(null);
  });

  return fbo.texture;
}

