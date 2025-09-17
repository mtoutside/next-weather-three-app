'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Pane } from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

type TweakpaneValue = string | number | boolean | [number, number, number];

interface TweakpanePanelProps {
  params?: Record<string, TweakpaneValue>;
  onParamsChange?: (params: Record<string, TweakpaneValue>) => void;
  title?: string;
  className?: string;
}

export default function TweakpanePanel({
  params = {},
  onParamsChange,
  title = 'Debug Panel',
  className = '',
}: TweakpanePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<Pane | null>(null);
  const paramsRef = useRef(params);

  const handleParamsChange = useCallback(() => {
    if (onParamsChange) {
      onParamsChange(paramsRef.current);
    }
  }, [onParamsChange]);

  useEffect(() => {
    if (!containerRef.current) return;

    paneRef.current = new Pane({
      container: containerRef.current,
      title,
    });

    paneRef.current.registerPlugin(EssentialsPlugin);

    return () => {
      if (paneRef.current) {
        paneRef.current.dispose();
        paneRef.current = null;
      }
    };
  }, [title]);

  useEffect(() => {
    if (!paneRef.current) return;

    paneRef.current.dispose();
    paneRef.current = new Pane({
      container: containerRef.current!,
      title,
    });

    paneRef.current.registerPlugin(EssentialsPlugin);
    paramsRef.current = { ...params };

    Object.entries(params).forEach(([key, value]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pane = paneRef.current as any;
      if (typeof value === 'number') {
        pane
          .addBinding(paramsRef.current, key, {
            min: typeof value === 'number' && value >= 0 ? 0 : value - 10,
            max: typeof value === 'number' && value >= 0 ? value + 10 : value + 10,
            step: 0.01,
          })
          .on('change', handleParamsChange);
      } else if (typeof value === 'boolean') {
        pane.addBinding(paramsRef.current, key).on('change', handleParamsChange);
      } else if (typeof value === 'string') {
        pane.addBinding(paramsRef.current, key).on('change', handleParamsChange);
      } else if (
        Array.isArray(value) &&
        value.length === 3 &&
        value.every((v) => typeof v === 'number')
      ) {
        pane
          .addBinding(paramsRef.current, key, {
            x: { min: -10, max: 10, step: 0.01 },
            y: { min: -10, max: 10, step: 0.01 },
            z: { min: -10, max: 10, step: 0.01 },
          })
          .on('change', handleParamsChange);
      }
    });
  }, [params, title, handleParamsChange]);

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
