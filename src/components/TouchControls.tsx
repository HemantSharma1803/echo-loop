/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { InputManager } from '../engine/inputManager';
import { soundManager } from '../audio/soundSystem';

interface TouchControlsProps {
  inputManager: InputManager;
  onRewind: () => void;
  visible: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  inputManager,
  onRewind,
  visible,
}) => {
  const stickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  const maxRadius = 45;

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (touchIdRef.current !== null) return;
      const touch = e.changedTouches[0];
      touchIdRef.current = touch.identifier;
      setIsDragging(true);

      if (stickBaseRef.current) {
        const rect = stickBaseRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;
        const dist = Math.hypot(dx, dy);

        if (dist > maxRadius) {
          dx = (dx / dist) * maxRadius;
          dy = (dy / dist) * maxRadius;
        }

        setKnobPos({ x: dx, y: dy });
        inputManager.setVirtualMovement(dx / maxRadius, dy / maxRadius);
      }
    },
    [inputManager]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchIdRef.current && stickBaseRef.current) {
          const rect = stickBaseRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          let dx = touch.clientX - centerX;
          let dy = touch.clientY - centerY;
          const dist = Math.hypot(dx, dy);

          if (dist > maxRadius) {
            dx = (dx / dist) * maxRadius;
            dy = (dy / dist) * maxRadius;
          }

          setKnobPos({ x: dx, y: dy });
          inputManager.setVirtualMovement(dx / maxRadius, dy / maxRadius);
          break;
        }
      }
    },
    [inputManager]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchIdRef.current) {
          touchIdRef.current = null;
          setIsDragging(false);
          setKnobPos({ x: 0, y: 0 });
          inputManager.setVirtualMovement(0, 0);
          break;
        }
      }
    },
    [inputManager]
  );

  useEffect(() => {
    return () => {
      inputManager.setVirtualMovement(0, 0);
    };
  }, [inputManager]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none">
      {/* Bottom Left: Virtual Analog Joystick */}
      <div className="absolute bottom-6 left-6 pointer-events-auto">
        <div
          ref={stickBaseRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="relative w-28 h-28 rounded-full bg-slate-950/60 border-2 border-cyan-700/50 backdrop-blur-sm flex items-center justify-center touch-none shadow-lg shadow-cyan-950/30"
        >
          {/* Axis markers */}
          <div className="absolute w-full h-px bg-cyan-900/30" />
          <div className="absolute h-full w-px bg-cyan-900/30" />

          {/* Draggable Knob */}
          <div
            className={`w-12 h-12 rounded-full border border-cyan-400 bg-gradient-to-br from-cyan-500/80 to-sky-700/80 shadow-md shadow-cyan-400/30 flex items-center justify-center transition-transform ${
              isDragging ? 'scale-110' : ''
            }`}
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            }}
          >
            <div className="w-4 h-4 rounded-full bg-cyan-200" />
          </div>
        </div>
      </div>

      {/* Bottom Right: Quick Rewind Action Button */}
      <div className="absolute bottom-8 right-8 pointer-events-auto flex items-center gap-4">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            soundManager.playUIClick();
            onRewind();
          }}
          onClick={(e) => {
            e.preventDefault();
            soundManager.playUIClick();
            onRewind();
          }}
          className="w-16 h-16 rounded-full bg-purple-950/80 border-2 border-purple-500/80 text-purple-200 flex flex-col items-center justify-center shadow-lg shadow-purple-950/40 active:scale-90 transition-transform cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-mono font-bold tracking-widest">REWIND</span>
        </button>
      </div>
    </div>
  );
};
