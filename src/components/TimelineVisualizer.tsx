/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Clock, User, Eye } from 'lucide-react';

interface EchoTimelineData {
  id: string;
  label: string;
  color: string;
  role: string;
  duration: number;
}

interface TimelineVisualizerProps {
  loopNumber: number;
  totalDuration: number;
  currentLoopTime: number;
  echoes: EchoTimelineData[];
}

export const TimelineVisualizer: React.FC<TimelineVisualizerProps> = ({
  loopNumber,
  totalDuration,
  currentLoopTime,
  echoes,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const currentPercent = Math.min(100, Math.max(0, (currentLoopTime / totalDuration) * 100));

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-xl p-2.5 shadow-xl transition-all duration-200 pointer-events-auto select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] font-mono tracking-widest text-slate-300 font-bold uppercase">
            CHRONO-TIMELINE // LOOP 0{loopNumber}
          </span>
          <span className="text-[10px] font-mono text-cyan-400 font-medium">
            {currentLoopTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-cyan-300 px-2 py-0.5 rounded bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
        >
          <span>{isExpanded ? 'COMPACT' : 'PLANNING'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Main Real-Time Progress Bar */}
      <div className="relative w-full h-2 bg-slate-900 rounded-full mt-2 overflow-hidden border border-slate-800">
        <div
          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-75"
          style={{ width: `${currentPercent}%` }}
        />
        {/* Scrubber head */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-md shadow-white/80"
          style={{ left: `${currentPercent}%` }}
        />
      </div>

      {/* Detailed Multi-Track Timeline (Expanded View) */}
      {isExpanded && (
        <div className="mt-3 flex flex-col gap-2 pt-2 border-t border-slate-800/80 animate-in fade-in duration-200">
          {/* Echo Tracks */}
          {echoes.length === 0 ? (
            <div className="text-[10px] font-mono text-slate-500 py-1 text-center italic">
              No previous iterations. Record actions in this loop to create Echo 01.
            </div>
          ) : (
            echoes.map((echo, idx) => (
              <div key={echo.id} className="flex items-center gap-2 text-[10px] font-mono">
                <div className="flex items-center gap-1 min-w-[90px] text-slate-300">
                  <Eye className="w-3 h-3" style={{ color: echo.color }} />
                  <span className="font-bold">{echo.label}</span>
                  <span
                    className="text-[8px] px-1 py-0.2 rounded border uppercase"
                    style={{ borderColor: echo.color, color: echo.color }}
                  >
                    {echo.role}
                  </span>
                </div>
                <div className="relative flex-1 h-3.5 bg-slate-900/90 rounded border border-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded opacity-75"
                    style={{
                      width: `${Math.min(100, (echo.duration / totalDuration) * 100)}%`,
                      backgroundColor: echo.color,
                    }}
                  />
                  {/* Subtle marker grid */}
                  <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
                    <span className="w-px h-full bg-white" />
                    <span className="w-px h-full bg-white" />
                    <span className="w-px h-full bg-white" />
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Current Live Player Track */}
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <div className="flex items-center gap-1 min-w-[90px] text-cyan-300 font-bold">
              <User className="w-3 h-3 text-cyan-400" />
              <span>LIVE [YOU]</span>
            </div>
            <div className="relative flex-1 h-3.5 bg-slate-900/90 rounded border border-cyan-800/60 overflow-hidden">
              <div
                className="h-full rounded bg-cyan-500/80 transition-all duration-75"
                style={{ width: `${currentPercent}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm shadow-cyan-300"
                style={{ left: `${currentPercent}%` }}
              />
            </div>
          </div>

          <div className="text-[9px] font-mono text-slate-500 pt-1 flex items-center justify-between">
            <span>START: 0.0s</span>
            <span className="text-cyan-400/80">PLAN YOUR POSITIONS TO ALIGN WITH PRIOR LOOPS</span>
            <span>END: {totalDuration.toFixed(1)}s</span>
          </div>
        </div>
      )}
    </div>
  );
};
