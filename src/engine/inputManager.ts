/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vector2D } from '../types/game';

export class InputManager {
  private keys: Record<string, boolean> = {};
  private virtualMovement: Vector2D = { x: 0, y: 0 };
  private virtualAction = false;
  private virtualRewind = false;
  private virtualPause = false;

  private onPauseCallback?: () => void;
  private onRewindCallback?: () => void;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  public init(onPause?: () => void, onRewind?: () => void) {
    this.onPauseCallback = onPause;
    this.onRewindCallback = onRewind;
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  public destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown(e: KeyboardEvent) {
    // Prevent browser scrolling with arrow keys or space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    const key = e.key.toLowerCase();
    this.keys[key] = true;
    this.keys[e.key] = true;

    if (e.key === 'Escape' || key === 'p') {
      if (this.onPauseCallback) this.onPauseCallback();
    }

    if (key === 'r') {
      if (this.onRewindCallback) this.onRewindCallback();
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    this.keys[key] = false;
    this.keys[e.key] = false;
  }

  public setVirtualMovement(x: number, y: number) {
    this.virtualMovement = { x, y };
  }

  public setVirtualAction(pressed: boolean) {
    this.virtualAction = pressed;
  }

  public triggerVirtualRewind() {
    if (this.onRewindCallback) this.onRewindCallback();
  }

  public triggerVirtualPause() {
    if (this.onPauseCallback) this.onPauseCallback();
  }

  public getMovementVector(): Vector2D {
    let dx = 0;
    let dy = 0;

    if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
    if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) dx += 1;

    // Combine with virtual touch stick
    dx += this.virtualMovement.x;
    dy += this.virtualMovement.y;

    // Normalize diagonal speed
    const length = Math.hypot(dx, dy);
    if (length > 1) {
      dx /= length;
      dy /= length;
    }

    return { x: dx, y: dy };
  }

  public isInteracting(): boolean {
    return (
      !!(this.keys['e'] || this.keys[' '] || this.keys['enter']) ||
      this.virtualAction
    );
  }
}
