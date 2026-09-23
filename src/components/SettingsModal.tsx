/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Volume2, VolumeX, Smartphone, Monitor } from 'lucide-react';
import { GameSettings } from '../types/game';
import { soundManager } from '../audio/soundSystem';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const isMuted = soundManager.getIsMuted();

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div className="w-full max-w-md bg-slate-900/95 border border-cyan-800/60 rounded-2xl p-6 shadow-2xl shadow-cyan-950/50 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-cyan-400 font-semibold uppercase">
              FACILITY SYSTEMS CALIBRATION
            </div>
            <h2 className="font-orbitron text-xl font-bold text-white tracking-wide">
              SETTINGS & PREFERENCES
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.playUIClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Calibration */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-300 font-semibold tracking-wider">
              AUDIO EMISSION MODULES
            </span>
            <button
              onClick={() => {
                const muted = soundManager.toggleMute();
                soundManager.setMute(muted);
                soundManager.playUIClick();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{isMuted ? 'UNMUTE ALL' : 'MUTE ALL'}</span>
            </button>
          </div>

          {/* Master Volume */}
          <div className="flex items-center justify-between gap-4 text-xs font-mono text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
            <span className="w-28">MASTER OUTPUT</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateSettings({ masterVolume: val });
                soundManager.setVolumes(val, settings.sfxVolume, settings.musicVolume);
              }}
              className="flex-1 accent-cyan-400 cursor-pointer"
            />
            <span className="w-8 text-right font-bold text-cyan-400">
              {Math.round(settings.masterVolume * 100)}%
            </span>
          </div>

          {/* SFX Volume */}
          <div className="flex items-center justify-between gap-4 text-xs font-mono text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
            <span className="w-28">SFX SYNTHESIZER</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateSettings({ sfxVolume: val });
                soundManager.setVolumes(settings.masterVolume, val, settings.musicVolume);
              }}
              className="flex-1 accent-cyan-400 cursor-pointer"
            />
            <span className="w-8 text-right font-bold text-cyan-400">
              {Math.round(settings.sfxVolume * 100)}%
            </span>
          </div>

          {/* Ambience Volume */}
          <div className="flex items-center justify-between gap-4 text-xs font-mono text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
            <span className="w-28">AMBIENT DRONE</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateSettings({ musicVolume: val });
                soundManager.setVolumes(settings.masterVolume, settings.sfxVolume, val);
              }}
              className="flex-1 accent-cyan-400 cursor-pointer"
            />
            <span className="w-8 text-right font-bold text-cyan-400">
              {Math.round(settings.musicVolume * 100)}%
            </span>
          </div>

          {/* Temporal VFX Audio Volume */}
          <div className="flex items-center justify-between gap-4 text-xs font-mono text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
            <span className="w-28">TEMPORAL FX</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.temporalVolume ?? 0.8}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateSettings({ temporalVolume: val });
                soundManager.setBusVolume('temporal', val);
              }}
              className="flex-1 accent-cyan-400 cursor-pointer"
            />
            <span className="w-8 text-right font-bold text-cyan-400">
              {Math.round((settings.temporalVolume ?? 0.8) * 100)}%
            </span>
          </div>

          {/* UI Feedback Volume */}
          <div className="flex items-center justify-between gap-4 text-xs font-mono text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
            <span className="w-28">INTERFACE HUD</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.uiVolume ?? 0.7}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateSettings({ uiVolume: val });
                soundManager.setBusVolume('ui', val);
              }}
              className="flex-1 accent-cyan-400 cursor-pointer"
            />
            <span className="w-8 text-right font-bold text-cyan-400">
              {Math.round((settings.uiVolume ?? 0.7) * 100)}%
            </span>
          </div>
        </div>

        {/* Visual FX & Controls */}
        <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-800">
          <span className="text-xs font-mono text-cyan-300 font-semibold tracking-wider">
            VISUAL & PERFORMANCE PARAMETERS
          </span>

          {/* Graphics Quality */}
          <div className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              <span>GRAPHICS QUALITY</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              {(['low', 'medium', 'high'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    soundManager.playUIClick();
                    onUpdateSettings({ graphicsQuality: q });
                  }}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-mono tracking-wider transition-colors cursor-pointer uppercase ${
                    (settings.graphicsQuality || 'high') === q
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion (Accessibility) */}
          <label className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-300 cursor-pointer">
            <div>
              <div className="font-semibold text-white">REDUCED MOTION (ACCESSIBILITY)</div>
              <div className="text-[10px] text-slate-400">Disables intense distortions & shortens rewind</div>
            </div>
            <input
              type="checkbox"
              checked={!!settings.reducedMotion}
              onChange={(e) => {
                soundManager.playUIClick();
                onUpdateSettings({ reducedMotion: e.target.checked });
              }}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </label>

          {/* Screen Shake */}
          <label className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-300 cursor-pointer">
            <span>SEISMIC SCREEN SHAKE (LOOP COLLAPSE)</span>
            <input
              type="checkbox"
              checked={settings.screenShake}
              onChange={(e) => onUpdateSettings({ screenShake: e.target.checked })}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </label>

          {/* CRT Scanlines */}
          <label className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-300 cursor-pointer">
            <span>TERMINAL SCANLINE OVERLAY</span>
            <input
              type="checkbox"
              checked={settings.scanlines}
              onChange={(e) => onUpdateSettings({ scanlines: e.target.checked })}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </label>

          {/* Developer Diagnostics Overlay */}
          <label className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80 text-xs font-mono text-cyan-300 cursor-pointer">
            <span>ENGINE DIAGNOSTICS OVERLAY [F1]</span>
            <input
              type="checkbox"
              checked={settings.showDebugOverlay}
              onChange={(e) => onUpdateSettings({ showDebugOverlay: e.target.checked })}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </label>

          {/* Touch Controls Mode */}
          <div className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>TOUCH CONTROLS</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              {(['auto', 'always', 'disabled'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onUpdateSettings({ touchControls: mode })}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider transition-colors cursor-pointer uppercase ${
                    settings.touchControls === mode
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playUIClick();
            onClose();
          }}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-orbitron font-bold text-xs tracking-wider rounded-xl transition-all duration-150 active:scale-95 shadow-md cursor-pointer mt-1"
        >
          CONFIRM & RETURN
        </button>
      </div>
    </div>
  );
};
