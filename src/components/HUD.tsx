/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RotateCcw, Pause, Volume2, VolumeX, Eye, Disc, AlertTriangle, ShieldCheck, Cpu, X, Sparkles, BookOpen, Radio, History, Layers } from 'lucide-react';
import { soundManager } from '../audio/soundSystem';
import { LoopState } from '../types/game';
import { ParadoxStatus } from '../types/innovation';
import { AegisTransmission } from '../types/narrative';
import { TimelineVisualizer } from './TimelineVisualizer';

interface EchoTimelineInfo {
  id: string;
  label: string;
  color: string;
  role: string;
  duration: number;
}

interface HUDProps {
  loopNumber: number;
  timeRemaining: number;
  totalLoopDuration: number;
  echoCount: number;
  loopState: LoopState;
  sectorCode: string;
  sectorName: string;
  environmentalZone?: string;
  objective: string;
  isMuted: boolean;
  stability?: number;
  paradoxStatus?: ParadoxStatus;
  echoRoles?: string[];
  latestUnlockedClue?: string | null;
  secretsFound?: number;
  totalSecrets?: number;
  echoesData?: EchoTimelineInfo[];
  subjectStatus?: string;
  activeTransmission?: AegisTransmission | null;
  onOpenLoreArchive?: () => void;
  onOpenEchoHistory?: () => void;
  onOpenProgression?: () => void;
  onToggleMute: () => void;
  onRewindLoop: () => void;
  onPause: () => void;
}

const ECHO_COLORS = ['#c084fc', '#fbbf24', '#34d399', '#fb7185'];

export const HUD: React.FC<HUDProps> = ({
  loopNumber,
  timeRemaining,
  totalLoopDuration,
  echoCount,
  loopState,
  sectorCode,
  sectorName,
  environmentalZone,
  objective,
  isMuted,
  stability = 100,
  paradoxStatus = 'STABLE',
  echoRoles = [],
  latestUnlockedClue = null,
  secretsFound = 0,
  totalSecrets = 0,
  echoesData = [],
  subjectStatus,
  activeTransmission,
  onOpenLoreArchive,
  onOpenEchoHistory,
  onOpenProgression,
  onToggleMute,
  onRewindLoop,
  onPause,
}) => {
  const [dismissedClue, setDismissedClue] = useState<string | null>(null);

  const percentElapsed = Math.max(
    0,
    Math.min(100, ((totalLoopDuration - timeRemaining) / totalLoopDuration) * 100)
  );
  const isUrgent = timeRemaining <= 3.0;
  const isTransitioning = loopState === 'ENDING' || loopState === 'RESETTING';

  const isParadoxCritical = paradoxStatus === 'PARADOX' || paradoxStatus === 'COLLAPSE';
  const isParadoxWarning = paradoxStatus === 'DISTURBED' || paradoxStatus === 'UNSTABLE';

  const showClue = latestUnlockedClue && latestUnlockedClue !== dismissedClue;

  return (
    <header className="absolute top-0 left-0 right-0 p-3 md:p-4 pointer-events-none select-none z-20 flex flex-col gap-2">
      {/* Top Primary Bar */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
        {/* Left: Sector, Zone, Subject & Tactical Objective */}
        <div className="flex items-center gap-3 bg-slate-950/85 backdrop-blur-md border border-cyan-900/60 px-3.5 py-2 rounded-xl pointer-events-auto shadow-lg shadow-cyan-950/20">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <div>
            <div className="text-[10px] tracking-widest font-mono text-cyan-400 font-bold uppercase flex flex-wrap items-center gap-2">
              <span>{sectorCode} // {sectorName}</span>
              {subjectStatus && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-normal">
                  {subjectStatus}
                </span>
              )}
              {environmentalZone && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-normal">
                  {environmentalZone}
                </span>
              )}
              {totalSecrets > 0 && onOpenLoreArchive && (
                <button
                  onClick={() => {
                    soundManager.playUIClick();
                    onOpenLoreArchive();
                  }}
                  className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/80 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 font-normal flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>LOGS {secretsFound}/{totalSecrets}</span>
                </button>
              )}
            </div>
            <div className="text-xs text-slate-300 font-medium tracking-wide flex items-center gap-1.5">
              <span className="text-slate-400 font-mono text-[10px]">OBJECTIVE:</span> {objective}
            </div>
          </div>
        </div>

        {/* Center: Chrono Loop Gauge, Paradox Stability & Counter */}
        <div
          className={`flex items-center gap-4 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-xl border transition-all shadow-xl ${
            isTransitioning
              ? 'border-purple-500 shadow-purple-950/60 text-purple-200'
              : isParadoxCritical
              ? 'border-rose-500 shadow-rose-950/70 text-rose-200 animate-pulse'
              : isUrgent
              ? 'border-rose-500/90 shadow-rose-950/50 text-rose-300'
              : 'border-slate-800 text-slate-200 shadow-black/50'
          }`}
        >
          {/* Loop Cycle */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono">CYCLE</span>
            <span className="font-orbitron text-base md:text-lg font-bold text-cyan-400 leading-tight">
              0{loopNumber}
            </span>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          {/* Time Remaining Digital Readout */}
          <div className="flex flex-col items-center">
            <div className="text-[9px] font-mono tracking-wider text-slate-400">
              {isTransitioning ? 'COLLAPSING' : isUrgent ? 'TIME CRITICAL' : 'TIME REMAINING'}
            </div>
            <span
              className={`font-orbitron text-base md:text-lg font-bold leading-tight ${
                isTransitioning
                  ? 'text-purple-400'
                  : isUrgent
                  ? 'text-rose-400'
                  : 'text-cyan-300'
              }`}
            >
              {isTransitioning ? '0.0s' : `${timeRemaining.toFixed(1)}s`}
            </span>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          {/* Temporal Paradox Stability Gauge */}
          <div className="flex flex-col items-center min-w-[72px]">
            <div className="flex items-center gap-1 text-[9px] font-mono tracking-wider">
              {isParadoxCritical ? (
                <AlertTriangle className="w-3 h-3 text-rose-400 animate-bounce" />
              ) : isParadoxWarning ? (
                <AlertTriangle className="w-3 h-3 text-amber-400" />
              ) : (
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              )}
              <span className={isParadoxCritical ? 'text-rose-400 font-bold' : isParadoxWarning ? 'text-amber-400' : 'text-slate-400'}>
                STABILITY
              </span>
            </div>
            <span
              className={`font-orbitron text-sm md:text-base font-bold leading-tight ${
                stability < 50 ? 'text-rose-400' : stability < 80 ? 'text-amber-300' : 'text-emerald-400'
              }`}
            >
              {Math.round(stability)}%
            </span>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          {/* Active Echoes Counter */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono">ECHOES</span>
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-orbitron text-base font-bold text-purple-300 leading-tight">
                {echoCount}
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: History, Map, Rewind, Mute, Pause */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {onOpenEchoHistory && echoCount > 0 && (
            <button
              id="hud-history-button"
              onClick={() => {
                soundManager.playUIClick();
                onOpenEchoHistory();
              }}
              title="Inspect Echo Timeline History"
              className="flex items-center gap-1 px-2.5 py-2 bg-slate-900/90 hover:bg-purple-950/80 border border-purple-900/60 hover:border-purple-500 text-purple-300 hover:text-purple-100 rounded-xl text-xs font-mono tracking-wider transition-all duration-150 active:scale-95 shadow-md cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">ECHO LOG</span>
            </button>
          )}

          {onOpenProgression && (
            <button
              id="hud-progression-button"
              onClick={() => {
                soundManager.playUIClick();
                onOpenProgression();
              }}
              title="Facility Sector Map & Mastery"
              className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-700 text-cyan-400 hover:text-cyan-200 rounded-xl transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4" />
            </button>
          )}

          <button
            id="hud-rewind-button"
            onClick={() => {
              soundManager.playUIClick();
              onRewindLoop();
            }}
            title="Instant Loop Rewind [R]"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-purple-950/80 border border-purple-800/60 hover:border-purple-500 text-purple-300 hover:text-purple-100 rounded-xl text-xs font-mono tracking-wider transition-all duration-150 active:scale-95 shadow-md shadow-purple-950/30 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">REWIND [R]</span>
          </button>

          <button
            id="hud-mute-button"
            onClick={() => {
              soundManager.playUIClick();
              onToggleMute();
            }}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            id="hud-pause-button"
            onClick={() => {
              soundManager.playUIClick();
              onPause();
            }}
            title="Pause Game [ESC]"
            className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Multi-Echo Planning Timeline Visualizer */}
      <TimelineVisualizer
        loopNumber={loopNumber}
        totalDuration={totalLoopDuration}
        currentLoopTime={Math.max(0, totalLoopDuration - timeRemaining)}
        echoes={echoesData}
      />

      {/* AEGIS CORE Transmission Banner */}
      {activeTransmission && (
        <div className="w-full max-w-xl mx-auto pointer-events-auto bg-slate-950/95 border border-cyan-500/70 rounded-xl px-4 py-2.5 shadow-2xl shadow-cyan-950/80 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="mt-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <div className="flex-1 min-w-0 font-mono">
            <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-cyan-400" />
                <span>{activeTransmission.sender}</span>
              </span>
              <span className="text-slate-500 font-normal">SEC_TRANSMISSION</span>
            </div>
            <div className="text-xs text-white font-medium tracking-wide mt-0.5">
              {activeTransmission.text}
            </div>
            {activeTransmission.subtext && (
              <div className="text-[10px] text-slate-400 font-light mt-0.5">
                {activeTransmission.subtext}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Holographic Tactical Clue Notification Banner */}
      {showClue && latestUnlockedClue && (
        <div
          id="hud-clue-banner"
          className="w-full max-w-xl mx-auto pointer-events-auto bg-cyan-950/90 border border-cyan-500/70 rounded-xl p-3 shadow-2xl shadow-cyan-950/60 backdrop-blur-md flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="p-2 rounded-lg bg-cyan-900/60 border border-cyan-400/50 text-cyan-300">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-cyan-400 font-bold tracking-wider">
                TEMPORAL ARCHIVE DECRYPTED
              </span>
            </div>
            <p className="text-xs text-cyan-100/90 mt-1 leading-relaxed font-mono">
              {latestUnlockedClue}
            </p>
          </div>
          <button
            id="dismiss-clue-button"
            onClick={() => setDismissedClue(latestUnlockedClue)}
            className="p-1 text-cyan-400/70 hover:text-cyan-200 hover:bg-cyan-900/40 rounded transition-colors cursor-pointer"
            title="Dismiss Notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
