import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { RoomState, TypingRaceState, TypingRaceMove } from '@bvb/shared';
import { PixelCharacter } from '../pixel/PixelCharacter';
import { GamePixelIcon } from '../game-icons/GamePixelIcon';

interface TypingRaceGameProps {
  roomState: RoomState;
  gameState: TypingRaceState;
  myPlayerId: string;
  onSendMove: (move: TypingRaceMove) => void;
  theme?: 'day' | 'night';
}

// Zero-dependency sound effects synthesizer using Web Audio API
class RaceSoundSynth {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playKeyClick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600 + Math.random() * 200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.035);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Audio autoplay policy
    }
  }

  public playMistake() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.setValueAtTime(110, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch {
      // Ignore audio policy
    }
  }

  public playCountdownBeep(high = false) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(high ? 880 : 440, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (high ? 0.35 : 0.15));
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + (high ? 0.36 : 0.16));
    } catch {
      // Ignore
    }
  }

  public playFinishFanfare() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.1, this.ctx!.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(this.ctx!.currentTime + i * 0.1);
        osc.stop(this.ctx!.currentTime + i * 0.1 + 0.26);
      });
    } catch {
      // Ignore
    }
  }
}

const soundSynth = new RaceSoundSynth();

export const TypingRaceGame: React.FC<TypingRaceGameProps> = ({
  roomState,
  gameState,
  myPlayerId,
  onSendMove,
  theme = 'day',
}) => {
  const isNight = theme === 'night';
  const playerA = roomState.players.playerA;
  const playerB = roomState.players.playerB;
  const isPlayerA = myPlayerId === playerA?.id;

  const opponentId = gameState.playerIds.find((id) => id !== myPlayerId) || '';
  const opponent = isPlayerA ? playerB : playerA;

  const myState = gameState.playerStates[myPlayerId] || {
    charIndex: 0,
    wpm: 0,
    accuracy: 100,
    progress: 0,
    completed: false,
    finishTimeMs: null,
    mistakesCount: 0,
  };

  const opponentState = gameState.playerStates[opponentId] || {
    charIndex: 0,
    wpm: 0,
    accuracy: 100,
    progress: 0,
    completed: false,
    finishTimeMs: null,
    mistakesCount: 0,
  };

  // Local client typing state
  const [localCharIndex, setLocalCharIndex] = useState(myState.charIndex);
  const [mistakesCount, setMistakesCount] = useState(myState.mistakesCount);
  const [currentErrorChar, setCurrentErrorChar] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [countdownNum, setCountdownNum] = useState<number | 'GO' | null>(null);
  const [localWpm, setLocalWpm] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const passageContainerRef = useRef<HTMLDivElement | null>(null);
  const lastSentTimeRef = useRef<number>(0);
  const playedCountdownRef = useRef<Record<string, boolean>>({});
  const playedFinishRef = useRef<boolean>(false);

  // Sync audio toggle with soundSynth
  useEffect(() => {
    soundSynth.enabled = soundEnabled;
  }, [soundEnabled]);

  // Keep localCharIndex updated if server progresses
  useEffect(() => {
    if (myState.charIndex > localCharIndex) {
      setLocalCharIndex(myState.charIndex);
    }
  }, [myState.charIndex, localCharIndex]);

  // Synchronized countdown timer
  useEffect(() => {
    const checkCountdown = () => {
      const now = Date.now();
      const remainingMs = gameState.startTime - now;

      if (remainingMs > 2000) {
        setCountdownNum(3);
        if (!playedCountdownRef.current['3']) {
          playedCountdownRef.current['3'] = true;
          soundSynth.playCountdownBeep(false);
        }
      } else if (remainingMs > 1000) {
        setCountdownNum(2);
        if (!playedCountdownRef.current['2']) {
          playedCountdownRef.current['2'] = true;
          soundSynth.playCountdownBeep(false);
        }
      } else if (remainingMs > 0) {
        setCountdownNum(1);
        if (!playedCountdownRef.current['1']) {
          playedCountdownRef.current['1'] = true;
          soundSynth.playCountdownBeep(false);
        }
      } else if (remainingMs > -1200) {
        setCountdownNum('GO');
        if (!playedCountdownRef.current['GO']) {
          playedCountdownRef.current['GO'] = true;
          soundSynth.playCountdownBeep(true);
        }
      } else {
        setCountdownNum(null);
      }
    };

    checkCountdown();
    const interval = setInterval(checkCountdown, 100);
    return () => clearInterval(interval);
  }, [gameState.startTime]);

  // Keep input focused so player can type immediately
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput, countdownNum]);

  // Play fanfare when finished
  useEffect(() => {
    if (gameState.status === 'FINISHED' && !playedFinishRef.current) {
      playedFinishRef.current = true;
      soundSynth.playFinishFanfare();
    }
  }, [gameState.status]);

  // Transmit move to server
  const sendProgress = useCallback(
    (charIdx: number, mistakes: number, isImmediate = false) => {
      const now = Date.now();
      if (!isImmediate && now - lastSentTimeRef.current < 80) {
        return;
      }
      lastSentTimeRef.current = now;

      const elapsedMinutes = Math.max(0.005, (now - gameState.startTime) / 60000);
      const calculatedWpm = Math.round((charIdx / 5) / elapsedMinutes);
      const totalKeypresses = charIdx + mistakes;
      const calculatedAccuracy = totalKeypresses > 0 ? Math.round((charIdx / totalKeypresses) * 100) : 100;

      setLocalWpm(calculatedWpm);

      onSendMove({
        action: 'PROGRESS',
        charIndex: charIdx,
        mistakesCount: mistakes,
        accuracy: calculatedAccuracy,
        wpm: calculatedWpm,
      });
    },
    [gameState.startTime, onSendMove]
  );

  // Handle typing input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const now = Date.now();
    // Cannot type during countdown or when finished
    if (now < gameState.startTime || gameState.status === 'FINISHED' || localCharIndex >= gameState.text.length) {
      return;
    }

    // Ignore special control keys
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    if (e.key === 'Backspace') {
      if (currentErrorChar !== null) {
        setCurrentErrorChar(null);
      }
      return;
    }

    // Single printable character check
    if (e.key.length === 1) {
      const targetChar = gameState.text[localCharIndex];

      if (currentErrorChar !== null) {
        // Must backspace or correct error before progressing
        soundSynth.playMistake();
        return;
      }

      if (e.key === targetChar) {
        // Correct character typed!
        soundSynth.playKeyClick();
        const nextIndex = localCharIndex + 1;
        setLocalCharIndex(nextIndex);
        setCurrentErrorChar(null);

        const isFinished = nextIndex >= gameState.text.length;
        sendProgress(nextIndex, mistakesCount, isFinished);
      } else {
        // Mistake!
        soundSynth.playMistake();
        setCurrentErrorChar(e.key);
        const newMistakes = mistakesCount + 1;
        setMistakesCount(newMistakes);
        sendProgress(localCharIndex, newMistakes, false);
      }
    }
  };

  const textLength = gameState.text.length;
  const isRacing = Date.now() >= gameState.startTime && gameState.status !== 'FINISHED';
  const isFinished = gameState.status === 'FINISHED' || localCharIndex >= textLength;
  const isWinner = gameState.winnerPlayerId === myPlayerId;

  // Visual racers progress percentage
  const myProgress = Math.min(100, Math.round((localCharIndex / textLength) * 100));
  const opponentProgress = Math.min(100, opponentState.progress || 0);

  // Determine lanes
  const lane1IsMe = isPlayerA;
  const lane1Name = playerA?.name || 'PLAYER 1';
  const lane1Progress = lane1IsMe ? myProgress : opponentProgress;
  const lane1Wpm = lane1IsMe ? (localWpm || myState.wpm) : opponentState.wpm;
  const lane1Completed = lane1IsMe ? isFinished : opponentState.completed;

  const lane2IsMe = !isPlayerA;
  const lane2Name = playerB?.name || 'PLAYER 2';
  const lane2Progress = lane2IsMe ? myProgress : opponentProgress;
  const lane2Wpm = lane2IsMe ? (localWpm || myState.wpm) : opponentState.wpm;
  const lane2Completed = lane2IsMe ? isFinished : opponentState.completed;

  return (
    <div
      onClick={focusInput}
      className="w-full h-full flex flex-col justify-between items-center p-2 sm:p-4 select-none relative z-10 max-w-5xl mx-auto"
    >
      {/* Hidden real input for mobile keyboards and desktop focus capture */}
      <input
        ref={inputRef}
        type="text"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        value=""
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        className="opacity-0 pointer-events-none fixed top-0 left-0 w-1 h-1"
        aria-label="Typing input stream"
      />

      {/* ================= TOP HEADER & HUD ================= */}
      <div
        className={`w-full p-2.5 sm:p-3 border-2 sm:border-4 border-ink shadow-pixel flex items-center justify-between transition-colors ${
          isNight ? 'bg-slate-900/90 text-white' : 'bg-surface text-ink'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <GamePixelIcon gameId="typing-race" size={26} className="flex-shrink-0 animate-bounce" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-xs sm:text-sm text-cyan-400 tracking-wider">TYPE RACER</span>
              <span className="text-[10px] sm:text-xs font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                1v1 DRAG STRIP
              </span>
            </div>
            <div className="text-[10px] sm:text-xs opacity-75 font-mono truncate max-w-[180px] sm:max-w-xs">
              {gameState.title} {gameState.author && `— ${gameState.author}`}
            </div>
          </div>
        </div>

        {/* Audio Mute/Sound Toggle & Series Score */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSoundEnabled(!soundEnabled);
            }}
            className={`px-2 py-1 border border-ink text-[10px] sm:text-xs font-pixel rounded shadow-sm hover:opacity-80 active:scale-95 transition-all ${
              soundEnabled
                ? 'bg-gameBoyGreen/20 text-gameBoyGreen border-gameBoyGreen'
                : 'bg-slate-800 text-slate-400 border-slate-600'
            }`}
            title="Toggle mechanical key sound effects"
          >
            {soundEnabled ? '🔊 SFX' : '🔇 MUTE'}
          </button>

          {/* Series scoreboard badge */}
          {roomState.currentMatch && (
            <div className="font-pixel text-[11px] sm:text-sm px-2.5 py-1 bg-ink text-surface rounded border border-ink/40 shadow-inner flex items-center gap-2">
              <span className={isPlayerA ? 'text-cyan-400 font-bold' : 'text-slate-300'}>
                {roomState.currentMatch.scores.playerA}
              </span>
              <span className="text-slate-500">:</span>
              <span className={!isPlayerA ? 'text-arcadeRed font-bold' : 'text-slate-300'}>
                {roomState.currentMatch.scores.playerB}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ================= 2-LANE RACING STRIP ================= */}
      <div
        className={`w-full my-2.5 p-3 sm:p-4 border-2 sm:border-4 border-ink shadow-pixel rounded-lg relative overflow-hidden transition-colors ${
          isNight ? 'bg-slate-950 text-white' : 'bg-slate-900 text-slate-100'
        }`}
      >
        {/* Asphalt road track markings */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Finish Line Checkered Strip */}
        <div className="absolute top-0 right-7 sm:right-9 bottom-0 w-3 z-0 flex flex-col justify-between opacity-80 pointer-events-none">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className={`w-full h-2 ${i % 2 === 0 ? 'bg-white' : 'bg-black'}`}
            />
          ))}
        </div>
        <div className="absolute top-1 right-2 text-[9px] font-pixel text-yellow-400 font-bold z-10 pointer-events-none">
          FINISH 🏁
        </div>

        {/* --- LANE 1: PLAYER A (CYAN TURBO KART) --- */}
        <div className="relative h-14 sm:h-16 flex items-center border-b border-dashed border-slate-700/80 mb-2">
          {/* Lane Label */}
          <div className="absolute left-2 top-1 flex items-center gap-1.5 z-10">
            <PixelCharacter type="bro1" size={14} />
            <span className="text-[10px] font-pixel text-cyan-300 tracking-wider truncate max-w-[100px] sm:max-w-[140px]">
              {lane1Name}
            </span>
            {lane1IsMe && (
              <span className="text-[8px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 px-1 py-0.2 rounded font-mono font-bold">
                YOU
              </span>
            )}
            <span className="text-[10px] font-mono text-cyan-400 font-bold ml-1">
              {lane1Wpm} WPM
            </span>
          </div>

          {/* Car Slider */}
          <div
            className="absolute left-1 flex items-center transition-all duration-150 ease-out z-20"
            style={{
              left: `calc(10px + ${lane1Progress * 0.78}%)`,
            }}
          >
            {/* Turbo Exhaust Flame when racing fast */}
            {lane1Wpm > 40 && isRacing && (
              <div className="flex items-center -mr-1 animate-pulse">
                <span className="text-xs -scale-x-100">🔥</span>
              </div>
            )}

            {/* Cyan Pixel Racer Car SVG */}
            <div className="relative group">
              <svg width="42" height="24" viewBox="0 0 42 24" className="drop-shadow-[0_2px_4px_rgba(6,182,212,0.6)]">
                {/* Rear Wing */}
                <rect x="2" y="3" width="3" height="18" fill="#00f0ff" />
                <rect x="5" y="8" width="4" height="8" fill="#0891b2" />
                {/* Wheels */}
                <rect x="8" y="1" width="7" height="4" fill="#0f172a" stroke="#00f0ff" strokeWidth="0.5" />
                <rect x="8" y="19" width="7" height="4" fill="#0f172a" stroke="#00f0ff" strokeWidth="0.5" />
                <rect x="27" y="1" width="7" height="4" fill="#0f172a" stroke="#00f0ff" strokeWidth="0.5" />
                <rect x="27" y="19" width="7" height="4" fill="#0f172a" stroke="#00f0ff" strokeWidth="0.5" />
                {/* Body Chassis */}
                <rect x="8" y="6" width="22" height="12" fill="#06b6d4" />
                <rect x="14" y="5" width="14" height="14" fill="#22d3ee" />
                {/* Cockpit / Helmet */}
                <rect x="18" y="9" width="6" height="6" fill="#facc15" />
                <rect x="20" y="10" width="3" height="3" fill="#ffffff" />
                {/* Nose Cone */}
                <polygon points="30,6 39,12 30,18" fill="#00f0ff" />
              </svg>

              {/* Progress Pin floating over car */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-cyan-300 bg-slate-900/90 px-1 rounded border border-cyan-500/50 whitespace-nowrap">
                {lane1Progress}%
              </div>
            </div>

            {lane1Completed && (
              <span className="ml-1 text-sm animate-bounce">🏁</span>
            )}
          </div>
        </div>

        {/* --- LANE 2: PLAYER B (PINK/RED TURBO KART) --- */}
        <div className="relative h-14 sm:h-16 flex items-center">
          {/* Lane Label */}
          <div className="absolute left-2 top-1 flex items-center gap-1.5 z-10">
            <PixelCharacter type="bro2" size={14} />
            <span className="text-[10px] font-pixel text-pink-300 tracking-wider truncate max-w-[100px] sm:max-w-[140px]">
              {lane2Name}
            </span>
            {lane2IsMe && (
              <span className="text-[8px] bg-pink-500/20 text-pink-300 border border-pink-400/50 px-1 py-0.2 rounded font-mono font-bold">
                YOU
              </span>
            )}
            <span className="text-[10px] font-mono text-pink-400 font-bold ml-1">
              {lane2Wpm} WPM
            </span>
          </div>

          {/* Car Slider */}
          <div
            className="absolute left-1 flex items-center transition-all duration-150 ease-out z-20"
            style={{
              left: `calc(10px + ${lane2Progress * 0.78}%)`,
            }}
          >
            {/* Turbo Exhaust Flame when racing fast */}
            {lane2Wpm > 40 && isRacing && (
              <div className="flex items-center -mr-1 animate-pulse">
                <span className="text-xs -scale-x-100">🔥</span>
              </div>
            )}

            {/* Pink Pixel Racer Car SVG */}
            <div className="relative group">
              <svg width="42" height="24" viewBox="0 0 42 24" className="drop-shadow-[0_2px_4px_rgba(244,63,94,0.6)]">
                {/* Rear Wing */}
                <rect x="2" y="3" width="3" height="18" fill="#f43f5e" />
                <rect x="5" y="8" width="4" height="8" fill="#be123c" />
                {/* Wheels */}
                <rect x="8" y="1" width="7" height="4" fill="#0f172a" stroke="#f43f5e" strokeWidth="0.5" />
                <rect x="8" y="19" width="7" height="4" fill="#0f172a" stroke="#f43f5e" strokeWidth="0.5" />
                <rect x="27" y="1" width="7" height="4" fill="#0f172a" stroke="#f43f5e" strokeWidth="0.5" />
                <rect x="27" y="19" width="7" height="4" fill="#0f172a" stroke="#f43f5e" strokeWidth="0.5" />
                {/* Body Chassis */}
                <rect x="8" y="6" width="22" height="12" fill="#e11d48" />
                <rect x="14" y="5" width="14" height="14" fill="#fb7185" />
                {/* Cockpit / Helmet */}
                <rect x="18" y="9" width="6" height="6" fill="#facc15" />
                <rect x="20" y="10" width="3" height="3" fill="#ffffff" />
                {/* Nose Cone */}
                <polygon points="30,6 39,12 30,18" fill="#f43f5e" />
              </svg>

              {/* Progress Pin floating over car */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-pink-300 bg-slate-900/90 px-1 rounded border border-pink-500/50 whitespace-nowrap">
                {lane2Progress}%
              </div>
            </div>

            {lane2Completed && (
              <span className="ml-1 text-sm animate-bounce">🏁</span>
            )}
          </div>
        </div>
      </div>

      {/* ================= TELEMETRY DASHBOARD ================= */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 font-mono">
        {/* Speedometer WPM */}
        <div
          className={`p-2 border-2 border-ink shadow-pixel rounded flex items-center justify-between ${
            isNight ? 'bg-slate-900/80 text-white' : 'bg-surface text-ink'
          }`}
        >
          <div>
            <div className="text-[10px] text-slate-400 font-pixel">SPEED</div>
            <div className="text-xl sm:text-2xl font-bold text-cyan-400 flex items-baseline gap-1">
              <span>{localWpm || myState.wpm}</span>
              <span className="text-[10px] font-normal text-slate-400">WPM</span>
            </div>
          </div>
          <div className="text-2xl opacity-80">⚡</div>
        </div>

        {/* Accuracy Gauge */}
        <div
          className={`p-2 border-2 border-ink shadow-pixel rounded flex items-center justify-between ${
            isNight ? 'bg-slate-900/80 text-white' : 'bg-surface text-ink'
          }`}
        >
          <div>
            <div className="text-[10px] text-slate-400 font-pixel">ACCURACY</div>
            <div className="text-xl sm:text-2xl font-bold text-gameBoyGreen flex items-baseline gap-1">
              <span>{myState.accuracy}</span>
              <span className="text-[10px] font-normal text-slate-400">%</span>
            </div>
          </div>
          <div className="text-2xl opacity-80">🎯</div>
        </div>

        {/* Mistakes Counter */}
        <div
          className={`p-2 border-2 border-ink shadow-pixel rounded flex items-center justify-between ${
            isNight ? 'bg-slate-900/80 text-white' : 'bg-surface text-ink'
          }`}
        >
          <div>
            <div className="text-[10px] text-slate-400 font-pixel">MISTAKES</div>
            <div
              className={`text-xl sm:text-2xl font-bold flex items-baseline gap-1 ${
                mistakesCount > 0 ? 'text-arcadeRed' : 'text-slate-300'
              }`}
            >
              <span>{mistakesCount}</span>
              <span className="text-[10px] font-normal text-slate-400">TYPOS</span>
            </div>
          </div>
          <div className="text-2xl opacity-80">⚠️</div>
        </div>

        {/* Opponent Tracker */}
        <div
          className={`p-2 border-2 border-ink shadow-pixel rounded flex items-center justify-between ${
            isNight ? 'bg-slate-900/80 text-white' : 'bg-surface text-ink'
          }`}
        >
          <div>
            <div className="text-[10px] text-slate-400 font-pixel">OPPONENT</div>
            <div className="text-xl sm:text-2xl font-bold text-pink-400 flex items-baseline gap-1">
              <span>{opponentState.wpm}</span>
              <span className="text-[10px] font-normal text-slate-400">WPM</span>
            </div>
          </div>
          <div className="text-2xl opacity-80">🏎️</div>
        </div>
      </div>

      {/* ================= INTERACTIVE PASSAGE DISPLAY ================= */}
      <div
        ref={passageContainerRef}
        className={`w-full flex-1 min-h-[170px] sm:min-h-[200px] p-4 sm:p-6 border-2 sm:border-4 border-ink shadow-pixel rounded-lg relative cursor-text transition-colors flex flex-col justify-center ${
          isNight ? 'bg-slate-950 text-slate-200' : 'bg-slate-900 text-slate-100'
        }`}
      >
        {/* Synchronized Countdown Overlay */}
        {countdownNum !== null && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center pointer-events-none animate-fadeIn">
            {/* Traffic Light Signal */}
            <div className="flex items-center gap-3 p-3 bg-black/70 border-2 border-slate-700 rounded-full mb-3 shadow-pixel">
              <div
                className={`w-4 h-4 rounded-full transition-all ${
                  countdownNum === 3 ? 'bg-red-500 shadow-[0_0_12px_#ef4444]' : 'bg-red-950'
                }`}
              />
              <div
                className={`w-4 h-4 rounded-full transition-all ${
                  countdownNum === 2 ? 'bg-yellow-500 shadow-[0_0_12px_#eab308]' : 'bg-yellow-950'
                }`}
              />
              <div
                className={`w-4 h-4 rounded-full transition-all ${
                  countdownNum === 1 || countdownNum === 'GO'
                    ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]'
                    : 'bg-emerald-950'
                }`}
              />
            </div>

            <div className="font-pixel text-4xl sm:text-6xl text-cyan-400 tracking-widest drop-shadow-[0_4px_8px_rgba(6,182,212,0.8)] animate-pulse">
              {countdownNum === 'GO' ? 'RACE!' : countdownNum}
            </div>
            <div className="text-xs font-mono text-slate-400 mt-2">
              Ready fingers on keyboard!
            </div>
          </div>
        )}

        {/* Finished / Victory Banner */}
        {gameState.status === 'FINISHED' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4 text-center animate-fadeIn">
            <div className="font-pixel text-2xl sm:text-4xl text-yellow-400 mb-2 drop-shadow-md">
              {isWinner ? '🏆 CHECKERED FLAG VICTORY!' : '🏁 RACE COMPLETE!'}
            </div>
            <div className="text-sm sm:text-base font-mono text-cyan-300 max-w-md">
              {gameState.summary || 'Spectacular battle on the track!'}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs font-mono text-slate-300 bg-slate-900/90 px-4 py-2 border border-slate-700 rounded shadow-pixel">
              <div>Your Speed: <strong className="text-cyan-400">{localWpm || myState.wpm} WPM</strong></div>
              <div>•</div>
              <div>Accuracy: <strong className="text-gameBoyGreen">{myState.accuracy}%</strong></div>
            </div>
          </div>
        )}

        {/* Passage Text Rendering */}
        <div className="font-mono text-base sm:text-xl lg:text-2xl leading-relaxed tracking-wide select-none">
          {gameState.text.split('').map((char, index) => {
            const isTyped = index < localCharIndex;
            const isCurrent = index === localCharIndex;
            const hasError = isCurrent && currentErrorChar !== null;

            if (isTyped) {
              return (
                <span key={index} className="text-emerald-400 font-semibold">
                  {char}
                </span>
              );
            }

            if (isCurrent) {
              if (hasError) {
                return (
                  <span
                    key={index}
                    className="relative bg-arcadeRed/40 text-arcadeRed font-bold underline decoration-wavy decoration-arcadeRed px-0.5 rounded animate-bounce"
                  >
                    {char === ' ' ? '␣' : char}
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-pixel text-arcadeRed bg-black/90 px-1 border border-arcadeRed rounded whitespace-nowrap">
                      BACKSPACE!
                    </span>
                  </span>
                );
              }

              return (
                <span
                  key={index}
                  className="bg-cyan-400 text-black font-bold px-0.5 rounded shadow-[0_0_8px_#22d3ee] animate-pulse"
                >
                  {char}
                </span>
              );
            }

            return (
              <span key={index} className="text-slate-500 opacity-60">
                {char}
              </span>
            );
          })}
        </div>

        {/* Bottom Helper Hint */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
            <span>Click anywhere to refocus keyboard</span>
          </div>
          <div>
            <span>{localCharIndex} / {textLength} chars</span>
          </div>
        </div>
      </div>
    </div>
  );
};
