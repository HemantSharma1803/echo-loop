/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Clock, Eye, Layers, Compass, ArrowRight, Zap, Cpu, Activity } from 'lucide-react';
import { soundManager } from '../audio/soundSystem';

interface HowToPlayModalProps {
  onClose: () => void;
  onPlayNow?: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose, onPlayNow }) => {
  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div className="w-full max-w-2xl bg-slate-900/95 border border-cyan-800/60 rounded-2xl p-6 md:p-8 shadow-2xl shadow-cyan-950/50 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-cyan-400 font-semibold uppercase">
              TACTICAL FIELD MANUAL // ARCHIVE v3.2
            </div>
            <h2 className="font-orbitron text-2xl font-bold text-white tracking-wide">
              ECHO//LOOP PUZZLE FRAMEWORK
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.playUIClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Core Concepts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Card 1: The Loop */}
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-cyan-400">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="font-orbitron text-xs font-bold text-slate-100">1. CHRONO-CYCLE</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Time is trapped in an exact loop cycle. When the countdown completes or you press [R], time resets to spawn.
            </p>
          </div>

          {/* Card 2: The Echo */}
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-purple-400">
              <Eye className="w-4 h-4 text-purple-400" />
              <h3 className="font-orbitron text-xs font-bold text-slate-100">2. TEMPORAL ECHO</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Your movements and actions are recorded. Upon reset, an Echo faithfully repeats what you did in previous timelines.
            </p>
          </div>

          {/* Card 3: Mechanical Cooperation */}
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-amber-400">
              <Layers className="w-4 h-4 text-amber-400" />
              <h3 className="font-orbitron text-xs font-bold text-slate-100">3. SELF-COOPERATION</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Echoes can stand on pressure plates and trigger switches, freeing you to advance through newly opened corridors.
            </p>
          </div>

          {/* Card 4: Navigation & Exit */}
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-emerald-400">
              <Compass className="w-4 h-4 text-emerald-400" />
              <h3 className="font-orbitron text-xs font-bold text-slate-100">4. AIRLOCK EXTRACTION</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Solve the facility matrix and step into the green extraction airlock before the cycle collapses to clear the sector.
            </p>
          </div>
        </div>

        {/* Advanced Puzzle Entities Guide */}
        <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-xl flex flex-col gap-3">
          <div className="text-[11px] font-mono text-cyan-300 font-semibold tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>INTERACTIVE PUZZLE & TEMPORAL MECHANICS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
            <div className="p-2.5 bg-slate-900 rounded-lg border border-purple-900/40 flex flex-col gap-1">
              <div className="flex items-center gap-1 text-purple-300 font-bold">
                <Activity className="w-3 h-3 text-purple-400" />
                <span>RESONANCE & SYNC</span>
              </div>
              <span className="text-[11px] text-slate-400 font-sans font-light">
                Resonance nodes charge when occupied by you or an Echo. Sync pairs require simultaneous dual occupancy.
              </span>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-sky-900/40 flex flex-col gap-1">
              <div className="flex items-center gap-1 text-sky-300 font-bold">
                <Cpu className="w-3 h-3 text-sky-400" />
                <span>SHADOWS & PHASES</span>
              </div>
              <span className="text-[11px] text-slate-400 font-sans font-light">
                Shadow zones mask Echoes. Phase walls and bridges shift between permeable states upon interaction.
              </span>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-rose-900/40 flex flex-col gap-1">
              <div className="flex items-center gap-1 text-rose-300 font-bold">
                <Zap className="w-3 h-3 text-rose-400" />
                <span>PARADOX & STABILITY</span>
              </div>
              <span className="text-[11px] text-slate-400 font-sans font-light">
                Every action leaves a trace. Contradicting past events destabilizes the loop—keep stability above zero!
              </span>
            </div>
          </div>
        </div>

        {/* Input Scheme Reference */}
        <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl">
          <div className="text-[11px] font-mono text-cyan-300 font-semibold mb-2.5 tracking-wider">
            INPUT PROTOCOLS
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="flex flex-col gap-0.5 p-2 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px]">MOVEMENT</span>
              <span className="text-slate-200 font-bold">W A S D / ARROWS</span>
              <span className="text-slate-500 text-[10px]">PRECISION MOVEMENT</span>
            </div>
            <div className="flex flex-col gap-0.5 p-2 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-purple-400 text-[10px]">REWIND CYCLE</span>
              <span className="text-purple-200 font-bold">[R] KEY</span>
              <span className="text-slate-500 text-[10px]">INSTANT RESET</span>
            </div>
            <div className="flex flex-col gap-0.5 p-2 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px]">INTERACT / SCAN</span>
              <span className="text-slate-200 font-bold">[E] / [SPACE]</span>
              <span className="text-slate-500 text-[10px]">TERMINALS & CONSOLES</span>
            </div>
            <div className="flex flex-col gap-0.5 p-2 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-cyan-400 text-[10px]">PAUSE / MENU</span>
              <span className="text-cyan-200 font-bold">[ESC] / [P]</span>
              <span className="text-slate-500 text-[10px]">SUSPEND SIMULATION</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            onClick={() => {
              soundManager.playUIClick();
              onClose();
            }}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-xl transition-colors cursor-pointer"
          >
            DISMISS
          </button>
          {onPlayNow && (
            <button
              onClick={() => {
                soundManager.playUIClick();
                soundManager.startAmbient();
                onPlayNow();
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-orbitron font-bold text-xs tracking-wider rounded-xl transition-all duration-150 active:scale-95 shadow-md shadow-cyan-500/30 cursor-pointer"
            >
              <span>COMMENCE EXPERIMENT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
