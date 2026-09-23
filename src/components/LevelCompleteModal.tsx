/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ArrowRight,
  RotateCcw,
  Home,
  Award,
  Flame,
  Zap,
  Clock,
  Activity,
  History,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { soundManager } from '../audio/soundSystem';
import { LevelMasteryStatus } from '../types/engagement';
import { LEVEL_MASTERY_CONFIGS } from '../engine/masteryData';

interface LevelCompleteModalProps {
  levelId: number;
  sectorCode: string;
  sectorName: string;
  levelName?: string;
  loopNumber: number;
  echoCount: number;
  elapsedSeconds?: number;
  resetsCount?: number;
  efficiency?: number;
  isMastered?: boolean;
  challengeSuccess?: boolean;
  masteryStatus?: LevelMasteryStatus | null;
  hasNextSector: boolean;
  unlockedInsight?: string;
  secretsFound?: number;
  totalSecrets?: number;
  onNextSector: () => void;
  onReplaySector: () => void;
  onInspectEchoHistory?: () => void;
  onQuitToTitle: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  levelId,
  sectorCode,
  sectorName,
  levelName,
  loopNumber,
  echoCount,
  elapsedSeconds = 12.4,
  resetsCount = 0,
  efficiency = 92,
  isMastered = false,
  challengeSuccess = false,
  masteryStatus,
  hasNextSector,
  unlockedInsight,
  secretsFound = 0,
  totalSecrets = 0,
  onNextSector,
  onReplaySector,
  onInspectEchoHistory,
  onQuitToTitle,
}) => {
  const masteryConfig = LEVEL_MASTERY_CONFIGS[levelId] || LEVEL_MASTERY_CONFIGS[1];
  const challenge = masteryConfig.challenge;

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-40 select-none animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-slate-900/95 border border-emerald-500/60 rounded-2xl p-6 md:p-7 shadow-2xl shadow-emerald-950/50 flex flex-col items-center text-center gap-4 max-h-[92vh] overflow-y-auto">
        {/* Glow badge */}
        <div className="flex items-center gap-2">
          {isMastered ? (
            <div className="w-13 h-13 rounded-2xl bg-amber-500/10 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/25 p-3">
              <Flame className="w-8 h-8 fill-amber-400" />
            </div>
          ) : (
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20 p-3">
              <Award className="w-8 h-8" />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 text-[11px] font-mono tracking-widest font-bold uppercase">
            {isMastered ? (
              <span className="text-amber-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> SECTOR MASTERED
              </span>
            ) : (
              <span className="text-emerald-400">CHRONO-CONTAINMENT BREACHED</span>
            )}
          </div>
          <h2 className="font-orbitron text-2xl md:text-3xl font-black text-white tracking-wide mt-1">
            {levelName ? levelName : `${sectorCode} CLEARED`}
          </h2>
          <div className="text-xs text-slate-400 font-mono mt-0.5">
            {sectorName}
          </div>
        </div>

        {/* Temporal Performance Summary Matrix */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono text-slate-400 uppercase">LOOPS USED</span>
            <span className="font-orbitron text-lg font-bold text-cyan-400 mt-0.5">
              0{loopNumber}
            </span>
            <span className="text-[8px] font-mono text-slate-400">
              (REC: ≤{masteryConfig.recommendedLoops})
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono text-slate-400 uppercase">ECHOES LEFT</span>
            <span className="font-orbitron text-lg font-bold text-purple-400 mt-0.5">
              {echoCount}
            </span>
            <span className="text-[8px] font-mono text-slate-400">ACTIVE TRACES</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono text-slate-400 uppercase">ELAPSED TIME</span>
            <span className="font-orbitron text-lg font-bold text-amber-300 mt-0.5">
              {Math.round(elapsedSeconds * 10) / 10}s
            </span>
            <span className="text-[8px] font-mono text-slate-400">
              (TAR: {masteryConfig.timeTargetSeconds}s)
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[9px] font-mono text-slate-400 uppercase">EFFICIENCY</span>
            <span
              className={`font-orbitron text-lg font-bold mt-0.5 ${
                efficiency >= 85 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {efficiency}%
            </span>
            <span className="text-[8px] font-mono text-slate-400">
              {resetsCount > 0 ? `${resetsCount} RESETS` : 'ZERO RESETS'}
            </span>
          </div>
        </div>

        {/* Optional Temporal Challenge Evaluation */}
        <div className="w-full p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-left">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${challengeSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                CHALLENGE: {challenge.title}
              </div>
              <div className="text-xs font-mono text-slate-200">
                {challenge.description}
              </div>
            </div>
          </div>
          <div className="shrink-0">
            {challengeSuccess ? (
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-bold">
                ACCOMPLISHED
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[9px]">
                PENDING
              </span>
            )}
          </div>
        </div>

        {/* Narrative Insight */}
        {unlockedInsight && (
          <div className="w-full bg-cyan-950/30 border border-cyan-800/40 rounded-xl p-3 text-left">
            <div className="text-[9px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
              FACILITY ARCHIVE LOG ACQUIRED
            </div>
            <p className="text-xs text-cyan-100/90 font-mono mt-0.5 leading-relaxed">
              "{unlockedInsight}"
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="w-full flex flex-col gap-2.5">
          {hasNextSector ? (
            <button
              id="victory-next-sector-button"
              onMouseEnter={() => soundManager.playUIHover()}
              onClick={() => {
                soundManager.playUIClick();
                onNextSector();
              }}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-orbitron font-bold text-xs tracking-wider rounded-xl transition-all duration-150 active:scale-95 shadow-lg shadow-emerald-500/25 cursor-pointer group"
            >
              <span>ADVANCE TO NEXT SECTOR</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          ) : (
            <div className="p-3 bg-emerald-950/50 border border-emerald-700/50 rounded-xl text-emerald-300 text-xs font-mono font-bold">
              CONGRATULATIONS: ALL FACILITY RECURSION SECTORS CONQUERED!
            </div>
          )}

          <div className="flex items-center gap-2">
            {onInspectEchoHistory && echoCount > 0 && (
              <button
                id="victory-inspect-history-button"
                onMouseEnter={() => soundManager.playUIHover()}
                onClick={() => {
                  soundManager.playUIClick();
                  onInspectEchoHistory();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/60 text-purple-300 hover:text-purple-100 font-mono text-xs rounded-xl transition-all duration-150 active:scale-95 cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>INSPECT ECHO TRACES</span>
              </button>
            )}

            <button
              id="victory-replay-sector-button"
              onMouseEnter={() => soundManager.playUIHover()}
              onClick={() => {
                soundManager.playUIClick();
                onReplaySector();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 font-mono text-xs rounded-xl transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>REPLAY FOR MASTERY</span>
            </button>

            <button
              id="victory-quit-button"
              onMouseEnter={() => soundManager.playUIHover()}
              onClick={() => {
                soundManager.playUIClick();
                onQuitToTitle();
              }}
              className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 font-mono text-xs rounded-xl transition-all duration-150 active:scale-95 cursor-pointer"
              title="Title Screen"
            >
              <Home className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
