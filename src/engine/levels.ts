/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelConfig } from '../types/game';

export const LEVELS: LevelConfig[] = [
  // =========================================================================
  // LEVEL 01 — FIRST TRACE (TEACH)
  // Purpose: Teach the fundamental Echo mechanic safely, clearly, and elegantly.
  // Loop 1: Player walks to Relay α, stands on it.
  // Loop 2: Echo holds Relay α. Live player walks through Bulkhead A-1 to Exit.
  // =========================================================================
  {
    id: 1,
    sectorCode: 'SECTOR 01',
    name: 'FIRST TRACE',
    subtitle: 'Research Corridor // Sub-Level 01',
    objective: 'Record your past Echo holding Relay α to keep Bulkhead A-1 open.',
    briefing:
      'You awaken inside an abandoned tachyon research facility. The primary security bulkhead requires continuous weight on Relay α to remain open. One operative cannot hold the plate and reach the door alone. Let your past self do the work.',
    loopDuration: 12.0,
    playerSpawn: { x: 140, y: 300 },
    exitPoint: { x: 840, y: 300 },
    bounds: { width: 960, height: 600 },
    environmentalZone: 'RESEARCH CORRIDOR',
    difficultyTarget: 1,
    requiredMechanics: ['ECHO_RECORDING', 'PRESSURE_PLATE', 'LOOP_RESET'],
    cinematicIntro: {
      sectorTag: 'SECTOR 01: THE AWAKENING',
      title: 'LEVEL 01 // FIRST TRACE',
      zoneTag: 'ZONE: RESEARCH CORRIDOR [SUB-LEVEL 01]',
      briefingSnippet: 'Contained loop active. Past iterations will repeat recorded actions.',
      duration: 2.8,
    },
    completionSequence: {
      fanfareType: 'STANDARD',
      message: 'PRIMARY CHRONO-REPLAY ESTABLISHED. You have harnessed your past self.',
      unlockedInsight: 'Echoes are not memories—they possess physical mass and presence in the facility.',
    },
    optionalSecrets: [
      {
        id: 'secret-1',
        name: 'PROJECT ECHO // GENESIS LOG',
        description: 'First research log describing the localized closed timelike curve discovery.',
        type: 'TERMINAL',
        x: 180,
        y: 120,
        radius: 32,
        isDiscovered: false,
        glyph: 'α',
      },
    ],
    plates: [
      {
        id: 'plate-1',
        x: 280,
        y: 190,
        width: 52,
        height: 52,
        isPressed: false,
        activeTimer: 0,
        connectsToDoorId: 'door-1',
        label: 'RELAY α',
        color: '#06b6d4',
      },
    ],
    doors: [
      {
        id: 'door-1',
        x: 520,
        y: 230,
        width: 24,
        height: 140,
        isOpen: false,
        openProgress: 0,
        isExitDoor: false,
        label: 'BULKHEAD A-1',
        requiresPlateIds: ['plate-1'],
      },
    ],
    obstacles: [
      // Wall separating chamber 1 and chamber 2 with doorway at center
      { x: 520, y: 50, width: 24, height: 180, type: 'wall' },
      { x: 520, y: 370, width: 24, height: 180, type: 'wall' },
      { x: 180, y: 110, width: 64, height: 32, type: 'console', label: 'SYS_INIT' },
      { x: 380, y: 420, width: 44, height: 44, type: 'pillar' },
      { x: 700, y: 160, width: 44, height: 44, type: 'pillar' },
      { x: 700, y: 400, width: 44, height: 44, type: 'pillar' },
    ],
    wires: [
      {
        from: { x: 306, y: 216 },
        to: { x: 520, y: 300 },
        waypoints: [
          { x: 420, y: 216 },
          { x: 420, y: 300 },
        ],
        connectedPlateId: 'plate-1',
        color: '#06b6d4',
      },
    ],
    ambientLights: [
      { x: 140, y: 300, radius: 170, color: '#38bdf8', intensity: 0.38 },
      { x: 306, y: 216, radius: 150, color: '#06b6d4', intensity: 0.45 },
      { x: 520, y: 300, radius: 150, color: '#38bdf8', intensity: 0.4 },
      { x: 840, y: 300, radius: 180, color: '#10b981', intensity: 0.55 },
    ],
  },

  // =========================================================================
  // LEVEL 02 — SECOND SELF (TEST)
  // Purpose: Multi-step Echo cooperation & planning ("Your actions become future tools").
  // Loop 1: Player moves to Switch α to lower Security Gate 1.
  // Loop 2: Echo 1 executes Switch α. Live player advances through Gate 1 to Relay β, unlocking Exit Bulkhead B-2!
  // =========================================================================
  {
    id: 2,
    sectorCode: 'SECTOR 01',
    name: 'SECOND SELF',
    subtitle: 'Observation Deck // Dual Mechanism Relay',
    objective: 'Plan ahead: flip Switch α with Echo 1 to access Relay β.',
    briefing:
      'Your past actions become your future tools. Switch α energizes the upper power conduit to open Isolation Gate α, granting access to Pressure Plate β which opens the final exit. One operative cannot reach both in time.',
    loopDuration: 14.0,
    playerSpawn: { x: 120, y: 300 },
    exitPoint: { x: 860, y: 300 },
    bounds: { width: 960, height: 600 },
    environmentalZone: 'OBSERVATION ROOM',
    difficultyTarget: 2,
    requiredMechanics: ['MULTI_ECHO_PLANNING', 'INTERACTIVE_SWITCH', 'PRESSURE_PLATE'],
    cinematicIntro: {
      sectorTag: 'SECTOR 01: THE AWAKENING',
      title: 'LEVEL 02 // SECOND SELF',
      zoneTag: 'ZONE: OBSERVATION DECK [CONDUIT HUB]',
      briefingSnippet: 'Multi-stage recursion required. Structure actions sequentially across loops.',
      duration: 2.8,
    },
    completionSequence: {
      fanfareType: 'STANDARD',
      message: 'TEMPORAL RELAY SYNCHRONIZED. Past and present formed a cooperative chain.',
      unlockedInsight: 'Echoes can alter the environment, creating pathways that did not exist during their own lifetime.',
    },
    optionalSecrets: [
      {
        id: 'secret-2',
        name: 'TACHYON HARMONIC SHARD',
        description: 'Crystallized chrono-energy glowing softly inside the observation alcove.',
        type: 'MEMORY_SHARD',
        x: 240,
        y: 460,
        radius: 28,
        isDiscovered: false,
        glyph: 'β',
      },
    ],
    switches: [
      {
        id: 'switch-2a',
        x: 240,
        y: 160,
        width: 48,
        height: 48,
        type: 'TOGGLE',
        filter: 'ANY_ENTITY',
        isActive: false,
        timer: 0,
        maxDuration: 0,
        label: 'CONDUIT SWITCH α',
        color: '#38bdf8',
        connectsToId: 'door-2a',
      },
    ],
    plates: [
      {
        id: 'plate-2b',
        x: 520,
        y: 440,
        width: 48,
        height: 48,
        isPressed: false,
        activeTimer: 0,
        connectsToDoorId: 'door-2b',
        label: 'RELAY β',
        color: '#f59e0b',
      },
    ],
    doors: [
      {
        id: 'door-2a',
        x: 390,
        y: 350,
        width: 24,
        height: 120,
        isOpen: false,
        openProgress: 0,
        isExitDoor: false,
        label: 'GATE α',
        requiresPlateIds: ['switch-2a'],
      },
      {
        id: 'door-2b',
        x: 690,
        y: 240,
        width: 24,
        height: 120,
        isOpen: false,
        openProgress: 0,
        isExitDoor: false,
        label: 'BULKHEAD B-2',
        requiresPlateIds: ['plate-2b'],
      },
    ],
    obstacles: [
      // Partition 1 isolating Switch α from the lower passage
      { x: 390, y: 50, width: 24, height: 300, type: 'wall' },
      { x: 390, y: 470, width: 24, height: 80, type: 'wall' },
      // Partition 2 isolating Exit C
      { x: 690, y: 50, width: 24, height: 190, type: 'wall' },
      { x: 690, y: 360, width: 24, height: 190, type: 'wall' },
      // Architectural pillars
      { x: 240, y: 310, width: 44, height: 44, type: 'pillar' },
      { x: 520, y: 160, width: 50, height: 50, type: 'console', label: 'MONITOR_02' },
    ],
    wires: [
      {
        from: { x: 264, y: 184 },
        to: { x: 390, y: 380 },
        waypoints: [
          { x: 330, y: 184 },
          { x: 330, y: 380 },
        ],
        connectedPlateId: 'switch-2a',
        color: '#38bdf8',
      },
      {
        from: { x: 544, y: 464 },
        to: { x: 690, y: 300 },
        waypoints: [
          { x: 630, y: 464 },
          { x: 630, y: 300 },
        ],
        connectedPlateId: 'plate-2b',
        color: '#f59e0b',
      },
    ],
    ambientLights: [
      { x: 120, y: 300, radius: 160, color: '#38bdf8', intensity: 0.35 },
      { x: 264, y: 184, radius: 140, color: '#38bdf8', intensity: 0.45 },
      { x: 390, y: 410, radius: 130, color: '#06b6d4', intensity: 0.4 },
      { x: 544, y: 464, radius: 150, color: '#f59e0b', intensity: 0.45 },
      { x: 860, y: 300, radius: 180, color: '#10b981', intensity: 0.55 },
    ],
  },

  // =========================================================================
  // LEVEL 03 — THE TIMING (TEACH & TEST)
  // Purpose: Teach timing, synchronization windows, moving platforms, timed switches.
  // Loop 1: Player walks to Timed Switch, activates it; platform traverses abyss.
  // Loop 2: Echo 1 triggers Timed Switch at second 2. Live player boards platform and rides across!
  // =========================================================================
  {
    id: 3,
    sectorCode: 'SECTOR 01',
    name: 'THE TIMING',
    subtitle: 'Temporal Testing Chamber // Mag-Lev Depot',
    objective: 'Trigger Timed Switch α with Echo 1, then ride the Cargo Platform across.',
    briefing:
      'A deep structural abyss isolates the eastern extraction gate. Timed Switch α charges the Mag-Lev Cargo Platform for 7 seconds. Record your Echo activating the switch, then synchronize your live crossing before the power cycle expires.',
    loopDuration: 16.0,
    playerSpawn: { x: 120, y: 300 },
    exitPoint: { x: 860, y: 300 },
    bounds: { width: 960, height: 600 },
    environmentalZone: 'TEMPORAL TESTING CHAMBER',
    difficultyTarget: 2,
    requiredMechanics: ['TIMING_WINDOWS', 'MOVING_PLATFORM', 'TIMED_SWITCH'],
    cinematicIntro: {
      sectorTag: 'SECTOR 01: THE AWAKENING',
      title: 'LEVEL 03 // THE TIMING',
      zoneTag: 'ZONE: MAG-LEV DEPOT [TESTING CHAMBER]',
      briefingSnippet: 'Temporal windows are narrow. Physical presence must align in both space and time.',
      duration: 2.8,
    },
    completionSequence: {
      fanfareType: 'STANDARD',
      message: 'TEMPORAL TRANSIT SUCCESSFUL. You aligned spatial position with temporal phase.',
      unlockedInsight: 'Timing is non-negotiable: a second too early or late dissolves the opportunity.',
    },
    optionalSecrets: [
      {
        id: 'secret-3',
        name: 'MAG-LEV DIAGNOSTIC CORE',
        description: 'Maintenance sub-routine revealing platform telemetry and capacitor limits.',
        type: 'TERMINAL',
        x: 180,
        y: 160,
        radius: 30,
        isDiscovered: false,
        glyph: 'γ',
      },
    ],
    switches: [
      {
        id: 'switch-3',
        x: 180,
        y: 450,
        width: 48,
        height: 48,
        type: 'TIMED',
        filter: 'ANY_ENTITY',
        isActive: false,
        timer: 0,
        maxDuration: 7.5,
        label: 'TRANSIT TIMER [7.5s]',
        color: '#38bdf8',
        connectsToId: 'plat-3',
      },
    ],
    platforms: [
      {
        id: 'plat-3',
        x: 290,
        y: 270,
        width: 76,
        height: 60,
        waypoints: [
          { x: 290, y: 270 },
          { x: 640, y: 270 },
        ],
        currentWaypointIndex: 0,
        speed: 100,
        isActive: true,
        controlledById: 'switch-3',
        label: 'CARGO TROLLEY',
        travelDirection: 1,
      },
    ],
    plates: [
      {
        id: 'plate-3',
        x: 740,
        y: 300,
        width: 48,
        height: 48,
        isPressed: false,
        activeTimer: 0,
        connectsToDoorId: 'door-3',
        label: 'DOCK LOCK',
        color: '#10b981',
      },
    ],
    doors: [
      {
        id: 'door-3',
        x: 810,
        y: 250,
        width: 24,
        height: 100,
        isOpen: false,
        openProgress: 0,
        isExitDoor: false,
        label: 'TRANSIT GATE C-3',
        requiresPlateIds: ['plate-3'],
      },
    ],
    obstacles: [
      // Northern & Southern Abyss Walls
      { x: 370, y: 50, width: 230, height: 180, type: 'wall' },
      { x: 370, y: 370, width: 230, height: 180, type: 'wall' },
      { x: 810, y: 50, width: 24, height: 200, type: 'wall' },
      { x: 810, y: 350, width: 24, height: 200, type: 'wall' },
      { x: 220, y: 270, width: 44, height: 44, type: 'pillar' },
    ],
    wires: [
      {
        from: { x: 204, y: 450 },
        to: { x: 290, y: 300 },
        waypoints: [
          { x: 204, y: 370 },
          { x: 290, y: 370 },
        ],
        connectedPlateId: 'switch-3',
        color: '#38bdf8',
      },
      {
        from: { x: 764, y: 324 },
        to: { x: 810, y: 300 },
        connectedPlateId: 'plate-3',
        color: '#10b981',
      },
    ],
    ambientLights: [
      { x: 120, y: 300, radius: 160, color: '#38bdf8', intensity: 0.35 },
      { x: 204, y: 474, radius: 140, color: '#38bdf8', intensity: 0.4 },
      { x: 470, y: 300, radius: 180, color: '#0284c7', intensity: 0.28 },
      { x: 764, y: 324, radius: 140, color: '#10b981', intensity: 0.45 },
      { x: 860, y: 300, radius: 180, color: '#10b981', intensity: 0.55 },
    ],
  },

  // =========================================================================
  // LEVEL 04 — GHOST ACCESS (TEACH & COMBINE)
  // Purpose: Introduce Echo-only vs Player-only interaction.
  // Echo-Only Tachyon Sensor drops Laser Barrier.
  // Live player must complete Biometric Verification at terminal to open exit!
  // Realization: "Some things are impossible for me right now—but possible for my past self."
  // =========================================================================
  {
    id: 4,
    sectorCode: 'SECTOR 01',
    name: 'GHOST ACCESS',
    subtitle: 'Security & Tachyon Containment // Sector Gamma',
    objective: 'Echo must trip Tachyon Sensor to drop Laser Grid; complete live Biometric Scan.',
    briefing:
      'The security grid is tuned strictly to tachyon resonance—your current living body passes undetected, but your past Echo trips the sensor. Record your path through the sensor zone to drop the Laser Grid, then complete live Biometric Verification.',
    loopDuration: 16.0,
    playerSpawn: { x: 110, y: 450 },
    exitPoint: { x: 860, y: 280 },
    bounds: { width: 960, height: 600 },
    environmentalZone: 'SECURITY AREA',
    difficultyTarget: 3,
    requiredMechanics: ['ECHO_ONLY_SENSOR', 'LASER_BARRIER', 'PLAYER_ONLY_BIOMETRIC'],
    cinematicIntro: {
      sectorTag: 'SECTOR 01: THE AWAKENING',
      title: 'LEVEL 04 // GHOST ACCESS',
      zoneTag: 'ZONE: TACHYON CONTAINMENT [SECURITY SECTOR]',
      briefingSnippet: 'Entity filters active. Temporal state dictates physical resonance.',
      duration: 2.8,
    },
    completionSequence: {
      fanfareType: 'STANDARD',
      message: 'BIOMETRIC SIGNATURE CONFIRMED. Present consciousness verified.',
      unlockedInsight: 'Past iterations leave tachyon signatures that current entities cannot emulate.',
    },
    optionalSecrets: [
      {
        id: 'secret-4',
        name: 'CONTAINMENT INCIDENT LOG',
        description: 'Details of the first operative lost to tachyon desynchronization.',
        type: 'ARCHIVE_AUDIO',
        x: 160,
        y: 200,
        radius: 30,
        isDiscovered: false,
        glyph: 'δ',
      },
    ],
    plates: [],
    temporalSensors: [
      {
        id: 'sensor-4',
        x: 280,
        y: 180,
        radius: 38,
        filter: 'ECHO_ONLY',
        isTriggered: false,
        pulseTimer: 0,
        connectsToId: 'barrier-4',
        label: 'TACHYON SENSOR [ECHO ONLY]',
        color: '#c084fc',
      },
    ],
    barriers: [
      {
        id: 'barrier-4',
        x1: 460,
        y1: 100,
        x2: 460,
        y2: 500,
        thickness: 6,
        isActive: true,
        color: '#ef4444',
        controlledById: 'sensor-4',
        invertControl: false,
        label: 'LASER GRID G-04',
      },
    ],
    biometricTerminals: [
      {
        id: 'bio-4',
        x: 640,
        y: 260,
        width: 44,
        height: 44,
        filter: 'PLAYER_ONLY',
        isScanning: false,
        scanProgress: 0,
        isCompleted: false,
        connectsToId: 'door-4',
        label: 'LIVE BIOMETRIC [PLAYER ONLY]',
      },
    ],
    doors: [
      {
        id: 'door-4',
        x: 760,
        y: 230,
        width: 24,
        height: 100,
        isOpen: false,
        openProgress: 0,
        isExitDoor: false,
        label: 'SECURITY BLAST GATE',
        requiresPlateIds: ['bio-4'],
      },
    ],
    shadowZones: [
      {
        id: 'shadow-4',
        x: 210,
        y: 110,
        width: 140,
        height: 140,
        label: 'TACHYON SHADOW ZONE',
        intensity: 0.85,
        isEchoInside: false,
      },
    ],
    obstacles: [
      { x: 380, y: 50, width: 20, height: 160, type: 'wall' },
      { x: 380, y: 310, width: 20, height: 240, type: 'wall' },
      { x: 760, y: 50, width: 24, height: 180, type: 'wall' },
      { x: 760, y: 330, width: 24, height: 220, type: 'wall' },
      { x: 280, y: 360, width: 48, height: 48, type: 'pillar' },
    ],
    wires: [
      {
        from: { x: 280, y: 180 },
        to: { x: 460, y: 300 },
        waypoints: [
          { x: 380, y: 180 },
          { x: 380, y: 300 },
        ],
        connectedPlateId: 'sensor-4',
        color: '#c084fc',
      },
      {
        from: { x: 662, y: 282 },
        to: { x: 760, y: 280 },
        connectedPlateId: 'bio-4',
        color: '#06b6d4',
      },
    ],
    ambientLights: [
      { x: 110, y: 450, radius: 150, color: '#38bdf8', intensity: 0.35 },
      { x: 280, y: 180, radius: 140, color: '#c084fc', intensity: 0.45 },
      { x: 460, y: 300, radius: 160, color: '#ef4444', intensity: 0.3 },
      { x: 662, y: 282, radius: 140, color: '#06b6d4', intensity: 0.4 },
      { x: 860, y: 280, radius: 180, color: '#10b981', intensity: 0.5 },
    ],
  },

  // =========================================================================
  // LEVEL 05 — RESONANCE (TEACH & TRANSFORM)
  // Purpose: Introduce Temporal Resonance and dramatic chamber transformation.
  // Stage 1: Echo 1 creates initial resonance on Node α.
  // Stage 2: Echo 2 increases resonance on Node β.
  // Stage 3: Live player saturates harmonic field. Chamber visibly transforms, collapsing Phase Barrier!
  // =========================================================================
  {
    id: 5,
    sectorCode: 'SECTOR 01',
    name: 'RESONANCE',
    subtitle: 'Resonance Chamber // Harmonic Core',
    objective: 'Accumulate Echo Presence on Resonance Nodes α & β to collapse the Phase Field.',
    briefing:
      'Temporal resonance accumulates when past Echoes occupy harmonic focal points. Position your past Echoes on Resonance Nodes α and β to build harmonic saturation. When resonance reaches maximum, the entire chamber transforms, collapsing the Phase Barrier.',
    loopDuration: 18.0,
    playerSpawn: { x: 120, y: 300 },
    exitPoint: { x: 860, y: 300 },
    bounds: { width: 960, height: 600 },
    environmentalZone: 'RESONANCE CHAMBER',
    difficultyTarget: 3,
    requiredMechanics: ['TEMPORAL_RESONANCE', 'PHASE_SHIFTING', 'CHAMBER_TRANSFORMATION'],
    cinematicIntro: {
      sectorTag: 'SECTOR 01: THE AWAKENING',
      title: 'LEVEL 05 // RESONANCE',
      zoneTag: 'ZONE: RESONANCE CHAMBER [HARMONIC CORE]',
      briefingSnippet: 'Harmonic saturation threshold active. Energy rings will flare upon multi-echo presence.',
      duration: 2.8,
    },
    completionSequence: {
      fanfareType: 'MAJOR',
      message: 'HARMONIC CORE SATURATED. Structural phase transition unlocked.',
      unlockedInsight: 'When multiple timelines focus on a single spatial coordinate, physical reality gives way.',
    },
    optionalSecrets: [
      {
        id: 'secret-5',
        name: 'SINGULARITY SHARD ANOMALY',
        description: 'A floating crystalline anomaly vibrating at exactly 432 Hz.',
        type: 'ANOMALY_CRYSTAL',
        x: 480,
        y: 120,
        radius: 28,
        isDiscovered: false,
        glyph: 'ε',
      },
    ],
    plates: [],
    resonanceNodes: [
      {
        id: 'res-5',
        x: 420,
        y: 300,
        radius: 42,
        state: 'DORMANT',
        charge: 0,
        threshold: 1.0,
        requiredSimultaneous: 1,
        currentOccupants: 0,
        connectsToId: 'phase-5',
        label: 'HARMONIC CORE α',
        color: '#c084fc',
        pulseRadius: 42,
        loopsContributed: [],
      },
    ],
    phaseObjects: [
      {
        id: 'phase-5',
        x: 620,
        y: 200,
        width: 24,
        height: 200,
        type: 'PHASE_BARRIER',
        currentPhase: 'PHASE_A',
        controlledById: 'res-5',
        label: 'SPECTRAL PHASE FIELD',
        phaseAPermeable: false,
        phaseBPermeable: true,
        phaseCPermeable: true,
        transitionTimer: 0,
      },
    ],
    memoryObjects: [
      {
        id: 'mem-5',
        x: 280,
        y: 160,
        width: 40,
        height: 40,
        type: 'ARCHIVE',
        title: 'RESONANCE RESEARCH ARCHIVE',
        label: 'ARCHIVE β',
        isUnlocked: false,
        activeInteraction: false,
        interactionProgress: 0,
        totalEchoInteractions: 0,
        glitchTimer: 0,
        clues: [
          {
            requiredInteractions: 0,
            title: 'HARMONIC AMPLIFICATION',
            glyph: 'Δ',
            content: 'Resonance Node charges while occupied. Each past Echo adds to total charge saturation.',
            unlocked: true,
          },
        ],
      },
    ],
    doors: [
      {
        id: 'door-5',
        x: 780,
        y: 240,
        width: 24,
        height: 120,
        isOpen: false,
        openProgress: 0,
        isExitDoor: false,
        label: 'CHAMBER ARCHWAY',
        requiresPlateIds: ['res-5'],
      },
    ],
    obstacles: [
      { x: 620, y: 50, width: 24, height: 150, type: 'wall' },
      { x: 620, y: 400, width: 24, height: 150, type: 'wall' },
      { x: 780, y: 50, width: 24, height: 190, type: 'wall' },
      { x: 780, y: 360, width: 24, height: 190, type: 'wall' },
      { x: 420, y: 150, width: 44, height: 44, type: 'pillar' },
      { x: 420, y: 450, width: 44, height: 44, type: 'pillar' },
    ],
    wires: [
      {
        from: { x: 420, y: 300 },
        to: { x: 620, y: 300 },
        connectedPlateId: 'res-5',
        color: '#c084fc',
      },
      {
        from: { x: 644, y: 300 },
        to: { x: 780, y: 300 },
        connectedPlateId: 'res-5',
        color: '#38bdf8',
      },
    ],
    ambientLights: [
      { x: 120, y: 300, radius: 150, color: '#38bdf8', intensity: 0.35 },
      { x: 420, y: 300, radius: 180, color: '#c084fc', intensity: 0.5 },
      { x: 620, y: 300, radius: 160, color: '#38bdf8', intensity: 0.4 },
      { x: 860, y: 300, radius: 190, color: '#10b981', intensity: 0.55 },
    ],
  },

  // =========================================================================
  // LEVEL 06 — THE THREE MOMENTS (COMBINE & CLIMAX)
  // Purpose: Sector 01 showcase grand puzzle combining all mechanics!
  // Echo 1: Holds Relay α to open initial security door.
  // Echo 2: Trips Tachyon Sensor to drop lethal laser grid.
  // Echo 3: Steps on Twin Chronopad A.
  // Live Player: Synchronizes on Twin Chronopad B within the sync window,
  // then executes Biometric Authorization to breach the Singularity Airlock!
  // =========================================================================
  {
    id: 6,
    sectorCode: 'SECTOR 01',
    name: 'THE THREE MOMENTS',
    subtitle: 'Chrono-Containment Crucible // The Grand Climax',
    objective: 'Orchestrate 3 Echoes with live operative: Relay α, Tachyon Sensor, & Dual Chrono-Sync.',
    briefing:
      'The Sector 01 master containment crucible requires all temporal disciplines: Echo 1 holds Relay α, Echo 2 trips Tachyon Sensor γ, Echo 3 occupies Harmonic Chronopad α, and the live operative synchronizes with Chronopad β before completing Master Biometric Authorization. Shatter the loop.',
    loopDuration: 22.0,
    playerSpawn: { x: 100, y: 300 },
    exitPoint: { x: 880, y: 300 },
    bounds: { width: 960, height: 600 },
    environmentalZone: 'CHRONO-CONTAINMENT CRUCIBLE',
    difficultyTarget: 4,
    requiredMechanics: [
      'MULTI_ECHO_CONVERGENCE',
      'CHRONO_SYNCHRONIZATION',
      'TACHYON_SENSORS',
      'RESONANCE_SATURATION',
      'BIOMETRIC_CORE',
    ],
    cinematicIntro: {
      sectorTag: 'SECTOR 01: THE AWAKENING',
      title: 'LEVEL 06 // THE THREE MOMENTS',
      zoneTag: 'ZONE: CRUCIBLE [SECTOR 01 APEX]',
      briefingSnippet: 'All previous disciplines converge. Flawless temporal orchestration required.',
      duration: 3.2,
    },
    completionSequence: {
      fanfareType: 'FINALE',
      message: 'SECTOR 01 FULLY CONQUERED! The containment loop has been shattered.',
      unlockedInsight: 'You have mastered the first layer of recursion. The deeper facility awaits.',
    },
    optionalSecrets: [
      {
        id: 'secret-6',
        name: 'ARCHITECTS FINAL AUDIO TRANSMISSION',
        description: 'Encrypted message from the Chief Chrono-Physicist before the sector sealed.',
        type: 'ARCHIVE_AUDIO',
        x: 480,
        y: 80,
        radius: 32,
        isDiscovered: false,
        glyph: 'Ω',
      },
    ],
    plates: [
      {
        id: 'plate-6',
        x: 220,
        y: 150,
        width: 48,
        height: 48,
        isPressed: false,
        activeTimer: 0,
        connectsToDoorId: 'door-6a',
        label: 'RELAY α',
        color: '#06b6d4',
      },
    ],
    temporalSensors: [
      {
        id: 'sensor-6',
        x: 260,
        y: 440,
        radius: 36,
        filter: 'ECHO_ONLY',
        isTriggered: false,
        pulseTimer: 0,
        connectsToId: 'barrier-6',
        label: 'TACHYON SENSOR γ',
        color: '#c084fc',
      },
    ],
    barriers: [
      {
        id: 'barrier-6',
        x1: 450,
        y1: 100,
        x2: 450,
        y2: 500,
        thickness: 6,
        isActive: true,
        color: '#ef4444',
        controlledById: 'sensor-6',
        label: 'LASER MATRIX Ω',
      },
    ],
    syncPairs: [
      {
        id: 'sync-6',
        nodeA: { x: 580, y: 180, radius: 26, label: 'CHRONOPAD α', occupied: false },
        nodeB: { x: 580, y: 420, radius: 26, label: 'CHRONOPAD β', occupied: false },
        syncWindow: 2.5,
        currentSyncTime: 0,
        isSynchronized: false,
        connectsToId: 'door-6b',
        label: 'DUAL MATRIX HARMONICS',
        color: '#f59e0b',
      },
    ],
    biometricTerminals: [
      {
        id: 'bio-6',
        x: 740,
        y: 300,
        width: 44,
        height: 44,
        filter: 'PLAYER_ONLY',
        isScanning: false,
        scanProgress: 0,
        isCompleted: false,
        connectsToId: 'door-6c',
        label: 'FACILITY MASTER TERMINAL',
      },
    ],
    doors: [
      {
        id: 'door-6a',
        x: 360,
        y: 240,
        width: 24,
        height: 120,
        isOpen: false,
        openProgress: 0,
        isExitDoor: false,
        label: 'SECURITY GATE α',
        requiresPlateIds: ['plate-6'],
      },
      {
        id: 'door-6b',
        x: 670,
        y: 240,
        width: 24,
        height: 120,
        isOpen: false,
        openProgress: 0,
        isExitDoor: false,
        label: 'CHRONO-SYNC BULKHEAD',
        requiresPlateIds: ['sync-6'],
      },
      {
        id: 'door-6c',
        x: 820,
        y: 240,
        width: 24,
        height: 120,
        isOpen: false,
        openProgress: 0,
        isExitDoor: false,
        label: 'SECTOR AIRLOCK Ω',
        requiresPlateIds: ['bio-6'],
      },
    ],
    obstacles: [
      // Wall isolating plate-6 chamber
      { x: 360, y: 50, width: 24, height: 190, type: 'wall' },
      { x: 360, y: 360, width: 24, height: 190, type: 'wall' },
      // Wall between barrier and sync pads
      { x: 670, y: 50, width: 24, height: 190, type: 'wall' },
      { x: 670, y: 360, width: 24, height: 190, type: 'wall' },
      // Final airlock wall
      { x: 820, y: 50, width: 24, height: 190, type: 'wall' },
      { x: 820, y: 360, width: 24, height: 190, type: 'wall' },
      // Architectural columns
      { x: 480, y: 200, width: 40, height: 40, type: 'pillar' },
      { x: 480, y: 380, width: 40, height: 40, type: 'pillar' },
    ],
    wires: [
      {
        from: { x: 244, y: 174 },
        to: { x: 360, y: 280 },
        connectedPlateId: 'plate-6',
        color: '#06b6d4',
      },
      {
        from: { x: 260, y: 440 },
        to: { x: 450, y: 300 },
        connectedPlateId: 'sensor-6',
        color: '#c084fc',
      },
      {
        from: { x: 580, y: 300 },
        to: { x: 670, y: 300 },
        connectedPlateId: 'sync-6',
        color: '#f59e0b',
      },
      {
        from: { x: 762, y: 322 },
        to: { x: 820, y: 300 },
        connectedPlateId: 'bio-6',
        color: '#10b981',
      },
    ],
    ambientLights: [
      { x: 100, y: 300, radius: 150, color: '#38bdf8', intensity: 0.35 },
      { x: 244, y: 174, radius: 140, color: '#06b6d4', intensity: 0.4 },
      { x: 260, y: 440, radius: 140, color: '#c084fc', intensity: 0.4 },
      { x: 580, y: 180, radius: 140, color: '#f59e0b', intensity: 0.4 },
      { x: 580, y: 420, radius: 140, color: '#f59e0b', intensity: 0.4 },
      { x: 762, y: 300, radius: 150, color: '#10b981', intensity: 0.45 },
      { x: 880, y: 300, radius: 180, color: '#10b981', intensity: 0.6 },
    ],
  },
];
