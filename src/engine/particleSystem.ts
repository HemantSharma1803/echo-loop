/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Particle, Vector2D } from '../types/game';

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles = 300;

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Type-specific decay
      if (p.type === 'temporal' || p.type === 'glitch') {
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.alpha = 1 - (p.life / p.maxLife);
      } else if (p.type === 'ring') {
        p.size += dt * 35;
        p.alpha = Math.max(0, 1 - (p.life / p.maxLife));
      } else {
        p.alpha = Math.max(0, 1 - (p.life / p.maxLife));
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

      if (p.type === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'glitch') {
        ctx.fillStyle = p.color;
        const glitchW = p.size * (1 + Math.random() * 2);
        const glitchH = 2;
        ctx.fillRect(p.x - glitchW / 2, p.y - glitchH / 2, glitchW, glitchH);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // --- Particle Emitter Helpers ---

  public emitFootstep(pos: Vector2D) {
    if (this.particles.length >= this.maxParticles) return;
    this.particles.push({
      x: pos.x + (Math.random() - 0.5) * 6,
      y: pos.y + 12 + (Math.random() - 0.5) * 4,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 8,
      life: 0,
      maxLife: 0.35 + Math.random() * 0.2,
      color: '#38bdf8',
      size: 1.5 + Math.random() * 1.5,
      alpha: 0.4,
      type: 'footstep',
    });
  }

  public emitEchoTrail(pos: Vector2D, facing: 1 | -1) {
    if (this.particles.length >= this.maxParticles) return;
    const colors = ['#a855f7', '#c084fc', '#818cf8', '#38bdf8'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    this.particles.push({
      x: pos.x + (Math.random() - 0.5) * 10 - facing * 6,
      y: pos.y + (Math.random() - 0.5) * 16,
      vx: -facing * (10 + Math.random() * 15),
      vy: (Math.random() - 0.5) * 20,
      life: 0,
      maxLife: 0.4 + Math.random() * 0.3,
      color,
      size: 1.5 + Math.random() * 2,
      alpha: 0.7,
      type: 'temporal',
    });

    if (Math.random() < 0.35) {
      this.particles.push({
        x: pos.x + (Math.random() - 0.5) * 12,
        y: pos.y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 0,
        maxLife: 0.2,
        color: '#f43f5e',
        size: 3,
        alpha: 0.6,
        type: 'glitch',
      });
    }
  }

  public emitPlateRing(pos: Vector2D, color: string) {
    this.particles.push({
      x: pos.x,
      y: pos.y,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 0.6,
      color,
      size: 10,
      alpha: 0.8,
      type: 'ring',
    });
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.2;
      const speed = 25 + Math.random() * 30;
      this.particles.push({
        x: pos.x,
        y: pos.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.5,
        color,
        size: 1.5 + Math.random() * 1.5,
        alpha: 0.7,
        type: 'spark',
      });
    }
  }

  public emitTemporalCollapse(center: Vector2D) {
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 120;
      const speed = -(dist / 0.5); // Collapses inwards towards center
      this.particles.push({
        x: center.x + Math.cos(angle) * dist,
        y: center.y + Math.sin(angle) * dist,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.5,
        color: Math.random() > 0.5 ? '#a855f7' : '#06b6d4',
        size: 2 + Math.random() * 2.5,
        alpha: 0.8,
        type: 'temporal',
      });
    }
  }

  public emitLevelVictory(center: Vector2D) {
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      this.particles.push({
        x: center.x,
        y: center.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 1.0 + Math.random() * 0.5,
        color: ['#10b981', '#34d399', '#38bdf8', '#fbbf24'][Math.floor(Math.random() * 4)],
        size: 2 + Math.random() * 2,
        alpha: 0.9,
        type: 'spark',
      });
    }
  }

  public emitSpark(pos: Vector2D, color: string = '#c084fc', count: number = 3) {
    if (this.particles.length >= this.maxParticles) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 15 + Math.random() * 25;
      this.particles.push({
        x: pos.x,
        y: pos.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.2,
        color,
        size: 1.5 + Math.random() * 1.5,
        alpha: 0.8,
        type: 'spark',
      });
    }
  }

  public emitAmbientMote(width: number, height: number) {
    if (this.particles.length >= this.maxParticles) return;
    this.particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 8,
      vy: -5 - Math.random() * 10,
      life: 0,
      maxLife: 3 + Math.random() * 3,
      color: '#94a3b8',
      size: 1 + Math.random() * 1.5,
      alpha: 0.2 + Math.random() * 0.25,
      type: 'haze',
    });
  }

  public clear() {
    this.particles = [];
  }
}
