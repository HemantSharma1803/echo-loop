/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LevelChallengeConfig {
  id: string;
  levelId: number;
  title: string;
  description: string;
  type: 'MAX_LOOPS' | 'MAX_ECHOES' | 'NO_PARADOX' | 'RESONANCE_SPEED' | 'SECRET_COLLECTOR' | 'TIME_TRIAL';
  targetValue: number;
  hint: string;
}

export interface LevelMasteryRequirements {
  recommendedLoops: number;
  timeTargetSeconds: number;
  challenge: LevelChallengeConfig;
}

export interface LevelMasteryStatus {
  levelId: number;
  isCompleted: boolean;
  isMastered: boolean;
  bestLoops: number;
  bestTime: number;
  bestEfficiency: number; // 0 to 100 percentage
  challengeCompleted: boolean;
  discoveredSecretIds: string[];
}

export interface EchoHistoryEntry {
  echoIndex: number;
  label: string;
  color: string;
  duration: number;
  distanceTraveled: number;
  role: string;
  keyActionSummary: string;
  timelineSamplePoints: { t: number; x: number; y: number; isInteracting: boolean }[];
}

export interface TemporalRunRecord {
  levelId: number;
  loops: number;
  echoesCount: number;
  elapsedSeconds: number;
  efficiencyPercent: number;
  date: string;
  pathSnippet: { x: number; y: number }[]; // Player final loop path for ghost run visualizer
}

export interface GameAchievement {
  id: string;
  title: string;
  description: string;
  secretDescription?: string;
  isSecret?: boolean;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'CHRONO' | 'MASTERY' | 'EXPLORATION' | 'ANOMALY';
  icon: string;
}

export interface ReplayStateConfig {
  isReplaying: boolean;
  replayLevelIndex: number;
  isTimeTrialMode: boolean;
}
