/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vector2D, EchoInstance } from '../types/game';
import {
  TemporalMemoryObject,
  ResonanceNode,
  EchoSyncPair,
  EchoShadowZone,
  TemporalPhaseObject,
  TemporalAnomaly,
  ParadoxStatus,
  ParadoxConflict,
} from '../types/innovation';
import { TemporalMemory } from './temporalMemory';
import { ParticleSystem } from './particleSystem';
import { soundManager } from '../audio/soundSystem';

export interface InnovationStateUpdate {
  stability: number; // 0 to 100
  paradoxStatus: ParadoxStatus;
  activeConflicts: ParadoxConflict[];
  discoveredMemoriesCount: number;
  synchronizedPairsCount: number;
  resonatingNodesCount: number;
  latestUnlockedClue?: string;
}

export class InnovationSystem {
  public memoryObjects: TemporalMemoryObject[] = [];
  public resonanceNodes: ResonanceNode[] = [];
  public syncPairs: EchoSyncPair[] = [];
  public shadowZones: EchoShadowZone[] = [];
  public phaseObjects: TemporalPhaseObject[] = [];
  public anomalies: TemporalAnomaly[] = [];

  // Stability & Paradox
  public stability = 100; // 0 to 100
  public paradoxStatus: ParadoxStatus = 'STABLE';
  public activeConflicts: ParadoxConflict[] = [];

  private temporalMemory: TemporalMemory;
  private particleSystem: ParticleSystem;
  private pulseTimer = 0;
  private onShake?: (amt: number) => void;
  public latestUnlockedClue?: string;

  constructor(temporalMemory: TemporalMemory, particleSystem: ParticleSystem) {
    this.temporalMemory = temporalMemory;
    this.particleSystem = particleSystem;
  }

  public initFromLevel(levelData: {
    memoryObjects?: TemporalMemoryObject[];
    resonanceNodes?: ResonanceNode[];
    syncPairs?: EchoSyncPair[];
    shadowZones?: EchoShadowZone[];
    phaseObjects?: TemporalPhaseObject[];
    anomalies?: TemporalAnomaly[];
  }) {
    this.memoryObjects = JSON.parse(JSON.stringify(levelData.memoryObjects || []));
    this.resonanceNodes = JSON.parse(JSON.stringify(levelData.resonanceNodes || []));
    this.syncPairs = JSON.parse(JSON.stringify(levelData.syncPairs || []));
    this.shadowZones = JSON.parse(JSON.stringify(levelData.shadowZones || []));
    this.phaseObjects = JSON.parse(JSON.stringify(levelData.phaseObjects || []));
    this.anomalies = JSON.parse(JSON.stringify(levelData.anomalies || []));

    this.stability = 100;
    this.paradoxStatus = 'STABLE';
    this.activeConflicts = [];
    this.latestUnlockedClue = undefined;
  }

  public resetLoop() {
    // Reset loop-specific states while preserving memory discovery history
    this.stability = 100;
    this.paradoxStatus = 'STABLE';
    this.activeConflicts = [];

    for (const res of this.resonanceNodes) {
      if (res.state !== 'STABILIZED') {
        res.state = 'DORMANT';
        res.charge = 0;
        res.currentOccupants = 0;
      }
    }

    for (const sync of this.syncPairs) {
      sync.nodeA.occupied = false;
      sync.nodeB.occupied = false;
      sync.currentSyncTime = 0;
      sync.isSynchronized = false;
    }

    for (const shadow of this.shadowZones) {
      shadow.isEchoInside = false;
    }

    for (const phase of this.phaseObjects) {
      phase.currentPhase = 'PHASE_A';
      phase.transitionTimer = 0;
    }
  }

  public update(
    dt: number,
    currentLoopTime: number,
    currentLoopNumber: number,
    player: { pos: Vector2D; isMoving: boolean; isInteracting: boolean },
    echoes: EchoInstance[],
    onShake?: (amt: number) => void
  ): InnovationStateUpdate {
    this.onShake = onShake;
    this.pulseTimer += dt;

    // 1. Gather all physical participants
    const participants = [
      { id: 'player', pos: player.pos, isPlayer: true, isEcho: false, isInteracting: player.isInteracting },
      ...echoes.map((e) => ({
        id: e.id,
        pos: { x: e.x, y: e.y },
        isPlayer: false,
        isEcho: true,
        isInteracting: e.isInteracting,
      })),
    ];

    // 2. Update Temporal Memory Objects (Information survives the reset)
    this.updateMemoryObjects(dt, currentLoopNumber, currentLoopTime, player, echoes);

    // 3. Update Temporal Resonance Nodes
    this.updateResonanceNodes(dt, currentLoopNumber, participants);

    // 4. Update Echo Synchronization Pairs
    this.updateSynchronization(dt, currentLoopNumber, currentLoopTime, participants);

    // 5. Update Echo Shadow Zones
    this.updateShadowZones(dt, echoes);

    // 6. Update Temporal Phase Objects
    this.updatePhaseObjects(dt);

    // 7. Update Paradox Detection
    this.updateParadoxSystem(dt, currentLoopTime, currentLoopNumber, player, echoes);

    // 8. Update Temporal Anomalies
    this.updateAnomalies(dt, player.pos);

    return {
      stability: Math.round(this.stability),
      paradoxStatus: this.paradoxStatus,
      activeConflicts: [...this.activeConflicts],
      discoveredMemoriesCount: this.memoryObjects.filter((m) => m.isUnlocked).length,
      synchronizedPairsCount: this.syncPairs.filter((s) => s.isSynchronized).length,
      resonatingNodesCount: this.resonanceNodes.filter((r) => r.state === 'RESONATING' || r.state === 'STABILIZED').length,
      latestUnlockedClue: this.latestUnlockedClue,
    };
  }

  // --- 1. Memory Objects ---
  private updateMemoryObjects(
    dt: number,
    currentLoopNumber: number,
    timestamp: number,
    player: { pos: Vector2D; isInteracting: boolean },
    echoes: EchoInstance[]
  ) {
    for (const mem of this.memoryObjects) {
      const cx = mem.x + mem.width / 2;
      const cy = mem.y + mem.height / 2;
      const distPlayer = Math.hypot(player.pos.x - cx, player.pos.y - cy);
      const isPlayerNearby = distPlayer <= 48;

      // Check how many distinct loops have interacted with this memory console
      const interactionLoops = this.temporalMemory.getDistinctLoopsForObject(mem.id);
      mem.totalEchoInteractions = interactionLoops.filter((l) => l < currentLoopNumber).length;

      // Check clues unlocked by previous temporal loops
      let newlyUnlocked = false;
      for (const clue of mem.clues) {
        if (!clue.unlocked && mem.totalEchoInteractions >= clue.requiredInteractions) {
          clue.unlocked = true;
          newlyUnlocked = true;
          mem.isUnlocked = true;
          this.latestUnlockedClue = `${mem.title}: ${clue.title}`;
          soundManager.playMemoryDiscover();
          if (this.onShake) this.onShake(3);
        }
      }

      // Check player live interaction
      if (isPlayerNearby && (player.isInteracting || distPlayer <= 28)) {
        mem.activeInteraction = true;
        mem.interactionProgress = Math.min(1, mem.interactionProgress + dt * 1.8);
        if (mem.interactionProgress >= 1 && !mem.isUnlocked) {
          mem.isUnlocked = true;
          soundManager.playMemoryDiscover();
          this.temporalMemory.recordEvent({
            loopNumber: currentLoopNumber,
            timestamp,
            eventType: 'memory_read',
            position: { x: cx, y: cy },
            objectId: mem.id,
            actorType: 'PLAYER',
            actorId: 'player',
          });
        }
      } else {
        mem.activeInteraction = false;
        mem.interactionProgress = Math.max(0, mem.interactionProgress - dt * 1.5);
      }

      // Check if Echoes passed over this terminal during their recording
      for (const echo of echoes) {
        const dEcho = Math.hypot(echo.x - cx, echo.y - cy);
        if (dEcho <= 32) {
          this.temporalMemory.recordEvent({
            loopNumber: currentLoopNumber,
            timestamp,
            eventType: 'memory_read',
            position: { x: cx, y: cy },
            objectId: mem.id,
            actorType: 'ECHO',
            actorId: echo.id,
          });
        }
      }
    }
  }

  // --- 2. Temporal Resonance Nodes ---
  private updateResonanceNodes(
    dt: number,
    currentLoopNumber: number,
    participants: { id: string; pos: Vector2D; isPlayer: boolean; isEcho: boolean }[]
  ) {
    for (const res of this.resonanceNodes) {
      if (res.state === 'STABILIZED') continue;

      let occupants = 0;
      for (const p of participants) {
        const d = Math.hypot(p.pos.x - res.x, p.pos.y - res.y);
        if (d <= res.radius + 6) {
          occupants++;
        }
      }
      res.currentOccupants = occupants;

      // Track loop contribution history
      if (occupants > 0 && !res.loopsContributed.includes(currentLoopNumber)) {
        res.loopsContributed.push(currentLoopNumber);
      }

      if (occupants >= res.requiredSimultaneous || res.loopsContributed.length >= res.threshold) {
        // Charging or Resonating
        res.state = 'RESONATING';
        res.charge = Math.min(1, res.charge + dt * 0.7);

        if (Math.random() < 0.25) {
          soundManager.playResonanceCharge(res.charge);
          this.particleSystem.emitSpark({ x: res.x, y: res.y }, res.color, 4);
        }

        if (res.charge >= 1) {
          res.state = 'STABILIZED';
          soundManager.playResonanceStabilized();
          if (this.onShake) this.onShake(6);
          this.temporalMemory.recordEvent({
            loopNumber: currentLoopNumber,
            timestamp: 0,
            eventType: 'resonance_stabilize',
            position: { x: res.x, y: res.y },
            objectId: res.id,
            actorType: occupants > 1 ? 'ECHO' : 'PLAYER',
            actorId: 'resonance_core',
          });
        }
      } else if (occupants > 0) {
        res.state = 'CHARGING';
        res.charge = Math.min(0.7, res.charge + dt * 0.35);
      } else {
        res.state = res.charge > 0.1 ? 'CHARGING' : 'DORMANT';
        res.charge = Math.max(0, res.charge - dt * 0.25);
      }
    }
  }

  // --- 3. Echo Synchronization ---
  private updateSynchronization(
    dt: number,
    currentLoopNumber: number,
    timestamp: number,
    participants: { id: string; pos: Vector2D; isPlayer: boolean; isEcho: boolean }[]
  ) {
    for (const sync of this.syncPairs) {
      if (sync.isSynchronized) continue;

      // Check Node A
      let occA = false;
      let occB = false;

      for (const p of participants) {
        const dA = Math.hypot(p.pos.x - sync.nodeA.x, p.pos.y - sync.nodeA.y);
        if (dA <= sync.nodeA.radius + 6) {
          occA = true;
          sync.nodeA.actorType = p.isPlayer ? 'PLAYER' : 'ECHO';
        }
        const dB = Math.hypot(p.pos.x - sync.nodeB.x, p.pos.y - sync.nodeB.y);
        if (dB <= sync.nodeB.radius + 6) {
          occB = true;
          sync.nodeB.actorType = p.isPlayer ? 'PLAYER' : 'ECHO';
        }
      }

      sync.nodeA.occupied = occA;
      sync.nodeB.occupied = occB;

      // If both nodes are occupied concurrently or within the syncWindow
      if (occA && occB) {
        sync.currentSyncTime += dt;
        if (sync.currentSyncTime >= 0.45) {
          sync.isSynchronized = true;
          soundManager.playSyncSuccess();
          if (this.onShake) this.onShake(5);

          this.particleSystem.emitPlateRing({ x: sync.nodeA.x, y: sync.nodeA.y }, sync.color);
          this.particleSystem.emitPlateRing({ x: sync.nodeB.x, y: sync.nodeB.y }, sync.color);

          this.temporalMemory.recordEvent({
            loopNumber: currentLoopNumber,
            timestamp,
            eventType: 'sync_achieved',
            position: { x: sync.nodeA.x, y: sync.nodeA.y },
            objectId: sync.id,
            actorType: 'PLAYER',
            actorId: 'sync_pair',
          });
        }
      } else {
        sync.currentSyncTime = Math.max(0, sync.currentSyncTime - dt * 0.8);
      }
    }
  }

  // --- 4. Echo Shadow Zones ---
  private updateShadowZones(dt: number, echoes: EchoInstance[]) {
    for (const shadow of this.shadowZones) {
      let isEchoPresent = false;
      for (const echo of echoes) {
        if (
          echo.x >= shadow.x &&
          echo.x <= shadow.x + shadow.width &&
          echo.y >= shadow.y &&
          echo.y <= shadow.y + shadow.height
        ) {
          isEchoPresent = true;
          // Emit ethereal particles inside shadow zone
          if (Math.random() < 0.2) {
            this.particleSystem.emitSpark(
              { x: echo.x + (Math.random() - 0.5) * 16, y: echo.y + (Math.random() - 0.5) * 16 },
              '#a855f7',
              2
            );
          }
          break;
        }
      }
      shadow.isEchoInside = isEchoPresent;
    }
  }

  // --- 5. Temporal Phase Objects ---
  private updatePhaseObjects(dt: number) {
    for (const phase of this.phaseObjects) {
      // Check if controlled by a stabilized resonance node or sync pair
      let shouldShift = false;
      if (phase.controlledById) {
        const res = this.resonanceNodes.find((r) => r.id === phase.controlledById);
        if (res && (res.state === 'RESONATING' || res.state === 'STABILIZED')) {
          shouldShift = true;
        }
        const sync = this.syncPairs.find((s) => s.id === phase.controlledById);
        if (sync && sync.isSynchronized) {
          shouldShift = true;
        }
      }

      const targetPhase = shouldShift ? 'PHASE_B' : 'PHASE_A';
      if (phase.currentPhase !== targetPhase) {
        phase.currentPhase = targetPhase;
        soundManager.playPhaseShift();
      }

      phase.transitionTimer = Math.min(1, phase.transitionTimer + dt * 2);
    }
  }

  // --- 6. Paradox System ---
  private updateParadoxSystem(
    dt: number,
    currentLoopTime: number,
    currentLoopNumber: number,
    player: { pos: Vector2D },
    echoes: EchoInstance[]
  ) {
    // Check if player attempts to physically block an active Echo
    let hasSevereConflict = false;
    for (const echo of echoes) {
      const dist = Math.hypot(player.pos.x - echo.x, player.pos.y - echo.y);
      if (dist < 18 && echo.isMoving) {
        // Temporal interference: physical proximity collision with moving past self
        hasSevereConflict = true;
        if (this.stability > 50) {
          soundManager.playParadoxWarning();
        }
        this.stability = Math.max(35, this.stability - dt * 22);
        this.paradoxStatus = this.stability < 50 ? 'UNSTABLE' : 'DISTURBED';

        if (this.activeConflicts.length === 0) {
          this.activeConflicts.push({
            id: `conflict-${Date.now()}`,
            objectId: echo.id,
            description: 'TIMELINE INTERFERENCE: Physical collision with past Echo',
            severity: 0.7,
            timestamp: currentLoopTime,
            isResolved: false,
          });
        }
        break;
      }
    }

    if (!hasSevereConflict) {
      if (this.stability < 100) {
        this.stability = Math.min(100, this.stability + dt * 18);
        if (this.stability >= 98 && this.activeConflicts.length > 0) {
          this.activeConflicts = [];
          this.paradoxStatus = 'STABLE';
          soundManager.playParadoxStabilized();
        } else if (this.stability >= 80) {
          this.paradoxStatus = 'STABLE';
        } else if (this.stability >= 55) {
          this.paradoxStatus = 'DISTURBED';
        }
      }
    }
  }

  // --- 7. Temporal Anomalies ---
  private updateAnomalies(dt: number, playerPos: Vector2D) {
    for (const anom of this.anomalies) {
      anom.rotation += dt * 1.5;
      anom.pulseTimer += dt;
      const d = Math.hypot(playerPos.x - anom.x, playerPos.y - anom.y);
      if (d <= anom.radius + 12 && Math.random() < 0.08) {
        soundManager.playAnomalyPulse();
        this.particleSystem.emitSpark({ x: anom.x, y: anom.y }, '#38bdf8', 3);
      }
    }
  }

  // --- Collision Query for Phase Objects ---
  public isPhaseObjectBlocking(px: number, py: number, radius: number, isPlayer: boolean): boolean {
    for (const po of this.phaseObjects) {
      // If Phase A, solid to player
      if (po.currentPhase === 'PHASE_A' && !po.phaseAPermeable && isPlayer) {
        if (
          px + radius > po.x &&
          px - radius < po.x + po.width &&
          py + radius > po.y &&
          py - radius < po.y + po.height
        ) {
          return true;
        }
      }
      // If Phase C, impermeable only to Echoes
      if (po.currentPhase === 'PHASE_C' && !po.phaseCPermeable && !isPlayer) {
        if (
          px + radius > po.x &&
          px - radius < po.x + po.width &&
          py + radius > po.y &&
          py - radius < po.y + po.height
        ) {
          return true;
        }
      }
    }
    return false;
  }

  // --- Render Pass ---
  public render(ctx: CanvasRenderingContext2D, ambientPulse: number) {
    // 1. Render Echo Shadow Zones
    this.renderShadowZones(ctx, ambientPulse);

    // 2. Render Temporal Memory Objects
    this.renderMemoryObjects(ctx, ambientPulse);

    // 3. Render Temporal Resonance Nodes
    this.renderResonanceNodes(ctx, ambientPulse);

    // 4. Render Echo Synchronization Pairs
    this.renderSyncPairs(ctx, ambientPulse);

    // 5. Render Temporal Phase Objects
    this.renderPhaseObjects(ctx, ambientPulse);

    // 6. Render Temporal Anomalies
    this.renderAnomalies(ctx, ambientPulse);
  }

  private renderShadowZones(ctx: CanvasRenderingContext2D, ambientPulse: number) {
    for (const sz of this.shadowZones) {
      ctx.save();
      // Ethereal dark mist zone
      const grad = ctx.createRadialGradient(
        sz.x + sz.width / 2,
        sz.y + sz.height / 2,
        10,
        sz.x + sz.width / 2,
        sz.y + sz.height / 2,
        Math.max(sz.width, sz.height) / 1.5
      );
      grad.addColorStop(0, sz.isEchoInside ? 'rgba(126, 34, 206, 0.28)' : 'rgba(15, 23, 42, 0.45)');
      grad.addColorStop(1, 'rgba(2, 6, 23, 0.05)');

      ctx.fillStyle = grad;
      ctx.fillRect(sz.x, sz.y, sz.width, sz.height);

      ctx.strokeStyle = sz.isEchoInside ? 'rgba(192, 132, 252, 0.6)' : 'rgba(88, 28, 135, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.strokeRect(sz.x, sz.y, sz.width, sz.height);

      ctx.fillStyle = sz.isEchoInside ? '#e9d5ff' : '#9333ea';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText(`// SHADOW ZONE: ${sz.label}`, sz.x + 8, sz.y + 14);
      ctx.restore();
    }
  }

  private renderMemoryObjects(ctx: CanvasRenderingContext2D, ambientPulse: number) {
    for (const mem of this.memoryObjects) {
      ctx.save();
      const cx = mem.x + mem.width / 2;
      const cy = mem.y + mem.height / 2;

      // Pedestal base
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = mem.isUnlocked ? '#38bdf8' : '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(mem.x, mem.y, mem.width, mem.height, 6);
      ctx.fill();
      ctx.stroke();

      // Floating holographic memory glyph
      const hoverY = cy + Math.sin(this.pulseTimer * 3) * 4;
      ctx.fillStyle = mem.isUnlocked ? '#38bdf8' : '#94a3b8';
      ctx.shadowColor = mem.isUnlocked ? '#06b6d4' : '#475569';
      ctx.shadowBlur = mem.isUnlocked ? 12 : 4;

      ctx.beginPath();
      ctx.arc(cx, hoverY, 10, 0, Math.PI * 2);
      ctx.fill();

      // Hologram ring
      ctx.strokeStyle = mem.isUnlocked ? '#06b6d4' : '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, hoverY, 16, 8, this.pulseTimer, 0, Math.PI * 2);
      ctx.stroke();

      // Label & Status
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = mem.isUnlocked ? '#7dd3fc' : '#94a3b8';
      ctx.fillText(mem.label, cx, mem.y - 8);

      if (mem.totalEchoInteractions > 0) {
        ctx.fillStyle = '#c084fc';
        ctx.fillText(`[TRACES: ${mem.totalEchoInteractions}]`, cx, mem.y + mem.height + 12);
      }

      ctx.restore();
    }
  }

  private renderResonanceNodes(ctx: CanvasRenderingContext2D, ambientPulse: number) {
    for (const res of this.resonanceNodes) {
      ctx.save();
      const isResonating = res.state === 'RESONATING' || res.state === 'STABILIZED';

      // Concentric expanding resonance wave
      const waveRadius = res.radius + ((this.pulseTimer * 1.5) % 1) * 22;
      ctx.strokeStyle = isResonating ? res.color : 'rgba(100, 116, 139, 0.4)';
      ctx.lineWidth = isResonating ? 2 : 1;
      ctx.beginPath();
      ctx.arc(res.x, res.y, waveRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Central core
      ctx.fillStyle = isResonating ? res.color : '#1e293b';
      ctx.shadowColor = res.color;
      ctx.shadowBlur = isResonating ? 16 : 4;
      ctx.beginPath();
      ctx.arc(res.x, res.y, res.radius, 0, Math.PI * 2);
      ctx.fill();

      // Charge bar arc
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(res.x, res.y, res.radius + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * res.charge);
      ctx.stroke();

      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = isResonating ? '#f8fafc' : '#94a3b8';
      ctx.fillText(res.label, res.x, res.y + res.radius + 14);
      ctx.fillText(`${res.state} (${Math.round(res.charge * 100)}%)`, res.x, res.y + res.radius + 24);

      ctx.restore();
    }
  }

  private renderSyncPairs(ctx: CanvasRenderingContext2D, ambientPulse: number) {
    for (const sync of this.syncPairs) {
      ctx.save();
      // Render Node A & Node B
      [sync.nodeA, sync.nodeB].forEach((node) => {
        ctx.fillStyle = node.occupied ? sync.color : '#0f172a';
        ctx.strokeStyle = sync.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = node.occupied ? '#f8fafc' : '#94a3b8';
        ctx.fillText(node.label, node.x, node.y - 12);
      });

      // Synchronized energy conduit line connecting the two nodes
      ctx.strokeStyle = sync.isSynchronized ? sync.color : 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = sync.isSynchronized ? 3 : 1;
      ctx.setLineDash(sync.isSynchronized ? [] : [4, 4]);
      ctx.beginPath();
      ctx.moveTo(sync.nodeA.x, sync.nodeA.y);
      ctx.lineTo(sync.nodeB.x, sync.nodeB.y);
      ctx.stroke();

      if (sync.isSynchronized) {
        ctx.fillStyle = sync.color;
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SYNCHRONIZED', (sync.nodeA.x + sync.nodeB.x) / 2, (sync.nodeA.y + sync.nodeB.y) / 2 - 8);
      }

      ctx.restore();
    }
  }

  private renderPhaseObjects(ctx: CanvasRenderingContext2D, ambientPulse: number) {
    for (const phase of this.phaseObjects) {
      ctx.save();
      const isSpectral = phase.currentPhase === 'PHASE_B';

      ctx.fillStyle = isSpectral ? 'rgba(56, 189, 248, 0.22)' : 'rgba(30, 41, 59, 0.9)';
      ctx.strokeStyle = isSpectral ? '#38bdf8' : '#64748b';
      ctx.lineWidth = 2;
      ctx.setLineDash(isSpectral ? [4, 4] : []);

      ctx.beginPath();
      ctx.roundRect(phase.x, phase.y, phase.width, phase.height, 4);
      ctx.fill();
      ctx.stroke();

      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = isSpectral ? '#38bdf8' : '#94a3b8';
      ctx.fillText(
        `${phase.label} [${phase.currentPhase}]`,
        phase.x + phase.width / 2,
        phase.y + phase.height / 2 + 3
      );

      ctx.restore();
    }
  }

  private renderAnomalies(ctx: CanvasRenderingContext2D, ambientPulse: number) {
    for (const anom of this.anomalies) {
      ctx.save();
      ctx.translate(anom.x, anom.y);
      ctx.rotate(anom.rotation);

      // Rotating tachyon vortex blades
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(anom.radius, -4);
        ctx.lineTo(anom.radius * 0.7, 4);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }
}
