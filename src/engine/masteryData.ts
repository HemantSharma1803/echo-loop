/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelChallengeConfig, LevelMasteryRequirements, GameAchievement } from '../types/engagement';

export const LEVEL_MASTERY_CONFIGS: Record<number, LevelMasteryRequirements> = {
  1: {
    recommendedLoops: 2,
    timeTargetSeconds: 8.5,
    challenge: {
      id: 'challenge-1',
      levelId: 1,
      title: 'ELEGANT EXTRACTION',
      description: 'Breach Bulkhead A-1 in no more than 2 loops with zero unnecessary resets.',
      type: 'MAX_LOOPS',
      targetValue: 2,
      hint: 'Move directly to Relay α without hesitation; on Loop 2, advance straight through the open bulkhead.',
    },
  },
  2: {
    recommendedLoops: 2,
    timeTargetSeconds: 11.0,
    challenge: {
      id: 'challenge-2',
      levelId: 2,
      title: 'MINIMAL FOOTPRINT',
      description: 'Reach the exit using only a single past Echo (2 total loops).',
      type: 'MAX_ECHOES',
      targetValue: 1,
      hint: 'Have Echo 1 toggle Switch α, then let the live operative move directly to Relay β and sprint to the exit.',
    },
  },
  3: {
    recommendedLoops: 2,
    timeTargetSeconds: 12.0,
    challenge: {
      id: 'challenge-3',
      levelId: 3,
      title: 'PERFECT TRANSIT',
      description: 'Board the platform and unlock Gate C-3 without triggering any timeline reset.',
      type: 'MAX_LOOPS',
      targetValue: 2,
      hint: 'Flip the platform switch early in loop 1, then coordinate boarding precisely on loop 2.',
    },
  },
  4: {
    recommendedLoops: 2,
    timeTargetSeconds: 13.5,
    challenge: {
      id: 'challenge-4',
      levelId: 4,
      title: 'GHOST INERTIA',
      description: 'Trip the Tachyon Sensor and complete live Biometrics without triggering any temporal paradox.',
      type: 'NO_PARADOX',
      targetValue: 0,
      hint: 'Record a fluid run through the sensor zone; live operative holds at the terminal until completion.',
    },
  },
  5: {
    recommendedLoops: 3,
    timeTargetSeconds: 16.0,
    challenge: {
      id: 'challenge-5',
      levelId: 5,
      title: 'HARMONIC SURGE',
      description: 'Saturate the Resonance Node to full stabilization with maximum temporal efficiency.',
      type: 'MAX_LOOPS',
      targetValue: 3,
      hint: 'Stack multiple Echoes onto the Resonance Node in consecutive loops to achieve exponential charge.',
    },
  },
  6: {
    recommendedLoops: 4,
    timeTargetSeconds: 19.0,
    challenge: {
      id: 'challenge-6',
      levelId: 6,
      title: 'ORCHESTRATED SINGULARITY',
      description: 'Breach the Master Singularity Airlock using no more than 3 Echoes with >85% Chrono-Efficiency.',
      type: 'MAX_ECHOES',
      targetValue: 3,
      hint: 'Each Echo must execute a dedicated role (Relay α, Sensor γ, Chronopad α) without wasted movement.',
    },
  },
};

export const INITIAL_ACHIEVEMENTS: GameAchievement[] = [
  {
    id: 'first-trace',
    title: 'FIRST TRACE',
    description: 'Record your first past Echo and breach an environmental bulkhead.',
    unlocked: false,
    category: 'CHRONO',
    icon: 'Footprints',
  },
  {
    id: 'two-of-me',
    title: 'TWO OF ME',
    description: 'Successfully cooperate with an Echo to solve a multi-switch relay.',
    unlocked: false,
    category: 'CHRONO',
    icon: 'Users',
  },
  {
    id: 'temporalist',
    title: 'TEMPORALIST',
    description: 'Complete any facility sector at or under its recommended loop target.',
    unlocked: false,
    category: 'MASTERY',
    icon: 'Clock',
  },
  {
    id: 'paradox-free',
    title: 'CAUSAL PURITY',
    description: 'Clear Level 04 or Level 06 with 100% timeline stability and zero paradoxes.',
    unlocked: false,
    category: 'MASTERY',
    icon: 'ShieldCheck',
  },
  {
    id: 'harmonic-convergence',
    title: 'HARMONIC CONVERGENCE',
    description: 'Synchronize dual chronopads within a precise temporal window.',
    unlocked: false,
    category: 'CHRONO',
    icon: 'Zap',
  },
  {
    id: 'archivist',
    title: 'ATRF ARCHIVIST',
    description: 'Recover at least 4 optional encrypted memory fragments or audio logs.',
    unlocked: false,
    category: 'EXPLORATION',
    icon: 'Database',
  },
  {
    id: 'grand-master',
    title: 'TEMPORAL ARCHITECT',
    description: 'Achieve MASTERED status on 3 or more facility sectors.',
    unlocked: false,
    category: 'MASTERY',
    icon: 'Award',
  },
  {
    id: 'crucible-shattered',
    title: 'SHATTER THE CRUCIBLE',
    description: 'Complete Sector 01: The Three Moments and unlock the deep facility archives.',
    unlocked: false,
    category: 'CHRONO',
    icon: 'Radio',
  },
  // SECRET ACHIEVEMENTS
  {
    id: 'not-the-first',
    title: 'NOT THE FIRST',
    description: 'Encounter the Unknown Echo and observe its impossible presence in the facility.',
    secretDescription: '??? [CLASSIFIED CAUSAL ANOMALY] Discover the presence that precedes your loop.',
    isSecret: true,
    unlocked: false,
    category: 'ANOMALY',
    icon: 'Sparkles',
  },
  {
    id: 'temporal-ghost',
    title: 'GHOST CADENCE',
    description: 'Inspect your Echo History and replay a level with a tighter execution path.',
    secretDescription: '??? [INSPECT THE TRACE] Replay a cleared sector to analyze your Echo history.',
    isSecret: true,
    unlocked: false,
    category: 'EXPLORATION',
    icon: 'History',
  },
];
