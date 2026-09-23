/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { History, X, Eye, Clock, Activity, Play, ChevronRight, Zap } from 'lucide-react';
import { EchoHistoryEntry } from '../types/engagement';
import { soundManager } from '../audio/soundSystem';

interface EchoHistoryModalProps {
  echoes: EchoHistoryEntry[];
  sectorName: string;
  sectorCode: string;
  onClose: () => void;
  onReplaySector?: () => void;
}

export const EchoHistoryModal: React.FC<EchoHistoryModalProps> = ({
  echoes,
  sectorName,
  sectorCode,
  onClose,
  onReplaySector,
}) => {
  const [selectedEchoIndex, setSelectedEchoIndex] = useState(0);

  const activeEcho = echoes[selectedEchoIndex] || echoes[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-rajdhani animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-orbitron text-sm md:text-base font-bold text-white tracking-wide">
                TEMPORAL ECHO HISTORY VIEWER
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                {sectorCode} // {sectorName} // ARCHIVED EXECUTION TRACES
              </p>
            </div>
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

        {/* Content Body */}
        {echoes.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-3 text-slate-500">
            <Eye className="w-8 h-8 text-slate-600" />
            <p className="font-mono text-xs uppercase tracking-wider">NO ECHOES RECORDED IN THIS RUN</p>
            <p className="text-xs text-slate-400 max-w-xs font-light">
              This sector was resolved on Loop 001 without leaving residual temporal traces.
            </p>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-900">
            {/* Left Column: Echo List */}
            <div className="md:col-span-5 p-4 flex flex-col gap-2 overflow-y-auto">
              <div className="text-[10px] font-mono text-slate-400 tracking-widest px-1 uppercase">
                ITERATION TIMELINES ({echoes.length})
              </div>
              {echoes.map((e, idx) => {
                const isSelected = selectedEchoIndex === idx;
                return (
                  <button
                    key={e.echoIndex}
                    onClick={() => {
                      soundManager.playUIClick();
                      setSelectedEchoIndex(idx);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-purple-500/60 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: e.color }}
                      />
                      <div>
                        <div className="font-mono text-xs font-bold text-white tracking-wider">
                          ECHO #{e.echoIndex < 10 ? `0${e.echoIndex}` : e.echoIndex}
                        </div>
                        <div className="text-[10px] font-mono text-purple-400">
                          ROLE: {e.role}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[11px] text-slate-400">
                      {e.duration}s
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Detailed Timeline Inspection */}
            {activeEcho && (
              <div className="md:col-span-7 p-6 flex flex-col gap-5 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-purple-400 font-bold uppercase">
                      TIMELINE #{activeEcho.echoIndex} ANALYSIS
                    </span>
                    <h3 className="font-orbitron text-lg font-bold text-white mt-0.5">
                      {activeEcho.label} // [{activeEcho.role}]
                    </h3>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase border"
                    style={{
                      borderColor: activeEcho.color,
                      color: activeEcho.color,
                      backgroundColor: `${activeEcho.color}15`,
                    }}
                  >
                    ACTIVE TRACE
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col">
                    <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>LIFETIME DURATION</span>
                    </span>
                    <span className="font-orbitron text-lg font-bold text-white mt-1">
                      {activeEcho.duration}s
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col">
                    <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                      <Activity className="w-3 h-3 text-amber-400" />
                      <span>DISTANCE TRAVERSED</span>
                    </span>
                    <span className="font-orbitron text-lg font-bold text-white mt-1">
                      {activeEcho.distanceTraveled}m
                    </span>
                  </div>
                </div>

                {/* Action Summary */}
                <div className="p-3.5 bg-purple-950/30 border border-purple-800/40 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-purple-400 uppercase font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>OBSERVED ACTIONS</span>
                  </span>
                  <p className="text-xs text-purple-200/90 font-mono leading-relaxed">
                    {activeEcho.keyActionSummary}
                  </p>
                </div>

                {/* Timeline Progress Bar Graphic */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    SPATIAL PATHWAY SAMPLES
                  </span>
                  <div className="w-full bg-slate-900 h-3 rounded-full border border-slate-800 relative overflow-hidden flex items-center">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: '100%',
                        backgroundColor: activeEcho.color,
                        opacity: 0.7,
                      }}
                    />
                    {activeEcho.timelineSamplePoints
                      .filter((p) => p.isInteracting)
                      .map((p, idx) => {
                        const leftPct = Math.min(95, (p.t / Math.max(1, activeEcho.duration)) * 100);
                        return (
                          <div
                            key={idx}
                            className="absolute top-0 bottom-0 w-1 bg-amber-400"
                            style={{ left: `${leftPct}%` }}
                            title={`Interaction at ${p.t}s`}
                          />
                        );
                      })}
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span>T=0.0s (Spawn)</span>
                    <span className="text-amber-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Amber markers indicate physical interaction
                    </span>
                    <span>T={activeEcho.duration}s (Loop End)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-900 bg-slate-900/40">
          <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
            Inspect past Echo executions to refine loop efficiency.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onReplaySector && (
              <button
                onClick={() => {
                  soundManager.playUIClick();
                  onClose();
                  onReplaySector();
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs rounded-xl transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>REPLAY & EXPERIMENT</span>
              </button>
            )}
            <button
              onClick={() => {
                soundManager.playUIClick();
                onClose();
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-xl transition-colors cursor-pointer"
            >
              DISMISS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
