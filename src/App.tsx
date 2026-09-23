/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { GameState, GameSettings, LoopState, DebugInfo } from './types/game';
import { ParadoxStatus } from './types/innovation';
import { AegisTransmission, MemoryFragment } from './types/narrative';
import { LEVELS } from './engine/levels';
import { LevelManager } from './engine/LevelManager';
import { InputManager } from './engine/inputManager';
import { GameEngine } from './engine/gameEngine';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { GameCanvas } from './components/GameCanvas';
import { PauseMenu } from './components/PauseMenu';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { CinematicTransition } from './components/CinematicTransition';
import { OpeningCinematic } from './components/OpeningCinematic';
import { MemoryFragmentModal } from './components/MemoryFragmentModal';
import { SectorClimaxModal } from './components/SectorClimaxModal';
import { LoreArchiveModal } from './components/LoreArchiveModal';
import { EchoHistoryModal } from './components/EchoHistoryModal';
import { SectorProgressionModal } from './components/SectorProgressionModal';
import { AchievementsModal } from './components/AchievementsModal';
import { TouchControls } from './components/TouchControls';
import { DebugOverlay } from './components/DebugOverlay';
import { soundManager } from './audio/soundSystem';
import { masteryManager } from './engine/MasteryManager';
import { LevelMasteryStatus, EchoHistoryEntry } from './types/engagement';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [showCinematicIntro, setShowCinematicIntro] = useState(false);
  const [secretAlert, setSecretAlert] = useState<string | null>(null);

  // Segment 6 Narrative State
  const [showOpeningCinematic, setShowOpeningCinematic] = useState(false);
  const [activeTransmission, setActiveTransmission] = useState<AegisTransmission | null>(null);
  const [subjectStatus, setSubjectStatus] = useState<string>('SUBJECT: UNKNOWN');
  const [activeFragment, setActiveFragment] = useState<MemoryFragment | null>(null);
  const [showSectorClimax, setShowSectorClimax] = useState(false);
  const [showLoreArchive, setShowLoreArchive] = useState(false);

  // Segment 8: Engagement, Replayability, Mastery & Achievements State
  const [showEchoHistory, setShowEchoHistory] = useState(false);
  const [showProgressionMap, setShowProgressionMap] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [echoHistoryData, setEchoHistoryData] = useState<EchoHistoryEntry[]>([]);
  const [lastRunResult, setLastRunResult] = useState<{
    efficiency: number;
    challengeSuccess: boolean;
    isMastered: boolean;
    elapsedSeconds: number;
    resetsCount: number;
    masteryStatus: LevelMasteryStatus | null;
  } | null>(null);
  const [achievementNotification, setAchievementNotification] = useState<string | null>(null);

  // Level Manager
  const levelManager = useMemo(() => new LevelManager(LEVELS), []);

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    masterVolume: 0.8,
    sfxVolume: 0.8,
    musicVolume: 0.6,
    temporalVolume: 0.8,
    uiVolume: 0.7,
    graphicsQuality: 'high',
    reducedMotion: false,
    screenShake: true,
    scanlines: true,
    touchControls: 'auto',
    showDebugOverlay: false,
  });

  // HUD data
  const [hudData, setHudData] = useState<{
    loopNumber: number;
    timeRemaining: number;
    totalLoopDuration: number;
    echoCount: number;
    loopState: LoopState;
    stability?: number;
    paradoxStatus?: ParadoxStatus;
    echoRoles?: string[];
    latestUnlockedClue?: string | null;
  }>({
    loopNumber: 1,
    timeRemaining: 12.0,
    totalLoopDuration: 12.0,
    echoCount: 0,
    loopState: 'RECORDING',
    stability: 100,
    paradoxStatus: 'STABLE',
    echoRoles: [],
    latestUnlockedClue: null,
  });

  // Diagnostic telemetry
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    loopState: 'IDLE',
    loopNumber: 1,
    loopTimer: 0,
    loopDuration: 12.0,
    echoCount: 0,
    recordedFrameCount: 0,
    fps: 60,
    playerPos: { x: 0, y: 0 },
    playerVel: { x: 0, y: 0 },
  });

  // Touch device detection
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  const shouldShowTouch = useMemo(() => {
    if (settings.touchControls === 'always') return true;
    if (settings.touchControls === 'disabled') return false;
    return isTouchDevice;
  }, [settings.touchControls, isTouchDevice]);

  // Current level
  const currentLevel = LEVELS[currentLevelIndex] || LEVELS[0];

  // Persistent InputManager
  const inputManager = useMemo(() => new InputManager(), []);

  // Pause / Rewind callbacks from inputs
  const handleTogglePause = useCallback(() => {
    setGameState((prev) => {
      if (prev === 'PLAYING') return 'PAUSED';
      if (prev === 'PAUSED') return 'PLAYING';
      return prev;
    });
  }, []);

  const handleManualRewind = useCallback(() => {
    if (engineRef.current && gameState === 'PLAYING') {
      engineRef.current.triggerManualLoopReset();
    }
  }, [gameState]);

  useEffect(() => {
    inputManager.init(handleTogglePause, handleManualRewind);
    return () => {
      inputManager.destroy();
    };
  }, [inputManager, handleTogglePause, handleManualRewind]);

  // Keyboard shortcut for debug overlay (F1 or backtick)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1' || e.key === '`') {
        e.preventDefault();
        setSettings((prev) => ({
          ...prev,
          showDebugOverlay: !prev.showDebugOverlay,
        }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // GameEngine Reference
  const engineRef = useRef<GameEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new GameEngine(currentLevel, inputManager, settings);
  }

  // Hook callbacks into engine
  useEffect(() => {
    masteryManager.onAchievementUnlocked((ach) => {
      setAchievementNotification(`ACHIEVEMENT UNLOCKED // ${ach.title}`);
      setTimeout(() => setAchievementNotification(null), 4500);
    });
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      const narrative = engineRef.current.narrativeSystem;
      setSubjectStatus(narrative.getSubjectStatus());
      const unsubscribeTransmission = narrative.onTransmissionChange((trans) => setActiveTransmission(trans));
      const unsubscribeSubjectStatus = narrative.onSubjectStatusChange((status) => setSubjectStatus(status));
      const unsubscribeMemoryFragment = narrative.onMemoryFragmentUnlocked((frag) => setActiveFragment(frag));

      engineRef.current.setOnLevelComplete(() => {
        const runSummary = engineRef.current!.getRunSummaryData();
        const innovationState = engineRef.current!.getInnovationState();
        const paradoxCount = innovationState.paradoxStatus === 'PARADOX' ? 1 : 0;

        levelManager.recordCompletion(
          currentLevel.id,
          engineRef.current!.loopManager.getLoopNumber(),
          runSummary.elapsedSeconds
        );

        // Record run in MasteryManager for mastery evaluation and ghost trace
        const runResult = masteryManager.recordRun({
          levelId: currentLevel.id,
          loopsUsed: engineRef.current!.loopManager.getLoopNumber(),
          echoesCreated: engineRef.current!.echoManager.getEchoCount(),
          timeTaken: runSummary.elapsedSeconds,
          resetsCount: runSummary.resetsCount,
          paradoxCount,
          discoveredSecretIds: currentLevel.optionalSecrets
            ? currentLevel.optionalSecrets.filter((s) => levelManager.isSecretDiscovered(s.id)).map((s) => s.id)
            : [],
          playerFinalPath: runSummary.playerFinalPath,
        });

        setLastRunResult({
          efficiency: runResult.efficiency,
          challengeSuccess: runResult.challengeSuccess,
          isMastered: runResult.isNewMastery || (runResult.masteryStatus?.isMastered ?? false),
          elapsedSeconds: runSummary.elapsedSeconds,
          resetsCount: runSummary.resetsCount,
          masteryStatus: runResult.masteryStatus,
        });

        // Store echo history snapshot for modal inspection
        setEchoHistoryData(engineRef.current!.getDetailedEchoHistory());

        if (currentLevel.id === 6) {
          setShowSectorClimax(true);
        } else {
          setGameState('LEVEL_COMPLETE');
        }
      });

      engineRef.current.setOnSecretDiscovered((secret) => {
        levelManager.discoverSecret(secret.id);
        setSecretAlert(`ARCHIVE RECOVERED // ${secret.name}`);
        setTimeout(() => setSecretAlert(null), 4000);
      });

      return () => {
        unsubscribeTransmission();
        unsubscribeSubjectStatus();
        unsubscribeMemoryFragment();
      };
    }
  }, [currentLevel, levelManager]);

  // Handle Game Start / Level Switching
  const handleStartGame = (sectorIndex = 0, isReplay = false, isTimeTrial = false) => {
    setCurrentLevelIndex(sectorIndex);
    levelManager.setCurrentLevelIndex(sectorIndex);
    const targetLevel = LEVELS[sectorIndex] || LEVELS[0];
    if (engineRef.current) {
      engineRef.current.resetLevel(targetLevel, isReplay, isTimeTrial);
      const bestRun = masteryManager.getBestRun(targetLevel.id);
      engineRef.current.setBestRunGhostPath(bestRun ? bestRun.pathSnippet : null);
      setSubjectStatus(engineRef.current.narrativeSystem.getSubjectStatus());
    }
    setHudData({
      loopNumber: 1,
      timeRemaining: targetLevel.loopDuration,
      totalLoopDuration: targetLevel.loopDuration,
      echoCount: 0,
      loopState: 'RECORDING',
    });

    if (sectorIndex === 0 && engineRef.current && !engineRef.current.narrativeSystem.getHasSeenOpeningCinematic()) {
      setShowOpeningCinematic(true);
      engineRef.current.narrativeSystem.setHasSeenOpeningCinematic(true);
    } else if (targetLevel.cinematicIntro) {
      setShowCinematicIntro(true);
    }
    setGameState('PLAYING');
  };

  const handleNextSector = () => {
    const nextIdx = currentLevelIndex + 1;
    if (nextIdx < LEVELS.length) {
      handleStartGame(nextIdx);
    } else {
      setGameState('TITLE');
    }
  };

  const handleReplaySector = () => {
    handleStartGame(currentLevelIndex, true, false);
  };

  const handleRestartLoop = () => {
    if (engineRef.current) {
      engineRef.current.triggerManualLoopReset();
    }
    setGameState('PLAYING');
  };

  const handleRestartSector = () => {
    handleStartGame(currentLevelIndex);
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsAudioMuted(muted);
  };

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (engineRef.current) {
        engineRef.current.updateSettings(updated);
      }
      return updated;
    });
  };

  return (
    <main className="relative w-screen h-screen bg-[#04060a] text-slate-100 overflow-hidden font-rajdhani select-none">
      {/* 1. TITLE SCREEN */}
      {gameState === 'TITLE' && (
        <TitleScreen
          onPlay={handleStartGame}
          onHowToPlay={() => setGameState('HOW_TO_PLAY')}
          onSettings={() => setGameState('SETTINGS')}
          onLoreArchive={() => setShowLoreArchive(true)}
          onOpenProgression={() => setShowProgressionMap(true)}
          onOpenAchievements={() => setShowAchievements(true)}
          hasSavedProgress={currentLevelIndex > 0}
          savedSector={currentLevelIndex}
        />
      )}

      {/* 2. PLAYING / PAUSED / LEVEL_COMPLETE / HUD VIEW */}
      {(gameState === 'PLAYING' ||
        gameState === 'PAUSED' ||
        gameState === 'LEVEL_COMPLETE') && (
        <div className="relative w-full h-full">
          {/* Main Gameplay Canvas */}
          {engineRef.current && (
            <GameCanvas
              engine={engineRef.current}
              level={currentLevel}
              settings={settings}
              isPaused={gameState !== 'PLAYING'}
              onHUDUpdate={(data) => {
                setHudData({
                  loopNumber: data.loopNumber,
                  timeRemaining: data.timeRemaining,
                  totalLoopDuration: data.totalLoopDuration,
                  echoCount: data.echoCount,
                  loopState: data.loopState,
                  stability: data.innovationState?.stability,
                  paradoxStatus: data.innovationState?.paradoxStatus,
                  echoRoles: data.echoRoles,
                  latestUnlockedClue: data.innovationState?.latestUnlockedClue,
                });
                setDebugInfo(data.debugInfo);
              }}
            />
          )}

          {/* Sci-Fi In-Game HUD */}
          <HUD
            loopNumber={hudData.loopNumber}
            timeRemaining={hudData.timeRemaining}
            totalLoopDuration={hudData.totalLoopDuration}
            echoCount={hudData.echoCount}
            loopState={hudData.loopState}
            sectorCode={currentLevel.sectorCode}
            sectorName={currentLevel.name}
            environmentalZone={currentLevel.environmentalZone}
            objective={currentLevel.objective}
            isMuted={isAudioMuted}
            stability={hudData.stability}
            paradoxStatus={hudData.paradoxStatus}
            echoRoles={hudData.echoRoles}
            latestUnlockedClue={hudData.latestUnlockedClue}
            secretsFound={
              currentLevel.optionalSecrets?.filter((s) => levelManager.isSecretDiscovered(s.id))
                .length || 0
            }
            totalSecrets={currentLevel.optionalSecrets?.length || 0}
            echoesData={engineRef.current?.getEchoTimelineData() || []}
            subjectStatus={subjectStatus}
            activeTransmission={activeTransmission}
            onOpenLoreArchive={() => setShowLoreArchive(true)}
            onOpenEchoHistory={() => {
              if (engineRef.current) {
                setEchoHistoryData(engineRef.current.getDetailedEchoHistory());
              }
              setShowEchoHistory(true);
            }}
            onOpenProgression={() => setShowProgressionMap(true)}
            onToggleMute={handleToggleMute}
            onRewindLoop={handleManualRewind}
            onPause={() => setGameState('PAUSED')}
          />

          {/* Optional Secret Discovered Notification Banner */}
          {secretAlert && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-cyan-950/90 border border-cyan-400 px-4 py-2 rounded-xl text-cyan-200 font-mono text-xs flex items-center gap-2 shadow-2xl shadow-cyan-950/80 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
              <span className="font-bold tracking-wider">{secretAlert}</span>
            </div>
          )}

          {/* Cinematic Intro Card */}
          {showCinematicIntro && currentLevel.cinematicIntro && (
            <CinematicTransition
              intro={currentLevel.cinematicIntro}
              onComplete={() => setShowCinematicIntro(false)}
            />
          )}

          {/* Opening Cinematic Sequence */}
          {showOpeningCinematic && (
            <OpeningCinematic
              onComplete={() => {
                setShowOpeningCinematic(false);
                if (currentLevel.cinematicIntro) {
                  setShowCinematicIntro(true);
                }
              }}
            />
          )}

          {/* Memory Fragment Flashback Modal */}
          {activeFragment && (
            <MemoryFragmentModal
              fragment={activeFragment}
              onClose={() => {
                setActiveFragment(null);
                if (engineRef.current) {
                  engineRef.current.narrativeSystem.closeActiveFragment();
                }
              }}
            />
          )}

          {/* Virtual Touch Joystick & Action Buttons for Mobile */}
          <TouchControls
            inputManager={inputManager}
            onRewind={handleManualRewind}
            visible={shouldShowTouch && gameState === 'PLAYING'}
          />

          {/* Diagnostics Debug Overlay */}
          <DebugOverlay
            info={debugInfo}
            visible={settings.showDebugOverlay}
          />
        </div>
      )}

      {/* 3. PAUSE MENU */}
      {gameState === 'PAUSED' && (
        <PauseMenu
          onResume={() => setGameState('PLAYING')}
          onRestartLoop={handleRestartLoop}
          onRestartSector={handleRestartSector}
          onOpenSettings={() => setGameState('SETTINGS')}
          onQuitToTitle={() => setGameState('TITLE')}
          sectorName={currentLevel.name}
          loopNumber={hudData.loopNumber}
        />
      )}

      {/* 4. LEVEL COMPLETE MODAL */}
      {gameState === 'LEVEL_COMPLETE' && (
        <LevelCompleteModal
          levelId={currentLevel.id}
          sectorCode={currentLevel.sectorCode}
          sectorName={currentLevel.subtitle || currentLevel.name}
          levelName={`${currentLevel.name} // CLEARED`}
          loopNumber={hudData.loopNumber}
          echoCount={hudData.echoCount}
          elapsedSeconds={lastRunResult?.elapsedSeconds}
          resetsCount={lastRunResult?.resetsCount}
          efficiency={lastRunResult?.efficiency}
          isMastered={lastRunResult?.isMastered}
          challengeSuccess={lastRunResult?.challengeSuccess}
          masteryStatus={lastRunResult?.masteryStatus}
          unlockedInsight={currentLevel.completionSequence?.unlockedInsight}
          secretsFound={
            currentLevel.optionalSecrets?.filter((s) => levelManager.isSecretDiscovered(s.id))
              .length || 0
          }
          totalSecrets={currentLevel.optionalSecrets?.length || 0}
          hasNextSector={currentLevelIndex + 1 < LEVELS.length}
          onNextSector={handleNextSector}
          onReplaySector={handleReplaySector}
          onInspectEchoHistory={() => setShowEchoHistory(true)}
          onQuitToTitle={() => setGameState('TITLE')}
        />
      )}

      {/* 4b. SECTOR 01 CLIMAX REVELATION MODAL */}
      {showSectorClimax && (
        <SectorClimaxModal
          onReplaySector={() => {
            setShowSectorClimax(false);
            handleReplaySector();
          }}
          onQuitToTitle={() => {
            setShowSectorClimax(false);
            setGameState('TITLE');
          }}
          onOpenLoreArchive={() => setShowLoreArchive(true)}
          discoveredFragmentsCount={
            engineRef.current?.narrativeSystem.getDiscoveredFragmentsCount() || 0
          }
          totalFragmentsCount={
            engineRef.current?.narrativeSystem.getTotalFragmentsCount() || 6
          }
        />
      )}

      {/* 4c. FACILITY LORE ARCHIVE MODAL */}
      {showLoreArchive && (
        <LoreArchiveModal
          fragments={engineRef.current?.narrativeSystem.getDiscoveredFragments() || []}
          onClose={() => setShowLoreArchive(false)}
        />
      )}

      {/* 4d. ECHO TIMELINE HISTORY MODAL */}
      {showEchoHistory && (
        <EchoHistoryModal
          echoes={echoHistoryData}
          sectorName={currentLevel.name}
          sectorCode={currentLevel.sectorCode}
          onClose={() => setShowEchoHistory(false)}
          onReplaySector={handleReplaySector}
        />
      )}

      {/* 4e. SECTOR PROGRESSION & MASTERY MAP */}
      {showProgressionMap && (
        <SectorProgressionModal
          levels={LEVELS}
          currentLevelIndex={currentLevelIndex}
          onSelectLevel={(idx) => handleStartGame(idx)}
          onClose={() => setShowProgressionMap(false)}
          onOpenAchievements={() => setShowAchievements(true)}
          onOpenLoreArchive={() => setShowLoreArchive(true)}
        />
      )}

      {/* 4f. AWARDS & ACHIEVEMENTS MODAL */}
      {showAchievements && (
        <AchievementsModal onClose={() => setShowAchievements(false)} />
      )}

      {/* Real-time Achievement Unlock Toast */}
      {achievementNotification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-amber-950/95 border border-amber-400 px-5 py-3 rounded-2xl text-amber-200 font-mono text-xs flex items-center gap-3 shadow-2xl shadow-amber-950/90 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span className="font-bold tracking-wider">{achievementNotification}</span>
        </div>
      )}

      {/* 5. HOW TO PLAY MODAL */}
      {gameState === 'HOW_TO_PLAY' && (
        <HowToPlayModal
          onClose={() => setGameState('TITLE')}
          onPlayNow={() => handleStartGame(0)}
        />
      )}

      {/* 6. SETTINGS MODAL */}
      {gameState === 'SETTINGS' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setGameState('TITLE')}
        />
      )}
    </main>
  );
}
