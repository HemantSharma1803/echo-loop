/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vector2D } from './game';

export type SubjectDesignation = 'SUBJECT: UNKNOWN' | 'BIOMETRIC MATCH DETECTED...' | 'SUBJECT 07';

export interface AegisTransmission {
  id: string;
  sender: 'AEGIS CORE' | 'FACILITY DIRECTIVE' | 'RESEARCH ARCHIVE' | 'CORRUPTED MEMORY';
  text: string;
  subtext?: string;
  duration: number; // Seconds to display
  priority?: 'NORMAL' | 'ALERT' | 'GLITCH';
}

export type MemoryFragmentTheme = 
  | 'LAB_AWAKENING'
  | 'QUARANTINE_SEAL'
  | 'OBSERVATION_DESK'
  | 'TACHYON_FIELD'
  | 'RESONANCE_CHAMBER'
  | 'CORE_ANOMALY';

export interface MemoryFragment {
  id: string;
  levelId: number;
  title: string;
  designation: string;
  timestamp: string;
  speaker: string;
  quote: string;
  narrativeText: string;
  theme: MemoryFragmentTheme;
  isDiscovered: boolean;
}

export interface UnknownEchoEntity {
  id: string;
  levelId: number;
  x: number;
  y: number;
  facing: 1 | -1;
  state: 'OBSERVING' | 'INTERACTING' | 'FADING' | 'VANISHED';
  vanishDistance: number;
  distanceToPlayer: number;
  alpha: number;
  actionDescription: string;
  discovered: boolean;
}

export type NarrativeBeatId =
  | 'BEAT_1_AWAKENING'
  | 'BEAT_2_FIRST_ECHO'
  | 'BEAT_3_PREVIOUS_EXPERIMENTS'
  | 'BEAT_4_TEMPORAL_RESEARCH'
  | 'BEAT_5_INTENTIONAL_SEAL'
  | 'BEAT_6_IDENTITY_RECOGNITION'
  | 'BEAT_7_FINAL_REVELATION';

export interface StoryProgressionState {
  subjectStatus: SubjectDesignation;
  completedBeats: NarrativeBeatId[];
  discoveredFragments: string[];
  discoveredLogs: string[];
  seenUnknownEchoes: string[];
  hasSeenOpeningCinematic: boolean;
  facilityPowerTier: 1 | 2 | 3;
}
