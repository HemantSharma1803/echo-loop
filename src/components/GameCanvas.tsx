/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { GameEngine } from '../engine/gameEngine';
import { GameSettings, LevelConfig, LoopState, DebugInfo } from '../types/game';
import { ParadoxStatus } from '../types/innovation';

interface GameCanvasProps {
  engine: GameEngine;
  level: LevelConfig;
  settings: GameSettings;
  isPaused: boolean;
  onHUDUpdate: (data: {
    loopNumber: number;
    timeRemaining: number;
    totalLoopDuration: number;
    echoCount: number;
    loopState: LoopState;
    debugInfo: DebugInfo;
    innovationState?: {
      stability: number;
      paradoxStatus: ParadoxStatus;
      latestUnlockedClue?: string;
      discoveredMemoriesCount: number;
      resonatingNodesCount: number;
      synchronizedPairsCount: number;
    };
    echoRoles?: string[];
  }) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  engine,
  level,
  settings,
  isPaused,
  onHUDUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const onHUDUpdateRef = useRef(onHUDUpdate);

  useEffect(() => {
    onHUDUpdateRef.current = onHUDUpdate;
  }, [onHUDUpdate]);

  // Main rendering & physics tick
  const tick = useCallback(
    (now: number) => {
      const rawDt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      const dt = Math.min(rawDt, 0.08); // Clamp to avoid physics explosion on tab switches

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (!isPaused) {
            engine.update(dt);

            // Report HUD parameters
            const timeRemaining = engine.loopManager.getTimeRemaining();
            onHUDUpdateRef.current({
              loopNumber: engine.loopManager.getLoopNumber(),
              timeRemaining,
              totalLoopDuration: engine.loopManager.getLoopDuration(),
              echoCount: engine.echoManager.getEchoCount(),
              loopState: engine.loopManager.getState(),
              debugInfo: engine.getDebugInfo(),
              innovationState: engine.getInnovationState(),
              echoRoles: engine.echoManager.getEchoes().map((_, i) => engine.getEchoRole(i).badge),
            });
          }

          // Clear and render
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          engine.render(ctx, canvas.width, canvas.height);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(tick);
    },
    [engine, isPaused]
  );

  // Resize canvas according to container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const targetWidth = level.bounds.width;
      const targetHeight = level.bounds.height;
      const aspect = targetWidth / targetHeight;

      let displayW = rect.width;
      let displayH = displayW / aspect;

      if (displayH > rect.height) {
        displayH = rect.height;
        displayW = displayH * aspect;
      }

      canvas.style.width = `${displayW}px`;
      canvas.style.height = `${displayH}px`;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [level]);

  // Animation Loop lifecycle
  useEffect(() => {
    lastTimeRef.current = performance.now();
    animFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [tick]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-[#030508] overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="block shadow-2xl rounded-lg border border-slate-800/80 bg-[#080c14]"
      />

      {/* Optional CRT Scanlines Layer */}
      {settings.scanlines && (
        <div className="absolute inset-0 scanlines opacity-65 pointer-events-none" />
      )}
    </div>
  );
};
