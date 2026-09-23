/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vector2D } from './game';

export type ActivationFilter = 'ANY_ENTITY' | 'PLAYER_ONLY' | 'ECHO_ONLY';
export type SwitchType = 'TOGGLE' | 'MOMENTARY' | 'TIMED';
export type DoorType = 'LOCKED' | 'PRESSURE' | 'TIMED' | 'SEQUENCE';
export type LogicGateType = 'AND' | 'OR' | 'NOT' | 'SEQUENCE' | 'COUNT' | 'TIMED';

export interface InteractiveSwitch {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: SwitchType;
  filter: ActivationFilter;
  isActive: boolean;
  timer: number;
  maxDuration: number; // in seconds (for TIMED)
  label: string;
  color: string;
  connectsToId: string;
}

export interface EnergyBarrier {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
  isActive: boolean;
  color: string;
  controlledById: string; // Id of switch, plate, or logic gate
  invertControl?: boolean; // if true, barrier is active when controller is false
  label?: string;
  flickerOffset?: number;
}

export interface MovingPlatform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  waypoints: Vector2D[];
  currentWaypointIndex: number;
  speed: number;
  isActive: boolean;
  controlledById?: string;
  label?: string;
  travelDirection: 1 | -1;
}

export interface TemporalSensor {
  id: string;
  x: number;
  y: number;
  radius: number;
  filter: ActivationFilter; // Commonly 'ECHO_ONLY'
  isTriggered: boolean;
  pulseTimer: number;
  connectsToId: string;
  label: string;
  color: string;
}

export interface BiometricTerminal {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  filter: 'PLAYER_ONLY';
  isScanning: boolean;
  scanProgress: number; // 0.0 to 1.0 (requires continuous presence/interaction)
  isCompleted: boolean;
  connectsToId: string;
  label: string;
}

export interface LogicGate {
  id: string;
  type: LogicGateType;
  inputIds: string[];
  outputTargetId: string;
  isSatisfied: boolean;
  requiredSequence?: string[];
  currentSequence?: string[];
  requiredCount?: number;
  label: string;
}

export interface EnvironmentalLog {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  classification: string;
  summary: string;
  timestamp: string;
  isRead: boolean;
}
