/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vector2D } from './game';

export type ActorType = 'PLAYER' | 'ECHO';

export type TemporalEventType =
  | 'plate_press'
  | 'plate_release'
  | 'switch_toggle'
  | 'sensor_trip'
  | 'terminal_scan'
  | 'door_breach'
  | 'memory_read'
  | 'resonance_pulse'
  | 'resonance_stabilize'
  | 'sync_achieved'
  | 'phase_shift'
  | 'paradox_occurred'
  | 'paradox_cleared'
  | 'anomaly_contact';

export interface TemporalEvent {
  id: string;
  loopNumber: number;
  timestamp: number;
  eventType: TemporalEventType;
  position: Vector2D;
  objectId: string;
  actorType: ActorType;
  actorId: string;
  metadata?: Record<string, unknown>;
}

// 1. Temporal Memory Objects
export type MemoryObjectType = 'CONSOLE' | 'ARCHIVE' | 'BEACON' | 'TERMINAL' | 'FRAGMENT';

export interface MemoryClue {
  requiredInteractions: number;
  title: string;
  glyph: string;
  content: string;
  unlocked: boolean;
}

export interface TemporalMemoryObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: MemoryObjectType;
  label: string;
  title: string;
  clues: MemoryClue[];
  activeInteraction: boolean;
  interactionProgress: number; // 0 -> 1
  revealedMessage?: string;
  totalEchoInteractions: number;
  glitchTimer: number;
  isUnlocked: boolean;
}

// 2. Temporal Resonance
export type ResonanceState = 'DORMANT' | 'CHARGING' | 'RESONATING' | 'OVERLOADED' | 'STABILIZED';

export interface ResonanceNode {
  id: string;
  x: number;
  y: number;
  radius: number;
  state: ResonanceState;
  charge: number; // 0.0 to 1.0
  threshold: number; // required activations across loops or simultaneous
  requiredSimultaneous: number; // e.g., 2 echoes or echo + player
  currentOccupants: number;
  connectsToId: string; // opens door, drops barrier, shifts phase
  label: string;
  color: string;
  pulseRadius: number;
  loopsContributed: number[];
}

// 3. Temporal Paradox
export type ParadoxStatus = 'STABLE' | 'DISTURBED' | 'UNSTABLE' | 'PARADOX' | 'COLLAPSE';

export interface ParadoxConflict {
  id: string;
  objectId: string;
  description: string;
  severity: number; // 0 to 1
  timestamp: number;
  isResolved: boolean;
}

// 4. Echo Synchronization
export interface EchoSyncPair {
  id: string;
  nodeA: { x: number; y: number; radius: number; label: string; occupied: boolean; actorType?: ActorType };
  nodeB: { x: number; y: number; radius: number; label: string; occupied: boolean; actorType?: ActorType };
  syncWindow: number; // in seconds (e.g. 1.5)
  currentSyncTime: number;
  isSynchronized: boolean;
  connectsToId: string;
  label: string;
  color: string;
}

// 5. Echo Shadow Zones
export interface EchoShadowZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  intensity: number;
  revealsSecretId?: string; // id of hidden object / path revealed inside zone
  isEchoInside: boolean;
}

// 6. Temporal Phase Objects
export type PhaseState = 'PHASE_A' | 'PHASE_B' | 'PHASE_C';

export interface TemporalPhaseObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'PHASE_DOOR' | 'PHASE_PLATFORM' | 'PHASE_BARRIER' | 'PHASE_BRIDGE';
  currentPhase: PhaseState;
  controlledById?: string;
  label: string;
  phaseAPermeable: boolean; // permeable to player
  phaseBPermeable: boolean;
  phaseCPermeable: boolean; // permeable only to echoes
  transitionTimer: number; // 0 to 1
}

// 7. Temporal Anomalies
export interface TemporalAnomaly {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'CHRONO_VORTEX' | 'FROZEN_SHARDS' | 'ECHO_RIPPLE';
  distortionFactor: number;
  rotation: number;
  pulseTimer: number;
  label: string;
}

// 8. Echo Roles
export type EchoRoleType = 'SCOUT' | 'ACTIVATOR' | 'GUARDIAN' | 'CHRONO_OPERATIVE' | 'SYNC_PARTNER';

export interface EchoRoleAnalysis {
  role: EchoRoleType;
  description: string;
  badge: string;
  activationsCount: number;
  stationaryRatio: number;
  distanceTraveled: number;
}
