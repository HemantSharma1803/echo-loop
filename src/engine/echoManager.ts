/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ActionTimeline, EchoInstance, EchoVisualTheme, Vector2D } from '../types/game';

// Visual themes for distinct temporal identities across multiple loops
const ECHO_THEMES: EchoVisualTheme[] = [
  {
    primaryColor: '#c084fc',
    accentColor: '#a855f7',
    trailColor: '#e9d5ff',
    opacity: 0.78,
    scanlineColor: 'rgba(168, 85, 247, 0.7)',
    label: 'ECHO//01',
  },
  {
    primaryColor: '#fbbf24',
    accentColor: '#f59e0b',
    trailColor: '#fef3c7',
    opacity: 0.74,
    scanlineColor: 'rgba(245, 158, 11, 0.7)',
    label: 'ECHO//02',
  },
  {
    primaryColor: '#34d399',
    accentColor: '#10b981',
    trailColor: '#a7f3d0',
    opacity: 0.70,
    scanlineColor: 'rgba(16, 185, 129, 0.7)',
    label: 'ECHO//03',
  },
  {
    primaryColor: '#fb7185',
    accentColor: '#f43f5e',
    trailColor: '#ffe4e6',
    opacity: 0.68,
    scanlineColor: 'rgba(244, 63, 94, 0.7)',
    label: 'ECHO//04',
  },
];

export class EchoManager {
  private echoes: EchoInstance[] = [];
  private maxEchoes = 4; // Configurable max simultaneous temporal echoes

  constructor(maxEchoes = 4) {
    this.maxEchoes = maxEchoes;
  }

  public clearAll() {
    this.echoes = [];
  }

  public addEcho(timeline: ActionTimeline): EchoInstance | null {
    if (!timeline.frames || timeline.frames.length === 0) return null;

    // If max echoes reached, purge oldest echo
    if (this.echoes.length >= this.maxEchoes) {
      this.echoes.shift();
    }

    const themeIndex = this.echoes.length % ECHO_THEMES.length;
    const theme = {
      ...ECHO_THEMES[themeIndex],
      label: `ECHO//0${this.echoes.length + 1}`,
    };

    const initial = timeline.frames[0];
    const echo: EchoInstance = {
      id: `echo-timeline-${timeline.loopIndex}-${Date.now()}`,
      loopNumber: timeline.loopIndex,
      timeline,
      currentFrameIndex: 0,
      x: initial.x,
      y: initial.y,
      vx: initial.vx,
      vy: initial.vy,
      facing: initial.facing,
      isMoving: initial.isMoving,
      isInteracting: initial.isInteracting,
      animFrame: initial.animFrame,
      spawnGlitchTimer: 0.65, // Materialization temporal glitch effect
      theme,
      isFinished: false,
    };

    this.echoes.push(echo);
    return echo;
  }

  public resetEchoesToStart() {
    for (const echo of this.echoes) {
      echo.currentFrameIndex = 0;
      echo.spawnGlitchTimer = 0.5;
      echo.isFinished = false;
      if (echo.timeline.frames.length > 0) {
        const first = echo.timeline.frames[0];
        echo.x = first.x;
        echo.y = first.y;
        echo.vx = first.vx;
        echo.vy = first.vy;
        echo.facing = first.facing;
        echo.isMoving = first.isMoving;
        echo.isInteracting = first.isInteracting;
        echo.animFrame = first.animFrame;
      }
    }
  }

  public update(currentLoopTime: number, dt: number) {
    for (const echo of this.echoes) {
      // Decay spawn glitch distortion
      if (echo.spawnGlitchTimer > 0) {
        echo.spawnGlitchTimer = Math.max(0, echo.spawnGlitchTimer - dt);
      }

      const frames = echo.timeline.frames;
      if (frames.length === 0) continue;

      // Find frame index closest to currentLoopTime
      while (
        echo.currentFrameIndex < frames.length - 1 &&
        frames[echo.currentFrameIndex + 1].t <= currentLoopTime
      ) {
        echo.currentFrameIndex++;
      }

      const curr = frames[echo.currentFrameIndex];
      const next = frames[echo.currentFrameIndex + 1];

      if (next && next.t > curr.t) {
        // Deterministic linear interpolation between recorded frames
        const span = next.t - curr.t;
        const progress = Math.min(1, Math.max(0, (currentLoopTime - curr.t) / span));

        echo.x = curr.x + (next.x - curr.x) * progress;
        echo.y = curr.y + (next.y - curr.y) * progress;
        echo.vx = curr.vx + (next.vx - curr.vx) * progress;
        echo.vy = curr.vy + (next.vy - curr.vy) * progress;
        echo.facing = curr.facing;
        echo.isMoving = curr.isMoving;
        echo.isInteracting = curr.isInteracting;
        echo.animFrame = curr.animFrame + (next.animFrame - curr.animFrame) * progress;
        echo.isFinished = false;
      } else {
        // Reached or surpassed end of recorded timeline!
        // The Echo maintains its final location and interaction state (e.g. continuing to depress a pressure plate)
        echo.x = curr.x;
        echo.y = curr.y;
        echo.vx = 0;
        echo.vy = 0;
        echo.facing = curr.facing;
        echo.isMoving = false;
        echo.isInteracting = curr.isInteracting;
        echo.animFrame = curr.animFrame;
        echo.isFinished = true;
      }
    }
  }

  public getEchoes(): EchoInstance[] {
    return this.echoes;
  }

  public getEchoCount(): number {
    return this.echoes.length;
  }

  public getAllPositions(): { id: string; pos: Vector2D; isInteracting: boolean; label: string }[] {
    return this.echoes.map((e) => ({
      id: e.id,
      pos: { x: e.x, y: e.y },
      isInteracting: e.isInteracting,
      label: e.theme.label,
    }));
  }
}
