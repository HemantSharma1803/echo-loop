/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useCallback } from 'react';
import { MemoryFragment } from '../types/narrative';
import { Disc, Radio, User, Calendar, X, Sparkles } from 'lucide-react';
import { soundManager } from '../audio/soundSystem';

interface MemoryFragmentModalProps {
  fragment: MemoryFragment;
  onClose: () => void;
}

export const MemoryFragmentModal: React.FC<MemoryFragmentModalProps> = ({
  fragment,
  onClose,
}) => {
  const handleDismiss = useCallback(() => {
    soundManager.playUIClick();
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDismiss]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
      {/* Vignette Container */}
      <div className="relative w-full max-w-lg bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl shadow-cyan-950/70 overflow-hidden text-slate-200 font-rajdhani">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Header Tag */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-mono text-xs text-cyan-400 font-bold tracking-widest uppercase">
              {fragment.designation} // DECRYPTED MEMORY
            </span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Flashback Holographic Canvas Vignette */}
        <div className="relative w-full h-32 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center overflow-hidden mb-4">
          {/* Animated Sine Waveform Bars */}
          <div className="flex items-center gap-1.5 opacity-70">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-cyan-500 to-indigo-400 rounded-full animate-pulse"
                style={{
                  height: `${Math.max(12, Math.sin(i * 0.4) * 55 + 40)}px`,
                  animationDelay: `${i * 60}ms`,
                }}
              />
            ))}
          </div>

          {/* Central Holographic Emblem */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full border border-cyan-400/30 flex items-center justify-center bg-cyan-950/40 shadow-inner">
              <Disc className="w-8 h-8 text-cyan-300 animate-spin" />
            </div>
          </div>

          <div className="absolute bottom-2 left-3 font-mono text-[9px] text-cyan-500/80 tracking-widest">
            TEMPORAL RECONSTRUCTION // 432 Hz RESONANCE
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-3">
          <h2 className="font-orbitron text-lg font-bold text-white tracking-wide">
            {fragment.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>{fragment.speaker}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>{fragment.timestamp}</span>
            </div>
          </div>

          {/* Core Quote */}
          <blockquote className="p-3.5 rounded-xl bg-cyan-950/30 border-l-2 border-cyan-400 text-cyan-200 text-sm italic font-mono leading-relaxed">
            {fragment.quote}
          </blockquote>

          {/* Contextual Narrative Insight */}
          <p className="text-xs text-slate-300 font-light leading-relaxed">
            {fragment.narrativeText}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-slate-900 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
            <Sparkles className="w-3 h-3" />
            ARCHIVED IN FACILITY DATABASE
          </span>

          <button
            onClick={handleDismiss}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-orbitron font-bold text-xs tracking-wider transition-all duration-150 active:scale-95 cursor-pointer shadow-md shadow-cyan-500/20"
          >
            RESUME ITERATION [SPACE]
          </button>
        </div>
      </div>
    </div>
  );
};
