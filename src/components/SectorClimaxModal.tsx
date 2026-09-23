/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, Terminal, RotateCcw, Home, BookOpen, AlertTriangle } from 'lucide-react';
import { soundManager } from '../audio/soundSystem';

interface SectorClimaxModalProps {
  onReplaySector: () => void;
  onQuitToTitle: () => void;
  onOpenLoreArchive: () => void;
  discoveredFragmentsCount: number;
  totalFragmentsCount: number;
}

export const SectorClimaxModal: React.FC<SectorClimaxModalProps> = ({
  onReplaySector,
  onQuitToTitle,
  onOpenLoreArchive,
  discoveredFragmentsCount,
  totalFragmentsCount,
}) => {
  const [stage, setStage] = useState<number>(0);

  useEffect(() => {
    soundManager.playMemoryFlashback();
    const timers: NodeJS.Timeout[] = [];

    timers.push(
      setTimeout(() => {
        setStage(1);
        soundManager.playAegisChime();
      }, 1200)
    );

    timers.push(
      setTimeout(() => {
        setStage(2);
        soundManager.playSwitchToggle(true);
      }, 3000)
    );

    timers.push(
      setTimeout(() => {
        setStage(3);
        soundManager.playUnknownEchoWhisper();
      }, 5200)
    );

    timers.push(
      setTimeout(() => {
        setStage(4);
        soundManager.playAegisChime();
      }, 7400)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#020408]/95 backdrop-blur-lg flex items-center justify-center p-4 select-none overflow-hidden font-rajdhani animate-in fade-in duration-500">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-900/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-xl bg-slate-950 border border-purple-500/40 rounded-2xl p-6 md:p-8 shadow-2xl shadow-purple-950/60 flex flex-col items-center text-center gap-5">
        {/* Top Header Tag */}
        <div className="flex items-center gap-2 px-3 py-1 bg-purple-950/60 border border-purple-700/60 rounded-full text-purple-300 text-xs font-mono tracking-widest">
          <Terminal className="w-3.5 h-3.5 text-purple-400" />
          <span>ATRF-01 // CORE SINGULARITY CHAMBER</span>
        </div>

        {/* Cinematic Staged Transmission */}
        <div className="w-full flex flex-col items-center gap-3 font-mono">
          <div className="text-emerald-400 font-bold text-sm tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>CONTAINMENT CORE RESTORED</span>
          </div>

          {stage >= 1 && (
            <div className="text-cyan-300 text-sm tracking-widest font-bold animate-in fade-in duration-500">
              IDENTITY CONFIRMED // <span className="text-cyan-400 underline">SUBJECT 07</span>
            </div>
          )}

          {stage >= 2 && (
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl w-full flex items-center justify-between text-xs animate-in fade-in duration-500">
              <span className="text-slate-400">CHRONO-TELEMETRY STATUS:</span>
              <span className="text-amber-400 font-black tracking-widest text-sm">
                CURRENT LOOP: 001
              </span>
            </div>
          )}

          {stage >= 3 && (
            <div className="p-3.5 bg-rose-950/30 border border-rose-600/40 rounded-xl text-rose-300 text-xs font-mono tracking-widest italic animate-in fade-in duration-700 flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>&ldquo;YOU HAVE BEEN HERE BEFORE.&rdquo;</span>
            </div>
          )}
        </div>

        {/* Sector Complete Milestone Card */}
        {stage >= 4 && (
          <div className="flex flex-col items-center gap-3 w-full border-t border-slate-900 pt-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center gap-2 text-purple-400 font-orbitron text-2xl md:text-3xl font-black tracking-tight">
              <span>SECTOR 01 COMPLETE</span>
            </div>

            <p className="text-xs text-slate-400 max-w-md font-light leading-relaxed">
              You have mastered temporal displacement and synchronized three concurrent timelines. But the facility claims this was only your first loop—and the Unknown Echo was watching from the shadows.
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                FACILITY ARCHIVE LOGS: {discoveredFragmentsCount} / {totalFragmentsCount} RECOVERED
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full mt-2">
              <button
                onClick={() => {
                  soundManager.playUIClick();
                  onOpenLoreArchive();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>ARCHIVES</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playUIClick();
                  onReplaySector();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>REPLAY</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playUIClick();
                  onQuitToTitle();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-orbitron font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-cyan-500/20"
              >
                <Home className="w-3.5 h-3.5" />
                <span>TITLE SCREEN</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
