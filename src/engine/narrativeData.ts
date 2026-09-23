/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MemoryFragment, UnknownEchoEntity, AegisTransmission } from '../types/narrative';

export const FACILITY_NAME = 'AEGIS TEMPORAL RESEARCH FACILITY';
export const FACILITY_DESIGNATION = 'ATRF-01';

export const MEMORY_FRAGMENTS: MemoryFragment[] = [
  {
    id: 'secret-1',
    levelId: 1,
    title: 'PROJECT INITIATION // SUBJECT ASSIGNMENT',
    designation: 'ARCHIVE LOG #01-A',
    timestamp: 'CYCLE 001.04 - ATRF-01 LAB 01',
    speaker: 'DR. A. VANCE // CHIEF TEMPORAL BIOLOGIST',
    quote: '"The neural baseline is locked. Subject\'s motor memory shows complete stability across tachyon field shifts."',
    narrativeText:
      'A flickering observation log. Dr. Vance notes that the operative was volunteered for the deepest temporal recursion experiment ever conducted by the Aegis Directorate.',
    theme: 'LAB_AWAKENING',
    isDiscovered: false,
  },
  {
    id: 'secret-2',
    levelId: 2,
    title: 'BEHAVIORAL DIVERGENCE',
    designation: 'SECURITY RECORD #02-D',
    timestamp: 'CYCLE 014.19 - SURVEILLANCE NODE B',
    speaker: 'SECURITY ADVISOR K. CHEN',
    quote: '"The Echoes are not merely replaying recordings. They are leaving physical kinetic inertia behind."',
    narrativeText:
      'Facility telemetry proves past iterations exert genuine gravitational and mechanical force on switches and pressure nodes. The loops are accumulating real mass.',
    theme: 'OBSERVATION_DESK',
    isDiscovered: false,
  },
  {
    id: 'secret-3',
    levelId: 3,
    title: 'CAUSAL DRIFT WARNING',
    designation: 'TELEMETRY VAULT #03-T',
    timestamp: 'CYCLE 042.88 - AUTOMATED CHRONO-CORE',
    speaker: 'AEGIS AUTOMATED MONITORING',
    quote: '"Warning: Timeline drift rate is 32ms per loop. Biological decay is zero, but cognitive synchronization is fracturing."',
    narrativeText:
      'Automated systems flagged severe time-lag between the operative\'s physical perception and the facility clock. The loops began resetting faster than recorded human consciousness could stabilize.',
    theme: 'QUARANTINE_SEAL',
    isDiscovered: false,
  },
  {
    id: 'secret-4',
    levelId: 4,
    title: 'TACHYON PURGE DIRECTIVE',
    designation: 'INCIDENT REPORT #04-G',
    timestamp: 'CYCLE 089.02 - SECURITY AIRLOCK',
    speaker: 'DIRECTOR M. HOLLOWAY',
    quote: '"Seal the sector. If the Echoes cross into the residential wing, causality collapses facility-wide. Subject 07 must remain contained."',
    narrativeText:
      'Security footage captures the complete evacuation of ATRF-01. The blast gates were not locked to keep something out—they were locked from the outside to keep the operative within the recursive field.',
    theme: 'TACHYON_FIELD',
    isDiscovered: false,
  },
  {
    id: 'secret-5',
    levelId: 5,
    title: 'THE HARMONIC SINGULARITY',
    designation: 'RESEARCH TRANSCRIPTION #05-R',
    timestamp: 'CYCLE 112.51 - RESONANCE SUB-LEVEL',
    speaker: 'DR. A. VANCE',
    quote: '"It was never an accident. The loop was built to preserve them. Every iteration charges the core until the threshold is reached."',
    narrativeText:
      'A decrypted personal voice note. Vance claims the catastrophic breach was predicted weeks in advance. The recursion protocol was implemented as an emergency life-preservation cocoon for Subject 07.',
    theme: 'RESONANCE_CHAMBER',
    isDiscovered: false,
  },
  {
    id: 'secret-6',
    levelId: 6,
    title: 'BEFORE THE COLLAPSE',
    designation: 'MASTER TERMINAL LOG #06-Ω',
    timestamp: 'CYCLE 144.00 - MASTER SINGULARITY CORE',
    speaker: 'UNIDENTIFIED OPERATIVE',
    quote: '"Who do you think designed the recovery protocol, operative? Look at the terminal authorization code."',
    narrativeText:
      'System authorization records show the emergency loop lockdown was initiated with the exact biometric key card carried by Subject 07. The operative trapped themselves here deliberately.',
    theme: 'CORE_ANOMALY',
    isDiscovered: false,
  },
];

export const INITIAL_UNKNOWN_ECHOES: UnknownEchoEntity[] = [
  {
    id: 'unknown-echo-lvl2',
    levelId: 2,
    x: 740,
    y: 160,
    facing: -1,
    state: 'OBSERVING',
    vanishDistance: 130,
    distanceToPlayer: 999,
    alpha: 0.85,
    actionDescription: 'Tapping on a dormant security monitor on the observation catwalk',
    discovered: false,
  },
  {
    id: 'unknown-echo-lvl4',
    levelId: 4,
    x: 460,
    y: 180,
    facing: -1,
    state: 'OBSERVING',
    vanishDistance: 140,
    distanceToPlayer: 999,
    alpha: 0.85,
    actionDescription: 'Standing motionless behind the laser grid, staring towards your entry point',
    discovered: false,
  },
  {
    id: 'unknown-echo-lvl6',
    levelId: 6,
    x: 850,
    y: 190,
    facing: -1,
    state: 'OBSERVING',
    vanishDistance: 150,
    distanceToPlayer: 999,
    alpha: 0.9,
    actionDescription: 'Gazing into the extraction airlock before slipping through solid bulkhead',
    discovered: false,
  },
];

export const STORY_BEATS_TRANSMISSIONS: Record<string, AegisTransmission> = {
  LEVEL_1_START: {
    id: 'aegis-1-start',
    sender: 'AEGIS CORE',
    text: 'FACILITY RECOVERY INITIATED // SUBJECT: UNKNOWN // CONTAINMENT: UNSTABLE',
    subtext: 'TEMPORAL DISPLACEMENT IMMINENT. SECURE THE EXIT AIRLOCK.',
    duration: 5.5,
    priority: 'NORMAL',
  },
  LEVEL_1_REWIND: {
    id: 'aegis-1-rewind',
    sender: 'AEGIS CORE',
    text: 'TEMPORAL RECURSION COMPLETE. PHYSICAL TRACE DETECTED IN ACTIVE TIMELINE.',
    subtext: 'PAST MASS PERSISTENCE CONFIRMED. YOUR ACTIONS REMAIN.',
    duration: 5.0,
    priority: 'GLITCH',
  },
  LEVEL_2_START: {
    id: 'aegis-2-start',
    sender: 'AEGIS CORE',
    text: 'AUXILIARY POWER ONLINE // DUAL SPATIAL ANCHORS DETECTED',
    subtext: 'SIMULTANEOUS ACTIVATION REQUIRED. COOPERATE WITH PRIOR TIMELINES.',
    duration: 5.0,
    priority: 'NORMAL',
  },
  LEVEL_3_START: {
    id: 'aegis-3-start',
    sender: 'AEGIS CORE',
    text: 'CAUSAL COMPRESSION ACTIVE // NARROW TEMPORAL WINDOWS DETECTED',
    subtext: 'MOMENTUM AND TIMING WILL DECAY UPON LOOP EXPIRY.',
    duration: 5.0,
    priority: 'NORMAL',
  },
  LEVEL_4_START: {
    id: 'aegis-4-start',
    sender: 'AEGIS CORE',
    text: 'BIOMETRIC RECOGNITION ONLINE... SCANNING NEURAL PATTERNS',
    subtext: 'TACHYON SENSOR TUNED TO GHOST SIGNATURES ONLY.',
    duration: 5.0,
    priority: 'NORMAL',
  },
  LEVEL_4_BIOMETRIC: {
    id: 'aegis-4-bio',
    sender: 'AEGIS CORE',
    text: 'BIOMETRIC MATCH CONFIRMED: SUBJECT 07 // CLEARANCE GRANTED',
    subtext: 'IDENTITY REGISTERED. FACILITY RESTRICTION PARTIALLY LIFTED.',
    duration: 5.5,
    priority: 'ALERT',
  },
  LEVEL_5_START: {
    id: 'aegis-5-start',
    sender: 'AEGIS CORE',
    text: 'HARMONIC CORE α RESONATING // RESIDUAL CHARGE ACCUMULATING',
    subtext: 'TEMPORAL ENERGY ACCUMULATES ACROSS ITERATIONS.',
    duration: 5.0,
    priority: 'NORMAL',
  },
  LEVEL_6_START: {
    id: 'aegis-6-start',
    sender: 'AEGIS CORE',
    text: 'CRITICAL CONVERGENCE // MASTER SINGULARITY CORE BREACH DETECTED',
    subtext: 'THREE CONCURRENT TIMELINES REQUIRED TO DEACTIVATE QUARANTINE.',
    duration: 5.5,
    priority: 'ALERT',
  },
};
