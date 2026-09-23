/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DebugInfo } from '../types/game';
import { Terminal, Activity, Cpu } from 'lucide-react';

interface DebugOverlayProps {
  info: DebugInfo;
  visible: boolean;
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({ info, visible }) => {
  if (!visible) return null;

  return (
    <aside
      aria-label="Developer diagnostics"
      className="absolute top-16 left-6 z-40 bg-slate-950/90 border border-cyan-500/40 rounded-xl p-3 text-[11px] font-mono text-cyan-300 shadow-2xl backdrop-blur-md pointer-events-none select-none max-w-xs"
    >
      <div className="flex items-center gap-2 border-b border-cyan-900/60 pb-1.5 mb-2 text-cyan-400 font-bold">
        <Terminal className="w-3.5 h-3.5" />
        <span className="tracking-wider">TEMPORAL ENGINE DIAGNOSTICS</span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <span className="text-slate-400">STATE:</span>
        <span className="font-bold text-emerald-400">{info.loopState}</span>

        <span className="text-slate-400">LOOP INDEX:</span>
        <span className="text-white font-bold">{info.loopNumber}</span>

        <span className="text-slate-400">LOOP TIMER:</span>
        <span className="text-cyan-300">
          {info.loopTimer.toFixed(2)}s / {info.loopDuration.toFixed(1)}s
        </span>

        <span className="text-slate-400">ACTIVE ECHOES:</span>
        <span className="text-purple-300 font-bold">{info.echoCount}</span>

        <span className="text-slate-400">REC FRAMES:</span>
        <span className="text-cyan-200">{info.recordedFrameCount}</span>

        <span className="text-slate-400">ENGINE FPS:</span>
        <span className={`font-bold ${info.fps < 45 ? 'text-amber-400' : 'text-emerald-400'}`}>
          {info.fps} FPS
        </span>

        <span className="text-slate-400">PLAYER COORD:</span>
        <span className="text-slate-200">
          X:{Math.round(info.playerPos.x)} Y:{Math.round(info.playerPos.y)}
        </span>

        <span className="text-slate-400">VELOCITY:</span>
        <span className="text-slate-200">
          {Math.round(info.playerVel.x)}, {Math.round(info.playerVel.y)}
        </span>
      </div>

      <div className="mt-2 pt-1.5 border-t border-cyan-900/50 flex items-center justify-between text-[9px] text-slate-500">
        <span>SAMPLING: 30Hz DETERMINISTIC</span>
        <span className="text-cyan-600">[F1 TO TOGGLE]</span>
      </div>
    </aside>
  );
};
