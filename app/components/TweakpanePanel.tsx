'use client';

import React, { useEffect, useRef } from 'react';
import { Pane } from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

type TweakpaneValue = string | number | boolean | [number, number, number];

interface TweakpanePanelProps {
  params?: Record<string, TweakpaneValue>;
  onParamsChange?: (params: Record<string, TweakpaneValue>) => void;
  title?: string;
  className?: string;
  customOptions?: Record<string, Array<{ text: string; value: number }>>;
}

export default function TweakpanePanel({
  params = {},
  onParamsChange,
  title = 'Debug Panel',
  className = '',
  customOptions = {},
}: TweakpanePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<Pane | null>(null);
  const isInitialized = useRef(false);
  const paneParamsRef = useRef<Record<string, TweakpaneValue>>({ ...params });
  const bindingsRef = useRef<Record<string, { value: TweakpaneValue } | undefined>>({});

  // 初期化を一度だけ実行
  useEffect(() => {
    if (!containerRef.current || isInitialized.current) return;

    try {
      // 新しいPaneを作成
      paneRef.current = new Pane({
        container: containerRef.current,
        title,
      });

      paneRef.current.registerPlugin(EssentialsPlugin);
      isInitialized.current = true;
      paneParamsRef.current = { ...params };

      // 初期パラメータでバインディングを作成
      Object.entries(params).forEach(([key, value]) => {
        const pane = paneRef.current as unknown as {
          addBinding: (
            target: Record<string, TweakpaneValue>,
            key: string,
            options?: unknown,
          ) => {
            value: TweakpaneValue;
            on: (event: string, handler: (ev: { value: TweakpaneValue }) => void) => unknown;
          } & { value: TweakpaneValue };
        };
        if (!pane) return;
        try {
          const bindingTarget = paneParamsRef.current;
          bindingTarget[key] = value;

          const handleChange = (newValue: TweakpaneValue) => {
            paneParamsRef.current[key] = newValue;
            if (onParamsChange) {
              onParamsChange({ ...paneParamsRef.current });
            }
          };

          // カスタムオプション（セレクトボックス）がある場合
          if (customOptions[key]) {
            const options = customOptions[key].reduce(
              (acc, option) => {
                acc[option.text] = option.value;
                return acc;
              },
              {} as Record<string, number>,
            );
            const binding = pane.addBinding(bindingTarget, key, { options }) as unknown as {
              value: TweakpaneValue;
              on: (event: string, handler: (ev: { value: number }) => void) => unknown;
            };
            bindingsRef.current[key] = binding as unknown as { value: TweakpaneValue };
            binding.on('change', (ev: { value: number }) => handleChange(ev.value));
          } else if (typeof value === 'number') {
            const binding = pane.addBinding(bindingTarget, key, {
              min: 0,
              max: 1,
              step: 0.01,
            }) as unknown as {
              value: TweakpaneValue;
              on: (event: string, handler: (ev: { value: number }) => void) => unknown;
            };
            bindingsRef.current[key] = binding as unknown as { value: TweakpaneValue };
            binding.on('change', (ev: { value: number }) => handleChange(ev.value));
          } else if (typeof value === 'boolean') {
            const binding = pane.addBinding(bindingTarget, key) as unknown as {
              value: TweakpaneValue;
              on: (event: string, handler: (ev: { value: boolean }) => void) => unknown;
            };
            bindingsRef.current[key] = binding as unknown as { value: TweakpaneValue };
            binding.on('change', (ev: { value: boolean }) => handleChange(ev.value));
          }
        } catch {
          // エラーは静かに無視
        }
      });
    } catch (e) {
      console.error('TweakPane: Failed to initialize:', e);
    }

    return () => {
      if (paneRef.current) {
        paneRef.current.dispose();
        paneRef.current = null;
        isInitialized.current = false;
        bindingsRef.current = {};
      }
    };
  }, []); // 空の依存配列で一度だけ実行

  // 外部から渡される params の変化をバインディングへ反映
  useEffect(() => {
    if (!paneRef.current) return;
    Object.entries(params).forEach(([key, value]) => {
      if (paneParamsRef.current[key] === value) return;
      paneParamsRef.current[key] = value;
      const binding = bindingsRef.current[key];
      if (binding) {
        binding.value = value as TweakpaneValue;
      }
    });
  }, [params]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        minWidth: '280px',
      }}
    />
  );
}
