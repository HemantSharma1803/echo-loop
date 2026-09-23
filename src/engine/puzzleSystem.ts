/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vector2D, EchoInstance } from '../types/game';
import {
  InteractiveSwitch,
  EnergyBarrier,
  MovingPlatform,
  TemporalSensor,
  BiometricTerminal,
  LogicGate,
  EnvironmentalLog,
} from '../types/puzzle';
import { PressurePlate, SecurityDoor } from '../types/game';
import { soundManager } from '../audio/soundSystem';
import { ParticleSystem } from './particleSystem';

export class PuzzleSystem {
  public plates: PressurePlate[] = [];
  public doors: SecurityDoor[] = [];
  public switches: InteractiveSwitch[] = [];
  public barriers: EnergyBarrier[] = [];
  public platforms: MovingPlatform[] = [];
  public temporalSensors: TemporalSensor[] = [];
  public biometricTerminals: BiometricTerminal[] = [];
  public logicGates: LogicGate[] = [];
  public logs: EnvironmentalLog[] = [];

  private particleSystem: ParticleSystem;

  constructor(particleSystem: ParticleSystem) {
    this.particleSystem = particleSystem;
  }

  public initFromLevel(level: {
    plates?: PressurePlate[];
    doors?: SecurityDoor[];
    switches?: InteractiveSwitch[];
    barriers?: EnergyBarrier[];
    platforms?: MovingPlatform[];
    temporalSensors?: TemporalSensor[];
    biometricTerminals?: BiometricTerminal[];
    logicGates?: LogicGate[];
    logs?: EnvironmentalLog[];
  }) {
    this.plates = JSON.parse(JSON.stringify(level.plates || []));
    this.doors = JSON.parse(JSON.stringify(level.doors || []));
    this.switches = JSON.parse(JSON.stringify(level.switches || []));
    this.barriers = JSON.parse(JSON.stringify(level.barriers || []));
    this.platforms = JSON.parse(JSON.stringify(level.platforms || []));
    this.temporalSensors = JSON.parse(JSON.stringify(level.temporalSensors || []));
    this.biometricTerminals = JSON.parse(JSON.stringify(level.biometricTerminals || []));
    this.logicGates = JSON.parse(JSON.stringify(level.logicGates || []));
    this.logs = JSON.parse(JSON.stringify(level.logs || []));
  }

  public reset() {
    for (const plate of this.plates) {
      plate.isPressed = false;
      plate.activeTimer = 0;
      if (plate.timer) plate.timer = 0;
    }
    for (const door of this.doors) {
      door.isOpen = false;
      door.openProgress = 0;
      if (door.timer) door.timer = 0;
    }
    for (const sw of this.switches) {
      sw.isActive = false;
      sw.timer = 0;
    }
    for (const sensor of this.temporalSensors) {
      sensor.isTriggered = false;
      sensor.pulseTimer = 0;
    }
    for (const term of this.biometricTerminals) {
      term.isScanning = false;
      term.scanProgress = 0;
      term.isCompleted = false;
    }
    for (const gate of this.logicGates) {
      gate.isSatisfied = false;
      gate.currentSequence = [];
    }
    for (const plat of this.platforms) {
      plat.currentWaypointIndex = 0;
      plat.travelDirection = 1;
      if (plat.waypoints && plat.waypoints.length > 0) {
        plat.x = plat.waypoints[0].x;
        plat.y = plat.waypoints[0].y;
      }
    }
  }

  public update(
    dt: number,
    player: { pos: Vector2D; isMoving: boolean; isInteracting: boolean },
    echoes: EchoInstance[],
    onShake?: (amt: number) => void
  ) {
    // 1. Gather all active entities with tags
    const allEntities = [
      { pos: player.pos, isPlayer: true, isEcho: false, id: 'player' },
      ...echoes.map((e) => ({
        pos: { x: e.x, y: e.y },
        isPlayer: false,
        isEcho: true,
        id: e.id,
      })),
    ];

    // 2. Update Interactive Switches (Toggle, Momentary, Timed)
    this.updateSwitches(dt, allEntities);

    // 3. Update Pressure Plates
    this.updatePlates(dt, allEntities, onShake);

    // 4. Update Temporal Sensors (Echo-Only)
    this.updateTemporalSensors(dt, echoes);

    // 5. Update Biometric Terminals (Player-Only Live Interaction)
    this.updateBiometricTerminals(dt, player);

    // 6. Update Logic Gates
    this.updateLogicGates();

    // 7. Update Energy Barriers
    this.updateBarriers(dt, player, onShake);

    // 8. Update Moving Platforms
    this.updatePlatforms(dt, player, echoes);

    // 9. Update Security Doors
    this.updateDoors(dt, onShake);

    // 10. Update Environmental Logs
    this.updateLogs(player.pos);
  }

  // --- Switch Logic ---
  private updateSwitches(
    dt: number,
    entities: { pos: Vector2D; isPlayer: boolean; isEcho: boolean }[]
  ) {
    for (const sw of this.switches) {
      // Check if any matching entity is on switch
      let isOccupied = false;
      for (const ent of entities) {
        if (sw.filter === 'PLAYER_ONLY' && !ent.isPlayer) continue;
        if (sw.filter === 'ECHO_ONLY' && !ent.isEcho) continue;

        if (
          Math.abs(ent.pos.x - (sw.x + sw.width / 2)) < sw.width / 2 + 6 &&
          Math.abs(ent.pos.y - (sw.y + sw.height / 2)) < sw.height / 2 + 6
        ) {
          isOccupied = true;
          break;
        }
      }

      if (sw.type === 'MOMENTARY') {
        const wasActive = sw.isActive;
        sw.isActive = isOccupied;
        if (sw.isActive && !wasActive) {
          soundManager.playSwitchToggle(true);
        } else if (!sw.isActive && wasActive) {
          soundManager.playSwitchToggle(false);
        }
      } else if (sw.type === 'TIMED') {
        if (isOccupied) {
          if (!sw.isActive) {
            soundManager.playSwitchToggle(true);
          }
          sw.isActive = true;
          sw.timer = sw.maxDuration;
        } else if (sw.isActive) {
          sw.timer -= dt;
          if (sw.timer <= 0) {
            sw.isActive = false;
            sw.timer = 0;
            soundManager.playSwitchToggle(false);
          }
        }
      } else if (sw.type === 'TOGGLE') {
        // Toggle on entry
        if (isOccupied && sw.timer <= 0) {
          sw.isActive = !sw.isActive;
          sw.timer = 0.6; // Debounce so player doesn't flicker toggle
          soundManager.playSwitchToggle(sw.isActive);
        }
        if (sw.timer > 0) {
          sw.timer -= dt;
        }
      }
    }
  }

  // --- Pressure Plates ---
  private updatePlates(
    dt: number,
    entities: { pos: Vector2D; isPlayer: boolean; isEcho: boolean }[],
    onShake?: (amt: number) => void
  ) {
    for (const plate of this.plates) {
      let isPressedNow = false;

      for (const ent of entities) {
        if (plate.filter === 'PLAYER_ONLY' && !ent.isPlayer) continue;
        if (plate.filter === 'ECHO_ONLY' && !ent.isEcho) continue;

        const halfW = plate.width / 2 + 8;
        const halfH = plate.height / 2 + 8;
        const cx = plate.x + plate.width / 2;
        const cy = plate.y + plate.height / 2;

        if (Math.abs(ent.pos.x - cx) < halfW && Math.abs(ent.pos.y - cy) < halfH) {
          isPressedNow = true;
          break;
        }
      }

      if (isPressedNow && !plate.isPressed) {
        soundManager.playPlateActivate();
        this.particleSystem.emitPlateRing(
          { x: plate.x + plate.width / 2, y: plate.y + plate.height / 2 },
          plate.color
        );
        if (onShake) onShake(3);
      } else if (!isPressedNow && plate.isPressed) {
        soundManager.playPlateDeactivate();
      }

      plate.isPressed = isPressedNow;

      if (plate.isPressed) {
        plate.activeTimer = Math.min(1, plate.activeTimer + dt * 8);
      } else {
        plate.activeTimer = Math.max(0, plate.activeTimer - dt * 6);
      }
    }
  }

  // --- Temporal Sensors (Echo-Only) ---
  private updateTemporalSensors(dt: number, echoes: EchoInstance[]) {
    for (const sensor of this.temporalSensors) {
      let echoInside = false;

      for (const echo of echoes) {
        const dist = Math.hypot(echo.x - sensor.x, echo.y - sensor.y);
        if (dist <= sensor.radius + 10) {
          echoInside = true;
          break;
        }
      }

      if (echoInside && !sensor.isTriggered) {
        sensor.isTriggered = true;
        sensor.pulseTimer = 1.0;
        soundManager.playSensorPulse();
      } else if (!echoInside && sensor.isTriggered) {
        sensor.isTriggered = false;
      }

      if (sensor.pulseTimer > 0) {
        sensor.pulseTimer = Math.max(0, sensor.pulseTimer - dt);
      }
    }
  }

  // --- Biometric Terminals (Player-Only Live Scan) ---
  private updateBiometricTerminals(
    dt: number,
    player: { pos: Vector2D; isMoving: boolean; isInteracting: boolean }
  ) {
    for (const term of this.biometricTerminals) {
      if (term.isCompleted) continue;

      const cx = term.x + term.width / 2;
      const cy = term.y + term.height / 2;
      const dist = Math.hypot(player.pos.x - cx, player.pos.y - cy);

      const isInRange = dist < 42;
      term.isScanning = isInRange;

      if (isInRange) {
        term.scanProgress = Math.min(1, term.scanProgress + dt * 0.85);
        if (Math.random() < 0.25) {
          soundManager.playTerminalScan();
        }

        if (term.scanProgress >= 1.0) {
          term.isCompleted = true;
          term.isScanning = false;
          soundManager.playPlateActivate();
        }
      } else {
        term.scanProgress = Math.max(0, term.scanProgress - dt * 1.5);
      }
    }
  }

  // --- Logic Gates ---
  private updateLogicGates() {
    for (const gate of this.logicGates) {
      const inputStates = gate.inputIds.map((id) => this.isSourceActive(id));

      if (gate.type === 'AND') {
        gate.isSatisfied = inputStates.every(Boolean);
      } else if (gate.type === 'OR') {
        gate.isSatisfied = inputStates.some(Boolean);
      } else if (gate.type === 'NOT') {
        gate.isSatisfied = !inputStates[0];
      } else if (gate.type === 'COUNT') {
        const activeCount = inputStates.filter(Boolean).length;
        gate.isSatisfied = activeCount >= (gate.requiredCount || 2);
      }
    }
  }

  // --- Energy Barriers ---
  private updateBarriers(
    dt: number,
    player: { pos: Vector2D },
    onShake?: (amt: number) => void
  ) {
    for (const barrier of this.barriers) {
      const sourceActive = this.isSourceActive(barrier.controlledById);
      barrier.isActive = barrier.invertControl ? sourceActive : !sourceActive;

      // If active, check collision with player
      if (barrier.isActive) {
        const distToLine = this.distPointToSegment(
          player.pos.x,
          player.pos.y,
          barrier.x1,
          barrier.y1,
          barrier.x2,
          barrier.y2
        );

        if (distToLine < barrier.thickness + 12) {
          // Push player back away from barrier line
          soundManager.playLaserZap();
          if (onShake) onShake(6);

          const midX = (barrier.x1 + barrier.x2) / 2;
          const midY = (barrier.y1 + barrier.y2) / 2;
          const pushAngle = Math.atan2(player.pos.y - midY, player.pos.x - midX);
          player.pos.x += Math.cos(pushAngle) * 14;
          player.pos.y += Math.sin(pushAngle) * 14;
        }
      }
    }
  }

  // --- Moving Platforms ---
  private updatePlatforms(
    dt: number,
    player: { pos: Vector2D },
    echoes: EchoInstance[]
  ) {
    for (const plat of this.platforms) {
      if (plat.controlledById && !this.isSourceActive(plat.controlledById)) {
        continue;
      }

      if (!plat.waypoints || plat.waypoints.length < 2) continue;

      const target = plat.waypoints[plat.currentWaypointIndex];
      const dx = target.x - plat.x;
      const dy = target.y - plat.y;
      const dist = Math.hypot(dx, dy);

      const step = plat.speed * dt;
      let moveX = 0;
      let moveY = 0;

      if (dist <= step) {
        moveX = dx;
        moveY = dy;
        plat.x = target.x;
        plat.y = target.y;

        // Advance to next waypoint
        if (plat.travelDirection === 1) {
          if (plat.currentWaypointIndex < plat.waypoints.length - 1) {
            plat.currentWaypointIndex++;
          } else {
            plat.travelDirection = -1;
            plat.currentWaypointIndex--;
          }
        } else {
          if (plat.currentWaypointIndex > 0) {
            plat.currentWaypointIndex--;
          } else {
            plat.travelDirection = 1;
            plat.currentWaypointIndex++;
          }
        }
      } else {
        moveX = (dx / dist) * step;
        moveY = (dy / dist) * step;
        plat.x += moveX;
        plat.y += moveY;
      }

      // Carry player if standing on platform
      const halfW = plat.width / 2;
      const halfH = plat.height / 2;
      const cx = plat.x + halfW;
      const cy = plat.y + halfH;

      if (Math.abs(player.pos.x - cx) < halfW && Math.abs(player.pos.y - cy) < halfH) {
        player.pos.x += moveX;
        player.pos.y += moveY;
      }

      // Carry echoes if standing on platform
      for (const echo of echoes) {
        if (Math.abs(echo.x - cx) < halfW && Math.abs(echo.y - cy) < halfH) {
          echo.x += moveX;
          echo.y += moveY;
        }
      }
    }
  }

  // --- Security Doors ---
  private updateDoors(dt: number, onShake?: (amt: number) => void) {
    for (const door of this.doors) {
      let shouldOpen = false;

      // Check required plates or logic targets
      if (door.requiresPlateIds && door.requiresPlateIds.length > 0) {
        shouldOpen = door.requiresPlateIds.every((id) => this.isSourceActive(id));
      }

      if (shouldOpen && !door.isOpen) {
        soundManager.playDoorSlide(true);
        if (onShake) onShake(4);
      } else if (!shouldOpen && door.isOpen) {
        soundManager.playDoorSlide(false);
      }

      door.isOpen = shouldOpen;

      if (door.isOpen) {
        door.openProgress = Math.min(1, door.openProgress + dt * 2.5);
      } else {
        door.openProgress = Math.max(0, door.openProgress - dt * 2.5);
      }
    }
  }

  // --- Environmental Lore Logs ---
  private updateLogs(playerPos: Vector2D) {
    for (const log of this.logs) {
      const dist = Math.hypot(
        playerPos.x - (log.x + log.width / 2),
        playerPos.y - (log.y + log.height / 2)
      );
      if (dist < 36 && !log.isRead) {
        log.isRead = true;
        soundManager.playSensorPulse();
      }
    }
  }

  // --- Helper to resolve source activation state across all puzzle objects ---
  public isSourceActive(id: string): boolean {
    const plate = this.plates.find((p) => p.id === id);
    if (plate) return plate.isPressed;

    const sw = this.switches.find((s) => s.id === id);
    if (sw) return sw.isActive;

    const sensor = this.temporalSensors.find((s) => s.id === id);
    if (sensor) return sensor.isTriggered;

    const term = this.biometricTerminals.find((t) => t.id === id);
    if (term) return term.isCompleted;

    const gate = this.logicGates.find((g) => g.id === id);
    if (gate) return gate.isSatisfied;

    const door = this.doors.find((d) => d.id === id);
    if (door) return door.isOpen;

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

  // --- Rendering Pass for All Advanced Puzzle Objects ---
  public render(ctx: CanvasRenderingContext2D, ambientPulse: number) {
    // 1. Render Moving Platforms
    this.renderPlatforms(ctx, ambientPulse);

    // 2. Render Temporal Sensors (Echo-Only)
    this.renderTemporalSensors(ctx, ambientPulse);

    // 3. Render Interactive Switches
    this.renderSwitches(ctx, ambientPulse);

    // 4. Render Biometric Terminals
    this.renderBiometricTerminals(ctx, ambientPulse);

    // 5. Render Logic Gates
    this.renderLogicGates(ctx, ambientPulse);

    // 6. Render Energy Barriers / Lasers
    this.renderBarriers(ctx, ambientPulse);

    // 7. Render Environmental Story Logs
    this.renderLogs(ctx, ambientPulse);
  }

  private renderPlatforms(ctx: CanvasRenderingContext2D, ambientPulse: number) {
    for (const plat of this.platforms) {
      ctx.save();
      // Platform guide track rail
      if (plat.waypoints && plat.waypoints.length > 1) {
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(plat.waypoints[0].x + plat.width / 2, plat.waypoints[0].y + plat.height / 2);
        for (let i = 1; i < plat.waypoints.length; i++) {
          ctx.lineTo(plat.waypoints[i].x + plat.width / 2, plat.waypoints[i].y + plat.height / 2);
        }
        ctx.stroke();
      }

      // Platform Deck
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
      ctx.fill();
      ctx.stroke();

      // Corner repulsor thruster lights
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(plat.x + 8, plat.y + 8, 3, 0, Math.PI * 2);
      ctx.arc(plat.x + plat.width - 8, plat.y + 8, 3, 0, Math.PI * 2);
      ctx.arc(plat.x + 8, plat.y + plat.height - 8, 3, 0, Math.PI * 2);
      ctx.arc(plat.x + plat.width - 8, plat.y + plat.height - 8, 3, 0, Math.PI * 2);
      ctx.fill();

      // Center Chevron Grip
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      const cx = plat.x + plat.width / 2;
      const cy = plat.y + plat.height / 2;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 4);
      ctx.lineTo(cx, cy + 4);
      ctx.lineTo(cx + 10, cy - 4);
      ctx.stroke();

      if (plat.label) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(plat.label, cx, plat.y - 6);
      }

      ctx.restore();
    }
  }

  private renderTemporalSensors(ctx: CanvasRenderingContext2D, ambientPulse: number) {
    for (const sensor of this.temporalSensors) {
      ctx.save();
      const pulseWave = (ambientPulse * 2) % 1;
      const currentRadius = sensor.radius + pulseWave * 12;

      // Holographic field boundary
      ctx.strokeStyle = sensor.isTriggered ? '#c084fc' : '#a855f7';
      ctx.lineWidth = sensor.isTriggered ? 2.5 : 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(sensor.x, sensor.y, sensor.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Concentric expanding resonance wave
      ctx.strokeStyle = `rgba(192, 132, 252, ${1 - pulseWave})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sensor.x, sensor.y, currentRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Central emitter node
      ctx.fillStyle = sensor.isTriggered ? '#c084fc' : '#581c87';
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = sensor.isTriggered ? 14 : 4;
      ctx.beginPath();
      ctx.arc(sensor.x, sensor.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Label & Filter info
      ctx.fillStyle = '#c084fc';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(sensor.label, sensor.x, sensor.y + sensor.radius + 14);
      ctx.fillStyle = '#a855f7';
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.fillText('[ECHO-RESONANT]', sensor.x, sensor.y + sensor.radius + 24);

      ctx.restore();
    }
  }

  private renderSwitches(ctx: CanvasRenderingContext2D, ambientPulse: number) {
    for (const sw of this.switches) {
      ctx.save();
      const cx = sw.x + sw.width / 2;
      const cy = sw.y + sw.height / 2;

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = sw.isActive ? sw.color : '#334155';
      ctx.lineWidth = 2;
      ctx.shadowColor = sw.isActive ? sw.color : 'transparent';
      ctx.shadowBlur = sw.isActive ? 12 : 0;

      ctx.beginPath();
      ctx.roundRect(sw.x, sw.y, sw.width, sw.height, 6);
      ctx.fill();
      ctx.stroke();

      // Switch Core Indicator
      ctx.fillStyle = sw.isActive ? sw.color : '#1e293b';
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();

      // Timed countdown bar
      if (sw.type === 'TIMED' && sw.isActive) {
        const ratio = Math.max(0, sw.timer / sw.maxDuration);
        ctx.fillStyle = sw.color;
        ctx.fillRect(sw.x + 2, sw.y + sw.height - 4, (sw.width - 4) * ratio, 2);
      }

      ctx.fillStyle = sw.color;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(sw.label, cx, sw.y - 8);

      ctx.restore();
    }
  }

  private renderBiometricTerminals(ctx: CanvasRenderingContext2D, ambientPulse: number) {
    for (const term of this.biometricTerminals) {
      ctx.save();
      const cx = term.x + term.width / 2;
      const cy = term.y + term.height / 2;

      // Terminal housing
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = term.isCompleted ? '#10b981' : term.isScanning ? '#06b6d4' : '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(term.x, term.y, term.width, term.height, 6);
      ctx.fill();
      ctx.stroke();

      // Holographic scan projection fan
      if (term.isScanning && !term.isCompleted) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, 40, -Math.PI * 0.75, -Math.PI * 0.25);
        ctx.closePath();
        ctx.fill();
      }

      // Scan progress ring
      ctx.strokeStyle = term.isCompleted ? '#10b981' : '#06b6d4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * term.scanProgress);
      ctx.stroke();

      ctx.fillStyle = term.isCompleted ? '#34d399' : '#38bdf8';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        term.isCompleted ? 'VERIFIED' : term.isScanning ? `${Math.round(term.scanProgress * 100)}%` : term.label,
        cx,
        term.y + term.height + 14
      );
      ctx.fillStyle = '#64748b';
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.fillText('[LIVE OPERATIVE]', cx, term.y + term.height + 23);

      ctx.restore();
    }
  }

  private renderLogicGates(ctx: CanvasRenderingContext2D, ambientPulse: number) {
    for (const gate of this.logicGates) {
      const connectedDoor = this.doors.find((d) => d.id === gate.outputTargetId);
      if (!connectedDoor) continue;

      ctx.save();
      const gx = connectedDoor.x - 36;
      const gy = connectedDoor.y + connectedDoor.height / 2;

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = gate.isSatisfied ? '#10b981' : '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(gx - 20, gy - 12, 40, 24, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = gate.isSatisfied ? '#34d399' : '#94a3b8';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(gate.label, gx, gy + 3);

      ctx.restore();
    }
  }

  private renderBarriers(ctx: CanvasRenderingContext2D, ambientPulse: number) {
    for (const barrier of this.barriers) {
      ctx.save();

      // Emitter pylons at start and end
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = barrier.isActive ? barrier.color : '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(barrier.x1, barrier.y1, 6, 0, Math.PI * 2);
      ctx.arc(barrier.x2, barrier.y2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (barrier.isActive) {
        // High-voltage laser beam
        ctx.strokeStyle = barrier.color;
        ctx.lineWidth = barrier.thickness;
        ctx.shadowColor = barrier.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(barrier.x1, barrier.y1);
        ctx.lineTo(barrier.x2, barrier.y2);
        ctx.stroke();

        // White core filament
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = barrier.thickness * 0.4;
        ctx.shadowBlur = 4;
        ctx.stroke();

        // Electric lightning jitter
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(barrier.x1, barrier.y1);
        const steps = 6;
        for (let i = 1; i < steps; i++) {
          const ratio = i / steps;
          const px = barrier.x1 + (barrier.x2 - barrier.x1) * ratio + (Math.random() - 0.5) * 6;
          const py = barrier.y1 + (barrier.y2 - barrier.y1) * ratio + (Math.random() - 0.5) * 6;
          ctx.lineTo(px, py);
        }
        ctx.lineTo(barrier.x2, barrier.y2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private renderLogs(ctx: CanvasRenderingContext2D, ambientPulse: number) {
    for (const log of this.logs) {
      ctx.save();
      const cx = log.x + log.width / 2;
      const cy = log.y + log.height / 2;

      // Rotating holographic data terminal icon
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ambientPulse * 0.8);
      ctx.strokeStyle = log.isRead ? '#38bdf8' : '#eab308';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(-8, -8, 16, 16);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = log.isRead ? '#38bdf8' : '#eab308';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = log.isRead ? '#94a3b8' : '#fde047';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(log.title, cx, log.y - 8);

      ctx.restore();
    }
  }
}
