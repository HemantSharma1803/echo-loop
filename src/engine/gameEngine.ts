/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelConfig, Vector2D, GameSettings, DebugInfo, LoopState, OptionalSecret } from '../types/game';
import { EchoHistoryEntry } from '../types/engagement';
import { ActionRecorder } from './recorder';
import { EchoManager } from './echoManager';
import { LoopManager } from './loopManager';
import { ParticleSystem } from './particleSystem';
import { InputManager } from './inputManager';
import { PuzzleSystem } from './puzzleSystem';
import { soundManager } from '../audio/soundSystem';
import { TemporalMemory } from './temporalMemory';
import { InnovationSystem } from './innovationSystem';
import { EchoRoleAnalysis } from '../types/innovation';
import { NarrativeSystem } from './NarrativeSystem';
import { CameraSystem } from './CameraSystem';
import { TemporalVFX } from './TemporalVFX';

export class GameEngine {
  private level: LevelConfig;
  public recorder: ActionRecorder;
  public echoManager: EchoManager;
  public loopManager: LoopManager;
  public particleSystem: ParticleSystem;
  public puzzleSystem: PuzzleSystem;
  public temporalMemory: TemporalMemory;
  public innovationSystem: InnovationSystem;
  public narrativeSystem: NarrativeSystem;
  public cameraSystem: CameraSystem;
  public temporalVFX: TemporalVFX;
  private inputManager: InputManager;
  private onSecretDiscoveredCallback?: (secret: OptionalSecret) => void;
  private level1AhaTriggered = false;

  // Player state
  public playerPos: Vector2D;
  public playerVel: Vector2D = { x: 0, y: 0 };
  public playerFacing: 1 | -1 = 1;
  public playerMoving = false;
  public playerAnimTime = 0;
  private footstepTimer = 0;

  // Camera & Screen FX
  public screenShake = 0;
  public ambientPulse = 0;

  // Performance & Debug tracking
  private frameCount = 0;
  private lastFpsCalcTime = performance.now();
  public currentFps = 60;

  // Callbacks
  private onLevelCompleteCallback?: () => void;

  // Segment 8: Engagement, Replay & Mastery Tracking
  public currentLoopResetsCount = 0;
  public totalResetsInSector = 0;
  public levelStartTime = performance.now();
  public playerPathLog: { x: number; y: number }[] = [];
  public bestRunGhostPath: { x: number; y: number }[] | null = null;
  public isReplayMode = false;
  public isTimeTrialMode = false;

  // Settings reference
  private settings: GameSettings = {
    masterVolume: 0.8,
    sfxVolume: 0.8,
    musicVolume: 0.6,
    screenShake: true,
    scanlines: true,
    touchControls: 'auto',
    showDebugOverlay: false,
  };

  constructor(
    level: LevelConfig,
    inputManager: InputManager,
    settings?: Partial<GameSettings>
  ) {
    this.level = JSON.parse(JSON.stringify(level));
    this.inputManager = inputManager;
    this.recorder = new ActionRecorder();
    this.echoManager = new EchoManager(4); // Up to 4 distinct temporal echoes
    this.particleSystem = new ParticleSystem();
    this.puzzleSystem = new PuzzleSystem(this.particleSystem);
    this.puzzleSystem.initFromLevel(this.level);
    this.temporalMemory = new TemporalMemory();
    this.innovationSystem = new InnovationSystem(this.temporalMemory, this.particleSystem);
    this.innovationSystem.initFromLevel(this.level);
    this.narrativeSystem = new NarrativeSystem(this.particleSystem);
    this.cameraSystem = new CameraSystem();
    this.temporalVFX = new TemporalVFX();
    this.playerPos = { ...this.level.playerSpawn };

    if (settings) {
      this.settings = { ...this.settings, ...settings };
      this.temporalVFX.setQuality(this.settings.graphicsQuality || 'high', !!this.settings.reducedMotion);
    }

    // Initialize LoopManager with callbacks
    this.loopManager = new LoopManager(this.recorder, this.echoManager, {
      onResetTransitionStart: (isManual) => {
        if (this.settings.screenShake && !this.settings.reducedMotion) {
          this.screenShake = isManual ? 10 : 16;
        }
        this.particleSystem.emitTemporalCollapse(this.playerPos);
      },
      onLoopResetComplete: () => {
        // Reset player to spawn point
        this.playerPos = { ...this.level.playerSpawn };
        this.playerVel = { x: 0, y: 0 };
        this.playerMoving = false;
        // Reset interactive objects (plates, doors) to default unpressed state
        this.resetWorldObjects();
        this.narrativeSystem.onLoopReset(this.loopManager.getLoopNumber());
      },
    });

    if (this.settings.reducedMotion) {
      this.loopManager.setReducedMotion(true);
    }

    this.narrativeSystem.onLevelLoaded(this.level.id);
    this.loopManager.startLevel(this.level.loopDuration);
  }

  public setOnLevelComplete(callback: () => void) {
    this.onLevelCompleteCallback = callback;
  }

  public setOnSecretDiscovered(callback: (secret: OptionalSecret) => void) {
    this.onSecretDiscoveredCallback = callback;
  }

  public updateSettings(settings: Partial<GameSettings>) {
    this.settings = { ...this.settings, ...settings };
    if (settings.graphicsQuality !== undefined || settings.reducedMotion !== undefined) {
      this.temporalVFX.setQuality(this.settings.graphicsQuality || 'high', !!this.settings.reducedMotion);
    }
    if (settings.reducedMotion !== undefined) {
      this.loopManager.setReducedMotion(settings.reducedMotion);
    }
  }

  public resetLevel(level: LevelConfig, isReplay = false, isTimeTrial = false) {
    this.level = JSON.parse(JSON.stringify(level));
    this.isReplayMode = isReplay;
    this.isTimeTrialMode = isTimeTrial;
    this.currentLoopResetsCount = 0;
    this.totalResetsInSector = 0;
    this.levelStartTime = performance.now();
    this.playerPathLog = [{ ...this.level.playerSpawn }];
    this.puzzleSystem.initFromLevel(this.level);
    this.temporalMemory.clearLevelHistory();
    this.innovationSystem.initFromLevel(this.level);
    this.playerPos = { ...this.level.playerSpawn };
    this.playerVel = { x: 0, y: 0 };
    this.playerMoving = false;
    this.screenShake = 0;
    this.particleSystem.clear();
    this.resetWorldObjects();
    this.level1AhaTriggered = false;
    this.narrativeSystem.onLevelLoaded(this.level.id);

    // Start fresh loop with zero echoes
    this.loopManager.startLevel(this.level.loopDuration);
  }

  public setBestRunGhostPath(path: { x: number; y: number }[] | null) {
    this.bestRunGhostPath = path;
  }

  public triggerManualLoopReset() {
    if (this.loopManager.isTransitioning()) return false;
    this.currentLoopResetsCount++;
    this.totalResetsInSector++;
    this.loopManager.triggerManualReset();
    return true;
  }

  private resetWorldObjects() {
    this.puzzleSystem.reset();
    this.innovationSystem.resetLoop();
  }

  // --- Main Tick Update ---
  public update(dt: number) {
    this.ambientPulse += dt;
    this.updateFps();

    // Decay screen shake
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Advance LoopManager (handles timer, transition, echo replay update, and loop reset)
    this.loopManager.update(dt);

    // If currently collapsing / resetting, only update particle decay and return
    if (this.loopManager.isTransitioning()) {
      this.particleSystem.update(dt);
      return;
    }

    // 1. Player Input & Movement
    const moveInput = this.inputManager.getMovementVector();
    const isInteracting = this.inputManager.isInteracting();
    const playerSpeed = 195;

    this.playerVel.x = moveInput.x * playerSpeed;
    this.playerVel.y = moveInput.y * playerSpeed;

    this.playerMoving = Math.hypot(this.playerVel.x, this.playerVel.y) > 5;
    if (this.playerMoving) {
      this.playerAnimTime += dt * 9;
      if (moveInput.x > 0.05) this.playerFacing = 1;
      else if (moveInput.x < -0.05) this.playerFacing = -1;

      this.footstepTimer += dt;
      if (this.footstepTimer > 0.32) {
        this.footstepTimer = 0;
        soundManager.playFootstep();
        this.particleSystem.emitFootstep(this.playerPos);
      }
    } else {
      this.footstepTimer = 0.25;
    }

    // 2. Smooth Independent Axis Collision
    const nextX = this.playerPos.x + this.playerVel.x * dt;
    if (!this.checkWallCollision(nextX, this.playerPos.y)) {
      this.playerPos.x = nextX;
    }
    const nextY = this.playerPos.y + this.playerVel.y * dt;
    if (!this.checkWallCollision(this.playerPos.x, nextY)) {
      this.playerPos.y = nextY;
    }

    // Bounds constraint
    const pRadius = 14;
    this.playerPos.x = Math.max(pRadius + 30, Math.min(this.level.bounds.width - pRadius - 30, this.playerPos.x));
    this.playerPos.y = Math.max(pRadius + 30, Math.min(this.level.bounds.height - pRadius - 30, this.playerPos.y));

    // Sample player position periodically (every ~0.15s) for run summary and ghost record
    if (this.playerMoving && Math.random() < 0.18) {
      const lastPoint = this.playerPathLog[this.playerPathLog.length - 1];
      if (!lastPoint || Math.hypot(this.playerPos.x - lastPoint.x, this.playerPos.y - lastPoint.y) > 15) {
        this.playerPathLog.push({ x: Math.round(this.playerPos.x), y: Math.round(this.playerPos.y) });
        if (this.playerPathLog.length > 200) {
          this.playerPathLog.shift();
        }
      }
    }

    // 3. Record Current Player State into ActionRecorder
    this.recorder.recordState(this.loopManager.getLoopTimer(), {
      x: this.playerPos.x,
      y: this.playerPos.y,
      vx: this.playerVel.x,
      vy: this.playerVel.y,
      facing: this.playerFacing,
      isMoving: this.playerMoving,
      isInteracting,
      animFrame: this.playerAnimTime,
    });

    // 4. Emit trailing particles for active Echoes
    const echoes = this.echoManager.getEchoes();
    for (const echo of echoes) {
      if (echo.isMoving && Math.random() < 0.45) {
        this.particleSystem.emitEchoTrail({ x: echo.x, y: echo.y }, echo.facing);
      }
    }

    // 5. Environmental & Puzzle Physics (Plates & Doors)
    this.updatePuzzles(dt);

    // 5b. Update Temporal VFX (Ripples, trails, ghost snapshots, plates, doors)
    this.temporalVFX.update(
      dt,
      this.playerPos,
      this.playerFacing,
      this.playerAnimTime,
      this.playerMoving,
      echoes.map((e) => ({
        id: e.id,
        x: e.x,
        y: e.y,
        facing: e.facing,
        animFrame: e.animFrame,
        theme: e.theme,
      }))
    );

    for (const plate of this.puzzleSystem.plates) {
      this.temporalVFX.updatePlateVisual(plate.id, plate.isPressed, dt);
    }
    for (const door of this.puzzleSystem.doors) {
      this.temporalVFX.updateDoorVisual(door.id, door.isOpen, dt);
    }

    // 5c. Narrative System & Camera Update
    this.narrativeSystem.update(dt, this.playerPos);
    this.cameraSystem.update(dt, this.playerPos, this.level.bounds.width, this.level.bounds.height);

    // 6. Check Victory Condition
    this.checkVictoryCondition();

    // 7. Particle System Update
    this.particleSystem.update(dt);
    if (Math.random() < 0.12) {
      this.particleSystem.emitAmbientMote(this.level.bounds.width, this.level.bounds.height);
    }
  }

  private renderEnvironmentalStoryDecals(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // 1. Facility Floor Stencil
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.font = 'bold 22px "Orbitron", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('AEGIS TEMPORAL // ATRF-01', 60, 80);

    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.16)';
    ctx.fillText('SUB-SECTOR 01: RECURSIVE FIELD LABS // CAUTION: TACHYON FLUX', 60, 98);

    // 2. Hazard striped floor threshold near player spawn
    const spawn = this.level.playerSpawn;
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.18)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(spawn.x - 30, spawn.y - 30, 60, 60);
    ctx.setLineDash([]);

    // 3. Level-specific environmental narrative details
    if (this.level.id === 1) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
      ctx.font = '9px monospace';
      ctx.fillText('PRIMARY IMMERSION TANK [SEALED]', spawn.x - 60, spawn.y - 38);
    } else if (this.level.id === 4) {
      // Security sector warning
      ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('WARNING: TACHYON FILTER ACTIVE // ENTITY DISCRIMINATION ON', 380, 80);
    } else if (this.level.id === 5) {
      // Resonance core warning
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(420, 300, 75, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(192, 132, 252, 0.25)';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('HARMONIC ACCUMULATION ZONE', 420, 390);
    } else if (this.level.id === 6) {
      // Climax core chamber markings
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.font = 'bold 11px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CONTAINMENT MONOLITH // THREE CONCURRENT TIMELINES REQUIRED', 480, 80);
    }

    ctx.restore();
  }

  // --- Collision Detection ---
  private checkWallCollision(x: number, y: number): boolean {
    const pRadius = 13;

    // Check level obstacles
    for (const obs of this.level.obstacles) {
      if (
        x + pRadius > obs.x &&
        x - pRadius < obs.x + obs.width &&
        y + pRadius > obs.y &&
        y - pRadius < obs.y + obs.height
      ) {
        return true;
      }
    }

    // Check doors in puzzle system (solid if not fully open)
    for (const door of this.puzzleSystem.doors) {
      if (door.openProgress < 0.85) {
        if (
          x + pRadius > door.x &&
          x - pRadius < door.x + door.width &&
          y + pRadius > door.y &&
          y - pRadius < door.y + door.height
        ) {
          return true;
        }
      }
    }

    // Check energy barriers in puzzle system (solid if active)
    for (const barrier of this.puzzleSystem.barriers) {
      if (barrier.isActive) {
        const dist = this.distPointToSegment(x, y, barrier.x1, barrier.y1, barrier.x2, barrier.y2);
        if (dist < barrier.thickness + pRadius) {
          return true;
        }
      }
    }

    // Check innovation phase objects (solid if Phase A/impermeable)
    if (this.innovationSystem.isPhaseObjectBlocking(x, y, pRadius, true)) {
      return true;
    }

    return false;
  }

  private distPointToSegment(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  // --- Puzzle & Mechanical Logic ---
  private updatePuzzles(dt: number) {
    const echoes = this.echoManager.getEchoes();
    const currLoop = this.loopManager.getLoopNumber();
    const currTime = this.loopManager.getLoopTimer();

    this.puzzleSystem.update(
      dt,
      {
        pos: this.playerPos,
        isMoving: this.playerMoving,
        isInteracting: this.inputManager.isInteracting(),
      },
      echoes,
      (shakeAmt) => {
        if (this.settings.screenShake) {
          this.screenShake = shakeAmt;
        }
      }
    );

    // Update Innovation System (Temporal Memory, Resonance, Sync, Shadows, Phases, Paradox)
    this.innovationSystem.update(
      dt,
      currTime,
      currLoop,
      {
        pos: this.playerPos,
        isMoving: this.playerMoving,
        isInteracting: this.inputManager.isInteracting(),
      },
      echoes,
      (shakeAmt) => {
        if (this.settings.screenShake) {
          this.screenShake = shakeAmt;
        }
      }
    );

    // Level 1 "Aha!" realization reward check
    if (this.level.id === 1 && !this.level1AhaTriggered) {
      const plate = this.puzzleSystem.plates[0];
      if (plate && plate.isPressed) {
        const playerOnPlate =
          this.playerPos.x >= plate.x &&
          this.playerPos.x <= plate.x + plate.width &&
          this.playerPos.y >= plate.y &&
          this.playerPos.y <= plate.y + plate.height;
        if (!playerOnPlate && echoes.length > 0) {
          this.level1AhaTriggered = true;
          soundManager.playEchoSpawn();
          this.particleSystem.emitSpark(
            { x: plate.x + plate.width / 2, y: plate.y + plate.height / 2 },
            '#06b6d4',
            24
          );
        }
      }
    }

    // Optional Secrets Discovery Check
    if (this.level.optionalSecrets) {
      for (const secret of this.level.optionalSecrets) {
        if (!secret.isDiscovered) {
          const dist = Math.hypot(this.playerPos.x - secret.x, this.playerPos.y - secret.y);
          if (dist < secret.radius + 16) {
            secret.isDiscovered = true;
            soundManager.playSwitchToggle(true);
            this.particleSystem.emitSpark({ x: secret.x, y: secret.y }, '#38bdf8', 18);
            this.narrativeSystem.onSecretCollected(secret.id);
            if (this.onSecretDiscoveredCallback) {
              this.onSecretDiscoveredCallback(secret);
            }
          }
        }
      }
    }

    // Apply innovation triggers to connected puzzle doors / barriers
    for (const res of this.innovationSystem.resonanceNodes) {
      if (res.state === 'RESONATING' || res.state === 'STABILIZED') {
        const d = this.puzzleSystem.doors.find((door) => door.id === res.connectsToId);
        if (d) d.isOpen = true;
        const b = this.puzzleSystem.barriers.find((bar) => bar.id === res.connectsToId);
        if (b) b.isActive = false;
      }
    }

    for (const sync of this.innovationSystem.syncPairs) {
      if (sync.isSynchronized) {
        const d = this.puzzleSystem.doors.find((door) => door.id === sync.connectsToId);
        if (d) d.isOpen = true;
        const b = this.puzzleSystem.barriers.find((bar) => bar.id === sync.connectsToId);
        if (b) b.isActive = false;
      }
    }

    // Record plate occupancy events into temporalMemory
    for (const plate of this.puzzleSystem.plates) {
      if (plate.isPressed) {
        this.temporalMemory.recordEvent({
          loopNumber: currLoop,
          timestamp: currTime,
          eventType: 'plate_press',
          position: { x: plate.x + plate.width / 2, y: plate.y + plate.height / 2 },
          objectId: plate.id,
          actorType: 'PLAYER',
          actorId: 'player',
        });
      }
    }
  }

  // --- Victory Check ---
  private checkVictoryCondition() {
    const exitDist = Math.hypot(
      this.playerPos.x - this.level.exitPoint.x,
      this.playerPos.y - this.level.exitPoint.y
    );

    if (exitDist < 38) {
      soundManager.playLevelComplete();
      this.particleSystem.emitLevelVictory(this.level.exitPoint);
      if (this.onLevelCompleteCallback) {
        this.onLevelCompleteCallback();
      }
    }
  }

  public getInnovationState() {
    return {
      stability: this.innovationSystem.stability,
      paradoxStatus: this.innovationSystem.paradoxStatus,
      activeConflicts: this.innovationSystem.activeConflicts,
      discoveredMemoriesCount: this.innovationSystem.memoryObjects.filter((m) => m.isUnlocked).length,
      latestUnlockedClue: this.innovationSystem.latestUnlockedClue,
      resonatingNodesCount: this.innovationSystem.resonanceNodes.filter((r) => r.state === 'RESONATING' || r.state === 'STABILIZED').length,
      synchronizedPairsCount: this.innovationSystem.syncPairs.filter((s) => s.isSynchronized).length,
    };
  }

  public getEchoRole(index: number): EchoRoleAnalysis {
    const echoes = this.echoManager.getEchoes();
    if (index < 0 || index >= echoes.length) {
      return {
        role: 'SCOUT',
        description: 'Initial reconnaissance unit',
        badge: 'SCOUT',
        activationsCount: 0,
        stationaryRatio: 0,
        distanceTraveled: 0,
      };
    }
    return this.temporalMemory.analyzeEchoRole(echoes[index].timeline);
  }

  public getEchoTimelineData() {
    return this.getDetailedEchoHistory().map((e) => ({
      id: `echo-${e.echoIndex}`,
      label: e.label,
      color: e.color,
      role: e.role,
      duration: e.duration,
    }));
  }

  public getDetailedEchoHistory(): EchoHistoryEntry[] {
    const echoes = this.echoManager.getEchoes();
    return echoes.map((echo, idx) => {
      const theme = echo.theme;
      const roleAnalysis = this.temporalMemory.analyzeEchoRole(echo.timeline);
      const frames = echo.timeline.frames;

      // Downsample to 20 key sample points
      const samples: { t: number; x: number; y: number; isInteracting: boolean }[] = [];
      const sampleStep = Math.max(1, Math.floor(frames.length / 20));
      for (let i = 0; i < frames.length; i += sampleStep) {
        samples.push({
          t: Math.round(frames[i].t * 10) / 10,
          x: Math.round(frames[i].x),
          y: Math.round(frames[i].y),
          isInteracting: frames[i].isInteracting,
        });
      }

      let summaryAction = 'Stationary positioning at key conduit.';
      if (roleAnalysis.activationsCount > 0) {
        summaryAction = `Engaged environmental triggers ${roleAnalysis.activationsCount} times.`;
      } else if (roleAnalysis.distanceTraveled > 200) {
        summaryAction = `Traversed ${Math.round(roleAnalysis.distanceTraveled)}m scouting route.`;
      }

      return {
        echoIndex: idx + 1,
        label: theme.label,
        color: theme.primaryColor,
        duration: Math.round(echo.timeline.duration * 10) / 10,
        distanceTraveled: Math.round(roleAnalysis.distanceTraveled),
        role: roleAnalysis.role,
        keyActionSummary: summaryAction,
        timelineSamplePoints: samples,
      };
    });
  }

  public getRunSummaryData() {
    const elapsedSeconds = Math.max(0.5, (performance.now() - this.levelStartTime) / 1000);
    return {
      levelId: this.level.id,
      loopsUsed: this.loopManager.getLoopNumber(),
      echoesCreated: this.echoManager.getEchoCount(),
      elapsedSeconds,
      resetsCount: this.totalResetsInSector,
      playerFinalPath: [...this.playerPathLog],
    };
  }

  private updateFps() {
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsCalcTime >= 500) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsCalcTime));
      this.frameCount = 0;
      this.lastFpsCalcTime = now;
    }
  }

  public getDebugInfo(): DebugInfo {
    return {
      loopState: this.loopManager.getState(),
      loopNumber: this.loopManager.getLoopNumber(),
      loopTimer: this.loopManager.getLoopTimer(),
      loopDuration: this.loopManager.getLoopDuration(),
      echoCount: this.echoManager.getEchoCount(),
      recordedFrameCount: this.recorder.getRecordedFrameCount(),
      fps: this.currentFps,
      playerPos: { ...this.playerPos },
      playerVel: { ...this.playerVel },
    };
  }

  // --- RENDER PASSES ---
  public render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();

    // Seismic Screen Shake Offset
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 0. Distant Facility Background Architecture (Layered Depth)
    this.temporalVFX.renderFacilityBackgroundDepth(ctx, width, height, this.ambientPulse);

    // 1. Facility Floor & Architectural Background
    this.renderFloorAndWalls(ctx);

    // 1b. Environmental Story Decals & Floor Stencils
    this.renderEnvironmentalStoryDecals(ctx);

    // 2. Floor Wires / Conduit Lines
    this.renderConduits(ctx);

    // 3. Pressure Plates
    this.renderPlates(ctx);

    // 4. Consoles, Pillars & Machinery
    this.renderObstacles(ctx);

    // 5. Security Doors / Bulkheads
    this.renderDoors(ctx);

    // 5b. Advanced Puzzle System Elements (Platforms, Sensors, Switches, Terminals, Barriers, Logs)
    this.puzzleSystem.render(ctx, this.ambientPulse);

    // 5c. Innovation System Elements (Memory Terminals, Resonance Nodes, Sync Pairs, Shadow Zones, Phase Objects, Anomalies)
    this.innovationSystem.render(ctx, this.ambientPulse);

    // 5d. Optional Facility Secrets & Audio Archives
    this.renderOptionalSecrets(ctx);

    // 6. Exit Airlock / Terminal
    this.renderExitPortal(ctx);

    // 7. Particle Effects (Behind Characters)
    this.particleSystem.render(ctx);

    // 7b. Temporal VFX Shockwaves & Surface Ripples
    this.temporalVFX.renderRipples(ctx);

    // 7c. Temporal Motion Ghost Trails (Echoes & Player)
    this.temporalVFX.renderEchoGhostTrails(ctx, this.drawStylizedCharacter.bind(this));
    this.temporalVFX.renderPlayerTrail(ctx, this.drawStylizedCharacter.bind(this));

    // 7d. Best Run Temporal Ghost Trace (Replay & Time Trial Mode)
    this.renderBestRunGhost(ctx);

    // 7d. Unknown Echo Manifestation
    this.narrativeSystem.renderUnknownEcho(ctx, this.ambientPulse);

    // 8. Temporal Echoes (Distinctive Per-Echo Visual Identity)
    this.renderEchoes(ctx);

    // 9. Player Operative
    this.renderPlayer(ctx);

    // 10. Dynamic Sci-Fi Lighting & Atmosphere
    this.renderLightingPass(ctx, width, height);

    // 10b. Temporal Paradox Distortion (if timeline stability is dropping)
    if (this.innovationSystem.stability < 60) {
      this.renderParadoxDistortion(ctx, width, height);
    }

    // 11. Temporal Collapse FX (if loop is resetting)
    if (this.loopManager.isTransitioning()) {
      this.renderCollapseFX(ctx, width, height);
    }

    ctx.restore();
  }

  private renderFloorAndWalls(ctx: CanvasRenderingContext2D) {
    const bounds = this.level.bounds;

    // Base dark containment cell floor
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, bounds.width, bounds.height);

    // Futuristic floor grid with brushed metallic seams
    const tileSize = 48;
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= bounds.width; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, bounds.height);
      ctx.stroke();
    }
    for (let y = 0; y <= bounds.height; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(bounds.width, y);
      ctx.stroke();
    }

    // Outer Perimeter Wall
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, bounds.width - 16, bounds.height - 16);

    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, bounds.width - 32, bounds.height - 32);

    // Warning hazard stripes along perimeter corners
    this.renderHazardStripes(ctx, 16, 16, 80, 10);
    this.renderHazardStripes(ctx, bounds.width - 96, 16, 80, 10);
    this.renderHazardStripes(ctx, 16, bounds.height - 26, 80, 10);
    this.renderHazardStripes(ctx, bounds.width - 96, bounds.height - 26, 80, 10);
  }

  private renderHazardStripes(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = '#eab308';
    const stripeWidth = 10;
    for (let i = -h; i < w + h; i += stripeWidth * 2) {
      ctx.beginPath();
      ctx.moveTo(x + i, y + h);
      ctx.lineTo(x + i + stripeWidth, y + h);
      ctx.lineTo(x + i + stripeWidth + h, y);
      ctx.lineTo(x + i + h, y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  private renderConduits(ctx: CanvasRenderingContext2D) {
    for (const wire of this.level.wires) {
      const isLive = this.puzzleSystem.isSourceActive(wire.connectedPlateId);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(wire.from.x, wire.from.y);
      if (wire.waypoints) {
        for (const wp of wire.waypoints) {
          ctx.lineTo(wp.x, wp.y);
        }
      }
      ctx.lineTo(wire.to.x, wire.to.y);

      ctx.strokeStyle = isLive ? wire.color : '#1e293b';
      ctx.lineWidth = isLive ? 3 : 2;
      ctx.shadowColor = isLive ? wire.color : 'transparent';
      ctx.shadowBlur = isLive ? 12 : 0;
      ctx.stroke();

      if (isLive) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 24]);
        ctx.lineDashOffset = -this.ambientPulse * 60;
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private renderPlates(ctx: CanvasRenderingContext2D) {
    for (const plate of this.puzzleSystem.plates) {
      ctx.save();
      const cx = plate.x + plate.width / 2;
      const cy = plate.y + plate.height / 2;
      const depression = this.temporalVFX.getPlateDepression(plate.id);

      // 1. Outer Beveled Cast-Iron Base Frame
      ctx.fillStyle = '#0a0f1d';
      ctx.strokeStyle = plate.isPressed ? plate.color : '#334155';
      ctx.lineWidth = 2;
      ctx.shadowColor = plate.color;
      ctx.shadowBlur = plate.isPressed ? 14 : 2;
      ctx.beginPath();
      ctx.roundRect(plate.x, plate.y, plate.width, plate.height, 6);
      ctx.fill();
      ctx.stroke();

      // Hazard corner chevrons on base
      ctx.fillStyle = plate.isPressed ? plate.color : '#475569';
      const cSize = 4;
      ctx.fillRect(plate.x + 2, plate.y + 2, cSize, cSize);
      ctx.fillRect(plate.x + plate.width - 2 - cSize, plate.y + 2, cSize, cSize);
      ctx.fillRect(plate.x + 2, plate.y + plate.height - 2 - cSize, cSize, cSize);
      ctx.fillRect(plate.x + plate.width - 2 - cSize, plate.y + plate.height - 2 - cSize, cSize, cSize);

      // 2. Recessed Sinking Spring Plate
      const sink = depression * 3.5;
      const padMargin = 5;
      ctx.fillStyle = plate.isPressed ? '#1e293b' : '#0f172a';
      ctx.strokeStyle = plate.isPressed ? plate.color : '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(
        plate.x + padMargin,
        plate.y + padMargin + sink,
        plate.width - padMargin * 2,
        plate.height - padMargin * 2,
        4
      );
      ctx.fill();
      ctx.stroke();

      // Tactile illuminated center pad
      ctx.fillStyle = plate.isPressed ? plate.color : 'rgba(30, 41, 59, 0.8)';
      ctx.globalAlpha = plate.isPressed ? 0.9 : 0.4;
      ctx.beginPath();
      ctx.arc(cx, cy + sink, 9, 0, Math.PI * 2);
      ctx.fill();

      // Center core glyph
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = plate.isPressed ? '#ffffff' : plate.color;
      ctx.font = 'bold 9px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⬡', cx, cy + sink);

      // Label below plate
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = plate.color;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(plate.label, cx, plate.y + plate.height + 14);

      ctx.restore();
    }
  }

  private renderObstacles(ctx: CanvasRenderingContext2D) {
    for (const obs of this.level.obstacles) {
      ctx.save();

      if (obs.type === 'wall') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        ctx.fillStyle = '#64748b';
        for (let y = obs.y + 16; y < obs.y + obs.height - 10; y += 24) {
          ctx.beginPath();
          ctx.arc(obs.x + obs.width / 2, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (obs.type === 'console') {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        const blink1 = Math.sin(this.ambientPulse * 4 + obs.x) > 0;
        const blink2 = Math.cos(this.ambientPulse * 5 + obs.y) > 0;
        ctx.fillStyle = blink1 ? '#38bdf8' : '#0369a1';
        ctx.fillRect(obs.x + 6, obs.y + 8, 8, 4);

        ctx.fillStyle = blink2 ? '#10b981' : '#065f46';
        ctx.fillRect(obs.x + 18, obs.y + 8, 8, 4);

        if (obs.label) {
          ctx.fillStyle = '#64748b';
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(obs.label, obs.x + obs.width / 2, obs.y + obs.height - 6);
        }
      } else if (obs.type === 'pillar') {
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private renderDoors(ctx: CanvasRenderingContext2D) {
    for (const door of this.puzzleSystem.doors) {
      ctx.save();
      const progress = this.temporalVFX.getDoorProgress(door.id);

      // Heavy Security Bulkhead Frame
      ctx.strokeStyle = door.isOpen ? '#059669' : '#dc2626';
      ctx.lineWidth = 2;
      ctx.shadowColor = door.isOpen ? '#10b981' : '#ef4444';
      ctx.shadowBlur = door.isOpen ? 10 : 4;
      ctx.strokeRect(door.x - 3, door.y - 3, door.width + 6, door.height + 6);

      // Door Cavity Interior
      ctx.fillStyle = '#030712';
      ctx.fillRect(door.x, door.y, door.width, door.height);

      // Split Bulkhead Panels Retracting into Wall
      const leafHeight = (door.height / 2) * (1 - progress);
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = door.isOpen ? '#10b981' : '#b91c1c';
      ctx.lineWidth = 1.5;

      // Top Leaf
      if (leafHeight > 1) {
        ctx.fillRect(door.x, door.y, door.width, leafHeight);
        ctx.strokeRect(door.x, door.y, door.width, leafHeight);

        // Interlocking teeth
        ctx.fillStyle = door.isOpen ? '#34d399' : '#f87171';
        ctx.fillRect(door.x + 2, door.y + leafHeight - 4, door.width - 4, 3);
      }

      // Bottom Leaf
      if (leafHeight > 1) {
        const bottomY = door.y + door.height - leafHeight;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(door.x, bottomY, door.width, leafHeight);
        ctx.strokeRect(door.x, bottomY, door.width, leafHeight);

        // Interlocking teeth
        ctx.fillStyle = door.isOpen ? '#34d399' : '#f87171';
        ctx.fillRect(door.x + 2, bottomY + 1, door.width - 4, 3);
      }

      // Center Status LED / Magnetic Bolt Clunk Indicator
      ctx.save();
      ctx.translate(door.x + door.width / 2, door.y + door.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = door.isOpen ? '#10b981' : '#ef4444';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(door.isOpen ? 'PASSAGE UNLOCKED' : 'LOCK ENGAGED', 0, 3);
      ctx.restore();

      ctx.restore();
    }
  }

  private renderExitPortal(ctx: CanvasRenderingContext2D) {
    const exit = this.level.exitPoint;
    ctx.save();

    const pulse = Math.sin(this.ambientPulse * 3) * 0.15 + 0.85;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(exit.x, exit.y, 28 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(exit.x, exit.y);
    ctx.rotate(this.ambientPulse * 1.5);
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.moveTo(-8, -18);
      ctx.lineTo(0, -26);
      ctx.lineTo(8, -18);
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(exit.x, exit.y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#34d399';
    ctx.font = '10px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXTRACTION AIRLOCK', exit.x, exit.y + 45);

    ctx.restore();
  }

  private renderOptionalSecrets(ctx: CanvasRenderingContext2D) {
    if (!this.level.optionalSecrets) return;

    for (const secret of this.level.optionalSecrets) {
      ctx.save();
      const pulse = Math.sin(this.ambientPulse * 3) * 0.15 + 0.85;
      const isDiscovered = secret.isDiscovered;

      // Glow halo
      ctx.beginPath();
      ctx.arc(secret.x, secret.y, secret.radius * pulse, 0, Math.PI * 2);
      ctx.fillStyle = isDiscovered ? 'rgba(16, 185, 129, 0.12)' : 'rgba(56, 189, 248, 0.15)';
      ctx.fill();

      // Outer ring
      ctx.beginPath();
      ctx.arc(secret.x, secret.y, secret.radius, 0, Math.PI * 2);
      ctx.strokeStyle = isDiscovered ? '#10b981' : '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = isDiscovered ? '#10b981' : '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.stroke();

      // Terminal / archive base
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(secret.x, secret.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Holographic glyph
      ctx.fillStyle = isDiscovered ? '#34d399' : '#38bdf8';
      ctx.font = 'bold 12px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(secret.glyph || '◈', secret.x, secret.y);

      // Label below
      ctx.font = '9px monospace';
      ctx.fillStyle = isDiscovered ? '#34d399' : '#94a3b8';
      ctx.fillText(
        isDiscovered ? 'ARCHIVE RECOVERED' : 'UNREAD ARCHIVE',
        secret.x,
        secret.y + secret.radius + 14
      );

      ctx.restore();
    }
  }

  // --- Echo Visual Rendering with Per-Timeline Identity ---
  private renderEchoes(ctx: CanvasRenderingContext2D) {
    const echoes = this.echoManager.getEchoes();
    const currentLoop = this.loopManager.getLoopNumber();

    for (const echo of echoes) {
      ctx.save();
      const theme = echo.theme;
      const age = Math.max(0, currentLoop - echo.loopNumber);
      const coherence = Math.max(0.55, 1 - age * 0.14);

      // Ghost translucency & subtle temporal flicker
      const flicker = (theme.opacity * coherence) + Math.sin(this.ambientPulse * 16 + echo.x) * 0.06;
      const isGlitching = echo.spawnGlitchTimer > 0;
      ctx.globalAlpha = isGlitching ? 0.35 + Math.random() * 0.4 : flicker;

      // Chromatic separation / ghost silhouette offset (Cyan / Magenta tachyon fringe)
      const chromShift = isGlitching ? 5 : 2 + age * 0.8;
      this.drawStylizedCharacter(
        ctx,
        echo.x - chromShift,
        echo.y,
        echo.facing,
        echo.animFrame,
        echo.isMoving,
        'rgba(244, 63, 94, 0.35)', // Chromatic Red/Magenta offset
        theme.accentColor
      );

      this.drawStylizedCharacter(
        ctx,
        echo.x + chromShift * 0.5,
        echo.y,
        echo.facing,
        echo.animFrame,
        echo.isMoving,
        'rgba(6, 182, 212, 0.35)', // Chromatic Cyan offset
        theme.accentColor
      );

      // Primary Echo body using distinct timeline theme colors
      this.drawStylizedCharacter(
        ctx,
        echo.x,
        echo.y,
        echo.facing,
        echo.animFrame,
        echo.isMoving,
        theme.primaryColor,
        theme.accentColor
      );

      // Horizontal temporal scanline slices through the Echo body (spacing widens with age)
      ctx.fillStyle = theme.scanlineColor;
      const scanSpacing = 4 + age * 2;
      for (let sl = -16; sl <= 16; sl += scanSpacing) {
        ctx.fillRect(echo.x - 14, echo.y + sl, 28, 1);
      }

      // Echo ID badge & status with tactical role
      const roleAnalysis = this.temporalMemory.analyzeEchoRole(echo.timeline);
      ctx.fillStyle = theme.primaryColor;
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      const statusText = echo.isFinished
        ? `${theme.label} [${roleAnalysis.badge}] (HOLD)`
        : `${theme.label} [${roleAnalysis.badge}]`;
      ctx.fillText(statusText, echo.x, echo.y - 25);

      ctx.restore();
    }
  }

  // --- Best Run Ghost Trace Rendering (Replay & Time Trial Mode) ---
  private renderBestRunGhost(ctx: CanvasRenderingContext2D) {
    if (!this.bestRunGhostPath || this.bestRunGhostPath.length < 2) return;

    ctx.save();
    // Render ethereal golden temporal path trace
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.bestRunGhostPath[0].x, this.bestRunGhostPath[0].y);
    for (let i = 1; i < this.bestRunGhostPath.length; i++) {
      ctx.lineTo(this.bestRunGhostPath[i].x, this.bestRunGhostPath[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Animated lead beacon along the best run path
    const loopDuration = this.level.loopDuration;
    const loopTimer = this.loopManager.getLoopTimer();
    const progress = Math.max(0, Math.min(1, loopTimer / loopDuration));
    const targetIdx = Math.floor(progress * (this.bestRunGhostPath.length - 1));
    const ghostPos = this.bestRunGhostPath[targetIdx];

    if (ghostPos) {
      // Golden tachyon spark node
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ghostPos.x, ghostPos.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Outer expansion ring
      const ringPulse = (loopTimer * 4) % 1;
      ctx.strokeStyle = `rgba(251, 191, 36, ${0.8 * (1 - ringPulse)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ghostPos.x, ghostPos.y, 4 + ringPulse * 10, 0, Math.PI * 2);
      ctx.stroke();

      // Label
      ctx.font = 'bold 8px "JetBrains Mono", monospace';
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'center';
      ctx.fillText('BEST RUN GHOST', ghostPos.x, ghostPos.y - 12);
    }

    ctx.restore();
  }

  // --- Player Character Rendering ---
  private renderPlayer(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Directional headlight / sensor cone
    this.renderFlashlight(ctx, this.playerPos.x, this.playerPos.y, this.playerFacing);

    // Player operative body in high-tech containment rig
    this.drawStylizedCharacter(
      ctx,
      this.playerPos.x,
      this.playerPos.y,
      this.playerFacing,
      this.playerAnimTime,
      this.playerMoving,
      '#0284c7', // Containment suit primary
      '#00f0ff'  // High-luminance cyan visor
    );

    // Timeline marker
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('OPERATIVE [CURRENT]', this.playerPos.x, this.playerPos.y - 25);

    ctx.restore();
  }

  private renderFlashlight(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: 1 | -1
  ) {
    ctx.save();
    const coneAngle = 0.55;
    const coneLength = 110;
    const baseAngle = facing === 1 ? 0 : Math.PI;

    const grad = ctx.createRadialGradient(x, y, 10, x + facing * 80, y, coneLength);
    grad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
    grad.addColorStop(0.6, 'rgba(6, 182, 212, 0.08)');
    grad.addColorStop(1, 'rgba(6, 182, 212, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x, y - 4);
    ctx.arc(x, y - 4, coneLength, baseAngle - coneAngle, baseAngle + coneAngle);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawStylizedCharacter(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: 1 | -1,
    animTime: number,
    isMoving: boolean,
    suitColor: string,
    visorColor: string
  ) {
    ctx.save();
    ctx.translate(x, y);

    // 1. Soft Floor Contact Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 12, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const legSwing = isMoving ? Math.sin(animTime) * 6 : 0;
    const armSwing = isMoving ? -Math.sin(animTime) * 4 : 0;
    const torsoBob = isMoving ? Math.abs(Math.sin(animTime * 2)) * 1.5 : 0;

    // 2. Legs & Armored Boots
    // Back leg
    ctx.fillStyle = '#0a0f1d';
    ctx.strokeStyle = suitColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-6 - legSwing, 6 - torsoBob, 4.5, 12, 2);
    ctx.fill();
    ctx.stroke();

    // Boot sole grip
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-7 - legSwing, 16 - torsoBob, 6, 2.5);

    // Front leg
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(2 + legSwing, 6 - torsoBob, 4.5, 12, 2);
    ctx.fill();
    ctx.stroke();

    // Front boot sole grip
    ctx.fillRect(1 + legSwing, 16 - torsoBob, 6, 2.5);

    // 3. Chrono-Emitter Rig (Backpack) with Dual Tachyon Tubes
    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    const packX = facing === 1 ? -11 : 6;
    ctx.beginPath();
    ctx.roundRect(packX, -10 - torsoBob, 5, 14, 2);
    ctx.fill();
    ctx.stroke();

    // Glowing tachyon tubes on rig
    ctx.fillStyle = visorColor;
    ctx.shadowColor = visorColor;
    ctx.shadowBlur = 6;
    ctx.fillRect(packX + 1.5, -8 - torsoBob, 2, 4);
    ctx.fillRect(packX + 1.5, -2 - torsoBob, 2, 4);
    ctx.restore();

    // 4. Armored Torso / Kinetic Rig
    ctx.fillStyle = '#111827';
    ctx.strokeStyle = suitColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-8, -11 - torsoBob, 16, 17, 3.5);
    ctx.fill();
    ctx.stroke();

    // Chest armor plating
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(-6, -9 - torsoBob, 12, 7);

    // Core miniature chronometer reactor LED
    ctx.fillStyle = visorColor;
    ctx.shadowColor = visorColor;
    ctx.shadowBlur = 7;
    ctx.beginPath();
    ctx.arc(0, -3 - torsoBob, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 5. Shoulder Pauldron Plates
    ctx.fillStyle = '#374151';
    ctx.strokeStyle = suitColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(-9, -10 - torsoBob, 4, 6, 1.5);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(5, -10 - torsoBob, 4, 6, 1.5);
    ctx.fill();
    ctx.stroke();

    // 6. Arms & Gauntlets
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = suitColor;
    ctx.lineWidth = 1.5;
    const armX = facing === 1 ? 5 : -7;
    ctx.beginPath();
    ctx.roundRect(armX, -5 - torsoBob + armSwing, 3.5, 9, 1.5);
    ctx.fill();
    ctx.stroke();

    // 7. Tactical Helmet
    ctx.fillStyle = '#0a0f1d';
    ctx.strokeStyle = suitColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, -15 - torsoBob, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Helmet earpiece / antenna nub
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(facing === 1 ? -8 : 7, -17 - torsoBob, 1.5, 4);

    // 8. Emissive Angular Visor Slit
    ctx.fillStyle = visorColor;
    ctx.shadowColor = visorColor;
    ctx.shadowBlur = 9;
    const visorX = facing === 1 ? 0 : -7;
    ctx.beginPath();
    ctx.roundRect(visorX, -17 - torsoBob, 7, 3.2, 1);
    ctx.fill();

    // Visor sweep highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(visorX + (facing === 1 ? 2 : 1), -16.5 - torsoBob, 2, 2);
    ctx.shadowBlur = 0;

    // 9. Rim Light Accent Outline (Ensures razor-sharp silhouette against dark background)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-9, -12 - torsoBob, 18, 19);

    ctx.restore();
  }

  private renderLightingPass(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    ctx.save();
    const ambientGrad = ctx.createRadialGradient(
      this.playerPos.x,
      this.playerPos.y,
      40,
      this.playerPos.x,
      this.playerPos.y,
      380
    );
    ambientGrad.addColorStop(0, 'rgba(4, 6, 10, 0.05)');
    ambientGrad.addColorStop(0.6, 'rgba(4, 6, 10, 0.45)');
    ambientGrad.addColorStop(1, 'rgba(4, 6, 10, 0.82)');

    ctx.fillStyle = ambientGrad;
    ctx.fillRect(0, 0, width, height);

    const vigGrad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      height * 0.4,
      width / 2,
      height / 2,
      height * 0.8
    );
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }

  // --- 9-Phase Cinematic Loop Reset Sequence ---
  private renderCollapseFX(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    ctx.save();
    const progress = this.loopManager.getTransitionProgress(); // 0 -> 1 over 1.2s

    // Phase 1 (0.00 - 0.25): World Freeze & Tachyon Saturation Tint
    if (progress < 0.25) {
      const p1 = progress / 0.25;
      ctx.fillStyle = `rgba(6, 182, 212, ${p1 * 0.35})`;
      ctx.fillRect(0, 0, width, height);

      // Freeze scanlines
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1);
      }
    }
    // Phase 2 (0.25 - 0.55): Temporal Distortion & Inward Implosion
    else if (progress < 0.55) {
      const p2 = (progress - 0.25) / 0.3;
      // Inward collapse rings towards player position
      const maxR = Math.hypot(width, height) * 0.6;
      const currentR = maxR * (1 - p2);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(this.playerPos.x, this.playerPos.y, Math.max(10, currentR), 0, Math.PI * 2);
      ctx.stroke();

      // Convergence lines drawn toward center
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
      ctx.lineWidth = 1.5;
      const angles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4];
      for (const a of angles) {
        const startDist = maxR * (1 - p2 * 0.5);
        const endDist = currentR;
        ctx.beginPath();
        ctx.moveTo(this.playerPos.x + Math.cos(a) * startDist, this.playerPos.y + Math.sin(a) * startDist);
        ctx.lineTo(this.playerPos.x + Math.cos(a) * endDist, this.playerPos.y + Math.sin(a) * endDist);
        ctx.stroke();
      }

      // Vignette collapse
      ctx.fillStyle = `rgba(3, 7, 18, ${p2 * 0.7})`;
      ctx.fillRect(0, 0, width, height);
    }
    // Phase 3 (0.55 - 0.85): Blinding Tachyon White/Cyan Pulse
    else if (progress < 0.85) {
      const p3 = (progress - 0.55) / 0.3;
      const flashAlpha = Math.sin(p3 * Math.PI);

      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.8})`;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = `rgba(6, 182, 212, ${flashAlpha * 0.5})`;
      ctx.fillRect(0, 0, width, height);

      // Expansion shockwave after collapse
      const burstRadius = p3 * width * 0.7;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6 * (1 - p3);
      ctx.beginPath();
      ctx.arc(this.playerPos.x, this.playerPos.y, burstRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Phase 4 (0.85 - 1.00): Controlled Glitch & Temporal Stabilization
    else {
      const p4 = (progress - 0.85) / 0.15;
      // Controlled horizontal slice glitch
      const glitchSlices = 5;
      for (let i = 0; i < glitchSlices; i++) {
        const gy = Math.random() * height;
        const gh = 6 + Math.random() * 12;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(6, 182, 212, 0.25)' : 'rgba(168, 85, 247, 0.2)';
        ctx.fillRect(0, gy, width, gh);
      }

      // Fade back to clear view
      ctx.fillStyle = `rgba(15, 23, 42, ${(1 - p4) * 0.5})`;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  }

  // --- Temporal Paradox Distortion (Instability Scanlines & Chromatic Jitter) ---
  private renderParadoxDistortion(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    const instability = (60 - this.innovationSystem.stability) / 60; // 0 to 1
    ctx.save();

    // Red tint flash
    ctx.fillStyle = `rgba(239, 68, 68, ${0.06 * instability})`;
    ctx.fillRect(0, 0, width, height);

    // Random tachyon interference lines
    const glitchCount = Math.floor(instability * 6);
    ctx.fillStyle = `rgba(244, 63, 94, ${0.2 * instability})`;
    for (let i = 0; i < glitchCount; i++) {
      const y = Math.random() * height;
      const h = 2 + Math.random() * 6;
      ctx.fillRect(0, y, width, h);
    }

    // Paradox warning watermark in bottom-right
    if (this.innovationSystem.stability < 40) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(
        `⚠ CAUTION: TEMPORAL PARADOX DETECTED // STABILITY: ${Math.round(this.innovationSystem.stability)}%`,
        width - 24,
        height - 24
      );
    }

    ctx.restore();
  }
}
