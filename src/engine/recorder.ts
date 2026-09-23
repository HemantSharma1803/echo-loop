/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerActionFrame, ActionEvent, ActionTimeline } from '../types/game';

export class ActionRecorder {
  private isRecording = false;
  private currentLoopIndex = 1;
  private frames: PlayerActionFrame[] = [];
  private events: ActionEvent[] = [];
  private lastRecordTime = -1;
  private readonly sampleInterval = 1 / 30; // 30Hz fixed interval sampling for deterministic temporal precision

  public startRecording(loopIndex: number) {
    this.isRecording = true;
    this.currentLoopIndex = loopIndex;
    this.frames = [];
    this.events = [];
    this.lastRecordTime = -1;
  }

  public recordState(
    timestamp: number,
    state: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      facing: 1 | -1;
      isMoving: boolean;
      isInteracting: boolean;
      animFrame: number;
    }
  ) {
    if (!this.isRecording) return;

    // Record on first frame, or when sample interval has elapsed, or on interaction state toggle
    const shouldSample =
      this.lastRecordTime < 0 ||
      timestamp - this.lastRecordTime >= this.sampleInterval ||
      (this.frames.length > 0 &&
        this.frames[this.frames.length - 1].isInteracting !== state.isInteracting);

    if (shouldSample) {
      this.frames.push({
        t: Number(timestamp.toFixed(4)),
        x: Number(state.x.toFixed(2)),
        y: Number(state.y.toFixed(2)),
        vx: Number(state.vx.toFixed(2)),
        vy: Number(state.vy.toFixed(2)),
        facing: state.facing,
        isMoving: state.isMoving,
        isInteracting: state.isInteracting,
        animFrame: Number(state.animFrame.toFixed(2)),
      });
      this.lastRecordTime = timestamp;
    }
  }

  public recordAction(timestamp: number, eventType: 'interact_start' | 'interact_end' | 'trigger', targetId?: string) {
    if (!this.isRecording) return;

    this.events.push({
      t: Number(timestamp.toFixed(4)),
      type: eventType,
      targetId,
    });
  }

  public stopRecording(duration: number): ActionTimeline {
    this.isRecording = false;

    // Ensure final state is captured at the very end of the duration so the Echo maintains its final pose/location
    if (this.frames.length > 0) {
      const last = this.frames[this.frames.length - 1];
      if (last.t < duration) {
        this.frames.push({
          ...last,
          t: Number(duration.toFixed(4)),
          vx: 0,
          vy: 0,
          isMoving: false,
        });
      }
    }

    return this.getRecording(duration);
  }

  public clearRecording() {
    this.isRecording = false;
    this.frames = [];
    this.events = [];
    this.lastRecordTime = -1;
  }

  public getRecording(duration?: number): ActionTimeline {
    const finalDuration = duration ?? (this.frames.length > 0 ? this.frames[this.frames.length - 1].t : 0);
    return {
      loopIndex: this.currentLoopIndex,
      frames: [...this.frames],
      events: [...this.events],
      duration: finalDuration,
    };
  }

  public getRecordedFrameCount(): number {
    return this.frames.length;
  }

  public isActive(): boolean {
    return this.isRecording;
  }
}
