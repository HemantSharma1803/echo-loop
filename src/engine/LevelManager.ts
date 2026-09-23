/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelConfig, OptionalSecret } from '../types/game';
import { LEVELS } from './levels';

export interface LevelRecord {
  levelId: number;
  completed: boolean;
  bestLoops: number;
  bestTime: number;
  discoveredSecretIds: string[];
}

export class LevelManager {
  private levels: LevelConfig[];
  private currentLevelIndex: number = 0;
  private discoveredSecrets: Set<string> = new Set();
  private levelRecords: Map<number, LevelRecord> = new Map();

  constructor(customLevels: LevelConfig[] = LEVELS) {
    this.levels = customLevels;
    this.loadPersistedProgress();
  }

  private loadPersistedProgress() {
    try {
      const savedSecrets = localStorage.getItem('echo_loop_discovered_secrets');
      if (savedSecrets) {
        const arr = JSON.parse(savedSecrets) as string[];
        arr.forEach((id) => this.discoveredSecrets.add(id));
      }

      const savedRecords = localStorage.getItem('echo_loop_level_records');
      if (savedRecords) {
        const records = JSON.parse(savedRecords) as LevelRecord[];
        records.forEach((r) => this.levelRecords.set(r.levelId, r));
      }
    } catch {
      // LocalStorage unavailable in iframe sandbox; continue gracefully
    }
  }

  private saveProgress() {
    try {
      localStorage.setItem(
        'echo_loop_discovered_secrets',
        JSON.stringify(Array.from(this.discoveredSecrets))
      );
      localStorage.setItem(
        'echo_loop_level_records',
        JSON.stringify(Array.from(this.levelRecords.values()))
      );
    } catch {
      // Ignore storage errors
    }
  }

  public getLevels(): LevelConfig[] {
    return this.levels;
  }

  public getLevel(index: number): LevelConfig {
    return this.levels[index] || this.levels[0];
  }

  public getCurrentLevel(): LevelConfig {
    return this.getLevel(this.currentLevelIndex);
  }

  public getCurrentLevelIndex(): number {
    return this.currentLevelIndex;
  }

  public setCurrentLevelIndex(index: number): LevelConfig {
    if (index >= 0 && index < this.levels.length) {
      this.currentLevelIndex = index;
    }
    return this.getCurrentLevel();
  }

  public getTotalLevels(): number {
    return this.levels.length;
  }

  public hasNextLevel(): boolean {
    return this.currentLevelIndex < this.levels.length - 1;
  }

  public getNextLevelIndex(): number | null {
    if (this.hasNextLevel()) {
      return this.currentLevelIndex + 1;
    }
    return null;
  }

  public advanceLevel(): LevelConfig | null {
    if (this.hasNextLevel()) {
      this.currentLevelIndex++;
      return this.getCurrentLevel();
    }
    return null;
  }

  public discoverSecret(secretId: string): boolean {
    if (!this.discoveredSecrets.has(secretId)) {
      this.discoveredSecrets.add(secretId);
      this.saveProgress();
      return true;
    }
    return false;
  }

  public isSecretDiscovered(secretId: string): boolean {
    return this.discoveredSecrets.has(secretId);
  }

  public getDiscoveredSecretsCount(): number {
    return this.discoveredSecrets.size;
  }

  public getTotalSecretsCount(): number {
    let count = 0;
    for (const lvl of this.levels) {
      if (lvl.optionalSecrets) {
        count += lvl.optionalSecrets.length;
      }
    }
    return count;
  }

  public recordCompletion(levelId: number, loops: number, timeTaken: number) {
    const existing = this.levelRecords.get(levelId);
    const discoveredInThisLevel: string[] = [];

    const lvl = this.levels.find((l) => l.id === levelId);
    if (lvl && lvl.optionalSecrets) {
      lvl.optionalSecrets.forEach((sec) => {
        if (this.discoveredSecrets.has(sec.id)) {
          discoveredInThisLevel.push(sec.id);
        }
      });
    }

    if (!existing) {
      this.levelRecords.set(levelId, {
        levelId,
        completed: true,
        bestLoops: loops,
        bestTime: timeTaken,
        discoveredSecretIds: discoveredInThisLevel,
      });
    } else {
      existing.completed = true;
      existing.bestLoops = Math.min(existing.bestLoops, loops);
      existing.bestTime = Math.min(existing.bestTime, timeTaken);
      existing.discoveredSecretIds = Array.from(
        new Set([...existing.discoveredSecretIds, ...discoveredInThisLevel])
      );
    }
    this.saveProgress();
  }

  public getLevelStats(levelId: number): LevelRecord | null {
    return this.levelRecords.get(levelId) || null;
  }

  public getActiveLevelSecrets(): OptionalSecret[] {
    const lvl = this.getCurrentLevel();
    if (!lvl.optionalSecrets) return [];
    return lvl.optionalSecrets.map((s) => ({
      ...s,
      isDiscovered: this.discoveredSecrets.has(s.id),
    }));
  }
}
