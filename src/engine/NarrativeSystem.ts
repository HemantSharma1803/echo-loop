/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SubjectDesignation,
  AegisTransmission,
  MemoryFragment,
  UnknownEchoEntity,
  StoryProgressionState,
  NarrativeBeatId,
} from '../types/narrative';
import {
  MEMORY_FRAGMENTS,
  INITIAL_UNKNOWN_ECHOES,
  STORY_BEATS_TRANSMISSIONS,
} from './narrativeData';
import { soundManager } from '../audio/soundSystem';
import { ParticleSystem } from './particleSystem';

const STORAGE_KEY = 'echoloop_narrative_v1';

export class NarrativeSystem {
  private state: StoryProgressionState;
  private currentTransmission: AegisTransmission | null = null;
  private transmissionTimer = 0;
  private transmissionQueue: AegisTransmission[] = [];

  private activeFragment: MemoryFragment | null = null;
  private unknownEchoes: UnknownEchoEntity[] = [];
  private currentLevelId = 1;
  private particleSystem?: ParticleSystem;

  private onTransmissionChangeCallbacks: ((transmission: AegisTransmission | null) => void)[] = [];
  private onSubjectStatusChangeCallbacks: ((status: SubjectDesignation) => void)[] = [];
  private onMemoryFragmentUnlockedCallbacks: ((fragment: MemoryFragment) => void)[] = [];

  constructor(particleSystem?: ParticleSystem) {
    this.particleSystem = particleSystem;
    this.state = this.loadState();
    this.unknownEchoes = JSON.parse(JSON.stringify(INITIAL_UNKNOWN_ECHOES));
  }

  public setParticleSystem(particleSystem: ParticleSystem) {
    this.particleSystem = particleSystem;
  }

  // --- Persistence ---
  private loadState(): StoryProgressionState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback to default
    }

    return {
      subjectStatus: 'SUBJECT: UNKNOWN',
      completedBeats: [],
      discoveredFragments: [],
      discoveredLogs: [],
      seenUnknownEchoes: [],
      hasSeenOpeningCinematic: false,
      facilityPowerTier: 1,
    };
  }

  public saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore storage errors
    }
  }

  public resetAllProgress() {
    this.state = {
      subjectStatus: 'SUBJECT: UNKNOWN',
      completedBeats: [],
      discoveredFragments: [],
      discoveredLogs: [],
      seenUnknownEchoes: [],
      hasSeenOpeningCinematic: false,
      facilityPowerTier: 1,
    };
    this.unknownEchoes = JSON.parse(JSON.stringify(INITIAL_UNKNOWN_ECHOES));
    this.saveState();
    this.notifySubjectStatusChange();
  }

  // --- Callbacks & Subscriptions ---
  public onTransmissionChange(cb: (transmission: AegisTransmission | null) => void) {
    this.onTransmissionChangeCallbacks.push(cb);
    return () => {
      this.onTransmissionChangeCallbacks = this.onTransmissionChangeCallbacks.filter((listener) => listener !== cb);
    };
  }

  public onSubjectStatusChange(cb: (status: SubjectDesignation) => void) {
    this.onSubjectStatusChangeCallbacks.push(cb);
    return () => {
      this.onSubjectStatusChangeCallbacks = this.onSubjectStatusChangeCallbacks.filter((listener) => listener !== cb);
    };
  }

  public onMemoryFragmentUnlocked(cb: (fragment: MemoryFragment) => void) {
    this.onMemoryFragmentUnlockedCallbacks.push(cb);
    return () => {
      this.onMemoryFragmentUnlockedCallbacks = this.onMemoryFragmentUnlockedCallbacks.filter((listener) => listener !== cb);
    };
  }

  private notifySubjectStatusChange() {
    for (const cb of this.onSubjectStatusChangeCallbacks) {
      cb(this.state.subjectStatus);
    }
  }

  // --- State Getters ---
  public getSubjectStatus(): SubjectDesignation {
    return this.state.subjectStatus;
  }

  public getFacilityPowerTier(): 1 | 2 | 3 {
    return this.state.facilityPowerTier;
  }

  public getHasSeenOpeningCinematic(): boolean {
    return this.state.hasSeenOpeningCinematic;
  }

  public setHasSeenOpeningCinematic(seen: boolean) {
    this.state.hasSeenOpeningCinematic = seen;
    this.saveState();
  }

  public getCurrentTransmission(): AegisTransmission | null {
    return this.currentTransmission;
  }

  public getDiscoveredFragmentsCount(): number {
    return this.state.discoveredFragments.length;
  }

  public getTotalFragmentsCount(): number {
    return MEMORY_FRAGMENTS.length;
  }

  public getDiscoveredFragments(): MemoryFragment[] {
    return MEMORY_FRAGMENTS.map((frag) => ({
      ...frag,
      isDiscovered: this.state.discoveredFragments.includes(frag.id),
    }));
  }

  public isFragmentDiscovered(id: string): boolean {
    return this.state.discoveredFragments.includes(id);
  }

  public getActiveFragment(): MemoryFragment | null {
    return this.activeFragment;
  }

  public closeActiveFragment() {
    this.activeFragment = null;
  }

  // --- Transmission Queue & Dispatcher ---
  public dispatchTransmission(transmission: AegisTransmission) {
    // Avoid re-queuing duplicate identical transmission
    if (this.currentTransmission?.id === transmission.id) return;
    if (this.transmissionQueue.some((t) => t.id === transmission.id)) return;

    if (!this.currentTransmission) {
      this.currentTransmission = transmission;
      this.transmissionTimer = transmission.duration;
      soundManager.playAegisChime();
      for (const cb of this.onTransmissionChangeCallbacks) {
        cb(this.currentTransmission);
      }
    } else {
      this.transmissionQueue.push(transmission);
    }
  }

  // --- Level Lifecycle & Progression Triggers ---
  public onLevelLoaded(levelId: number) {
    this.currentLevelId = levelId;

    // Update facility power tier naturally based on narrative progression
    if (levelId <= 2) {
      this.state.facilityPowerTier = 1;
    } else if (levelId <= 4) {
      this.state.facilityPowerTier = 2;
    } else {
      this.state.facilityPowerTier = 3;
    }

    // Update subject recognition based on level
    if (levelId >= 4 && this.state.subjectStatus === 'SUBJECT: UNKNOWN') {
      this.state.subjectStatus = 'BIOMETRIC MATCH DETECTED...';
      this.notifySubjectStatusChange();
    }
    if (levelId >= 5 && this.state.subjectStatus !== 'SUBJECT 07') {
      this.state.subjectStatus = 'SUBJECT 07';
      this.notifySubjectStatusChange();
    }

    this.saveState();

    // Trigger level intro transmissions
    const startTransKey = `LEVEL_${levelId}_START`;
    if (STORY_BEATS_TRANSMISSIONS[startTransKey]) {
      this.dispatchTransmission(STORY_BEATS_TRANSMISSIONS[startTransKey]);
    }
  }

  public onLoopReset(loopNumber: number) {
    if (this.currentLevelId === 1 && loopNumber === 2) {
      this.dispatchTransmission(STORY_BEATS_TRANSMISSIONS.LEVEL_1_REWIND);
    }
  }

  public onBiometricTerminalVerified() {
    if (this.state.subjectStatus !== 'SUBJECT 07') {
      this.state.subjectStatus = 'SUBJECT 07';
      this.notifySubjectStatusChange();
      this.saveState();
    }
    this.dispatchTransmission(STORY_BEATS_TRANSMISSIONS.LEVEL_4_BIOMETRIC);
  }

  public onSecretCollected(secretId: string): MemoryFragment | null {
    const fragment = MEMORY_FRAGMENTS.find((f) => f.id === secretId);
    if (!fragment) return null;

    if (!this.state.discoveredFragments.includes(secretId)) {
      this.state.discoveredFragments.push(secretId);
      this.saveState();

      // Trigger memory flashback audio
      soundManager.playMemoryFlashback();

      const unlocked = { ...fragment, isDiscovered: true };
      this.activeFragment = unlocked;

      for (const cb of this.onMemoryFragmentUnlockedCallbacks) {
        cb(unlocked);
      }

      if (this.state.discoveredFragments.length >= 4) {
        import('./MasteryManager').then(({ masteryManager }) => {
          masteryManager.unlockAchievement('archivist');
        }).catch(() => {});
      }

      return unlocked;
    }

    return null;
  }

  // --- Main Tick Update ---
  public update(dt: number, playerPos: { x: number; y: number }) {
    // 1. Transmission Timer & Queue
    if (this.currentTransmission) {
      this.transmissionTimer -= dt;
      if (this.transmissionTimer <= 0) {
        if (this.transmissionQueue.length > 0) {
          this.currentTransmission = this.transmissionQueue.shift() || null;
          if (this.currentTransmission) {
            this.transmissionTimer = this.currentTransmission.duration;
            soundManager.playAegisChime();
          }
        } else {
          this.currentTransmission = null;
        }
        for (const cb of this.onTransmissionChangeCallbacks) {
          cb(this.currentTransmission);
        }
      }
    }

    // 2. Unknown Echo Proximity & Behavior
    const currentUnknownEcho = this.unknownEchoes.find(
      (e) => e.levelId === this.currentLevelId && e.state !== 'VANISHED'
    );

    if (currentUnknownEcho) {
      const dist = Math.hypot(playerPos.x - currentUnknownEcho.x, playerPos.y - currentUnknownEcho.y);
      currentUnknownEcho.distanceToPlayer = dist;

      if (currentUnknownEcho.state === 'OBSERVING') {
        if (dist <= currentUnknownEcho.vanishDistance) {
          currentUnknownEcho.state = 'FADING';
          soundManager.playUnknownEchoWhisper();

          if (!this.state.seenUnknownEchoes.includes(currentUnknownEcho.id)) {
            this.state.seenUnknownEchoes.push(currentUnknownEcho.id);
            this.saveState();
            // Unlock secret achievement for witnessing the Unknown Echo
            import('./MasteryManager')
              .then(({ masteryManager }) => {
                masteryManager.unlockAchievement('not-the-first');
              })
              .catch(() => {});
          }

          if (this.particleSystem) {
            this.particleSystem.emitSpark(
              { x: currentUnknownEcho.x, y: currentUnknownEcho.y },
              '#fb923c', // Amber tachyon ash
              22
            );
          }
        }
      } else if (currentUnknownEcho.state === 'FADING') {
        currentUnknownEcho.alpha -= dt * 1.8;
        if (currentUnknownEcho.alpha <= 0) {
          currentUnknownEcho.alpha = 0;
          currentUnknownEcho.state = 'VANISHED';
        }
      }
    }
  }

  // --- Unknown Echo Canvas Rendering ---
  public renderUnknownEcho(ctx: CanvasRenderingContext2D, ambientPulse: number) {
    const currentUnknownEcho = this.unknownEchoes.find(
      (e) => e.levelId === this.currentLevelId && e.state !== 'VANISHED'
    );

    if (!currentUnknownEcho || currentUnknownEcho.alpha <= 0.01) return;

    ctx.save();
    const { x, y, facing, alpha } = currentUnknownEcho;
    const pulse = Math.sin(ambientPulse * 6) * 0.15 + 0.85;

    ctx.globalAlpha = alpha * pulse;

    // 1. Ethereal Tachyon Amber Aura
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 16;

    // 2. Chromatic aberration ghost silhouettes
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)'; // Red shift
    ctx.beginPath();
    ctx.arc(x - 2, y, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(245, 158, 11, 0.6)'; // Amber shift
    ctx.beginPath();
    ctx.arc(x + 2, y, 14, 0, Math.PI * 2);
    ctx.fill();

    // 3. Central Operative Silhouette (Distorted & Inverted)
    ctx.fillStyle = '#1c1917';
    ctx.strokeStyle = '#fdba74';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Visor glowing slit
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x + (facing === 1 ? 2 : -8), y - 3, 6, 2.5);

    // 4. Glitchy Scanlines across entity
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.35)';
    ctx.lineWidth = 1;
    for (let i = -12; i <= 12; i += 4) {
      ctx.beginPath();
      ctx.moveTo(x - 12, y + i);
      ctx.lineTo(x + 12, y + i);
      ctx.stroke();
    }

    // 5. Overhead Label
    ctx.font = 'bold 9px "Orbitron", sans-serif';
    ctx.fillStyle = '#f97316';
    ctx.textAlign = 'center';
    ctx.fillText('UNKNOWN ECHO // [NO RECORD]', x, y - 22);

    ctx.restore();
  }
}
