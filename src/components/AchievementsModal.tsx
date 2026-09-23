/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Award,
  X,
  Lock,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Footprints,
  Users,
  Zap,
  Database,
  Radio,
  Sparkles,
  History,
} from 'lucide-react';
import { GameAchievement } from '../types/engagement';
import { masteryManager } from '../engine/MasteryManager';
import { soundManager } from '../audio/soundSystem';

interface AchievementsModalProps {
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Footprints: <Footprints className="w-5 h-5 text-cyan-400" />,
  Users: <Users className="w-5 h-5 text-purple-400" />,
  Clock: <Clock className="w-5 h-5 text-amber-400" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
  Zap: <Zap className="w-5 h-5 text-sky-400" />,
  Database: <Database className="w-5 h-5 text-indigo-400" />,
  Award: <Award className="w-5 h-5 text-amber-400" />,
  Radio: <Radio className="w-5 h-5 text-rose-400" />,
  Sparkles: <Sparkles className="w-5 h-5 text-amber-300" />,
  History: <History className="w-5 h-5 text-purple-300" />,
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ onClose }) => {
  const [filter, setFilter] = useState<'ALL' | 'UNLOCKED'>('ALL');
  const achievements = masteryManager.getAchievements();

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const filtered = filter === 'ALL' ? achievements : achievements.filter((a) => a.unlocked);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6 select-none font-rajdhani animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-orbitron text-sm md:text-base font-bold text-white tracking-wide">
                TEMPORAL ARCHIVE ACHIEVEMENTS
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                OPERATIVE PERFORMANCE AWARDS & ANOMALY DISCOVERIES ({unlockedCount}/{achievements.length})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px] font-mono">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filter === 'ALL' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => setFilter('UNLOCKED')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filter === 'UNLOCKED' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                }`}
              >
                UNLOCKED ({unlockedCount})
              </button>
            </div>

            <button
              onClick={() => {
                soundManager.playUIClick();
                onClose();
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filtered.map((ach) => {
            const iconEl = ICON_MAP[ach.icon] || <Award className="w-5 h-5 text-cyan-400" />;
            const isSecretLocked = ach.isSecret && !ach.unlocked;

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-150 ${
                  ach.unlocked
                    ? 'bg-slate-900/80 border-slate-700/80 shadow-md'
                    : 'bg-slate-950/50 border-slate-900/90 opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    ach.unlocked
                      ? 'bg-slate-800/80 border-slate-700'
                      : 'bg-slate-950 border-slate-900 text-slate-600'
                  }`}
                >
                  {isSecretLocked ? (
                    <Lock className="w-4 h-4 text-slate-600" />
                  ) : ach.unlocked ? (
                    iconEl
                  ) : (
                    <div className="opacity-40">{iconEl}</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-orbitron text-xs font-bold text-white tracking-wide truncate">
                      {isSecretLocked ? '??? [CLASSIFIED ARCHIVE]' : ach.title}
                    </span>
                    {ach.unlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="text-[9px] font-mono text-slate-600 uppercase">LOCKED</span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono mt-1 leading-relaxed">
                    {isSecretLocked ? ach.secretDescription : ach.description}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-900 border border-slate-800 text-slate-400">
                      {ach.category}
                    </span>
                    {ach.unlockedAt && (
                      <span className="text-[9px] font-mono text-slate-400">
                        {new Date(ach.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-900 bg-slate-900/40 text-[11px] font-mono text-slate-400">
          <span>Master temporal mechanics and experiment across loops to uncover all awards.</span>
          <button
            onClick={() => {
              soundManager.playUIClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-xl cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
