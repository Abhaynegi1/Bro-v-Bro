import React from 'react';
import { PixelButton } from './pixel/PixelButton';

interface HowToPlayViewProps {
  onBack: () => void;
  onOpenCreate: () => void;
  onOpenJoin: () => void;
}

export const HowToPlayView: React.FC<HowToPlayViewProps> = ({
  onBack,
  onOpenCreate,
  onOpenJoin,
}) => {
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 select-none">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b-2 border-ink/20">
        <button
          onClick={onBack}
          className="btn-retro bg-white text-ink hover:bg-cream text-xs px-3.5 py-2 flex items-center gap-2"
        >
          <span>◄</span>
          <span>BACK TO ARENA</span>
        </button>

        <div className="flex items-center gap-3">
          <PixelButton variant="cream" size="sm" onClick={onOpenJoin}>
            JOIN ROOM
          </PixelButton>
          <PixelButton variant="navy" size="sm" onClick={onOpenCreate}>
            CREATE ROOM
          </PixelButton>
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-ink text-cartridgeYellow text-[10px] font-arcade tracking-widest uppercase mb-3 shadow-pixel-sm">
          <span>●</span>
          <span>OFFICIAL RULEBOOK & GAUNTLET GUIDE</span>
          <span>●</span>
        </div>

        <h1 className="font-pixel text-xl sm:text-3xl text-darkNavy tracking-wide mb-4">
          HOW TO PLAY <span className="text-arcadeRed">BRO v BRO</span>
        </h1>

        {/* The core motto moved from bottom into primary highlight */}
        <div className="max-w-xl mx-auto bg-darkNavy text-paper border-3 border-ink p-4 sm:p-5 shadow-pixel-lg">
          <div className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase space-y-1">
            <p className="text-paper/90">MAKE A ROOM. CALL YOUR BRO.</p>
            <p className="text-paper/90">PLAY SOME GAMES. KEEP SCORE.</p>
            <p className="text-arcadeRed font-pixel text-xs sm:text-sm pt-2 tracking-widest animate-pulse">
              FIND OUT WHO'S BETTER.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Golden Steps */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-ink">
          <h2 className="font-pixel text-sm sm:text-base text-ink flex items-center gap-2">
            <span className="text-arcadeRed">►</span> THE 4-STEP BATTLE PROTOCOL
          </h2>
          <span className="text-[10px] font-arcade text-ink/60 uppercase">ZERO INSTALL • INSTANT WEBSOCKET</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Step 1 */}
          <div className="bg-white border-2 border-ink p-5 shadow-pixel hover:-translate-y-1 transition-transform relative">
            <div className="flex items-start justify-between mb-3">
              <span className="px-2 py-0.5 bg-darkNavy text-paper font-pixel text-[10px] tracking-wider">
                STEP 01
              </span>
              <span className="font-pixel text-lg text-cartridgeYellow bg-ink px-2 py-0.5 border border-ink">
                🕹️
              </span>
            </div>
            <h3 className="font-arcade text-sm sm:text-base font-bold text-ink uppercase mb-2">
              CREATE YOUR ROOM
            </h3>
            <p className="font-mono text-xs text-ink/80 leading-relaxed">
              Pick your Bro handle and match target (Best of 1, 3, or 5 rounds). The server generates an exclusive 5-character Bro Code and an instant 1-click invite link.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white border-2 border-ink p-5 shadow-pixel hover:-translate-y-1 transition-transform relative">
            <div className="flex items-start justify-between mb-3">
              <span className="px-2 py-0.5 bg-arcadeRed text-paper font-pixel text-[10px] tracking-wider">
                STEP 02
              </span>
              <span className="font-pixel text-lg text-crtCyan bg-ink px-2 py-0.5 border border-ink">
                📲
              </span>
            </div>
            <h3 className="font-arcade text-sm sm:text-base font-bold text-ink uppercase mb-2">
              CALL YOUR BRO
            </h3>
            <p className="font-mono text-xs text-ink/80 leading-relaxed">
              Send the code or link over Discord, WhatsApp, or shout it across the room. No registration, no app store download, and no password required. One click connects you.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white border-2 border-ink p-5 shadow-pixel hover:-translate-y-1 transition-transform relative">
            <div className="flex items-start justify-between mb-3">
              <span className="px-2 py-0.5 bg-mutedNavy text-paper font-pixel text-[10px] tracking-wider">
                STEP 03
              </span>
              <span className="font-pixel text-lg text-gameboyGreen bg-ink px-2 py-0.5 border border-ink">
                ⚔️
              </span>
            </div>
            <h3 className="font-arcade text-sm sm:text-base font-bold text-ink uppercase mb-2">
              RUN THE GAUNTLET
            </h3>
            <p className="font-mono text-xs text-ink/80 leading-relaxed">
              Once both Bros lock in "READY", the gauntlet initiates. Quick-fire retro mini-games test your tactical thinking, reflex speed, memory, and nerve.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white border-2 border-ink p-5 shadow-pixel hover:-translate-y-1 transition-transform relative">
            <div className="flex items-start justify-between mb-3">
              <span className="px-2 py-0.5 bg-gameboyGreen text-darkNavy font-pixel text-[10px] tracking-wider">
                STEP 04
              </span>
              <span className="font-pixel text-lg text-cartridgeYellow bg-ink px-2 py-0.5 border border-ink">
                👑
              </span>
            </div>
            <h3 className="font-arcade text-sm sm:text-base font-bold text-ink uppercase mb-2">
              CLAIM BRAGGING RIGHTS
            </h3>
            <p className="font-mono text-xs text-ink/80 leading-relaxed">
              Real-time synchronized scoreboard tracks each victory. The first Bro to reach the target win count is crowned Champion with 100% indisputable victory proof.
            </p>
          </div>
        </div>
      </section>

      {/* Mini-Games Gauntlet Roster */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-ink">
          <h2 className="font-pixel text-sm sm:text-base text-ink flex items-center gap-2">
            <span className="text-arcadeRed">►</span> MINI-GAMES GAUNTLET ROSTER
          </h2>
          <span className="text-[10px] font-arcade text-arcadeRed uppercase tracking-wider">PHASED EXPANSION</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Game 1 */}
          <div className="bg-[#FFFDF5] border-2 border-ink p-4 shadow-pixel flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">❌⭕</span>
                <span className="text-[9px] font-arcade bg-gameboyGreen text-darkNavy px-2 py-0.5 font-bold">
                  ACTIVE
                </span>
              </div>
              <h4 className="font-pixel text-xs text-darkNavy uppercase mb-1.5">
                TIC-TAC-TOE
              </h4>
              <p className="font-mono text-xs text-ink/80 leading-relaxed">
                Classic 3x3 grid showdown with instantaneous move syncing. Trap your bro, block corners, and secure 3 in a line.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-ink/10 text-[10px] font-mono text-ink/60">
              Discipline: Pure Strategy
            </div>
          </div>

          {/* Game 2 */}
          <div className="bg-[#FFFDF5] border-2 border-ink p-4 shadow-pixel flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">⚡⏱️</span>
                <span className="text-[9px] font-arcade bg-crtCyan text-darkNavy px-2 py-0.5 font-bold">
                  NEXT UP
                </span>
              </div>
              <h4 className="font-pixel text-xs text-darkNavy uppercase mb-1.5">
                REACTION DUEL
              </h4>
              <p className="font-mono text-xs text-ink/80 leading-relaxed">
                Both players stare down a blank CRT monitor. The millisecond it turns GREEN, click! Earliest click wins; jumping the gun is instant forfeit.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-ink/10 text-[10px] font-mono text-ink/60">
              Discipline: Pure Reflex
            </div>
          </div>

          {/* Game 3 */}
          <div className="bg-[#FFFDF5] border-2 border-ink p-4 shadow-pixel flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">🔴🟡</span>
                <span className="text-[9px] font-arcade bg-cartridgeYellow text-darkNavy px-2 py-0.5 font-bold">
                  IN QUEUE
                </span>
              </div>
              <h4 className="font-pixel text-xs text-darkNavy uppercase mb-1.5">
                CONNECT FOUR
              </h4>
              <p className="font-mono text-xs text-ink/80 leading-relaxed">
                Vertical dropping disc warfare. Anticipate diagonal attacks, build offensive traps, and connect 4 discs in any direction.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-ink/10 text-[10px] font-mono text-ink/60">
              Discipline: Spatial Tactics
            </div>
          </div>

          {/* Game 4 */}
          <div className="bg-[#FFFDF5] border-2 border-ink p-4 shadow-pixel flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">🔠🟩</span>
                <span className="text-[9px] font-arcade bg-paper border border-ink text-ink px-2 py-0.5 font-bold">
                  EXPANSION
                </span>
              </div>
              <h4 className="font-pixel text-xs text-darkNavy uppercase mb-1.5">
                WORDLE BRO
              </h4>
              <p className="font-mono text-xs text-ink/80 leading-relaxed">
                Simultaneous 5-letter word puzzle duel with private hidden states. First bro to deduce the secret word scores the point.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-ink/10 text-[10px] font-mono text-ink/60">
              Discipline: Deduction
            </div>
          </div>

          {/* Game 5 */}
          <div className="bg-[#FFFDF5] border-2 border-ink p-4 shadow-pixel flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">💣🚩</span>
                <span className="text-[9px] font-arcade bg-paper border border-ink text-ink px-2 py-0.5 font-bold">
                  EXPANSION
                </span>
              </div>
              <h4 className="font-pixel text-xs text-darkNavy uppercase mb-1.5">
                MINE RACER
              </h4>
              <p className="font-mono text-xs text-ink/80 leading-relaxed">
                Head-to-head identical minefield sweep. High speed flag placement and cell clearing without blowing yourself up.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-ink/10 text-[10px] font-mono text-ink/60">
              Discipline: Speed & Focus
            </div>
          </div>

          {/* Game 6 */}
          <div className="bg-[#FFFDF5] border-2 border-ink p-4 shadow-pixel flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">🎲❓</span>
                <span className="text-[9px] font-arcade bg-arcadeRed text-paper px-2 py-0.5 font-bold">
                  MYSTERY
                </span>
              </div>
              <h4 className="font-pixel text-xs text-darkNavy uppercase mb-1.5">
                SURPRISE MINI-GAMES
              </h4>
              <p className="font-mono text-xs text-ink/80 leading-relaxed">
                Micro-games, button-mashing sprints, memory tests, and trivia rounds rotated in randomly to keep both players on edge.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-ink/10 text-[10px] font-mono text-ink/60">
              Discipline: Adaptability
            </div>
          </div>
        </div>
      </section>

      {/* The Unwritten Bro Code (Humorous & Competitive) */}
      <section className="mb-14 bg-darkNavy text-paper border-3 border-ink p-6 sm:p-8 shadow-pixel-lg">
        <div className="flex items-center gap-2 mb-4 border-b border-paper/20 pb-3">
          <span className="text-arcadeRed font-pixel text-sm">📜</span>
          <h2 className="font-pixel text-xs sm:text-sm text-cartridgeYellow uppercase tracking-wider">
            THE UNWRITTEN BRO CODE (HOUSE RULES)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#11182A] border border-paper/20">
            <p className="text-arcadeRed font-bold mb-1 font-arcade uppercase text-[11px]">RULE #1: NO "JOHNS"</p>
            <p className="text-paper/80 leading-relaxed">
              No blaming your mouse, your Wi-Fi, or your keyboard. We use ultra-light WebSockets. You simply got outplayed.
            </p>
          </div>

          <div className="p-3 bg-[#11182A] border border-paper/20">
            <p className="text-crtCyan font-bold mb-1 font-arcade uppercase text-[11px]">RULE #2: REMATCH PRIVILEGE</p>
            <p className="text-paper/80 leading-relaxed">
              The loser has the sacred right to demand a rematch. The winner gets to talk trash until the next room opens.
            </p>
          </div>

          <div className="p-3 bg-[#11182A] border border-paper/20">
            <p className="text-cartridgeYellow font-bold mb-1 font-arcade uppercase text-[11px]">RULE #3: FORFEIT PENALTY</p>
            <p className="text-paper/80 leading-relaxed">
              Closing your browser tab or rage-quitting counts as an instant, permanent forfeit. Accept defeat with dignity.
            </p>
          </div>

          <div className="p-3 bg-[#11182A] border border-paper/20">
            <p className="text-gameboyGreen font-bold mb-1 font-arcade uppercase text-[11px]">RULE #4: REAL-LIFE STAKES</p>
            <p className="text-paper/80 leading-relaxed">
              Bro v Bro is officially intended to settle who takes out the trash, buys dinner, picks the movie, or gets the aux cord.
            </p>
          </div>
        </div>
      </section>

      {/* Ready to Battle CTA */}
      <div className="text-center bg-white border-3 border-ink p-8 shadow-pixel-lg">
        <p className="font-arcade text-xs text-arcadeRed font-bold tracking-widest uppercase mb-2">
          ENOUGH TALK. TIME TO BATTLE.
        </p>
        <h3 className="font-pixel text-base sm:text-xl text-ink uppercase mb-6">
          PROVE YOU'RE THE BETTER BRO
        </h3>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <PixelButton variant="navy" size="lg" onClick={onOpenCreate} className="min-w-[190px]">
            CREATE ROOM
          </PixelButton>
          <PixelButton variant="cream" size="lg" onClick={onOpenJoin} className="min-w-[190px]">
            JOIN ROOM
          </PixelButton>
        </div>
      </div>
    </div>
  );
};
