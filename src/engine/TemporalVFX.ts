/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vector2D } from '../types/game';
import { soundManager } from '../audio/soundSystem';

export interface RippleWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  lineWidth: number;
  life: number;
  maxLife: number;
}

export interface PlayerTrailFrame {
  x: number;
  y: number;
  facing: 1 | -1;
  animTime: number;
  alpha: number;
}

export interface EchoGhostSnapshot {
  x: number;
  y: number;
  facing: 1 | -1;
  animFrame: number;
  age: number; // in seconds
  color: string;
}

export class TemporalVFX {
  // Ripple shockwaves
  private ripples: RippleWave[] = [];
  private maxRipples = 24;

  // Player trail buffer
  private playerTrail: PlayerTrailFrame[] = [];
  private lastPlayerTrailDrop = 0;

  // Echo ghost trail map: echoId -> EchoGhostSnapshot[]
  private echoGhosts: Map<string, EchoGhostSnapshot[]> = new Map();
  private lastEchoGhostDrop = 0;

  // Door animation states: doorId -> currentVisualProgress (0 = closed, 1 = open)
  private doorVisuals: Map<string, { progress: number; lockGlow: number }> = new Map();

  // Plate visual depression: plateId -> { depression: number (0 to 1), pulseTimer: number }
  private plateVisuals: Map<string, { depression: number; pulseTimer: number }> = new Map();

  // Reset Cinematic State
  public resetCinematicTimer = 0; // Counts up from 0 to resetCinematicDuration
  public resetCinematicDuration = 1.4; // 1.4 seconds
  public isResetCinematicActive = false;
  private onResetCinematicComplete?: () => void;
  private resetOrigin: Vector2D = { x: 400, y: 300 };

  // Graphics Quality mode ('high' | 'medium' | 'low')
  public quality: 'high' | 'medium' | 'low' = 'high';
  public reducedMotion = false;

  constructor() {
    this.loadQualitySettings();
  }

  private loadQualitySettings() {
    try {
      const raw = localStorage.getItem('echoloop_quality_cfg');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.quality) this.quality = parsed.quality;
        if (typeof parsed.reducedMotion === 'boolean') this.reducedMotion = parsed.reducedMotion;
      }
    } catch {
      // Ignore
    }
  }

  public setQuality(quality: 'high' | 'medium' | 'low', reducedMotion = false) {
    this.quality = quality;
    this.reducedMotion = reducedMotion;
    try {
      localStorage.setItem('echoloop_quality_cfg', JSON.stringify({ quality, reducedMotion }));
    } catch {
      // Ignore
    }
  }

  // --- TRIGGER LOOP RESET CINEMATIC ---
  public startLoopResetCinematic(origin: Vector2D, onComplete: () => void) {
    this.isResetCinematicActive = true;
    this.resetCinematicTimer = 0;
    this.resetOrigin = { ...origin };
    this.onResetCinematicComplete = onComplete;

    if (!this.reducedMotion) {
      soundManager.playLoopResetFreeze();
      setTimeout(() => {
        soundManager.playLoopResetImplosion();
      }, 300);
    } else {
      // Fast path for reduced motion
      setTimeout(() => {
        this.isResetCinematicActive = false;
        onComplete();
      }, 350);
    }
  }

  public spawnRipple(x: number, y: number, color = '#38bdf8', maxRadius = 48, duration = 0.5) {
    if (this.reducedMotion) return;
    if (this.ripples.length >= this.maxRipples) {
      this.ripples.shift();
    }
    this.ripples.push({
      x,
      y,
      radius: 4,
      maxRadius,
      color,
      lineWidth: 2,
      life: 0,
      maxLife: duration,
    });
  }

  public update(
    dt: number,
    playerPos: Vector2D,
    playerFacing: 1 | -1,
    playerAnimTime: number,
    playerMoving: boolean,
    echoes: { id: string; x: number; y: number; facing: 1 | -1; animFrame: number; theme: { primaryColor: string } }[]
  ) {
    // 1. Loop Reset Cinematic Update
    if (this.isResetCinematicActive) {
      this.resetCinematicTimer += dt;
      if (this.resetCinematicTimer >= this.resetCinematicDuration) {
        this.isResetCinematicActive = false;
        if (this.onResetCinematicComplete) {
          const cb = this.onResetCinematicComplete;
          this.onResetCinematicComplete = undefined;
          cb();
        }
      }
    }

    // 2. Ripple Waves Update
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.life += dt;
      const progress = r.life / r.maxLife;
      if (progress >= 1) {
        this.ripples.splice(i, 1);
        continue;
      }
      r.radius = 4 + progress * (r.maxRadius - 4);
      r.lineWidth = Math.max(0.5, 2.5 * (1 - progress));
    }

    // 3. Player Movement Trail Update
    const now = performance.now() / 1000;
    if (playerMoving && now - this.lastPlayerTrailDrop > 0.05 && this.quality !== 'low' && !this.reducedMotion) {
      this.lastPlayerTrailDrop = now;
      if (this.playerTrail.length >= 6) this.playerTrail.shift();
      this.playerTrail.push({
        x: playerPos.x,
        y: playerPos.y,
        facing: playerFacing,
        animTime: playerAnimTime,
        alpha: 0.35,
      });
    }

    // Fade player trail
    for (let i = this.playerTrail.length - 1; i >= 0; i--) {
      this.playerTrail[i].alpha -= dt * 2.5;
      if (this.playerTrail[i].alpha <= 0) {
        this.playerTrail.splice(i, 1);
      }
    }

    // 4. Echo Ghost Afterimages Update
    if (now - this.lastEchoGhostDrop > 0.08 && this.quality !== 'low') {
      this.lastEchoGhostDrop = now;
      for (const echo of echoes) {
        let ghostList = this.echoGhosts.get(echo.id);
        if (!ghostList) {
          ghostList = [];
          this.echoGhosts.set(echo.id, ghostList);
        }
        if (ghostList.length >= 5) ghostList.shift();
        ghostList.push({
          x: echo.x,
          y: echo.y,
          facing: echo.facing,
          animFrame: echo.animFrame,
          age: 0,
          color: echo.theme.primaryColor,
        });
      }
    }

    // Age and prune echo ghost snapshots
    this.echoGhosts.forEach((ghostList) => {
      for (let i = ghostList.length - 1; i >= 0; i--) {
        ghostList[i].age += dt;
        if (ghostList[i].age > 0.45) {
          ghostList.splice(i, 1);
        }
      }
    });
  }

  // --- INTERACTIVE OBJECT POLISH: PRESSURE PLATE ---
  public updatePlateVisual(plateId: string, isPressed: boolean, dt: number) {
    let state = this.plateVisuals.get(plateId);
    if (!state) {
      state = { depression: 0, pulseTimer: 0 };
      this.plateVisuals.set(plateId, state);
    }
    const target = isPressed ? 1 : 0;
    state.depression += (target - state.depression) * Math.min(1, dt * 14);
    if (isPressed) {
      state.pulseTimer += dt * 4;
    } else {
      state.pulseTimer = 0;
    }
  }

  public getPlateDepression(plateId: string): number {
    return this.plateVisuals.get(plateId)?.depression || 0;
  }

  // --- INTERACTIVE OBJECT POLISH: DOOR SLIDE ---
  public updateDoorVisual(doorId: string, isOpen: boolean, dt: number): number {
    let state = this.doorVisuals.get(doorId);
    if (!state) {
      state = { progress: isOpen ? 1 : 0, lockGlow: isOpen ? 1 : 0 };
      this.doorVisuals.set(doorId, state);
    }
    const target = isOpen ? 1 : 0;
    state.progress += (target - state.progress) * Math.min(1, dt * 8);
    state.lockGlow += (target - state.lockGlow) * Math.min(1, dt * 10);
    return state.progress;
  }

  public getDoorProgress(doorId: string): number {
    return this.doorVisuals.get(doorId)?.progress || 0;
  }

  // --- RENDER PASS: DISTANT FACILITY BACKGROUND ARCHITECTURE (Depth Layer 1) ---
  public renderFacilityBackgroundDepth(ctx: CanvasRenderingContext2D, width: number, height: number, ambientPulse: number) {
    ctx.save();

    // 1. Deep architectural sub-grid with metallic framing
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.lineWidth = 1;
    const colStep = 160;
    for (let x = 0; x <= width; x += colStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      // Atmospheric structural rivet markers
      ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
      for (let y = 40; y < height; y += 120) {
        ctx.fillRect(x - 2, y, 4, 4);
      }
    }

    // 2. High-bay structural overhead beams & conduits (silhouette)
    ctx.fillStyle = 'rgba(11, 18, 33, 0.55)';
    ctx.fillRect(0, 0, width, 18);
    ctx.fillRect(0, height - 18, width, 18);

    // 3. Faint high-voltage facility status conduits
    const pulseOffset = Math.sin(ambientPulse * 1.5) * 0.05 + 0.1;
    ctx.strokeStyle = `rgba(56, 189, 248, ${pulseOffset})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(20, 22);
    ctx.lineTo(width - 20, 22);
    ctx.stroke();

    ctx.restore();
  }

  // --- RENDER PASS: PLAYER MOTION TRAIL ---
  public renderPlayerTrail(
    ctx: CanvasRenderingContext2D,
    drawCharacterFn: (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      facing: 1 | -1,
      animTime: number,
      isMoving: boolean,
      suitColor: string,
      visorColor: string
    ) => void
  ) {
    if (this.quality === 'low' || this.reducedMotion) return;

    for (const frame of this.playerTrail) {
      ctx.save();
      ctx.globalAlpha = frame.alpha * 0.4;
      drawCharacterFn(
        ctx,
        frame.x,
        frame.y,
        frame.facing,
        frame.animTime,
        true,
        'rgba(2, 132, 199, 0.5)',
        'rgba(56, 189, 248, 0.8)'
      );
      ctx.restore();
    }
  }

  // --- RENDER PASS: ECHO GHOST AFTERIMAGES ---
  public renderEchoGhostTrails(
    ctx: CanvasRenderingContext2D,
    drawCharacterFn: (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      facing: 1 | -1,
      animTime: number,
      isMoving: boolean,
      suitColor: string,
      visorColor: string
    ) => void
  ) {
    if (this.quality === 'low' || this.reducedMotion) return;

    this.echoGhosts.forEach((ghostList) => {
      for (const ghost of ghostList) {
        ctx.save();
        const fade = Math.max(0, 1 - ghost.age / 0.45);
        ctx.globalAlpha = fade * 0.28;
        drawCharacterFn(
          ctx,
          ghost.x,
          ghost.y,
          ghost.facing,
          ghost.animFrame,
          true,
          ghost.color,
          ghost.color
        );
        ctx.restore();
      }
    });
  }

  // --- RENDER PASS: RIPPLE DISTORTION WAVES ---
  public renderRipples(ctx: CanvasRenderingContext2D) {
    if (this.ripples.length === 0) return;
    ctx.save();
    for (const r of this.ripples) {
      const progress = r.life / r.maxLife;
      const alpha = Math.max(0, 1 - progress);
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = alpha * 0.85;
      ctx.lineWidth = r.lineWidth;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- RENDER PASS: LOOP RESET CINEMATIC FX ---
  public renderLoopResetCinematic(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!this.isResetCinematicActive) return;

    ctx.save();
    const progress = Math.min(1, this.resetCinematicTimer / this.resetCinematicDuration);

    // Phase 1: 0.0 - 0.25 (Tachyon Freeze & Inward Radial Pulse)
    if (progress < 0.25) {
      const p1 = progress / 0.25;
      ctx.fillStyle = `rgba(14, 165, 233, ${p1 * 0.25})`;
      ctx.fillRect(0, 0, width, height);

      // Inward collapse guides
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      const ringRadius = (1 - p1) * (width * 0.5);
      ctx.beginPath();
      ctx.arc(this.resetOrigin.x, this.resetOrigin.y, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Phase 2: 0.25 - 0.65 (Gravitational Inward Collapse & Chromatic Jitter)
    else if (progress < 0.65) {
      const p2 = (progress - 0.25) / 0.4;
      // Dark vignette compression
      ctx.fillStyle = `rgba(3, 7, 18, ${0.45 + p2 * 0.45})`;
      ctx.fillRect(0, 0, width, height);

      // Fast converging concentric tachyon rings
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.5;
      for (let i = 1; i <= 3; i++) {
        const rad = Math.max(10, ((1 - p2) * width * 0.6 * i) / 3);
        ctx.beginPath();
        ctx.arc(this.resetOrigin.x, this.resetOrigin.y, rad, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Chromatic tear lines
      ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
      for (let s = 0; s < 4; s++) {
        const tearY = (s * height) / 4 + Math.sin(progress * 40 + s) * 20;
        ctx.fillRect(0, tearY, width, 2);
      }
    }
    // Phase 3: 0.65 - 0.85 (Tachyon Flash & Singularity Reset)
    else if (progress < 0.85) {
      const p3 = (progress - 0.65) / 0.2;
      const flashAlpha = Math.sin(p3 * Math.PI) * 0.8;
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = `rgba(6, 182, 212, ${flashAlpha * 0.5})`;
      ctx.fillRect(0, 0, width, height);
    }
    // Phase 4: 0.85 - 1.0 (Echo Emergence Wave)
    else {
      const p4 = (progress - 0.85) / 0.15;
      const outRadius = p4 * (width * 0.7);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 6 * (1 - p4);
      ctx.beginPath();
      ctx.arc(this.resetOrigin.x, this.resetOrigin.y, outRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
