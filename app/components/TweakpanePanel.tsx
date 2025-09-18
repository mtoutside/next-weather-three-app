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

      // 初期パラメータでバインディングを作成
      Object.entries(params).forEach(([key, value]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pane = paneRef.current as any;

        try {
          // カスタムオプション（セレクトボックス）がある場合
          if (customOptions[key]) {
            const options = customOptions[key].reduce(
              (acc, option) => {
                acc[option.text] = option.value;
                return acc;
              },
              {} as Record<string, number>,
            );

            const obj = { [key]: value };
            pane.addBinding(obj, key, { options }).on('change', (ev: { value: number }) => {
              if (onParamsChange) {
                onParamsChange({ ...params, [key]: ev.value });
              }
            });
          } else if (typeof value === 'number') {
            const obj = { [key]: value };
            pane
              .addBinding(obj, key, {
                min: 0,
                max: 1,
                step: 0.01,
              })
              .on('change', (ev: { value: number }) => {
                if (onParamsChange) {
                  onParamsChange({ ...params, [key]: ev.value });
                }
              });
          } else if (typeof value === 'boolean') {
            const obj = { [key]: value };
            pane.addBinding(obj, key).on('change', (ev: { value: boolean }) => {
              if (onParamsChange) {
                onParamsChange({ ...params, [key]: ev.value });
              }
            });
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
      }
    };
  }, []); // 空の依存配列で一度だけ実行

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
