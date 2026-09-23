/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Terminal, ShieldAlert, Cpu, Sparkles, FastForward } from 'lucide-react';
import { soundManager } from '../audio/soundSystem';

interface OpeningCinematicProps {
  onComplete: () => void;
}

export const OpeningCinematic: React.FC<OpeningCinematicProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<number>(0);
  const [glitchActive, setGlitchActive] = useState<boolean>(false);

  // Skip handler
  const handleSkip = useCallback(() => {
    soundManager.playUIClick();
    onComplete();
  }, [onComplete]);

  // Keyboard shortcut for skip (Space, Enter, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  // Phase progression timeline (Total duration ~13 seconds, highly cinematic)
  useEffect(() => {
    soundManager.startAmbient();
    soundManager.playSystemGlitch();

    const timers: NodeJS.Timeout[] = [];

    // Phase 1: Recovery Protocol prompt (0.8s)
    timers.push(
      setTimeout(() => {
        setPhase(1);
        soundManager.playAegisChime();
      }, 800)
    );

    // Phase 2: Power Surge & Flash (3.2s)
    timers.push(
      setTimeout(() => {
        setPhase(2);
        setGlitchActive(true);
        soundManager.playSystemGlitch();
        setTimeout(() => setGlitchActive(false), 300);
      }, 3200)
    );

    // Phase 3: Facility Diagnostics (5.5s)
    timers.push(
      setTimeout(() => {
        setPhase(3);
        soundManager.playSwitchToggle(true);
      }, 5500)
    );

    // Phase 4: Temporal Containment Warning & Subject designation (8.0s)
    timers.push(
      setTimeout(() => {
        setPhase(4);
        soundManager.playPlateActivate();
      }, 8000)
    );

    // Phase 5: Loop Initialization & Player Awakes (10.5s)
    timers.push(
      setTimeout(() => {
        setPhase(5);
        soundManager.playEchoSpawn();
      }, 10500)
    );

    // Finish and hand over to gameplay (13.0s)
    timers.push(
      setTimeout(() => {
        onComplete();
      }, 13000)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#020408] text-white flex flex-col items-center justify-between p-8 select-none overflow-hidden font-mono">
      {/* Glitch Overlay */}
      {glitchActive && (
        <div className="absolute inset-0 bg-cyan-500/20 mix-blend-difference pointer-events-none z-40 animate-pulse" />
      )}

      {/* Atmospheric Background Grid & Scanlines */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,4,8,0.85)_100%)] pointer-events-none" />

      {/* Top Header & Skip Button */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10 text-xs text-slate-500 tracking-widest border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-400 font-bold">ATRF-01 // BOOT SEQUENCE</span>
        </div>
        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-700/60 transition-all text-[11px] cursor-pointer"
        >
          <span>SKIP SEQUENCE</span>
          <FastForward className="w-3.5 h-3.5" />
          <span className="text-[9px] text-slate-600">[SPACE]</span>
        </button>
      </div>

      {/* Center Cinematic Terminal Prompts */}
      <div className="my-auto w-full max-w-2xl flex flex-col items-center justify-center text-center gap-6 z-10">
        {/* Phase 0 & 1: Recovery Protocol */}
        {phase >= 1 && (
          <div className="flex flex-col items-center gap-2 animate-in fade-in duration-700">
            <div className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Terminal className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <p className="text-cyan-400 font-orbitron text-xl md:text-2xl font-bold tracking-widest">
              RECOVERY PROTOCOL...
            </p>
            <p className="text-slate-500 text-xs tracking-wider">
              AEGIS TEMPORAL RESEARCH FACILITY // SECTOR 01
            </p>
          </div>
        )}

        {/* Phase 2 & 3: Power Surge & Diagnostics */}
        {phase >= 2 && (
          <div className="w-full max-w-md bg-slate-950/90 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-2.5 text-left text-xs shadow-2xl shadow-cyan-950/40 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-900 pb-2">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>CHRONO-TELEMETRY DIAGNOSTIC</span>
              </span>
              <span className="text-cyan-400 font-mono text-[10px]">POWER TIER 01</span>
            </div>

            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-400">TEMPORAL CONTAINMENT:</span>
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                UNSTABLE
              </span>
            </div>

            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-400">MEMORY RECOVERY:</span>
              <span className="text-amber-400 font-bold">FAILED [CORRUPTED]</span>
            </div>

            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-400">SUBJECT IDENTIFIER:</span>
              <span className="text-cyan-300 font-bold">SUBJECT: UNKNOWN</span>
            </div>
          </div>
        )}

        {/* Phase 4 & 5: Loop Initialization & Player Awakes */}
        {phase >= 4 && (
          <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center gap-2 px-3 py-1 bg-rose-950/60 border border-rose-700/60 rounded-full text-rose-300 text-xs font-bold tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-spin" />
              <span>LOOP STATUS: ACTIVE</span>
            </div>
            <p className="text-slate-400 text-sm font-rajdhani tracking-widest max-w-sm mt-1">
              Every action leaves an indelible trace. Cooperate with past iterations to break containment.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer Telemetry */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10 text-[10px] text-slate-600 border-t border-slate-900 pt-3">
        <span>FACILITY ID: ATRF-01</span>
        <span className="animate-pulse text-cyan-500 font-bold">INITIALIZING OPERATIVE SENSORS...</span>
        <span>RECURSION MATRIX: 30Hz</span>
      </div>
    </div>
  );
};
