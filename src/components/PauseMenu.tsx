/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, RefreshCw, Settings, Home } from 'lucide-react';
import { soundManager } from '../audio/soundSystem';

interface PauseMenuProps {
  onResume: () => void;
  onRestartLoop: () => void;
  onRestartSector: () => void;
  onOpenSettings: () => void;
  onQuitToTitle: () => void;
  sectorName: string;
  loopNumber: number;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestartLoop,
  onRestartSector,
  onOpenSettings,
  onQuitToTitle,
  sectorName,
  loopNumber,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-40 select-none">
      <div className="w-full max-w-sm bg-slate-900/90 border border-cyan-800/60 rounded-2xl p-6 shadow-2xl shadow-cyan-950/40 flex flex-col gap-5">
        {/* Header */}
        <div className="text-center border-b border-slate-800 pb-3">
          <div className="text-[10px] font-mono tracking-widest text-cyan-400 font-semibold uppercase">
            TEMPORAL SUSPENSION ACTIVE
          </div>
          <h2 className="font-orbitron text-2xl font-bold text-white tracking-wide mt-1">
            SIMULATION PAUSED
          </h2>
          <div className="text-xs text-slate-400 font-mono mt-1">
            {sectorName} // CYCLE 0{loopNumber}
          </div>
        </div>

        {/* Buttons List */}
        <div className="flex flex-col gap-2.5">
          <button
            id="pause-resume-button"
            onMouseEnter={() => soundManager.playUIHover()}
            onClick={() => {
              soundManager.playUIClick();
              onResume();
            }}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-orbitron font-bold text-xs tracking-wider rounded-xl transition-all duration-150 active:scale-95 shadow-md cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME SIMULATION</span>
          </button>

          <button
            id="pause-restart-loop-button"
            onMouseEnter={() => soundManager.playUIHover()}
            onClick={() => {
              soundManager.playUIClick();
              onRestartLoop();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-purple-800/50 hover:border-purple-500 text-purple-300 hover:text-purple-100 font-mono text-xs tracking-wider rounded-xl transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REWIND LOOP [R]</span>
          </button>

          <button
            id="pause-restart-sector-button"
            onMouseEnter={() => soundManager.playUIHover()}
            onClick={() => {
              soundManager.playUIClick();
              onRestartSector();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-mono text-xs tracking-wider rounded-xl transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RESTART SECTOR</span>
          </button>

          <button
            id="pause-settings-button"
            onMouseEnter={() => soundManager.playUIHover()}
            onClick={() => {
              soundManager.playUIClick();
              onOpenSettings();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-mono text-xs tracking-wider rounded-xl transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>CALIBRATION / SETTINGS</span>
          </button>

          <button
            id="pause-quit-button"
            onMouseEnter={() => soundManager.playUIHover()}
            onClick={() => {
              soundManager.playUIClick();
              onQuitToTitle();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-300 font-mono text-xs tracking-wider rounded-xl transition-all duration-150 active:scale-95 cursor-pointer mt-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span>RETURN TO TITLE</span>
          </button>
        </div>

        <div className="text-[10px] text-center text-slate-400 font-mono">
          Press ESC to resume
        </div>
      </div>
    </div>
  );
};
