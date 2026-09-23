/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LoopState, ActionTimeline } from '../types/game';
import { ActionRecorder } from './recorder';
import { EchoManager } from './echoManager';
import { soundManager } from '../audio/soundSystem';

export interface LoopManagerCallbacks {
  onLoopStart?: (loopNumber: number) => void;
  onResetTransitionStart?: (isManual: boolean) => void;
  onLoopResetComplete?: (newLoopNumber: number, echoesCount: number) => void;
  onWarningTick?: () => void;
}

export class LoopManager {
  private state: LoopState = 'IDLE';
  private loopNumber = 1;
  private loopTimer = 0;
  private loopDuration = 12.0;

  // Transition & Collapse timing
  private transitionTimer = 0;
  private transitionDuration = 1.2; // Target 1.2s cinematic temporal rewind duration
  private hasTriggeredWarning = false;
  private isManualReset = false;

  private recorder: ActionRecorder;
  private echoManager: EchoManager;
  private callbacks: LoopManagerCallbacks;

  constructor(
    recorder: ActionRecorder,
    echoManager: EchoManager,
    callbacks: LoopManagerCallbacks = {}
  ) {
    this.recorder = recorder;
    this.echoManager = echoManager;
    this.callbacks = callbacks;
  }

  public setReducedMotion(reduced: boolean) {
    this.transitionDuration = reduced ? 0.35 : 1.2;
  }

  public setCallbacks(callbacks: LoopManagerCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public startLevel(initialLoopDuration: number) {
    this.loopDuration = initialLoopDuration;
    this.loopNumber = 1;
    this.loopTimer = 0;
    this.hasTriggeredWarning = false;
    this.isManualReset = false;

    this.recorder.clearRecording();
    this.echoManager.clearAll();

    this.startActiveLoop();
  }

  public startActiveLoop() {
    this.state = 'RECORDING';
    this.loopTimer = 0;
    this.hasTriggeredWarning = false;
    this.recorder.startRecording(this.loopNumber);
    this.echoManager.resetEchoesToStart();

    if (this.callbacks.onLoopStart) {
      this.callbacks.onLoopStart(this.loopNumber);
    }
  }

  public update(dt: number) {
    if (this.state === 'IDLE') return;

    if (this.state === 'ENDING' || this.state === 'RESETTING') {
      this.transitionTimer -= dt;
      if (this.transitionTimer <= 0) {
        this.finishResetSequence();
      }
      return;
    }

    if (this.state === 'RECORDING' || this.state === 'ACTIVE' || this.state === 'REPLAYING') {
      this.loopTimer += dt;

      // Warning pulse when loop approaches ending (< 3.0s)
      const timeLeft = this.loopDuration - this.loopTimer;
      if (timeLeft <= 3.0 && !this.hasTriggeredWarning) {
        this.hasTriggeredWarning = true;
        soundManager.playLoopWarning();
        if (this.callbacks.onWarningTick) {
          this.callbacks.onWarningTick();
        }
      } else if (timeLeft > 3.0) {
        this.hasTriggeredWarning = false;
      }

      // Replay all active Echoes up to current time
      this.echoManager.update(this.loopTimer, dt);

      // Natural loop completion when timer expires
      if (this.loopTimer >= this.loopDuration) {
        this.initiateResetSequence(false);
      }
    }
  }

  public triggerManualReset() {
    if (this.state === 'ENDING' || this.state === 'RESETTING') return;
    this.initiateResetSequence(true);
  }

  private initiateResetSequence(isManual: boolean) {
    this.isManualReset = isManual;
    this.state = isManual ? 'RESETTING' : 'ENDING';
    this.transitionTimer = this.transitionDuration;

    soundManager.playLoopReset();

    if (this.callbacks.onResetTransitionStart) {
      this.callbacks.onResetTransitionStart(isManual);
    }
  }

  private finishResetSequence() {
    if (!this.isManualReset) {
      // Natural loop completion: commit recording into an Echo
      const timeline: ActionTimeline = this.recorder.stopRecording(this.loopDuration);
      if (timeline.frames.length > 5) {
        this.echoManager.addEcho(timeline);
      }
      this.loopNumber++;
    } else {
      // Manual reset ([R] pressed): discard current unfinished recording, DO NOT corrupt previous Echoes!
      this.recorder.clearRecording();
      // Keep existing loopNumber and existing Echoes
    }

    // Reset world entities and echoes to loop beginning
    this.loopTimer = 0;
    this.hasTriggeredWarning = false;
    this.transitionTimer = 0;

    this.recorder.startRecording(this.loopNumber);
    this.echoManager.resetEchoesToStart();

    this.state = this.echoManager.getEchoCount() > 0 ? 'REPLAYING' : 'RECORDING';

    soundManager.playEchoSpawn();

    if (this.callbacks.onLoopResetComplete) {
      this.callbacks.onLoopResetComplete(this.loopNumber, this.echoManager.getEchoCount());
    }
  }

  // --- Getters ---
  public getState(): LoopState {
    return this.state;
  }

  public getLoopNumber(): number {
    return this.loopNumber;
  }

  public getLoopTimer(): number {
    return this.loopTimer;
  }

  public getLoopDuration(): number {
    return this.loopDuration;
  }

  public getTimeRemaining(): number {
    return Math.max(0, this.loopDuration - this.loopTimer);
  }

  public getTransitionProgress(): number {
    if (this.state !== 'ENDING' && this.state !== 'RESETTING') return 0;
    return Math.min(1, Math.max(0, 1 - this.transitionTimer / this.transitionDuration));
  }

  public isTransitioning(): boolean {
    return this.state === 'ENDING' || this.state === 'RESETTING';
  }
}
