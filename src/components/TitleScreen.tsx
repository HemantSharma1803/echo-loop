/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, HelpCircle, Settings as SettingsIcon, Volume2, VolumeX, ShieldCheck, BookOpen, Layers, Award } from 'lucide-react';
import { soundManager } from '../audio/soundSystem';
import { LEVELS } from '../engine/levels';

interface TitleScreenProps {
  onPlay: (sectorIndex: number) => void;
  onHowToPlay: () => void;
  onSettings: () => void;
  onLoreArchive?: () => void;
  onOpenProgression?: () => void;
  onOpenAchievements?: () => void;
  hasSavedProgress: boolean;
  savedSector: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onPlay,
  onHowToPlay,
  onSettings,
  onLoreArchive,
  onOpenProgression,
  onOpenAchievements,
  hasSavedProgress,
  savedSector,
}) => {
  const [selectedSector, setSelectedSector] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(soundManager.getIsMuted());

  // Trigger ambient background drone on user hover or interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      soundManager.startAmbient();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const handleToggleAudio = () => {
    const muted = soundManager.toggleMute();
    setIsAudioMuted(muted);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden select-none z-10">
      {/* Animated Sci-Fi Background Layer */}
      <div className="absolute inset-0 bg-[#04060a] -z-20">
        {/* Layered glowing radial illumination */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-900/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-purple-950/20 rounded-full blur-[140px] pointer-events-none" />

        {/* Subtle grid mesh */}
        <div 
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(to right, #0ea5e9 1px, transparent 1px), linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Ambient floating dust particles via CSS */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full top-1/4 left-1/5 animate-pulse" />
          <div className="absolute w-1 h-1 bg-purple-400 rounded-full top-2/3 left-4/5 animate-ping" />
          <div className="absolute w-2 h-2 bg-sky-300 rounded-full top-1/2 left-3/4 blur-xs animate-pulse" />
        </div>
      </div>

      {/* Top Header Status */}
      <div className="w-full max-w-5xl flex items-center justify-between text-xs font-mono text-slate-500 tracking-widest border-b border-slate-900/80 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-400 font-semibold">FACILITY CHRONO-TEST LAB // SECTOR ALPHA</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-slate-400">STATUS: RECURSION ACTIVE</span>
          <button
            onClick={handleToggleAudio}
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-[10px]">{isAudioMuted ? 'MUTED' : 'SYNTH ON'}</span>
          </button>
        </div>
      </div>

      {/* Center Cinematic Title Block */}
      <div className="flex flex-col items-center justify-center my-auto text-center gap-3">
        {/* Sub-label */}
        <div className="flex items-center gap-2 px-3 py-1 bg-cyan-950/50 border border-cyan-800/40 rounded-full text-cyan-300 text-[11px] font-mono tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>TEMPORAL DISPLACEMENT PROTOCOL</span>
        </div>

        {/* Main Glitchy Sci-Fi Title */}
        <div className="relative group">
          <h1 className="font-orbitron text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white drop-shadow-[0_0_35px_rgba(6,182,212,0.35)]">
            ECHO<span className="text-cyan-400">//</span>LOOP
          </h1>
          {/* Subtle Chromatic Ghost Shadow */}
          <div className="absolute inset-0 font-orbitron text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-purple-500/20 translate-x-[2px] translate-y-[-1px] pointer-events-none select-none blur-[1px]">
            ECHO//LOOP
          </div>
        </div>

        {/* Tagline */}
        <p className="font-rajdhani text-lg md:text-2xl text-slate-300 tracking-widest font-medium uppercase mt-1">
          &ldquo;Every action leaves a trace.&rdquo;
        </p>
        <p className="text-xs md:text-sm text-slate-400 max-w-lg font-light leading-relaxed">
          Cooperate with past echoes of yourself to solve spatial facility puzzles and breach containment before the loop resets.
        </p>

        {/* Sector Quick Selector */}
        <div className="mt-4 flex flex-wrap justify-center items-center gap-1.5 bg-slate-950/80 border border-slate-800 p-1.5 rounded-xl max-w-xl">
          {LEVELS.map((sec, idx) => (
            <button
              key={sec.id}
              onClick={() => {
                soundManager.playUIClick();
                setSelectedSector(idx);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all duration-150 cursor-pointer ${
                selectedSector === idx
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/70 shadow-sm shadow-cyan-900/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              {sec.sectorCode}: {sec.name}
            </button>
          ))}
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 w-full max-w-md">
          {/* PLAY BUTTON */}
          <button
            id="title-play-button"
            onMouseEnter={() => soundManager.playUIHover()}
            onClick={() => {
              soundManager.playUIClick();
              soundManager.startAmbient();
              onPlay(selectedSector);
            }}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-orbitron font-bold text-sm tracking-wider rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 cursor-pointer group"
          >
            <Play className="w-4 h-4 fill-current transition-transform group-hover:translate-x-0.5" />
            <span>INITIALIZE RUN</span>
          </button>

          {/* CONTINUE BUTTON (if saved progress or just quick resume) */}
          {hasSavedProgress && (
            <button
              id="title-continue-button"
              onMouseEnter={() => soundManager.playUIHover()}
              onClick={() => {
                soundManager.playUIClick();
                soundManager.startAmbient();
                onPlay(savedSector);
              }}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyan-500 text-cyan-300 font-orbitron font-bold text-sm tracking-wider rounded-xl transition-all duration-200 active:scale-95 cursor-pointer shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>CONTINUE</span>
            </button>
          )}
        </div>

        {/* Secondary Navigation Options */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-2">
          {onOpenProgression && (
            <>
              <button
                id="title-progression-button"
                onMouseEnter={() => soundManager.playUIHover()}
                onClick={() => {
                  soundManager.playUIClick();
                  onOpenProgression();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-200 tracking-wider transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>SECTOR ARCHIVES</span>
              </button>
              <span className="text-slate-700">•</span>
            </>
          )}

          {onOpenAchievements && (
            <>
              <button
                id="title-achievements-button"
                onMouseEnter={() => soundManager.playUIHover()}
                onClick={() => {
                  soundManager.playUIClick();
                  onOpenAchievements();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-amber-400 hover:text-amber-200 tracking-wider transition-colors cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>AWARDS</span>
              </button>
              <span className="text-slate-700">•</span>
            </>
          )}

          {onLoreArchive && (
            <>
              <button
                id="title-archives-button"
                onMouseEnter={() => soundManager.playUIHover()}
                onClick={() => {
                  soundManager.playUIClick();
                  onLoreArchive();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-cyan-300 tracking-wider transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>LORE DOSSIER</span>
              </button>
              <span className="text-slate-700">•</span>
            </>
          )}

          <button
            id="title-how-to-play-button"
            onMouseEnter={() => soundManager.playUIHover()}
            onClick={() => {
              soundManager.playUIClick();
              onHowToPlay();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono text-slate-400 hover:text-cyan-300 tracking-wider transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>HOW TO PLAY</span>
          </button>

          <span className="text-slate-700">•</span>

          <button
            id="title-settings-button"
            onMouseEnter={() => soundManager.playUIHover()}
            onClick={() => {
              soundManager.playUIClick();
              onSettings();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono text-slate-400 hover:text-cyan-300 tracking-wider transition-colors cursor-pointer"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>SETTINGS</span>
          </button>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 pt-4 border-t border-slate-900/80 gap-2">
        <div className="flex items-center gap-3">
          <span>CONTROLS: WASD / ARROWS</span>
          <span>•</span>
          <span>REWIND: [R]</span>
          <span>•</span>
          <span>PAUSE: [ESC]</span>
        </div>
        <div className="text-slate-400 font-medium">
          ECHO//LOOP v1.0 // COMPETITION EDITION
        </div>
      </div>
    </div>
  );
};
