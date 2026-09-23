/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  LevelMasteryStatus,
  TemporalRunRecord,
  GameAchievement,
  EchoHistoryEntry,
  LevelChallengeConfig,
} from '../types/engagement';
import { LEVEL_MASTERY_CONFIGS, INITIAL_ACHIEVEMENTS } from './masteryData';
import { soundManager } from '../audio/soundSystem';

const STORAGE_KEY_MASTERY = 'echoloop_mastery_records_v1';
const STORAGE_KEY_ACHIEVEMENTS = 'echoloop_achievements_v1';
const STORAGE_KEY_BEST_RUNS = 'echoloop_best_runs_v1';

export class MasteryManager {
  private masteryRecords: Map<number, LevelMasteryStatus> = new Map();
  private achievements: GameAchievement[] = [];
  private bestRuns: Map<number, TemporalRunRecord> = new Map();
  private onAchievementUnlockedCallbacks: ((achievement: GameAchievement) => void)[] = [];

  constructor() {
    this.achievements = JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS));
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedMastery = localStorage.getItem(STORAGE_KEY_MASTERY);
      if (savedMastery) {
        const records = JSON.parse(savedMastery) as LevelMasteryStatus[];
        records.forEach((r) => this.masteryRecords.set(r.levelId, r));
      }

      const savedAchievements = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
      if (savedAchievements) {
        const achs = JSON.parse(savedAchievements) as { id: string; unlocked: boolean; unlockedAt?: string }[];
        achs.forEach((sa) => {
          const found = this.achievements.find((a) => a.id === sa.id);
          if (found && sa.unlocked) {
            found.unlocked = true;
            found.unlockedAt = sa.unlockedAt;
          }
        });
      }

      const savedRuns = localStorage.getItem(STORAGE_KEY_BEST_RUNS);
      if (savedRuns) {
        const runs = JSON.parse(savedRuns) as TemporalRunRecord[];
        runs.forEach((run) => this.bestRuns.set(run.levelId, run));
      }
    } catch {
      // LocalStorage unavailable in iframe sandbox; continue gracefully
    }
  }

  public saveToStorage() {
    try {
      localStorage.setItem(
        STORAGE_KEY_MASTERY,
        JSON.stringify(Array.from(this.masteryRecords.values()))
      );
      localStorage.setItem(
        STORAGE_KEY_ACHIEVEMENTS,
        JSON.stringify(
          this.achievements.map((a) => ({
            id: a.id,
            unlocked: a.unlocked,
            unlockedAt: a.unlockedAt,
          }))
        )
      );
      localStorage.setItem(
        STORAGE_KEY_BEST_RUNS,
        JSON.stringify(Array.from(this.bestRuns.values()))
      );
    } catch {
      // Ignore storage errors
    }
  }

  public resetAllMastery() {
    this.masteryRecords.clear();
    this.bestRuns.clear();
    this.achievements = JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS));
    this.saveToStorage();
  }

  public onAchievementUnlocked(cb: (achievement: GameAchievement) => void) {
    this.onAchievementUnlockedCallbacks.push(cb);
  }

  public unlockAchievement(achievementId: string): boolean {
    const ach = this.achievements.find((a) => a.id === achievementId);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      ach.unlockedAt = new Date().toISOString();
      this.saveToStorage();
      soundManager.playSecretDiscovered();
      for (const cb of this.onAchievementUnlockedCallbacks) {
        cb(ach);
      }
      return true;
    }
    return false;
  }

  public getAchievements(): GameAchievement[] {
    return this.achievements;
  }

  public getUnlockedAchievementsCount(): number {
    return this.achievements.filter((a) => a.unlocked).length;
  }

  public getMasteryRequirement(levelId: number) {
    return LEVEL_MASTERY_CONFIGS[levelId] || LEVEL_MASTERY_CONFIGS[1];
  }

  /**
   * Calculate meaningful Temporal Efficiency (0% to 100%)
   * Formula factors:
   * 1. Loops used vs Recommended Target
   * 2. Execution Time vs Expected Time
   * 3. Unnecessary Resets
   * 4. Timeline Stability / Paradox Avoidance
   */
  public calculateEfficiency(
    levelId: number,
    loopsUsed: number,
    timeTaken: number,
    resetsCount: number,
    paradoxCount: number
  ): number {
    const req = this.getMasteryRequirement(levelId);
    const recLoops = req.recommendedLoops;
    const timeTarget = req.timeTargetSeconds;

    // Loop efficiency component (50% weight)
    const loopRatio = recLoops / Math.max(1, loopsUsed);
    const loopScore = Math.min(1.0, loopRatio) * 50;

    // Time efficiency component (30% weight)
    const timeRatio = timeTarget / Math.max(timeTarget * 0.5, timeTaken);
    const timeScore = Math.min(1.0, timeRatio) * 30;

    // Paradox & Reset penalties (20% weight)
    const penalty = Math.min(20, resetsCount * 3 + paradoxCount * 6);
    const stabilityScore = Math.max(0, 20 - penalty);

    const total = Math.round(loopScore + timeScore + stabilityScore);
    return Math.max(15, Math.min(100, total));
  }

  /**
   * Evaluates completion and updates mastery & best runs
   */
  public recordRun(params: {
    levelId: number;
    loopsUsed: number;
    echoesCreated: number;
    timeTaken: number;
    resetsCount: number;
    paradoxCount: number;
    discoveredSecretIds: string[];
    playerFinalPath: { x: number; y: number }[];
  }): {
    isNewMastery: boolean;
    efficiency: number;
    challengeSuccess: boolean;
    masteryStatus: LevelMasteryStatus;
  } {
    const {
      levelId,
      loopsUsed,
      echoesCreated,
      timeTaken,
      resetsCount,
      paradoxCount,
      discoveredSecretIds,
      playerFinalPath,
    } = params;

    const req = this.getMasteryRequirement(levelId);
    const efficiency = this.calculateEfficiency(
      levelId,
      loopsUsed,
      timeTaken,
      resetsCount,
      paradoxCount
    );

    // Evaluate challenge condition
    let challengeSuccess = false;
    const chal = req.challenge;
    if (chal.type === 'MAX_LOOPS') {
      challengeSuccess = loopsUsed <= chal.targetValue;
    } else if (chal.type === 'MAX_ECHOES') {
      challengeSuccess = echoesCreated <= chal.targetValue;
    } else if (chal.type === 'NO_PARADOX') {
      challengeSuccess = paradoxCount === 0;
    } else {
      challengeSuccess = loopsUsed <= req.recommendedLoops;
    }

    // Determine mastery (Recommended loops met + Challenge met)
    const qualifiesForMastery = loopsUsed <= req.recommendedLoops && challengeSuccess;

    const existing = this.masteryRecords.get(levelId);
    let isNewMastery = false;

    if (!existing) {
      isNewMastery = qualifiesForMastery;
      const newStatus: LevelMasteryStatus = {
        levelId,
        isCompleted: true,
        isMastered: qualifiesForMastery,
        bestLoops: loopsUsed,
        bestTime: timeTaken,
        bestEfficiency: efficiency,
        challengeCompleted: challengeSuccess,
        discoveredSecretIds,
      };
      this.masteryRecords.set(levelId, newStatus);
    } else {
      if (!existing.isMastered && qualifiesForMastery) {
        isNewMastery = true;
      }
      existing.isCompleted = true;
      existing.isMastered = existing.isMastered || qualifiesForMastery;
      existing.bestLoops = Math.min(existing.bestLoops, loopsUsed);
      existing.bestTime = Math.min(existing.bestTime, timeTaken);
      existing.bestEfficiency = Math.max(existing.bestEfficiency, efficiency);
      existing.challengeCompleted = existing.challengeCompleted || challengeSuccess;
      existing.discoveredSecretIds = Array.from(
        new Set([...existing.discoveredSecretIds, ...discoveredSecretIds])
      );
    }

    // Update Best Run ghost record if improved loops or time
    const prevBest = this.bestRuns.get(levelId);
    if (!prevBest || loopsUsed < prevBest.loops || (loopsUsed === prevBest.loops && timeTaken < prevBest.elapsedSeconds)) {
      this.bestRuns.set(levelId, {
        levelId,
        loops: loopsUsed,
        echoesCount: echoesCreated,
        elapsedSeconds: Math.round(timeTaken * 10) / 10,
        efficiencyPercent: efficiency,
        date: new Date().toLocaleDateString(),
        // Downsample path to at most 60 points for lightweight storage
        pathSnippet: this.downsamplePath(playerFinalPath, 60),
      });
    }

    // Check achievement triggers
    this.checkAchievementsAfterRun(levelId, loopsUsed, echoesCreated, paradoxCount, req);

    this.saveToStorage();

    const currentStatus = this.masteryRecords.get(levelId)!;
    return {
      isNewMastery,
      efficiency,
      challengeSuccess,
      masteryStatus: currentStatus,
    };
  }

  private checkAchievementsAfterRun(
    levelId: number,
    loopsUsed: number,
    echoesCreated: number,
    paradoxCount: number,
    req: any
  ) {
    // 1. First Trace
    if (echoesCreated >= 1) {
      this.unlockAchievement('first-trace');
    }
    // 2. Two of Me
    if (echoesCreated >= 2) {
      this.unlockAchievement('two-of-me');
    }
    // 3. Temporalist
    if (loopsUsed <= req.recommendedLoops) {
      this.unlockAchievement('temporalist');
    }
    // 4. Paradox Free
    if ((levelId === 4 || levelId === 6) && paradoxCount === 0) {
      this.unlockAchievement('paradox-free');
    }
    // 5. Shatter Crucible
    if (levelId === 6) {
      this.unlockAchievement('crucible-shattered');
    }
    // 6. Temporal Architect (3 mastered levels)
    const masteredCount = Array.from(this.masteryRecords.values()).filter((m) => m.isMastered).length;
    if (masteredCount >= 3) {
      this.unlockAchievement('grand-master');
    }
  }

  private downsamplePath(path: { x: number; y: number }[], targetCount: number) {
    if (path.length <= targetCount) return path;
    const step = path.length / targetCount;
    const result: { x: number; y: number }[] = [];
    for (let i = 0; i < targetCount; i++) {
      const idx = Math.min(path.length - 1, Math.floor(i * step));
      result.push({
        x: Math.round(path[idx].x),
        y: Math.round(path[idx].y),
      });
    }
    return result;
  }

  public getMasteryStatus(levelId: number): LevelMasteryStatus | null {
    return this.masteryRecords.get(levelId) || null;
  }

  public getAllMasteryRecords(): LevelMasteryStatus[] {
    return Array.from(this.masteryRecords.values());
  }

  public getBestRun(levelId: number): TemporalRunRecord | null {
    return this.bestRuns.get(levelId) || null;
  }

  public getMasteredCount(): number {
    return Array.from(this.masteryRecords.values()).filter((m) => m.isMastered).length;
  }
}

export const masteryManager = new MasteryManager();
