/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MemoryFragment } from '../types/narrative';
import { BookOpen, X, Lock, CheckCircle2, User, Calendar, Terminal } from 'lucide-react';
import { soundManager } from '../audio/soundSystem';

interface LoreArchiveModalProps {
  fragments: MemoryFragment[];
  onClose: () => void;
}

export const LoreArchiveModal: React.FC<LoreArchiveModalProps> = ({ fragments, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedFragment = fragments[selectedIndex] || fragments[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6 select-none font-rajdhani animate-in fade-in duration-300">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-orbitron text-base font-bold text-white tracking-wide">
                ATRF-01 FACILITY ARCHIVE DATABASE
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                AEGIS TEMPORAL CONTINUITY & RECURSION DOSSIER
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

        {/* Two-Column Explorer */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-900">
          {/* Left Column: Fragment List */}
          <div className="md:col-span-5 p-4 flex flex-col gap-2 overflow-y-auto max-h-[35vh] md:max-h-full">
            <div className="text-[10px] font-mono text-slate-500 tracking-widest px-2 pb-1 uppercase">
              RECOVERED ARTIFACT LOGS ({fragments.filter((f) => f.isDiscovered).length}/{fragments.length})
            </div>
            {fragments.map((frag, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={frag.id}
                  onClick={() => {
                    soundManager.playUIClick();
                    setSelectedIndex(idx);
                  }}
                  className={`flex items-start gap-2.5 p-3 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/80 border border-cyan-500/60 shadow-md text-white'
                      : 'hover:bg-slate-900 border border-transparent text-slate-400'
                  }`}
                >
                  <div className="mt-0.5">
                    {frag.isDiscovered ? (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-mono text-cyan-400/90 font-bold truncate">
                      {frag.designation}
                    </div>
                    <div className="text-xs font-semibold truncate text-slate-200">
                      {frag.isDiscovered ? frag.title : 'ENCRYPTED DATA NODE'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Selected Fragment Inspection */}
          <div className="md:col-span-7 p-6 flex flex-col gap-4 overflow-y-auto">
            {selectedFragment.isDiscovered ? (
              <div className="flex flex-col gap-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    {selectedFragment.designation}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    STATUS: DECRYPTED
                  </span>
                </div>

                <h3 className="font-orbitron text-lg font-bold text-white">
                  {selectedFragment.title}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{selectedFragment.speaker}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{selectedFragment.timestamp}</span>
                  </div>
                </div>

                <blockquote className="p-3.5 rounded-xl bg-cyan-950/40 border-l-2 border-cyan-400 text-cyan-200 text-xs font-mono leading-relaxed italic">
                  {selectedFragment.quote}
                </blockquote>

                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  {selectedFragment.narrativeText}
                </p>
              </div>
            ) : (
              <div className="my-auto flex flex-col items-center justify-center text-center gap-3 py-12 text-slate-600">
                <Lock className="w-8 h-8 text-slate-700" />
                <p className="font-mono text-xs uppercase tracking-wider">
                  ENCRYPTED FACILITY DATA
                </p>
                <p className="text-xs text-slate-500 max-w-xs font-light">
                  Explore Sector 01 to locate optional holographic data terminals and singularity shards to decrypt this entry.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-900 bg-slate-900/40 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            FACILITY CLASSIFICATION: TOP SECRET // ATRF-01
          </span>
          <button
            onClick={() => {
              soundManager.playUIClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
