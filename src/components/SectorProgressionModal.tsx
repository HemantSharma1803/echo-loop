/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  RotateCcw,
  Zap,
  Lock,
  Layers,
  Flame,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { LevelConfig } from '../types/game';
import { LevelMasteryStatus } from '../types/engagement';
import { LEVEL_MASTERY_CONFIGS } from '../engine/masteryData';
import { masteryManager } from '../engine/MasteryManager';
import { soundManager } from '../audio/soundSystem';

interface SectorProgressionModalProps {
  levels: LevelConfig[];
  currentLevelIndex: number;
  onSelectLevel: (index: number) => void;
  onClose: () => void;
  onOpenAchievements?: () => void;
  onOpenLoreArchive?: () => void;
}

export const SectorProgressionModal: React.FC<SectorProgressionModalProps> = ({
  levels,
  currentLevelIndex,
  onSelectLevel,
  onClose,
  onOpenAchievements,
  onOpenLoreArchive,
}) => {
  const [selectedLevelId, setSelectedLevelId] = useState<number>(levels[currentLevelIndex]?.id || 1);

  const selectedLevel = levels.find((l) => l.id === selectedLevelId) || levels[0];
  const masteryConfig = LEVEL_MASTERY_CONFIGS[selectedLevelId] || LEVEL_MASTERY_CONFIGS[1];
  const masteryStatus = masteryManager.getMasteryStatus(selectedLevelId);
  const bestRun = masteryManager.getBestRun(selectedLevelId);

  const isLevelUnlocked = (idx: number) => {
    if (idx === 0) return true;
    const prevLvl = levels[idx - 1];
    const prevStatus = masteryManager.getMasteryStatus(prevLvl.id);
    return !!prevStatus?.isCompleted;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6 select-none font-rajdhani animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-orbitron text-sm md:text-base font-bold text-white tracking-wide">
                FACILITY SECTOR ARCHIVES // SECTOR 01
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                PROGRESSION MAP & TEMPORAL MASTERY MATRIX
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAchievements && (
              <button
                onClick={() => {
                  soundManager.playUIClick();
                  onOpenAchievements();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ACHIEVEMENTS</span>
              </button>
            )}
            {onOpenLoreArchive && (
              <button
                onClick={() => {
                  soundManager.playUIClick();
                  onOpenLoreArchive();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">LORE DOSSIER</span>
              </button>
            )}
            <button
              onClick={() => {
                soundManager.playUIClick();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-900">
          {/* Left Column: Sector Cards */}
          <div className="md:col-span-5 p-4 flex flex-col gap-2 overflow-y-auto">
            <div className="text-[10px] font-mono text-slate-400 tracking-widest px-1 uppercase flex items-center justify-between">
              <span>FACILITY SECTOR CHAMBERS</span>
              <span>{levels.filter((_, i) => isLevelUnlocked(i)).length}/{levels.length} UNLOCKED</span>
            </div>

            {levels.map((lvl, idx) => {
              const unlocked = isLevelUnlocked(idx);
              const status = masteryManager.getMasteryStatus(lvl.id);
              const isSelected = selectedLevelId === lvl.id;

              return (
                <button
                  key={lvl.id}
                  disabled={!unlocked}
                  onClick={() => {
                    soundManager.playUIClick();
                    setSelectedLevelId(lvl.id);
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                    !unlocked
                      ? 'opacity-40 bg-slate-950/40 border-slate-900 cursor-not-allowed'
                      : isSelected
                      ? 'bg-slate-900 border-cyan-500/70 shadow-md text-white'
                      : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-900/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-xs font-bold">
                      {!unlocked ? (
                        <Lock className="w-3.5 h-3.5 text-slate-600" />
                      ) : status?.isMastered ? (
                        <Flame className="w-4 h-4 text-amber-400" />
                      ) : status?.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="text-cyan-400">0{lvl.id}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-white tracking-wider">
                          0{lvl.id} — {lvl.name}
                        </span>
                        {status?.isMastered && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/40 text-amber-400 font-mono font-bold">
                            MASTERED
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate max-w-[180px]">
                        {lvl.environmentalZone || 'CHAMBER'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    {status?.isCompleted ? (
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">
                        {status.bestLoops} {status.bestLoops === 1 ? 'LOOP' : 'LOOPS'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">PENDING</span>
                    )}
                    {status && (
                      <span className="text-[9px] font-mono text-emerald-400">
                        {status.bestEfficiency}% EFF
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Selected Sector Mastery Details & Replay Action */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between gap-5 overflow-y-auto">
            <div className="flex flex-col gap-4">
              {/* Sector Title Header */}
              <div className="flex items-start justify-between border-b border-slate-900 pb-3">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
                    {selectedLevel.sectorCode} // CHAMBER 0{selectedLevel.id}
                  </span>
                  <h3 className="font-orbitron text-xl font-bold text-white mt-0.5">
                    {selectedLevel.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedLevel.subtitle}
                  </p>
                </div>

                {masteryStatus?.isMastered ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 font-mono text-xs font-bold">
                    <Flame className="w-4 h-4 fill-amber-400" />
                    <span>MASTERED</span>
                  </div>
                ) : masteryStatus?.isCompleted ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>COMPLETED</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-mono text-xs">
                    <span>NOT COMPLETED</span>
                  </div>
                )}
              </div>

              {/* Briefing */}
              <p className="text-xs text-slate-300 font-light leading-relaxed">
                {selectedLevel.briefing}
              </p>

              {/* Target & Best Stats Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-slate-400 uppercase">RECOMMENDED</span>
                  <span className="font-orbitron text-base font-bold text-cyan-400">
                    {masteryConfig.recommendedLoops} LOOPS
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-slate-400 uppercase">YOUR BEST</span>
                  <span className="font-orbitron text-base font-bold text-white">
                    {masteryStatus?.bestLoops ? `${masteryStatus.bestLoops} LOOPS` : '—'}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-slate-400 uppercase">BEST TIME</span>
                  <span className="font-orbitron text-base font-bold text-white">
                    {bestRun ? `${bestRun.elapsedSeconds}s` : '—'}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-slate-400 uppercase">EFFICIENCY</span>
                  <span className="font-orbitron text-base font-bold text-emerald-400">
                    {masteryStatus?.bestEfficiency ? `${masteryStatus.bestEfficiency}%` : '—'}
                  </span>
                </div>
              </div>

              {/* Optional Temporal Challenge Card */}
              <div className="p-4 bg-cyan-950/20 border border-cyan-900/50 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>OPTIONAL TEMPORAL CHALLENGE: {masteryConfig.challenge.title}</span>
                  </span>
                  {masteryStatus?.challengeCompleted && (
                    <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                      SOLVED
                    </span>
                  )}
                </div>
                <p className="text-xs text-cyan-100 font-mono leading-relaxed">
                  "{masteryConfig.challenge.description}"
                </p>
                <p className="text-[11px] text-slate-400 font-mono italic">
                  TACTICAL HINT: {masteryConfig.challenge.hint}
                </p>
              </div>

              {/* Replay Safety Notice */}
              <div className="text-[10px] font-mono text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80">
                REPLAY PROTOCOL ACTIVE: Replaying completed chambers does NOT alter main story progression or reset unlocked archives.
              </div>
            </div>

            {/* Launch Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  soundManager.playUIClick();
                  const idx = levels.findIndex((l) => l.id === selectedLevelId);
                  if (idx >= 0) {
                    onSelectLevel(idx);
                    onClose();
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-orbitron font-bold text-xs tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
              >
                <span>ENTER RECURSION CHAMBER</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
