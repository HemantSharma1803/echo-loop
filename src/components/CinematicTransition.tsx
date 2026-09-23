/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Shield, Cpu, ChevronRight, Terminal } from 'lucide-react';
import { LevelCinematicIntro } from '../types/game';
import { soundManager } from '../audio/soundSystem';

interface CinematicTransitionProps {
  intro: LevelCinematicIntro;
  onComplete: () => void;
}

export const CinematicTransition: React.FC<CinematicTransitionProps> = ({
  intro,
  onComplete,
}) => {
  const [typedText, setTypedText] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    soundManager.playSwitchToggle(true);

    // Text typing ticker
    let idx = 0;
    const fullText = intro.briefingSnippet || '';
    const timer = setInterval(() => {
      if (idx < fullText.length) {
        setTypedText(fullText.slice(0, idx + 1));
        idx++;
      } else {
        clearInterval(timer);
      }
    }, 25);

    // Auto-advance after duration (default 2.8s)
    const duration = (intro.duration || 2.8) * 1000;
    const endTimer = setTimeout(() => {
      handleAdvance();
    }, duration);

    const handleKey = () => {
      handleAdvance();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      clearInterval(timer);
      clearTimeout(endTimer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [intro]);

  const handleAdvance = () => {
    if (isFinishing) return;
    setIsFinishing(true);
    soundManager.playUIClick();
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <div
      onClick={handleAdvance}
      className={`absolute inset-0 z-50 bg-[#04060a]/95 flex flex-col items-center justify-center p-6 select-none cursor-pointer transition-opacity duration-300 ${
        isFinishing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient grid & scanline */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

      {/* Main Tactical Card */}
      <div className="relative z-10 w-full max-w-lg bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-6 md:p-8 shadow-2xl shadow-cyan-950/60 flex flex-col gap-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold tracking-wider">
            <Shield className="w-4 h-4" />
            <span>{intro.sectorTag}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
            <Cpu className="w-3.5 h-3.5 text-teal-400" />
            <span>CONTAINMENT ACTIVE</span>
          </div>
        </div>

        {/* Level Name & Zone */}
        <div>
          <div className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
            {intro.zoneTag}
          </div>
          <h2 className="font-orbitron text-2xl md:text-3xl font-black text-white tracking-wide mt-1">
            {intro.title}
          </h2>
        </div>

        {/* Typing Briefing Console */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 font-mono text-xs text-cyan-100/90 min-h-[60px] flex items-start gap-2">
          <Terminal className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {typedText}
            <span className="inline-block w-1.5 h-3.5 bg-cyan-400 ml-1 animate-pulse" />
          </p>
        </div>

        {/* Bottom Skip Indicator */}
        <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-slate-400">
          <span className="text-slate-500">INITIALIZING TIMELINE 01...</span>
          <span className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold">
            CLICK OR PRESS ANY KEY TO ENGAGE
            <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
          </span>
        </div>
      </div>
    </div>
  );
};
