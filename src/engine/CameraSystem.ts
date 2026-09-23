/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vector2D } from '../types/game';

export interface CameraFocusTarget {
  x: number;
  y: number;
  zoom: number;
  duration: number;
  remainingTime: number;
}

export class CameraSystem {
  public x = 0;
  public y = 0;
  public zoom = 1.0;
  public targetZoom = 1.0;

  private currentFocus: CameraFocusTarget | null = null;
  private shakeAmount = 0;

  constructor() {}

  public setFocus(x: number, y: number, zoom = 1.0, duration = 3.0) {
    this.currentFocus = {
      x,
      y,
      zoom,
      duration,
      remainingTime: duration,
    };
    this.targetZoom = zoom;
  }

  public clearFocus() {
    this.currentFocus = null;
    this.targetZoom = 1.0;
  }

  public applyShake(amount: number) {
    this.shakeAmount = Math.max(this.shakeAmount, amount);
  }

  public update(dt: number, playerPos: Vector2D, canvasWidth: number, canvasHeight: number) {
    // 1. Shake decay
    if (this.shakeAmount > 0) {
      this.shakeAmount = Math.max(0, this.shakeAmount - dt * 25);
    }

    // 2. Smooth zoom interpolation
    this.zoom += (this.targetZoom - this.zoom) * (dt * 4);

    // 3. Position interpolation
    let targetX = playerPos.x;
    let targetY = playerPos.y;

    if (this.currentFocus) {
      this.currentFocus.remainingTime -= dt;
      targetX = this.currentFocus.x;
      targetY = this.currentFocus.y;

      if (this.currentFocus.remainingTime <= 0) {
        this.clearFocus();
      }
    }

    // Lerp camera toward target
    const lerpSpeed = this.currentFocus ? 5.0 : 8.0;
    this.x += (targetX - this.x) * (dt * lerpSpeed);
    this.y += (targetY - this.y) * (dt * lerpSpeed);
  }

  public getShakeOffset(): Vector2D {
    if (this.shakeAmount <= 0) return { x: 0, y: 0 };
    return {
      x: (Math.random() - 0.5) * this.shakeAmount * 1.5,
      y: (Math.random() - 0.5) * this.shakeAmount * 1.5,
    };
  }
}
