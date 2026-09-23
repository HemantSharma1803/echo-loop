/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameState =
  | 'TITLE'
  | 'INTRO'
  | 'PLAYING'
  | 'PAUSED'
  | 'LOOP_END'
  | 'LEVEL_COMPLETE'
  | 'SETTINGS'
  | 'HOW_TO_PLAY';

export type LoopState =
  | 'IDLE'
  | 'RECORDING'
  | 'ENDING'
  | 'RESETTING'
  | 'REPLAYING'
  | 'ACTIVE';

export interface Vector2D {
  x: number;
  y: number;
}

export interface ActionEvent {
  t: number;
  type: 'interact_start' | 'interact_end' | 'trigger';
  targetId?: string;
}

export interface PlayerActionFrame {
  t: number;             // Time in seconds from loop start
  x: number;             // Player X
  y: number;             // Player Y
  vx: number;            // Velocity X
  vy: number;            // Velocity Y
  facing: 1 | -1;        // Facing right (1) or left (-1)
  isMoving: boolean;
  isInteracting: boolean;
  animFrame: number;     // Walk cycle animation ticker
}

export interface ActionTimeline {
  loopIndex: number;
  frames: PlayerActionFrame[];
  events: ActionEvent[];
  duration: number;
}

export interface EchoVisualTheme {
  primaryColor: string;
  accentColor: string;
  trailColor: string;
  opacity: number;
  scanlineColor: string;
  label: string;
}

export interface EchoInstance {
  id: string;
  loopNumber: number;
  timeline: ActionTimeline;
  currentFrameIndex: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  isMoving: boolean;
  isInteracting: boolean;
  animFrame: number;
  spawnGlitchTimer: number; // For temporal spawn distortion effect
  theme: EchoVisualTheme;
  isFinished: boolean;      // True if timeline reached the end (stays at final spot)
}

export interface DebugInfo {
  loopState: LoopState;
  loopNumber: number;
  loopTimer: number;
  loopDuration: number;
  echoCount: number;
  recordedFrameCount: number;
  fps: number;
  playerPos: Vector2D;
  playerVel: Vector2D;
}

import {
  ActivationFilter,
  DoorType,
  InteractiveSwitch,
  EnergyBarrier,
  MovingPlatform,
  TemporalSensor,
  BiometricTerminal,
  LogicGate,
  EnvironmentalLog,
} from './puzzle';

import {
  TemporalMemoryObject,
  ResonanceNode,
  EchoSyncPair,
  EchoShadowZone,
  TemporalPhaseObject,
  TemporalAnomaly,
} from './innovation';

export interface PressurePlate {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isPressed: boolean;
  activeTimer: number; // Visual press interpolation 0 -> 1
  connectsToDoorId: string;
  label: string;
  color: string; // e.g. '#06b6d4', '#f59e0b', '#ec4899'
  filter?: ActivationFilter;
  isTimed?: boolean;
  duration?: number;
  timer?: number;
}

export interface SecurityDoor {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isOpen: boolean;
  openProgress: number; // 0 (closed) -> 1 (fully open)
  isExitDoor: boolean;
  label: string;
  requiresPlateIds: string[];
  doorType?: DoorType;
  timer?: number;
  maxTimer?: number;
}

export interface WallObstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'wall' | 'console' | 'laser' | 'vent' | 'pillar';
  label?: string;
  isHazard?: boolean;
}

export interface FloorWire {
  from: Vector2D;
  to: Vector2D;
  waypoints?: Vector2D[];
  connectedPlateId: string;
  color: string;
}

export interface AmbientLight {
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity: number;
  flickerSpeed?: number;
}

export interface OptionalSecret {
  id: string;
  name: string;
  description: string;
  type: 'TERMINAL' | 'MEMORY_SHARD' | 'ANOMALY_CRYSTAL' | 'ARCHIVE_AUDIO';
  x: number;
  y: number;
  radius: number;
  isDiscovered: boolean;
  glyph: string;
}

export interface LevelCinematicIntro {
  title: string;
  sectorTag: string;
  zoneTag: string;
  briefingSnippet: string;
  duration?: number;
}

export interface LevelCompletionSequence {
  fanfareType: 'STANDARD' | 'MAJOR' | 'FINALE';
  message: string;
  unlockedInsight?: string;
}

export interface LevelConfig {
  id: number;
  sectorCode: string;
  name: string;
  subtitle: string;
  objective: string;
  briefing: string;
  loopDuration: number; // in seconds (e.g. 15s)
  playerSpawn: Vector2D;
  exitPoint: Vector2D;
  bounds: { width: number; height: number };
  environmentalZone?: string;
  difficultyTarget?: number; // 1-4 internal target
  requiredMechanics?: string[];
  optionalSecrets?: OptionalSecret[];
  cinematicIntro?: LevelCinematicIntro;
  completionSequence?: LevelCompletionSequence;
  plates: PressurePlate[];
  doors: SecurityDoor[];
  switches?: InteractiveSwitch[];
  barriers?: EnergyBarrier[];
  platforms?: MovingPlatform[];
  temporalSensors?: TemporalSensor[];
  biometricTerminals?: BiometricTerminal[];
  logicGates?: LogicGate[];
  logs?: EnvironmentalLog[];
  obstacles: WallObstacle[];
  wires: FloorWire[];
  ambientLights: AmbientLight[];
  // Segment 4: Innovation Mechanics
  memoryObjects?: TemporalMemoryObject[];
  resonanceNodes?: ResonanceNode[];
  syncPairs?: EchoSyncPair[];
  shadowZones?: EchoShadowZone[];
  phaseObjects?: TemporalPhaseObject[];
  anomalies?: TemporalAnomaly[];
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  alpha: number;
  type: 'spark' | 'temporal' | 'glitch' | 'footstep' | 'ring' | 'haze';
}

export interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  ambientVolume?: number;
  temporalVolume?: number;
  uiVolume?: number;
  screenShake: boolean;
  scanlines: boolean;
  touchControls: 'auto' | 'always' | 'disabled';
  showDebugOverlay: boolean;
  graphicsQuality?: 'high' | 'medium' | 'low';
  reducedMotion?: boolean;
}
